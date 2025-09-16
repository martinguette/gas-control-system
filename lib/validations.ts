import { z } from 'zod';
import {
  CYLINDER_TYPES,
  CYLINDER_BRANDS,
  CYLINDER_COLORS,
} from '@/types/inventory';

// Esquemas de validación mejorados con mensajes más específicos
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Por favor ingresa un email válido')
    .max(255, 'El email es demasiado largo'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga'),
});

export const signUpSchema = z
  .object({
    full_name: z
      .string()
      .min(1, 'El nombre completo es requerido')
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre es demasiado largo')
      .regex(
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        'El nombre solo puede contener letras y espacios'
      ),
    email: z
      .string()
      .min(1, 'El email es requerido')
      .email('Por favor ingresa un email válido')
      .max(255, 'El email es demasiado largo')
      .toLowerCase(),
    role: z.enum(['jefe', 'vendedor'], {
      required_error: 'Por favor selecciona un rol',
      invalid_type_error: 'El rol seleccionado no es válido',
    }),
    password: z
      .string()
      .min(1, 'La contraseña es requerida')
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(100, 'La contraseña es demasiado larga'),
    repeatPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['repeatPassword'],
  });

// Esquemas para validación del servidor (sin transformaciones)
export const serverLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido')
    .max(255, 'El email es demasiado largo'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga'),
});

