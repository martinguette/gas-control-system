/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InventoryManagementDialog } from '@/components/inventory/inventory-management-dialog';
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

describe('Inventory Flow Integration Tests', () => {
  const mockOnSuccess = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Truck Arrival Flow', () => {
    it('should handle complete truck arrival with multiple cylinder types', async () => {
      const user = userEvent.setup();

      mockInventoryActions.performInventoryOperation.mockResolvedValue({
        success: true,
        data: { id: 1, quantity: 50 },
      });

      render(
        <InventoryManagementDialog
          onSuccess={mockOnSuccess}
          onClose={mockOnClose}
        />
      );

      // Open dialog
      await user.click(screen.getByText('Gestionar Inventario'));

      // Simulate truck arrival with 33lb cylinders
      await user.click(screen.getByDisplayValue('Selecciona una acción'));
      await user.click(screen.getByText('Llegó un camión con cilindros'));

      await user.click(screen.getByDisplayValue('Selecciona el tipo'));
      await user.click(
        screen.getByText('Cilindros Llenos (listos para vender)')
      );

      await user.click(screen.getByDisplayValue('Selecciona el tamaño'));
      await user.click(screen.getByText('Cilindro 33lb'));

      await user.type(screen.getByPlaceholderText('Ingresa la cantidad'), '30');
      await user.type(screen.getByPlaceholderText('Ej: 150.00'), '150');

      await user.click(screen.getByText('Ejecutar Operación'));

      await waitFor(() => {
        expect(
          mockInventoryActions.performInventoryOperation
        ).toHaveBeenCalledWith({
          type: 'add',
          inventory_type: 'full',
          product_type: '33lb',
          quantity: 30,
          unit_cost: 150,
        });
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it('should handle truck arrival with 40lb cylinders', async () => {
      const user = userEvent.setup();

      mockInventoryActions.performInventoryOperation.mockResolvedValue({
        success: true,
        data: { id: 2, quantity: 20 },
      });

      render(
        <InventoryManagementDialog
          onSuccess={mockOnSuccess}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText('Gestionar Inventario'));

      // Simulate truck arrival with 40lb cylinders
      await user.click(screen.getByDisplayValue('Selecciona una acción'));
      await user.click(screen.getByText('Llegó un camión con cilindros'));

      await user.click(screen.getByDisplayValue('Selecciona el tipo'));
      await user.click(
        screen.getByText('Cilindros Llenos (listos para vender)')
      );

      await user.click(screen.getByDisplayValue('Selecciona el tamaño'));
      await user.click(screen.getByText('Cilindro 40lb'));

      await user.type(screen.getByPlaceholderText('Ingresa la cantidad'), '20');
      await user.type(screen.getByPlaceholderText('Ej: 150.00'), '180');

      await user.click(screen.getByText('Ejecutar Operación'));

      await waitFor(() => {
        expect(
          mockInventoryActions.performInventoryOperation
        ).toHaveBeenCalledWith({
          type: 'add',
          inventory_type: 'full',
          product_type: '40lb',
          quantity: 20,
          unit_cost: 180,
        });
      });
    });

    it('should handle truck arrival with 100lb cylinders', async () => {
      const user = userEvent.setup();

      mockInventoryActions.performInventoryOperation.mockResolvedValue({
        success: true,
        data: { id: 3, quantity: 10 },
      });

      render(
        <InventoryManagementDialog
          onSuccess={mockOnSuccess}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText('Gestionar Inventario'));

      // Simulate truck arrival with 100lb cylinders
      await user.click(screen.getByDisplayValue('Selecciona una acción'));
      await user.click(screen.getByText('Llegó un camión con cilindros'));

      await user.click(screen.getByDisplayValue('Selecciona el tipo'));
      await user.click(
        screen.getByText('Cilindros Llenos (listos para vender)')
      );

      await user.click(screen.getByDisplayValue('Selecciona el tamaño'));
      await user.click(screen.getByText('Cilindro 100lb'));

      await user.type(screen.getByPlaceholderText('Ingresa la cantidad'), '10');
      await user.type(screen.getByPlaceholderText('Ej: 150.00'), '300');

      await user.click(screen.getByText('Ejecutar Operación'));

      await waitFor(() => {
        expect(
          mockInventoryActions.performInventoryOperation
        ).toHaveBeenCalledWith({
          type: 'add',
          inventory_type: 'full',
          product_type: '100lb',
          quantity: 10,
          unit_cost: 300,
        });
      });
    });
  });

  describe('Complete Sales Flow', () => {
    it('should handle sales of full cylinders', async () => {
      const user = userEvent.setup();

      mockInventoryActions.performInventoryOperation.mockResolvedValue({
        success: true,
        data: { id: 1, quantity: 5 },
      });

      render(
        <InventoryManagementDialog
          onSuccess={mockOnSuccess}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText('Gestionar Inventario'));

      // Simulate sales
      await user.click(screen.getByDisplayValue('Selecciona una acción'));
      await user.click(screen.getByText('Se vendieron cilindros'));

      await user.click(screen.getByDisplayValue('Selecciona el tipo'));
      await user.click(
        screen.getByText('Cilindros Llenos (listos para vender)')
      );

      await user.click(screen.getByDisplayValue('Selecciona el tamaño'));
      await user.click(screen.getByText('Cilindro 33lb'));

      await user.type(screen.getByPlaceholderText('Ingresa la cantidad'), '5');

      await user.click(screen.getByText('Ejecutar Operación'));

      await waitFor(() => {
        expect(
          mockInventoryActions.performInventoryOperation
        ).toHaveBeenCalledWith({
          type: 'subtract',
          inventory_type: 'full',
          product_type: '33lb',
          quantity: 5,
        });
      });
    });

    it('should handle collection of empty cylinders', async () => {
      const user = userEvent.setup();

      mockInventoryActions.performInventoryOperation.mockResolvedValue({
        success: true,
        data: { id: 1, quantity: 8 },
      });

      render(
        <InventoryManagementDialog
          onSuccess={mockOnSuccess}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText('Gestionar Inventario'));

      // Simulate empty cylinder collection
      await user.click(screen.getByDisplayValue('Selecciona una acción'));
      await user.click(screen.getByText('Llegó un camión con cilindros'));

      await user.click(screen.getByDisplayValue('Selecciona el tipo'));
      await user.click(screen.getByText('Cilindros Vacíos (recolectados)'));

      await user.click(screen.getByDisplayValue('Selecciona el tamaño'));
      await user.click(screen.getByText('Cilindro 40lb'));

      await user.click(screen.getByDisplayValue('Selecciona la marca'));
      await user.click(screen.getByText('Roscogas (Naranja)'));

      await user.type(screen.getByPlaceholderText('Ingresa la cantidad'), '8');

      await user.click(screen.getByText('Ejecutar Operación'));

      await waitFor(() => {
        expect(
          mockInventoryActions.performInventoryOperation
        ).toHaveBeenCalledWith({
          type: 'add',
          inventory_type: 'empty',
          product_type: '40lb',
          brand: 'Roscogas',
          color: 'Naranja',
          quantity: 8,
        });
      });
    });
  });

  describe('Complete Physical Count Flow', () => {
    it('should handle physical count correction for full cylinders', async () => {
      const user = userEvent.setup();

      mockInventoryActions.performInventoryOperation.mockResolvedValue({
        success: true,
        data: { id: 1, quantity: 25 },
      });

      render(
        <InventoryManagementDialog
          onSuccess={mockOnSuccess}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText('Gestionar Inventario'));

      // Simulate physical count correction
      await user.click(screen.getByDisplayValue('Selecciona una acción'));
      await user.click(screen.getByText('Corregir cantidad (conteo físico)'));

      await user.click(screen.getByDisplayValue('Selecciona el tipo'));
      await user.click(
        screen.getByText('Cilindros Llenos (listos para vender)')
      );

      await user.click(screen.getByDisplayValue('Selecciona el tamaño'));
      await user.click(screen.getByText('Cilindro 100lb'));

      await user.type(screen.getByPlaceholderText('Ingresa la cantidad'), '25');
      await user.type(screen.getByPlaceholderText('Ej: 150.00'), '300');

      await user.click(screen.getByText('Ejecutar Operación'));

      await waitFor(() => {
        expect(
          mockInventoryActions.performInventoryOperation
        ).toHaveBeenCalledWith({
          type: 'set',
          inventory_type: 'full',
          product_type: '100lb',
          quantity: 25,
          unit_cost: 300,
        });
      });
    });

    it('should handle physical count correction for empty cylinders', async () => {
      const user = userEvent.setup();

      mockInventoryActions.performInventoryOperation.mockResolvedValue({
        success: true,
        data: { id: 1, quantity: 15 },
      });

      render(
        <InventoryManagementDialog
          onSuccess={mockOnSuccess}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText('Gestionar Inventario'));

      // Simulate physical count correction for empty cylinders
      await user.click(screen.getByDisplayValue('Selecciona una acción'));
      await user.click(screen.getByText('Corregir cantidad (conteo físico)'));

      await user.click(screen.getByDisplayValue('Selecciona el tipo'));
      await user.click(screen.getByText('Cilindros Vacíos (recolectados)'));

      await user.click(screen.getByDisplayValue('Selecciona el tamaño'));
      await user.click(screen.getByText('Cilindro 33lb'));

      await user.click(screen.getByDisplayValue('Selecciona la marca'));
      await user.click(screen.getByText('Gasan (Azul)'));

      await user.type(screen.getByPlaceholderText('Ingresa la cantidad'), '15');

      await user.click(screen.getByText('Ejecutar Operación'));

      await waitFor(() => {
        expect(
          mockInventoryActions.performInventoryOperation
        ).toHaveBeenCalledWith({
          type: 'set',
          inventory_type: 'empty',
          product_type: '33lb',
          brand: 'Gasan',
          color: 'Azul',
          quantity: 15,
        });
      });
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle database connection errors gracefully', async () => {
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

      // Fill form
      await user.click(screen.getByDisplayValue('Selecciona una acción'));
      await user.click(screen.getByText('Llegó un camión con cilindros'));

      await user.click(screen.getByDisplayValue('Selecciona el tipo'));
      await user.click(
        screen.getByText('Cilindros Llenos (listos para vender)')
      );

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

    it('should handle validation errors', async () => {
      const user = userEvent.setup();

      render(
        <InventoryManagementDialog
          onSuccess={mockOnSuccess}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText('Gestionar Inventario'));

      // Try to submit with invalid data
      await user.click(screen.getByDisplayValue('Selecciona una acción'));
      await user.click(screen.getByText('Llegó un camión con cilindros'));

      await user.click(screen.getByDisplayValue('Selecciona el tipo'));
      await user.click(
        screen.getByText('Cilindros Llenos (listos para vender)')
      );

      await user.click(screen.getByDisplayValue('Selecciona el tamaño'));
      await user.click(screen.getByText('Cilindro 33lb'));

      await user.type(screen.getByPlaceholderText('Ingresa la cantidad'), '0'); // Invalid quantity

      const submitButton = screen.getByText('Ejecutar Operación');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Brand and Color Flow', () => {
    it('should handle all brand-color combinations correctly', async () => {
      const user = userEvent.setup();

      const brandColorCombinations = [
        { brand: 'Roscogas', color: 'Naranja' },
        { brand: 'Gasan', color: 'Azul' },
        { brand: 'Gaspais', color: 'Verde Oscuro' },
        { brand: 'Vidagas', color: 'Verde Claro' },
      ];

      for (const combination of brandColorCombinations) {
        mockInventoryActions.performInventoryOperation.mockResolvedValue({
          success: true,
          data: { id: 1, quantity: 5 },
        });

        render(
          <InventoryManagementDialog
            onSuccess={mockOnSuccess}
            onClose={mockOnClose}
          />
        );

        await user.click(screen.getByText('Gestionar Inventario'));

        // Select empty cylinders
        await user.click(screen.getByDisplayValue('Selecciona una acción'));
        await user.click(screen.getByText('Llegó un camión con cilindros'));

        await user.click(screen.getByDisplayValue('Selecciona el tipo'));
        await user.click(screen.getByText('Cilindros Vacíos (recolectados)'));

        await user.click(screen.getByDisplayValue('Selecciona el tamaño'));
        await user.click(screen.getByText('Cilindro 33lb'));

        await user.click(screen.getByDisplayValue('Selecciona la marca'));
        await user.click(
          screen.getByText(`${combination.brand} (${combination.color})`)
        );

        await user.type(
          screen.getByPlaceholderText('Ingresa la cantidad'),
          '5'
        );

        await user.click(screen.getByText('Ejecutar Operación'));

        await waitFor(() => {
          expect(
            mockInventoryActions.performInventoryOperation
          ).toHaveBeenCalledWith({
            type: 'add',
            inventory_type: 'empty',
            product_type: '33lb',
            brand: combination.brand,
            color: combination.color,
            quantity: 5,
          });
        });

        // Clean up for next iteration
        jest.clearAllMocks();
      }
    });
  });
});
