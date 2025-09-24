# 🧪 Guía de Pruebas - Panel de Ventas de Vendedores

Esta guía detalla cómo probar todos los casos de uso implementados en el panel de ventas de vendedores, incluyendo los 25 casos de uso detallados.

## 📋 Casos de Uso Implementados

### 🛒 Categoría: Gestión de Ventas

#### ✅ CU-V001: Registrar Venta Básica

**Descripción:** El vendedor puede registrar una venta simple de un solo tipo de cilindro a un cliente.

**Funcionalidades:**

- ✅ Selección de cliente (existente o nuevo)
- ✅ Selección de un tipo de cilindro (33lb, 40lb, 100lb)
- ✅ Ingreso de cantidad
- ✅ Aplicación de precio unitario (estándar o personalizado)
- ✅ Selección de tipo de venta (intercambio, completa)
- ✅ Selección de método de pago (efectivo, transferencia, crédito)
- ✅ Cálculo automático del total
- ✅ Confirmación de la venta

**Cómo Probar:**

1. Ir a `/dashboard/vendor/test-sales`
2. En el formulario de ventas:
   - Seleccionar un cliente existente o crear uno nuevo
   - Elegir un tipo de cilindro
   - Ingresar la cantidad
   - Verificar que el total se calcule automáticamente
   - Seleccionar tipo de venta y método de pago
   - Confirmar la venta

#### ✅ CU-V002: Registrar Venta Múltiples Items

**Descripción:** El vendedor puede registrar una venta que incluye múltiples tipos de cilindros o productos.

**Funcionalidades:**

- ✅ Opción para "Agregar Ítem" al formulario de venta
- ✅ Cada ítem permite seleccionar tipo de cilindro, cantidad y precio unitario
- ✅ Cálculo automático del subtotal por ítem
- ✅ Cálculo automático del monto total de la venta sumando todos los subtotales
- ✅ Eliminación de ítems de la lista

**Cómo Probar:**

1. En el formulario de ventas:
   - Agregar múltiples productos usando el botón "Agregar Otro Producto"
   - Cambiar cantidades y verificar que los totales se actualicen automáticamente
   - Eliminar ítems usando el botón de eliminar
   - Verificar que el total general se recalcule correctamente

#### ✅ CU-V003: Cambiar Precios Unitarios

**Descripción:** El vendedor puede modificar el precio unitario de un cilindro en tiempo real durante el proceso de venta.

**Funcionalidades:**

- ✅ Campo de "Costo Unitario" editable para cada ítem
- ✅ Actualización automática del "Costo Total" del ítem y del "Monto Total de la Venta" al cambiar el precio unitario
- ✅ Posibilidad de revertir al precio estándar o personalizado del cliente

**Cómo Probar:**

1. En el formulario de ventas:
   - Hacer clic en el ícono de edición (✏️) junto al precio unitario
   - Modificar el precio y verificar que el total se actualice
   - Verificar que se mantenga la consistencia en todos los cálculos

#### ✅ CU-V004: Crear Cliente Nuevo

**Descripción:** El vendedor puede crear un nuevo cliente directamente desde el formulario de ventas si no existe.

**Funcionalidades:**

- ✅ Opción "Crear Nuevo Cliente" en el selector de clientes
- ✅ Formulario modal o sección para ingresar nombre, teléfono y ubicación del nuevo cliente
- ✅ Posibilidad de asignar precios personalizados al nuevo cliente durante la creación
- ✅ Validación de campos obligatorios (nombre, ubicación)
- ✅ El cliente recién creado se selecciona automáticamente para la venta actual

**Cómo Probar:**

1. En el formulario de ventas:
   - Hacer clic en "Crear Nuevo Cliente"
   - Completar los campos obligatorios (nombre y ubicación)
   - Opcionalmente, configurar precios personalizados
   - Verificar que el cliente se cree y se seleccione automáticamente

#### ✅ CU-V005: Seleccionar Cliente Existente

**Descripción:** El vendedor puede buscar y seleccionar un cliente existente para asociarlo a una venta.

**Funcionalidades:**

- ✅ Campo de búsqueda con autocompletado para clientes
- ✅ Visualización de una lista de clientes coincidentes
- ✅ Selección de un cliente de la lista
- ✅ Autocompletado de la información del cliente (nombre, teléfono, ubicación) en el formulario de venta