export const serverSignUpSchema = z
  .object({
    full_name: z
      .string()
      .min(1, 'El nombre completo es requerido')
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre es demasiado largo')
      .regex(
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        'El nombre solo puede contener letras y espacios'
      ),
    email: z
      .string()
      .min(1, 'El email es requerido')
      .email('Email inválido')
      .max(255, 'El email es demasiado largo')
      .toLowerCase(),
    role: z.enum(['jefe', 'vendedor'], {
      required_error: 'El rol es requerido',
      invalid_type_error: 'El rol seleccionado no es válido',
    }),
    password: z
      .string()
      .min(1, 'La contraseña es requerida')
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(100, 'La contraseña es demasiado larga'),
    repeatPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['repeatPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ServerLoginData = z.infer<typeof serverLoginSchema>;
export type ServerSignUpData = z.infer<typeof serverSignUpSchema>;

// =====================================================
// ESQUEMAS DE VALIDACIÓN PARA INVENTARIO
// =====================================================

// Esquema para cilindros llenos
export const inventoryFullSchema = z.object({
  type: z.enum(CYLINDER_TYPES as [string, ...string[]], {
    errorMap: () => ({ message: 'Tipo de cilindro no válido' }),
  }),
  quantity: z.number().int().min(0, 'La cantidad no puede ser negativa'),
  unit_cost: z.number().min(0, 'El costo unitario no puede ser negativo'),
});

export const inventoryFullUpdateSchema = z.object({
  quantity: z
    .number()
    .int()
    .min(0, 'La cantidad no puede ser negativa')
    .optional(),
  unit_cost: z
    .number()
    .min(0, 'El costo unitario no puede ser negativo')
    .optional(),
});

// Esquema para cilindros vacíos
export const inventoryEmptySchema = z.object({
  type: z.enum(CYLINDER_TYPES as [string, ...string[]], {
    errorMap: () => ({ message: 'Tipo de cilindro no válido' }),
  }),
  brand: z.enum(CYLINDER_BRANDS as [string, ...string[]], {
    errorMap: () => ({ message: 'Marca de cilindro no válida' }),
  }),
  color: z.enum(CYLINDER_COLORS as [string, ...string[]], {
    errorMap: () => ({ message: 'Color de cilindro no válido' }),
  }),
  quantity: z.number().int().min(0, 'La cantidad no puede ser negativa'),
});

export const inventoryEmptyUpdateSchema = z.object({
  quantity: z
    .number()
    .int()
    .min(0, 'La cantidad no puede ser negativa')
    .optional(),
});

// Esquema para alertas de inventario
export const inventoryAlertSchema = z.object({
  type: z.enum(['full', 'empty'], {
    errorMap: () => ({ message: 'Tipo de alerta no válido' }),
  }),
  product_type: z.enum(CYLINDER_TYPES as [string, ...string[]], {
    errorMap: () => ({ message: 'Tipo de producto no válido' }),
  }),
  brand: z.string().optional(),
  color: z.string().optional(),
  min_threshold: z
    .number()
    .int()
    .min(0, 'El umbral mínimo no puede ser negativo'),
  is_active: z.boolean().optional(),
});

export const inventoryAlertUpdateSchema = z.object({
  min_threshold: z
    .number()
    .int()
    .min(0, 'El umbral mínimo no puede ser negativo')
    .optional(),
  is_active: z.boolean().optional(),
});

// Esquema para operaciones de inventario
export const inventoryOperationSchema = z.object({
  type: z.enum(['add', 'subtract', 'set'], {
    errorMap: () => ({ message: 'Tipo de operación no válido' }),
  }),
  inventory_type: z.enum(['full', 'empty'], {
    errorMap: () => ({ message: 'Tipo de inventario no válido' }),
  }),
  product_type: z.enum(CYLINDER_TYPES as [string, ...string[]], {
    errorMap: () => ({ message: 'Tipo de producto no válido' }),
  }),
  brand: z.string().optional(),
  color: z.string().optional(),
  quantity: z.number().int().min(0, 'La cantidad no puede ser negativa'),
  unit_cost: z
    .number()
    .min(0, 'El costo unitario no puede ser negativo')
    .optional(),
  reason: z
    .string()
    .min(1, 'La razón es requerida')
    .max(500, 'La razón es demasiado larga'),
});

// Tipos inferidos para inventario
export type InventoryFullData = z.infer<typeof inventoryFullSchema>;
export type InventoryFullUpdateData = z.infer<typeof inventoryFullUpdateSchema>;
export type InventoryEmptyData = z.infer<typeof inventoryEmptySchema>;
export type InventoryEmptyUpdateData = z.infer<
  typeof inventoryEmptyUpdateSchema
>;
export type InventoryAlertData = z.infer<typeof inventoryAlertSchema>;
export type InventoryAlertUpdateData = z.infer<
  typeof inventoryAlertUpdateSchema
>;
export type InventoryOperationData = z.infer<typeof inventoryOperationSchema>;

// =====================================================
// ESQUEMAS DE VALIDACIÓN PARA TRANSACCIONES
// =====================================================

// Esquema para items de venta
export const saleItemSchema = z.object({
  product_type: z.enum(['33lb', '40lb', '100lb'], {
    errorMap: () => ({ message: 'Tipo de producto no válido' }),
  }),
  quantity: z
    .number()
    .int()
    .min(1, 'La cantidad debe ser al menos 1')
    .max(100, 'La cantidad no puede ser mayor a 100'),
  unit_cost: z
    .number()
    .min(0, 'El costo unitario no puede ser negativo')
    .max(999999.99, 'El costo unitario es demasiado alto'),
  total_cost: z
    .number()
    .min(0, 'El costo total no puede ser negativo')
    .max(999999.99, 'El costo total es demasiado alto'),
});

// Esquema para ventas
export const saleSchema = z
  .object({
    customer_name: z
      .string()
      .min(1, 'El nombre del cliente es requerido')
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre es demasiado largo')
      .regex(
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        'El nombre solo puede contener letras y espacios'
      ),
    customer_phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[\d\s\-\+\(\)]+$/.test(val),
        'Formato de teléfono inválido'
      ),
    customer_location: z
      .string()
      .min(1, 'La ubicación del cliente es requerida')
      .min(5, 'La ubicación debe tener al menos 5 caracteres')
      .max(200, 'La ubicación es demasiado larga'),
    items: z
      .array(saleItemSchema)
      .min(1, 'Debe agregar al menos un tipo de cilindro')
      .max(10, 'No puede agregar más de 10 tipos de cilindros diferentes'),
    sale_type: z.enum(
      ['intercambio', 'completa', 'venta_vacios', 'compra_vacios'],
      {
        errorMap: () => ({ message: 'Tipo de venta no válido' }),
      }
    ),
    payment_method: z.enum(['efectivo', 'transferencia', 'credito'], {
      errorMap: () => ({ message: 'Método de pago no válido' }),
    }),
  })
  .refine(
    (data) => {
      // Verificar que cada item tenga el total_cost correcto
      return data.items.every(
        (item) =>
          Math.abs(item.total_cost - item.quantity * item.unit_cost) < 0.01
      );
    },
    {
      message:
        'El costo total de cada item debe ser igual a cantidad × costo unitario',
      path: ['items'],
    }
  );

// Esquema para gastos
export const expenseSchema = z.object({
  type: z.enum(['gasolina', 'comida', 'reparaciones', 'imprevistos', 'otros'], {
    errorMap: () => ({ message: 'Tipo de gasto no válido' }),
  }),
  amount: z
    .number()
    .min(0.01, 'El monto debe ser mayor a 0')
    .max(999999.99, 'El monto es demasiado alto'),
  description: z
    .string()
    .min(1, 'La descripción es requerida')
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .max(500, 'La descripción es demasiado larga'),
  receipt_url: z
    .string()
    .url('URL de recibo inválida')
    .optional()
    .or(z.literal('')),
});

// Esquema para clientes
export const customerSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del cliente es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      'El nombre solo puede contener letras y espacios'
    ),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-\+\(\)]+$/.test(val),
      'Formato de teléfono inválido'
    ),
  location: z
    .string()
    .min(1, 'La ubicación es requerida')
    .min(5, 'La ubicación debe tener al menos 5 caracteres')
    .max(200, 'La ubicación es demasiado larga'),
  custom_prices: z.record(z.string(), z.number().min(0)).optional().default({}),
});

