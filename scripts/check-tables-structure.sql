-- =====================================================
-- VERIFICAR ESTRUCTURA COMPLETA DE TABLAS
-- =====================================================

-- Verificar todas las tablas que contienen 'user' en el nombre
SELECT 
    'TABLAS CON USER:' as info,
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name LIKE '%user%' OR table_name LIKE '%profile%'
ORDER BY table_name;

-- Verificar si existe una tabla personalizada de usuarios (no auth.users)
SELECT 
    'TABLA PERSONALIZADA USERS:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name IN ('name', 'role', 'phone', 'is_active')
ORDER BY ordinal_position;

-- Verificar si existe la tabla profiles
SELECT 
    'TABLA PROFILES:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar la tabla customers
SELECT 
    'TABLA CUSTOMERS:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND table_schema = 'public'
ORDER BY ordinal_position;
