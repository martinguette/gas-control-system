-- =====================================================
-- SCRIPT PARA APLICAR OPTIMIZACIONES DEL SISTEMA DE CLIENTES
-- =====================================================
-- Ejecutar este script en Supabase para aplicar todas las mejoras

-- 1. Aplicar la migración principal
\i supabase/migrations/20241213_000000_optimize_customer_system.sql

-- 2. Verificar que las tablas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename IN (
  'customers', 
  'vendor_offline_cache', 
  'pending_sales', 
  'customer_price_history'
)
ORDER BY tablename;

-- 3. Verificar que los índices se crearon
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename IN (
  'customers', 
  'vendor_offline_cache', 
  'pending_sales', 
  'customer_price_history'
)
ORDER BY tablename, indexname;

-- 4. Verificar que las funciones se crearon
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname IN (
  'search_customers',
  'get_vendor_cache_data',
  'sync_pending_sales',
  'update_customer_search_vector'
)
ORDER BY proname;

-- 5. Probar la función de búsqueda
SELECT * FROM search_customers('', 5);

-- 6. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN (
  'vendor_offline_cache', 
  'pending_sales', 
  'customer_price_history'
)
ORDER BY tablename, policyname;

-- 7. Insertar algunos datos de prueba si no existen
INSERT INTO customers (name, phone, location, custom_prices)
SELECT 
  'Cliente de Prueba ' || generate_series,
  '+123456789' || generate_series,
  'Ubicación de Prueba ' || generate_series,
  '{"33lb": 25.00, "40lb": 30.00, "100lb": 60.00}'::jsonb
FROM generate_series(1, 5)
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE name LIKE 'Cliente de Prueba%');

-- 8. Verificar que los datos de prueba se insertaron
SELECT 
  id,
  name,
  phone,
  location,
  custom_prices,
  created_at
FROM customers 
WHERE name LIKE 'Cliente de Prueba%'
ORDER BY created_at DESC;

-- 9. Probar búsqueda con datos de prueba
SELECT * FROM search_customers('Prueba', 10);

-- 10. Verificar el vector de búsqueda
SELECT 
  name,
  search_vector
FROM customers 
WHERE name LIKE 'Cliente de Prueba%'
LIMIT 3;

-- Mensaje de confirmación
SELECT 'Optimizaciones del sistema de clientes aplicadas exitosamente' as status;
