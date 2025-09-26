# 📋 Casos de Uso Detallados - Panel de Ventas de Vendedores

Este documento detalla todos los casos de uso específicos para el panel de ventas de vendedores, desmenuzando cada funcionalidad en casos de uso granulares y específicos.

## 🎯 Casos de Uso de Ventas

### CU-V001: Registrar Venta Básica

**Descripción:** Permitir al vendedor registrar una venta con un solo producto.

**Flujo Principal:**

1. Vendedor selecciona un cliente (existente o nuevo)
2. Vendedor selecciona un tipo de cilindro (33lb, 40lb, 100lb)
3. Vendedor ingresa la cantidad (mínimo 1)
4. Sistema calcula automáticamente el total
5. Vendedor selecciona tipo de venta (intercambio, completa, venta_vacios, compra_vacios)
6. Vendedor selecciona método de pago (efectivo, transferencia, crédito)
7. Vendedor confirma la venta
8. Sistema procesa la venta y actualiza inventario

**Criterios de Aceptación:**

- ✅ Formulario debe validar campos obligatorios
- ✅ Cálculo automático de totales
- ✅ Validación de inventario disponible
- ✅ Confirmación antes de procesar
- ✅ Actualización de inventario en tiempo real

**Casos de Error:**

- Stock insuficiente
- Cliente no seleccionado
- Campos obligatorios vacíos
- Error de conectividad

---

### CU-V002: Registrar Venta Múltiples Items

**Descripción:** Permitir al vendedor registrar una venta con múltiples productos diferentes.

**Flujo Principal:**

1. Vendedor selecciona un cliente
2. Vendedor agrega primer producto con cantidad
3. Vendedor hace clic en "Agregar Ítem"
4. Vendedor selecciona segundo producto con cantidad
5. Sistema calcula totales por item y total general
6. Vendedor puede agregar hasta 10 items diferentes
7. Vendedor selecciona tipo de venta y método de pago
8. Vendedor confirma la venta

**Criterios de Aceptación:**

- ✅ Máximo 10 items por venta
- ✅ Cada item debe tener tipo de producto único
- ✅ Cálculo automático de totales por item
- ✅ Cálculo automático de total general
- ✅ Validación de inventario para todos los items
- ✅ Posibilidad de eliminar items individuales

**Casos de Error:**

- Exceder límite de 10 items
- Items duplicados del mismo tipo
- Stock insuficiente en cualquier item
- Error en cálculo de totales

---

### CU-V003: Cambiar Precios Unitarios

**Descripción:** Permitir al vendedor modificar precios unitarios en tiempo real durante la venta.

**Flujo Principal:**

1. Vendedor selecciona producto y cantidad
2. Sistema muestra precio estándar
3. Vendedor puede modificar el precio unitario
4. Sistema recalcula automáticamente el total del item
5. Sistema recalcula el total general de la venta
6. Cambios se reflejan inmediatamente en la interfaz

**Criterios de Aceptación:**

- ✅ Precio unitario editable en tiempo real
- ✅ Recalculación automática de totales
- ✅ Validación de precios (mínimo $0.01)
- ✅ Formato de moneda correcto
- ✅ Persistencia de cambios durante la sesión

**Casos de Error:**

- Precio inválido (negativo o cero)
- Error en cálculo de totales
- Pérdida de cambios por error de red

---

### CU-V004: Crear Cliente Nuevo

**Descripción:** Permitir al vendedor crear un nuevo cliente directamente desde el formulario de ventas.

**Flujo Principal:**

1. Vendedor hace clic en "Crear Cliente Nuevo"
2. Se abre modal/formulario de creación de cliente
3. Vendedor ingresa nombre del cliente (obligatorio)
4. Vendedor ingresa teléfono (opcional)
5. Vendedor ingresa ubicación (obligatorio)
6. Vendedor puede configurar precios personalizados (opcional)
7. Vendedor confirma creación del cliente
8. Sistema crea el cliente y lo selecciona automáticamente
9. Formulario de venta se actualiza con datos del nuevo cliente

**Criterios de Aceptación:**

- ✅ Validación de campos obligatorios
- ✅ Creación exitosa del cliente
- ✅ Selección automática del cliente creado
- ✅ Aplicación de precios personalizados si se configuraron
- ✅ Persistencia en base de datos

