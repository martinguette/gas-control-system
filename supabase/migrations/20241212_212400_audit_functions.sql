-- =====================================================
-- MIGRACIÓN: 20241212_212400_audit_functions.sql
-- DESCRIPCIÓN: Funciones avanzadas de auditoría y seguridad
-- VERSIÓN: 1.0
-- FECHA: 2024-12-12
-- =====================================================

-- Esta migración agrega funciones avanzadas de auditoría
-- y mejora las políticas de seguridad

-- =====================================================
-- FUNCIONES DE AUDITORÍA AVANZADAS
-- =====================================================

-- Función para registrar cambios en cualquier tabla
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  old_record JSONB;
  new_record JSONB;
  action_type TEXT;
BEGIN
  -- Determinar el tipo de acción
  IF TG_OP = 'DELETE' THEN
    action_type := 'DELETE';
    old_record := to_jsonb(OLD);
    new_record := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'UPDATE';
    old_record := to_jsonb(OLD);
    new_record := to_jsonb(NEW);
  ELSIF TG_OP = 'INSERT' THEN
    action_type := 'INSERT';
    old_record := NULL;
    new_record := to_jsonb(NEW);
  END IF;

  -- Insertar en audit_logs
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    action_type,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    old_record,
    new_record,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );

  -- Retornar el registro apropiado
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS DE AUDITORÍA PARA TABLAS CRÍTICAS
-- =====================================================

-- Trigger para sales
CREATE TRIGGER audit_sales_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

-- Trigger para expenses
CREATE TRIGGER audit_expenses_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

-- Trigger para inventory_full
CREATE TRIGGER audit_inventory_full_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.inventory_full
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

-- Trigger para inventory_empty
CREATE TRIGGER audit_inventory_empty_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.inventory_empty
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

-- Trigger para truck_arrivals
CREATE TRIGGER audit_truck_arrivals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.truck_arrivals
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

-- Trigger para daily_assignments
CREATE TRIGGER audit_daily_assignments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.daily_assignments
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

-- Trigger para goals
CREATE TRIGGER audit_goals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

-- Trigger para customers
CREATE TRIGGER audit_customers_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- FUNCIONES DE SEGURIDAD ADICIONALES
-- =====================================================

-- Función para verificar si un usuario es jefe
CREATE OR REPLACE FUNCTION is_jefe()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'jefe'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario es vendedor
CREATE OR REPLACE FUNCTION is_vendedor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'vendedor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- POLÍTICAS RLS MEJORADAS
-- =====================================================

-- Política mejorada para sales con validación de rol
DROP POLICY IF EXISTS "Users can view their own sales" ON public.sales;
CREATE POLICY "Users can view their own sales" ON public.sales
  FOR SELECT USING (
    vendor_id = auth.uid() OR is_jefe()
  );

-- Política mejorada para expenses con validación de rol
DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;
CREATE POLICY "Users can view their own expenses" ON public.expenses
  FOR SELECT USING (
    vendor_id = auth.uid() OR is_jefe()
  );

-- Política mejorada para daily_assignments
DROP POLICY IF EXISTS "Users can view their own assignments" ON public.daily_assignments;
CREATE POLICY "Users can view their own assignments" ON public.daily_assignments
  FOR SELECT USING (
    vendor_id = auth.uid() OR is_jefe()
  );

-- Política mejorada para goals
DROP POLICY IF EXISTS "Users can view their own goals" ON public.goals;
CREATE POLICY "Users can view their own goals" ON public.goals
  FOR SELECT USING (
    vendor_id = auth.uid() OR type = 'general' OR is_jefe()
  );

-- =====================================================
-- FUNCIONES DE VALIDACIÓN DE NEGOCIO
-- =====================================================

-- Función para validar que un vendedor no puede asignarse cilindros a sí mismo
CREATE OR REPLACE FUNCTION validate_assignment_not_self()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo el jefe puede crear asignaciones
  IF NOT is_jefe() THEN
    RAISE EXCEPTION 'Solo el jefe puede crear asignaciones';
  END IF;
  
  -- El jefe no puede asignarse cilindros a sí mismo
  IF NEW.vendor_id = auth.uid() THEN
    RAISE EXCEPTION 'El jefe no puede asignarse cilindros a sí mismo';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar asignaciones
CREATE TRIGGER validate_assignment_trigger
  BEFORE INSERT ON public.daily_assignments
  FOR EACH ROW
  EXECUTE FUNCTION validate_assignment_not_self();

-- Función para validar que un vendedor solo puede crear sus propias ventas
CREATE OR REPLACE FUNCTION validate_sale_ownership()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo vendedores pueden crear ventas
  IF NOT is_vendedor() THEN
    RAISE EXCEPTION 'Solo vendedores pueden crear ventas';
  END IF;
  
  -- El vendedor debe ser el propietario de la venta
  IF NEW.vendor_id != auth.uid() THEN
    RAISE EXCEPTION 'No puedes crear ventas para otros vendedores';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar ventas
