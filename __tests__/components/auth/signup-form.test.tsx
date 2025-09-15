import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import SignUpForm from '@/components/auth/signup-form';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock server action
jest.mock('@/actions/auth', () => ({
  signUp: jest.fn(),
}));

const mockPush = jest.fn();
const mockRouter = { push: mockPush };

describe('SignUpForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
  });

  it('debe renderizar el formulario de registro correctamente', () => {
    render(<SignUpForm />);

    expect(screen.getByText('Gas Control')).toBeInTheDocument();
    expect(
      screen.getByText('Crea tu cuenta para acceder al sistema')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre Completo')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Rol')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Repetir Contraseña')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Crear Cuenta' })
    ).toBeInTheDocument();
  });

  it('debe mostrar mensaje de error si viene en la URL', () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('message', 'Este email ya está registrado');
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

    render(<SignUpForm />);

    expect(
      screen.getByText('Este email ya está registrado')
    ).toBeInTheDocument();
  });

  it('debe validar campos requeridos', async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('El nombre completo es requerido')
      ).toBeInTheDocument();
      expect(screen.getByText('El email es requerido')).toBeInTheDocument();
      expect(
        screen.getByText('Por favor selecciona un rol')
      ).toBeInTheDocument();
      expect(
        screen.getByText('La contraseña es requerida')
      ).toBeInTheDocument();
      expect(screen.getByText('Confirma tu contraseña')).toBeInTheDocument();
    });
  });

  it('debe validar formato de email', async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    const emailInput = screen.getByLabelText('Email');
    await user.type(emailInput, 'invalid-email');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText('Por favor ingresa un email válido')
      ).toBeInTheDocument();
    });
  });

  it('debe validar nombre con caracteres válidos', async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    const nameInput = screen.getByLabelText('Nombre Completo');
    await user.type(nameInput, 'Juan123');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText('El nombre solo puede contener letras y espacios')
      ).toBeInTheDocument();
    });
  });

  it('debe validar longitud mínima de contraseña', async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    const passwordInput = screen.getByLabelText('Contraseña');
    await user.type(passwordInput, '123');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText('La contraseña debe tener al menos 6 caracteres')
      ).toBeInTheDocument();
    });
  });

  it('debe validar que las contraseñas coincidan en tiempo real', async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    const passwordInput = screen.getByLabelText('Contraseña');
    const repeatPasswordInput = screen.getByLabelText('Repetir Contraseña');

    await user.type(passwordInput, 'password123');
    await user.type(repeatPasswordInput, 'different123');

    await waitFor(() => {
      expect(
        screen.getByText('Las contraseñas no coinciden')
      ).toBeInTheDocument();
    });
  });

  it('debe permitir seleccionar rol "jefe"', async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    const roleSelect = screen.getByRole('combobox');
    await user.click(roleSelect);

    const jefeOption = screen.getByText('Jefe/Administrador');
    await user.click(jefeOption);

    expect(roleSelect).toHaveTextContent('Jefe/Administrador');
  });

  it('debe permitir seleccionar rol "vendedor"', async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    const roleSelect = screen.getByRole('combobox');
    await user.click(roleSelect);

    const vendedorOption = screen.getByText('Vendedor');
    await user.click(vendedorOption);

    expect(roleSelect).toHaveTextContent('Vendedor');
  });

  it('debe alternar visibilidad de contraseñas', async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    const passwordInput = screen.getByLabelText('Contraseña');
    const repeatPasswordInput = screen.getByLabelText('Repetir Contraseña');

    const passwordToggleButtons = screen.getAllByRole('button', { name: '' });
    const passwordToggle = passwordToggleButtons[0];
    const repeatToggle = passwordToggleButtons[1];

    await user.type(passwordInput, 'password123');
    await user.type(repeatPasswordInput, 'password123');

    // Inicialmente deben ser tipo password
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(repeatPasswordInput).toHaveAttribute('type', 'password');

    // Toggle primera contraseña
    await user.click(passwordToggle);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Toggle segunda contraseña
    await user.click(repeatToggle);
    expect(repeatPasswordInput).toHaveAttribute('type', 'text');
  });

  it('debe deshabilitar campos durante el envío', async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    const nameInput = screen.getByLabelText('Nombre Completo');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const repeatPasswordInput = screen.getByLabelText('Repetir Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });

    await user.type(nameInput, 'Juan Pérez');
    await user.type(emailInput, 'juan@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(repeatPasswordInput, 'password123');

    // Simular envío
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('debe mostrar enlace para iniciar sesión', () => {
    render(<SignUpForm />);

    const loginLink = screen.getByText('Inicia sesión aquí');
    expect(loginLink).toBeInTheDocument();
  });

  it('debe navegar a login cuando se hace click en el enlace', async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    const loginLink = screen.getByText('Inicia sesión aquí');
    await user.click(loginLink);

    expect(mockPush).toHaveBeenCalledWith('/log-in');
  });

  it('debe enviar datos correctos al servidor', async () => {
    const user = userEvent.setup();
    const { signUp } = require('@/actions/auth');

    render(<SignUpForm />);

    await user.type(screen.getByLabelText('Nombre Completo'), 'Juan Pérez');
    await user.type(screen.getByLabelText('Email'), 'juan@example.com');

    // Seleccionar rol
    const roleSelect = screen.getByRole('combobox');
    await user.click(roleSelect);
    await user.click(screen.getByText('Jefe/Administrador'));

    await user.type(screen.getByLabelText('Contraseña'), 'password123');
    await user.type(screen.getByLabelText('Repetir Contraseña'), 'password123');

    const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(signUp).toHaveBeenCalled();
    });
  });
});
