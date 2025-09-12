# Version 4 (FINAL)

# 🏢 Sistema de Ventas de Gas Pardo - Requerimientos

## 🔧 Stack Tecnológico

```
🖥️ Frontend: Next.js 14+ (React moderno)
💾 Backend: Supabase (PostgreSQL + APIs automáticas)
🔗 Comunicación: Supabase Client (conexión automática)
📱 PWA: Instalable como app móvil

```

---

## 📋 REQUERIMIENTOS FUNCIONALES

### 🔐 RF-001: Autenticación y Permisos

### 🚪 RF-001.1: Login Diferenciado

**¿Qué hace?** Permite login con dos tipos de usuario

- ✅ Login con email y contraseña
- ✅ Redirección automática según rol
- ✅ Sesiones que no se pierden
- 🎯 **Prioridad:** ALTA | ⚡ **Dificultad:** MEDIA

### 👥 RF-001.2: Control por Roles

**¿Qué hace?** Limita funciones según tipo de usuario

- 👨‍💼 **Jefe:** Todo el sistema
- 👨‍💻 **Vendedor:** Solo ventas desde móvil
- ✅ Validación automática de permisos
- 🎯 **Prioridad:** ALTA | ⚡ **Dificultad:** MEDIA

---

### 📦 RF-002: Inventario Inteligente

### 🔄 RF-002.1: Inventarios Separados

**¿Qué hace?** Maneja cilindros llenos y vacíos por separado

- 🟢 **Llenos:** Solo marca Roscogas
- 🔴 **Vacíos:** Todas las marcas y colores
- 📏 **Tipos:** 33lb(15kg), 40lb(18kg), 100lb(45kg)
- 📊 Conteo automático por tipo
- 🎯 **Prioridad:** ALTA | ⚡ **Dificultad:** MEDIA

### ⚡ RF-002.2: Actualización Automática

**¿Qué hace?** El inventario se actualiza solo con cada venta

```
🔄 Venta intercambio: -1 lleno, +1 vacío
💰 Venta completa: -1 lleno
📦 Venta vacíos: -1 vacío
🛒 Compra vacíos: +1 vacío
🚛 Llegada camión: +llenos, -vacíos

```

- 🎯 **Prioridad:** ALTA | ⚡ **Dificultad:** ALTA

### 🚨 RF-002.3: Alertas Stock Bajo

**¿Qué hace?** Avisa cuando se acaba el inventario

- ⚙️ Configurar límites mínimos
- 🔔 Alertas visuales en dashboard
- ⏰ Notificaciones en tiempo real
- 🎯 **Prioridad:** MEDIA | ⚡ **Dificultad:** BAJA

---

### 💳 RF-003: Transacciones

### 📱 RF-003.1: Registro de Ventas (Vendedores)

**¿Qué hace?** Formulario móvil para registrar ventas

```
📝 Campos Obligatorios:
├── 👤 Cliente (nombre, teléfono, ubicación)
├── 📦 Tipo de cilindro
├── 🔄 Tipo de venta (intercambio/completa)
├── 💰 Valor cobrado
├── 💳 Método de pago
└── ⏰ Fecha/hora automática

```

- 🎯 **Prioridad:** ALTA | ⚡ **Dificultad:** MEDIA

### 💸 RF-003.2: Registro de Gastos (Vendedores)

**¿Qué hace?** Formulario para gastos diarios

```
💸 Campos:
├── ⛽ Tipo (gasolina, comida, reparaciones)
├── 💰 Valor del gasto
├── 📝 Descripción detallada
└── ⏰ Fecha/hora automática

```

- 🔴 Visualización en rojo para identificar
- 🎯 **Prioridad:** ALTA | ⚡ **Dificultad:** BAJA

### 🚛 RF-003.3: Llegadas de Camión (Solo Jefe)

**¿Qué hace?** Registra reabastecimiento de inventario

