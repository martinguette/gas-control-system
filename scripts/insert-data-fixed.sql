-- =====================================================
-- DATOS DE PRUEBA CORREGIDOS PARA SUPABASE AUTH
-- =====================================================

-- IMPORTANTE: 
-- 1. Primero ejecuta: scripts/fix-users-table.sql para corregir la tabla
-- 2. Luego ejecuta este script

-- =====================================================
-- 1. INSERTAR USUARIOS (SIN PASSWORD_HASH - USA SUPABASE AUTH)
-- =====================================================

-- REEMPLAZA ESTOS UUIDs CON LOS REALES DE TUS USUARIOS AUTENTICADOS
-- Para obtenerlos, ejecuta: scripts/get-auth-users.sql

INSERT INTO users (id, email, role, name, phone, is_active) VALUES
-- Jefe (reemplaza con UUID real del jefe)
('11111111-1111-1111-1111-111111111111', 'jefe@gascontrol.com', 'jefe', 'Carlos Mendoza', '+57 300 123 4567', true),

-- Vendedores (reemplaza con UUIDs reales de vendedores)
('22222222-2222-2222-2222-222222222222', 'vendedor1@gascontrol.com', 'vendedor', 'María González', '+57 300 234 5678', true),
('33333333-3333-3333-3333-333333333333', 'vendedor2@gascontrol.com', 'vendedor', 'José Rodríguez', '+57 300 345 6789', true),
('44444444-4444-4444-4444-444444444444', 'vendedor3@gascontrol.com', 'vendedor', 'Ana López', '+57 300 456 7890', true)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- =====================================================
-- 2. INVENTARIO DE CILINDROS LLENOS (SOLO ROSCOGAS)
-- =====================================================

INSERT INTO inventory_full (type, quantity, unit_cost, last_updated_by) VALUES
-- Cilindros de 15kg (33lb) - Precio base: $25,000
('33lb', 50, 25000.00, '11111111-1111-1111-1111-111111111111'),

-- Cilindros de 18kg (40lb) - Precio base: $30,000
('40lb', 30, 30000.00, '11111111-1111-1111-1111-111111111111'),

-- Cilindros de 45kg (100lb) - Precio base: $70,000
('100lb', 20, 70000.00, '11111111-1111-1111-1111-111111111111')
ON CONFLICT (type) DO UPDATE SET
    quantity = EXCLUDED.quantity,
    unit_cost = EXCLUDED.unit_cost,
    last_updated_by = EXCLUDED.last_updated_by,
    updated_at = NOW();

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
('100lb', 'Vidagas', 'Verde Claro', 5)
ON CONFLICT (type, brand, color) DO UPDATE SET
    quantity = EXCLUDED.quantity,
    updated_at = NOW();

-- =====================================================
-- 4. CLIENTES CON PRECIOS PERSONALIZADOS
-- =====================================================

INSERT INTO customers (name, phone, location, custom_prices) VALUES
-- Cliente VIP con precios especiales
('Restaurante El Buen Sabor', '+57 300 111 1111', 'Carrera 15 #85-20, Bogotá', 
 '{"33lb": 28000, "40lb": 33000, "100lb": 75000}'),

-- Cliente con precios estándar
('Hogar Familiar García', '+57 300 222 2222', 'Calle 80 #12-45, Bogotá', 
 '{"33lb": 25000, "40lb": 30000, "100lb": 70000}'),

-- Cliente con descuento
('Taller Mecánico El Motor', '+57 300 333 3333', 'Carrera 50 #25-30, Bogotá', 
 '{"33lb": 23000, "40lb": 28000, "100lb": 68000}'),

-- Cliente premium
('Hotel Plaza Mayor', '+57 300 444 4444', 'Avenida 68 #25-47, Bogotá', 
 '{"33lb": 30000, "40lb": 35000, "100lb": 80000}'),

-- Cliente residencial
('Familia Rodríguez', '+57 300 555 5555', 'Calle 127 #15-80, Bogotá', 
 '{"33lb": 25000, "40lb": 30000, "100lb": 70000}'),

-- Cliente comercial
('Panadería La Esperanza', '+57 300 666 6666', 'Carrera 7 #32-10, Bogotá', 
 '{"33lb": 26000, "40lb": 31000, "100lb": 72000}'),

-- Cliente industrial
('Fábrica Textil Moderna', '+57 300 777 7777', 'Zona Industrial, Bogotá', 
 '{"33lb": 24000, "40lb": 29000, "100lb": 69000}'),

