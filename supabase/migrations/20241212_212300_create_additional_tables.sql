-- =====================================================
-- MIGRACIÓN: 20241212_212300_create_additional_tables.sql
-- DESCRIPCIÓN: Crear tablas adicionales para el sistema de gestión de cilindros
-- VERSIÓN: 1.0
-- FECHA: 2024-12-12
-- =====================================================

-- Esta migración crea todas las tablas adicionales necesarias para el sistema
-- después de que la tabla 'profiles' ya esté creada

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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CLIENTES CON PRECIOS PERSONALIZADOS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  location TEXT NOT NULL,
  custom_prices JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. VENTAS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_location TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('33lb', '40lb', '100lb')),
  sale_type TEXT NOT NULL CHECK (sale_type IN ('intercambio', 'completa', 'venta_vacios', 'compra_vacios')),
  empty_brand TEXT, -- Para intercambios
  empty_color TEXT, -- Para intercambios
  amount_charged DECIMAL(10,2) NOT NULL CHECK (amount_charged >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('efectivo', 'transferencia', 'credito')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. GASTOS OPERATIVOS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('gasolina', 'comida', 'reparaciones', 'imprevistos', 'otros')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  description TEXT NOT NULL,
  receipt_url TEXT, -- URL de la foto del recibo en Supabase Storage
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. LLEGADAS DE CAMIÓN
-- =====================================================
CREATE TABLE IF NOT EXISTS public.truck_arrivals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cylinders_received JSONB NOT NULL DEFAULT '{}', -- {33lb: 10, 40lb: 5, 100lb: 2}
  cylinders_delivered JSONB NOT NULL DEFAULT '{}', -- {brand: {color: quantity}}
  unit_cost DECIMAL(10,2) NOT NULL CHECK (unit_cost >= 0),
  total_invoice DECIMAL(10,2) NOT NULL CHECK (total_invoice >= 0),
  freight_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (freight_cost >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. ASIGNACIONES DIARIAS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.daily_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  assigned_cylinders JSONB NOT NULL DEFAULT '{}', -- {33lb: 5, 40lb: 3, 100lb: 1}
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. SISTEMA DE METAS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('general', 'individual')),
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL para metas generales
  period TEXT NOT NULL CHECK (period IN ('semanal', 'mensual', 'semestral', 'anual')),
  target_kg DECIMAL(10,2) NOT NULL CHECK (target_kg > 0),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. LOG DE AUDITORÍA
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para sales
CREATE INDEX IF NOT EXISTS idx_sales_vendor_id ON public.sales(vendor_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON public.sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_sale_type ON public.sales(sale_type);

-- Índices para expenses
CREATE INDEX IF NOT EXISTS idx_expenses_vendor_id ON public.expenses(vendor_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses(created_at);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);

-- Índices para daily_assignments
CREATE INDEX IF NOT EXISTS idx_daily_assignments_vendor_id ON public.daily_assignments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_daily_assignments_date ON public.daily_assignments(date);

-- Índices para goals
CREATE INDEX IF NOT EXISTS idx_goals_vendor_id ON public.goals(vendor_id);
CREATE INDEX IF NOT EXISTS idx_goals_period ON public.goals(period);
CREATE INDEX IF NOT EXISTS idx_goals_start_date ON public.goals(start_date);

-- Índices para audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);

-- =====================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =====================================================

-- Trigger para inventory_full
CREATE TRIGGER update_inventory_full_updated_at
  BEFORE UPDATE ON public.inventory_full
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para inventory_empty
CREATE TRIGGER update_inventory_empty_updated_at
  BEFORE UPDATE ON public.inventory_empty
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para customers
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para goals
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.inventory_full ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_empty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truck_arrivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS PARA INVENTARIO (Solo Jefe)
-- =====================================================

-- Políticas para inventory_full
CREATE POLICY "Jefe can manage inventory_full" ON public.inventory_full
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'jefe'
    )
  );

-- Políticas para inventory_empty
CREATE POLICY "Jefe can manage inventory_empty" ON public.inventory_empty
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'jefe'
    )
  );

-- =====================================================
-- POLÍTICAS RLS PARA CLIENTES
-- =====================================================

-- Políticas para customers
CREATE POLICY "Jefe can manage customers" ON public.customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'jefe'
    )
  );

-- =====================================================
-- POLÍTICAS RLS PARA VENTAS
-- =====================================================

-- Políticas para sales
CREATE POLICY "Users can view their own sales" ON public.sales
  FOR SELECT USING (
    vendor_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'jefe'
    )
  );

CREATE POLICY "Vendors can insert their own sales" ON public.sales
  FOR INSERT WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Jefe can update all sales" ON public.sales
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'jefe'
    )
  );

-- =====================================================
-- POLÍTICAS RLS PARA GASTOS
-- =====================================================

-- Políticas para expenses
CREATE POLICY "Users can view their own expenses" ON public.expenses
  FOR SELECT USING (
    vendor_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'jefe'
    )
  );