**Casos de Error:**

- Nombre duplicado
- Campos obligatorios vacíos
- Error de conectividad durante creación
- Validación de formato de teléfono

---

### CU-V005: Seleccionar Cliente Existente

**Descripción:** Permitir al vendedor buscar y seleccionar un cliente existente de la base de datos.

**Flujo Principal:**

1. Vendedor hace clic en "Seleccionar Cliente Existente"
2. Se abre selector de clientes con búsqueda
3. Vendedor puede buscar por nombre, teléfono o ubicación
4. Sistema muestra resultados en tiempo real
5. Vendedor selecciona cliente de la lista
6. Formulario se autocompleta con datos del cliente
7. Se aplican precios personalizados si existen

**Criterios de Aceptación:**

- ✅ Búsqueda en tiempo real
- ✅ Autocompletado de campos
- ✅ Aplicación de precios personalizados
- ✅ Búsqueda por múltiples campos
- ✅ Resultados ordenados por relevancia

**Casos de Error:**

- Cliente no encontrado
- Error de conectividad
- Datos de cliente corruptos
- Precios personalizados no aplicados

---

### CU-V006: Aplicar Precios Personalizados

**Descripción:** Aplicar automáticamente precios personalizados cuando se selecciona un cliente que los tiene configurados.

**Flujo Principal:**

1. Vendedor selecciona cliente con precios personalizados
2. Sistema detecta precios personalizados del cliente
3. Sistema aplica automáticamente precios personalizados a los productos
4. Interfaz muestra indicador visual de precios personalizados
5. Cálculos se realizan con precios personalizados
6. Vendedor puede sobrescribir precios si es necesario

**Criterios de Aceptación:**

- ✅ Detección automática de precios personalizados
- ✅ Aplicación automática a productos correspondientes
- ✅ Indicador visual de precios personalizados
- ✅ Posibilidad de sobrescribir precios
- ✅ Cálculos correctos con precios personalizados

**Casos de Error:**

- Precios personalizados no detectados
- Error en aplicación de precios
- Conflicto entre precios personalizados y estándar

---

## 🛡️ Casos de Uso de Validación

### CU-V007: Validar Inventario Disponible

**Descripción:** Verificar que hay suficiente inventario disponible antes de permitir la venta.

**Flujo Principal:**

1. Vendedor selecciona productos y cantidades
2. Sistema consulta inventario disponible en tiempo real
3. Sistema valida disponibilidad para cada producto
4. Sistema muestra estado de inventario visualmente
5. Sistema bloquea venta si hay stock insuficiente
6. Sistema muestra mensajes de error específicos

**Criterios de Aceptación:**

- ✅ Consulta de inventario en tiempo real
- ✅ Validación por tipo de producto
- ✅ Indicadores visuales de disponibilidad
- ✅ Bloqueo de venta con stock insuficiente
- ✅ Mensajes de error claros y específicos

**Casos de Error:**

- Stock insuficiente
- Error de conectividad
- Inventario desactualizado
- Producto no encontrado en inventario

---

### CU-V008: Calcular Totales Automáticos

**Descripción:** Calcular automáticamente totales por item y total general de la venta.

**Flujo Principal:**

1. Vendedor ingresa cantidad y precio unitario
2. Sistema calcula total por item (cantidad × precio)
3. Sistema suma todos los totales de items
4. Sistema actualiza total general en tiempo real
5. Sistema muestra desglose de cálculos
6. Sistema valida que cálculos sean correctos

**Criterios de Aceptación:**

- ✅ Cálculo automático en tiempo real
- ✅ Precisión en cálculos decimales
- ✅ Actualización inmediata de totales
- ✅ Desglose claro de cálculos
- ✅ Validación de precisión matemática

**Casos de Error:**

- Error en cálculo matemático
- Pérdida de precisión decimal
- Total no actualizado
- Desglose incorrecto

---

### CU-V009: Validar Tipos de Venta

**Descripción:** Validar que el tipo de venta seleccionado sea apropiado y consistente.

**Flujo Principal:**

