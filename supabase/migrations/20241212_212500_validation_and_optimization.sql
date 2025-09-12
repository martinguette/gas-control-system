-- =====================================================
-- MIGRACIÓN: 20241212_212500_validation_and_optimization.sql
-- DESCRIPCIÓN: Validación de integridad y optimización de rendimiento
-- VERSIÓN: 1.0
-- FECHA: 2024-12-12
-- =====================================================

-- Esta migración incluye validaciones de integridad,
-- optimizaciones de rendimiento y scripts de prueba

-- =====================================================
-- FUNCIONES DE VALIDACIÓN DE INTEGRIDAD
-- =====================================================

-- Función para validar que no hay inventario negativo
CREATE OR REPLACE FUNCTION validate_positive_inventory()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar que la cantidad no sea negativa
  IF NEW.quantity < 0 THEN
    RAISE EXCEPTION 'La cantidad de inventario no puede ser negativa: %', NEW.quantity;
  END IF;
  
  -- Validar que el costo unitario no sea negativo
  IF NEW.unit_cost < 0 THEN
    RAISE EXCEPTION 'El costo unitario no puede ser negativo: %', NEW.unit_cost;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para validar inventario positivo
CREATE TRIGGER validate_inventory_full_positive
  BEFORE INSERT OR UPDATE ON public.inventory_full
  FOR EACH ROW
  EXECUTE FUNCTION validate_positive_inventory();

CREATE TRIGGER validate_inventory_empty_positive
  BEFORE INSERT OR UPDATE ON public.inventory_empty
  FOR EACH ROW
  EXECUTE FUNCTION validate_positive_inventory();

-- =====================================================
-- FUNCIONES DE VALIDACIÓN DE NEGOCIO
-- =====================================================

-- Función para validar que las fechas de metas sean coherentes
CREATE OR REPLACE FUNCTION validate_goal_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar que la fecha de inicio sea anterior a la fecha de fin
  IF NEW.start_date >= NEW.end_date THEN
    RAISE EXCEPTION 'La fecha de inicio debe ser anterior a la fecha de fin';
  END IF;
  
  -- Validar que el target sea positivo
  IF NEW.target_kg <= 0 THEN
    RAISE EXCEPTION 'El objetivo debe ser mayor a 0: %', NEW.target_kg;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar fechas de metas
CREATE TRIGGER validate_goal_dates_trigger
  BEFORE INSERT OR UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION validate_goal_dates();

-- Función para validar que las asignaciones diarias no se solapen
CREATE OR REPLACE FUNCTION validate_daily_assignment_unique()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar que no exista otra asignación activa para el mismo vendedor en la misma fecha
  IF EXISTS (
    SELECT 1 FROM public.daily_assignments 
    WHERE vendor_id = NEW.vendor_id 
      AND date = NEW.date 
      AND status = 'active'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
  ) THEN
    RAISE EXCEPTION 'Ya existe una asignación activa para este vendedor en esta fecha';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar asignaciones únicas
