-- =====================================================
-- CONFIGURACIÓN PASO A PASO PARA SUPABASE AUTH
-- =====================================================

-- PASO 1: Corregir la tabla users para que sea compatible con Supabase Auth
-- (Ejecuta esto primero)

-- Hacer password_hash opcional
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Verificar que se aplicó el cambio
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'password_hash';

-- PASO 2: Ver tus usuarios autenticados
-- (Ejecuta esto para ver los UUIDs reales)

SELECT 
    'TUS USUARIOS AUTENTICADOS:' as info,
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at;

-- PASO 3: Insertar usuarios en la tabla users (SIN password_hash)
-- REEMPLAZA LOS UUIDs CON LOS REALES DE TUS USUARIOS

-- Ejemplo (cambia los UUIDs por los reales):
/*
INSERT INTO users (id, email, role, name, phone, is_active) VALUES
('UUID_REAL_DEL_JEFE', 'email_del_jefe@empresa.com', 'jefe', 'Nombre del Jefe', '+57 300 123 4567', true),
('UUID_REAL_VENDEDOR_1', 'email_vendedor1@empresa.com', 'vendedor', 'Nombre Vendedor 1', '+57 300 234 5678', true),
('UUID_REAL_VENDEDOR_2', 'email_vendedor2@empresa.com', 'vendedor', 'Nombre Vendedor 2', '+57 300 345 6789', true)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();
*/

-- TEMPORAL: Usar UUIDs de ejemplo (CAMBIAR POR LOS REALES)
INSERT INTO users (id, email, role, name, phone, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'jefe@gascontrol.com', 'jefe', 'Carlos Mendoza', '+57 300 123 4567', true),
('22222222-2222-2222-2222-222222222222', 'vendedor1@gascontrol.com', 'vendedor', 'María González', '+57 300 234 5678', true),
('33333333-3333-3333-3333-333333333333', 'vendedor2@gascontrol.com', 'vendedor', 'José Rodríguez', '+57 300 345 6789', true),
('44444444-4444-4444-4444-444444444444', 'vendedor3@gascontrol.com', 'vendedor', 'Ana López', '+57 300 456 7890', true)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- PASO 4: Insertar inventario básico
INSERT INTO inventory_full (type, quantity, unit_cost, last_updated_by) VALUES
('33lb', 50, 25000.00, (SELECT id FROM users WHERE role = 'jefe' LIMIT 1)),
('40lb', 30, 30000.00, (SELECT id FROM users WHERE role = 'jefe' LIMIT 1)),
('100lb', 20, 70000.00, (SELECT id FROM users WHERE role = 'jefe' LIMIT 1))
ON CONFLICT (type) DO UPDATE SET
    quantity = EXCLUDED.quantity,
    unit_cost = EXCLUDED.unit_cost,
    last_updated_by = EXCLUDED.last_updated_by,
    updated_at = NOW();

-- PASO 5: Insertar inventario vacío básico
INSERT INTO inventory_empty (type, brand, color, quantity) VALUES
('33lb', 'Roscogas', 'Naranja', 25),
('40lb', 'Roscogas', 'Naranja', 15),
('100lb', 'Roscogas', 'Naranja', 10),
('33lb', 'Gasan', 'Azul', 20),
('40lb', 'Gasan', 'Azul', 12),
('100lb', 'Gasan', 'Azul', 8)
ON CONFLICT (type, brand, color) DO UPDATE SET
    quantity = EXCLUDED.quantity,
    updated_at = NOW();

-- PASO 6: Insertar clientes de prueba
INSERT INTO customers (name, phone, location, custom_prices) VALUES
('Cliente Prueba 1', '+57 300 111 1111', 'Bogotá', '{"33lb": 25000, "40lb": 30000, "100lb": 70000}'),
('Cliente Prueba 2', '+57 300 222 2222', 'Bogotá', '{"33lb": 28000, "40lb": 33000, "100lb": 75000}'),
('Cliente Prueba 3', '+57 300 333 3333', 'Bogotá', '{"33lb": 23000, "40lb": 28000, "100lb": 68000}')
ON CONFLICT (name, phone) DO UPDATE SET
    location = EXCLUDED.location,
    custom_prices = EXCLUDED.custom_prices,
    updated_at = NOW();

-- PASO 7: Verificar que todo se insertó correctamente
SELECT 'VERIFICACIÓN FINAL:' as info;
SELECT 'Usuarios:' as tabla, COUNT(*) as cantidad FROM users
UNION ALL
SELECT 'Inventario lleno:', COUNT(*) FROM inventory_full
UNION ALL
SELECT 'Inventario vacío:', COUNT(*) FROM inventory_empty
UNION ALL
SELECT 'Clientes:', COUNT(*) FROM customers;
