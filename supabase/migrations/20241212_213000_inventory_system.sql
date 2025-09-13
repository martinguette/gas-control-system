-- =====================================================
-- MIGRACIÓN: SISTEMA DE INVENTARIO
-- =====================================================
-- Esta migración crea el sistema completo de inventario
-- para el manejo de cilindros de gas llenos y vacíos

-- =====================================================
-- 1. INVENTARIO DE CILINDROS LLENOS (Solo Roscogas)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.inventory_full (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('33lb', '40lb', '100lb')),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (unit_cost >= 0),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. INVENTARIO DE CILINDROS VACÍOS (Todas las marcas)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.inventory_empty (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('33lb', '40lb', '100lb')),
  brand TEXT NOT NULL,
  color TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(type, brand, color)
);

-- =====================================================
-- 3. CONFIGURACIÓN DE ALERTAS DE STOCK
-- =====================================================
CREATE TABLE IF NOT EXISTS public.inventory_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('full', 'empty')),
  product_type TEXT NOT NULL CHECK (product_type IN ('33lb', '40lb', '100lb')),
  brand TEXT, -- NULL para cilindros llenos (solo Roscogas)
  color TEXT, -- NULL para cilindros llenos
  min_threshold INTEGER NOT NULL DEFAULT 5 CHECK (min_threshold >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(type, product_type, brand, color)
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para inventory_full
CREATE INDEX IF NOT EXISTS idx_inventory_full_type ON public.inventory_full(type);
CREATE INDEX IF NOT EXISTS idx_inventory_full_updated_at ON public.inventory_full(updated_at);

-- Índices para inventory_empty
CREATE INDEX IF NOT EXISTS idx_inventory_empty_type ON public.inventory_empty(type);
CREATE INDEX IF NOT EXISTS idx_inventory_empty_brand ON public.inventory_empty(brand);
CREATE INDEX IF NOT EXISTS idx_inventory_empty_updated_at ON public.inventory_empty(updated_at);

-- Índices para inventory_alerts
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_type ON public.inventory_alerts(type);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product_type ON public.inventory_alerts(product_type);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_is_active ON public.inventory_alerts(is_active);

-- =====================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =====================================================

-- Trigger para inventory_full (idempotente)
DROP TRIGGER IF EXISTS update_inventory_full_updated_at ON public.inventory_full;
CREATE TRIGGER update_inventory_full_updated_at
  BEFORE UPDATE ON public.inventory_full
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para inventory_empty (idempotente)
DROP TRIGGER IF EXISTS update_inventory_empty_updated_at ON public.inventory_empty;
CREATE TRIGGER update_inventory_empty_updated_at
  BEFORE UPDATE ON public.inventory_empty
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para inventory_alerts (idempotente)
DROP TRIGGER IF EXISTS update_inventory_alerts_updated_at ON public.inventory_alerts;
CREATE TRIGGER update_inventory_alerts_updated_at
  BEFORE UPDATE ON public.inventory_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.inventory_full ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_empty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS PARA INVENTARIO (IDEMPOTENTES)
-- =====================================================

-- Políticas para inventory_full (Solo Jefe puede gestionar)
DROP POLICY IF EXISTS "Jefe can manage inventory_full" ON public.inventory_full;
CREATE POLICY "Jefe can manage inventory_full" ON public.inventory_full
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'jefe'
    )
  );

-- Políticas para inventory_empty (Solo Jefe puede gestionar)
DROP POLICY IF EXISTS "Jefe can manage inventory_empty" ON public.inventory_empty;
CREATE POLICY "Jefe can manage inventory_empty" ON public.inventory_empty
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'jefe'
    )
  );

-- Políticas para inventory_alerts (Solo Jefe puede gestionar)
DROP POLICY IF EXISTS "Jefe can manage inventory_alerts" ON public.inventory_alerts;
CREATE POLICY "Jefe can manage inventory_alerts" ON public.inventory_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'jefe'
    )
  );

-- Políticas de solo lectura para vendedores
DROP POLICY IF EXISTS "Vendors can view inventory_full" ON public.inventory_full;
CREATE POLICY "Vendors can view inventory_full" ON public.inventory_full
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'vendedor'
    )
  );

DROP POLICY IF EXISTS "Vendors can view inventory_empty" ON public.inventory_empty;
CREATE POLICY "Vendors can view inventory_empty" ON public.inventory_empty
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'vendedor'
    )
  );

-- =====================================================
-- PERMISOS
-- =====================================================

-- Otorgar permisos a usuarios autenticados
GRANT ALL ON public.inventory_full TO authenticated;
GRANT ALL ON public.inventory_empty TO authenticated;
GRANT ALL ON public.inventory_alerts TO authenticated;

