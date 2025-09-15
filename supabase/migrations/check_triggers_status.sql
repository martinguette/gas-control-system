-- Verificar el estado actual de los triggers de validación
-- Este script verifica si los triggers ya están creados y funcionando

-- 1. Verificar triggers existentes
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement,
  trigger_schema
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name IN (
    'validate_sale_ownership_trigger',
    'validate_expense_ownership_trigger', 
    'validate_assignment_trigger'
  )
ORDER BY trigger_name;

-- 2. Verificar si las funciones existen
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'validate_sale_ownership',
    'validate_expense_ownership',
    'validate_assignment_not_self'
  )
ORDER BY routine_name;

-- 3. Contar total de triggers en el sistema
SELECT 
  COUNT(*) as total_triggers,
  COUNT(CASE WHEN trigger_name LIKE 'validate_%' THEN 1 END) as validation_triggers
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
