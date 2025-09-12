# Migraciones de Base de Datos - Sistema Gas Pardo

## 📋 Descripción

Este directorio contiene las migraciones SQL versionadas para el sistema de gestión de cilindros de gas. Las migraciones están organizadas cronológicamente y deben ejecutarse en orden.

## 📁 Estructura de Archivos

```
supabase/migrations/
├── README.md
└── 20241212_212300_create_additional_tables.sql
```

## 🚀 Instrucciones de Ejecución

### 1. Orden de Ejecución

**IMPORTANTE:** Ejecutar las migraciones en el siguiente orden:

1. **Primero:** `database-setup.sql` (en la raíz del proyecto)

   - Crea la tabla `profiles`
   - Configura RLS básico
   - Establece triggers y funciones base

2. **Segundo:** `20241212_212300_create_additional_tables.sql`
   - Crea todas las tablas adicionales del sistema
   - Configura RLS completo
   - Establece triggers y funciones específicas

### 2. Ejecución en Supabase Studio

1. Abrir Supabase Studio
2. Ir a **SQL Editor**
3. Ejecutar cada archivo en orden
4. Verificar que no hay errores

### 3. Verificación Post-Migración

Después de ejecutar las migraciones, verificar:

```sql
-- Verificar que todas las tablas existen
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

## 📊 Tablas Creadas

### Tablas Principales

- `profiles` - Usuarios del sistema (jefe/vendedor)
- `inventory_full` - Cilindros llenos (solo Roscogas)
- `inventory_empty` - Cilindros vacíos (todas las marcas)
- `customers` - Clientes con precios personalizados
- `sales` - Transacciones de venta
- `expenses` - Gastos operativos
- `truck_arrivals` - Llegadas de camión
- `daily_assignments` - Asignaciones diarias
- `goals` - Sistema de metas
- `audit_logs` - Log de auditoría

### Características Implementadas

- ✅ **Row Level Security (RLS)** completo
- ✅ **Políticas de seguridad** por rol
- ✅ **Triggers automáticos** para actualización de inventario
- ✅ **Índices optimizados** para consultas frecuentes
- ✅ **Funciones auxiliares** (conversión lbs/kg)
- ✅ **Realtime habilitado** para tablas críticas
- ✅ **Datos iniciales** para inventario

## 🔧 Funciones Auxiliares

### `lbs_to_kg(lbs TEXT)`

Convierte tipos de cilindros de libras a kilogramos:

- 33lb → 15kg
- 40lb → 18kg
- 100lb → 45kg

### `update_inventory_after_sale()`

Actualiza automáticamente el inventario después de cada venta según el tipo de transacción.

## 🔐 Seguridad

### Políticas RLS Implementadas

- **Jefe:** Acceso completo a todas las tablas
- **Vendedor:** Solo puede ver/insertar sus propios registros
- **Inventario:** Solo accesible por el jefe
- **Audit Logs:** Solo accesible por el jefe

### Triggers de Auditoría

- Registro automático de cambios en tablas críticas
- Trazabilidad completa de operaciones

## 📈 Realtime

Las siguientes tablas tienen Realtime habilitado:

- `sales` - Para actualización del Panel "En Ruta"
- `expenses` - Para seguimiento de gastos
- `daily_assignments` - Para asignaciones diarias
- `inventory_full` - Para inventario de llenos
- `inventory_empty` - Para inventario de vacíos

## 🚨 Troubleshooting

### Error: "relation does not exist"

- Verificar que `database-setup.sql` se ejecutó primero
- Verificar que la tabla `profiles` existe

### Error: "function does not exist"

- Verificar que `update_updated_at_column()` existe
- Ejecutar `database-setup.sql` si no se ejecutó

### Error: "policy already exists"

- Las políticas están configuradas como `IF NOT EXISTS`
- Este error no debería ocurrir

## 📝 Notas de Desarrollo

- Todas las migraciones son **idempotentes** (se pueden ejecutar múltiples veces)
- Los datos iniciales usan `ON CONFLICT DO NOTHING`
- Los índices usan `IF NOT EXISTS`
- Las políticas RLS están optimizadas para el flujo de trabajo del negocio

## 🔄 Próximos Pasos

Después de ejecutar las migraciones:

1. Verificar conectividad desde la aplicación
2. Probar inserción de datos de prueba
3. Verificar que RLS funciona correctamente
4. Probar funcionalidad de Realtime
