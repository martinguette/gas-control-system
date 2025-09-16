-- =====================================================
-- DATOS FICTICIOS PARA TESTING DEL SISTEMA DE GAS
-- =====================================================

-- =====================================================
-- 1. USUARIOS DE PRUEBA
-- =====================================================

-- Insertar usuarios de prueba (jefe y vendedores)
INSERT INTO users (id, email, password_hash, role, name, phone, is_active) VALUES
-- Jefe (Admin)
('11111111-1111-1111-1111-111111111111', 'jefe@gascontrol.com', '$2a$10$example_hash_jefe', 'jefe', 'Carlos Mendoza', '+57 300 123 4567', true),

-- Vendedores
('22222222-2222-2222-2222-222222222222', 'vendedor1@gascontrol.com', '$2a$10$example_hash_vend1', 'vendedor', 'María González', '+57 300 234 5678', true),
('33333333-3333-3333-3333-333333333333', 'vendedor2@gascontrol.com', '$2a$10$example_hash_vend2', 'vendedor', 'José Rodríguez', '+57 300 345 6789', true),
('44444444-4444-4444-4444-444444444444', 'vendedor3@gascontrol.com', '$2a$10$example_hash_vend3', 'vendedor', 'Ana López', '+57 300 456 7890', true);

-- =====================================================
-- 2. INVENTARIO DE CILINDROS LLENOS (SOLO ROSCOGAS)
-- =====================================================

INSERT INTO inventory_full (type, quantity, unit_cost, last_updated_by) VALUES
-- Cilindros de 15kg (33lb) - Precio base: $25,000
('33lb', 50, 25000.00, '11111111-1111-1111-1111-111111111111'),

-- Cilindros de 18kg (40lb) - Precio base: $30,000
('40lb', 30, 30000.00, '11111111-1111-1111-1111-111111111111'),

-- Cilindros de 45kg (100lb) - Precio base: $70,000
('100lb', 20, 70000.00, '11111111-1111-1111-1111-111111111111');

-- =====================================================
-- 3. INVENTARIO DE CILINDROS VACÍOS (TODAS LAS MARCAS)
-- =====================================================

INSERT INTO inventory_empty (type, brand, color, quantity) VALUES
-- Cilindros Roscogas (Naranja)
('33lb', 'Roscogas', 'Naranja', 25),
('40lb', 'Roscogas', 'Naranja', 15),
('100lb', 'Roscogas', 'Naranja', 10),

-- Cilindros Gasan (Azul)
('33lb', 'Gasan', 'Azul', 20),
('40lb', 'Gasan', 'Azul', 12),
('100lb', 'Gasan', 'Azul', 8),

-- Cilindros Gaspais (Verde Oscuro)
('33lb', 'Gaspais', 'Verde Oscuro', 18),
('40lb', 'Gaspais', 'Verde Oscuro', 10),
('100lb', 'Gaspais', 'Verde Oscuro', 6),

-- Cilindros Vidagas (Verde Claro)
('33lb', 'Vidagas', 'Verde Claro', 15),
('40lb', 'Vidagas', 'Verde Claro', 8),
('100lb', 'Vidagas', 'Verde Claro', 5);

-- =====================================================
-- 4. CLIENTES CON PRECIOS PERSONALIZADOS
-- =====================================================

INSERT INTO customers (id, name, phone, location, custom_prices, is_active) VALUES
-- Cliente VIP con precios especiales
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Restaurante El Buen Sabor', '+57 300 111 1111', 'Calle 80 #12-34, Bogotá', 
 '{"33lb": 22000, "40lb": 26000, "100lb": 60000}', true),

-- Cliente regular con precios estándar
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Doña Carmen', '+57 300 222 2222', 'Carrera 15 #45-67, Bogotá', 
 '{"33lb": 25000, "40lb": 30000, "100lb": 70000}', true),

-- Cliente con descuento por volumen
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Panadería San José', '+57 300 333 3333', 'Avenida 68 #23-45, Bogotá', 
 '{"33lb": 23000, "40lb": 28000, "100lb": 65000}', true),

-- Cliente nuevo sin precios personalizados
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Cafetería La Esquina', '+57 300 444 4444', 'Calle 100 #56-78, Bogotá', 
 '{}', true),

