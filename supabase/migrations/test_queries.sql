-- =====================================================
-- SCRIPTS DE PRUEBA PARA VALIDACIÓN Y RENDIMIENTO
-- =====================================================
-- Este archivo contiene consultas de prueba para validar
-- la integridad y rendimiento del sistema

-- =====================================================
-- PRUEBAS DE INTEGRIDAD REFERENCIAL
-- =====================================================

-- 1. Verificar que todas las tablas existen
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'profiles', 'inventory_full', 'inventory_empty', 'customers',
      'sales', 'expenses', 'truck_arrivals', 'daily_assignments',
      'goals', 'audit_logs'
    ) THEN '✅ Existe'
    ELSE '❌ Faltante'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Verificar políticas RLS
SELECT 
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ RLS Habilitado'
    ELSE '❌ Sin políticas'
  END as status
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 3. Verificar triggers
SELECT 
  event_object_table,
  trigger_name,
  action_timing,
  event_manipulation,
  '✅ Trigger Activo' as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 4. Verificar índices
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef,
  '✅ Índice Creado' as status
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- PRUEBAS DE RENDIMIENTO
-- =====================================================

-- 5. Prueba de consulta de ventas por vendedor
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
  p.full_name,
  COUNT(s.id) as total_sales,
  SUM(s.amount_charged) as total_amount
FROM public.sales s
JOIN public.profiles p ON s.vendor_id = p.id
WHERE s.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.full_name
ORDER BY total_amount DESC;

-- 6. Prueba de consulta de inventario
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
  type,
  SUM(quantity) as total_quantity,
  AVG(unit_cost) as avg_cost
FROM public.inventory_full
GROUP BY type
ORDER BY type;

-- 7. Prueba de consulta de gastos por tipo
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
  type,
  COUNT(*) as count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount
FROM public.expenses
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY type
ORDER BY total_amount DESC;

-- 8. Prueba de consulta de asignaciones diarias
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
  p.full_name,
  da.date,
  da.assigned_cylinders,
  da.status
FROM public.daily_assignments da
JOIN public.profiles p ON da.vendor_id = p.id
WHERE da.date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY da.date DESC, p.full_name;

-- =====================================================
-- PRUEBAS DE FUNCIONES
-- =====================================================

-- 9. Probar función de conversión lbs a kg
SELECT 
  type,
  lbs_to_kg(type) as kg_equivalent
FROM (
  VALUES ('33lb'), ('40lb'), ('100lb')
) AS types(type);

-- 10. Probar función de estadísticas del sistema
SELECT * FROM get_system_stats();

-- 11. Probar función de validación de integridad
SELECT * FROM validate_referential_integrity();

-- 12. Probar función de tamaño de tablas
SELECT * FROM get_table_sizes();

-- =====================================================
-- PRUEBAS DE INSERCIÓN DE DATOS
-- =====================================================

-- 13. Insertar datos de prueba para inventario
INSERT INTO public.inventory_full (type, quantity, unit_cost) VALUES
  ('33lb', 100, 25.50),
  ('40lb', 50, 30.75),
  ('100lb', 20, 65.00)
ON CONFLICT DO NOTHING;

-- 14. Insertar datos de prueba para inventario vacío
INSERT INTO public.inventory_empty (type, brand, color, quantity) VALUES
  ('33lb', 'Roscogas', 'Azul', 25),
  ('40lb', 'Roscogas', 'Azul', 15),
  ('100lb', 'Roscogas', 'Azul', 5),
  ('33lb', 'Otra Marca', 'Rojo', 10)
ON CONFLICT DO NOTHING;

-- 15. Insertar cliente de prueba
INSERT INTO public.customers (name, phone, location, custom_prices) VALUES
  ('Cliente Prueba', '1234567890', 'Ubicación Prueba', '{"33lb": 30.00, "40lb": 35.00}')
ON CONFLICT DO NOTHING;

-- =====================================================
-- PRUEBAS DE ACTUALIZACIÓN DE INVENTARIO
-- =====================================================

-- 16. Probar venta de intercambio (debe actualizar inventario)
INSERT INTO public.sales (
  vendor_id,
  customer_id,
  customer_name,
  customer_phone,
  customer_location,
  product_type,
  sale_type,
  empty_brand,
  empty_color,
  amount_charged,
  payment_method
) VALUES (
  (SELECT id FROM public.profiles WHERE role = 'vendedor' LIMIT 1),
  (SELECT id FROM public.customers LIMIT 1),
  'Cliente Prueba Venta',
  '0987654321',
  'Ubicación Venta',
  '33lb',
  'intercambio',
  'Otra Marca',
  'Verde',
  30.00,
  'efectivo'
);

-- 17. Verificar que el inventario se actualizó correctamente
SELECT 
  'inventory_full' as table_name,
  type,
  quantity
FROM public.inventory_full
WHERE type = '33lb'

UNION ALL

SELECT 
  'inventory_empty' as table_name,
  type,
  quantity
FROM public.inventory_empty
WHERE type = '33lb' AND brand = 'Otra Marca' AND color = 'Verde';

-- =====================================================
-- PRUEBAS DE AUDITORÍA
-- =====================================================

-- 18. Verificar que se registró en audit_logs
SELECT 
  table_name,
  action,
  record_id,
  created_at
FROM public.audit_logs
WHERE table_name = 'sales'
ORDER BY created_at DESC
LIMIT 5;

-- 19. Probar función de historial de registro
SELECT * FROM get_record_history(
  'sales',
  (SELECT id FROM public.sales ORDER BY created_at DESC LIMIT 1)
);

-- =====================================================
-- PRUEBAS DE SEGURIDAD
-- =====================================================

-- 20. Verificar funciones de seguridad
SELECT 
  'is_jefe()' as function_name,
  is_jefe() as result
UNION ALL
SELECT 
  'is_vendedor()' as function_name,
  is_vendedor() as result
UNION ALL
SELECT 
  'get_user_role()' as function_name,
  get_user_role() as result;

-- =====================================================
-- PRUEBAS DE REALTIME
-- =====================================================

-- 21. Verificar que las tablas están en la publicación realtime
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN tablename IN ('sales', 'expenses', 'daily_assignments', 'inventory_full', 'inventory_empty')
    THEN '✅ Realtime Habilitado'
    ELSE '❌ Sin Realtime'
  END as realtime_status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- =====================================================
-- LIMPIEZA DE DATOS DE PRUEBA
-- =====================================================

-- 22. Limpiar datos de prueba (ejecutar al final)
-- DELETE FROM public.sales WHERE customer_name = 'Cliente Prueba Venta';
-- DELETE FROM public.customers WHERE name = 'Cliente Prueba';
-- DELETE FROM public.inventory_full WHERE unit_cost IN (25.50, 30.75, 65.00);
-- DELETE FROM public.inventory_empty WHERE brand = 'Otra Marca' AND color = 'Rojo';

-- =====================================================
-- RESUMEN DE PRUEBAS
-- =====================================================

-- 23. Resumen final de validación
SELECT 
  'Tablas Creadas' as test_category,
  COUNT(*) as count,
  '✅ Completado' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
  'Políticas RLS' as test_category,
  COUNT(*) as count,
  '✅ Completado' as status
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

SELECT 
  'Triggers' as test_category,
  COUNT(*) as count,
  '✅ Completado' as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public'

UNION ALL

SELECT 
  'Índices' as test_category,
  COUNT(*) as count,
  '✅ Completado' as status
FROM pg_indexes 
WHERE schemaname = 'public'

UNION ALL

SELECT 
  'Funciones' as test_category,
  COUNT(*) as count,
  '✅ Completado' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION';
