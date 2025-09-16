-- =====================================================
-- MIGRACIÓN: Corregir tabla de ventas (versión simplificada)
-- =====================================================
-- Fecha: 2024-12-12
-- Descripción: Agregar campos quantity y unit_cost a la tabla sales
-- =====================================================

-- Agregar nuevas columnas a la tabla sales
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Actualizar registros existentes con valores por defecto
UPDATE sales 
SET quantity = 1, unit_cost = amount_charged 
WHERE quantity IS NULL OR unit_cost IS NULL;

-- Agregar restricciones
ALTER TABLE sales 
ADD CONSTRAINT IF NOT EXISTS sales_quantity_positive CHECK (quantity > 0),
ADD CONSTRAINT IF NOT EXISTS sales_unit_cost_positive CHECK (unit_cost >= 0);

-- Agregar comentarios
COMMENT ON COLUMN sales.quantity IS 'Cantidad de cilindros en la transacción';
COMMENT ON COLUMN sales.unit_cost IS 'Costo unitario por cilindro';

-- Verificar que la migración se aplicó correctamente
DO $$
BEGIN
    -- Verificar que las columnas existen
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales' 
        AND column_name = 'quantity'
    ) THEN
        RAISE EXCEPTION 'La columna quantity no se creó correctamente';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales' 
        AND column_name = 'unit_cost'
    ) THEN
        RAISE EXCEPTION 'La columna unit_cost no se creó correctamente';
    END IF;
    
    RAISE NOTICE 'Migración completada exitosamente: Tabla sales actualizada con quantity y unit_cost';
END $$;
