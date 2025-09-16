-- =====================================================
-- SINCRONIZACIÓN MANUAL DE USUARIOS
-- =====================================================

-- 1. Ver todos los usuarios en auth.users
SELECT 
    'USUARIOS EN AUTH:' as info,
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- 2. Ver usuarios que ya están en la tabla users
SELECT 
    'USUARIOS EN TABLA users:' as info,
    id,
    email,
    role,
    name,
    phone
FROM users 
ORDER BY created_at DESC;

-- 3. Insertar usuarios manualmente (COPIA LOS UUIDs DE ARRIBA)
-- Ejemplo de cómo insertar cada usuario:

/*
-- Para un jefe:
INSERT INTO users (id, email, role, name, phone, is_active) VALUES
('UUID_DEL_JEFE_AQUI', 'email_del_jefe@empresa.com', 'jefe', 'Nombre del Jefe', '+57 300 123 4567', true);

-- Para vendedores:
INSERT INTO users (id, email, role, name, phone, is_active) VALUES
('UUID_VENDEDOR_1_AQUI', 'email_vendedor1@empresa.com', 'vendedor', 'Nombre Vendedor 1', '+57 300 234 5678', true),
('UUID_VENDEDOR_2_AQUI', 'email_vendedor2@empresa.com', 'vendedor', 'Nombre Vendedor 2', '+57 300 345 6789', true);
*/

-- 4. Verificar usuarios no sincronizados
SELECT 
    'USUARIOS NO SINCRONIZADOS:' as info,
    au.id,
    au.email,
    au.email_confirmed_at
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL
ORDER BY au.created_at DESC;
