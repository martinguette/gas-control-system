'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { saleSchema, expenseSchema } from '@/lib/validations';
import { SaleFormData, ExpenseFormData } from '@/types';

// =====================================================
// SERVER ACTIONS PARA TRANSACCIONES
// =====================================================

/**
 * Crear una nueva venta
 */
export async function createSale(formData: SaleFormData) {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'No autorizado' };
  }

  // Verificar que el usuario es vendedor
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'vendedor') {
    return {
      success: false,
      error: 'Solo los vendedores pueden registrar ventas',
    };
  }

  // Validar datos
  const validatedData = saleSchema.safeParse(formData);
  if (!validatedData.success) {
    return {
      success: false,
      error: 'Datos inválidos',
      details: validatedData.error.flatten().fieldErrors,
    };
  }

  const { data: saleData } = validatedData;

  try {
    // Verificar disponibilidad de inventario
    if (
      saleData.sale_type === 'intercambio' ||
      saleData.sale_type === 'completa'
    ) {
      const { data: inventory } = await supabase
        .from('inventory_full')
        .select('quantity')
        .eq('type', saleData.product_type)
        .single();

      if (!inventory || inventory.quantity < saleData.quantity) {
        return {
          success: false,
          error: `No hay suficientes cilindros ${
            saleData.product_type
          } disponibles en inventario. Disponibles: ${
            inventory?.quantity || 0
          }, Solicitados: ${saleData.quantity}`,
        };
      }
    }

    // Crear la venta
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        vendor_id: user.id,
        customer_name: saleData.customer_name,
        customer_phone: saleData.customer_phone || null,
        customer_location: saleData.customer_location,
        product_type: saleData.product_type,
        quantity: saleData.quantity,
        sale_type: saleData.sale_type,
        amount_charged: saleData.amount_charged,
        unit_cost: saleData.unit_cost,
        payment_method: saleData.payment_method,
      })
      .select()
      .single();

    if (saleError) {
      console.error('Error creating sale:', saleError);
      return { success: false, error: 'Error al registrar la venta' };
    }

    // Actualizar inventario según el tipo de transacción
    await updateInventoryForSale(supabase, saleData);

    // Revalidar páginas relevantes
    revalidatePath('/dashboard/vendor/sales');
    revalidatePath('/dashboard/admin/en-ruta');

    return { success: true, data: sale };
  } catch (error) {
    console.error('Error in createSale:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Crear un nuevo gasto
 */
export async function createExpense(formData: ExpenseFormData) {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'No autorizado' };
  }

  // Verificar que el usuario es vendedor
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'vendedor') {
    return {
      success: false,
      error: 'Solo los vendedores pueden registrar gastos',
    };
  }

  // Validar datos
  const validatedData = expenseSchema.safeParse(formData);
  if (!validatedData.success) {
    return {
      success: false,
      error: 'Datos inválidos',
      details: validatedData.error.flatten().fieldErrors,
    };
  }

  const { data: expenseData } = validatedData;

  try {
    // Crear el gasto
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        vendor_id: user.id,
        type: expenseData.type,
        amount: expenseData.amount,
        description: expenseData.description,
        receipt_url: expenseData.receipt_url || null,
        status: 'pending',
      })
      .select()
      .single();

    if (expenseError) {
      console.error('Error creating expense:', expenseError);
      return { success: false, error: 'Error al registrar el gasto' };
    }

    // Revalidar páginas relevantes
    revalidatePath('/dashboard/vendor/expenses');
    revalidatePath('/dashboard/admin/en-ruta');

    return { success: true, data: expense };
  } catch (error) {
    console.error('Error in createExpense:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtener ventas del vendedor actual
 */
export async function getVendorSales(limit: number = 50) {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'No autorizado' };
  }

  try {
    const { data: sales, error } = await supabase.rpc('get_vendor_sales', {
      p_vendor_id: user.id,
      p_limit: limit,
      p_offset: 0,
    });

    if (error) {
      console.error('Error fetching sales:', error);
      return { success: false, error: 'Error al obtener las ventas' };
    }

    return { success: true, data: sales || [] };
  } catch (error) {
    console.error('Error in getVendorSales:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtener gastos del vendedor actual
 */
export async function getVendorExpenses(limit: number = 50) {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'No autorizado' };
  }

  try {
    const { data: expenses, error } = await supabase.rpc(
      'get_vendor_expenses',
      {
        p_vendor_id: user.id,
        p_limit: limit,
        p_offset: 0,
      }
    );

    if (error) {
      console.error('Error fetching expenses:', error);
      return { success: false, error: 'Error al obtener los gastos' };
    }

    return { success: true, data: expenses || [] };
  } catch (error) {
    console.error('Error in getVendorExpenses:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtener estadísticas del vendedor para el día actual
 */
export async function getVendorDailyStats() {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'No autorizado' };
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    // Usar la función RPC para obtener estadísticas
    const { data: stats, error: statsError } = await supabase.rpc(
      'get_vendor_daily_stats',
      {
        p_vendor_id: user.id,
        p_date: today,
      }
    );

    if (statsError) {
      console.error('Error fetching daily stats:', statsError);
      return {
        success: false,
        error: 'Error al obtener las estadísticas del día',
      };
    }

    if (!stats || stats.length === 0) {
      return {
        success: true,
        data: {
          totalSales: 0,
          totalExpenses: 0,
          dailyMargin: 0,
          cylindersSold: {},
          salesCount: 0,
          expensesCount: 0,
        },
      };
    }

    const stat = stats[0];

    return {
      success: true,
      data: {
        totalSales: parseFloat(stat.total_sales) || 0,
        totalExpenses: parseFloat(stat.total_expenses) || 0,
        dailyMargin: parseFloat(stat.daily_margin) || 0,
        cylindersSold: stat.cylinders_sold || {},
        salesCount: parseInt(stat.sales_count) || 0,
        expensesCount: parseInt(stat.expenses_count) || 0,
      },
    };
  } catch (error) {
    console.error('Error in getVendorDailyStats:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

/**
 * Actualizar inventario según el tipo de transacción
 */
async function updateInventoryForSale(supabase: any, saleData: SaleFormData) {
  try {
    const quantity = saleData.quantity;

    switch (saleData.sale_type) {
      case 'intercambio':
        // -quantity cilindros llenos, +quantity cilindros vacíos
        await updateInventoryFull(supabase, saleData.product_type, -quantity);
        // Para intercambios, asumimos que los cilindros vacíos son de marca Roscogas (naranja)
        await updateInventoryEmpty(
          supabase,
          saleData.product_type,
          'Roscogas',
          'Naranja',
          quantity
        );
        break;

      case 'completa':
        // -quantity cilindros llenos únicamente
        await updateInventoryFull(supabase, saleData.product_type, -quantity);
        break;

      case 'venta_vacios':
        // -quantity cilindros vacíos (asumimos Roscogas)
        await updateInventoryEmpty(
          supabase,
          saleData.product_type,
          'Roscogas',
          'Naranja',
          -quantity
        );
        break;

      case 'compra_vacios':
        // +quantity cilindros vacíos (asumimos Roscogas)
        await updateInventoryEmpty(
          supabase,
          saleData.product_type,
          'Roscogas',
          'Naranja',
          quantity
        );
        break;
    }
  } catch (error) {
    console.error('Error updating inventory for sale:', error);
    throw error;
  }
}

/**
 * Actualizar inventario de cilindros llenos
 */
async function updateInventoryFull(
  supabase: any,
  type: string,
  quantityChange: number
) {
  const { error } = await supabase.rpc('update_inventory_full', {
    p_type: type,
    p_quantity_change: quantityChange,
  });

  if (error) {
    console.error('Error updating full inventory:', error);
    throw error;
  }
}

/**
 * Actualizar inventario de cilindros vacíos
 */
async function updateInventoryEmpty(
  supabase: any,
  type: string,
  brand: string,
  color: string,
  quantityChange: number
) {
  const { error } = await supabase.rpc('update_inventory_empty', {
    p_type: type,
    p_brand: brand,
    p_color: color,
    p_quantity_change: quantityChange,
  });

  if (error) {
    console.error('Error updating empty inventory:', error);
    throw error;
  }
}
