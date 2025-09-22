-- Verificar tipos de inventario existentes
SELECT type, quantity, unit_cost FROM inventory_full ORDER BY type;

-- Verificar si hay datos en inventory_full
SELECT COUNT(*) as total_records FROM inventory_full;
