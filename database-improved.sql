-- =====================================================
-- SISTEMA DE CONTROL DE GAS - BASE DE DATOS MEJORADA
-- Basado en casos de uso refinados y validaciones críticas
-- =====================================================

-- =====================================================
-- 1. USUARIOS Y AUTENTICACIÓN
-- =====================================================

-- Tabla de usuarios con roles diferenciados
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('jefe', 'vendedor')),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para usuarios
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- =====================================================
-- 2. INVENTARIO DE CILINDROS LLENOS (SOLO ROSCOGAS)
-- =====================================================

CREATE TABLE inventory_full (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(10) NOT NULL CHECK (type IN ('33lb', '40lb', '100lb')),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (unit_cost >= 0),
    last_updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para inventario lleno
CREATE INDEX idx_inventory_full_type ON inventory_full(type);
CREATE INDEX idx_inventory_full_quantity ON inventory_full(quantity);

-- =====================================================
-- 3. INVENTARIO DE CILINDROS VACÍOS (TODAS LAS MARCAS)
-- =====================================================

CREATE TABLE inventory_empty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(10) NOT NULL CHECK (type IN ('33lb', '40lb', '100lb')),
    brand VARCHAR(50) NOT NULL CHECK (brand IN ('Roscogas', 'Gasan', 'Gaspais', 'Vidagas')),
    color VARCHAR(50) NOT NULL CHECK (color IN ('Naranja', 'Azul', 'Verde Oscuro', 'Verde Claro')),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Validar que la combinación marca-color sea correcta
    CONSTRAINT valid_brand_color CHECK (
        (brand = 'Roscogas' AND color = 'Naranja') OR
        (brand = 'Gasan' AND color = 'Azul') OR
        (brand = 'Gaspais' AND color = 'Verde Oscuro') OR
        (brand = 'Vidagas' AND color = 'Verde Claro')
    )
);

-- Índices para inventario vacío
CREATE INDEX idx_inventory_empty_type ON inventory_empty(type);
CREATE INDEX idx_inventory_empty_brand ON inventory_empty(brand);
CREATE INDEX idx_inventory_empty_quantity ON inventory_empty(quantity);

-- =====================================================
-- 4. CLIENTES Y PRECIOS PERSONALIZADOS
-- =====================================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location TEXT,
    custom_prices JSONB, -- Precios personalizados por tipo de cilindro
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para clientes
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_active ON customers(is_active);

-- =====================================================
-- 5. VENTAS (CU-V001: Registrar Venta)
-- =====================================================

CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES users(id),
    customer_id UUID REFERENCES customers(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_location TEXT NOT NULL,
    product_type VARCHAR(10) NOT NULL CHECK (product_type IN ('33lb', '40lb', '100lb')),
    sale_type VARCHAR(20) NOT NULL CHECK (sale_type IN ('intercambio', 'completa', 'venta_vacios', 'compra_vacios')),
    
    -- Para intercambios: marca y color del cilindro vacío recibido
    empty_brand VARCHAR(50) CHECK (empty_brand IN ('Roscogas', 'Gasan', 'Gaspais', 'Vidagas')),
    empty_color VARCHAR(50) CHECK (empty_color IN ('Naranja', 'Azul', 'Verde Oscuro', 'Verde Claro')),
    
    amount_charged DECIMAL(10,2) NOT NULL CHECK (amount_charged >= 0),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('efectivo', 'transferencia', 'credito')),
    
    -- Cálculos automáticos de rentabilidad
    unit_cost_at_sale DECIMAL(10,2), -- Precio de compra al momento de la venta
    gross_profit DECIMAL(10,2), -- amount_charged - unit_cost_at_sale
    net_profit DECIMAL(10,2), -- gross_profit - operational_expenses
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Validar que para intercambios se especifique marca y color
    CONSTRAINT valid_intercambio CHECK (
        (sale_type != 'intercambio') OR 
        (empty_brand IS NOT NULL AND empty_color IS NOT NULL)
    )
);

-- Índices para ventas
CREATE INDEX idx_sales_vendor_id ON sales(vendor_id);
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sales_sale_type ON sales(sale_type);
CREATE INDEX idx_sales_product_type ON sales(product_type);

