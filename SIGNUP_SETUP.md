# Configuración del Sistema de Registro

## Descripción

Se ha implementado un sistema completo de registro de usuarios con los siguientes campos:

- **full_name**: Nombre completo del usuario
- **email**: Correo electrónico
- **role**: Rol del usuario (jefe/administrador o vendedor)
- **password**: Contraseña
- **repeatPassword**: Confirmación de contraseña

## Archivos Creados/Modificados

### Nuevos Archivos:

- `components/auth/signup-form.tsx` - Formulario de registro
- `app/sign-up/page.tsx` - Página de registro
- `app/error/page.tsx` - Página de manejo de errores
- `database-setup.sql` - Script SQL para configurar la base de datos

### Archivos Modificados:

- `lib/validations.ts` - Agregado schema de validación para registro
- `actions/auth.ts` - Actualizada función de registro
- `types/index.ts` - Actualizados tipos de usuario
- `components/auth/login-form.tsx` - Agregado enlace a registro

## Configuración de Base de Datos

### 1. Ejecutar Script SQL

1. Ve a tu proyecto de Supabase
2. Abre el SQL Editor
3. Copia y pega el contenido de `database-setup.sql`
4. Ejecuta el script

### 2. Verificar Configuración

- La tabla `profiles` debe estar creada
- Las políticas de seguridad (RLS) deben estar habilitadas
- Los triggers deben estar configurados

## Variables de Entorno Requeridas

Asegúrate de tener configuradas estas variables en tu `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_clave_publica
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
```

## Funcionalidades Implementadas

### Validaciones:

- Nombre completo mínimo 2 caracteres
- Email válido
- Rol debe ser 'jefe' o 'vendedor'
- Contraseña mínimo 6 caracteres
- Las contraseñas deben coincidir

### Seguridad:

- Row Level Security (RLS) habilitado
- Políticas de acceso por usuario
- Validación de contraseñas
- Manejo de errores

### UX:

- Formulario responsivo
- Indicadores de carga
- Mensajes de error claros
- Navegación entre login y registro
- Iconos descriptivos para cada campo

## Flujo de Registro

1. Usuario llena el formulario de registro
2. Se validan todos los campos
3. Se crea la cuenta en Supabase Auth
4. Se crea el perfil en la tabla `profiles`
5. Se redirige al usuario al login con mensaje de éxito
6. Usuario debe verificar su email antes de poder iniciar sesión

## Próximos Pasos Recomendados

1. **Verificación de Email**: Implementar sistema de verificación de email
2. **Perfil de Usuario**: Crear página para editar perfil
3. **Recuperación de Contraseña**: Implementar sistema de reset de contraseña
4. **Validaciones Adicionales**: Agregar validaciones de fortaleza de contraseña
5. **Logs de Auditoría**: Implementar sistema de logs para registros

## Solución de Problemas

### Error: "Table 'profiles' does not exist"

- Ejecuta el script SQL en Supabase
- Verifica que la tabla se haya creado correctamente

### Error: "Row Level Security policy violation"

- Verifica que las políticas RLS estén configuradas
- Asegúrate de que el usuario esté autenticado

### Error: "Invalid role value"

- Verifica que el rol sea exactamente 'jefe' o 'vendedor'
- Revisa la validación en el schema de Zod

## Notas Técnicas

- El sistema usa **Supabase Auth** para autenticación
- **React Hook Form** + **Zod** para validaciones
- **Tailwind CSS** para estilos
- **Lucide React** para iconos
- **Next.js 14** con App Router
