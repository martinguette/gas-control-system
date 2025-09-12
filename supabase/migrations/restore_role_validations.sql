-- Restaurar validaciones de roles después de las pruebas
-- Este archivo restaura los triggers de validación que fueron deshabilitados temporalmente

-- 1. Restaurar trigger de validación de ventas
CREATE TRIGGER validate_sale_ownership_trigger
  BEFORE INSERT ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION validate_sale_ownership();

-- 2. Restaurar trigger de validación de gastos
CREATE TRIGGER validate_expense_ownership_trigger
  BEFORE INSERT ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION validate_expense_ownership();

-- 3. Restaurar trigger de validación de asignaciones
CREATE TRIGGER validate_assignment_trigger
  BEFORE INSERT ON public.daily_assignments
  FOR EACH ROW
  EXECUTE FUNCTION validate_assignment_not_self();

-- Verificar que los triggers se crearon correctamente
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name IN (
    'validate_sale_ownership_trigger',
    'validate_expense_ownership_trigger', 
    'validate_assignment_trigger'
  )
ORDER BY trigger_name;
