# 📋 Casos de Uso Refinados - Sistema de Control de Gas

## 🎯 **Visión General del Sistema**

Este documento define todos los casos de uso del Sistema de Control de Gas, organizados por actores y priorizados para un desarrollo eficiente y sin errores.

---

## 📊 **Matriz de Casos de Uso por Actor**

| Actor           | Casos de Uso        | Prioridad | Complejidad |
| --------------- | ------------------- | --------- | ----------- |
| **👨‍💼 Jefe**     | 9 casos principales | ALTA      | MEDIA-ALTA  |
| **👨‍💻 Vendedor** | 6 casos principales | ALTA      | MEDIA       |
| **🔄 Sistema**  | 6 casos automáticos | CRÍTICA   | ALTA        |

---

## 👨‍💼 **CASOS DE USO - JEFE**

### **CU-J001: Gestionar Inventario** ⭐⭐⭐

**Prioridad:** ALTA | **Complejidad:** MEDIA

#### **Objetivo**

Supervisar y controlar inventario de cilindros llenos y vacíos en tiempo real con capacidad de ajustes manuales.

#### **Flujo Principal**

1. **Acceso:** Dashboard de inventario desde cualquier dispositivo
2. **Visualización en tiempo real:**
   - Cilindros llenos por tipo (33, 40, 100 libras)
   - Cilindros vacíos por marca y color
   - Valor total del inventario
   - Alertas de stock bajo
3. **Consulta detallada:**
   - Historial de movimientos
   - Última actualización
   - Costos unitarios actuales
4. **Ajustes manuales** (opcional):
   - Corrección de cantidades
   - Ajustes por pérdidas o daños
   - Notas explicativas obligatorias

#### **Validaciones Críticas**

```typescript
// ✅ DO: Validar antes de ajustes manuales
const validateInventoryAdjustment = {
  quantity: 'number > 0',
  reason: 'string.length > 10',
  timestamp: 'Date.now()',
  authorizedBy: 'jefe_id',
};
```

---

### **CU-J002: Asignar Cilindros Diarios** ⭐⭐⭐

**Prioridad:** ALTA | **Complejidad:** MEDIA

#### **Objetivo**

Asignar cilindros específicos a cada vendedor al inicio del día y crear cards de seguimiento.

#### **Flujo Principal**

1. **Acceso:** Módulo de asignaciones diarias (6:00-8:00 AM)
2. **Selección de vendedor:** Lista de vendedores activos
3. **Asignación por tipo:**
   - 33 libras: cantidad específica
   - 40 libras: cantidad específica
   - 100 libras: cantidad específica
4. **Validación:** Sistema verifica disponibilidad
5. **Procesamiento automático:**
   - Cilindros → estado STANDBY
   - Crea card en "En Ruta"
   - Mantiene inventario principal intacto

#### **Estados de Cilindros**

```typescript
// ✅ DO: Estados claramente definidos
type CylinderStatus =
  | 'available' // En inventario general
  | 'standby' // Asignado a vendedor (no afecta inventario)
  | 'sold' // Vendido (actualiza inventario)
  | 'returned'; // Devuelto al final del día
```

---

### **CU-J003: Monitorear Panel "En Ruta"** ⭐⭐⭐

**Prioridad:** ALTA | **Complejidad:** ALTA

#### **Objetivo**

Supervisar en tiempo real la actividad diaria de todos los vendedores.

#### **Cards por Vendedor (SOLO DÍA ACTUAL)**

```typescript
// ✅ DO: Estructura de card optimizada
interface VendorCard {
  vendorName: string;
  assignedRoute: string;
  cylindersAssigned: {
    '33lb': number;
    '40lb': number;
    '100lb': number;
  };
  cylindersSold: {
    '33lb': number;
    '40lb': number;
    '100lb': number;
  };
  cylindersRemaining: {
    '33lb': number;
    '40lb': number;
    '100lb': number;
  };
  totalSales: number; // Del día
  totalExpenses: number; // Del día
  dailyMargin: number; // Ventas - Gastos
  progressPercentage: number; // Visual
  lastUpdate: timestamp;
  status: 'active' | 'inactive' | 'completed';
}
```

#### **Código de Colores**

- 🟢 **Verde:** Metas cumplidas o buen progreso
- 🟡 **Amarillo:** Alertas o progreso lento
- 🔴 **Rojo:** Problemas o muy por debajo de expectativas

