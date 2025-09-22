-- =====================================================
-- VERIFICAR FUNCIÓN DE VENTAS
-- =====================================================

-- Verificar si existe la función create_sale_with_items
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'create_sale_with_items';

-- Verificar si existe la tabla sales
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'sales'
ORDER BY ordinal_position;

-- Verificar si existe la tabla sale_items
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'sale_items'
ORDER BY ordinal_position;
