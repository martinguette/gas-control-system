-- =====================================================
-- SCRIPT PARA LIMPIAR LA BASE DE DATOS EXISTENTE
-- =====================================================

-- Deshabilitar triggers temporalmente
SET session_replication_role = replica;

-- Eliminar tablas en orden correcto (respetando foreign keys)
DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS truck_arrivals CASCADE;
DROP TABLE IF EXISTS daily_assignments CASCADE;
DROP TABLE IF EXISTS vendor_goals CASCADE;
DROP TABLE IF EXISTS business_goals CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS inventory_empty CASCADE;
DROP TABLE IF EXISTS inventory_full CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Eliminar funciones si existen
DROP FUNCTION IF EXISTS create_sale_with_items CASCADE;
DROP FUNCTION IF EXISTS get_vendor_sales_with_items CASCADE;
DROP FUNCTION IF EXISTS get_vendor_daily_stats CASCADE;
DROP FUNCTION IF EXISTS search_customer_by_name CASCADE;
DROP FUNCTION IF EXISTS update_inventory_full CASCADE;
DROP FUNCTION IF EXISTS update_inventory_empty CASCADE;

-- Eliminar tipos si existen
DROP TYPE IF EXISTS sale_type_enum CASCADE;
DROP TYPE IF EXISTS payment_method_enum CASCADE;
DROP TYPE IF EXISTS expense_type_enum CASCADE;
DROP TYPE IF EXISTS cylinder_type_enum CASCADE;
DROP TYPE IF EXISTS cylinder_brand_enum CASCADE;
DROP TYPE IF EXISTS cylinder_color_enum CASCADE;

-- Rehabilitar triggers
SET session_replication_role = DEFAULT;

-- Verificar que las tablas se eliminaron
SELECT 'Base de datos limpiada exitosamente' as status;