```
📊 Información:
├── 📦 Cilindros llenos recibidos
├── 🔴 Cilindros vacíos entregados
├── 💰 Precio unitario del día
├── 🧾 Valor total factura
└── 🚛 Costo de flete (no se cobra del dinero del sistema - Se paga con dinero a parte )

```

- ⚡ Actualiza inventario y costos automáticamente
- 🎯 **Prioridad:** ALTA | ⚡ **Dificultad:** ALTA

---

### 🛣️ RF-004: Panel "En Ruta" (Control Diario)

### 📊 RF-004.1: Cards en Tiempo Real

**¿Qué hace?** Muestra actividad de cada vendedor HOY

```
👨‍💻 Card por Vendedor:
├── 📦 Cilindros: asignados/vendidos/restantes
├── 💰 Total ventas del día
├── 💸 Total gastos del día
├── 📈 Margen del día (ganancia del dia)
└── 📊 Progreso visual (barras)

```

- ⚡ Se actualiza con cada venta instantáneamente
- 🎯 **Prioridad:** ALTA | ⚡ **Dificultad:** ALTA

### 📋 RF-004.2: Asignación Diaria

**¿Qué hace?** Registra cilindros entregados al inicio del día (el jefe registra)

- 📦 Formulario para asignar por tipo
- ⏸️ Estado STANDBY (no afecta inventario hasta venta)
- 📊 Crea cards "En Ruta" automáticamente
- 🎯 **Prioridad:** ALTA | ⚡ **Dificultad:** MEDIA

### 🔄 RF-004.3: Reseteo Automático

**¿Qué hace?** Reinicia datos cada día

- 🕛 Reseteo automático a las 00:00
- 📦 Cilindros no vendidos vuelven al inventario
- 🆕 Prepara cards para nuevo día
- 🎯 **Prioridad:** MEDIA | ⚡ **Dificultad:** MEDIA

---

### 🎯 RF-005: Sistema de Metas

### ⚙️ RF-005.1: Configuración de Metas

**¿Qué hace?** Define objetivos a cumplir

```
🎯 Tipos de Metas:
├── 🏢 Generales del negocio
└── 👨‍💻 Individuales por vendedor

📅 Períodos:
├── 📆 Semanal
├── 🗓️ Mensual
├── 📊 Semestral
└── 📈 Anual

```

- 📏 Medida: kilogramos de gas vendido
- 🎯 **Prioridad:** MEDIA | ⚡ **Dificultad:** MEDIA

### 📊 RF-005.2: Seguimiento en Tiempo Real

**¿Qué hace?** Muestra progreso de metas

- 🔄 Conversión automática libras → kilos
- 📊 Barras de progreso visuales
- 🚦 Estados: ✅ cumplido, 🟡 en progreso, 🔴 retrasado
- 📈 Proyecciones basadas en tendencia
- 🎯 **Prioridad:** MEDIA | ⚡ **Dificultad:** MEDIA

---

### 👥 RF-006: Clientes y Precios

### 📋 RF-006.1: Lista de Clientes

**¿Qué hace?** Gestiona clientes y precios personalizados

- ➕➖✏️🗑️ CRUD completo de clientes (opcional)
- 💰 Precios personalizados por cliente
- ⚡ Modificación de precios en tiempo real
- 📊 Historial de compras (opcional)
- 🎯 **Prioridad:** MEDIA | ⚡ **Dificultad:** MEDIA

### 🔄 RF-006.2: Aplicación Automática de Precios

**¿Qué hace?** Aplica precio correcto según cliente

- 👤 Selección de cliente en venta
- 💰 Precio personalizado automático o asignar por vendedor si se quiere
- 🔄 Precio estándar si no hay personalizado
- 🎯 **Prioridad:** MEDIA | ⚡ **Dificultad:** BAJA

---

### 📊 RF-007: Reportes y Análisis

