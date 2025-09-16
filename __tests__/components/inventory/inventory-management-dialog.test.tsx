/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InventoryManagementDialog from '@/components/inventory/inventory-management-dialog';
import * as inventoryActions from '@/actions/inventory';

// Mock the inventory actions
jest.mock('@/actions/inventory');
const mockInventoryActions = inventoryActions as jest.Mocked<
  typeof inventoryActions
>;

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

describe('InventoryManagementDialog', () => {
  const mockOnSuccess = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockInventoryActions.performInventoryOperation.mockResolvedValue({
      success: true,
      data: { id: 1, quantity: 10 },
    });
  });

  it('should render dialog trigger button', () => {
    render(
      <InventoryManagementDialog
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Gestionar Inventario')).toBeInTheDocument();
  });

  it('should open dialog when trigger is clicked', async () => {
    const user = userEvent.setup();

    render(
      <InventoryManagementDialog
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    const triggerButton = screen.getByText('Gestionar Inventario');
    await user.click(triggerButton);

    expect(screen.getByText('Gestión de Inventario')).toBeInTheDocument();
    expect(
      screen.getByText('Actualiza tu inventario de forma sencilla')
    ).toBeInTheDocument();
  });

  it('should show action selection options', async () => {
    const user = userEvent.setup();

    render(
      <InventoryManagementDialog
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByText('Gestionar Inventario'));

    expect(screen.getByText('¿Qué quieres hacer?')).toBeInTheDocument();
    expect(
      screen.getByText('Llegó un camión con cilindros')
    ).toBeInTheDocument();
    expect(screen.getByText('Se vendieron cilindros')).toBeInTheDocument();
    expect(
      screen.getByText('Corregir cantidad (conteo físico)')
    ).toBeInTheDocument();
  });

  it('should show inventory type selection', async () => {
    const user = userEvent.setup();

    render(
      <InventoryManagementDialog
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByText('Gestionar Inventario'));

    expect(screen.getByText('¿Qué tipo de cilindro?')).toBeInTheDocument();
    expect(
      screen.getByText('Cilindros Llenos (listos para vender)')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Cilindros Vacíos (recolectados)')
    ).toBeInTheDocument();
  });

  it('should show cylinder size selection', async () => {
    const user = userEvent.setup();

    render(
      <InventoryManagementDialog
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByText('Gestionar Inventario'));

    expect(screen.getByText('¿Qué tamaño?')).toBeInTheDocument();
    expect(screen.getByText('Cilindro 33lb')).toBeInTheDocument();
    expect(screen.getByText('Cilindro 40lb')).toBeInTheDocument();
    expect(screen.getByText('Cilindro 100lb')).toBeInTheDocument();
  });

  it('should show brand selection for empty cylinders', async () => {
    const user = userEvent.setup();

    render(
      <InventoryManagementDialog
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByText('Gestionar Inventario'));

    // Select empty cylinders
    const inventoryTypeSelect = screen.getByDisplayValue('Selecciona el tipo');
    await user.click(inventoryTypeSelect);
    await user.click(screen.getByText('Cilindros Vacíos (recolectados)'));

    expect(screen.getByText('¿De qué marca?')).toBeInTheDocument();
    expect(screen.getByText('Roscogas (Naranja)')).toBeInTheDocument();
    expect(screen.getByText('Gasan (Azul)')).toBeInTheDocument();
    expect(screen.getByText('Gaspais (Verde Oscuro)')).toBeInTheDocument();
    expect(screen.getByText('Vidagas (Verde Claro)')).toBeInTheDocument();
  });

  it('should show quantity input with dynamic label', async () => {
    const user = userEvent.setup();

    render(
      <InventoryManagementDialog
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByText('Gestionar Inventario'));

    // Test "add" operation
    const actionSelect = screen.getByDisplayValue('Selecciona una acción');
    await user.click(actionSelect);
    await user.click(screen.getByText('Llegó un camión con cilindros'));

    expect(screen.getByText('¿Cuántos llegaron?')).toBeInTheDocument();

    // Test "subtract" operation
    await user.click(actionSelect);
    await user.click(screen.getByText('Se vendieron cilindros'));

    expect(screen.getByText('¿Cuántos se vendieron?')).toBeInTheDocument();

    // Test "set" operation
    await user.click(actionSelect);
    await user.click(screen.getByText('Corregir cantidad (conteo físico)'));

    expect(screen.getByText('¿Cuántos hay realmente?')).toBeInTheDocument();
  });

  it('should show unit cost input for full cylinders', async () => {
    const user = userEvent.setup();

    render(
      <InventoryManagementDialog
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByText('Gestionar Inventario'));

    // Select full cylinders
    const inventoryTypeSelect = screen.getByDisplayValue('Selecciona el tipo');
    await user.click(inventoryTypeSelect);
    await user.click(screen.getByText('Cilindros Llenos (listos para vender)'));

    expect(
      screen.getByText('¿Cuánto costó cada cilindro?')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: 150.00')).toBeInTheDocument();
  });

  it('should not show unit cost input for empty cylinders', async () => {
    const user = userEvent.setup();

    render(
      <InventoryManagementDialog
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByText('Gestionar Inventario'));

    // Select empty cylinders
    const inventoryTypeSelect = screen.getByDisplayValue('Selecciona el tipo');
    await user.click(inventoryTypeSelect);
    await user.click(screen.getByText('Cilindros Vacíos (recolectados)'));

    expect(
      screen.queryByText('¿Cuánto costó cada cilindro?')
    ).not.toBeInTheDocument();
  });

  it('should submit form with correct data for full cylinders', async () => {
    const user = userEvent.setup();

    render(
      <InventoryManagementDialog
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByText('Gestionar Inventario'));

    // Fill form for full cylinders
    await user.click(screen.getByDisplayValue('Selecciona una acción'));
    await user.click(screen.getByText('Llegó un camión con cilindros'));

    await user.click(screen.getByDisplayValue('Selecciona el tipo'));
    await user.click(screen.getByText('Cilindros Llenos (listos para vender)'));

    await user.click(screen.getByDisplayValue('Selecciona el tamaño'));
    await user.click(screen.getByText('Cilindro 33lb'));

    await user.type(screen.getByPlaceholderText('Ingresa la cantidad'), '10');
    await user.type(screen.getByPlaceholderText('Ej: 150.00'), '150');

    await user.click(screen.getByText('Ejecutar Operación'));

    await waitFor(() => {
      expect(
        mockInventoryActions.performInventoryOperation
      ).toHaveBeenCalledWith({
        type: 'add',
        inventory_type: 'full',
        product_type: '33lb',
        quantity: 10,
        unit_cost: 150,
      });
    });

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should submit form with correct data for empty cylinders', async () => {
    const user = userEvent.setup();

    render(
      <InventoryManagementDialog
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByText('Gestionar Inventario'));

    // Fill form for empty cylinders
    await user.click(screen.getByDisplayValue('Selecciona una acción'));
    await user.click(screen.getByText('Se vendieron cilindros'));

    await user.click(screen.getByDisplayValue('Selecciona el tipo'));
    await user.click(screen.getByText('Cilindros Vacíos (recolectados)'));

    await user.click(screen.getByDisplayValue('Selecciona el tamaño'));
    await user.click(screen.getByText('Cilindro 40lb'));

    await user.click(screen.getByDisplayValue('Selecciona la marca'));
    await user.click(screen.getByText('Roscogas (Naranja)'));

    await user.type(screen.getByPlaceholderText('Ingresa la cantidad'), '5');

    await user.click(screen.getByText('Ejecutar Operación'));

    await waitFor(() => {
      expect(
        mockInventoryActions.performInventoryOperation
      ).toHaveBeenCalledWith({
        type: 'subtract',
        inventory_type: 'empty',
        product_type: '40lb',
        brand: 'Roscogas',
        color: 'Naranja',
        quantity: 5,
      });
    });

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();

    // Mock a delayed response
    mockInventoryActions.performInventoryOperation.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true }), 100)
        )
    );

    render(
      <InventoryManagementDialog
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByText('Gestionar Inventario'));

    // Fill minimal form
    await user.click(screen.getByDisplayValue('Selecciona una acción'));
    await user.click(screen.getByText('Llegó un camión con cilindros'));

    await user.click(screen.getByDisplayValue('Selecciona el tipo'));
    await user.click(screen.getByText('Cilindros Llenos (listos para vender)'));

    await user.click(screen.getByDisplayValue('Selecciona el tamaño'));
    await user.click(screen.getByText('Cilindro 33lb'));

    await user.type(screen.getByPlaceholderText('Ingresa la cantidad'), '10');
    await user.type(screen.getByPlaceholderText('Ej: 150.00'), '150');

    const submitButton = screen.getByText('Ejecutar Operación');
    await user.click(submitButton);

    expect(screen.getByText('Procesando...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should handle submission errors', async () => {
    const user = userEvent.setup();

    mockInventoryActions.performInventoryOperation.mockResolvedValue({
      success: false,
      error: 'Database connection failed',
    });

    render(
      <InventoryManagementDialog
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByText('Gestionar Inventario'));

    // Fill minimal form
    await user.click(screen.getByDisplayValue('Selecciona una acción'));
    await user.click(screen.getByText('Llegó un camión con cilindros'));

    await user.click(screen.getByDisplayValue('Selecciona el tipo'));
    await user.click(screen.getByText('Cilindros Llenos (listos para vender)'));

    await user.click(screen.getByDisplayValue('Selecciona el tamaño'));
    await user.click(screen.getByText('Cilindro 33lb'));

    await user.type(screen.getByPlaceholderText('Ingresa la cantidad'), '10');
    await user.type(screen.getByPlaceholderText('Ej: 150.00'), '150');

    await user.click(screen.getByText('Ejecutar Operación'));

    await waitFor(() => {
      expect(
        screen.getByText('Database connection failed')
      ).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should disable submit button when quantity is invalid', async () => {
    const user = userEvent.setup();

    render(
      <InventoryManagementDialog
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByText('Gestionar Inventario'));

    // Fill form with invalid quantity
    await user.click(screen.getByDisplayValue('Selecciona una acción'));
    await user.click(screen.getByText('Llegó un camión con cilindros'));

    await user.click(screen.getByDisplayValue('Selecciona el tipo'));
    await user.click(screen.getByText('Cilindros Llenos (listos para vender)'));

    await user.click(screen.getByDisplayValue('Selecciona el tamaño'));
    await user.click(screen.getByText('Cilindro 33lb'));

    await user.type(screen.getByPlaceholderText('Ingresa la cantidad'), '0'); // Invalid quantity

    const submitButton = screen.getByText('Ejecutar Operación');
    expect(submitButton).toBeDisabled();
  });

  it('should close dialog when cancel is clicked', async () => {
    const user = userEvent.setup();

    render(
      <InventoryManagementDialog
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByText('Gestionar Inventario'));
    await user.click(screen.getByText('Cancelar'));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should reset form when dialog is closed and reopened', async () => {
    const user = userEvent.setup();

    render(
      <InventoryManagementDialog
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    // Open dialog and fill some data
    await user.click(screen.getByText('Gestionar Inventario'));
    await user.click(screen.getByDisplayValue('Selecciona una acción'));
    await user.click(screen.getByText('Llegó un camión con cilindros'));

    // Close dialog
    await user.click(screen.getByText('Cancelar'));

    // Reopen dialog
    await user.click(screen.getByText('Gestionar Inventario'));

    // Form should be reset
    expect(
      screen.getByDisplayValue('Selecciona una acción')
    ).toBeInTheDocument();
  });
});