---

### **CU-J004: Registrar Llegada de Camión** ⭐⭐⭐

**Prioridad:** ALTA | **Complejidad:** ALTA

#### **Objetivo**

Registrar reabastecimiento de inventario y actualizar costos automáticamente.

#### **Información Crítica**

```typescript
// ✅ DO: Estructura completa de llegada
interface TruckArrival {
  cylindersReceived: {
    '33lb': number;
    '40lb': number;
    '100lb': number;
  };
  cylindersDelivered: {
    brand: string;
    color: string;
    type: string;
    quantity: number;
  }[];
  unitCost: decimal; // CRÍTICO: Define rentabilidad
  totalInvoice: decimal;
  freightCost: decimal; // Se paga por separado
  timestamp: Date;
}
```

#### **Impacto Automático**

- ✅ Suma cilindros llenos al inventario
- ✅ Resta cilindros vacíos del inventario
- ✅ Actualiza precio de compra unitario
- ✅ Recalcula rentabilidad para ventas futuras
- ✅ Genera reporte de la transacción

---

### **CU-J005: Generar Reportes Financieros** ⭐⭐⭐

**Prioridad:** ALTA | **Complejidad:** ALTA

#### **Tipos de Reportes**

1. **Financiero:** Ingresos, costos, márgenes
2. **Operativo:** Ventas por vendedor, productos
3. **Desempeño:** Cumplimiento de metas, eficiencia

#### **Parámetros de Configuración**

- **Período:** Diario, semanal, mensual, personalizado
- **Vendedor:** Todos o específico
- **Tipo de producto:** Todos o específico

#### **Exportación**

- PDF para presentaciones
- Excel para análisis detallado
- CSV para integración con otros sistemas

---

### **CU-J006: Configurar y Seguir Metas** ⭐⭐

**Prioridad:** MEDIA | **Complejidad:** MEDIA

#### **Tipos de Metas**

- **General:** Para todo el negocio
- **Individual:** Por vendedor específico

#### **Períodos**

- Semanal, mensual, semestral, anual

#### **Conversión Automática**

```typescript
// ✅ DO: Conversión precisa a kilogramos
const conversions = {
  '33lb': 15, // kg
  '40lb': 18, // kg
  '100lb': 45, // kg
};
```

---

### **CU-J007: Gestionar Precios Personalizados** ⭐⭐

**Prioridad:** MEDIA | **Complejidad:** BAJA

#### **Funcionalidades**

- Precios especiales por cliente
- Validación de márgenes
- Historial de cambios
- Aplicación automática en ventas

---

### **CU-J008: Autorizar Ediciones de Vendedores** ⭐⭐

**Prioridad:** MEDIA | **Complejidad:** ALTA

#### **Flujo de Autorización**

1. **Notificación:** Solicitud pendiente
2. **Revisión:** Datos originales vs. propuestos
3. **Decisión:** Aprobar/Rechazar con comentarios
4. **Ejecución:** Si aprobado, actualización automática
5. **Auditoría:** Registro completo de la decisión

---

### **CU-J009: Acceso Multi-dispositivo** ⭐⭐⭐

**Prioridad:** ALTA | **Complejidad:** MEDIA

#### **Objetivo**

Proporcionar acceso optimizado desde cualquier dispositivo (PC, tablet, móvil) con interfaces adaptadas.

#### **Interfaces Diferenciadas**

```typescript
// ✅ DO: Interfaces específicas por dispositivo
interface DeviceOptimization {
  desktop: {
    layout: 'sidebar + main content';
    features: 'full dashboard, detailed tables, advanced reports';
    navigation: 'sidebar menu';
  };
  tablet: {
    layout: 'top navigation + cards';
    features: 'optimized cards, touch navigation, essential reports';
    navigation: 'top tabs + bottom navigation';
  };
  mobile: {
    layout: 'compact tabs + bottom navigation';
    features: 'essential functions, quick actions, simplified reports';
    navigation: 'bottom tabs + hamburger menu';
  };
}
```

#### **Características por Dispositivo**

- **PC/Desktop:** Dashboard completo, sidebar, tablas detalladas, reportes avanzados
- **Tablet:** Interfaz adaptada, navegación táctil, cards optimizadas
- **Móvil:** Versión compacta, funciones esenciales, navegación por tabs

---

