-- =====================================================
-- MIGRACIÓN: 20241212_214000_transaction_functions.sql
-- DESCRIPCIÓN: Funciones RPC para transacciones y actualización de inventario
-- VERSIÓN: 1.0
-- FECHA: 2024-12-12
-- =====================================================

-- Esta migración crea las funciones RPC necesarias para las server actions
-- de transacciones y actualización de inventario

-- =====================================================
-- FUNCIONES RPC PARA ACTUALIZACIÓN DE INVENTARIO
-- =====================================================

-- Función para actualizar inventario de cilindros llenos
CREATE OR REPLACE FUNCTION update_inventory_full(
  p_type TEXT,
  p_quantity_change INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Validar que el tipo sea válido
  IF p_type NOT IN ('33lb', '40lb', '100lb') THEN
    RAISE EXCEPTION 'Tipo de cilindro inválido: %', p_type;
  END IF;

  -- Actualizar la cantidad
  UPDATE public.inventory_full 
  SET 
    quantity = GREATEST(0, quantity + p_quantity_change),
    updated_at = NOW()
  WHERE type = p_type;

  -- Verificar que se actualizó al menos una fila
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontró inventario para el tipo: %', p_type;
  END IF;

  -- Verificar que la cantidad no sea negativa
  IF (SELECT quantity FROM public.inventory_full WHERE type = p_type) < 0 THEN
    RAISE EXCEPTION 'La cantidad de cilindros % no puede ser negativa', p_type;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar inventario de cilindros vacíos
CREATE OR REPLACE FUNCTION update_inventory_empty(
  p_type TEXT,
  p_brand TEXT,
  p_color TEXT,
  p_quantity_change INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Validar que el tipo sea válido
  IF p_type NOT IN ('33lb', '40lb', '100lb') THEN
    RAISE EXCEPTION 'Tipo de cilindro inválido: %', p_type;
  END IF;

  -- Validar que la marca sea válida
  IF p_brand NOT IN ('Roscogas', 'Gasan', 'Gaspais', 'Vidagas') THEN
    RAISE EXCEPTION 'Marca de cilindro inválida: %', p_brand;
  END IF;

  -- Validar que el color sea válido
  IF p_color NOT IN ('Naranja', 'Azul', 'Verde Oscuro', 'Verde Claro') THEN
    RAISE EXCEPTION 'Color de cilindro inválido: %', p_color;
  END IF;

  -- Insertar o actualizar la cantidad
  INSERT INTO public.inventory_empty (type, brand, color, quantity)
  VALUES (p_type, p_brand, p_color, GREATEST(0, p_quantity_change))
  ON CONFLICT (type, brand, color) 
  DO UPDATE SET 
    quantity = GREATEST(0, inventory_empty.quantity + p_quantity_change),
    updated_at = NOW();

  -- Verificar que la cantidad no sea negativa
  IF (SELECT quantity FROM public.inventory_empty WHERE type = p_type AND brand = p_brand AND color = p_color) < 0 THEN
    RAISE EXCEPTION 'La cantidad de cilindros % % % no puede ser negativa', p_type, p_brand, p_color;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIONES RPC PARA CONSULTAS DE TRANSACCIONES
-- =====================================================

-- Función para obtener estadísticas diarias de un vendedor
CREATE OR REPLACE FUNCTION get_vendor_daily_stats(p_vendor_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  total_sales DECIMAL,
  total_expenses DECIMAL,
  daily_margin DECIMAL,
  sales_count BIGINT,
  expenses_count BIGINT,
  cylinders_sold JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH sales_stats AS (
    SELECT 
      COALESCE(SUM(amount_charged), 0) as total_sales,
      COUNT(*) as sales_count,
      COALESCE(
        jsonb_object_agg(
          product_type, 
          COUNT(*) FILTER (WHERE sale_type IN ('intercambio', 'completa'))
        ) FILTER (WHERE COUNT(*) FILTER (WHERE sale_type IN ('intercambio', 'completa')) > 0),
        '{}'::jsonb
      ) as cylinders_sold
    FROM public.sales 
    WHERE vendor_id = p_vendor_id 
      AND DATE(created_at) = p_date
  ),
  expenses_stats AS (
    SELECT 
      COALESCE(SUM(amount), 0) as total_expenses,
      COUNT(*) as expenses_count
    FROM public.expenses 
    WHERE vendor_id = p_vendor_id 
      AND DATE(created_at) = p_date
  )
  SELECT 
    s.total_sales,
    e.total_expenses,
    (s.total_sales - e.total_expenses) as daily_margin,
    s.sales_count,
    e.expenses_count,
    s.cylinders_sold
  FROM sales_stats s, expenses_stats e;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener ventas de un vendedor con paginación
CREATE OR REPLACE FUNCTION get_vendor_sales(
  p_vendor_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  customer_name TEXT,
  customer_phone TEXT,
  customer_location TEXT,
  product_type TEXT,
  sale_type TEXT,
  empty_brand TEXT,
  empty_color TEXT,
  amount_charged DECIMAL,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.customer_name,
    s.customer_phone,
    s.customer_location,
    s.product_type,
    s.sale_type,
    s.empty_brand,
    s.empty_color,
    s.amount_charged,
    s.payment_method,
    s.created_at
  FROM public.sales s
  WHERE s.vendor_id = p_vendor_id
  ORDER BY s.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener gastos de un vendedor con paginación
CREATE OR REPLACE FUNCTION get_vendor_expenses(
  p_vendor_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  amount DECIMAL,
  description TEXT,
  receipt_url TEXT,
  status TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.type,
    e.amount,
    e.description,
    e.receipt_url,
    e.status,
    e.rejection_reason,
    e.created_at
  FROM public.expenses e
  WHERE e.vendor_id = p_vendor_id
  ORDER BY e.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIONES RPC PARA VALIDACIONES
-- =====================================================

-- Función para verificar disponibilidad de inventario
CREATE OR REPLACE FUNCTION check_inventory_availability(
  p_type TEXT,
  p_quantity INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  available_quantity INTEGER;
BEGIN
  -- Validar que el tipo sea válido
  IF p_type NOT IN ('33lb', '40lb', '100lb') THEN
    RAISE EXCEPTION 'Tipo de cilindro inválido: %', p_type;
  END IF;

  -- Obtener la cantidad disponible
  SELECT quantity INTO available_quantity
  FROM public.inventory_full
  WHERE type = p_type;

  -- Retornar si hay suficiente inventario
  RETURN COALESCE(available_quantity, 0) >= p_quantity;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener el inventario disponible por tipo
CREATE OR REPLACE FUNCTION get_available_inventory()
RETURNS TABLE (
  type TEXT,
  available_quantity INTEGER,
  unit_cost DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    if.type,
    if.quantity as available_quantity,
    if.unit_cost
  FROM public.inventory_full if
  WHERE if.quantity > 0
  ORDER BY if.type;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERMISOS PARA LAS FUNCIONES RPC
-- =====================================================

-- Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION update_inventory_full(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_inventory_empty(TEXT, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_vendor_daily_stats(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_vendor_sales(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_vendor_expenses(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_inventory_availability(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_inventory() TO authenticated;

-- Otorgar permisos al service role
GRANT EXECUTE ON FUNCTION update_inventory_full(TEXT, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION update_inventory_empty(TEXT, TEXT, TEXT, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_vendor_daily_stats(UUID, DATE) TO service_role;
GRANT EXECUTE ON FUNCTION get_vendor_sales(UUID, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_vendor_expenses(UUID, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION check_inventory_availability(TEXT, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_available_inventory() TO service_role;

-- =====================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- =====================================================

COMMENT ON FUNCTION update_inventory_full(TEXT, INTEGER) IS 'Actualiza la cantidad de cilindros llenos en inventario';
COMMENT ON FUNCTION update_inventory_empty(TEXT, TEXT, TEXT, INTEGER) IS 'Actualiza la cantidad de cilindros vacíos en inventario';
COMMENT ON FUNCTION get_vendor_daily_stats(UUID, DATE) IS 'Obtiene estadísticas diarias de un vendedor';
COMMENT ON FUNCTION get_vendor_sales(UUID, INTEGER, INTEGER) IS 'Obtiene ventas de un vendedor con paginación';
COMMENT ON FUNCTION get_vendor_expenses(UUID, INTEGER, INTEGER) IS 'Obtiene gastos de un vendedor con paginación';
COMMENT ON FUNCTION check_inventory_availability(TEXT, INTEGER) IS 'Verifica si hay suficiente inventario disponible';
COMMENT ON FUNCTION get_available_inventory() IS 'Obtiene el inventario disponible por tipo';