-- =====================================================
-- 6. GASTOS (CU-V002: Registrar Gasto)
-- =====================================================

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('gasolina', 'comida', 'reparaciones', 'imprevistos', 'otros')),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    receipt_url TEXT, -- URL del comprobante si se sube
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para gastos
CREATE INDEX idx_expenses_vendor_id ON expenses(vendor_id);
CREATE INDEX idx_expenses_type ON expenses(type);
CREATE INDEX idx_expenses_created_at ON expenses(created_at);

-- =====================================================
-- 7. LLEGADAS DE CAMIÓN (CU-J004: Registrar Llegada)
-- =====================================================

CREATE TABLE truck_arrivals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cylinders_received JSONB NOT NULL, -- {33lb: X, 40lb: Y, 100lb: Z}
    cylinders_delivered JSONB NOT NULL, -- [{brand, color, type, quantity}, ...]
    unit_cost DECIMAL(10,2) NOT NULL CHECK (unit_cost > 0),
    total_invoice DECIMAL(10,2) NOT NULL CHECK (total_invoice > 0),
    freight_cost DECIMAL(10,2) DEFAULT 0.00 CHECK (freight_cost >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

-- Índices para llegadas de camión
CREATE INDEX idx_truck_arrivals_created_at ON truck_arrivals(created_at);
CREATE INDEX idx_truck_arrivals_created_by ON truck_arrivals(created_by);

-- =====================================================
-- 8. ASIGNACIONES DIARIAS (CU-J002: Asignar Cilindros)
-- =====================================================

CREATE TABLE daily_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES users(id),
    date DATE NOT NULL,
    assigned_cylinders JSONB NOT NULL, -- {33lb: X, 40lb: Y, 100lb: Z}
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    
    -- Un vendedor solo puede tener una asignación por día
    UNIQUE(vendor_id, date)
);

-- Índices para asignaciones diarias
CREATE INDEX idx_daily_assignments_vendor_id ON daily_assignments(vendor_id);
CREATE INDEX idx_daily_assignments_date ON daily_assignments(date);
CREATE INDEX idx_daily_assignments_status ON daily_assignments(status);

-- =====================================================
-- 9. ESTADOS DE CILINDROS (CU-S003: Gestionar Estados)
-- =====================================================

CREATE TABLE cylinder_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cylinder_id UUID NOT NULL, -- Referencia al cilindro específico
    cylinder_type VARCHAR(10) NOT NULL CHECK (cylinder_type IN ('33lb', '40lb', '100lb')),
    brand VARCHAR(50) CHECK (brand IN ('Roscogas', 'Gasan', 'Gaspais', 'Vidagas')),
    color VARCHAR(50) CHECK (color IN ('Naranja', 'Azul', 'Verde Oscuro', 'Verde Claro')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'standby', 'sold', 'returned')),
    vendor_id UUID REFERENCES users(id), -- Solo si está asignado
    assignment_id UUID REFERENCES daily_assignments(id),
    sale_id UUID REFERENCES sales(id), -- Solo si fue vendido
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para estados de cilindros
CREATE INDEX idx_cylinder_states_status ON cylinder_states(status);
CREATE INDEX idx_cylinder_states_vendor_id ON cylinder_states(vendor_id);
CREATE INDEX idx_cylinder_states_created_at ON cylinder_states(created_at);

-- =====================================================
-- 10. METAS (CU-J006: Configurar y Seguir Metas)
-- =====================================================

CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('general', 'individual')),
    vendor_id UUID REFERENCES users(id), -- NULL para metas generales
    period VARCHAR(20) NOT NULL CHECK (period IN ('semanal', 'mensual', 'semestral', 'anual')),
    target_kg DECIMAL(10,2) NOT NULL CHECK (target_kg > 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    
    -- Validar que end_date > start_date
    CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Índices para metas
CREATE INDEX idx_goals_type ON goals(type);
CREATE INDEX idx_goals_vendor_id ON goals(vendor_id);
CREATE INDEX idx_goals_period ON goals(period);
CREATE INDEX idx_goals_active ON goals(is_active);

-- =====================================================
-- 11. SOLICITUDES DE EDICIÓN (CU-J008: Autorizar Ediciones)
-- =====================================================

CREATE TABLE edit_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES users(id),
    record_type VARCHAR(20) NOT NULL CHECK (record_type IN ('sale', 'expense')),
    record_id UUID NOT NULL, -- ID del registro a editar
    original_data JSONB NOT NULL, -- Datos originales
    proposed_data JSONB NOT NULL, -- Datos propuestos
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES users(id),
    review_comments TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para solicitudes de edición
CREATE INDEX idx_edit_requests_vendor_id ON edit_requests(vendor_id);
CREATE INDEX idx_edit_requests_status ON edit_requests(status);
CREATE INDEX idx_edit_requests_created_at ON edit_requests(created_at);

-- =====================================================
-- 12. AUDITORÍA Y LOGS
-- =====================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para auditoría
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- 13. NOTIFICACIONES
-- =====================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('success', 'warning', 'info', 'error')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT, -- URL para acción si es necesario
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para notificaciones
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- 14. CONFIGURACIÓN DEL SISTEMA
-- =====================================================

CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- Configuraciones por defecto
INSERT INTO system_config (key, value, description) VALUES
('inventory_low_threshold', '{"33lb": 5, "40lb": 5, "100lb": 3}', 'Umbrales de stock bajo por tipo'),
('default_prices', '{"33lb": 0, "40lb": 0, "100lb": 0}', 'Precios por defecto (se configuran manualmente)'),
('business_hours', '{"start": "06:00", "end": "20:00"}', 'Horario de operación del negocio'),
('daily_reset_time', '"00:00"', 'Hora de reseteo diario automático');

-- =====================================================
-- 15. FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_full_updated_at BEFORE UPDATE ON inventory_full FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_empty_updated_at BEFORE UPDATE ON inventory_empty FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cylinder_states_updated_at BEFORE UPDATE ON cylinder_states FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para validar inventario antes de ventas
CREATE OR REPLACE FUNCTION validate_inventory_before_sale()
RETURNS TRIGGER AS $$
DECLARE
    available_quantity INTEGER;
BEGIN
    -- Solo validar para ventas que afectan inventario
    IF NEW.sale_type IN ('intercambio', 'completa') THEN
        SELECT quantity INTO available_quantity 
        FROM inventory_full 
        WHERE type = NEW.product_type;
        
        IF available_quantity <= 0 THEN
            RAISE EXCEPTION 'No hay inventario disponible para el tipo %', NEW.product_type;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para validar inventario
CREATE TRIGGER validate_inventory_before_sale_trigger 
    BEFORE INSERT ON sales 
    FOR EACH ROW 
    EXECUTE FUNCTION validate_inventory_before_sale();

-- Función para actualizar inventario después de ventas
CREATE OR REPLACE FUNCTION update_inventory_after_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar inventario según tipo de venta
    IF NEW.sale_type = 'intercambio' THEN
        -- -1 cilindro lleno, +1 cilindro vacío
        UPDATE inventory_full 
        SET quantity = quantity - 1 
        WHERE type = NEW.product_type;
        
        INSERT INTO inventory_empty (type, brand, color, quantity)
        VALUES (NEW.product_type, NEW.empty_brand, NEW.empty_color, 1)
        ON CONFLICT (type, brand, color) 
        DO UPDATE SET quantity = inventory_empty.quantity + 1;
        
    ELSIF NEW.sale_type = 'completa' THEN
        -- -1 cilindro lleno únicamente
        UPDATE inventory_full 
        SET quantity = quantity - 1 
        WHERE type = NEW.product_type;
        
    ELSIF NEW.sale_type = 'venta_vacios' THEN
        -- -1 cilindro vacío
        UPDATE inventory_empty 
        SET quantity = quantity - 1 
        WHERE type = NEW.product_type 
        AND brand = NEW.empty_brand 
        AND color = NEW.empty_color;
        
    ELSIF NEW.sale_type = 'compra_vacios' THEN
        -- +1 cilindro vacío
        INSERT INTO inventory_empty (type, brand, color, quantity)
        VALUES (NEW.product_type, NEW.empty_brand, NEW.empty_color, 1)
        ON CONFLICT (type, brand, color) 
        DO UPDATE SET quantity = inventory_empty.quantity + 1;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar inventario
CREATE TRIGGER update_inventory_after_sale_trigger 
    AFTER INSERT ON sales 
    FOR EACH ROW 
    EXECUTE FUNCTION update_inventory_after_sale();

-- =====================================================
-- 16. VISTAS ÚTILES
-- =====================================================

-- Vista para el panel "En Ruta"
CREATE VIEW vendor_daily_summary AS
SELECT 
    da.vendor_id,
    u.name as vendor_name,
    da.date,
    da.assigned_cylinders,
    COALESCE(sales_summary.total_sales, 0) as total_sales,
    COALESCE(expenses_summary.total_expenses, 0) as total_expenses,
    COALESCE(sales_summary.total_sales, 0) - COALESCE(expenses_summary.total_expenses, 0) as daily_margin,
    COALESCE(sales_summary.cylinders_sold, '{}') as cylinders_sold,
    da.status
FROM daily_assignments da
JOIN users u ON da.vendor_id = u.id
LEFT JOIN (
    SELECT 
        vendor_id,
        DATE(created_at) as sale_date,
        SUM(amount_charged) as total_sales,
        jsonb_object_agg(
            product_type, 
            COUNT(*)
        ) as cylinders_sold
    FROM sales 
    WHERE DATE(created_at) = CURRENT_DATE
    GROUP BY vendor_id, DATE(created_at)
) sales_summary ON da.vendor_id = sales_summary.vendor_id AND da.date = sales_summary.sale_date
LEFT JOIN (
    SELECT 
        vendor_id,
        DATE(created_at) as expense_date,
        SUM(amount) as total_expenses
    FROM expenses 
    WHERE DATE(created_at) = CURRENT_DATE
    GROUP BY vendor_id, DATE(created_at)
) expenses_summary ON da.vendor_id = expenses_summary.vendor_id AND da.date = expenses_summary.expense_date
WHERE da.date = CURRENT_DATE;

-- Vista para inventario consolidado
CREATE VIEW inventory_summary AS
SELECT 
    'full' as inventory_type,
    type,
    'Roscogas' as brand,
    'Naranja' as color,
    quantity,
    unit_cost,
    quantity * unit_cost as total_value
FROM inventory_full
UNION ALL
SELECT 
    'empty' as inventory_type,
    type,
    brand,
    color,
    quantity,
    0 as unit_cost,
    0 as total_value
FROM inventory_empty;

-- =====================================================
-- 17. POLÍTICAS DE SEGURIDAD (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_full ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_empty ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE truck_arrivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cylinder_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE edit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para vendedores (solo pueden ver sus propios datos)
CREATE POLICY vendor_sales_policy ON sales
    FOR ALL TO authenticated
    USING (
        vendor_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'jefe')
    );

CREATE POLICY vendor_expenses_policy ON expenses
    FOR ALL TO authenticated
    USING (
        vendor_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'jefe')
    );

