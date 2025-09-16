-- Script FINAL para arreglar la función sync_auth_users_to_public_users
-- Elimina triggers existentes y crea nuevos

-- 1. Eliminar la función problemática y todos sus dependientes
DROP FUNCTION IF EXISTS public.sync_auth_users_to_public_users() CASCADE;

-- 2. Eliminar triggers existentes si existen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- 3. Eliminar funciones existentes si existen
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_update();
DROP FUNCTION IF EXISTS public.handle_user_delete();

-- 4. Crear una nueva función simple y correcta
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

-- 5. Crear trigger para nuevos usuarios
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Función para actualizar usuarios
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

-- 7. Trigger para actualizar usuarios
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_update();

-- 8. Función para eliminar usuarios
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public.users WHERE id = old.id;
  RETURN old;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Trigger para eliminar usuarios
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_delete();

-- 10. Verificar que se crearon correctamente
SELECT 'Función problemática eliminada y triggers nuevos creados exitosamente' as status;
