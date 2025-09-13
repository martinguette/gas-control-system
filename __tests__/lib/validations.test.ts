import { loginSchema, signUpSchema } from '@/lib/validations';

describe('Validaciones de Autenticación', () => {
  describe('loginSchema', () => {
    it('debe validar un email y contraseña válidos', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('debe rechazar email vacío', () => {
      const invalidData = {
        email: '',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('El email es requerido');
      }
    });

    it('debe rechazar email inválido', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          'Por favor ingresa un email válido'
        );
      }
    });

    it('debe rechazar contraseña vacía', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          'La contraseña es requerida'
        );
      }
    });

    it('debe rechazar contraseña muy corta', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          'La contraseña debe tener al menos 6 caracteres'
        );
      }
    });

    it('debe rechazar contraseña muy larga', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'a'.repeat(101),
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          'La contraseña es demasiado larga'
        );
      }
    });
  });

  describe('signUpSchema', () => {
    it('debe validar datos de registro válidos', () => {
      const validData = {
        full_name: 'Juan Pérez',
        email: 'juan@example.com',
        role: 'jefe' as const,
        password: 'password123',
        repeatPassword: 'password123',
      };

      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('debe rechazar nombre vacío', () => {
      const invalidData = {
        full_name: '',
        email: 'juan@example.com',
        role: 'jefe' as const,
        password: 'password123',
        repeatPassword: 'password123',
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          'El nombre completo es requerido'
        );
      }
    });

    it('debe rechazar nombre con caracteres inválidos', () => {
      const invalidData = {
        full_name: 'Juan123',
        email: 'juan@example.com',
        role: 'jefe' as const,
        password: 'password123',
        repeatPassword: 'password123',
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          'El nombre solo puede contener letras y espacios'
        );
      }
    });

    it('debe rechazar rol inválido', () => {
      const invalidData = {
        full_name: 'Juan Pérez',
        email: 'juan@example.com',
        role: 'admin' as any,
        password: 'password123',
        repeatPassword: 'password123',
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "Invalid enum value. Expected 'jefe' | 'vendedor', received 'admin'"
        );
      }
    });

    it('debe rechazar contraseñas que no coinciden', () => {
      const invalidData = {
        full_name: 'Juan Pérez',
        email: 'juan@example.com',
        role: 'jefe' as const,
        password: 'password123',
        repeatPassword: 'different123',
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          'Las contraseñas no coinciden'
        );
      }
    });

    it('debe aceptar rol "vendedor"', () => {
      const validData = {
        full_name: 'María García',
        email: 'maria@example.com',
        role: 'vendedor' as const,
        password: 'password123',
        repeatPassword: 'password123',
      };

      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('debe convertir email a lowercase', () => {
      const data = {
        full_name: 'Juan Pérez',
        email: 'JUAN@EXAMPLE.COM',
        role: 'jefe' as const,
        password: 'password123',
        repeatPassword: 'password123',
      };

      const result = signUpSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('juan@example.com');
      }
    });
  });
});
