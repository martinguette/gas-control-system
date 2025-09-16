-- =====================================================
-- OBTENER USUARIOS AUTENTICADOS DE SUPABASE AUTH
-- =====================================================

-- Este script te mostrará los UUIDs de tus usuarios autenticados
-- para que puedas usarlos en el script de datos de prueba

SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    CASE 
        WHEN email LIKE '%jefe%' OR email LIKE '%admin%' OR email LIKE '%boss%' THEN 'jefe'
        ELSE 'vendedor'
    END as suggested_role
FROM auth.users 
ORDER BY created_at;

-- También puedes verificar si ya existen en la tabla users:
SELECT 
    u.id,
    u.email,
    u.role,
    u.name,
    au.email as auth_email
FROM users u
RIGHT JOIN auth.users au ON u.id = au.id
ORDER BY au.created_at;