CREATE TRIGGER validate_daily_assignment_unique_trigger
  BEFORE INSERT OR UPDATE ON public.daily_assignments
  FOR EACH ROW
  EXECUTE FUNCTION validate_daily_assignment_unique();

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_sales_vendor_date 
ON public.sales(vendor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sales_type_date 
ON public.sales(sale_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_vendor_date 
ON public.expenses(vendor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_type_date 
ON public.expenses(type, created_at DESC);

-- Índices para consultas de inventario
CREATE INDEX IF NOT EXISTS idx_inventory_full_type 
ON public.inventory_full(type);

CREATE INDEX IF NOT EXISTS idx_inventory_empty_type_brand 
ON public.inventory_empty(type, brand);

-- Índices para consultas de metas
CREATE INDEX IF NOT EXISTS idx_goals_vendor_period 
ON public.goals(vendor_id, period);

CREATE INDEX IF NOT EXISTS idx_goals_type_period 
ON public.goals(type, period);

-- Índices para consultas de asignaciones
CREATE INDEX IF NOT EXISTS idx_daily_assignments_vendor_date 
ON public.daily_assignments(vendor_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_assignments_date_status 
ON public.daily_assignments(date, status);

-- =====================================================
-- FUNCIONES DE ANÁLISIS DE RENDIMIENTO
-- =====================================================

-- Función para analizar el rendimiento de consultas
CREATE OR REPLACE FUNCTION analyze_query_performance()
RETURNS TABLE (
  query_text TEXT,
  calls BIGINT,
  total_time DOUBLE PRECISION,
  mean_time DOUBLE PRECISION,
  rows BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
  FROM pg_stat_statements
  WHERE query NOT LIKE '%pg_stat_statements%'
  ORDER BY total_time DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas de uso de índices
CREATE OR REPLACE FUNCTION get_index_usage_stats()
RETURNS TABLE (
  table_name TEXT,
  index_name TEXT,
  idx_scan BIGINT,
  idx_tup_read BIGINT,
  idx_tup_fetch BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname||'.'||tablename as table_name,
    indexname as index_name,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
  ORDER BY idx_scan DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIONES DE MANTENIMIENTO
-- =====================================================

-- Función para limpiar datos obsoletos
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS TABLE (
  table_name TEXT,
  deleted_count INTEGER
) AS $$
DECLARE
  result RECORD;
  deleted_count INTEGER;
BEGIN
  -- Limpiar asignaciones diarias completadas hace más de 30 días
  DELETE FROM public.daily_assignments
  WHERE status = 'completed' 
    AND created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN QUERY SELECT 'daily_assignments'::TEXT, deleted_count;
  
  -- Limpiar metas canceladas hace más de 90 días
  DELETE FROM public.goals
  WHERE status = 'cancelled' 
    AND created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN QUERY SELECT 'goals'::TEXT, deleted_count;
  
  -- Limpiar gastos rechazados hace más de 30 días
  DELETE FROM public.expenses
  WHERE status = 'rejected' 
    AND created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN QUERY SELECT 'expenses'::TEXT, deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIONES DE VALIDACIÓN DE INTEGRIDAD REFERENCIAL
-- =====================================================

-- Función para validar integridad referencial
CREATE OR REPLACE FUNCTION validate_referential_integrity()
RETURNS TABLE (
  table_name TEXT,
  constraint_name TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- Validar que todos los vendor_id en sales existen en profiles
  RETURN QUERY
  SELECT 
    'sales'::TEXT,
    'vendor_id_fk'::TEXT,
    CASE 
      WHEN COUNT(*) = 0 THEN 'OK'::TEXT
      ELSE 'ERROR'::TEXT
    END,
    'Ventas con vendor_id inexistente: ' || COUNT(*)::TEXT
  FROM public.sales s
  LEFT JOIN public.profiles p ON s.vendor_id = p.id
  WHERE p.id IS NULL;
  
  -- Validar que todos los customer_id en sales existen en customers
  RETURN QUERY
  SELECT 
    'sales'::TEXT,
    'customer_id_fk'::TEXT,
    CASE 
      WHEN COUNT(*) = 0 THEN 'OK'::TEXT
      ELSE 'ERROR'::TEXT
    END,
    'Ventas con customer_id inexistente: ' || COUNT(*)::TEXT
  FROM public.sales s
  LEFT JOIN public.customers c ON s.customer_id = c.id
  WHERE s.customer_id IS NOT NULL AND c.id IS NULL;
  
  -- Validar que todos los vendor_id en expenses existen en profiles
  RETURN QUERY
  SELECT 
    'expenses'::TEXT,
    'vendor_id_fk'::TEXT,
    CASE 
      WHEN COUNT(*) = 0 THEN 'OK'::TEXT
      ELSE 'ERROR'::TEXT
    END,
    'Gastos con vendor_id inexistente: ' || COUNT(*)::TEXT
  FROM public.expenses e
  LEFT JOIN public.profiles p ON e.vendor_id = p.id
  WHERE p.id IS NULL;
  
  -- Validar que todos los vendor_id en daily_assignments existen en profiles
  RETURN QUERY
  SELECT 
    'daily_assignments'::TEXT,
    'vendor_id_fk'::TEXT,
    CASE 
      WHEN COUNT(*) = 0 THEN 'OK'::TEXT
      ELSE 'ERROR'::TEXT
    END,
    'Asignaciones con vendor_id inexistente: ' || COUNT(*)::TEXT
  FROM public.daily_assignments da
  LEFT JOIN public.profiles p ON da.vendor_id = p.id
  WHERE p.id IS NULL;
  
  -- Validar que todos los vendor_id en goals existen en profiles
  RETURN QUERY
  SELECT 
    'goals'::TEXT,
    'vendor_id_fk'::TEXT,
    CASE 
      WHEN COUNT(*) = 0 THEN 'OK'::TEXT
      ELSE 'ERROR'::TEXT
    END,
    'Metas con vendor_id inexistente: ' || COUNT(*)::TEXT
  FROM public.goals g
  LEFT JOIN public.profiles p ON g.vendor_id = p.id
  WHERE g.vendor_id IS NOT NULL AND p.id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIONES DE ESTADÍSTICAS DEL SISTEMA
-- =====================================================

-- Función para obtener estadísticas generales del sistema
CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS TABLE (
  metric TEXT,
  value BIGINT,
  description TEXT
) AS $$
BEGIN
  -- Estadísticas de usuarios
  RETURN QUERY
  SELECT 
    'total_users'::TEXT,
    COUNT(*)::BIGINT,
    'Total de usuarios registrados'::TEXT
  FROM public.profiles;
  
  RETURN QUERY
  SELECT 
    'jefe_users'::TEXT,
    COUNT(*)::BIGINT,
    'Usuarios con rol jefe'::TEXT
  FROM public.profiles WHERE role = 'jefe';
  
  RETURN QUERY
  SELECT 
    'vendedor_users'::TEXT,
    COUNT(*)::BIGINT,
    'Usuarios con rol vendedor'::TEXT
  FROM public.profiles WHERE role = 'vendedor';
  
  -- Estadísticas de ventas
  RETURN QUERY
  SELECT 
    'total_sales'::TEXT,
    COUNT(*)::BIGINT,
    'Total de ventas registradas'::TEXT
  FROM public.sales;
  
  RETURN QUERY
  SELECT 
    'sales_today'::TEXT,
    COUNT(*)::BIGINT,
    'Ventas del día actual'::TEXT
  FROM public.sales WHERE DATE(created_at) = CURRENT_DATE;
  
  -- Estadísticas de inventario
  RETURN QUERY
  SELECT 
    'total_full_cylinders'::TEXT,
    SUM(quantity)::BIGINT,
    'Total de cilindros llenos'::TEXT
  FROM public.inventory_full;
  
  RETURN QUERY
  SELECT 
    'total_empty_cylinders'::TEXT,
    SUM(quantity)::BIGINT,
    'Total de cilindros vacíos'::TEXT
  FROM public.inventory_empty;
  
  -- Estadísticas de gastos
  RETURN QUERY
  SELECT 
    'total_expenses'::TEXT,
    COUNT(*)::BIGINT,
    'Total de gastos registrados'::TEXT
  FROM public.expenses;
  
  RETURN QUERY
  SELECT 
    'pending_expenses'::TEXT,
    COUNT(*)::BIGINT,
    'Gastos pendientes de aprobación'::TEXT
  FROM public.expenses WHERE status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCIONES DE MONITOREO DE RENDIMIENTO
-- =====================================================

-- Función para monitorear el tamaño de las tablas
CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE (
  table_name TEXT,
  row_count BIGINT,
  total_size TEXT,
  index_size TEXT,
  toast_size TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname||'.'||relname as table_name,
    n_tup_ins - n_tup_del as row_count,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) as total_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||relname)) as index_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname) - pg_relation_size(schemaname||'.'||relname)) as toast_size
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||relname) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTARIOS EN FUNCIONES DE VALIDACIÓN
-- =====================================================

COMMENT ON FUNCTION validate_positive_inventory() IS 'Valida que el inventario no tenga cantidades o costos negativos';
COMMENT ON FUNCTION validate_goal_dates() IS 'Valida que las fechas de metas sean coherentes';
COMMENT ON FUNCTION validate_daily_assignment_unique() IS 'Valida que no existan asignaciones duplicadas para el mismo vendedor y fecha';
COMMENT ON FUNCTION analyze_query_performance() IS 'Analiza el rendimiento de las consultas más costosas';
COMMENT ON FUNCTION get_index_usage_stats() IS 'Obtiene estadísticas de uso de índices';
COMMENT ON FUNCTION cleanup_old_data() IS 'Limpia datos obsoletos del sistema';
COMMENT ON FUNCTION validate_referential_integrity() IS 'Valida la integridad referencial de todas las tablas';
COMMENT ON FUNCTION get_system_stats() IS 'Obtiene estadísticas generales del sistema';
COMMENT ON FUNCTION get_table_sizes() IS 'Monitorea el tamaño de las tablas';

-- =====================================================
-- CONFIGURACIÓN DE AUTO-VACUUM
-- =====================================================

-- Configurar auto-vacuum para tablas con alta actividad
ALTER TABLE public.sales SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE public.expenses SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE public.audit_logs SET (autovacuum_vacuum_scale_factor = 0.05);

-- Configurar auto-analyze para tablas críticas
ALTER TABLE public.sales SET (autovacuum_analyze_scale_factor = 0.05);
ALTER TABLE public.expenses SET (autovacuum_analyze_scale_factor = 0.05);
ALTER TABLE public.daily_assignments SET (autovacuum_analyze_scale_factor = 0.05);

-- =====================================================
-- CONFIGURACIÓN DE STATISTICS
-- =====================================================

-- Aumentar estadísticas para columnas con alta selectividad
ALTER TABLE public.sales ALTER COLUMN vendor_id SET STATISTICS 1000;
ALTER TABLE public.sales ALTER COLUMN sale_type SET STATISTICS 1000;
ALTER TABLE public.expenses ALTER COLUMN vendor_id SET STATISTICS 1000;
ALTER TABLE public.expenses ALTER COLUMN type SET STATISTICS 1000;
ALTER TABLE public.daily_assignments ALTER COLUMN vendor_id SET STATISTICS 1000;
ALTER TABLE public.goals ALTER COLUMN vendor_id SET STATISTICS 1000;