CREATE POLICY "Vendors can insert their own expenses" ON public.expenses
  FOR INSERT WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Jefe can manage all expenses" ON public.expenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'jefe'
    )
  );

-- =====================================================
-- POLÍTICAS RLS PARA LLEGADAS DE CAMIÓN (Solo Jefe)
-- =====================================================

-- Políticas para truck_arrivals
CREATE POLICY "Jefe can manage truck_arrivals" ON public.truck_arrivals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'jefe'
    )
  );

-- =====================================================
-- POLÍTICAS RLS PARA ASIGNACIONES DIARIAS
-- =====================================================

-- Políticas para daily_assignments
CREATE POLICY "Users can view their own assignments" ON public.daily_assignments
  FOR SELECT USING (
    vendor_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'jefe'
    )
  );

CREATE POLICY "Jefe can manage assignments" ON public.daily_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'jefe'
    )
  );

-- =====================================================
-- POLÍTICAS RLS PARA METAS
-- =====================================================

-- Políticas para goals
CREATE POLICY "Users can view their own goals" ON public.goals
  FOR SELECT USING (
    vendor_id = auth.uid() OR 
    type = 'general' OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'jefe'
    )
  );

CREATE POLICY "Jefe can manage all goals" ON public.goals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'jefe'
    )
  );

-- =====================================================
-- POLÍTICAS RLS PARA AUDIT LOGS (Solo Jefe)
-- =====================================================

-- Políticas para audit_logs
CREATE POLICY "Jefe can view audit_logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'jefe'
    )
  );

-- =====================================================
-- PERMISOS
-- =====================================================

-- Otorgar permisos a usuarios autenticados
GRANT ALL ON public.inventory_full TO authenticated;
GRANT ALL ON public.inventory_empty TO authenticated;
GRANT ALL ON public.customers TO authenticated;
GRANT ALL ON public.sales TO authenticated;
GRANT ALL ON public.expenses TO authenticated;
GRANT ALL ON public.truck_arrivals TO authenticated;
GRANT ALL ON public.daily_assignments TO authenticated;
GRANT ALL ON public.goals TO authenticated;
GRANT ALL ON public.audit_logs TO authenticated;

-- Otorgar permisos al service role
GRANT ALL ON public.inventory_full TO service_role;
GRANT ALL ON public.inventory_empty TO service_role;
GRANT ALL ON public.customers TO service_role;
GRANT ALL ON public.sales TO service_role;
GRANT ALL ON public.expenses TO service_role;
GRANT ALL ON public.truck_arrivals TO service_role;
GRANT ALL ON public.daily_assignments TO service_role;
GRANT ALL ON public.goals TO service_role;
GRANT ALL ON public.audit_logs TO service_role;

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
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNCIONES AUXILIARES
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

-- Función para actualizar inventario después de una venta
CREATE OR REPLACE FUNCTION update_inventory_after_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar inventario según el tipo de venta
  IF NEW.sale_type = 'intercambio' THEN
    -- Restar 1 cilindro lleno
    UPDATE public.inventory_full 
    SET quantity = quantity - 1, updated_at = NOW()
    WHERE type = NEW.product_type;
    
    -- Sumar 1 cilindro vacío
    INSERT INTO public.inventory_empty (type, brand, color, quantity)
    VALUES (NEW.product_type, NEW.empty_brand, NEW.empty_color, 1)
    ON CONFLICT (type, brand, color) 
    DO UPDATE SET quantity = inventory_empty.quantity + 1, updated_at = NOW();
    
  ELSIF NEW.sale_type = 'completa' THEN
    -- Solo restar 1 cilindro lleno
    UPDATE public.inventory_full 
    SET quantity = quantity - 1, updated_at = NOW()
    WHERE type = NEW.product_type;
    
  ELSIF NEW.sale_type = 'venta_vacios' THEN
    -- Restar 1 cilindro vacío
    UPDATE public.inventory_empty 
    SET quantity = quantity - 1, updated_at = NOW()
    WHERE type = NEW.product_type AND brand = NEW.empty_brand AND color = NEW.empty_color;
    
  ELSIF NEW.sale_type = 'compra_vacios' THEN
    -- Sumar 1 cilindro vacío
    INSERT INTO public.inventory_empty (type, brand, color, quantity)
    VALUES (NEW.product_type, NEW.empty_brand, NEW.empty_color, 1)
    ON CONFLICT (type, brand, color) 
    DO UPDATE SET quantity = inventory_empty.quantity + 1, updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar inventario automáticamente
CREATE TRIGGER update_inventory_on_sale
  AFTER INSERT ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_after_sale();

-- =====================================================
-- HABILITAR REALTIME PARA TABLAS CRÍTICAS
-- =====================================================

-- Habilitar realtime para las tablas que necesitan actualización en tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_full;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_empty;
