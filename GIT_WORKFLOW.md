# 🔄 Git Flow - Sistema de Gestión de Cilindros de Gas

## 📋 Resumen del Flujo de Trabajo

Este proyecto utiliza **Git Flow** para mantener un desarrollo organizado y controlado. Cada feature se desarrolla en ramas separadas antes de integrarse a la rama principal.

## 🌳 Estructura de Ramas

### Ramas Principales

- **`main`** - Código de producción estable
- **`develop`** - Código de desarrollo integrado

### Ramas de Feature

- **`feature/nombre-descriptivo`** - Nuevas funcionalidades
- **`hotfix/nombre-descriptivo`** - Correcciones urgentes en producción

## 🚀 Flujo de Trabajo

### 1. Desarrollo de Features

```bash
# 1. Crear nueva rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nombre-de-la-feature

# 2. Desarrollar la feature
# ... hacer commits ...

# 3. Hacer push de la rama
git push origin feature/nombre-de-la-feature

# 4. Crear Pull Request hacia develop
# (Usar GitHub/GitLab interface)

# 5. Después de merge, limpiar rama local
git checkout develop
git pull origin develop
git branch -d feature/nombre-de-la-feature
```

### 2. Release a Producción

```bash
# 1. Crear rama de release desde develop
git checkout develop
git checkout -b release/version-x.x.x

# 2. Preparar release (versionado, changelog, etc.)
# ... hacer commits de preparación ...

# 3. Merge a main y develop
git checkout main
git merge release/version-x.x.x
git tag -a vx.x.x -m "Release version x.x.x"

git checkout develop
git merge release/version-x.x.x

# 4. Push cambios y tags
git push origin main develop
git push origin vx.x.x

# 5. Limpiar rama de release
git branch -d release/version-x.x.x
```

## 📝 Convenciones de Commits

### Formato

```
tipo(scope): descripción breve

Descripción detallada del cambio (opcional)

- Lista de cambios específicos
- Referencias a issues/tasks
```

### Tipos de Commit

- **`feat`** - Nueva funcionalidad
- **`fix`** - Corrección de bugs
- **`docs`** - Documentación
- **`style`** - Formato, espacios, etc.
- **`refactor`** - Refactorización de código
- **`test`** - Agregar o modificar tests
- **`chore`** - Tareas de mantenimiento

### Ejemplos

```bash
feat(database): Add inventory management tables
fix(auth): Resolve login validation issue
docs(api): Update API documentation
refactor(ui): Simplify component structure
```

## 🏷️ Naming de Ramas

### Features

- `feature/database-schema-implementation`
- `feature/user-authentication`
- `feature/inventory-management`
- `feature/realtime-dashboard`

### Hotfixes

- `hotfix/critical-security-patch`
- `hotfix/login-bug-fix`

### Releases

- `release/v1.0.0`
- `release/v1.1.0`

## 📊 Estado Actual del Proyecto

### ✅ Features Completadas

- **`feature/database-schema-implementation`** - Esquema completo de base de datos
  - 9 tablas principales implementadas
  - Sistema de auditoría completo
  - Validaciones y optimizaciones
  - Migraciones versionadas

### 🔄 En Desarrollo

- **`feature/realtime-dashboard`** - Panel "En Ruta" en tiempo real (próximo)

### 📋 Próximas Features

- `feature/inventory-management` - Gestión de inventario
- `feature/sales-transactions` - Procesamiento de ventas
- `feature/expense-tracking` - Seguimiento de gastos
- `feature/goals-system` - Sistema de metas

## 🛠️ Comandos Útiles

### Verificar Estado

```bash
git status
git branch -a
git log --oneline --graph
```

### Limpiar Ramas Locales

```bash
git branch --merged | grep -v main | grep -v develop | xargs -n 1 git branch -d
```

### Sincronizar con Remoto

```bash
git fetch origin
git checkout develop
git pull origin develop
```

## 📋 Checklist para Features

### Antes de Crear PR

- [ ] Código funciona correctamente
- [ ] Tests pasan (si existen)
- [ ] Documentación actualizada
- [ ] Commits con mensajes descriptivos
- [ ] Rama actualizada con develop

### Antes de Merge a Main

- [ ] Feature probada en staging
- [ ] Documentación completa
- [ ] Changelog actualizado
- [ ] Versionado correcto
- [ ] Backup de producción (si es necesario)

## 🔒 Políticas de Seguridad

### Protección de Ramas

- **`main`** - Requiere PR y review
- **`develop`** - Requiere PR
- **Features** - Desarrollo libre

### Acceso

- Solo administradores pueden hacer merge directo a `main`
- Todos los desarrolladores pueden crear features
- Code review obligatorio para cambios críticos

## 📞 Contacto y Soporte

Para dudas sobre el flujo de trabajo:

- Revisar este documento
- Consultar con el equipo de desarrollo
- Crear issue en el repositorio

---

**Última actualización**: 2024-12-12
**Versión del flujo**: 1.0