1. Vendedor selecciona tipo de venta
2. Sistema valida tipo seleccionado
3. Sistema aplica reglas específicas por tipo
4. Sistema muestra campos adicionales si es necesario
5. Sistema valida consistencia con productos seleccionados
6. Sistema muestra advertencias si hay inconsistencias

**Tipos de Venta y Validaciones:**

- **Intercambio:** -1 lleno, +1 vacío
- **Completa:** -1 lleno únicamente
- **Venta Vacíos:** -1 vacío
- **Compra Vacíos:** +1 vacío

**Criterios de Aceptación:**

- ✅ Validación de tipo seleccionado
- ✅ Aplicación de reglas por tipo
- ✅ Campos adicionales según tipo
- ✅ Validación de consistencia
- ✅ Advertencias de inconsistencias

**Casos de Error:**

- Tipo de venta inválido
- Inconsistencia con productos
- Reglas no aplicadas correctamente

---

### CU-V010: Gestionar Métodos de Pago

**Descripción:** Permitir selección y validación de métodos de pago disponibles.

**Flujo Principal:**

1. Vendedor selecciona método de pago
2. Sistema valida método seleccionado
3. Sistema muestra campos adicionales si es necesario
4. Sistema aplica validaciones específicas por método
5. Sistema registra método de pago en la venta
6. Sistema genera comprobante según método

**Métodos de Pago:**

- **Efectivo:** Sin campos adicionales
- **Transferencia:** Validación de número de transacción
- **Crédito:** Validación de términos de crédito

**Criterios de Aceptación:**

- ✅ Validación de método seleccionado
- ✅ Campos adicionales según método
- ✅ Validaciones específicas por método
- ✅ Registro correcto del método
- ✅ Generación de comprobante apropiado

**Casos de Error:**

- Método de pago inválido
- Campos adicionales no completados
- Error en validación específica

---

## 🔄 Casos de Uso de Sincronización

### CU-V011: Modo Offline

**Descripción:** Permitir al vendedor continuar trabajando sin conexión a internet.

**Flujo Principal:**

1. Sistema detecta pérdida de conexión
2. Sistema cambia a modo offline automáticamente
3. Sistema muestra indicador de estado offline
4. Vendedor puede continuar registrando ventas
5. Sistema almacena ventas localmente
6. Sistema muestra ventas pendientes de sincronización

**Criterios de Aceptación:**

- ✅ Detección automática de estado offline
- ✅ Indicador visual de estado offline
- ✅ Funcionalidad completa en modo offline
- ✅ Almacenamiento local de ventas
- ✅ Lista de ventas pendientes

**Casos de Error:**

- Detección incorrecta de estado
- Pérdida de datos en modo offline
- Error en almacenamiento local

---

### CU-V012: Sincronización Automática

**Descripción:** Sincronizar automáticamente ventas pendientes cuando se restablece la conexión.

**Flujo Principal:**

1. Sistema detecta restablecimiento de conexión
2. Sistema identifica ventas pendientes
3. Sistema inicia sincronización automática
4. Sistema envía ventas una por una
5. Sistema actualiza estado de sincronización
6. Sistema limpia ventas sincronizadas

**Criterios de Aceptación:**

- ✅ Detección automática de reconexión
- ✅ Identificación de ventas pendientes
- ✅ Sincronización automática
- ✅ Envío individual de ventas
- ✅ Actualización de estado
- ✅ Limpieza de datos sincronizados

**Casos de Error:**

- Sincronización fallida
- Pérdida de ventas durante sincronización
- Error en actualización de estado

---

### CU-V013: Sincronización Manual

**Descripción:** Permitir al vendedor forzar sincronización manual de ventas pendientes.

**Flujo Principal:**

1. Vendedor hace clic en "Sincronizar"
2. Sistema muestra ventas pendientes
3. Vendedor confirma sincronización
4. Sistema inicia proceso de sincronización
5. Sistema muestra progreso de sincronización
6. Sistema reporta resultados de sincronización

**Criterios de Aceptación:**

- ✅ Botón de sincronización manual
- ✅ Lista de ventas pendientes
- ✅ Confirmación de sincronización
- ✅ Indicador de progreso
- ✅ Reporte de resultados

**Casos de Error:**

- Sincronización manual fallida
- Error en proceso de sincronización
- Pérdida de progreso

---

## ✅ Casos de Uso de Validación de Formularios

