-- Script para arreglar la función sync_auth_users_to_public_users
-- Esta función está causando el error "Database error granting user"

-- 1. Eliminar la función problemática
DROP FUNCTION IF EXISTS public.sync_auth_users_to_public_users();

-- 2. Eliminar triggers relacionados si existen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- 3. Crear una nueva función simple y correcta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'vendedor'),
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Crear trigger para nuevos usuarios
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Función para actualizar usuarios
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger AS $$
BEGIN
  UPDATE public.users
  SET 
    email = new.email,
    updated_at = now()
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger para actualizar usuarios
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_update();

-- 7. Función para eliminar usuarios
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public.users WHERE id = old.id;
  RETURN old;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger para eliminar usuarios
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_delete();

-- 9. Verificar que se crearon correctamente
SELECT 'Función problemática eliminada y triggers nuevos creados exitosamente' as status;