-- Políticas para jefe (acceso completo)
CREATE POLICY jefe_full_access ON inventory_full
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'jefe'));

CREATE POLICY jefe_full_access ON inventory_empty
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'jefe'));

-- =====================================================
-- 18. DATOS INICIALES
-- =====================================================

-- Insertar usuario jefe por defecto
INSERT INTO users (email, password_hash, role, name, phone) VALUES
('jefe@gascontrol.com', '$2a$10$example_hash', 'jefe', 'Jefe Administrador', '+1234567890');

-- Insertar inventario inicial
INSERT INTO inventory_full (type, quantity, unit_cost) VALUES
('33lb', 50, 120.00),
('40lb', 30, 150.00),
('100lb', 20, 300.00);

-- =====================================================
-- 19. COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE users IS 'Usuarios del sistema con roles diferenciados (jefe/vendedor)';
COMMENT ON TABLE inventory_full IS 'Inventario de cilindros llenos (solo marca Roscogas)';
COMMENT ON TABLE inventory_empty IS 'Inventario de cilindros vacíos (todas las marcas)';
COMMENT ON TABLE sales IS 'Registro de ventas con cálculo automático de rentabilidad';
COMMENT ON TABLE expenses IS 'Gastos operativos de vendedores';
COMMENT ON TABLE truck_arrivals IS 'Llegadas de camión con actualización automática de inventario';
COMMENT ON TABLE daily_assignments IS 'Asignaciones diarias de cilindros a vendedores';
COMMENT ON TABLE cylinder_states IS 'Estados de cilindros individuales para trazabilidad';
COMMENT ON TABLE goals IS 'Metas de ventas por período y vendedor';
COMMENT ON TABLE edit_requests IS 'Solicitudes de edición con flujo de aprobación';
COMMENT ON TABLE audit_logs IS 'Log de auditoría para todas las operaciones';
COMMENT ON TABLE notifications IS 'Sistema de notificaciones en tiempo real';

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
