-- Script para limpiar TODOS los usuarios de autenticación y base de datos
-- ⚠️ CUIDADO: Esto elimina TODOS los usuarios. Solo usar para desarrollo.

-- 1. Eliminar todos los usuarios de la tabla users
DELETE FROM users;

-- 2. Eliminar todos los usuarios de auth.users (esto se hace desde el dashboard de Supabase)
-- Para hacerlo desde SQL, necesitarías permisos especiales
-- Mejor hacerlo desde el dashboard: Authentication > Users > Delete all

-- 3. Resetear secuencias si las hay
-- (No aplica para UUIDs, pero por si acaso)

-- 4. Verificar que se limpió todo
SELECT 'Users en tabla users:' as info, COUNT(*) as count FROM users;
SELECT 'Usuarios en auth.users (debería ser 0):' as info, 'Revisar en dashboard' as count;

-- 5. Mensaje de confirmación
SELECT 'Limpieza completada. Ahora puedes crear una nueva cuenta desde cero.' as status;
