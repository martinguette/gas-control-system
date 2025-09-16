-- =====================================================
-- DATOS DE PRUEBA CON UUIDs REALES DE TUS USUARIOS
-- =====================================================

-- PASO 1: Corregir tabla users para Supabase Auth
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- PASO 2: Insertar usuarios usando los UUIDs reales de la imagen
-- (Basado en los usuarios que veo en tu Supabase Auth)

INSERT INTO users (id, email, role, name, phone, is_active) VALUES
-- Usuario jefe (reemplaza con el UUID real del jefe de tu lista)
('UUID_DEL_JEFE_REAL', 'email_del_jefe@empresa.com', 'jefe', 'Nombre del Jefe', '+57 300 123 4567', true),

-- Usuarios vendedores (reemplaza con los UUIDs reales de vendedores)
('UUID_VENDEDOR_1_REAL', 'email_vendedor1@empresa.com', 'vendedor', 'Nombre Vendedor 1', '+57 300 234 5678', true),
('UUID_VENDEDOR_2_REAL', 'email_vendedor2@empresa.com', 'vendedor', 'Nombre Vendedor 2', '+57 300 345 6789', true),
('UUID_VENDEDOR_3_REAL', 'email_vendedor3@empresa.com', 'vendedor', 'Nombre Vendedor 3', '+57 300 456 7890', true);

-- PASO 3: Insertar inventario lleno
INSERT INTO inventory_full (type, quantity, unit_cost, last_updated_by) VALUES
('33lb', 50, 25000.00, 'UUID_DEL_JEFE_REAL'),
('40lb', 30, 30000.00, 'UUID_DEL_JEFE_REAL'),
('100lb', 20, 70000.00, 'UUID_DEL_JEFE_REAL');

-- PASO 4: Insertar inventario vacío
INSERT INTO inventory_empty (type, brand, color, quantity) VALUES
-- Cilindros Roscogas (Naranja)
('33lb', 'Roscogas', 'Naranja', 25),
('40lb', 'Roscogas', 'Naranja', 15),
('100lb', 'Roscogas', 'Naranja', 10),

-- Cilindros Gasan (Azul)
('33lb', 'Gasan', 'Azul', 20),
('40lb', 'Gasan', 'Azul', 12),
('100lb', 'Gasan', 'Azul', 8),

-- Cilindros Gaspais (Verde Oscuro)
('33lb', 'Gaspais', 'Verde Oscuro', 18),
('40lb', 'Gaspais', 'Verde Oscuro', 10),
('100lb', 'Gaspais', 'Verde Oscuro', 6),

-- Cilindros Vidagas (Verde Claro)
('33lb', 'Vidagas', 'Verde Claro', 15),
('40lb', 'Vidagas', 'Verde Claro', 8),
('100lb', 'Vidagas', 'Verde Claro', 5);

-- PASO 5: Insertar clientes con precios personalizados
INSERT INTO customers (name, phone, location, custom_prices) VALUES
('Restaurante El Buen Sabor', '+57 300 111 1111', 'Carrera 15 #85-20, Bogotá', 
 '{"33lb": 28000, "40lb": 33000, "100lb": 75000}'),

('Hogar Familiar García', '+57 300 222 2222', 'Calle 80 #12-45, Bogotá', 
 '{"33lb": 25000, "40lb": 30000, "100lb": 70000}'),

('Taller Mecánico El Motor', '+57 300 333 3333', 'Carrera 50 #25-30, Bogotá', 
 '{"33lb": 23000, "40lb": 28000, "100lb": 68000}'),

('Hotel Plaza Mayor', '+57 300 444 4444', 'Avenida 68 #25-47, Bogotá', 
 '{"33lb": 30000, "40lb": 35000, "100lb": 80000}'),

('Familia Rodríguez', '+57 300 555 5555', 'Calle 127 #15-80, Bogotá', 
 '{"33lb": 25000, "40lb": 30000, "100lb": 70000}'),

('Panadería La Esperanza', '+57 300 666 6666', 'Carrera 7 #32-10, Bogotá', 
 '{"33lb": 26000, "40lb": 31000, "100lb": 72000}'),

('Fábrica Textil Moderna', '+57 300 777 7777', 'Zona Industrial, Bogotá', 
 '{"33lb": 24000, "40lb": 29000, "100lb": 69000}'),

('Cafetería El Aroma', '+57 300 888 8888', 'Calle 93 #14-25, Bogotá', 
 '{"33lb": 27000, "40lb": 32000, "100lb": 74000}');

-- PASO 6: Insertar ventas de ejemplo
INSERT INTO sales (customer_id, vendor_id, total_amount, payment_method, sale_type, created_at) VALUES
(1, 'UUID_VENDEDOR_1_REAL', 28000.00, 'efectivo', 'intercambio', NOW() - INTERVAL '2 days'),
(2, 'UUID_VENDEDOR_2_REAL', 30000.00, 'transferencia', 'completa', NOW() - INTERVAL '1 day'),
(3, 'UUID_VENDEDOR_1_REAL', 5000.00, 'efectivo', 'venta_vacios', NOW() - INTERVAL '3 hours');

-- PASO 7: Insertar items de ventas
INSERT INTO sale_items (sale_id, product_type, quantity, unit_cost, total_cost, empty_brand, empty_color) VALUES
(1, '33lb', 1, 28000.00, 28000.00, 'Roscogas', 'Naranja'),
(2, '40lb', 1, 30000.00, 30000.00, NULL, NULL),
(3, '33lb', 1, 5000.00, 5000.00, 'Gasan', 'Azul');

-- PASO 8: Insertar gastos de ejemplo
INSERT INTO expenses (vendor_id, type, amount, description, created_at) VALUES
('UUID_VENDEDOR_1_REAL', 'gasolina', 50000.00, 'Combustible para ruta del día', NOW() - INTERVAL '1 day'),
('UUID_VENDEDOR_2_REAL', 'comida', 15000.00, 'Almuerzo durante ruta', NOW() - INTERVAL '1 day'),
('UUID_VENDEDOR_1_REAL', 'reparaciones', 80000.00, 'Reparación de vehículo', NOW() - INTERVAL '2 days'),
('UUID_VENDEDOR_3_REAL', 'gasolina', 45000.00, 'Combustible para ruta', NOW() - INTERVAL '3 hours');

-- PASO 9: Verificar datos insertados
SELECT 'VERIFICACIÓN FINAL:' as info;
SELECT 'Usuarios:' as tabla, COUNT(*) as cantidad FROM users
UNION ALL
SELECT 'Inventario lleno:', COUNT(*) FROM inventory_full
UNION ALL
SELECT 'Inventario vacío:', COUNT(*) FROM inventory_empty
UNION ALL
SELECT 'Clientes:', COUNT(*) FROM customers
UNION ALL
SELECT 'Ventas:', COUNT(*) FROM sales
UNION ALL
SELECT 'Items de ventas:', COUNT(*) FROM sale_items
UNION ALL
SELECT 'Gastos:', COUNT(*) FROM expenses;
