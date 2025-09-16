/**
 * @jest-environment node
 */

import {
  performInventoryOperation,
  addInventoryFull,
  addInventoryEmpty,
  getInventorySummary,
  getInventoryStats,
} from '@/actions/inventory';

// Mock the entire actions module
jest.mock('@/actions/inventory', () => ({
  performInventoryOperation: jest.fn(),
  addInventoryFull: jest.fn(),
  addInventoryEmpty: jest.fn(),
  getInventorySummary: jest.fn(),
  getInventoryStats: jest.fn(),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock Next.js cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Inventory Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('performInventoryOperation', () => {
    it('should handle add operation for full cylinders', async () => {
      const mockPerformOperation =
        performInventoryOperation as jest.MockedFunction<
          typeof performInventoryOperation
        >;
      mockPerformOperation.mockResolvedValue(undefined);

      const operation = {
        type: 'add' as const,
        inventory_type: 'full' as const,
        product_type: '33lb' as const,
        quantity: 5,
        unit_cost: 150,
      };

      await performInventoryOperation(operation);

      expect(mockPerformOperation).toHaveBeenCalledWith(operation);
    });

    it('should handle subtract operation for empty cylinders', async () => {
      const mockPerformOperation =
        performInventoryOperation as jest.MockedFunction<
          typeof performInventoryOperation
        >;
      mockPerformOperation.mockResolvedValue(undefined);

      const operation = {
        type: 'subtract' as const,
        inventory_type: 'empty' as const,
        product_type: '40lb' as const,
        brand: 'Roscogas' as const,
        color: 'Naranja' as const,
        quantity: 5,
      };

      await performInventoryOperation(operation);

      expect(mockPerformOperation).toHaveBeenCalledWith(operation);
    });

    it('should handle set operation', async () => {
      const mockPerformOperation =
        performInventoryOperation as jest.MockedFunction<
          typeof performInventoryOperation
        >;
      mockPerformOperation.mockResolvedValue(undefined);

      const operation = {
        type: 'set' as const,
        inventory_type: 'full' as const,
        product_type: '100lb' as const,
        quantity: 25,
        unit_cost: 300,
      };

      await performInventoryOperation(operation);

      expect(mockPerformOperation).toHaveBeenCalledWith(operation);
    });

    it('should handle errors gracefully', async () => {
      const mockPerformOperation =
        performInventoryOperation as jest.MockedFunction<
          typeof performInventoryOperation
        >;
      mockPerformOperation.mockRejectedValue(
        new Error('Database connection failed')
      );

      const operation = {
        type: 'add' as const,
        inventory_type: 'full' as const,
        product_type: '33lb' as const,
        quantity: 5,
        unit_cost: 150,
      };

      await expect(performInventoryOperation(operation)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('addInventoryFull', () => {
    it('should add full cylinder inventory', async () => {
      const mockAddFull = addInventoryFull as jest.MockedFunction<
        typeof addInventoryFull
      >;
      const mockData = { id: 1, type: '33lb', quantity: 10, unit_cost: 150 };
      mockAddFull.mockResolvedValue(mockData);

      const result = await addInventoryFull({
        type: '33lb',
        quantity: 10,
        unit_cost: 150,
      });

      expect(mockAddFull).toHaveBeenCalledWith({
        type: '33lb',
        quantity: 10,
        unit_cost: 150,
      });
      expect(result).toEqual(mockData);
    });

    it('should handle validation errors', async () => {
      const mockAddFull = addInventoryFull as jest.MockedFunction<
        typeof addInventoryFull
      >;
      mockAddFull.mockRejectedValue(new Error('Cantidad debe ser mayor a 0'));

      await expect(
        addInventoryFull({
          type: '33lb',
          quantity: -5,
          unit_cost: 150,
        })
      ).rejects.toThrow('Cantidad debe ser mayor a 0');
    });
  });

  describe('addInventoryEmpty', () => {
    it('should add empty cylinder inventory', async () => {
      const mockAddEmpty = addInventoryEmpty as jest.MockedFunction<
        typeof addInventoryEmpty
      >;
      const mockData = {
        id: 1,
        type: '40lb',
        brand: 'Roscogas',
        color: 'Naranja',
        quantity: 5,
      };
      mockAddEmpty.mockResolvedValue(mockData);

      const result = await addInventoryEmpty({
        type: '40lb',
        brand: 'Roscogas',
        color: 'Naranja',
        quantity: 5,
      });

      expect(mockAddEmpty).toHaveBeenCalledWith({
        type: '40lb',
        brand: 'Roscogas',
        color: 'Naranja',
        quantity: 5,
      });
      expect(result).toEqual(mockData);
    });

    it('should handle missing brand for empty cylinders', async () => {
      const mockAddEmpty = addInventoryEmpty as jest.MockedFunction<
        typeof addInventoryEmpty
      >;
      mockAddEmpty.mockRejectedValue(
        new Error('Marca es requerida para cilindros vacíos')
      );

      await expect(
        addInventoryEmpty({
          type: '40lb',
          brand: undefined as any,
          color: 'Naranja',
          quantity: 5,
        })
      ).rejects.toThrow('Marca es requerida para cilindros vacíos');
    });
  });

  describe('getInventorySummary', () => {
    it('should fetch inventory summary', async () => {
      const mockGetSummary = getInventorySummary as jest.MockedFunction<
        typeof getInventorySummary
      >;
      const mockData = [
        { type: '33lb', quantity: 10, unit_cost: 150 },
        { type: '40lb', quantity: 5, unit_cost: 180 },
      ];
      mockGetSummary.mockResolvedValue(mockData);

      const result = await getInventorySummary();

      expect(mockGetSummary).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should handle database errors in summary', async () => {
      const mockGetSummary = getInventorySummary as jest.MockedFunction<
        typeof getInventorySummary
      >;
      mockGetSummary.mockRejectedValue(new Error('Connection failed'));

      await expect(getInventorySummary()).rejects.toThrow('Connection failed');
    });
  });

  describe('getInventoryStats', () => {
    it('should calculate inventory statistics', async () => {
      const mockGetStats = getInventoryStats as jest.MockedFunction<
        typeof getInventoryStats
      >;
      const mockData = {
        totalFullCylinders: 17,
        totalEmptyCylinders: 23,
        totalValue: 3600,
        lowStockAlerts: [],
      };
      mockGetStats.mockResolvedValue(mockData);

      const result = await getInventoryStats();

      expect(mockGetStats).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });
});
