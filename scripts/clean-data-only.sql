-- =====================================================
-- SCRIPT PARA LIMPIAR SOLO LOS DATOS (NO LAS TABLAS)
-- =====================================================

-- Limpiar datos existentes en orden correcto
DELETE FROM sale_items;
DELETE FROM sales;
DELETE FROM expenses;
DELETE FROM truck_arrivals;
DELETE FROM daily_assignments;
DELETE FROM vendor_goals;
DELETE FROM business_goals;
DELETE FROM customers;
DELETE FROM inventory_empty;
DELETE FROM inventory_full;
DELETE FROM users;

-- Verificar que se limpiaron los datos
SELECT 'Datos limpiados exitosamente' as status;
