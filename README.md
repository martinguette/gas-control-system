# Gas Control - Sistema de Gestión

Sistema profesional de login y gestión para la industria del gas, construido con Next.js 15, TypeScript y ShadCN UI.

## 🚀 Características

- **Next.js 15** con App Router y TypeScript en modo estricto
- **ShadCN UI** para componentes profesionales
- **Autenticación mock** con simulación de JWT
- **Dashboards diferenciados** por roles (Admin/Vendedor)
- **Diseño responsive** optimizado para escritorio y móvil
- **Validación de formularios** con React Hook Form + Zod
- **Arquitectura escalable** preparada para integración backend

## 📋 Credenciales de Prueba

### Administrador (Jefe)
- **Email:** admin@gaspardo.com
- **Contraseña:** admin123
- **Acceso:** Dashboard administrativo completo

### Vendedor
- **Email:** vendor@gaspardo.com
- **Contraseña:** vendor123
- **Acceso:** Panel móvil optimizado para vendedores

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18.0.0 o superior
- npm o yarn

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
\`\`\`bash
# Si tienes el código en un repositorio
git clone <repository-url>
cd gas-control-system

# O descomprimir el archivo ZIP descargado
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
\`\`\`

3. **Ejecutar en modo desarrollo**
\`\`\`bash
npm run dev
\`\`\`

4. **Abrir en el navegador**
\`\`\`
http://localhost:3000
\`\`\`

## 📁 Estructura del Proyecto

\`\`\`
src/
├── app/
│   ├── globals.css              # Estilos globales y tokens de diseño
│   ├── layout.tsx               # Layout principal con AuthProvider
│   ├── page.tsx                 # Página de login
│   └── dashboard/
│       ├── admin/
│       │   └── page.tsx         # Dashboard administrativo
│       └── vendor/
│           └── page.tsx         # Dashboard vendedor
├── components/
│   ├── ui/                      # Componentes ShadCN UI
│   ├── auth/
│   │   └── login-form.tsx       # Formulario de login
│   └── layout/
│       ├── admin-layout.tsx     # Layout para admin
│       └── vendor-layout.tsx    # Layout para vendedor
├── lib/
│   ├── utils.ts                 # Utilidades generales
│   ├── validations.ts           # Esquemas de validación Zod
│   └── auth.ts                  # Lógica de autenticación mock
├── types/
│   └── index.ts                 # Definiciones TypeScript
└── hooks/
    └── use-auth.ts              # Hook de autenticación
\`\`\`

## 🎨 Sistema de Diseño

### Paleta de Colores
- **Primario:** #374151 (Gray-700) - Botones principales
- **Secundario:** #6366f1 (Blue) - Acentos y alertas
- **Neutrales:** Blancos y grises para fondos y texto
- **Destructivo:** #e53e3e - Estados de error

### Tipografía
- **Geist Sans:** Texto principal y UI
- **Geist Mono:** Código y elementos monoespaciados

## 🔐 Sistema de Autenticación

### Características
- **Simulación realista** de API con delays de 1-2 segundos
- **Tokens JWT mock** almacenados en localStorage
- **Validación de sesión** automática al cargar la aplicación
- **Redirección basada en roles** después del login
- **Estados de carga** y manejo de errores

### Flujo de Autenticación
1. Usuario ingresa credenciales
2. Validación con usuarios mock
3. Generación de token JWT simulado
4. Almacenamiento en localStorage
5. Redirección según rol:
   - **Jefe** → `/dashboard/admin`
   - **Vendedor** → `/dashboard/vendor`

## 📱 Dashboards

### Dashboard Administrativo
- **Diseño:** Optimizado para escritorio
- **Layout:** Sidebar con navegación completa
- **Características:**
  - Métricas y estadísticas
  - Gestión de usuarios
  - Reportes avanzados
  - Configuración del sistema

### Dashboard Vendedor
- **Diseño:** Optimizado para móvil
- **Layout:** Header + contenido + navegación inferior
- **Características:**
  - Acciones rápidas
  - Registro de ventas
  - Métricas personales
  - Interfaz táctil

## 🚀 Scripts Disponibles

\`\`\`bash
# Desarrollo
npm run dev

# Construcción para producción
npm run build

# Ejecutar versión de producción
npm start

# Linting
npm run lint

# Verificación de tipos TypeScript
npm run type-check
\`\`\`

## 🔧 Configuración de Desarrollo

### ESLint y Prettier
El proyecto incluye configuración completa para:
- Linting automático con ESLint
- Formateo de código con Prettier
- Reglas específicas para Next.js y TypeScript

### Variables de Entorno (Futuro)
Preparado para integración con variables de entorno:
\`\`\`env
# Ejemplo para futuras integraciones
DATABASE_URL=
JWT_SECRET=
API_BASE_URL=
\`\`\`

## 🏗️ Arquitectura para Integración Backend

### Puntos de Integración Preparados

1. **Servicio de Autenticación** (`lib/auth.ts`)
   - Reemplazar funciones mock con llamadas API reales
   - Implementar refresh tokens
   - Agregar validación de permisos

2. **Rutas API** (Preparadas en `/app/api/`)
   - Endpoints de autenticación
   - CRUD de usuarios
   - Gestión de ventas
   - Reportes y analytics

3. **Base de Datos**
   - Esquemas TypeScript definidos
   - Modelos de Usuario, Venta, Producto
   - Migraciones preparadas

4. **Middleware de Seguridad**
   - Protección de rutas
   - Validación de tokens
   - Control de acceso basado en roles

## 🐛 Solución de Problemas

### Errores Comunes

**Error: Cannot find module**
\`\`\`bash
# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install
\`\`\`

**Error de TypeScript**
\`\`\`bash
# Verificar tipos
npm run type-check
\`\`\`

**Problemas de estilos**
\`\`\`bash
# Verificar que Tailwind CSS esté configurado
npm run dev
\`\`\`

### Logs de Desarrollo
El sistema incluye logs detallados para debugging:
- Estados de autenticación
- Navegación entre rutas
- Errores de validación

## 📈 Próximas Funcionalidades

### Fase 1 - Backend Integration
- [ ] API REST con Express/Fastify
- [ ] Base de datos PostgreSQL/MySQL
- [ ] Autenticación JWT real
- [ ] Middleware de seguridad

### Fase 2 - Funcionalidades Avanzadas
- [ ] Gestión de inventario
- [ ] Sistema de reportes
- [ ] Notificaciones en tiempo real
- [ ] Integración con sistemas externos

### Fase 3 - Optimizaciones
- [ ] PWA (Progressive Web App)
- [ ] Modo offline
- [ ] Optimización de rendimiento
- [ ] Tests automatizados

## 📞 Soporte

Para problemas técnicos o consultas:
1. Revisar la documentación
2. Verificar los logs de consola
3. Comprobar la configuración de dependencias
4. Contactar al equipo de desarrollo

## 📄 Licencia

Este proyecto es privado y está destinado únicamente para uso interno de la organización.

---

**Versión:** 1.0.0  
**Última actualización:** Diciembre 2024  
**Tecnologías:** Next.js 15, TypeScript, ShadCN UI, Tailwind CSS
# gas-control-system
