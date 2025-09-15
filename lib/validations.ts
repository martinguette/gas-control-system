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