-- Cliente con precios premium
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Hotel Plaza Mayor', '+57 300 555 5555', 'Carrera 7 #32-10, Bogotá', 
 '{"33lb": 28000, "40lb": 35000, "100lb": 80000}', true),

-- Cliente residencial
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Familia Martínez', '+57 300 666 6666', 'Calle 127 #15-20, Bogotá', 
 '{"33lb": 25000, "40lb": 30000, "100lb": 70000}', true),

-- Cliente comercial pequeño
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'Taller Mecánico El Motor', '+57 300 777 7777', 'Carrera 50 #25-30, Bogotá', 
 '{"33lb": 24000, "40lb": 29000, "100lb": 68000}', true),

-- Cliente con precios especiales para 100lb
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Industria Textil ABC', '+57 300 888 8888', 'Zona Industrial, Bogotá', 
 '{"33lb": 25000, "40lb": 30000, "100lb": 65000}', true);

-- =====================================================
-- 5. VENTAS DE PRUEBA (ÚLTIMOS 7 DÍAS)
-- =====================================================

-- Ventas de ayer
INSERT INTO sales (id, vendor_id, customer_id, customer_name, customer_phone, customer_location, sale_type, payment_method, total_amount, status, created_at) VALUES
-- Venta 1: Intercambio de 2 cilindros de 33lb
('sale-001-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Restaurante El Buen Sabor', '+57 300 111 1111', 'Calle 80 #12-34, Bogotá', 'intercambio', 'efectivo', 44000.00, 'completed', NOW() - INTERVAL '1 day'),

-- Venta 2: Venta completa de 1 cilindro de 40lb
('sale-002-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Doña Carmen', '+57 300 222 2222', 'Carrera 15 #45-67, Bogotá', 'completa', 'transferencia', 30000.00, 'completed', NOW() - INTERVAL '1 day'),

-- Venta 3: Intercambio de 1 cilindro de 100lb
('sale-003-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Panadería San José', '+57 300 333 3333', 'Avenida 68 #23-45, Bogotá', 'intercambio', 'credito', 65000.00, 'completed', NOW() - INTERVAL '1 day');

-- Items de las ventas
INSERT INTO sale_items (sale_id, product_type, quantity, unit_cost, total_cost) VALUES
-- Items de la venta 1
('sale-001-1111-1111-1111-111111111111', '33lb', 2, 22000.00, 44000.00),

-- Items de la venta 2
('sale-002-2222-2222-2222-222222222222', '40lb', 1, 30000.00, 30000.00),

-- Items de la venta 3
('sale-003-3333-3333-3333-333333333333', '100lb', 1, 65000.00, 65000.00);

-- =====================================================
-- 6. GASTOS DE PRUEBA
-- =====================================================