**Cómo Probar:**

1. En el formulario de ventas:
   - Usar el campo de búsqueda para encontrar un cliente
   - Seleccionar un cliente de la lista
   - Verificar que la información se complete automáticamente

#### ✅ CU-V006: Aplicar Precios Personalizados

**Descripción:** Al seleccionar un cliente existente con precios personalizados, estos se aplican automáticamente a los ítems de la venta.

**Funcionalidades:**

- ✅ Detección de precios personalizados asociados al cliente seleccionado
- ✅ Sobreescritura automática del precio unitario estándar por el precio personalizado para los tipos de cilindro correspondientes
- ✅ Indicador visual de que se está utilizando un precio personalizado
- ✅ Posibilidad de que el vendedor modifique manualmente el precio personalizado si es necesario

**Cómo Probar:**

1. En el formulario de ventas:
   - Seleccionar un cliente con precios personalizados
   - Verificar que los precios se apliquen automáticamente
   - Verificar que se muestre el indicador visual de precio personalizado

### 🛡️ Categoría: Validaciones y Cálculos

#### ✅ CU-V007: Validar Inventario Disponible

**Descripción:** El sistema valida la disponibilidad de cilindros en el inventario antes de permitir el registro de una venta.

**Funcionalidades:**

- ✅ Verificación en tiempo real del stock disponible para cada tipo de cilindro seleccionado
- ✅ Alerta visual si la cantidad solicitada excede el stock disponible
- ✅ Bloqueo del botón de "Registrar Venta" si hay ítems con stock insuficiente
- ✅ Mensajes de error claros indicando qué ítems tienen problemas de inventario

**Cómo Probar:**

1. En el formulario de ventas:
   - Seleccionar una cantidad que exceda el stock disponible
   - Verificar que se muestre la alerta visual
   - Verificar que el botón de "Registrar Venta" esté deshabilitado
   - Verificar que se muestren mensajes de error claros

#### ✅ CU-V008: Calcular Totales Automáticos

**Descripción:** El sistema calcula automáticamente los costos totales por ítem y el monto total de la venta.

**Funcionalidades:**

- ✅ Cálculo `cantidad * precio_unitario` para obtener el "Costo Total" de cada ítem
- ✅ Suma de todos los "Costos Totales" de los ítems para obtener el "Monto Total de la Venta"
- ✅ Actualización en tiempo real de los totales al cambiar cantidades o precios

**Cómo Probar:**

1. En el formulario de ventas:
   - Cambiar la cantidad de un producto
   - Verificar que el subtotal se actualice automáticamente
   - Verificar que el total general se recalcule
   - Cambiar el precio unitario y verificar los cálculos

#### ✅ CU-V009: Validar Tipos de Venta

**Descripción:** El sistema valida que el tipo de venta seleccionado sea consistente con los ítems y el flujo de la transacción.

**Funcionalidades:**

- ✅ Opciones de tipo de venta: "Intercambio", "Venta Completa", "Venta de Vacíos", "Compra de Vacíos"
- ✅ Reglas de validación específicas para cada tipo
- ✅ Mensajes de error si la selección es inconsistente

**Cómo Probar:**

1. En el formulario de ventas:
   - Probar diferentes tipos de venta
   - Verificar que se apliquen las reglas de validación correspondientes
   - Verificar que se muestren mensajes de error si la selección es inconsistente

#### ✅ CU-V010: Gestionar Métodos de Pago

**Descripción:** El vendedor puede seleccionar el método de pago y el sistema aplica las validaciones o campos adicionales necesarios.

**Funcionalidades:**

- ✅ Opciones de método de pago: "Efectivo", "Transferencia", "Crédito"
- ✅ Campos adicionales condicionales según el método de pago
- ✅ Validación de los campos adicionales
- ✅ Generación de comprobante o registro según el método

**Cómo Probar:**

1. En el formulario de ventas:
   - Seleccionar diferentes métodos de pago
   - Verificar que se muestren los campos adicionales correspondientes
   - Verificar que se apliquen las validaciones necesarias

#### ✅ CU-V019: Gestionar Cilindros Vacíos

