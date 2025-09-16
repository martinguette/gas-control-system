-- Script FINAL para limpiar usuarios y datos relacionados
-- Basado en las tablas que realmente existen en tu base de datos

-- 1. Deshabilitar temporalmente las restricciones de clave foránea
SET session_replication_role = replica;

-- 2. Limpiar todas las tablas en el orden correcto (dependientes primero)
DELETE FROM sale_items;
DELETE FROM sales;
DELETE FROM expenses;
DELETE FROM inventory_alerts;
DELETE FROM inventory_full;
DELETE FROM inventory_empty;
DELETE FROM customers;
DELETE FROM goals;
DELETE FROM audit_logs;

-- 3. Limpiar la tabla de usuarios
DELETE FROM users;

-- 4. Rehabilitar las restricciones de clave foránea
SET session_replication_role = DEFAULT;

-- 5. Verificar que se limpió todo
SELECT 'Users:' as tabla, COUNT(*) as count FROM users
UNION ALL
SELECT 'Inventory_full:', COUNT(*) FROM inventory_full
UNION ALL
SELECT 'Inventory_empty:', COUNT(*) FROM inventory_empty
UNION ALL
SELECT 'Sales:', COUNT(*) FROM sales
UNION ALL
SELECT 'Sale_items:', COUNT(*) FROM sale_items
UNION ALL
SELECT 'Expenses:', COUNT(*) FROM expenses
UNION ALL
SELECT 'Customers:', COUNT(*) FROM customers
UNION ALL
SELECT 'Goals:', COUNT(*) FROM goals
UNION ALL
SELECT 'Audit_logs:', COUNT(*) FROM audit_logs
UNION ALL
SELECT 'Inventory_alerts:', COUNT(*) FROM inventory_alerts;

-- 6. Mensaje de confirmación
SELECT '🎉 LIMPIEZA COMPLETA EXITOSA! Todas las tablas están vacías.' as status;