-- Cliente nuevo
('Cafetería El Aroma', '+57 300 888 8888', 'Calle 93 #14-25, Bogotá', 
 '{"33lb": 27000, "40lb": 32000, "100lb": 74000}')
ON CONFLICT (name, phone) DO UPDATE SET
    location = EXCLUDED.location,
    custom_prices = EXCLUDED.custom_prices,
    updated_at = NOW();

-- =====================================================
-- 5. VENTAS DE EJEMPLO
-- =====================================================

-- Venta 1: Intercambio (cliente devuelve vacío, recibe lleno)
INSERT INTO sales (customer_id, vendor_id, total_amount, payment_method, sale_type, created_at) VALUES
(1, '22222222-2222-2222-2222-222222222222', 28000.00, 'efectivo', 'intercambio', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

INSERT INTO sale_items (sale_id, product_type, quantity, unit_cost, total_cost, empty_brand, empty_color) VALUES
(1, '33lb', 1, 28000.00, 28000.00, 'Roscogas', 'Naranja')
ON CONFLICT DO NOTHING;

-- Venta 2: Venta completa (solo lleno)
INSERT INTO sales (customer_id, vendor_id, total_amount, payment_method, sale_type, created_at) VALUES
(2, '33333333-3333-3333-3333-333333333333', 30000.00, 'transferencia', 'completa', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

INSERT INTO sale_items (sale_id, product_type, quantity, unit_cost, total_cost) VALUES
(2, '40lb', 1, 30000.00, 30000.00)
ON CONFLICT DO NOTHING;

-- Venta 3: Venta de vacíos
INSERT INTO sales (customer_id, vendor_id, total_amount, payment_method, sale_type, created_at) VALUES
(3, '22222222-2222-2222-2222-222222222222', 5000.00, 'efectivo', 'venta_vacios', NOW() - INTERVAL '3 hours')
ON CONFLICT DO NOTHING;

INSERT INTO sale_items (sale_id, product_type, quantity, unit_cost, total_cost, empty_brand, empty_color) VALUES
(3, '33lb', 1, 5000.00, 5000.00, 'Gasan', 'Azul')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. GASTOS DE EJEMPLO
-- =====================================================

INSERT INTO expenses (vendor_id, type, amount, description, created_at) VALUES
('22222222-2222-2222-2222-222222222222', 'gasolina', 50000.00, 'Combustible para ruta del día', NOW() - INTERVAL '1 day'),
('33333333-3333-3333-3333-333333333333', 'comida', 15000.00, 'Almuerzo durante ruta', NOW() - INTERVAL '1 day'),
('22222222-2222-2222-2222-222222222222', 'reparaciones', 80000.00, 'Reparación de vehículo', NOW() - INTERVAL '2 days'),
('44444444-4444-4444-4444-444444444444', 'gasolina', 45000.00, 'Combustible para ruta', NOW() - INTERVAL '3 hours')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. LLEGADAS DE CAMIÓN
-- =====================================================

INSERT INTO truck_arrivals (cylinders_received_33lb, cylinders_received_40lb, cylinders_received_100lb, 
                           cylinders_delivered, unit_cost, total_invoice, freight_cost, created_by) VALUES
(100, 50, 30, 
 '[{"brand": "Roscogas", "color": "Naranja", "type": "33lb", "quantity": 25}, {"brand": "Gasan", "color": "Azul", "type": "40lb", "quantity": 15}]',
 25000.00, 4500000.00, 50000.00, '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. METAS DE EJEMPLO
-- =====================================================

INSERT INTO goals (type, period, target_value, current_value, start_date, end_date, created_by) VALUES
('sales', 'monthly', 10000000.00, 150000.00, '2024-01-01', '2024-01-31', '11111111-1111-1111-1111-111111111111'),
('cylinders', 'weekly', 50.00, 3.00, '2024-01-15', '2024-01-21', '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- =====================================================

SELECT 'RESUMEN DE DATOS INSERTADOS:' as info;
SELECT 'Usuarios:' as tabla, COUNT(*) as cantidad FROM users
UNION ALL
SELECT 'Inventario lleno:', COUNT(*) FROM inventory_full
UNION ALL
SELECT 'Inventario vacío:', COUNT(*) FROM inventory_empty
UNION ALL
SELECT 'Clientes:', COUNT(*) FROM customers
UNION ALL
SELECT 'Ventas:', COUNT(*) FROM sales
UNION ALL
SELECT 'Gastos:', COUNT(*) FROM expenses
UNION ALL
SELECT 'Llegadas camión:', COUNT(*) FROM truck_arrivals
UNION ALL
SELECT 'Metas:', COUNT(*) FROM goals;
