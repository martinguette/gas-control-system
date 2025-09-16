-- =====================================================
-- SCRIPT PARA VERIFICAR QUÉ TABLAS EXISTEN
-- =====================================================

-- Verificar tablas existentes
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar si las tablas principales existen
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
        THEN '✅ Tabla users existe'
        ELSE '❌ Tabla users NO existe'
    END as users_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_full') 
        THEN '✅ Tabla inventory_full existe'
        ELSE '❌ Tabla inventory_full NO existe'
    END as inventory_full_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') 
        THEN '✅ Tabla customers existe'
        ELSE '❌ Tabla customers NO existe'
    END as customers_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sales') 
        THEN '✅ Tabla sales existe'
        ELSE '❌ Tabla sales NO existe'
    END as sales_status;
