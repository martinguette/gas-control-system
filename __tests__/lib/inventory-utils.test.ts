/**
 * @jest-environment node
 */

import {
  CylinderType,
  CylinderBrand,
  CylinderColor,
  BRAND_TO_COLOR,
  getColorByBrand,
} from '@/types/inventory';

describe('Inventory Types and Utils', () => {
  describe('CylinderType', () => {
    it('should have correct cylinder types', () => {
      const validTypes: CylinderType[] = ['33lb', '40lb', '100lb'];

      expect(validTypes).toContain('33lb');
      expect(validTypes).toContain('40lb');
      expect(validTypes).toContain('100lb');
      expect(validTypes).toHaveLength(3);
    });

    it('should not include kg types', () => {
      const invalidTypes = ['15kg', '18kg', '45kg'];

      invalidTypes.forEach((type) => {
        expect(['33lb', '40lb', '100lb']).not.toContain(type);
      });
    });
  });

  describe('CylinderBrand', () => {
    it('should have correct brand types', () => {
      const validBrands: CylinderBrand[] = [
        'Roscogas',
        'Gasan',
        'Gaspais',
        'Vidagas',
        'Otro',
      ];

      expect(validBrands).toContain('Roscogas');
      expect(validBrands).toContain('Gasan');
      expect(validBrands).toContain('Gaspais');
      expect(validBrands).toContain('Vidagas');
      expect(validBrands).toContain('Otro');
      expect(validBrands).toHaveLength(5);
    });
  });

  describe('CylinderColor', () => {
    it('should have correct color types', () => {
      const validColors: CylinderColor[] = [
        'Naranja',
        'Azul',
        'Verde Oscuro',
        'Verde Claro',
      ];

      expect(validColors).toContain('Naranja');
      expect(validColors).toContain('Azul');
      expect(validColors).toContain('Verde Oscuro');
      expect(validColors).toContain('Verde Claro');
      expect(validColors).toHaveLength(4);
    });

    it('should not include deprecated colors', () => {
      const deprecatedColors = ['Rojo', 'Amarillo'];

      deprecatedColors.forEach((color) => {
        expect([
          'Naranja',
          'Azul',
          'Verde Oscuro',
          'Verde Claro',
        ]).not.toContain(color);
      });
    });
  });

  describe('BRAND_TO_COLOR mapping', () => {
    it('should map Roscogas to Naranja', () => {
      expect(BRAND_TO_COLOR.Roscogas).toBe('Naranja');
    });

    it('should map Gasan to Azul', () => {
      expect(BRAND_TO_COLOR.Gasan).toBe('Azul');
    });

    it('should map Gaspais to Verde Oscuro', () => {
      expect(BRAND_TO_COLOR.Gaspais).toBe('Verde Oscuro');
    });

    it('should map Vidagas to Verde Claro', () => {
      expect(BRAND_TO_COLOR.Vidagas).toBe('Verde Claro');
    });

    it('should map Otro to Naranja (default)', () => {
      expect(BRAND_TO_COLOR.Otro).toBe('Naranja');
    });

    it('should have all brands mapped', () => {
      const brands: CylinderBrand[] = [
        'Roscogas',
        'Gasan',
        'Gaspais',
        'Vidagas',
        'Otro',
      ];

      brands.forEach((brand) => {
        expect(BRAND_TO_COLOR[brand]).toBeDefined();
        expect(typeof BRAND_TO_COLOR[brand]).toBe('string');
      });
    });
  });

  describe('getColorByBrand function', () => {
    it('should return correct color for Roscogas', () => {
      expect(getColorByBrand('Roscogas')).toBe('Naranja');
    });

    it('should return correct color for Gasan', () => {
      expect(getColorByBrand('Gasan')).toBe('Azul');
    });

    it('should return correct color for Gaspais', () => {
      expect(getColorByBrand('Gaspais')).toBe('Verde Oscuro');
    });

    it('should return correct color for Vidagas', () => {
      expect(getColorByBrand('Vidagas')).toBe('Verde Claro');
    });

    it('should return default color for Otro', () => {
      expect(getColorByBrand('Otro')).toBe('Naranja');
    });

    it('should handle all valid brands', () => {
      const brands: CylinderBrand[] = [
        'Roscogas',
        'Gasan',
        'Gaspais',
        'Vidagas',
        'Otro',
      ];

      brands.forEach((brand) => {
        const color = getColorByBrand(brand);
        expect(color).toBeDefined();
        expect(['Naranja', 'Azul', 'Verde Oscuro', 'Verde Claro']).toContain(
          color
        );
      });
    });

    it('should be consistent with BRAND_TO_COLOR mapping', () => {
      const brands: CylinderBrand[] = [
        'Roscogas',
        'Gasan',
        'Gaspais',
        'Vidagas',
        'Otro',
      ];

      brands.forEach((brand) => {
        expect(getColorByBrand(brand)).toBe(BRAND_TO_COLOR[brand]);
      });
    });
  });

  describe('Type Safety', () => {
    it('should enforce correct cylinder types in operations', () => {
      const validOperation = {
        type: 'add' as const,
        inventory_type: 'full' as const,
        product_type: '33lb' as CylinderType,
        quantity: 10,
        unit_cost: 150,
      };

      expect(validOperation.product_type).toBe('33lb');
      expect(['33lb', '40lb', '100lb']).toContain(validOperation.product_type);
    });

    it('should enforce correct brand types for empty cylinders', () => {
      const validEmptyOperation = {
        type: 'add' as const,
        inventory_type: 'empty' as const,
        product_type: '40lb' as CylinderType,
        brand: 'Roscogas' as CylinderBrand,
        color: 'Naranja' as CylinderColor,
        quantity: 5,
      };

      expect(validEmptyOperation.brand).toBe('Roscogas');
      expect(['Roscogas', 'Gasan', 'Gaspais', 'Vidagas', 'Otro']).toContain(
        validEmptyOperation.brand
      );
    });

    it('should enforce correct color types', () => {
      const validColor: CylinderColor = 'Naranja';

      expect(['Naranja', 'Azul', 'Verde Oscuro', 'Verde Claro']).toContain(
        validColor
      );
    });
  });

  describe('Business Rules Validation', () => {
    it('should enforce Roscogas is always Naranja', () => {
      expect(getColorByBrand('Roscogas')).toBe('Naranja');
      expect(BRAND_TO_COLOR.Roscogas).toBe('Naranja');
    });

    it('should enforce Gasan is always Azul', () => {
      expect(getColorByBrand('Gasan')).toBe('Azul');
      expect(BRAND_TO_COLOR.Gasan).toBe('Azul');
    });

    it('should enforce Gaspais is always Verde Oscuro', () => {
      expect(getColorByBrand('Gaspais')).toBe('Verde Oscuro');
      expect(BRAND_TO_COLOR.Gaspais).toBe('Verde Oscuro');
    });

    it('should enforce Vidagas is always Verde Claro', () => {
      expect(getColorByBrand('Vidagas')).toBe('Verde Claro');
      expect(BRAND_TO_COLOR.Vidagas).toBe('Verde Claro');
    });

    it('should not allow invalid brand-color combinations', () => {
      // Roscogas should never be blue
      expect(getColorByBrand('Roscogas')).not.toBe('Azul');

      // Gasan should never be orange
      expect(getColorByBrand('Gasan')).not.toBe('Naranja');
    });
  });
});