### CU-V014: Validar Campos Obligatorios

**Descripción:** Validar que todos los campos obligatorios estén completados antes de permitir el envío.

**Flujo Principal:**

1. Vendedor intenta enviar formulario
2. Sistema valida campos obligatorios
3. Sistema identifica campos faltantes
4. Sistema muestra errores específicos
5. Sistema resalta campos con errores
6. Sistema previene envío hasta corrección

**Campos Obligatorios:**

- Nombre del cliente
- Ubicación del cliente
- Al menos un producto
- Tipo de venta
- Método de pago

**Criterios de Aceptación:**

- ✅ Validación de campos obligatorios
- ✅ Identificación de campos faltantes
- ✅ Mensajes de error específicos
- ✅ Resaltado visual de errores
- ✅ Prevención de envío con errores

**Casos de Error:**

- Validación no ejecutada
- Campos obligatorios no identificados
- Mensajes de error no mostrados

---

### CU-V015: Mostrar Errores de Validación

**Descripción:** Mostrar mensajes de error claros y específicos para ayudar al vendedor a corregir problemas.

**Flujo Principal:**

1. Sistema detecta error de validación
2. Sistema genera mensaje de error específico
3. Sistema muestra mensaje en ubicación apropiada
4. Sistema resalta campo relacionado
5. Sistema mantiene mensaje hasta corrección
6. Sistema actualiza mensaje en tiempo real

**Criterios de Aceptación:**

- ✅ Mensajes de error claros y específicos
- ✅ Ubicación apropiada de mensajes
- ✅ Resaltado de campos relacionados
- ✅ Persistencia hasta corrección
- ✅ Actualización en tiempo real

**Casos de Error:**

- Mensajes de error confusos
- Mensajes en ubicación incorrecta
- Mensajes no actualizados

---

## 🔄 Casos de Uso de Flujo de Venta

### CU-V016: Confirmar Venta

**Descripción:** Mostrar resumen de la venta y solicitar confirmación antes de procesar.

**Flujo Principal:**

1. Vendedor completa formulario de venta
2. Vendedor hace clic en "Registrar Venta"
3. Sistema muestra modal de confirmación
4. Sistema presenta resumen completo de la venta
5. Vendedor revisa detalles
6. Vendedor confirma o cancela
7. Sistema procesa venta si se confirma

**Criterios de Aceptación:**

- ✅ Modal de confirmación
- ✅ Resumen completo de venta
- ✅ Opciones de confirmar/cancelar
- ✅ Procesamiento solo con confirmación
- ✅ Cancelación sin pérdida de datos

**Casos de Error:**

- Modal no mostrado
- Resumen incompleto
- Procesamiento sin confirmación

---

### CU-V017: Resetear Formulario

**Descripción:** Limpiar automáticamente el formulario después de una venta exitosa.

**Flujo Principal:**

1. Sistema procesa venta exitosamente
2. Sistema muestra mensaje de éxito
3. Sistema resetea todos los campos del formulario
4. Sistema vuelve a estado inicial
5. Sistema mantiene datos de cliente si es necesario
6. Sistema está listo para nueva venta

**Criterios de Aceptación:**

- ✅ Reseteo automático después de éxito
- ✅ Limpieza de todos los campos
- ✅ Vuelta a estado inicial
- ✅ Preservación de datos relevantes
- ✅ Listo para nueva venta

**Casos de Error:**

- Formulario no reseteado
- Campos no limpiados
- Estado inicial no restaurado

---

## 📱 Casos de Uso de Interfaz

### CU-V018: Mostrar Estado de Conexión

**Descripción:** Mostrar indicador visual del estado de conexión en tiempo real.

**Flujo Principal:**

1. Sistema monitorea estado de conexión
2. Sistema actualiza indicador visual
3. Sistema muestra estado actual (online/offline)
4. Sistema muestra tiempo desde última sincronización
5. Sistema muestra número de ventas pendientes
6. Sistema permite acciones según estado

**Criterios de Aceptación:**

- ✅ Monitoreo en tiempo real
- ✅ Indicador visual claro
- ✅ Estado actual mostrado
- ✅ Tiempo de última sincronización
- ✅ Contador de ventas pendientes
- ✅ Acciones contextuales