### 💰 RF-007.1: Reportes Financieros

**¿Qué hace?** Genera reportes detallados

```
📊 Tipos de Reportes:
├── 📅 Por período (diario/semanal/mensual)
├── 🔄 Por tipo de venta
└── 💹 Márgenes de ganancia 

```

- 📄 Exportación PDF y Excel (opcional)
- 🎯 **Prioridad:** ALTA | ⚡ **Dificultad:** ALTA

### 📈 RF-007.2: Dashboard de Análisis

**¿Qué hace?** Visualización gráfica de datos importantes

- 📊 Gráficos de ventas por período
- 💹 Análisis de rentabilidad
- 🎯 **Prioridad:** MEDIA | ⚡ **Dificultad:** ALTA

---

### ✏️ RF-008: Control de Ediciones

### 🔐 RF-008.1: Autorización para Editar

**¿Qué hace?** Vendedores solo editan con permiso del jefe

- 🙋‍♂️ Solicitud desde app móvil
- 🔔 Notificación al jefe
- ✅❌ Aprobar/rechazar edición
- 🎯 **Prioridad:** MEDIA | ⚡ **Dificultad:** ALTA

---

### 📱 RF-009: Responsividad

### 📱 RF-009.1: App Móvil para Vendedores

**¿Qué hace?** Interfaz optimizada para teléfonos

- 📱 Diseño específico para móviles
- 👆 Optimizado para pantalla táctil
- 🚫 Solo funciones permitidas
- 🎯 **Prioridad:** ALTA | ⚡ **Dificultad:** MEDIA

### 💻 RF-009.2: Dashboard para Jefe

**¿Qué hace?** Interfaz completa para PC/tablet/móvil

- 📱💻🖥️ Adaptable a cualquier pantalla
- ✅ Todas las funciones en cualquier dispositivo
- 🎯 **Prioridad:** ALTA | ⚡ **Dificultad:** MEDIA

---

## ⚡ REQUERIMIENTOS NO FUNCIONALES

### 🚀 RNF-001: Rendimiento

### ⏱️ RNF-001.1: Velocidad de Respuesta

```
⚡ Tiempos Máximos:
├── 🚀 Carga inicial: 3 segundos
├── 💳 Registro ventas: 2 segundos
├── 📊 Dashboard: 1 segundo
└── 📊 Reportes: 5 segundos

```

- 🎯 **Prioridad:** ALTA

### 👥 RNF-001.2: Usuarios Simultáneos

- 👨‍💻 Mínimo 10 vendedores conectados
- 👨‍💼 1 jefe con acceso completo
- 📶 Sin pérdida de velocidad
- 🎯 **Prioridad:** ALTA

---

### 🟢 RNF-002: Disponibilidad

### ⏰ RNF-002.1: Sistema Siempre Activo

- 🟢 99.5% disponible (6 AM - 8 PM)
- 🔧 Mantenimiento fuera de horario
- 🆘 Plan de recuperación ante fallos
- 🎯 **Prioridad:** ALTA

### 📶 RNF-002.2: Internet Intermitente

- 💾 Datos importantes guardados localmente
- 🔄 Sincronización automática
- 📶 Avisos de estado de conexión
- 🎯 **Prioridad:** ALTA

---

### 🔐 RNF-003: Seguridad

### 🔑 RNF-003.1: Acceso Seguro

- 🎫 Tokens JWT para sesiones
- 👥 Control por roles (Jefe/Vendedor)
- ⏰ Sesiones con expiración
- 🔒 Contraseñas encriptadas
- 🎯 **Prioridad:** ALTA

### 🛡️ RNF-003.2: Protección de Datos

- 🔒 Conexiones HTTPS seguras
- 🔐 Datos sensibles encriptados
- 📝 Registro de todos los accesos
- 🎯 **Prioridad:** ALTA

---

### 😊 RNF-004: Facilidad de Uso