CREATE TRIGGER validate_sale_ownership_trigger
  BEFORE INSERT ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION validate_sale_ownership();

-- Función para validar que un vendedor solo puede crear sus propios gastos
CREATE OR REPLACE FUNCTION validate_expense_ownership()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo vendedores pueden crear gastos
  IF NOT is_vendedor() THEN
    RAISE EXCEPTION 'Solo vendedores pueden crear gastos';
  END IF;
  
  -- El vendedor debe ser el propietario del gasto
  IF NEW.vendor_id != auth.uid() THEN
    RAISE EXCEPTION 'No puedes crear gastos para otros vendedores';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar gastos
CREATE TRIGGER validate_expense_ownership_trigger
  BEFORE INSERT ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION validate_expense_ownership();

-- =====================================================
-- FUNCIONES DE UTILIDAD PARA AUDITORÍA
-- =====================================================

-- Función para obtener el historial de cambios de un registro
CREATE OR REPLACE FUNCTION get_record_history(
  table_name_param TEXT,
  record_id_param UUID
)
RETURNS TABLE (
  action TEXT,
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.action,
    al.old_values,
    al.new_values,
    al.user_id,
    al.created_at
  FROM public.audit_logs al
  WHERE al.table_name = table_name_param
    AND al.record_id = record_id_param
  ORDER BY al.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas de auditoría
CREATE OR REPLACE FUNCTION get_audit_stats(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  table_name TEXT,
  action TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.table_name,
    al.action,
    COUNT(*) as count
  FROM public.audit_logs al
  WHERE al.created_at BETWEEN start_date AND end_date
  GROUP BY al.table_name, al.action
  ORDER BY al.table_name, al.action;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- POLÍTICAS RLS PARA FUNCIONES DE AUDITORÍA
-- =====================================================

-- Política para get_record_history (solo jefe)
CREATE POLICY "Jefe can view record history" ON public.audit_logs
  FOR SELECT USING (is_jefe());

-- Política para get_audit_stats (solo jefe)
-- Esta función no necesita política RLS ya que es SECURITY DEFINER

-- =====================================================
-- FUNCIONES DE LIMPIEZA DE AUDITORÍA
-- =====================================================

-- Función para limpiar logs de auditoría antiguos (solo jefe)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(
  days_to_keep INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Solo el jefe puede ejecutar esta función
  IF NOT is_jefe() THEN
    RAISE EXCEPTION 'Solo el jefe puede limpiar logs de auditoría';
  END IF;
  
  -- Eliminar logs más antiguos que el período especificado
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ÍNDICES ADICIONALES PARA AUDITORÍA
-- =====================================================

-- Índice compuesto para consultas de auditoría por tabla y fecha
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_date 
ON public.audit_logs(table_name, created_at DESC);

-- Índice para consultas por usuario
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date 
ON public.audit_logs(user_id, created_at DESC);

-- Índice para consultas por acción
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_date 
ON public.audit_logs(action, created_at DESC);

-- =====================================================
-- COMENTARIOS EN TABLAS Y FUNCIONES
-- =====================================================

COMMENT ON FUNCTION audit_trigger_function() IS 'Función trigger para registrar cambios en tablas críticas';
COMMENT ON FUNCTION is_jefe() IS 'Verifica si el usuario actual es jefe';
COMMENT ON FUNCTION is_vendedor() IS 'Verifica si el usuario actual es vendedor';
COMMENT ON FUNCTION get_user_role() IS 'Obtiene el rol del usuario actual';
COMMENT ON FUNCTION get_record_history(TEXT, UUID) IS 'Obtiene el historial de cambios de un registro específico';
COMMENT ON FUNCTION get_audit_stats(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) IS 'Obtiene estadísticas de auditoría en un rango de fechas';
COMMENT ON FUNCTION cleanup_old_audit_logs(INTEGER) IS 'Limpia logs de auditoría antiguos (solo jefe)';

COMMENT ON TABLE public.audit_logs IS 'Registro de auditoría para todas las operaciones críticas del sistema';
COMMENT ON COLUMN public.audit_logs.user_id IS 'ID del usuario que realizó la acción';
COMMENT ON COLUMN public.audit_logs.action IS 'Tipo de acción: INSERT, UPDATE, DELETE';
COMMENT ON COLUMN public.audit_logs.table_name IS 'Nombre de la tabla afectada';
COMMENT ON COLUMN public.audit_logs.record_id IS 'ID del registro afectado';
COMMENT ON COLUMN public.audit_logs.old_values IS 'Valores anteriores (para UPDATE y DELETE)';
COMMENT ON COLUMN public.audit_logs.new_values IS 'Valores nuevos (para INSERT y UPDATE)';
COMMENT ON COLUMN public.audit_logs.ip_address IS 'Dirección IP del usuario';
COMMENT ON COLUMN public.audit_logs.user_agent IS 'User agent del navegador';
