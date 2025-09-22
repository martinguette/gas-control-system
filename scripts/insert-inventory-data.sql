-- =====================================================
-- INSERTAR DATOS DE INVENTARIO DE PRUEBA
-- =====================================================

-- Insertar inventario lleno (cilindros disponibles para venta)
-- Primero eliminar registros existentes para evitar duplicados
DELETE FROM inventory_full WHERE type IN ('33lb', '40lb', '100lb');

INSERT INTO inventory_full (type, quantity, unit_cost) VALUES
('33lb', 50, 25.00),
('40lb', 30, 30.00),
('100lb', 20, 45.00);

-- Insertar inventario vacío (cilindros devueltos)
-- Primero eliminar registros existentes para evitar duplicados
DELETE FROM inventory_empty WHERE type IN ('33lb', '40lb', '100lb');

INSERT INTO inventory_empty (type, brand, color, quantity) VALUES
('33lb', 'Roscogas', 'Naranja', 15),
('40lb', 'Roscogas', 'Naranja', 10),
('100lb', 'Roscogas', 'Naranja', 5),
('33lb', 'Gasan', 'Azul', 8),
('40lb', 'Gasan', 'Azul', 5),
('100lb', 'Gasan', 'Azul', 3);

-- Verificar que se insertaron correctamente
SELECT 'INVENTARIO LLENO:' as tipo, type, quantity, unit_cost FROM inventory_full ORDER BY type;
SELECT 'INVENTARIO VACÍO:' as tipo, type, brand, color, quantity FROM inventory_empty ORDER BY type, brand;
