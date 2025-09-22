-- Actualizar clientes de prueba con precios personalizados más realistas
UPDATE customers SET custom_prices = '{\
33lb\: 25.50, \40lb\: 30.00, \100lb\: 45.00}' WHERE name = 'Juan Pérez';
UPDATE customers SET custom_prices = '{\33lb\: 24.00, \40lb\: 28.50, \100lb\: 42.00}' WHERE name = 'María García';
UPDATE customers SET custom_prices = '{\33lb\: 26.00, \40lb\: 31.00, \100lb\: 46.00}' WHERE name = 'Carlos López';
UPDATE customers SET custom_prices = '{\33lb\: 25.00, \40lb\: 29.50, \100lb\: 44.00}' WHERE name = 'Ana Martínez';
UPDATE customers SET custom_prices = '{\33lb\: 27.00, \40lb\: 32.00, \100lb\: 47.00}' WHERE name = 'Pedro Rodríguez';

-- Verificar que se actualizaron correctamente
SELECT name, custom_prices FROM customers ORDER BY name;
