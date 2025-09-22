-- =====================================================
-- INSERTAR DATOS DE INVENTARIO DE PRUEBA
-- =====================================================

-- Insertar inventario lleno (cilindros disponibles para venta)
INSERT INTO inventory_full (type, quantity, unit_cost) VALUES
('33lb', 50, 25.00),
('40lb', 30, 30.00),
('100lb', 20, 45.00)
ON CONFLICT (type) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  unit_cost = EXCLUDED.unit_cost,
  updated_at = NOW();

-- Insertar inventario vacío (cilindros devueltos)
INSERT INTO inventory_empty (type, brand, color, quantity) VALUES
('33lb', 'Roscogas', 'Naranja', 15),
('40lb', 'Roscogas', 'Naranja', 10),
('100lb', 'Roscogas', 'Naranja', 5),
('33lb', 'Gasan', 'Azul', 8),
('40lb', 'Gasan', 'Azul', 5),
('100lb', 'Gasan', 'Azul', 3)
ON CONFLICT (type, brand, color) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  updated_at = NOW();

-- Verificar que se insertaron correctamente
SELECT 'INVENTARIO LLENO:' as tipo, type, quantity, unit_cost FROM inventory_full ORDER BY type;
SELECT 'INVENTARIO VACÍO:' as tipo, type, brand, color, quantity FROM inventory_empty ORDER BY type, brand;
