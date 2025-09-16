-- Script para corregir los colores de Roscogas en la base de datos
-- Roscogas debe ser Naranja, no Azul

-- Actualizar todos los registros de Roscogas que tengan color incorrecto
UPDATE public.inventory_empty 
SET color = 'Naranja' 
WHERE brand = 'Roscogas' AND color != 'Naranja';

-- Verificar que se hayan actualizado correctamente
SELECT brand, color, COUNT(*) as count
FROM public.inventory_empty 
WHERE brand = 'Roscogas'
GROUP BY brand, color;

-- Mostrar todos los registros de Roscogas para verificación
SELECT * FROM public.inventory_empty WHERE brand = 'Roscogas' ORDER BY type, color;

