# 🚀 Guía Rápida de TDD - Gas Control System

## 🎯 ¿Qué es TDD?

**Test-Driven Development (TDD)** es una metodología de desarrollo donde escribes los tests **ANTES** de escribir el código. Esto garantiza que tu código funcione correctamente y te permite refactorizar con confianza.

## 🔄 El Ciclo TDD

### **1. 🔴 RED - Escribir Test Fallido**

```typescript
// 1. Escribir test que describe lo que quieres
it('debe validar que el email es requerido', () => {
  const result = loginSchema.safeParse({
    email: '',
    password: 'password123'
  });

  expect(result.success).toBe(false);
  expect(result.error.errors[0].message).toBe('El email es requerido');
});

// 2. Ejecutar test - DEBE FALLAR
npm test
// ❌ Expected: false, Received: true
```

### **2. 🟢 GREEN - Hacer que Pase**

```typescript
// 3. Escribir código MÍNIMO para hacer pasar el test
const loginSchema = z.object({
  email: z.string().min(1, 'El email es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

// 4. Ejecutar test - DEBE PASAR
npm test
// ✅ PASS
```

### **3. 🔵 REFACTOR - Mejorar Código**

```typescript
// 5. Mejorar el código manteniendo tests verdes
const loginSchema = z.object({
  email: z.string()
    .min(1, 'El email es requerido')
    .email('Por favor ingresa un email válido')
    .max(100, 'El email es demasiado largo'),
  password: z.string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga')
});

// 6. Ejecutar tests - DEBEN SEGUIR PASANDO
npm test
// ✅ PASS
```

## 🛠️ Comandos Esenciales

### **Desarrollo con TDD**

```bash
# Modo watch para desarrollo TDD
npm run test:watch

# Ver cobertura mientras desarrollas
npm run test:coverage

# E2E tests para flujos completos
npm run test:e2e
```

### **Testing por Feature**

```bash
# Tests específicos
npm test __tests__/lib/validations.test.ts
npm test __tests__/components/auth/
npm test e2e/auth.spec.ts
```

## 📝 Ejemplos Prácticos

### **Ejemplo 1: Validación de Formulario**

#### **🔴 RED - Test Fallido**

```typescript
describe('SignUpForm', () => {
  it('debe validar que las contraseñas coincidan', async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    await user.type(screen.getByLabelText('Contraseña'), 'password123');
    await user.type(
      screen.getByLabelText('Repetir Contraseña'),
      'different123'
    );

    expect(
      screen.getByText('Las contraseñas no coinciden')
    ).toBeInTheDocument();
  });
});
```

#### **🟢 GREEN - Implementación Mínima**

```typescript
// En el componente
const signUpSchema = z
  .object({
    // ... otros campos
    password: z.string(),
    repeatPassword: z.string(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['repeatPassword'],
  });
```

#### **🔵 REFACTOR - Mejorar**

```typescript
// Agregar validación en tiempo real
useEffect(() => {
  if (password && repeatPassword) {
    form.trigger('repeatPassword');
  }
}, [password, repeatPassword, form]);
```

### **Ejemplo 2: Server Action**

#### **🔴 RED - Test Fallido**

```typescript
describe('signUp', () => {
  it('debe crear usuario exitosamente', async () => {
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');

    await signUp(formData);

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

#### **🟢 GREEN - Implementación Mínima**

```typescript
export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();
  await supabase.auth.signUp({
    email,
    password,
  });
}
```

#### **🔵 REFACTOR - Mejorar**

```typescript
export async function signUp(formData: FormData) {
  // Validación con Zod
  const result = serverSignUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    // ... otros campos
  });

  if (!result.success) {
    redirect(
      `/sign-up?message=${encodeURIComponent(result.error.errors[0].message)}`
    );
  }

  // Implementación mejorada con manejo de errores
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        full_name: result.data.full_name,
        role: result.data.role,
      },
    },
  });

  if (error) {
    // Manejo de errores específicos
    const errorMessage = mapSupabaseError(error.message);
    redirect(`/sign-up?message=${encodeURIComponent(errorMessage)}`);
  }

  // Éxito
  revalidatePath('/', 'layout');
  redirect(
    '/log-in?message=' +
      encodeURIComponent(
        'Cuenta creada exitosamente. Por favor, verifica tu email e inicia sesión.'
      )
  );
}
```

## 🎯 Reglas de Oro del TDD

### **1. Nunca Escribas Código Sin Test**

- Si no hay test, no hay código
- El test define el comportamiento esperado
- El código existe para hacer pasar el test

### **2. Mantén Tests Simples**

- Un test, una responsabilidad
- Tests deben ser legibles y descriptivos
- Evita tests complejos o con mucha lógica

### **3. Refactoriza Constantemente**

- Mejora el código después de cada test verde
- Elimina duplicación
- Mejora legibilidad y performance

### **4. Tests Rápidos**

- Unit tests deben ejecutarse en milisegundos
- E2E tests pueden ser más lentos
- Usa mocks para dependencias externas

## 🚨 Errores Comunes

### **❌ Escribir Mucho Código Sin Tests**

```typescript
// MALO: Escribir toda la función sin tests
export function calculateTotal(items: Item[]) {
  // 50 líneas de código complejo
  return items.reduce((total, item) => {
    // lógica compleja
  }, 0);
}
```

### **✅ Escribir Tests Incrementales**

```typescript
// BUENO: Test por test
it('debe calcular total de lista vacía', () => {
  expect(calculateTotal([])).toBe(0);
});

