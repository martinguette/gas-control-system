-- =====================================================
-- SCRIPT SEGURO PARA CREAR TABLAS (SOLO SI NO EXISTEN)
-- =====================================================

-- Crear tabla users solo si no existe
CREATE TABLE IF NOT EXISTS users (
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

-- Crear tabla inventory_full solo si no existe
CREATE TABLE IF NOT EXISTS inventory_full (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(10) NOT NULL CHECK (type IN ('33lb', '40lb', '100lb')),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (unit_cost >= 0),
    last_updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla inventory_empty solo si no existe
CREATE TABLE IF NOT EXISTS inventory_empty (
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

-- Crear tabla customers solo si no existe
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location TEXT,
    custom_prices JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla sales solo si no existe
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES users(id),
    customer_id UUID REFERENCES customers(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_location TEXT,
    sale_type VARCHAR(20) NOT NULL CHECK (sale_type IN ('intercambio', 'completa', 'venta_vacios', 'compra_vacios')),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('efectivo', 'transferencia', 'credito')),
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla sale_items solo si no existe
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_type VARCHAR(10) NOT NULL CHECK (product_type IN ('33lb', '40lb', '100lb')),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla expenses solo si no existe
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('gasolina', 'comida', 'reparaciones', 'otros')),
    amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices solo si no existen
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_inventory_full_type ON inventory_full(type);
CREATE INDEX IF NOT EXISTS idx_inventory_empty_type ON inventory_empty(type);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_sales_vendor_id ON sales(vendor_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);

-- Verificar que las tablas se crearon
SELECT 'Tablas creadas exitosamente' as status;