### 📱 RNF-004.1: Móvil Súper Fácil

- 📱 Diseño primero para móviles
- ✅ Validación instantánea
- 👆 Navegación por gestos
- 🎯 **Prioridad:** ALTA

### 💻 RNF-004.2: Dashboard Claro

- 📊 Información clara y visible
- 🚦 Colores: 🟢 bien(ingresos), 🟡 alerta, 🔴 problema(gastos)
- 💬 Ayuda contextual
- 🎯 **Prioridad:** ALTA

---

## 🗄️ BASE DE DATOS SUPABASE

### 📊 Tablas Principales

### 👥 users (Usuarios)

```sql
🆔 id: uuid (clave principal)
📧 email: string (único)
🔒 password: string (encriptada)
👤 role: 'jefe' o 'vendedor'
📝 name: string
📞 phone: string (opcional)
📅 created_at: timestamp
📅 updated_at: timestamp

```

### 📦 inventory_full (Cilindros Llenos)

```sql
🆔 id: uuid
📏 type: '33lb', '40lb', '100lb'
🔢 quantity: number
💰 unit_cost: decimal (precio compra)
📅 updated_at: timestamp

```

### 🔴 inventory_empty (Cilindros Vacíos)

```sql
🆔 id: uuid
📏 type: '33lb', '40lb', '100lb'
🏷️ brand: string (marca)
🎨 color: string
🔢 quantity: number
📅 updated_at: timestamp

```

### 👥 customers (Clientes)

```sql
🆔 id: uuid
📝 name: string
📞 phone: string (opcional)
📍 location: string
💰 custom_prices: json (precios personalizados)
📅 created_at: timestamp

```

### 💳 sales (Ventas)

```sql
🆔 id: uuid
👨‍💻 vendor_id: uuid (vendedor)
👤 customer_id: uuid (cliente, opcional)
📝 customer_name: string
📞 customer_phone: string
📍 customer_location: string
📦 product_type: '33lb', '40lb', '100lb'
🔄 sale_type: 'intercambio', 'completa', 'venta_vacios'
🏷️ empty_brand: string (para intercambios)
🎨 empty_color: string (para intercambios)
💰 amount_charged: decimal
💳 payment_method: 'efectivo', 'transferencia', 'credito'
📅 created_at: timestamp

```

### 💸 expenses (Gastos)

```sql
🆔 id: uuid
👨‍💻 vendor_id: uuid (vendedor)
⛽ type: 'gasolina', 'comida', 'reparaciones', 'otros'
💰 amount: decimal
📝 description: text
📅 created_at: timestamp

```

### 🚛 truck_arrivals (Llegadas Camión)

```sql
🆔 id: uuid
📦 cylinders_received: json (por tipo)
🔴 cylinders_delivered: json (vacíos entregados)
💰 unit_cost: decimal
🧾 total_invoice: decimal
🚛 freight_cost: decimal
📅 created_at: timestamp

```

### 📋 daily_assignments (Asignaciones Diarias)

```sql
🆔 id: uuid
👨‍💻 vendor_id: uuid
📅 date: date
📦 assigned_cylinders: json (por tipo)
📅 created_at: timestamp

```

### 🎯 goals (Metas)

```sql
🆔 id: uuid
🎯 type: 'general' o 'individual'
👨‍💻 vendor_id: uuid (opcional para generales)
📅 period: 'semanal', 'mensual', 'semestral', 'anual'
📏 target_kg: number
📅 start_date: date
📅 end_date: date
📅 created_at: timestamp

```

---

## 🏗️ ESTRUCTURA DEL CÓDIGO

### 📁 Frontend (Next.js)