INSERT INTO expenses (id, vendor_id, type, amount, description, status, created_at) VALUES
-- Gastos de ayer
('exp-001-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'gasolina', 50000.00, 'Gasolina para ruta del día', 'approved', NOW() - INTERVAL '1 day'),
('exp-002-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'comida', 15000.00, 'Almuerzo durante la ruta', 'approved', NOW() - INTERVAL '1 day'),
('exp-003-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'reparaciones', 80000.00, 'Reparación de vehículo', 'pending', NOW() - INTERVAL '1 day');

-- =====================================================
-- 7. LLEGADAS DE CAMIÓN (ÚLTIMOS 30 DÍAS)
-- =====================================================

INSERT INTO truck_arrivals (id, cylinders_received, cylinders_delivered, unit_cost, total_invoice, freight_cost, created_by, created_at) VALUES
-- Llegada de hace 5 días
('truck-001-1111-1111-1111-111111111111', 
 '{"33lb": 100, "40lb": 50, "100lb": 30}', 
 '[{"type": "33lb", "brand": "Roscogas", "color": "Naranja", "quantity": 20}, {"type": "40lb", "brand": "Gasan", "color": "Azul", "quantity": 15}]',
 20000.00, 3500000.00, 150000.00, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '5 days'),

-- Llegada de hace 10 días
('truck-002-2222-2222-2222-222222222222', 
 '{"33lb": 80, "40lb": 40, "100lb": 25}', 
 '[{"type": "33lb", "brand": "Gaspais", "color": "Verde Oscuro", "quantity": 25}, {"type": "100lb", "brand": "Vidagas", "color": "Verde Claro", "quantity": 10}]',
 21000.00, 2800000.00, 120000.00, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '10 days');

-- =====================================================
-- 8. ASIGNACIONES DIARIAS (ÚLTIMOS 7 DÍAS)
-- =====================================================

INSERT INTO daily_assignments (id, vendor_id, date, assigned_cylinders, status, created_at) VALUES
-- Asignaciones de ayer
('assign-001-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', CURRENT_DATE - INTERVAL '1 day', '{"33lb": 10, "40lb": 5, "100lb": 2}', 'completed', NOW() - INTERVAL '1 day'),
('assign-002-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', CURRENT_DATE - INTERVAL '1 day', '{"33lb": 8, "40lb": 4, "100lb": 1}', 'completed', NOW() - INTERVAL '1 day'),
('assign-003-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', CURRENT_DATE - INTERVAL '1 day', '{"33lb": 12, "40lb": 6, "100lb": 3}', 'completed', NOW() - INTERVAL '1 day');

-- =====================================================
-- 9. METAS DEL NEGOCIO
-- =====================================================

INSERT INTO business_goals (id, period, period_value, target_kg, target_sales, target_margin, is_active, created_at) VALUES
-- Meta semanal
('goal-week-1111-1111-1111-111111111111', 'weekly', 2024, 500, 15000000.00, 3000000.00, true, NOW()),

-- Meta mensual
('goal-month-2222-2222-2222-222222222222', 'monthly', 2024, 2000, 60000000.00, 12000000.00, true, NOW()),

-- Meta anual
('goal-year-3333-3333-3333-333333333333', 'yearly', 2024, 24000, 720000000.00, 144000000.00, true, NOW());

-- =====================================================
-- 10. METAS INDIVIDUALES POR VENDEDOR
-- =====================================================

INSERT INTO vendor_goals (id, vendor_id, period, period_value, target_kg, target_sales, target_margin, is_active, created_at) VALUES
-- Metas semanales por vendedor
('vgoal-001-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'weekly', 2024, 150, 4500000.00, 900000.00, true, NOW()),
('vgoal-002-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'weekly', 2024, 120, 3600000.00, 720000.00, true, NOW()),
('vgoal-003-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'weekly', 2024, 180, 5400000.00, 1080000.00, true, NOW());

-- =====================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- =====================================================

-- Mostrar resumen de datos insertados
SELECT 'Usuarios' as tabla, COUNT(*) as cantidad FROM users
UNION ALL
SELECT 'Inventario Lleno', COUNT(*) FROM inventory_full
UNION ALL
SELECT 'Inventario Vacío', COUNT(*) FROM inventory_empty
UNION ALL
SELECT 'Clientes', COUNT(*) FROM customers
UNION ALL
SELECT 'Ventas', COUNT(*) FROM sales
UNION ALL
SELECT 'Items de Ventas', COUNT(*) FROM sale_items
UNION ALL
SELECT 'Gastos', COUNT(*) FROM expenses
UNION ALL
SELECT 'Llegadas de Camión', COUNT(*) FROM truck_arrivals
UNION ALL
SELECT 'Asignaciones Diarias', COUNT(*) FROM daily_assignments
UNION ALL
SELECT 'Metas del Negocio', COUNT(*) FROM business_goals
UNION ALL
SELECT 'Metas de Vendedores', COUNT(*) FROM vendor_goals;

-- Mostrar inventario actual
SELECT 'INVENTARIO ACTUAL' as seccion;
SELECT type, quantity, unit_cost FROM inventory_full ORDER BY type;
SELECT type, brand, color, quantity FROM inventory_empty ORDER BY type, brand;

-- Mostrar clientes con precios personalizados
SELECT 'CLIENTES CON PRECIOS PERSONALIZADOS' as seccion;
SELECT name, phone, location, custom_prices FROM customers WHERE custom_prices != '{}' ORDER BY name;
