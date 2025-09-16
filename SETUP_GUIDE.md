# 🚀 Guía de Configuración - Sistema de Control de Gas

## 📋 Resumen del Sistema

Este es un sistema completo de control de gas para empresas distribuidoras, diseñado para maximizar la rentabilidad mediante:

- **Control preciso de inventario** (cilindros llenos y vacíos)
- **Precios personalizados por cliente** (el jefe nunca pierde)
- **Interfaces diferenciadas por rol** (jefe multi-dispositivo, vendedores móvil)
- **Sistema de rentabilidad en tiempo real**

## 🎯 Características Principales

### 👨‍💼 **Para el Jefe (Admin)**

- Dashboard completo con sidebar (desktop)
- Panel "En Ruta" para monitoreo en tiempo real
- Gestión completa de inventario
- Configuración de precios personalizados
- Registro de llegadas de camión
- Reportes y análisis financieros
- Acceso desde cualquier dispositivo

### 👨‍💻 **Para Vendedores**

- Interfaz móvil optimizada
- Registro rápido de ventas
- Gestión de gastos operativos
- Visualización de estadísticas personales
- Acceso solo desde dispositivos móviles

## 🛠️ Configuración Inicial

### 1. **Instalar Dependencias**

```bash
npm install
```

### 2. **Configurar Base de Datos**

```bash
# Opción 1: Con Supabase CLI
npm run db:reset
npm run setup:test-data

# Opción 2: Manual
# Ejecutar el archivo database-improved.sql en tu base de datos
# Luego ejecutar scripts/insert-test-data.sql
```

### 3. **Configurar Variables de Entorno**

Crear archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
DATABASE_URL=tu_database_url
```

### 4. **Iniciar el Servidor**

```bash
npm run dev
```

## 🧪 Datos de Prueba

El sistema incluye datos ficticios completos para testing:

### 👥 **Usuarios de Prueba**

- **Jefe**: `jefe@gascontrol.com`
- **Vendedor 1**: `vendedor1@gascontrol.com`
- **Vendedor 2**: `vendedor2@gascontrol.com`
- **Vendedor 3**: `vendedor3@gascontrol.com`

### 📦 **Inventario Inicial**

- **Cilindros Llenos (Roscogas)**: 50x 33lb, 30x 40lb, 20x 100lb
- **Cilindros Vacíos**: Todas las marcas (Roscogas, Gasan, Gaspais, Vidagas)
- **Precios Base**: $25,000 (33lb), $30,000 (40lb), $70,000 (100lb)

### 👤 **Clientes con Precios Personalizados**

- **Restaurante El Buen Sabor**: Precios VIP (descuento 10-15%)
- **Hotel Plaza Mayor**: Precios premium (+10-15%)
- **Panadería San José**: Descuento por volumen
- **Otros clientes**: Precios estándar

## 🎮 Cómo Usar el Sistema

### **Para el Jefe**

1. **Iniciar Sesión**

   - Ve a `http://localhost:3000/log-in`
   - Usa: `jefe@gascontrol.com`

2. **Gestionar Inventario**

   - Ve a Dashboard → Inventario
   - Ajusta cantidades y precios
   - Registra llegadas de camión

3. **Monitorear Vendedores**

   - Ve a Dashboard → Panel "En Ruta"
   - Ve estadísticas en tiempo real
   - Asigna cilindros diarios

4. **Configurar Precios**
   - Ve a Dashboard → Clientes
   - Establece precios personalizados por cliente
   - **Recuerda**: El jefe nunca pierde dinero

### **Para Vendedores**

1. **Iniciar Sesión**

   - Ve a `http://localhost:3000/log-in`
   - Usa: `vendedor1@gascontrol.com`

2. **Registrar Ventas**

   - Ve a Dashboard → Ventas
   - Selecciona cliente existente o crea nuevo
   - Los precios se aplican automáticamente
   - Registra tipo de transacción (intercambio, completa, etc.)

3. **Registrar Gastos**
   - Ve a Dashboard → Gastos
   - Categoriza gastos (gasolina, comida, reparaciones)
   - Los gastos requieren aprobación del jefe

## 💰 Sistema de Rentabilidad

### **Cálculo de Rentabilidad**

```
Rentabilidad = Precio de Venta - Precio de Compra - Gastos Operativos
```

### **Precios Personalizados**

- Cada cliente puede tener precios únicos por tipo de cilindro
- Los precios se aplican automáticamente al seleccionar el cliente
- El sistema garantiza que el jefe nunca pierda dinero

### **Tipos de Transacciones**

1. **Intercambio**: -1 lleno, +1 vacío (80% de ventas)
2. **Venta Completa**: -1 lleno únicamente
3. **Venta de Vacíos**: -1 vacío
4. **Compra de Vacíos**: +1 vacío

## 📱 Optimizaciones de Rendimiento

### **Carga Rápida de Datos**

- **Cache de clientes**: 5 minutos
- **Cache de precios**: 10 minutos
- **Modo offline**: Funciona sin conexión
- **Sincronización automática**: Al restaurar conexión

### **Interfaces Responsivas**

- **Desktop**: Sidebar + contenido principal
- **Tablet**: Navegación superior + cards optimizadas
- **Móvil**: Navegación inferior + formularios táctiles

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev                 # Iniciar servidor de desarrollo
npm run build              # Construir para producción
npm run start              # Iniciar servidor de producción

# Base de Datos
npm run db:reset           # Resetear base de datos
npm run db:push            # Aplicar migraciones
npm run setup:test-data    # Insertar datos de prueba

# Testing
npm run test               # Ejecutar tests
npm run test:watch         # Tests en modo watch
npm run test:coverage      # Tests con cobertura

# Linting
npm run lint               # Verificar código
```

## 🚨 Solución de Problemas

### **Error de Conexión a Base de Datos**

1. Verifica que PostgreSQL esté ejecutándose
2. Confirma las variables de entorno
3. Ejecuta `npm run db:reset`

### **Datos No Cargando**

1. Verifica la conexión a internet
2. Revisa la consola del navegador
3. Intenta recargar la página

### **Formularios Lentos**

1. Verifica que los datos de prueba estén insertados
2. Revisa la consola para errores
3. Intenta limpiar el cache del navegador

## 📊 Métricas de Éxito

### **Rendimiento**

- Carga inicial: ≤ 3 segundos
- Registro de ventas: ≤ 2 segundos
- Actualización de dashboard: ≤ 1 segundo

### **Usabilidad**

- 100% adopción de vendedores en 30 días
- 0 instancias de inventario negativo
- Tiempo de capacitación: ≤ 2 horas

## 🎯 Próximos Pasos

1. **Personalizar precios** según tu negocio
2. **Configurar usuarios reales** con roles apropiados
3. **Ajustar inventario inicial** con tus cantidades reales
4. **Entrenar vendedores** en el uso del sistema móvil
5. **Monitorear rentabilidad** diariamente

---

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa esta guía
2. Verifica los logs en la consola
3. Consulta la documentación técnica en `/docs`

**¡El sistema está diseñado para maximizar tu rentabilidad!** 🚀
