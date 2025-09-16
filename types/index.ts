export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'jefe' | 'vendedor';
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  full_name: string;
  email: string;
  role: 'jefe' | 'vendedor';
  password: string;
  repeatPassword: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'jefe' | 'vendedor';
  created_at?: string;
  updated_at?: string;
}

// Re-export inventory types
export * from './inventory';

// =====================================================
// TIPOS PARA TRANSACCIONES Y VENTAS
// =====================================================

export interface Sale {
  id: string;
  vendor_id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  customer_location: string;
  product_type: '33lb' | '40lb' | '100lb';
  sale_type: 'intercambio' | 'completa' | 'venta_vacios' | 'compra_vacios';
  empty_brand?: string;
  empty_color?: string;
  amount_charged: number;
  payment_method: 'efectivo' | 'transferencia' | 'credito';
  created_at: string;
}

export interface SaleItem {
  product_type: '33lb' | '40lb' | '100lb';
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

export interface SaleFormData {
  customer_name: string;
  customer_phone?: string;
  customer_location: string;
  items: SaleItem[]; // Array de items con diferentes tipos de cilindros
  sale_type: 'intercambio' | 'completa' | 'venta_vacios' | 'compra_vacios';
  payment_method: 'efectivo' | 'transferencia' | 'credito';
}

export interface Expense {
  id: string;
  vendor_id: string;
  type: 'gasolina' | 'comida' | 'reparaciones' | 'imprevistos' | 'otros';
  amount: number;
  description: string;
  receipt_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface ExpenseFormData {
  type: 'gasolina' | 'comida' | 'reparaciones' | 'imprevistos' | 'otros';
  amount: number;
  description: string;
  receipt_url?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  location: string;
  custom_prices: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface TruckArrival {
  id: string;
  cylinders_received: Record<string, number>;
  cylinders_delivered: Record<string, Record<string, number>>;
  unit_cost: number;
  total_invoice: number;
  freight_cost: number;
  created_at: string;
}

export interface DailyAssignment {
  id: string;
  vendor_id: string;
  date: string;
  assigned_cylinders: Record<string, number>;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Goal {
  id: string;
  type: 'general' | 'individual';
  vendor_id?: string;
  period: 'semanal' | 'mensual' | 'semestral' | 'anual';
  target_kg: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}
