// =====================================================
// TIPOS TYPESCRIPT PARA SISTEMA DE INVENTARIO
// =====================================================

// =====================================================
// 1. TIPOS BÁSICOS
// =====================================================

export type CylinderType = '33lb' | '40lb' | '100lb';
export type CylinderBrand = 'Roscogas' | 'Otro';
export type CylinderColor = 'Azul' | 'Rojo' | 'Verde' | 'Amarillo' | 'Otro';
export type InventoryType = 'full' | 'empty';

// =====================================================
// 2. INVENTARIO DE CILINDROS LLENOS
// =====================================================

export interface InventoryFull {
  id: string;
  type: CylinderType;
  quantity: number;
  unit_cost: number;
  updated_at: string;
}

export interface InventoryFullInsert {
  type: CylinderType;
  quantity?: number;
  unit_cost?: number;
}

export interface InventoryFullUpdate {
  quantity?: number;
  unit_cost?: number;
}

// =====================================================
// 3. INVENTARIO DE CILINDROS VACÍOS
// =====================================================

export interface InventoryEmpty {
  id: string;
  type: CylinderType;
  brand: string;
  color: string;
  quantity: number;
  updated_at: string;
}

export interface InventoryEmptyInsert {
  type: CylinderType;
  brand: string;
  color: string;
  quantity?: number;
}

export interface InventoryEmptyUpdate {
  quantity?: number;
}

// =====================================================
// 4. CONFIGURACIÓN DE ALERTAS
// =====================================================

export interface InventoryAlert {
  id: string;
  type: InventoryType;
  product_type: CylinderType;
  brand?: string;
  color?: string;
  min_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryAlertInsert {
  type: InventoryType;
  product_type: CylinderType;
  brand?: string;
  color?: string;
  min_threshold: number;
  is_active?: boolean;
}

export interface InventoryAlertUpdate {
  min_threshold?: number;
  is_active?: boolean;
}

// =====================================================
// 5. RESUMEN DE INVENTARIO
// =====================================================

export interface InventorySummary {
  product_type: CylinderType;
  full_quantity: number;
  full_unit_cost: number;
  empty_total_quantity: number;
  empty_brands: EmptyBrandInfo[];
}

export interface EmptyBrandInfo {
  brand: string;
  color: string;
  quantity: number;
}

// =====================================================
// 6. ALERTAS DE STOCK BAJO
// =====================================================

export interface LowStockAlert {
  alert_id: string;
  alert_type: InventoryType;
  product_type: CylinderType;
  brand?: string;
  color?: string;
  current_quantity: number;
  min_threshold: number;
  alert_message: string;
}

// =====================================================
// 7. OPERACIONES DE INVENTARIO
// =====================================================

export interface InventoryOperation {
  type: 'add' | 'subtract' | 'set';
  inventory_type: InventoryType;
  product_type: CylinderType;
  brand?: string;
  color?: string;
  quantity: number;
  unit_cost?: number;
}

export interface InventoryTransaction {
  id: string;
  operation: InventoryOperation;
  user_id: string;
  reason: string;
  created_at: string;
}

// =====================================================
// 8. CONFIGURACIÓN DE INVENTARIO
// =====================================================

export interface InventoryConfig {
  default_alerts: {
    full: {
      [K in CylinderType]: number;
    };
    empty: {
      [K in CylinderType]: number;
    };
  };
  brands: CylinderBrand[];
  colors: CylinderColor[];
  types: CylinderType[];
}

// =====================================================
// 9. ESTADÍSTICAS DE INVENTARIO
// =====================================================

export interface InventoryStats {
  total_full_cylinders: number;
  total_empty_cylinders: number;
  total_value: number;
  low_stock_alerts: number;
  by_type: {
    [K in CylinderType]: {
      full: number;
      empty: number;
      value: number;
    };
  };
}

// =====================================================
// 10. UTILIDADES DE CONVERSIÓN
// =====================================================

export const CYLINDER_WEIGHTS: Record<CylinderType, number> = {
  '33lb': 15.0, // kg
  '40lb': 18.0, // kg
  '100lb': 45.0, // kg
};

export const CYLINDER_TYPES: CylinderType[] = ['33lb', '40lb', '100lb'];
export const CYLINDER_BRANDS: CylinderBrand[] = ['Roscogas', 'Otro'];
export const CYLINDER_COLORS: CylinderColor[] = [
  'Azul',
  'Rojo',
  'Verde',
  'Amarillo',
  'Otro',
];

// =====================================================
// 11. FUNCIONES DE UTILIDAD
// =====================================================

export const convertLbsToKg = (lbs: CylinderType): number => {
  return CYLINDER_WEIGHTS[lbs];
};

export const getCylinderDisplayName = (type: CylinderType): string => {
  const weights = CYLINDER_WEIGHTS[type];
  return `${type} (${weights}kg)`;
};

export const getEmptyCylinderDisplayName = (
  type: CylinderType,
  brand: string,
  color: string
): string => {
  return `${getCylinderDisplayName(type)} - ${brand} ${color}`;
};

// =====================================================
// 12. VALIDACIONES
// =====================================================

export const isValidCylinderType = (type: string): type is CylinderType => {
  return CYLINDER_TYPES.includes(type as CylinderType);
};

export const isValidCylinderBrand = (brand: string): brand is CylinderBrand => {
  return CYLINDER_BRANDS.includes(brand as CylinderBrand);
};

export const isValidCylinderColor = (color: string): color is CylinderColor => {
  return CYLINDER_COLORS.includes(color as CylinderColor);
};

// =====================================================
// 13. CONSTANTES DE CONFIGURACIÓN
// =====================================================

export const DEFAULT_INVENTORY_CONFIG: InventoryConfig = {
  default_alerts: {
    full: {
      '33lb': 5,
      '40lb': 3,
      '100lb': 2,
    },
    empty: {
      '33lb': 10,
      '40lb': 8,
      '100lb': 5,
    },
  },
  brands: CYLINDER_BRANDS,
  colors: CYLINDER_COLORS,
  types: CYLINDER_TYPES,
};
