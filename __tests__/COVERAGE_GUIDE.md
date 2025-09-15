# 📊 Guía de Code Coverage

## ¿Qué es Code Coverage?

**Code Coverage** es una métrica que mide qué porcentaje de tu código está siendo ejecutado por las pruebas automatizadas. Es como un "termómetro" de calidad que te dice qué tan bien cubiertas están las diferentes partes de tu aplicación.

## 🎯 Tipos de Coverage

### **1. Statement Coverage (% Stmts)**

- **Qué mide**: Porcentaje de líneas de código ejecutadas
- **Ejemplo**: Si tienes 100 líneas y las pruebas ejecutan 85, tienes 85% de cobertura
- **Importante**: Es la métrica más común y fácil de entender

### **2. Branch Coverage (% Branch)**

- **Qué mide**: Porcentaje de ramas condicionales probadas
- **Ejemplo**:
  ```typescript
  if (user.role === 'jefe') {
    // Rama 1: jefe
  } else {
    // Rama 2: vendedor
  }
  ```
- **Importante**: Una línea puede tener múltiples ramas (if/else, switch, ternarios)

### **3. Function Coverage (% Funcs)**

- **Qué mide**: Porcentaje de funciones que fueron llamadas
- **Ejemplo**: Si tienes 10 funciones y las pruebas llaman 8, tienes 80%
- **Importante**: Te dice si estás probando todas las funciones

### **4. Line Coverage (% Lines)**

- **Qué mide**: Porcentaje de líneas ejecutadas (similar a Statement)
- **Diferencia**: Puede variar ligeramente por comentarios y líneas vacías

## 📈 Interpretando tu Coverage Actual

### **✅ BUENO - `validations.ts`**

```
validations.ts      |   72.72 |      100 |      50 |   85.71 | 92
```

- **72.72% Stmts**: La mayoría de las validaciones están cubiertas
- **100% Branch**: Todas las ramas condicionales están probadas
- **50% Funcs**: La mitad de las funciones están cubiertas
- **85.71% Lines**: La mayoría de las líneas están ejecutadas
- **Línea 92**: No cubierta (probablemente un caso edge)

### **❌ PROBLEMA - `auth.ts`**

```
auth.ts             |       0 |        0 |       0 |       0 | 3-170
```

- **0% en todo**: Las server actions no se están probando
- **Causa**: Los mocks no están funcionando correctamente
- **Impacto**: No sabemos si las funciones de autenticación funcionan

### **❌ PROBLEMA - Componentes**

```
login-form.tsx      |       0 |        0 |       0 |       0 | 3-153
signup-form.tsx     |       0 |        0 |       0 |       0 | 3-300
```

- **0% en todo**: Los componentes no se están probando
- **Causa**: Mismo problema con los mocks
- **Impacto**: No sabemos si la UI funciona correctamente

## 🎯 Metas de Coverage Recomendadas

### **Mínimo Aceptable**

- **Statements**: 70%
- **Branches**: 60%
- **Functions**: 70%
- **Lines**: 70%

### **Bueno**

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

### **Excelente**

- **Statements**: 90%
- **Branches**: 85%
- **Functions**: 90%
- **Lines**: 90%

## 🔍 Cómo Leer el Reporte

### **Formato de la Tabla**

```
File                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
validations.ts        |   72.72 |      100 |      50 |   85.71 | 92
```

### **Interpretación**

- **% Stmts**: 72.72% de las declaraciones están cubiertas
- **% Branch**: 100% de las ramas están cubiertas
- **% Funcs**: 50% de las funciones están cubiertas
- **% Lines**: 85.71% de las líneas están cubiertas
- **Uncovered Line #s**: La línea 92 no está cubierta

## 🚨 Señales de Alerta

### **Coverage Muy Bajo (< 50%)**

- **Riesgo**: Alto riesgo de bugs en producción
- **Acción**: Escribir más pruebas inmediatamente

### **Branch Coverage Bajo**

- **Riesgo**: Casos edge no probados
- **Acción**: Agregar pruebas para if/else, switch, ternarios

### **Function Coverage Bajo**

- **Riesgo**: Funciones no utilizadas o no probadas
- **Acción**: Probar todas las funciones públicas

## 🛠️ Cómo Mejorar Coverage

### **1. Identificar Gaps**

```bash
# Ejecutar coverage y ver líneas no cubiertas
npm run test:coverage
```

### **2. Escribir Pruebas para Casos Faltantes**

```typescript
// Si la línea 92 no está cubierta, agregar prueba:
it('debe manejar caso edge específico', () => {
  // Prueba para cubrir línea 92
});
```

### **3. Probar Ramas Condicionales**

```typescript
// Probar ambos lados de un if
it('debe manejar usuario jefe', () => {
  // Prueba para rama jefe
});

it('debe manejar usuario vendedor', () => {
  // Prueba para rama vendedor
});
```

### **4. Probar Funciones No Cubiertas**

```typescript
// Si una función no está cubierta, agregar prueba:
it('debe ejecutar función no probada', () => {
  // Prueba para la función
});
```

## 📊 Comandos Útiles

```bash
# Coverage completo
npm run test:coverage

# Coverage de archivo específico
npm test __tests__/lib/validations.test.ts -- --coverage

# Coverage con umbral mínimo
npm test -- --coverage --coverageThreshold='{"global":{"statements":80}}'

# Coverage en modo watch
npm test -- --coverage --watch
```

## 🎯 Tu Situación Actual

### **Lo que está funcionando** ✅

- **Validaciones Zod**: 72.72% coverage - ¡Buen trabajo!
- **Pruebas de validación**: 13/13 pasando

### **Lo que necesita atención** ⚠️

- **Server Actions**: 0% coverage - Crítico
- **Componentes**: 0% coverage - Crítico
- **Mocks**: No funcionan correctamente

### **Próximos Pasos** 🚀

1. **Arreglar mocks** para que las pruebas de componentes funcionen
2. **Probar server actions** para cubrir la lógica de autenticación
3. **Probar componentes** para cubrir la UI
4. **Meta**: Llegar a 80%+ coverage en archivos críticos

## 💡 Tips para Coverage Efectivo

### **No obsesionarse con 100%**

- **80-90%** es un buen objetivo
- **100%** puede ser contraproducente (pruebas innecesarias)

### **Enfocarse en código crítico**

- **Autenticación**: Debe tener coverage alto
- **Validaciones**: Debe tener coverage alto
- **UI crítica**: Debe tener coverage alto

### **Coverage como herramienta, no como meta**

- **Objetivo**: Encontrar bugs, no alcanzar números
- **Calidad > Cantidad**: Mejor 80% de pruebas buenas que 100% de pruebas malas

## 🔧 Herramientas Adicionales

### **Coverage Visual**

```bash
# Generar reporte HTML
npm test -- --coverage --coverageReporters=html
# Abrir coverage/lcov-report/index.html
```

### **Coverage en CI/CD**

```yaml
# GitHub Actions
- name: Run tests with coverage
  run: npm test -- --coverage --coverageThreshold='{"global":{"statements":80}}'
```

### **Coverage Badges**

```markdown
![Coverage](https://img.shields.io/badge/coverage-85%25-green)
```

---

**Recuerda**: Coverage es una herramienta para mejorar la calidad, no un fin en sí mismo. ¡Enfócate en escribir pruebas que realmente encuentren bugs!
