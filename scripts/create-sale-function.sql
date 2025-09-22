-- =====================================================
-- CREAR FUNCIÓN PARA REGISTRAR VENTAS
-- =====================================================

-- Función para crear venta con múltiples items
CREATE OR REPLACE FUNCTION create_sale_with_items(
  p_vendor_id UUID,
  p_customer_name TEXT,
  p_sale_type TEXT,
  p_payment_method TEXT,
  p_items JSONB,
  p_customer_phone TEXT DEFAULT NULL,
  p_customer_location TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sale_id UUID;
  item JSONB;
  total_amount DECIMAL(10,2) := 0;
  item_total DECIMAL(10,2);
BEGIN
  -- Calcular el total de la venta
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    item_total := (item->>'unit_cost')::DECIMAL * (item->>'quantity')::INTEGER;
    total_amount := total_amount + item_total;
  END LOOP;

  -- Insertar la venta principal
  INSERT INTO sales (
    vendor_id,
    customer_name,
    customer_phone,
    customer_location,
    sale_type,
    payment_method,
    total_amount,
    created_at,
    updated_at
  ) VALUES (
    p_vendor_id,
    p_customer_name,
    p_customer_phone,
    p_customer_location,
    p_sale_type,
    p_payment_method,
    total_amount,
    NOW(),
    NOW()
  ) RETURNING id INTO sale_id;

  -- Insertar los items de la venta
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO sale_items (
      sale_id,
      product_type,
      quantity,
      unit_cost,
      total_cost,
      created_at
    ) VALUES (
      sale_id,
      item->>'product_type',
      (item->>'quantity')::INTEGER,
      (item->>'unit_cost')::DECIMAL,
      (item->>'total_cost')::DECIMAL,
      NOW()
    );
  END LOOP;

  RETURN sale_id;
END;
$$;

-- Comentario de la función
COMMENT ON FUNCTION create_sale_with_items IS 'Crea una venta con múltiples items y calcula el total automáticamente';
