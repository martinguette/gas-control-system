-- =====================================================
-- INSERCIÓN RÁPIDA CON TUS UUIDs REALES
-- =====================================================

-- 1. Corregir tabla users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 2. Insertar usuarios (COPIA LOS UUIDs DE TU IMAGEN Y PEGA AQUÍ)
-- Ejemplo de cómo debe verse:
/*
INSERT INTO users (id, email, role, name, phone, is_active) VALUES
('tu-uuid-jefe-aqui', 'email_del_jefe@empresa.com', 'jefe', 'Nombre del Jefe', '+57 300 123 4567', true),
('tu-uuid-vendedor-1-aqui', 'email_vendedor1@empresa.com', 'vendedor', 'Nombre Vendedor 1', '+57 300 234 5678', true),
('tu-uuid-vendedor-2-aqui', 'email_vendedor2@empresa.com', 'vendedor', 'Nombre Vendedor 2', '+57 300 345 6789', true);
*/

-- TEMPORAL: Usar estos UUIDs de ejemplo (CAMBIAR POR LOS REALES)
INSERT INTO users (id, email, role, name, phone, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'jefe@gascontrol.com', 'jefe', 'Carlos Mendoza', '+57 300 123 4567', true),
('22222222-2222-2222-2222-222222222222', 'vendedor1@gascontrol.com', 'vendedor', 'María González', '+57 300 234 5678', true),
('33333333-3333-3333-3333-333333333333', 'vendedor2@gascontrol.com', 'vendedor', 'José Rodríguez', '+57 300 345 6789', true);

-- 3. Insertar inventario básico
INSERT INTO inventory_full (type, quantity, unit_cost, last_updated_by) VALUES
('33lb', 50, 25000.00, '11111111-1111-1111-1111-111111111111'),
('40lb', 30, 30000.00, '11111111-1111-1111-1111-111111111111'),
('100lb', 20, 70000.00, '11111111-1111-1111-1111-111111111111');

-- 4. Insertar inventario vacío básico
INSERT INTO inventory_empty (type, brand, color, quantity) VALUES
('33lb', 'Roscogas', 'Naranja', 25),
('40lb', 'Roscogas', 'Naranja', 15),
('100lb', 'Roscogas', 'Naranja', 10),
('33lb', 'Gasan', 'Azul', 20),
('40lb', 'Gasan', 'Azul', 12),
('100lb', 'Gasan', 'Azul', 8);

-- 5. Insertar clientes básicos
INSERT INTO customers (name, phone, location, custom_prices) VALUES
('Cliente Prueba 1', '+57 300 111 1111', 'Bogotá', '{"33lb": 25000, "40lb": 30000, "100lb": 70000}'),
('Cliente Prueba 2', '+57 300 222 2222', 'Bogotá', '{"33lb": 28000, "40lb": 33000, "100lb": 75000}'),
('Cliente Prueba 3', '+57 300 333 3333', 'Bogotá', '{"33lb": 23000, "40lb": 28000, "100lb": 68000}');

-- 6. Verificar
SELECT 'DATOS INSERTADOS:' as info;
SELECT 'Usuarios:' as tabla, COUNT(*) as cantidad FROM users
UNION ALL
SELECT 'Inventario lleno:', COUNT(*) FROM inventory_full
UNION ALL
SELECT 'Inventario vacío:', COUNT(*) FROM inventory_empty
UNION ALL
SELECT 'Clientes:', COUNT(*) FROM customers;