```
src/
├── 📱 app/                 # Next.js 14 App Router
│   ├── 🔐 auth/           # Login/Register
│   ├── 💻 dashboard/      # Panel Jefe
│   ├── 📱 mobile/         # App Vendedores
│   └── 🔗 api/           # APIs (opcional)
├── 🧩 components/         # Componentes reutilizables
│   ├── 🎨 ui/            # Botones, inputs básicos
│   ├── 📝 forms/         # Formularios específicos
│   ├── 📊 charts/        # Gráficos
│   └── 🖼️ layout/        # Layouts
├── 📚 lib/               # Configuraciones
│   ├── 🗄️ supabase.js   # Cliente Supabase
│   ├── 🔐 auth.js       # Autenticación
│   └── 🛠️ utils.js      # Utilidades
├── 🎣 hooks/             # React Hooks personalizados
└── 🎨 styles/           # CSS/Tailwind & ShadCNUI

```

### 💾 Backend (Supabase)

```
🗄️ PostgreSQL: Base de datos principal
🔐 Supabase Auth: Login con JWT
🔗 APIs: Auto-generadas
⚡ Realtime: Actualizaciones instantáneas
📁 Storage: Archivos (si necesario)

```

---

## 🎯 CASOS DE USO PRINCIPALES

### 📱 CU-001: Vendedor Registra Venta

```
👨‍💻 Actor: Vendedor
✅ Pre: Autenticado en móvil

🔄 Flujo:
1️⃣ Abre formulario de venta
2️⃣ Llena datos cliente y transacción
3️⃣ Sistema valida y actualiza inventario
4️⃣ Confirma registro exitoso

✅ Post: Venta guardada, inventario actualizado, card actualizado

```

### 💻 CU-002: Jefe Monitorea en Tiempo Real

```
👨‍💼 Actor: Jefe
✅ Pre: Autenticado en dashboard

🔄 Flujo:
1️⃣ Accede panel "En Ruta"
2️⃣ Ve cards de todos los vendedores
3️⃣ Observa actualizaciones automáticas
4️⃣ Analiza y toma decisiones

✅ Post: Información actualizada disponible

```

### 🚛 CU-003: Actualizar por Llegada de Camión

```
👨‍💼 Actor: Jefe
✅ Pre: Camión llegó físicamente

🔄 Flujo:
1️⃣ Registra cantidades recibidas/entregadas
2️⃣ Ingresa costos unitarios y totales
3️⃣ Sistema actualiza inventario automáticamente
4️⃣ Recalcula rentabilidad con nuevos costos

✅ Post: Inventario y costos actualizados

```

---

## 🚀 FASES DE DESARROLLO

### 🔥 Fase 1: Base (2-3 semanas)

- 🔐 Autenticación y roles
- 🏗️ Estructura básica Next.js + Supabase
- 📱💻 Layouts responsivos básicos

### ⚡ Fase 2: Inventario (2-3 semanas)

- 📦 Módulo inventario completo
- 💳 Registro básico de transacciones
- 🔄 Actualización automática

### 🎯 Fase 3: Operación Diaria (3-4 semanas)

- 🛣️ Panel "En Ruta" completo
- 📊 Cards en tiempo real
- 📋 Asignaciones diarias

### 📊 Fase 4: Análisis (2-3 semanas)

- 🎯 Sistema de metas
- 📈 Reportes financieros
- 📊 Dashboard de análisis

---

## ✅ CHECKLIST DE INICIO

### 🛠️ Setup Técnico

- [ ]  🆕 Crear proyecto Next.js 14
- [ ]  🗄️ Crear proyecto Supabase
- [ ]  📊 Crear tablas según modelo
- [ ]  🔗 Configurar Supabase Client
- [ ]  🎨 Instalar Tailwind CSS y ShadCNUI

### 📱 Primera Funcionalidad

- [ ]  🔐 Página de login
- [ ]  👥 Crear usuarios de prueba
- [ ]  📱 Layout móvil básico
- [ ]  💻 Dashboard básico para jefe
- [ ]  🔄 Redirección por roles

¿Por cuál fase quieres que empecemos? 🚀