**Descripción:** En ventas de tipo "Intercambio" o "Compra de Vacíos", el vendedor puede registrar los detalles de los cilindros vacíos recibidos.

**Funcionalidades:**

- ✅ Campos para ingresar la marca y el color de cada cilindro vacío
- ✅ Asignación automática del color según la marca
- ✅ Validación de la cantidad de cilindros vacíos esperados vs. recibidos
- ✅ Registro de los cilindros vacíos en el inventario o en el reporte de ruta

**Cómo Probar:**

1. En el formulario de ventas:
   - Seleccionar tipo de venta "Intercambio" o "Compra de Vacíos"
   - Verificar que se muestren los campos para cilindros vacíos
   - Ingresar la información de los cilindros vacíos
   - Verificar que se apliquen las validaciones correspondientes

#### ✅ CU-V020: Validar Stock por Tipo

**Descripción:** El sistema valida el stock disponible específicamente para cada tipo de cilindro.

**Funcionalidades:**

- ✅ Consulta de inventario detallada por cada `product_type`
- ✅ Mensajes de error específicos si un tipo de cilindro no tiene stock suficiente
- ✅ Indicadores visuales del estado de stock (disponible, bajo, agotado) para cada tipo de cilindro

**Cómo Probar:**

1. En el formulario de ventas:
   - Seleccionar diferentes tipos de cilindros
   - Verificar que se muestren los indicadores de stock correspondientes
   - Verificar que se muestren mensajes de error específicos si no hay stock suficiente

### 🔄 Categoría: Sincronización y Offline

#### ✅ CU-V011: Modo Offline

**Descripción:** El vendedor puede registrar ventas incluso sin conexión a internet.

**Funcionalidades:**

- ✅ Detección automática del estado de conexión
- ✅ Almacenamiento local de las ventas realizadas en modo offline
- ✅ Indicador visual claro de que la aplicación está en modo offline
- ✅ Todas las funcionalidades de registro de venta operativas offline

**Cómo Probar:**

1. En el formulario de ventas:
   - Simular modo offline usando el componente `OfflineTester`
   - Verificar que se muestre el indicador de estado offline
   - Registrar una venta en modo offline
   - Verificar que se almacene localmente

#### ✅ CU-V012: Sincronización Automática

**Descripción:** Las ventas registradas en modo offline se sincronizan automáticamente con el servidor cuando se restablece la conexión.

**Funcionalidades:**

- ✅ Detección de reconexión a internet
- ✅ Proceso de envío en segundo plano de las ventas pendientes
- ✅ Notificaciones de éxito o fallo de la sincronización
- ✅ Actualización del estado de las ventas pendientes

**Cómo Probar:**

1. En el formulario de ventas:
   - Simular modo offline y registrar una venta
   - Simular reconexión a internet
   - Verificar que la venta se sincronice automáticamente
   - Verificar que se muestren las notificaciones correspondientes

#### ✅ CU-V013: Sincronización Manual

**Descripción:** El vendedor puede forzar una sincronización manual de las ventas pendientes en cualquier momento.

**Funcionalidades:**

- ✅ Botón "Sincronizar" visible en el panel de ventas
- ✅ Indicador visual de que la sincronización está en progreso
- ✅ Reporte de resultados de la sincronización manual

**Cómo Probar:**

1. En el formulario de ventas:
   - Simular modo offline y registrar una venta
   - Hacer clic en el botón "Sincronizar"
   - Verificar que se muestre el indicador de progreso
   - Verificar que se muestre el reporte de resultados

### 📝 Categoría: Formularios y UX

#### ✅ CU-V014: Validar Campos Obligatorios

**Descripción:** El sistema asegura que todos los campos requeridos en el formulario de ventas estén completos antes de permitir el envío.

**Funcionalidades:**

- ✅ Marcado visual de campos obligatorios
- ✅ Mensajes de error claros si un campo obligatorio está vacío
- ✅ Prevención del envío del formulario si hay campos obligatorios sin completar

**Cómo Probar:**

1. En el formulario de ventas:
   - Intentar enviar el formulario sin completar campos obligatorios
   - Verificar que se muestren mensajes de error
   - Verificar que el formulario no se envíe
   - Completar los campos obligatorios y verificar que se permita el envío

#### ✅ CU-V015: Mostrar Errores de Validación

