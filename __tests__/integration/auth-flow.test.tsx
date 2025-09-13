import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/login-form';
import SignUpForm from '@/components/auth/signup-form';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock server actions
jest.mock('@/actions/auth', () => ({
  logIn: jest.fn(),
  signUp: jest.fn(),
}));

const mockPush = jest.fn();
const mockRouter = { push: mockPush };

describe('Flujo de Autenticación - Integración', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
  });

  describe('Flujo de Registro Completo', () => {
    it('debe permitir registro completo de un jefe', async () => {
      const user = userEvent.setup();
      const { signUp } = require('@/actions/auth');

      render(<SignUpForm />);

      // Llenar formulario
      await user.type(screen.getByLabelText('Nombre Completo'), 'Juan Pérez');
      await user.type(screen.getByLabelText('Email'), 'juan@example.com');

      // Seleccionar rol jefe
      const roleSelect = screen.getByRole('combobox');
      await user.click(roleSelect);
      await user.click(screen.getByText('Jefe/Administrador'));

      await user.type(screen.getByLabelText('Contraseña'), 'password123');
      await user.type(
        screen.getByLabelText('Repetir Contraseña'),
        'password123'
      );

      // Verificar que no hay errores de validación
      await waitFor(() => {
        expect(
          screen.queryByText(/requerido|inválido|coinciden/)
        ).not.toBeInTheDocument();
      });

      // Enviar formulario
      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      await user.click(submitButton);

      // Verificar que se llamó la acción
      await waitFor(() => {
        expect(signUp).toHaveBeenCalled();
      });
    });

    it('debe permitir registro completo de un vendedor', async () => {
      const user = userEvent.setup();
      const { signUp } = require('@/actions/auth');

      render(<SignUpForm />);

      // Llenar formulario
      await user.type(screen.getByLabelText('Nombre Completo'), 'María García');
      await user.type(screen.getByLabelText('Email'), 'maria@example.com');

      // Seleccionar rol vendedor
      const roleSelect = screen.getByRole('combobox');
      await user.click(roleSelect);
      await user.click(screen.getByText('Vendedor'));

      await user.type(screen.getByLabelText('Contraseña'), 'password123');
      await user.type(
        screen.getByLabelText('Repetir Contraseña'),
        'password123'
      );

      // Enviar formulario
      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(signUp).toHaveBeenCalled();
      });
    });

    it('debe validar contraseñas en tiempo real', async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const passwordInput = screen.getByLabelText('Contraseña');
      const repeatPasswordInput = screen.getByLabelText('Repetir Contraseña');

      // Escribir contraseñas diferentes
      await user.type(passwordInput, 'password123');
      await user.type(repeatPasswordInput, 'different123');

      // Verificar error inmediatamente
      await waitFor(() => {
        expect(
          screen.getByText('Las contraseñas no coinciden')
        ).toBeInTheDocument();
      });

      // Corregir la segunda contraseña
      await user.clear(repeatPasswordInput);
      await user.type(repeatPasswordInput, 'password123');

      // Verificar que el error desaparece
      await waitFor(() => {
        expect(
          screen.queryByText('Las contraseñas no coinciden')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Flujo de Login Completo', () => {
    it('debe permitir login con credenciales válidas', async () => {
      const user = userEvent.setup();
      const { logIn } = require('@/actions/auth');

      render(<LoginForm />);

      // Llenar formulario
      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Contraseña'), 'password123');

      // Enviar formulario
      const submitButton = screen.getByRole('button', {
        name: 'Iniciar Sesión',
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(logIn).toHaveBeenCalled();
      });
    });

    it('debe mantener el email cuando hay error de contraseña', async () => {
      const user = userEvent.setup();

      // Simular error con email en URL
      const mockSearchParams = new URLSearchParams();
      mockSearchParams.set('message', 'Email o contraseña incorrectos');
      mockSearchParams.set('email', 'test@example.com');
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<LoginForm />);

      // Verificar que el email se mantiene
      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toHaveValue('test@example.com');

      // Verificar que se muestra el mensaje de error
      expect(
        screen.getByText('Email o contraseña incorrectos')
      ).toBeInTheDocument();
    });

    it('debe alternar visibilidad de contraseña correctamente', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const passwordInput = screen.getByLabelText('Contraseña');
      const toggleButton = screen.getByRole('button', { name: '' });

      await user.type(passwordInput, 'password123');

      // Inicialmente oculta
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Mostrar
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Ocultar nuevamente
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Navegación entre Formularios', () => {
    it('debe navegar de login a registro', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const signupLink = screen.getByText('Regístrate aquí');
      await user.click(signupLink);

      expect(mockPush).toHaveBeenCalledWith('/sign-up');
    });

    it('debe navegar de registro a login', async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const loginLink = screen.getByText('Inicia sesión aquí');
      await user.click(loginLink);

      expect(mockPush).toHaveBeenCalledWith('/log-in');
    });
  });

  describe('Manejo de Estados de Carga', () => {
    it('debe mostrar estado de carga en login', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Contraseña'), 'password123');

      const submitButton = screen.getByRole('button', {
        name: 'Iniciar Sesión',
      });
      fireEvent.submit(screen.getByRole('form'));

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument();
      });
    });

    it('debe mostrar estado de carga en registro', async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      await user.type(screen.getByLabelText('Nombre Completo'), 'Juan Pérez');
      await user.type(screen.getByLabelText('Email'), 'juan@example.com');

      const roleSelect = screen.getByRole('combobox');
      await user.click(roleSelect);
      await user.click(screen.getByText('Jefe/Administrador'));

      await user.type(screen.getByLabelText('Contraseña'), 'password123');
      await user.type(
        screen.getByLabelText('Repetir Contraseña'),
        'password123'
      );

      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      fireEvent.submit(screen.getByRole('form'));

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText('Creando cuenta...')).toBeInTheDocument();
      });
    });
  });
});