// Esquema para llegadas de camión
export const truckArrivalSchema = z.object({
  cylinders_received: z.record(z.string(), z.number().int().min(0)),
  cylinders_delivered: z.record(
    z.string(),
    z.record(z.string(), z.number().int().min(0))
  ),
  unit_cost: z
    .number()
    .min(0, 'El costo unitario no puede ser negativo')
    .max(999999.99, 'El costo unitario es demasiado alto'),
  total_invoice: z
    .number()
    .min(0, 'El total de la factura no puede ser negativo')
    .max(999999.99, 'El total de la factura es demasiado alto'),
  freight_cost: z
    .number()
    .min(0, 'El costo de flete no puede ser negativo')
    .max(999999.99, 'El costo de flete es demasiado alto')
    .default(0),
});

// Esquema para asignaciones diarias
export const dailyAssignmentSchema = z.object({
  vendor_id: z.string().uuid('ID de vendedor inválido'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
  assigned_cylinders: z.record(z.string(), z.number().int().min(0)),
  status: z.enum(['active', 'completed', 'cancelled']).default('active'),
});

// Esquema para metas
export const goalSchema = z
  .object({
    type: z.enum(['general', 'individual'], {
      errorMap: () => ({ message: 'Tipo de meta no válido' }),
    }),
    vendor_id: z.string().uuid('ID de vendedor inválido').optional(),
    period: z.enum(['semanal', 'mensual', 'semestral', 'anual'], {
      errorMap: () => ({ message: 'Período no válido' }),
    }),
    target_kg: z
      .number()
      .min(0.1, 'La meta debe ser mayor a 0 kg')
      .max(999999.99, 'La meta es demasiado alta'),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
    status: z.enum(['active', 'completed', 'cancelled']).default('active'),
  })
  .refine(
    (data) => {
      // La fecha de inicio debe ser anterior a la fecha de fin
      return new Date(data.start_date) < new Date(data.end_date);
    },
    {
      message: 'La fecha de inicio debe ser anterior a la fecha de fin',
      path: ['end_date'],
    }
  );

// Tipos inferidos para transacciones
export type SaleData = z.infer<typeof saleSchema>;
export type ExpenseData = z.infer<typeof expenseSchema>;
export type CustomerData = z.infer<typeof customerSchema>;
export type TruckArrivalData = z.infer<typeof truckArrivalSchema>;
export type DailyAssignmentData = z.infer<typeof dailyAssignmentSchema>;
export type GoalData = z.infer<typeof goalSchema>;
