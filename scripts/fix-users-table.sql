-- =====================================================
-- CORREGIR TABLA USERS PARA SUPABASE AUTH
-- =====================================================

-- Hacer password_hash opcional (ya que usamos Supabase Auth)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Agregar columna created_by para rastrear quién creó el usuario
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

-- Actualizar la tabla para que sea compatible con Supabase Auth
-- Los usuarios se autentican via Supabase Auth, pero necesitamos sus datos en nuestra tabla

-- Verificar la estructura actual
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
