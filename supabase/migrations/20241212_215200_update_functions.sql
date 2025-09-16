-- =====================================================
-- MIGRACIÓN: Actualizar funciones RPC
-- =====================================================
-- Fecha: 2024-12-12
-- Descripción: Actualizar funciones RPC para incluir nuevos campos
-- =====================================================

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS get_vendor_sales(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_vendor_daily_stats(UUID, DATE);

-- Crear función actualizada para obtener ventas del vendedor
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

-- Crear función actualizada para estadísticas diarias
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

-- Verificar que las funciones se crearon correctamente
DO $$
BEGIN
    -- Verificar que las funciones existen
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'get_vendor_sales'
        AND routine_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'La función get_vendor_sales no se creó correctamente';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'get_vendor_daily_stats'
        AND routine_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'La función get_vendor_daily_stats no se creó correctamente';
    END IF;
    
    RAISE NOTICE 'Migración completada exitosamente: Funciones RPC actualizadas';
END $$;
