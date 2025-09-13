import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/login-form';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock server action
jest.mock('@/actions/auth', () => ({
  logIn: jest.fn(),
}));

const mockPush = jest.fn();
const mockRouter = { push: mockPush };

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
  });

  it('debe renderizar el formulario de login correctamente', () => {
    render(<LoginForm />);

    expect(screen.getByText('Gas Control')).toBeInTheDocument();
    expect(
      screen.getByText('Ingresa tus credenciales para acceder al sistema')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Iniciar Sesión' })
    ).toBeInTheDocument();
  });

  it('debe mostrar mensaje de error si viene en la URL', () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('message', 'Credenciales incorrectas');
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

    render(<LoginForm />);

    expect(screen.getByText('Credenciales incorrectas')).toBeInTheDocument();
  });

  it('debe pre-llenar el email si viene en la URL', () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('email', 'test@example.com');
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

    render(<LoginForm />);

    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('debe mostrar validaciones de error en tiempo real', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    // Intentar enviar formulario vacío
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('El email es requerido')).toBeInTheDocument();
      expect(
        screen.getByText('La contraseña es requerida')
      ).toBeInTheDocument();
    });
  });

  it('debe validar formato de email', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText('Email');

    await user.type(emailInput, 'invalid-email');
    await user.tab(); // Trigger validation

    await waitFor(() => {
      expect(
        screen.getByText('Por favor ingresa un email válido')
      ).toBeInTheDocument();
    });
  });

  it('debe validar longitud mínima de contraseña', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText('Contraseña');

    await user.type(passwordInput, '123');
    await user.tab(); // Trigger validation

    await waitFor(() => {
      expect(
        screen.getByText('La contraseña debe tener al menos 6 caracteres')
      ).toBeInTheDocument();
    });
  });

  it('debe alternar visibilidad de contraseña', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText('Contraseña');
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button

    await user.type(passwordInput, 'password123');

    // Inicialmente debe ser tipo password
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click en el botón de mostrar contraseña
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click nuevamente para ocultar
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('debe deshabilitar el botón durante el envío', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    // Simular envío
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('debe mostrar enlace para registrarse', () => {
    render(<LoginForm />);

    const signupLink = screen.getByText('Regístrate aquí');
    expect(signupLink).toBeInTheDocument();

    // Verificar que el enlace navega a sign-up
    expect(signupLink.closest('button')).toHaveAttribute('onClick');
  });

  it('debe navegar a sign-up cuando se hace click en el enlace', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const signupLink = screen.getByText('Regístrate aquí');
    await user.click(signupLink);

    expect(mockPush).toHaveBeenCalledWith('/sign-up');
  });
});
