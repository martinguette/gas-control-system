-- =====================================================
-- MIGRACIÓN: Actualizar tabla de ventas
-- =====================================================
-- Fecha: 2024-12-12
-- Descripción: Agregar campos quantity y unit_cost a la tabla sales
-- =====================================================

-- Agregar nuevas columnas a la tabla sales
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Actualizar registros existentes con valores por defecto
UPDATE sales 
SET quantity = 1, unit_cost = amount_charged 
WHERE quantity IS NULL OR unit_cost IS NULL;

-- Agregar restricciones
ALTER TABLE sales 
ADD CONSTRAINT sales_quantity_positive CHECK (quantity > 0),
ADD CONSTRAINT sales_unit_cost_positive CHECK (unit_cost >= 0);

-- Agregar comentarios
COMMENT ON COLUMN sales.quantity IS 'Cantidad de cilindros en la transacción';
COMMENT ON COLUMN sales.unit_cost IS 'Costo unitario por cilindro';

-- Actualizar la función de actualización de inventario para manejar cantidad
CREATE OR REPLACE FUNCTION update_inventory_after_sale()
RETURNS TRIGGER AS $$
DECLARE
    quantity_change INTEGER;
BEGIN
    -- Determinar el cambio de cantidad basado en el tipo de venta
    quantity_change := NEW.quantity;
    
    -- Actualizar inventario según el tipo de transacción
    CASE NEW.sale_type
        WHEN 'intercambio' THEN
            -- Restar cilindros llenos
            UPDATE inventory_full 
            SET quantity = quantity - quantity_change,
                updated_at = NOW()
            WHERE type = NEW.product_type;
            
            -- Agregar cilindros vacíos (asumimos Roscogas)
            INSERT INTO inventory_empty (type, brand, color, quantity, created_at, updated_at)
            VALUES (NEW.product_type, 'Roscogas', 'Naranja', quantity_change, NOW(), NOW())
            ON CONFLICT (type, brand, color)
            DO UPDATE SET 
                quantity = inventory_empty.quantity + quantity_change,
                updated_at = NOW();
                
        WHEN 'completa' THEN
            -- Solo restar cilindros llenos
            UPDATE inventory_full 
            SET quantity = quantity - quantity_change,
                updated_at = NOW()
            WHERE type = NEW.product_type;
            
        WHEN 'venta_vacios' THEN
            -- Restar cilindros vacíos (asumimos Roscogas)
            UPDATE inventory_empty 
            SET quantity = quantity - quantity_change,
                updated_at = NOW()
            WHERE type = NEW.product_type 
            AND brand = 'Roscogas' 
            AND color = 'Naranja';
            
        WHEN 'compra_vacios' THEN
            -- Agregar cilindros vacíos (asumimos Roscogas)
            INSERT INTO inventory_empty (type, brand, color, quantity, created_at, updated_at)
            VALUES (NEW.product_type, 'Roscogas', 'Naranja', quantity_change, NOW(), NOW())
            ON CONFLICT (type, brand, color)
            DO UPDATE SET 
                quantity = inventory_empty.quantity + quantity_change,
                updated_at = NOW();
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar la función existente primero
DROP FUNCTION IF EXISTS get_vendor_sales(UUID, INTEGER, INTEGER);

-- Crear la función actualizada con los nuevos campos
CREATE OR REPLACE FUNCTION get_vendor_sales(
    p_vendor_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    customer_name TEXT,
    customer_phone TEXT,
    customer_location TEXT,
    product_type TEXT,
    quantity INTEGER,
    sale_type TEXT,
    amount_charged DECIMAL(10,2),
    unit_cost DECIMAL(10,2),
    payment_method TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.customer_name,
        s.customer_phone,
        s.customer_location,
        s.product_type,
        s.quantity,
        s.sale_type,
        s.amount_charged,
        s.unit_cost,
        s.payment_method,
        s.created_at
    FROM sales s
    WHERE s.vendor_id = p_vendor_id
    ORDER BY s.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Eliminar la función existente primero
DROP FUNCTION IF EXISTS get_vendor_daily_stats(UUID, DATE);

-- Crear la función actualizada de estadísticas diarias
CREATE OR REPLACE FUNCTION get_vendor_daily_stats(
    p_vendor_id UUID,
    p_date DATE
)
RETURNS TABLE (
    total_sales DECIMAL(10,2),
    total_expenses DECIMAL(10,2),
    daily_margin DECIMAL(10,2),
    cylinders_sold JSONB,
    sales_count INTEGER,
    expenses_count INTEGER
) AS $$
DECLARE
    sales_total DECIMAL(10,2) := 0;
    expenses_total DECIMAL(10,2) := 0;
    sales_cnt INTEGER := 0;
    expenses_cnt INTEGER := 0;
    cylinders_sold_json JSONB := '{}';
BEGIN
    -- Calcular total de ventas del día
    SELECT 
        COALESCE(SUM(amount_charged), 0),
        COUNT(*)
    INTO sales_total, sales_cnt
    FROM sales 
    WHERE vendor_id = p_vendor_id 
    AND DATE(created_at) = p_date;
    
    -- Calcular total de gastos del día
    SELECT 
        COALESCE(SUM(amount), 0),
        COUNT(*)
    INTO expenses_total, expenses_cnt
    FROM expenses 
    WHERE vendor_id = p_vendor_id 
    AND DATE(created_at) = p_date;
    
    -- Calcular cilindros vendidos por tipo
    SELECT jsonb_object_agg(
        product_type, 
        jsonb_build_object(
            'quantity', SUM(quantity),
            'total_amount', SUM(amount_charged)
        )
    )
    INTO cylinders_sold_json
    FROM sales 
    WHERE vendor_id = p_vendor_id 
    AND DATE(created_at) = p_date
    GROUP BY product_type;
    
    -- Retornar resultados
    RETURN QUERY SELECT 
        sales_total,
        expenses_total,
        sales_total - expenses_total,
        COALESCE(cylinders_sold_json, '{}'),
        sales_cnt,
        expenses_cnt;
END;
$$ LANGUAGE plpgsql;

-- Verificar que la migración se aplicó correctamente
DO $$
BEGIN
    -- Verificar que las columnas existen
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales' 
        AND column_name = 'quantity'
    ) THEN
        RAISE EXCEPTION 'La columna quantity no se creó correctamente';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales' 
        AND column_name = 'unit_cost'
    ) THEN
        RAISE EXCEPTION 'La columna unit_cost no se creó correctamente';
    END IF;
    
    RAISE NOTICE 'Migración completada exitosamente: Tabla sales actualizada con quantity y unit_cost';
END $$;