**Descripción:** El sistema proporciona retroalimentación clara y específica al usuario sobre cualquier error de validación.

**Funcionalidades:**

- ✅ Mensajes de error debajo de cada campo afectado
- ✅ Resaltado visual de los campos con errores
- ✅ Actualización de los mensajes de error en tiempo real

**Cómo Probar:**

1. En el formulario de ventas:
   - Ingresar datos inválidos en los campos
   - Verificar que se muestren mensajes de error específicos
   - Verificar que los campos se resalten visualmente
   - Corregir los errores y verificar que los mensajes desaparezcan

### 🔄 Categoría: Flujo de Usuario

#### ✅ CU-V016: Confirmar Venta

**Descripción:** Antes de finalizar una venta, el sistema muestra un resumen y solicita confirmación al vendedor.

**Funcionalidades:**

- ✅ Modal o sección de confirmación con un resumen detallado de la venta
- ✅ Botones claros para "Confirmar Venta" y "Cancelar"
- ✅ Prevención de registro accidental

**Cómo Probar:**

1. En el formulario de ventas:
   - Completar todos los campos necesarios
   - Hacer clic en "Registrar Venta"
   - Verificar que se muestre el modal de confirmación
   - Verificar que se muestre un resumen detallado
   - Probar los botones de confirmar y cancelar

#### ✅ CU-V017: Resetear Formulario

**Descripción:** Después de una venta exitosa, el formulario se resetea automáticamente a su estado inicial.

**Funcionalidades:**

- ✅ Limpieza de todos los campos de entrada
- ✅ Eliminación de ítems agregados
- ✅ Restablecimiento de la selección de cliente
- ✅ Preparación del formulario para una nueva venta

**Cómo Probar:**

1. En el formulario de ventas:
   - Completar y confirmar una venta
   - Verificar que el formulario se resetee automáticamente
   - Verificar que todos los campos estén limpios
   - Verificar que se pueda iniciar una nueva venta

### 📱 Categoría: Interfaz de Usuario

#### ✅ CU-V018: Mostrar Estado de Conexión

**Descripción:** El vendedor puede ver fácilmente el estado actual de la conexión a internet y la actividad de sincronización.

**Funcionalidades:**

- ✅ Icono o badge que indica "Online" o "Offline"
- ✅ Indicador de la última vez que se realizó una sincronización
- ✅ Contador de ventas pendientes de sincronizar

**Cómo Probar:**

1. En el formulario de ventas:
   - Verificar que se muestre el indicador de estado de conexión
   - Simular cambios en el estado de conexión
   - Verificar que se actualice el indicador
   - Verificar que se muestre el contador de ventas pendientes

### 📊 Categoría: Historial y Reportes

#### ✅ CU-V021: Mostrar Historial de Ventas

**Descripción:** El vendedor puede ver un historial de sus ventas realizadas durante el día.

**Funcionalidades:**

- ✅ Lista de ventas del día actual
- ✅ Detalles básicos de cada venta (cliente, monto, hora)
- ✅ Posibilidad de filtrar o buscar ventas
- ✅ Acceso a detalles completos de una venta específica

**Cómo Probar:**

1. En el panel de ventas:
   - Verificar que se muestre el historial de ventas del día
   - Verificar que se muestren los detalles básicos
   - Probar las funciones de filtrado y búsqueda
   - Acceder a los detalles completos de una venta

#### ✅ CU-V022: Exportar Datos de Ventas

**Descripción:** El vendedor puede exportar los datos de sus ventas para respaldo o análisis.

**Funcionalidades:**

- ✅ Opción para exportar ventas (ej. en formato CSV o PDF)
- ✅ Selección de rango de fechas para la exportación
- ✅ Generación y descarga del archivo de exportación

**Cómo Probar:**

1. En el panel de ventas:
   - Hacer clic en la opción de exportar
   - Seleccionar el rango de fechas
   - Verificar que se genere el archivo
   - Verificar que se descargue correctamente

### 🛠️ Categoría: Manejo de Errores

#### ✅ CU-V023: Gestionar Errores de Red

**Descripción:** El sistema maneja de forma robusta los errores de red, informando al usuario y adaptándose a la situación.

**Funcionalidades:**

