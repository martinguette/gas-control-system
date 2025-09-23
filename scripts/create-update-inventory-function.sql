-- =====================================================
-- CREAR FUNCIÓN PARA ACTUALIZAR INVENTARIO
-- =====================================================

-- Función para actualizar inventario lleno
CREATE OR REPLACE FUNCTION update_inventory_full(
  p_product_type TEXT,
  p_quantity_change INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Actualizar la cantidad en inventory_full
  UPDATE inventory_full 
  SET 
    quantity = quantity + p_quantity_change,
    updated_at = NOW()
  WHERE type = p_product_type;
  
  -- Verificar si se actualizó correctamente
  IF FOUND THEN
    -- Obtener el registro actualizado
    SELECT json_build_object(
      'success', true,
      'type', type,
      'quantity', quantity,
      'unit_cost', unit_cost,
      'updated_at', updated_at
    ) INTO result
    FROM inventory_full 
    WHERE type = p_product_type;
    
    RETURN result;
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'No se encontró el tipo de producto: ' || p_product_type
    );
  END IF;
END;
$$;

-- Función para actualizar inventario vacío
CREATE OR REPLACE FUNCTION update_inventory_empty(
  p_product_type TEXT,
  p_brand TEXT,
  p_color TEXT,
  p_quantity_change INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Actualizar la cantidad en inventory_empty
  UPDATE inventory_empty 
  SET 
    quantity = quantity + p_quantity_change,
    updated_at = NOW()
  WHERE type = p_product_type 
    AND brand = p_brand 
    AND color = p_color;
  
  -- Verificar si se actualizó correctamente
  IF FOUND THEN
    -- Obtener el registro actualizado
    SELECT json_build_object(
      'success', true,
      'type', type,
      'brand', brand,
      'color', color,
      'quantity', quantity,
      'updated_at', updated_at
    ) INTO result
    FROM inventory_empty 
    WHERE type = p_product_type 
      AND brand = p_brand 
      AND color = p_color;
    
    RETURN result;
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'No se encontró el registro: ' || p_product_type || ' - ' || p_brand || ' - ' || p_color
    );
  END IF;
END;
$$;

-- Verificar que las funciones se crearon correctamente
SELECT 'FUNCIONES CREADAS:' as status;
SELECT proname, prosrc FROM pg_proc WHERE proname IN ('update_inventory_full', 'update_inventory_empty');
