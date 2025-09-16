-- =====================================================
-- MIGRACIÓN: Clientes de prueba
-- =====================================================
-- Fecha: 2024-12-12
-- Descripción: Insertar clientes de ejemplo con precios personalizados
-- =====================================================

-- Insertar clientes de prueba (solo si no existen)
INSERT INTO customers (name, phone, location, custom_prices) 
SELECT * FROM (VALUES
('Juan Pérez', '555-1234', 'Zona Norte', '{"33lb": 25.00, "40lb": 30.00, "100lb": 60.00}'::jsonb),
('María González', '555-5678', 'Zona Sur', '{"33lb": 24.00, "40lb": 29.00, "100lb": 58.00}'::jsonb),
('Carlos Rodríguez', '555-9012', 'Centro', '{"33lb": 26.00, "40lb": 31.00, "100lb": 62.00}'::jsonb),
('Ana Martínez', '555-3456', 'Zona Este', '{"33lb": 23.50, "40lb": 28.50, "100lb": 57.00}'::jsonb),
('Luis Fernández', '555-7890', 'Zona Oeste', '{"33lb": 25.50, "40lb": 30.50, "100lb": 61.00}'::jsonb)
) AS new_customers(name, phone, location, custom_prices)
WHERE NOT EXISTS (
    SELECT 1 FROM customers 
    WHERE customers.name = new_customers.name
);

-- Verificar que se insertaron correctamente
SELECT 
    name, 
    phone, 
    location, 
    custom_prices,
    created_at
FROM customers 
WHERE name IN ('Juan Pérez', 'María González', 'Carlos Rodríguez', 'Ana Martínez', 'Luis Fernández')
ORDER BY name;