- ✅ Detección de fallos en las llamadas a la API
- ✅ Mensajes de error amigables para el usuario
- ✅ Transición automática a modo offline si la conexión se pierde
- ✅ Reintento automático de operaciones fallidas al restablecer la conexión

**Cómo Probar:**

1. En el formulario de ventas:
   - Simular fallos en la conexión
   - Verificar que se muestren mensajes de error amigables
   - Verificar que se transite automáticamente a modo offline
   - Verificar que se reintenten las operaciones al restablecer la conexión

### ⚡ Categoría: Rendimiento y Optimización

#### ✅ CU-V024: Optimizar Rendimiento

**Descripción:** La aplicación está optimizada para ser rápida y fluida, especialmente en dispositivos móviles.

**Funcionalidades:**

- ✅ Carga perezosa de componentes y datos
- ✅ Uso eficiente de hooks de React para evitar re-renders innecesarios
- ✅ Estrategias de caching para datos frecuentes
- ✅ Monitoreo de rendimiento para identificar cuellos de botella

**Cómo Probar:**

1. En el formulario de ventas:
   - Verificar que la carga inicial sea rápida
   - Verificar que las interacciones sean fluidas
   - Verificar que no haya re-renders innecesarios
   - Verificar que los datos se cachem correctamente

### 🧪 Categoría: Pruebas y Calidad

#### ✅ CU-V025: Pruebas de Integración

**Descripción:** Existe una suite de pruebas automatizadas que valida la integración de todos los componentes y funcionalidades del panel de ventas.

**Funcionalidades:**

- ✅ Scripts de prueba que simulan el flujo completo de los casos de uso
- ✅ Verificación de la interacción entre el frontend, el backend y el almacenamiento local
- ✅ Reporte claro de los resultados de las pruebas
- ✅ Ejecución automatizada en entornos de CI/CD

**Cómo Probar:**

1. Ejecutar el script de pruebas:
   ```bash
   node scripts/test-vendor-sales.js
   ```
2. Verificar que se ejecuten todas las pruebas
3. Verificar que se genere un reporte claro de resultados
4. Verificar que se identifiquen y reporten los fallos

## 🚀 Cómo Ejecutar las Pruebas

### Pruebas Automatizadas

1. **Ejecutar el script de pruebas:**

   ```bash
   node scripts/test-vendor-sales.js
   ```

2. **Verificar los resultados:**
   - El script ejecutará todas las pruebas
   - Generará un reporte detallado de resultados
   - Mostrará un resumen por categorías
   - Identificará las pruebas fallidas

### Pruebas Manuales

1. **Acceder a la página de pruebas:**

   - Ir a `/dashboard/vendor/test-sales`
   - Verificar que se carguen todos los componentes

2. **Probar cada funcionalidad:**
   - Seguir las instrucciones específicas para cada caso de uso
   - Verificar que se cumplan todas las funcionalidades
   - Reportar cualquier fallo o comportamiento inesperado

## 📊 Interpretación de Resultados

### Pruebas Exitosas (✅)

- La funcionalidad se comporta como se espera
- Se cumplen todos los requisitos del caso de uso
- No se presentan errores o comportamientos inesperados

### Pruebas Fallidas (❌)

- La funcionalidad no se comporta como se espera
- No se cumplen algunos o todos los requisitos del caso de uso
- Se presentan errores o comportamientos inesperados

### Recomendaciones

- Revisar las pruebas fallidas antes de continuar
- Verificar la implementación de los casos de uso fallidos
- Considerar las recomendaciones específicas por categoría

## 🔧 Solución de Problemas

### Problemas Comunes

1. **Error de conexión:**

   - Verificar que el servidor esté ejecutándose
   - Verificar la configuración de la base de datos
   - Verificar la configuración de la API

2. **Error de validación:**

   - Verificar que se cumplan todos los requisitos de validación
   - Verificar que se muestren mensajes de error claros
   - Verificar que se prevenga el envío de formularios inválidos

3. **Error de sincronización:**
   - Verificar que se detecte correctamente el estado de conexión
   - Verificar que se almacenen correctamente las ventas offline
   - Verificar que se sincronicen correctamente las ventas pendientes

### Contacto

Si encuentras problemas o tienes preguntas sobre las pruebas, contacta al equipo de desarrollo.