**Casos de Error:**

- Estado no actualizado
- Indicador visual confuso
- Información incorrecta

---

### CU-V019: Gestionar Cilindros Vacíos (Intercambio)

**Descripción:** Manejar cilindros vacíos en transacciones de intercambio.

**Flujo Principal (actualizado):**

1. Tras seleccionar/crear cliente, vendedor selecciona tipo de venta "intercambio"
2. Sistema muestra sección para registrar vacíos recibidos (marca, tipo, cantidad)
3. Vendedor captura todos los vacíos entregados por el cliente
4. Sistema agrupa por tipo y calcula automáticamente los cilindros llenos a entregar
5. Sistema bloquea edición manual de items (tipo, cantidad, unit_cost) para mantener consistencia
6. Sistema valida que la suma de vacíos recibidos sea igual a la suma de items a entregar
7. Sistema registra el intercambio y actualiza inventario: -llenos por tipo, +vacíos por marca y tipo

**Marcas y Colores:**

- Roscogas → Naranja
- Gasan → Azul
- Gaspais → Verde Oscuro
- Vidagas → Verde Claro

**Criterios de Aceptación (actualizados):**

- ✅ Sección de vacíos recibidos visible al elegir "intercambio"
- ✅ Captura de marca, tipo y cantidad por cada vacío
- ✅ Bloqueo de edición manual de items durante intercambio
- ✅ Suma de vacíos == suma de items a entregar
- ✅ Actualización de inventario: -llenos, +vacíos por marca/tipo
- ✅ Ejemplo: 1×33lb, 3×40lb, 1×100lb entregados si vacíos recibidos suman esas cantidades por tipo

**Casos de Error:**

- Campos no mostrados
- Color no asignado
- Validación fallida

---

### CU-V020: Validar Stock por Tipo

**Descripción:** Validar disponibilidad de stock específicamente por tipo de cilindro.

**Flujo Principal:**

1. Vendedor selecciona tipo de cilindro
2. Sistema consulta stock específico del tipo
3. Sistema valida disponibilidad
4. Sistema muestra estado del stock
5. Sistema bloquea si no hay disponibilidad
6. Sistema actualiza en tiempo real

**Criterios de Aceptación:**

- ✅ Consulta por tipo específico
- ✅ Validación de disponibilidad
- ✅ Estado de stock mostrado
- ✅ Bloqueo con stock insuficiente
- ✅ Actualización en tiempo real

**Casos de Error:**

- Consulta incorrecta
- Validación fallida
- Estado no actualizado

---

## 📊 Casos de Uso de Historial y Reportes

### CU-V021: Mostrar Historial de Ventas

**Descripción:** Mostrar historial de ventas del día actual para el vendedor.

**Flujo Principal:**

1. Vendedor accede a historial de ventas
2. Sistema carga ventas del día actual
3. Sistema muestra lista de ventas
4. Sistema permite filtrar y buscar
5. Sistema muestra detalles de cada venta
6. Sistema actualiza en tiempo real

**Criterios de Aceptación:**

- ✅ Carga de ventas del día
- ✅ Lista clara de ventas
- ✅ Filtros y búsqueda
- ✅ Detalles de cada venta
- ✅ Actualización en tiempo real

**Casos de Error:**

- Ventas no cargadas
- Lista no mostrada
- Filtros no funcionando

---

### CU-V022: Exportar Datos de Ventas

**Descripción:** Permitir exportar datos de ventas para respaldo o análisis.

**Flujo Principal:**

1. Vendedor solicita exportación
2. Sistema prepara datos de ventas
3. Sistema genera archivo de exportación
4. Sistema permite descarga
5. Sistema confirma exportación exitosa
6. Sistema registra actividad de exportación

**Criterios de Aceptación:**

- ✅ Preparación de datos
- ✅ Generación de archivo
- ✅ Descarga disponible
- ✅ Confirmación de éxito
- ✅ Registro de actividad

**Casos de Error:**

- Datos no preparados
- Archivo no generado
- Descarga fallida

---

## 🛠️ Casos de Uso de Manejo de Errores

### CU-V023: Gestionar Errores de Red

**Descripción:** Manejar errores de conectividad de manera elegante.

**Flujo Principal:**

