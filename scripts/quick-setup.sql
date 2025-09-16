-- =====================================================
-- CONFIGURACIÓN RÁPIDA CON USUARIOS REALES
-- =====================================================

-- 1. Primero, veamos qué usuarios tienes autenticados
SELECT 
    'USUARIOS AUTENTICADOS:' as info,
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at;

-- 2. Verificar si ya existen en la tabla users
SELECT 
    'USUARIOS EN TABLA users:' as info,
    u.id,
    u.email,
    u.role,
    u.name
FROM users u
ORDER BY u.created_at;

-- 3. Insertar usuarios en tabla users (solo si no existen)
-- REEMPLAZA LOS UUIDs CON LOS REALES DE TUS USUARIOS

-- Ejemplo para un jefe:
-- INSERT INTO users (id, email, role, name, phone, is_active) 
-- VALUES ('UUID_REAL_DEL_JEFE', 'email_del_jefe@empresa.com', 'jefe', 'Nombre del Jefe', '+57 300 123 4567', true)
-- ON CONFLICT (id) DO NOTHING;

-- Ejemplo para un vendedor:
-- INSERT INTO users (id, email, role, name, phone, is_active) 
-- VALUES ('UUID_REAL_DEL_VENDEDOR', 'email_dendedor@empresa.com', 'vendedor', 'Nombre Vendedor', '+57 300 234 5678', true)
-- ON CONFLICT (id) DO NOTHING;

-- 4. Insertar inventario básico
INSERT INTO inventory_full (type, quantity, unit_cost, last_updated_by) VALUES
('33lb', 50, 25000.00, (SELECT id FROM users WHERE role = 'jefe' LIMIT 1)),
('40lb', 30, 30000.00, (SELECT id FROM users WHERE role = 'jefe' LIMIT 1)),
('100lb', 20, 70000.00, (SELECT id FROM users WHERE role = 'jefe' LIMIT 1))
ON CONFLICT (type) DO UPDATE SET
    quantity = EXCLUDED.quantity,
    unit_cost = EXCLUDED.unit_cost,
    last_updated_by = EXCLUDED.last_updated_by;

-- 5. Insertar inventario vacío básico
INSERT INTO inventory_empty (type, brand, color, quantity) VALUES
('33lb', 'Roscogas', 'Naranja', 25),
('40lb', 'Roscogas', 'Naranja', 15),
('100lb', 'Roscogas', 'Naranja', 10),
('33lb', 'Gasan', 'Azul', 20),
('40lb', 'Gasan', 'Azul', 12),
('100lb', 'Gasan', 'Azul', 8)
ON CONFLICT (type, brand, color) DO UPDATE SET
    quantity = EXCLUDED.quantity;

-- 6. Insertar algunos clientes de prueba
INSERT INTO customers (name, phone, location, custom_prices, created_by) VALUES
('Cliente Prueba 1', '+57 300 111 1111', 'Bogotá', '{"33lb": 25000, "40lb": 30000, "100lb": 70000}', (SELECT id FROM users WHERE role = 'jefe' LIMIT 1)),
('Cliente Prueba 2', '+57 300 222 2222', 'Bogotá', '{"33lb": 28000, "40lb": 33000, "100lb": 75000}', (SELECT id FROM users WHERE role = 'jefe' LIMIT 1))
ON CONFLICT (name, phone) DO NOTHING;

-- 7. Verificar datos insertados
SELECT 'RESUMEN DE DATOS:' as info;
SELECT 'Usuarios:' as tabla, COUNT(*) as cantidad FROM users
UNION ALL
SELECT 'Inventario lleno:', COUNT(*) FROM inventory_full
UNION ALL
SELECT 'Inventario vacío:', COUNT(*) FROM inventory_empty
UNION ALL
SELECT 'Clientes:', COUNT(*) FROM customers;
