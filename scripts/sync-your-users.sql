-- =====================================================
-- SINCRONIZAR TUS USUARIOS AUTENTICADOS
-- =====================================================

-- 1. Ver todos los usuarios en auth.users
SELECT 
    'TUS USUARIOS AUTENTICADOS:' as info,
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- 2. Insertar usuarios en la tabla users (basado en email)
INSERT INTO users (id, email, role, name, phone, is_active)
SELECT 
    au.id,
    au.email,
    CASE 
        -- Si el email contiene 'jefe', 'admin', 'boss', 'manager' -> jefe
        WHEN au.email ILIKE '%jefe%' OR au.email ILIKE '%admin%' OR 
             au.email ILIKE '%boss%' OR au.email ILIKE '%manager%' THEN 'jefe'
        -- Si el email contiene 'vendedor', 'vendor', 'sales' -> vendedor
        WHEN au.email ILIKE '%vendedor%' OR au.email ILIKE '%vendor%' OR 
             au.email ILIKE '%sales%' THEN 'vendedor'
        -- Por defecto, asignar como vendedor
        ELSE 'vendedor'
    END as role,
    -- Usar el email como nombre si no hay nombre real
    COALESCE(au.raw_user_meta_data->>'name', 
             au.raw_user_meta_data->>'full_name',
             SPLIT_PART(au.email, '@', 1)) as name,
    -- Usar teléfono de metadata si existe
    au.raw_user_meta_data->>'phone' as phone,
    true as is_active
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL  -- Solo usuarios que no existen en la tabla users
AND au.email_confirmed_at IS NOT NULL;  -- Solo usuarios confirmados

-- 3. Verificar usuarios sincronizados
SELECT 
    'USUARIOS SINCRONIZADOS:' as info,
    u.id,
    u.email,
    u.role,
    u.name,
    u.phone
FROM users u
ORDER BY u.created_at DESC;

-- 4. Mostrar usuarios que no se pudieron sincronizar
SELECT 
    'USUARIOS NO SINCRONIZADOS:' as info,
    au.id,
    au.email,
    au.email_confirmed_at
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL
ORDER BY au.created_at DESC;
