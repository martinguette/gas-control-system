import { signUp, logIn, logOut } from '@/actions/auth';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Mock dependencies
jest.mock('@/utils/supabase/server');
jest.mock('next/navigation');
jest.mock('next/cache');

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockRevalidatePath = revalidatePath as jest.MockedFunction<
  typeof revalidatePath
>;

describe('Auth Actions', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
        getUser: jest.fn(),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
    };

    mockCreateClient.mockResolvedValue(mockSupabase);
  });

  describe('signUp', () => {
    it('debe crear usuario exitosamente', async () => {
      const formData = new FormData();
      formData.append('full_name', 'Juan Pérez');
      formData.append('email', 'juan@example.com');
      formData.append('role', 'jefe');
      formData.append('password', 'password123');
      formData.append('repeatPassword', 'password123');

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });

      await signUp(formData);

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'juan@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Juan Pérez',
            role: 'jefe',
          },
        },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.stringContaining('Cuenta creada exitosamente')
      );
    });

    it('debe manejar error de email ya registrado', async () => {
      const formData = new FormData();
      formData.append('full_name', 'Juan Pérez');
      formData.append('email', 'juan@example.com');
      formData.append('role', 'jefe');
      formData.append('password', 'password123');
      formData.append('repeatPassword', 'password123');

      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' },
      });

      await signUp(formData);

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.stringContaining('Este email ya está registrado')
      );
    });

    it('debe validar datos con Zod', async () => {
      const formData = new FormData();
      formData.append('full_name', '');
      formData.append('email', 'invalid-email');
      formData.append('role', 'invalid-role');
      formData.append('password', '123');
      formData.append('repeatPassword', '456');

      await signUp(formData);

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.stringContaining('El nombre completo es requerido')
      );
    });

    it('debe validar que las contraseñas coincidan', async () => {
      const formData = new FormData();
      formData.append('full_name', 'Juan Pérez');
      formData.append('email', 'juan@example.com');
      formData.append('role', 'jefe');
      formData.append('password', 'password123');
      formData.append('repeatPassword', 'different123');

      await signUp(formData);

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.stringContaining('Las contraseñas no coinciden')
      );
    });
  });

  describe('logIn', () => {
    it('debe iniciar sesión exitosamente como jefe', async () => {
      const formData = new FormData();
      formData.append('email', 'jefe@example.com');
      formData.append('password', 'password123');

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: '123',
            user_metadata: { role: 'jefe' },
          },
        },
        error: null,
      });

      await logIn(formData);

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'jefe@example.com',
        password: 'password123',
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard/admin');
    });

    it('debe iniciar sesión exitosamente como vendedor', async () => {
      const formData = new FormData();
      formData.append('email', 'vendedor@example.com');
      formData.append('password', 'password123');

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: '123',
            user_metadata: { role: 'vendedor' },
          },
        },
        error: null,
      });

      await logIn(formData);

      expect(mockRedirect).toHaveBeenCalledWith('/dashboard/vendor');
    });

    it('debe manejar credenciales incorrectas', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'wrongpassword');

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      });

      await logIn(formData);

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.stringContaining('Email o contraseña incorrectos')
      );
    });

    it('debe manejar email no confirmado', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Email not confirmed' },
      });

      await logIn(formData);

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.stringContaining('Por favor, verifica tu email')
      );
    });

    it('debe redirigir a login si no se puede determinar el rol', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: '123',
            user_metadata: {},
          },
        },
        error: null,
      });

      // Mock fallback to profiles table
      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValue({
          data: null,
          error: { message: 'No profile found' },
        });

      await logIn(formData);

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.stringContaining(
          'Por favor, verifica tu email para completar el registro'
        )
      );
    });

    it('debe validar datos con Zod', async () => {
      const formData = new FormData();
      formData.append('email', 'invalid-email');
      formData.append('password', '123');

      await logIn(formData);

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.stringContaining('Por favor ingresa un email válido')
      );
    });
  });

  describe('logOut', () => {
    it('debe cerrar sesión exitosamente', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        data: {},
        error: null,
      });

      await logOut();

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(mockRedirect).toHaveBeenCalledWith('/log-in');
    });

    it('debe manejar error al cerrar sesión', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        data: null,
        error: { message: 'Sign out failed' },
      });

      await logOut();

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.stringContaining('Error al cerrar sesión')
      );
    });
  });
});