-- Otorgar permisos al service role
GRANT ALL ON public.inventory_full TO service_role;
GRANT ALL ON public.inventory_empty TO service_role;
GRANT ALL ON public.inventory_alerts TO service_role;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar inventario inicial de cilindros llenos
INSERT INTO public.inventory_full (type, quantity, unit_cost) VALUES
  ('33lb', 0, 0.00),
  ('40lb', 0, 0.00),
  ('100lb', 0, 0.00)
ON CONFLICT DO NOTHING;

-- Insertar inventario inicial de cilindros vacíos
INSERT INTO public.inventory_empty (type, brand, color, quantity) VALUES
  ('33lb', 'Roscogas', 'Azul', 0),
  ('40lb', 'Roscogas', 'Azul', 0),
  ('100lb', 'Roscogas', 'Azul', 0)
ON CONFLICT (type, brand, color) DO NOTHING;

-- Insertar alertas por defecto
INSERT INTO public.inventory_alerts (type, product_type, min_threshold) VALUES
  ('full', '33lb', 5),
  ('full', '40lb', 3),
  ('full', '100lb', 2)
ON CONFLICT (type, product_type, brand, color) DO NOTHING;

-- =====================================================
-- FUNCIONES AUXILIARES PARA INVENTARIO (IDEMPOTENTES)
-- =====================================================

-- Función para convertir libras a kilogramos
CREATE OR REPLACE FUNCTION lbs_to_kg(lbs TEXT)
RETURNS DECIMAL AS $$
BEGIN
  CASE lbs
    WHEN '33lb' THEN RETURN 15.0;
    WHEN '40lb' THEN RETURN 18.0;
    WHEN '100lb' THEN RETURN 45.0;
    ELSE RETURN 0.0;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener el inventario total por tipo
CREATE OR REPLACE FUNCTION get_inventory_summary()
RETURNS TABLE (
  product_type TEXT,
  full_quantity INTEGER,
  full_unit_cost DECIMAL,
  empty_total_quantity INTEGER,
  empty_brands JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    if.type as product_type,
    if.quantity as full_quantity,
    if.unit_cost as full_unit_cost,
    COALESCE(SUM(ie.quantity), 0)::INTEGER as empty_total_quantity,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'brand', ie.brand,
          'color', ie.color,
          'quantity', ie.quantity
        )
      ) FILTER (WHERE ie.id IS NOT NULL),
      '[]'::jsonb
    ) as empty_brands
  FROM public.inventory_full if
  LEFT JOIN public.inventory_empty ie ON if.type = ie.type
  GROUP BY if.type, if.quantity, if.unit_cost
  ORDER BY if.type;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar alertas de stock bajo
CREATE OR REPLACE FUNCTION check_low_stock_alerts()
RETURNS TABLE (
  alert_id UUID,
  alert_type TEXT,
  product_type TEXT,
  brand TEXT,
  color TEXT,
  current_quantity INTEGER,
  min_threshold INTEGER,
  alert_message TEXT
) AS $$
BEGIN
  RETURN QUERY
  -- Alertas para cilindros llenos
  SELECT 
    ia.id as alert_id,
    ia.type as alert_type,
    ia.product_type,
    NULL::TEXT as brand,
    NULL::TEXT as color,
    if.quantity as current_quantity,
    ia.min_threshold,
    CONCAT('Stock bajo de cilindros ', ia.product_type, ' llenos: ', if.quantity, ' (mínimo: ', ia.min_threshold, ')') as alert_message
  FROM public.inventory_alerts ia
  JOIN public.inventory_full if ON ia.product_type = if.type
  WHERE ia.type = 'full' 
    AND ia.is_active = true
    AND if.quantity <= ia.min_threshold
  
  UNION ALL
  
  -- Alertas para cilindros vacíos
  SELECT 
    ia.id as alert_id,
    ia.type as alert_type,
    ia.product_type,
    ia.brand,
    ia.color,
    COALESCE(ie.quantity, 0) as current_quantity,
    ia.min_threshold,
    CONCAT('Stock bajo de cilindros ', ia.product_type, ' vacíos (', ia.brand, ' ', ia.color, '): ', COALESCE(ie.quantity, 0), ' (mínimo: ', ia.min_threshold, ')') as alert_message
  FROM public.inventory_alerts ia
  LEFT JOIN public.inventory_empty ie ON ia.product_type = ie.type 
    AND ia.brand = ie.brand 
    AND ia.color = ie.color
  WHERE ia.type = 'empty' 
    AND ia.is_active = true
    AND COALESCE(ie.quantity, 0) <= ia.min_threshold;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- HABILITAR REALTIME PARA TABLAS DE INVENTARIO (IDEMPOTENTE)
-- =====================================================

-- Habilitar realtime para las tablas de inventario (idempotente)
DO $$
BEGIN
  -- Agregar tablas a la publicación de realtime si no están ya incluidas
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'inventory_full'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_full;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'inventory_empty'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_empty;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'inventory_alerts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_alerts;
  END IF;
END $$;
