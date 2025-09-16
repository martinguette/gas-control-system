-- Script COMPLETO para limpiar TODOS los usuarios y datos relacionados
-- ⚠️ CUIDADO: Esto elimina TODOS los datos. Solo usar para desarrollo.

-- 1. Deshabilitar temporalmente las restricciones de clave foránea
SET session_replication_role = replica;

-- 2. Limpiar todas las tablas que referencian usuarios
DELETE FROM inventory_full;
DELETE FROM inventory_empty;
DELETE FROM sales;
DELETE FROM expenses;
DELETE FROM truck_arrivals;
DELETE FROM daily_assignments;
DELETE FROM vendor_routes;
DELETE FROM price_overrides;
DELETE FROM inventory_alerts;
DELETE FROM customers;

-- 3. Limpiar la tabla de usuarios
DELETE FROM users;

-- 4. Rehabilitar las restricciones de clave foránea
SET session_replication_role = DEFAULT;

-- 5. Resetear secuencias si las hay
-- (No aplica para UUIDs, pero por si acaso)

-- 6. Verificar que se limpió todo
SELECT 'Users en tabla users:' as info, COUNT(*) as count FROM users;
SELECT 'Inventory full:' as info, COUNT(*) as count FROM inventory_full;
SELECT 'Inventory empty:' as info, COUNT(*) as count FROM inventory_empty;
SELECT 'Sales:' as info, COUNT(*) as count FROM sales;
SELECT 'Expenses:' as info, COUNT(*) as count FROM expenses;
SELECT 'Customers:' as info, COUNT(*) as count FROM customers;

-- 7. Mensaje de confirmación
SELECT 'Limpieza COMPLETA realizada. Todas las tablas están vacías.' as status;