## 👨‍💻 **CASOS DE USO - VENDEDOR**

### **CU-V001: Registrar Venta** ⭐⭐⭐

**Prioridad:** ALTA | **Complejidad:** MEDIA

#### **Campos Obligatorios**

```typescript
// ✅ DO: Estructura completa de venta
interface SaleForm {
  customerName: string; // Obligatorio
  customerPhone?: string; // Opcional
  customerLocation: string; // Obligatorio
  productType: '33lb' | '40lb' | '100lb';
  saleType: 'intercambio' | 'completa' | 'venta_vacios' | 'compra_vacios';
  emptyBrand?: string; // Para intercambios
  emptyColor?: string; // Para intercambios
  amountCharged: decimal;
  paymentMethod: 'efectivo' | 'transferencia' | 'credito';
  timestamp: Date; // Automático
}
```

#### **Tipos de Venta**

- **Intercambio** (80% de ventas): -1 lleno, +1 vacío
- **Completa:** -1 lleno únicamente
- **Venta de vacíos:** -1 vacío
- **Compra de vacíos:** +1 vacío

#### **Flujos Alternativos**

- **Transferencia:** Enviar comprobante por WhatsApp inmediatamente
- **Sin conexión:** Guardar localmente y sincronizar después

---

### **CU-V002: Registrar Gasto** ⭐⭐⭐

**Prioridad:** ALTA | **Complejidad:** BAJA

#### **Tipos de Gasto**

```typescript
// ✅ DO: Categorización clara
type ExpenseType =
  | 'gasolina'
  | 'comida'
  | 'reparaciones'
  | 'imprevistos'
  | 'otros';
```

#### **Características**

- Visualización en color rojo
- Comprobantes por WhatsApp al jefe
- Actualización automática de margen diario

---

### **CU-V003: Solicitar Edición** ⭐⭐

**Prioridad:** MEDIA | **Complejidad:** MEDIA

#### **Restricciones**

- Solo registros del mismo día
- Justificación obligatoria
- Autorización del jefe requerida

---

### **CU-V004: Ver Historial Personal** ⭐⭐

**Prioridad:** MEDIA | **Complejidad:** BAJA

#### **Restricciones Estrictas**

- ❌ Solo datos propios
- ❌ Solo día actual
- ❌ Sin acceso a inventario general
- ❌ Sin acceso a reportes financieros

---

### **CU-V005: Iniciar Sesión Móvil** ⭐⭐⭐

**Prioridad:** ALTA | **Complejidad:** BAJA

#### **Validaciones**

- Credenciales válidas
- Rol verificado como "vendedor"
- Redirección automática a panel móvil optimizado
- Sesión persistente establecida
- Interfaz táctil específica para vendedores

---

### **CU-V006: Sincronizar Datos Offline** ⭐⭐⭐

**Prioridad:** ALTA | **Complejidad:** ALTA

#### **Funcionalidades**

- Detección automática de conexión
- Validación de integridad de datos
- Sincronización automática
- Resolución de conflictos
- Limpieza de almacenamiento local

---

## 🔄 **CASOS DE USO - SISTEMA**

### **CU-S001: Actualizar Inventario** ⭐⭐⭐

**Prioridad:** CRÍTICA | **Complejidad:** ALTA

#### **Reglas de Actualización**

```typescript
// ✅ DO: Operaciones que SÍ afectan inventario
const inventoryOperations = {
  'intercambio': { full: -1, empty: +1 },
  'completa': { full: -1, empty: 0 },
  'venta_vacios': { full: 0, empty: -1 },
  'compra_vacios': { full: 0, empty: +1 },
  'truck_arrival': { full: '+received', empty: '-delivered' },
};

// ❌ DON'T: Operaciones que NO afectan inventario
const nonInventoryOperations = [
  'assignment', // Solo cambia a STANDBY
  'return', // Solo cambia estado
  'standby', // No afecta inventario
];
```

---

### **CU-S002: Calcular Rentabilidad** ⭐⭐⭐

**Prioridad:** CRÍTICA | **Complejidad:** ALTA

#### **Fórmula de Cálculo**

```typescript
// ✅ DO: Cálculo preciso de rentabilidad
const calculateProfitability = {
  grossProfit: salePrice - purchasePrice,
  netProfit: grossProfit - operationalExpenses,
  margin: (netProfit / salePrice) * 100,
  dailyMargin: totalSales - totalExpenses,
};
```

