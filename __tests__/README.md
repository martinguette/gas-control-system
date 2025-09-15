# Pruebas Automatizadas - Sistema de Autenticación

Este directorio contiene las pruebas automatizadas para el sistema de autenticación del proyecto Gas Control.

## 📁 Estructura de Pruebas

```
__tests__/
├── lib/
│   └── validations.test.ts          # Pruebas de validaciones Zod
├── components/
│   └── auth/
│       ├── login-form.test.tsx      # Pruebas del formulario de login
│       └── signup-form.test.tsx     # Pruebas del formulario de registro
├── actions/
│   └── auth.test.ts                 # Pruebas de server actions
├── integration/
│   └── auth-flow.test.tsx           # Pruebas de flujo completo
└── README.md                        # Este archivo
```

## 🧪 Tipos de Pruebas

### 1. **Pruebas de Validaciones** (`lib/validations.test.ts`)

- ✅ Validación de esquemas Zod para login y registro
- ✅ Validación de emails, contraseñas, nombres y roles
- ✅ Validación de coincidencia de contraseñas
- ✅ Transformaciones automáticas (email a lowercase)

### 2. **Pruebas de Componentes** (`components/auth/`)

- ✅ Renderizado correcto de formularios
- ✅ Validación en tiempo real
- ✅ Manejo de estados de carga
- ✅ Alternancia de visibilidad de contraseñas
- ✅ Navegación entre formularios
- ✅ Manejo de mensajes de error

### 3. **Pruebas de Server Actions** (`actions/auth.test.ts`)

- ✅ Registro de usuarios exitoso
- ✅ Login con diferentes roles
- ✅ Manejo de errores de autenticación
- ✅ Validación del lado del servidor
- ✅ Redirecciones correctas

### 4. **Pruebas de Integración** (`integration/auth-flow.test.tsx`)

- ✅ Flujo completo de registro
- ✅ Flujo completo de login
- ✅ Validación en tiempo real de contraseñas
- ✅ Navegación entre formularios
- ✅ Estados de carga

## 🚀 Comandos de Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas con cobertura
npm run test:coverage

# Ejecutar pruebas específicas
npm test __tests__/lib/validations.test.ts
npm test __tests__/components/auth/
npm test __tests__/actions/auth.test.ts
npm test __tests__/integration/auth-flow.test.tsx
```

## 📊 Cobertura de Pruebas

Las pruebas cubren:

- **Validaciones Zod**: 100% de casos de validación
- **Formularios**: Renderizado, interacciones, validaciones
- **Server Actions**: Casos exitosos y de error
- **Flujos de Usuario**: Registro, login, navegación

## 🔧 Configuración

### Jest Configuration (`jest.config.js`)

- Configuración para Next.js
- Soporte para TypeScript
- Mapeo de rutas con `@/`
- Entorno jsdom para pruebas de componentes

### Setup (`jest.setup.js`)

- Configuración de Testing Library
- Mocks de Next.js navigation
- Mocks de funciones del servidor

## 📝 Casos de Prueba Cubiertos

### Login Form

- ✅ Renderizado correcto
- ✅ Validación de campos requeridos
- ✅ Validación de formato de email
- ✅ Validación de longitud de contraseña
- ✅ Alternancia de visibilidad de contraseña
- ✅ Estado de carga
- ✅ Navegación a registro
- ✅ Mantenimiento de email en errores

### Signup Form

- ✅ Renderizado correcto
- ✅ Validación de todos los campos
- ✅ Validación de caracteres en nombre
- ✅ Selección de roles (jefe/vendedor)
- ✅ Validación en tiempo real de contraseñas
- ✅ Alternancia de visibilidad de contraseñas
- ✅ Estado de carga
- ✅ Navegación a login

### Server Actions

- ✅ Registro exitoso
- ✅ Login exitoso con roles
- ✅ Manejo de errores de Supabase
- ✅ Validación del servidor
- ✅ Redirecciones correctas
- ✅ Logout

### Validaciones Zod

- ✅ Esquemas de login y registro
- ✅ Validación de emails
- ✅ Validación de contraseñas
- ✅ Validación de nombres
- ✅ Validación de roles
- ✅ Coincidencia de contraseñas
- ✅ Transformaciones automáticas

## 🎯 Objetivos de las Pruebas

1. **Garantizar Funcionalidad**: Verificar que todos los componentes funcionan correctamente
2. **Prevenir Regresiones**: Detectar cambios que rompan funcionalidad existente
3. **Validar UX**: Asegurar buena experiencia de usuario
4. **Cobertura Completa**: Probar casos exitosos y de error
5. **Documentación Viva**: Las pruebas sirven como documentación del comportamiento esperado

## 🔍 Debugging

Si las pruebas fallan:

1. **Verificar mocks**: Asegurar que los mocks estén configurados correctamente
2. **Revisar selectores**: Verificar que los selectores de Testing Library sean correctos
3. **Comprobar async**: Usar `waitFor` para operaciones asíncronas
4. **Logs de consola**: Usar `screen.debug()` para ver el DOM renderizado

## 📈 Métricas de Calidad

- **Cobertura de Código**: >90%
- **Casos de Prueba**: 50+ tests
- **Tiempo de Ejecución**: <5 segundos
- **Casos de Error**: Cubiertos
- **Casos de Éxito**: Cubiertos
