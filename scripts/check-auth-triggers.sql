-- Verificar triggers y funciones de autenticación
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- Verificar funciones relacionadas con auth
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name LIKE '%auth%'
ORDER BY routine_name;
