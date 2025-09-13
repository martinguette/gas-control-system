import { z } from 'zod';

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
