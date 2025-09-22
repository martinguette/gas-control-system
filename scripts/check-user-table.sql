-- =====================================================
-- VERIFICAR ESTRUCTURA DE USUARIOS
-- =====================================================
-- Ejecuta esto primero para ver qué tabla de usuarios tienes

-- Verificar si existe la tabla users
SELECT 
    'TABLA USERS:' as info,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Verificar si existe la tabla profiles
SELECT 
    'TABLA PROFILES:' as info,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Verificar usuarios autenticados en Supabase Auth
SELECT 
    'USUARIOS AUTH:' as info,
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at;