---

### **CU-S003: Resetear Datos Diarios** ⭐⭐⭐

**Prioridad:** CRÍTICA | **Complejidad:** MEDIA

#### **Proceso Automático (00:00)**

1. Cilindros no vendidos → inventario general
2. Cards "En Ruta" → estado inicial
3. Datos diarios → consolidación histórica
4. Preparación para nuevo día

---

### **CU-S004: Generar Alertas** ⭐⭐

**Prioridad:** MEDIA | **Complejidad:** MEDIA

#### **Tipos de Alertas**

- **Stock bajo:** Cantidad menor al límite
- **Gastos excesivos:** Margen negativo
- **Inactividad:** Vendedor sin actividad
- **Errores de sincronización:** Conflictos de datos

---

### **CU-S005: Validar Transacciones** ⭐⭐⭐

**Prioridad:** CRÍTICA | **Complejidad:** ALTA

#### **Validaciones Críticas**

```typescript
// ✅ DO: Validaciones exhaustivas
const validateTransaction = {
  inventory: 'checkAvailability',
  customer: 'validateRequiredFields',
  amounts: 'validatePositiveNumbers',
  types: 'validateSaleType',
  permissions: 'checkUserRole',
};
```

---

### **CU-S006: Gestionar Estados de Cilindros** ⭐⭐⭐

**Prioridad:** CRÍTICA | **Complejidad:** ALTA

#### **Transiciones de Estado**

```typescript
// ✅ DO: Transiciones válidas
const stateTransitions = {
  'available': ['standby', 'sold'],
  'standby': ['sold', 'returned'],
  'sold': [], // Estado final
  'returned': ['available'], // Al final del día
};
```

---

## 🎯 **ORDEN DE IMPLEMENTACIÓN OPTIMIZADO**

### **🔥 Fase 1: Base Crítica (Semanas 1-2)**

1. CU-S001: Actualizar Inventario
2. CU-S002: Calcular Rentabilidad
3. CU-S006: Gestionar Estados de Cilindros
4. CU-J001: Gestionar Inventario

### **⚡ Fase 2: Operación Diaria (Semanas 3-4)**

1. CU-J002: Asignar Cilindros Diarios
2. CU-V001: Registrar Venta
3. CU-V002: Registrar Gasto
4. CU-J003: Monitorear Panel "En Ruta"

### **📊 Fase 3: Control y Análisis (Semanas 5-6)**

1. CU-J004: Registrar Llegada de Camión
2. CU-J005: Generar Reportes Financieros
3. CU-S003: Resetear Datos Diarios

### **🎯 Fase 4: Funciones Avanzadas (Semanas 7-8)**

1. CU-J006: Configurar y Seguir Metas
2. CU-J007: Gestionar Precios Personalizados
3. CU-J008: Autorizar Ediciones de Vendedores
4. CU-J009: Acceso Multi-dispositivo
5. CU-V003: Solicitar Edición

### **🔧 Fase 5: Optimización (Semanas 9-10)**

1. CU-V005: Iniciar Sesión Móvil
2. CU-V006: Sincronizar Datos Offline
3. CU-S004: Generar Alertas
4. CU-S005: Validar Transacciones

---

## 📊 **MÉTRICAS DE ÉXITO**

### **Rendimiento**

- Carga inicial: ≤ 3 segundos
- Registro de ventas: ≤ 2 segundos
- Actualización de dashboard: ≤ 1 segundo

### **Disponibilidad**

- 99.5% uptime durante horario laboral
- Sincronización offline: 99%+ exitosa

### **Usabilidad**

- 100% adopción de vendedores en 30 días
- 0 instancias de inventario negativo
- Tiempo de capacitación: ≤ 2 horas

---

## 🚨 **VALIDACIONES CRÍTICAS**

### **Inventario**

- Nunca permitir cantidades negativas
- Validar disponibilidad antes de ventas
- Mantener consistencia entre estados

### **Transacciones**

- Validar todos los campos obligatorios
- Verificar permisos de usuario
- Confirmar integridad de datos

### **Estados**

- Solo transiciones válidas de estado
- Auditoría completa de cambios
- Rollback automático en errores

---

**Documento refinado:** 2024-12-12  
**Versión:** 2.0 Optimizada  
**Estado:** Listo para implementación
