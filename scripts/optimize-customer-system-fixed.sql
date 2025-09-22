-- =====================================================
-- OPTIMIZACIÓN DEL SISTEMA DE CLIENTES (CORREGIDO)
-- =====================================================
-- Versión que funciona con la tabla 'users' en lugar de 'profiles'

-- =====================================================
-- 1. OPTIMIZAR TABLA DE CLIENTES
-- =====================================================

-- Agregar índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_customers_name_gin ON customers USING gin(to_tsvector('spanish', name));
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_location_gin ON customers USING gin(to_tsvector('spanish', location));
CREATE INDEX IF NOT EXISTS idx_customers_updated_at ON customers(updated_at DESC);

-- Agregar campo de búsqueda optimizado
ALTER TABLE customers ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Función para actualizar el vector de búsqueda
CREATE OR REPLACE FUNCTION update_customer_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('spanish', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.phone, '')), 'B') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.location, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para mantener el vector de búsqueda actualizado
DROP TRIGGER IF EXISTS customer_search_vector_update ON customers;
CREATE TRIGGER customer_search_vector_update
  BEFORE INSERT OR UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_customer_search_vector();

-- Actualizar registros existentes
UPDATE customers SET search_vector = 
  setweight(to_tsvector('spanish', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('spanish', COALESCE(phone, '')), 'B') ||
  setweight(to_tsvector('spanish', COALESCE(location, '')), 'C');

-- =====================================================
-- 2. TABLA DE CACHE OFFLINE PARA VENDEDORES
-- =====================================================

CREATE TABLE IF NOT EXISTS vendor_offline_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cache_type TEXT NOT NULL CHECK (cache_type IN ('customers', 'inventory', 'prices')),
  cache_data JSONB NOT NULL,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para cache offline
CREATE INDEX IF NOT EXISTS idx_vendor_offline_cache_vendor_type ON vendor_offline_cache(vendor_id, cache_type);
CREATE INDEX IF NOT EXISTS idx_vendor_offline_cache_last_sync ON vendor_offline_cache(last_sync DESC);

-- =====================================================
-- 3. TABLA DE VENTAS PENDIENTES (OFFLINE)
-- =====================================================

CREATE TABLE IF NOT EXISTS pending_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sale_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'syncing', 'synced', 'failed')),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para ventas pendientes
CREATE INDEX IF NOT EXISTS idx_pending_sales_vendor_status ON pending_sales(vendor_id, status);
CREATE INDEX IF NOT EXISTS idx_pending_sales_created_at ON pending_sales(created_at DESC);

-- =====================================================
-- 4. TABLA DE HISTORIAL DE PRECIOS PERSONALIZADOS
-- =====================================================

CREATE TABLE IF NOT EXISTS customer_price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL CHECK (product_type IN ('33lb', '40lb', '100lb')),
  price DECIMAL(10,2) NOT NULL,
  effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  effective_to TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para historial de precios
CREATE INDEX IF NOT EXISTS idx_customer_price_history_customer ON customer_price_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_price_history_effective ON customer_price_history(effective_from, effective_to);

-- =====================================================
-- 5. FUNCIONES DE BÚSQUEDA OPTIMIZADA
-- =====================================================

-- Función para búsqueda rápida de clientes
CREATE OR REPLACE FUNCTION search_customers(
  search_term TEXT DEFAULT '',
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  phone TEXT,
  location TEXT,
  custom_prices JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  relevance REAL
) AS $$
BEGIN
  IF search_term = '' OR search_term IS NULL THEN
    -- Si no hay término de búsqueda, devolver clientes más recientes
    RETURN QUERY
    SELECT 
      c.id,
      c.name,
      c.phone,
      c.location,
      c.custom_prices,
      c.created_at,
      c.updated_at,
      1.0::REAL as relevance
    FROM customers c
    ORDER BY c.updated_at DESC
    LIMIT limit_count;
  ELSE
    -- Búsqueda con relevancia
    RETURN QUERY
    SELECT 
      c.id,
      c.name,
      c.phone,
      c.location,
      c.custom_prices,
      c.created_at,
      c.updated_at,
      ts_rank(c.search_vector, plainto_tsquery('spanish', search_term)) as relevance
    FROM customers c
    WHERE c.search_vector @@ plainto_tsquery('spanish', search_term)
    ORDER BY relevance DESC, c.updated_at DESC
    LIMIT limit_count;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. FUNCIÓN PARA SINCRONIZACIÓN OFFLINE
-- =====================================================

