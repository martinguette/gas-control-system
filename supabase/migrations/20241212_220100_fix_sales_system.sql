-- =====================================================
-- MIGRACIÓN: Corregir sistema de ventas
-- =====================================================
-- Fecha: 2024-12-12
-- Descripción: Corregir errores de parámetros con valores por defecto
-- =====================================================

-- Crear tabla para detalles de venta (múltiples cilindros por transacción)
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_type TEXT NOT NULL CHECK (product_type IN ('33lb', '40lb', '100lb')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_cost DECIMAL(10,2) NOT NULL CHECK (unit_cost >= 0),
    total_cost DECIMAL(10,2) NOT NULL CHECK (total_cost >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en sale_items
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para sale_items
CREATE POLICY "Vendedores pueden ver sus propios sale_items" ON sale_items
    FOR SELECT USING (
        sale_id IN (
            SELECT id FROM sales WHERE vendor_id = auth.uid()
        )
    );

CREATE POLICY "Vendedores pueden insertar sale_items" ON sale_items
    FOR INSERT WITH CHECK (
        sale_id IN (
            SELECT id FROM sales WHERE vendor_id = auth.uid()
        )
    );

CREATE POLICY "Jefes pueden ver todos los sale_items" ON sale_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'jefe'
        )
    );

-- Habilitar Realtime para sale_items
ALTER PUBLICATION supabase_realtime ADD TABLE sale_items;

-- Crear función para actualizar updated_at en sale_items
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para updated_at en sale_items
CREATE TRIGGER update_sale_items_updated_at
    BEFORE UPDATE ON sale_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Actualizar tabla customers para incluir precios personalizados por tipo
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS custom_prices JSONB DEFAULT '{}';

-- Función para obtener precios personalizados del cliente
CREATE OR REPLACE FUNCTION get_customer_prices(p_customer_id UUID)
RETURNS JSONB AS $$
DECLARE
    prices JSONB;
BEGIN
    SELECT custom_prices INTO prices
    FROM customers 
    WHERE id = p_customer_id;
    
    RETURN COALESCE(prices, '{}');
END;
$$ LANGUAGE plpgsql;

-- Función para buscar cliente por nombre
CREATE OR REPLACE FUNCTION search_customer_by_name(p_name TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    phone TEXT,
    location TEXT,
    custom_prices JSONB,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.phone,
        c.location,
        c.custom_prices,
        c.created_at
    FROM customers c
    WHERE LOWER(c.name) LIKE LOWER('%' || p_name || '%')
    ORDER BY c.name
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Función para crear o actualizar cliente
CREATE OR REPLACE FUNCTION upsert_customer(
    p_name TEXT,
    p_phone TEXT DEFAULT NULL,
    p_location TEXT DEFAULT NULL,
    p_custom_prices JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    customer_id UUID;
BEGIN
    -- Buscar cliente existente
    SELECT id INTO customer_id
    FROM customers 
    WHERE LOWER(name) = LOWER(p_name);
    
    IF customer_id IS NOT NULL THEN
        -- Actualizar cliente existente
        UPDATE customers 
        SET 
            phone = COALESCE(p_phone, phone),
            location = COALESCE(p_location, location),
            custom_prices = COALESCE(p_custom_prices, custom_prices),
            updated_at = NOW()
        WHERE id = customer_id;
    ELSE
        -- Crear nuevo cliente
        INSERT INTO customers (name, phone, location, custom_prices)
        VALUES (p_name, p_phone, p_location, p_custom_prices)
        RETURNING id INTO customer_id;
    END IF;
    
    RETURN customer_id;
END;
$$ LANGUAGE plpgsql;

-- Función para crear venta con múltiples items (CORREGIDA)
CREATE OR REPLACE FUNCTION create_sale_with_items(
    p_vendor_id UUID,
    p_customer_name TEXT,
    p_sale_type TEXT,
    p_payment_method TEXT,
    p_items JSONB, -- Array de items: [{"product_type": "33lb", "quantity": 2, "unit_cost": 25.00}, ...]
    p_customer_phone TEXT DEFAULT NULL,
    p_customer_location TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    sale_id UUID;
    customer_id UUID;
    item JSONB;
    total_amount DECIMAL(10,2) := 0;
BEGIN
    -- Crear o actualizar cliente
    customer_id := upsert_customer(p_customer_name, p_customer_phone, p_customer_location);
    
    -- Calcular monto total
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        total_amount := total_amount + (
            (item->>'quantity')::INTEGER * (item->>'unit_cost')::DECIMAL(10,2)
        );
    END LOOP;
    
    -- Crear la venta
    INSERT INTO sales (
        vendor_id, 
        customer_id,
        customer_name, 
        customer_phone, 
        customer_location, 
        sale_type, 
        amount_charged, 
        payment_method
    )
    VALUES (
        p_vendor_id,
        customer_id,
        p_customer_name, 
        p_customer_phone, 
        p_customer_location, 
        p_sale_type, 
        total_amount, 
        p_payment_method
    )
    RETURNING id INTO sale_id;
    
    -- Crear los items de la venta
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO sale_items (
            sale_id,
            product_type,
            quantity,
            unit_cost,
            total_cost
        )
        VALUES (
            sale_id,
            item->>'product_type',
            (item->>'quantity')::INTEGER,
            (item->>'unit_cost')::DECIMAL(10,2),
            (item->>'quantity')::INTEGER * (item->>'unit_cost')::DECIMAL(10,2)
        );
    END LOOP;
    
    RETURN sale_id;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener ventas con items
CREATE OR REPLACE FUNCTION get_vendor_sales_with_items(
    p_vendor_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    sale_id UUID,
    customer_name TEXT,
    customer_phone TEXT,
    customer_location TEXT,
    sale_type TEXT,
    amount_charged DECIMAL(10,2),
    payment_method TEXT,
    created_at TIMESTAMPTZ,
    items JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.customer_name,
        s.customer_phone,
        s.customer_location,
        s.sale_type,
        s.amount_charged,
        s.payment_method,
        s.created_at,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'product_type', si.product_type,
                    'quantity', si.quantity,
                    'unit_cost', si.unit_cost,
                    'total_cost', si.total_cost
                )
            ) FILTER (WHERE si.id IS NOT NULL),
            '[]'::jsonb
        ) as items
    FROM sales s
    LEFT JOIN sale_items si ON s.id = si.sale_id
    WHERE s.vendor_id = p_vendor_id
    GROUP BY s.id, s.customer_name, s.customer_phone, s.customer_location, 
             s.sale_type, s.amount_charged, s.payment_method, s.created_at
    ORDER BY s.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Verificar que la migración se aplicó correctamente
DO $$
BEGIN
    -- Verificar que la tabla sale_items existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'sale_items'
    ) THEN
        RAISE EXCEPTION 'La tabla sale_items no se creó correctamente';
    END IF;
    
    -- Verificar que las funciones existen
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'search_customer_by_name'
        AND routine_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'La función search_customer_by_name no se creó correctamente';
    END IF;
    
    RAISE NOTICE 'Migración completada exitosamente: Sistema de ventas corregido';
END $$;
