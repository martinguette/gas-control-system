# Marcas y Colores de Cilindros de Gas

## 📋 **Especificaciones Oficiales**

Este documento define las marcas y colores oficiales de cilindros de gas utilizados en el sistema.

### 🏷️ **Marcas de Cilindros**

| Marca        | Color        | Descripción                 |
| ------------ | ------------ | --------------------------- |
| **Roscogas** | Naranja      | Marca principal del negocio |
| **Gasan**    | Azul         | Marca secundaria            |
| **Gaspais**  | Verde Oscuro | Marca secundaria            |
| **Vidagas**  | Verde Claro  | Marca secundaria            |

### 🎨 **Colores Disponibles**

- **Naranja** (Roscogas)
- **Azul** (Gasan)
- **Verde Oscuro** (Gaspais)
- **Verde Claro** (Vidagas)

> **⚠️ IMPORTANTE**: Los colores se asignan automáticamente según la marca seleccionada. No es necesario elegir el color por separado.

### 🎨 **Colores por Marca**

```typescript
const CYLINDER_BRAND_COLORS = {
  'Roscogas': 'Naranja',
  'Gasan': 'Azul',
  'Gaspais': 'Verde Oscuro',
  'Vidagas': 'Verde Claro',
};
```

### 📦 **Tipos de Cilindros**

Todos los tipos de cilindros están disponibles en todas las marcas:

- **33lb** (15 kg)
- **40lb** (18 kg)
- **100lb** (45 kg)

### 🔄 **Reglas de Inventario**

#### **Cilindros Llenos**

- ✅ **Solo marca Roscogas**
- ✅ **Solo color Naranja**
- ✅ **Con costo unitario**

#### **Cilindros Vacíos**

- ✅ **Todas las marcas permitidas**
- ✅ **Todos los colores permitidos**
- ✅ **Sin costo unitario**

### 🗄️ **Estructura de Base de Datos**

```sql
-- Inventario de cilindros llenos (solo Roscogas)
CREATE TABLE inventory_full (
  type TEXT CHECK (type IN ('33lb', '40lb', '100lb')),
  quantity INTEGER,
  unit_cost DECIMAL(10,2)
);

-- Inventario de cilindros vacíos (todas las marcas)
CREATE TABLE inventory_empty (
  type TEXT CHECK (type IN ('33lb', '40lb', '100lb')),
  brand TEXT CHECK (brand IN ('Roscogas', 'Gasan', 'Gaspais', 'Vidagas')),
  color TEXT CHECK (color IN ('Naranja', 'Azul', 'Verde Oscuro', 'Verde Claro')),
  quantity INTEGER
);
```

### 🚨 **Validaciones Críticas**

1. **Nunca mezclar marcas en cilindros llenos**
2. **Siempre usar colores correctos por marca**
3. **Validar que las combinaciones marca-color sean válidas**
4. **Mantener consistencia en toda la aplicación**

### 📝 **Ejemplos de Uso**

```typescript
// ✅ CORRECTO: Cilindro lleno Roscogas
const fullCylinder = {
  type: '33lb',
  brand: 'Roscogas',
  color: 'Naranja',
  quantity: 10,
  unit_cost: 150.0,
};

// ✅ CORRECTO: Cilindro vacío Gasan
const emptyCylinder = {
  type: '40lb',
  brand: 'Gasan',
  color: 'Azul',
  quantity: 5,
};

// ❌ INCORRECTO: Cilindro lleno de otra marca
const invalidFull = {
  type: '33lb',
  brand: 'Gasan', // ❌ Solo Roscogas para llenos
  color: 'Azul',
  quantity: 10,
};
```

### 🔄 **Actualizaciones**

- **Fecha de creación**: 2024-12-12
- **Última actualización**: 2024-12-12
- **Versión**: 1.0

---

**Nota**: Este documento debe mantenerse actualizado cuando se agreguen nuevas marcas o colores al sistema.
