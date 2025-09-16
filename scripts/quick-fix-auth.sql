-- Script rápido para arreglar la autenticación
-- Inserta usuarios de prueba directamente en la tabla users

-- Limpiar usuarios existentes
DELETE FROM users;

-- Insertar usuarios de prueba
INSERT INTO users (id, email, role, name, phone, is_active, created_at, updated_at) VALUES
-- Jefe
('11111111-1111-1111-1111-111111111111', 'jefe@gascontrol.com', 'jefe', 'Carlos Mendoza', '+57 300 123 4567', true, NOW(), NOW()),

-- Vendedores
('22222222-2222-2222-2222-222222222222', 'vendedor1@gascontrol.com', 'vendedor', 'María González', '+57 300 234 5678', true, NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'vendedor2@gascontrol.com', 'vendedor', 'José Rodríguez', '+57 300 345 6789', true, NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'vendedor3@gascontrol.com', 'vendedor', 'Ana López', '+57 300 456 7890', true, NOW(), NOW());

-- Verificar que se insertaron
SELECT 'Usuarios insertados:' as status, COUNT(*) as cantidad FROM users;

-- Mostrar los usuarios
SELECT id, email, role, name FROM users ORDER BY role, email;
