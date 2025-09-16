-- Script SEGURO para limpiar usuarios y datos relacionados
-- Solo elimina las tablas que sabemos que existen

-- 1. Deshabilitar temporalmente las restricciones de clave foránea
SET session_replication_role = replica;

-- 2. Limpiar tablas que sabemos que existen (con verificación)
DO $$
BEGIN
    -- Limpiar inventory_full si existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'inventory_full') THEN
        DELETE FROM inventory_full;
        RAISE NOTICE 'Tabla inventory_full limpiada';
    END IF;
    
    -- Limpiar inventory_empty si existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'inventory_empty') THEN
        DELETE FROM inventory_empty;
        RAISE NOTICE 'Tabla inventory_empty limpiada';
    END IF;
    
    -- Limpiar sales si existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sales') THEN
        DELETE FROM sales;
        RAISE NOTICE 'Tabla sales limpiada';
    END IF;
    
    -- Limpiar expenses si existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'expenses') THEN
        DELETE FROM expenses;
        RAISE NOTICE 'Tabla expenses limpiada';
    END IF;
    
    -- Limpiar customers si existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customers') THEN
        DELETE FROM customers;
        RAISE NOTICE 'Tabla customers limpiada';
    END IF;
    
    -- Limpiar daily_assignments si existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'daily_assignments') THEN
        DELETE FROM daily_assignments;
        RAISE NOTICE 'Tabla daily_assignments limpiada';
    END IF;
    
    -- Limpiar vendor_routes si existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vendor_routes') THEN
        DELETE FROM vendor_routes;
        RAISE NOTICE 'Tabla vendor_routes limpiada';
    END IF;
    
    -- Limpiar price_overrides si existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'price_overrides') THEN
        DELETE FROM price_overrides;
        RAISE NOTICE 'Tabla price_overrides limpiada';
    END IF;
    
    -- Limpiar inventory_alerts si existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'inventory_alerts') THEN
        DELETE FROM inventory_alerts;
        RAISE NOTICE 'Tabla inventory_alerts limpiada';
    END IF;
END $$;

-- 3. Limpiar la tabla de usuarios
DELETE FROM users;

-- 4. Rehabilitar las restricciones de clave foránea
SET session_replication_role = DEFAULT;

-- 5. Verificar que se limpió todo
SELECT 'Users en tabla users:' as info, COUNT(*) as count FROM users;
SELECT 'Limpieza completada exitosamente.' as status;