1. Sistema detecta error de red
2. Sistema cambia a modo offline
3. Sistema muestra mensaje de error apropiado
4. Sistema permite continuar trabajando
5. Sistema almacena datos localmente
6. Sistema reintenta conexión automáticamente

**Criterios de Aceptación:**

- ✅ Detección de errores de red
- ✅ Cambio a modo offline
- ✅ Mensajes de error apropiados
- ✅ Continuidad de trabajo
- ✅ Almacenamiento local
- ✅ Reintento automático

**Casos de Error:**

- Error no detectado
- Modo offline no activado
- Datos perdidos

---

### CU-V024: Optimizar Rendimiento

**Descripción:** Optimizar rendimiento de la aplicación en dispositivos móviles.

**Flujo Principal:**

1. Sistema monitorea rendimiento
2. Sistema optimiza carga de datos
3. Sistema implementa lazy loading
4. Sistema cachea datos frecuentes
5. Sistema minimiza re-renders
6. Sistema optimiza para móviles

**Criterios de Aceptación:**

- ✅ Monitoreo de rendimiento
- ✅ Optimización de carga
- ✅ Lazy loading implementado
- ✅ Cache de datos
- ✅ Minimización de re-renders
- ✅ Optimización móvil

**Casos de Error:**

- Rendimiento degradado
- Carga lenta
- Cache no funcionando

---

## 🧪 Casos de Uso de Pruebas

### CU-V025: Pruebas de Integración

**Descripción:** Ejecutar suite completa de pruebas para validar todos los casos de uso.

**Flujo Principal:**

1. Sistema ejecuta pruebas automatizadas
2. Sistema valida cada caso de uso
3. Sistema reporta resultados
4. Sistema identifica fallos
5. Sistema genera reporte detallado
6. Sistema sugiere correcciones

**Criterios de Aceptación:**

- ✅ Ejecución automatizada
- ✅ Validación de casos de uso
- ✅ Reporte de resultados
- ✅ Identificación de fallos
- ✅ Reporte detallado
- ✅ Sugerencias de corrección

**Casos de Error:**

- Pruebas no ejecutadas
- Validación fallida
- Reporte incompleto

---

## 📈 Métricas de Éxito

### Rendimiento

- Carga inicial: ≤ 3 segundos
- Registro de ventas: ≤ 2 segundos
- Actualización de inventario: ≤ 1 segundo
- Sincronización: ≤ 5 segundos por venta

### Disponibilidad

- 99.5% uptime durante horario laboral
- Sincronización offline: 99%+ exitosa
- Recuperación de errores: ≤ 30 segundos

### Usabilidad

- 100% adopción de vendedores en 30 días
- 0 instancias de inventario negativo
- Tiempo de capacitación: ≤ 2 horas
- Tasa de error de usuario: ≤ 5%

### Funcionalidad

- 100% de casos de uso implementados
- 95%+ de pruebas automatizadas pasando
- 0 pérdida de datos en modo offline
- 100% de ventas sincronizadas exitosamente

---

## 🔄 Flujo de Trabajo Completo

### Flujo Típico de Venta

1. **Inicio de Sesión** → Vendedor accede al sistema
2. **Selección de Cliente** → Crear nuevo o seleccionar existente
3. **Configuración de Productos** → Agregar items con cantidades
4. **Aplicación de Precios** → Estándar o personalizados
5. **Validación de Inventario** → Verificar disponibilidad
6. **Configuración de Venta** → Tipo y método de pago
7. **Confirmación** → Revisar y confirmar venta
8. **Procesamiento** → Registrar y actualizar inventario
9. **Sincronización** → Enviar datos al servidor
10. **Limpieza** → Resetear formulario para nueva venta

### Flujo de Manejo de Errores

1. **Detección** → Sistema detecta error
2. **Clasificación** → Identificar tipo de error
3. **Notificación** → Mostrar mensaje al usuario
4. **Recuperación** → Implementar estrategia de recuperación
5. **Logging** → Registrar error para análisis
6. **Seguimiento** → Monitorear resolución

---

Este documento proporciona una base sólida para la implementación completa del panel de ventas de vendedores, asegurando que todos los aspectos funcionales, técnicos y de experiencia de usuario estén cubiertos de manera exhaustiva.