it('debe calcular total de un item', () => {
  expect(calculateTotal([{ price: 10 }])).toBe(10);
});

it('debe calcular total de múltiples items', () => {
  expect(calculateTotal([{ price: 10 }, { price: 20 }])).toBe(30);
});
```

### **❌ Tests Dependientes**

```typescript
// MALO: Tests que dependen de otros
describe('User Management', () => {
  let user: User;

  it('debe crear usuario', () => {
    user = createUser({ name: 'John' });
    expect(user.id).toBeDefined();
  });

  it('debe actualizar usuario', () => {
    // Depende del test anterior
    updateUser(user.id, { name: 'Jane' });
    expect(user.name).toBe('Jane');
  });
});
```

### **✅ Tests Independientes**

```typescript
// BUENO: Cada test es independiente
describe('User Management', () => {
  it('debe crear usuario', () => {
    const user = createUser({ name: 'John' });
    expect(user.id).toBeDefined();
  });

  it('debe actualizar usuario', () => {
    const user = createUser({ name: 'John' });
    const updatedUser = updateUser(user.id, { name: 'Jane' });
    expect(updatedUser.name).toBe('Jane');
  });
});
```

## 📊 Métricas de Éxito

### **Indicadores de TDD Exitoso**

- ✅ **Tests pasan**: Todos los tests están verdes
- ✅ **Cobertura alta**: 80%+ en código crítico
- ✅ **Tests rápidos**: Unit tests < 1 segundo
- ✅ **Refactoring seguro**: Puedes cambiar código sin miedo
- ✅ **Documentación viva**: Tests documentan el comportamiento

### **Señales de Alerta**

- ❌ **Tests lentos**: Unit tests > 5 segundos
- ❌ **Tests frágiles**: Se rompen con cambios menores
- ❌ **Cobertura baja**: < 70% en código crítico
- ❌ **Tests complejos**: Difíciles de entender
- ❌ **Mocks excesivos**: Demasiadas dependencias mockeadas

## 🚀 Flujo de Trabajo Diario

### **1. Antes de Empezar**

```bash
# Verificar que todos los tests pasan
npm test

# Ver cobertura actual
npm run test:coverage
```

### **2. Desarrollo de Feature**

```bash
# Modo watch para desarrollo TDD
npm run test:watch

# En otra terminal, desarrollo
npm run dev
```

### **3. Antes de Commit**

```bash
# Ejecutar todos los tests
npm run test:all

# Verificar cobertura
npm run test:coverage
```

### **4. Antes de Push**

```bash
# Tests completos incluyendo E2E
npm run test:ci
```

## 💡 Tips Avanzados

### **1. Test Naming**

```typescript
// BUENO: Descriptivo y específico
it('debe rechazar email inválido cuando no tiene @', () => {
  // test implementation
});

// MALO: Genérico
it('debe validar email', () => {
  // test implementation
});
```

### **2. Arrange-Act-Assert**

```typescript
it('debe calcular descuento del 10% para compras > $100', () => {
  // Arrange - Preparar datos
  const items = [
    { price: 60, quantity: 1 },
    { price: 50, quantity: 1 },
  ];

  // Act - Ejecutar acción
  const total = calculateTotal(items);
  const discount = calculateDiscount(total);

  // Assert - Verificar resultado
  expect(discount).toBe(11); // 10% de $110
});
```

### **3. Mocking Efectivo**

```typescript
// Mock solo lo necesario
jest.mock('@/actions/auth', () => ({
  signUp: jest.fn(),
  logIn: jest.fn(),
}));

// No mockear todo
// jest.mock('@/utils/supabase/server'); // Solo si es necesario
```

---

**Recuerda**: TDD no es solo escribir tests, es una forma de pensar sobre el diseño de tu código. Los tests te guían hacia un código más limpio, modular y mantenible.

¡Happy Testing! 🧪✨