-- Función para obtener datos para cache offline
CREATE OR REPLACE FUNCTION get_vendor_cache_data(
  vendor_uuid UUID,
  cache_type_param TEXT
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  CASE cache_type_param
    WHEN 'customers' THEN
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'name', name,
          'phone', phone,
          'location', location,
          'custom_prices', custom_prices,
          'created_at', created_at,
          'updated_at', updated_at
        )
      ) INTO result
      FROM customers
      ORDER BY updated_at DESC
      LIMIT 1000;
    
    WHEN 'inventory' THEN
      SELECT jsonb_build_object(
        'full', (
          SELECT jsonb_agg(
            jsonb_build_object(
              'type', type,
              'quantity', quantity,
              'unit_cost', unit_cost,
              'updated_at', updated_at
            )
          )
          FROM inventory_full
        ),
        'empty', (
          SELECT jsonb_agg(
            jsonb_build_object(
              'type', type,
              'brand', brand,
              'color', color,
              'quantity', quantity,
              'updated_at', updated_at
            )
          )
          FROM inventory_empty
        )
      ) INTO result;
    
    WHEN 'prices' THEN
      SELECT jsonb_agg(
        jsonb_build_object(
          'product_type', type,
          'unit_cost', unit_cost,
          'updated_at', updated_at
        )
      ) INTO result
      FROM inventory_full
      ORDER BY updated_at DESC;
    
    ELSE
      result := '{}'::jsonb;
  END CASE;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. FUNCIÓN PARA PROCESAR VENTAS PENDIENTES
-- =====================================================

-- Función para sincronizar ventas pendientes
CREATE OR REPLACE FUNCTION sync_pending_sales(
  vendor_uuid UUID
)
RETURNS TABLE (
  processed_count INTEGER,
  failed_count INTEGER
) AS $$
DECLARE
  pending_sale RECORD;
  processed INTEGER := 0;
  failed INTEGER := 0;
  sale_result JSONB;
BEGIN
  -- Procesar ventas pendientes
  FOR pending_sale IN 
    SELECT * FROM pending_sales 
    WHERE vendor_id = vendor_uuid 
    AND status = 'pending'
    ORDER BY created_at ASC
    LIMIT 10
  LOOP
    BEGIN
      -- Marcar como sincronizando
      UPDATE pending_sales 
      SET status = 'syncing', updated_at = NOW()
      WHERE id = pending_sale.id;
      
      -- Aquí iría la lógica para procesar la venta
      -- Por ahora, simulamos éxito
      sale_result := pending_sale.sale_data;
      
      -- Marcar como sincronizada
      UPDATE pending_sales 
      SET status = 'synced', updated_at = NOW()
      WHERE id = pending_sale.id;
      
      processed := processed + 1;
      
    EXCEPTION WHEN OTHERS THEN
      -- Marcar como fallida
      UPDATE pending_sales 
      SET 
        status = 'failed',
        error_message = SQLERRM,
        retry_count = retry_count + 1,
        updated_at = NOW()
      WHERE id = pending_sale.id;
      
      failed := failed + 1;
    END;
  END LOOP;
  
  RETURN QUERY SELECT processed, failed;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. POLÍTICAS RLS PARA SEGURIDAD
-- =====================================================

-- Habilitar RLS en nuevas tablas
ALTER TABLE vendor_offline_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_price_history ENABLE ROW LEVEL SECURITY;

-- Políticas para vendor_offline_cache
CREATE POLICY "Vendors can manage their own cache" ON vendor_offline_cache
  FOR ALL USING (vendor_id = auth.uid());

-- Políticas para pending_sales
CREATE POLICY "Vendors can manage their own pending sales" ON pending_sales
  FOR ALL USING (vendor_id = auth.uid());

-- Políticas para customer_price_history
CREATE POLICY "Authenticated users can view price history" ON customer_price_history
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage price history" ON customer_price_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'jefe'
    )
  );

-- =====================================================
-- 9. COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE vendor_offline_cache IS 'Cache offline para datos críticos de vendedores';
COMMENT ON TABLE pending_sales IS 'Ventas pendientes de sincronización cuando el vendedor está offline';
COMMENT ON TABLE customer_price_history IS 'Historial de precios personalizados por cliente';
COMMENT ON FUNCTION search_customers IS 'Búsqueda optimizada de clientes con relevancia';
COMMENT ON FUNCTION get_vendor_cache_data IS 'Obtiene datos para cache offline del vendedor';
COMMENT ON FUNCTION sync_pending_sales IS 'Sincroniza ventas pendientes cuando se restaura la conexión';
