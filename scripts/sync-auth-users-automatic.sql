-- Script para sincronizar automáticamente usuarios de auth.users a public.users
-- Este script debe ejecutarse después de que los usuarios se autentiquen

-- Función para sincronizar usuarios automáticamente
CREATE OR REPLACE FUNCTION sync_auth_users_to_public_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar o actualizar en la tabla public.users cuando se crea un usuario en auth.users
  INSERT INTO public.users (id, email, role, name, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    CASE
      WHEN NEW.email ILIKE '%jefe%' OR NEW.email ILIKE '%admin%' OR NEW.email ILIKE '%boss%' OR NEW.email ILIKE '%manager%' THEN 'jefe'
      WHEN NEW.email ILIKE '%vendedor%' OR NEW.email ILIKE '%vendor%' OR NEW.email ILIKE '%sales%' THEN 'vendedor'
      ELSE 'vendedor' -- Default role
    END,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para sincronización automática
DROP TRIGGER IF EXISTS sync_auth_users_trigger ON auth.users;
CREATE TRIGGER sync_auth_users_trigger
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_users_to_public_users();

-- Sincronizar usuarios existentes
INSERT INTO public.users (id, email, role, name, is_active)
SELECT
  au.id,
  au.email,
  CASE
    WHEN au.email ILIKE '%jefe%' OR au.email ILIKE '%admin%' OR au.email ILIKE '%boss%' OR au.email ILIKE '%manager%' THEN 'jefe'
    WHEN au.email ILIKE '%vendedor%' OR au.email ILIKE '%vendor%' OR au.email ILIKE '%sales%' THEN 'vendedor'
    ELSE 'vendedor' -- Default role
  END AS role,
  COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)) AS name,
  true AS is_active
FROM
  auth.users AS au
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

SELECT 'Sincronización automática de usuarios configurada y usuarios existentes sincronizados.' as status;
SELECT 'Usuarios en public.users:' as status;
SELECT id, email, role, name, is_active FROM public.users ORDER BY role, email;
