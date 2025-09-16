-- =====================================================
-- CORRECCIÓN SIMPLE: Función create_sale_with_items
-- =====================================================
-- Fecha: 2024-12-12
-- Descripción: Corregir función para crear ventas sin crear tablas
-- =====================================================

-- Eliminar función existente si existe
DROP FUNCTION IF EXISTS create_sale_with_items(UUID, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT);

-- Función simple para crear venta con múltiples items
CREATE OR REPLACE FUNCTION create_sale_with_items(
    p_vendor_id UUID,
    p_customer_name TEXT,
    p_sale_type TEXT,
    p_payment_method TEXT,
    p_items JSONB,
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
    -- Buscar o crear cliente
    SELECT id INTO customer_id
    FROM customers 
    WHERE LOWER(name) = LOWER(p_customer_name);
    
    IF customer_id IS NULL THEN
        -- Crear nuevo cliente
        INSERT INTO customers (name, phone, location, custom_prices)
        VALUES (p_customer_name, p_customer_phone, p_customer_location, '{}')
        RETURNING id INTO customer_id;
    END IF;
    
    -- Calcular monto total
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        total_amount := total_amount + (
            (item->>'quantity')::INTEGER * (item->>'unit_cost')::DECIMAL(10,2)
        );
    END LOOP;
    
    -- Crear la venta principal
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
            (item->>'product_type')::TEXT,
            (item->>'quantity')::INTEGER,
            (item->>'unit_cost')::DECIMAL(10,2),
            (item->>'total_cost')::DECIMAL(10,2)
        );
    END LOOP;
    
    RETURN sale_id;
END;
$$ LANGUAGE plpgsql;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION create_sale_with_items(UUID, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_sale_with_items(UUID, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT) TO service_role;

-- Verificar que la función se creó correctamente
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'create_sale_with_items'
        AND routine_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'La función create_sale_with_items no se creó correctamente';
    END IF;
    
    RAISE NOTICE 'Función create_sale_with_items creada exitosamente';
END $$;
