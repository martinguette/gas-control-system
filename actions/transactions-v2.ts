'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { saleSchema, expenseSchema } from '@/lib/validations';
import { SaleFormData, ExpenseFormData } from '@/types';

// =====================================================
// SERVER ACTIONS PARA TRANSACCIONES V2
// =====================================================

/**
 * Crear una nueva venta con múltiples items
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

  const saleData = validatedData.data;

  try {
    // Verificar inventario disponible para cada item
    for (const item of saleData.items) {
      console.log(
        '🔍 Verificando inventario para:',
        item.product_type,
        'cantidad:',
        item.quantity
      );

      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory_full')
        .select('quantity, unit_cost')
        .eq('type', item.product_type)
        .maybeSingle();

      console.log('📦 Resultado consulta inventario:', {
        inventory,
        inventoryError,
      });

      if (inventoryError) {
        console.error('❌ Error consultando inventario:', inventoryError);
        return {
          success: false,
          error: `Error al consultar inventario: ${inventoryError.message}`,
        };
      }

      if (!inventory) {
        console.log(
          '❌ No existe registro de inventario para:',
          item.product_type
        );
        return {
          success: false,
          error: `No existe registro de inventario para cilindros ${item.product_type}. Por favor, contacta al administrador para configurar el inventario.`,
        };
      }

      console.log(
        '📊 Disponible:',
        inventory.quantity,
        'Solicitado:',
        item.quantity
      );

      if (inventory.quantity < item.quantity) {
        console.log('❌ Inventario insuficiente:', {
          disponible: inventory.quantity,
          solicitado: item.quantity,
        });
        return {
          success: false,
          error: `No hay suficientes cilindros ${item.product_type} disponibles en inventario. Disponibles: ${inventory.quantity}, Solicitados: ${item.quantity}`,
        };
      }

      console.log('✅ Inventario suficiente para:', item.product_type);
    }

    // Crear la venta usando la nueva función
    const { data: saleId, error: saleError } = await supabase.rpc(
      'create_sale_with_items',
      {
        p_vendor_id: user.id,
        p_customer_name: saleData.customer_name,
        p_sale_type: saleData.sale_type,
        p_payment_method: saleData.payment_method,
        p_items: saleData.items,
        p_customer_phone: saleData.customer_phone || null,
        p_customer_location: saleData.customer_location,
      }
    );

    if (saleError) {
      console.error('Error creating sale:', saleError);
      return {
        success: false,
        error: 'Error al registrar la venta. Inténtalo de nuevo.',
      };
    }

    // Actualizar inventario para cada item
    await updateInventoryForSaleItems(supabase, saleData);

    // Revalidar la página
    revalidatePath('/dashboard/vendor/sales');
    revalidatePath('/dashboard/vendor');

    return {
      success: true,
      data: { id: saleId },
    };
  } catch (error) {
    console.error('Error in createSale:', error);
    return {
      success: false,
      error: 'Error interno del servidor. Inténtalo de nuevo.',
    };
  }
}

/**
 * Actualizar inventario para múltiples items de venta
 */
async function updateInventoryForSaleItems(
  supabase: any,
  saleData: SaleFormData
) {
  try {
    for (const item of saleData.items) {
      switch (saleData.sale_type) {
        case 'intercambio':
          // -quantity cilindros llenos, +quantity cilindros vacíos
          await updateInventoryFull(
            supabase,
            item.product_type,
            -item.quantity
          );
          // Para intercambios, asumimos que los cilindros vacíos son de marca Roscogas (naranja)
          await updateInventoryEmpty(
            supabase,
            item.product_type,
            'Roscogas',
            'Naranja',
            item.quantity
          );
          break;

        case 'completa':
          // -quantity cilindros llenos únicamente
          await updateInventoryFull(
            supabase,
            item.product_type,
            -item.quantity
          );
          break;

        case 'venta_vacios':
          // -quantity cilindros vacíos (asumimos Roscogas)
          await updateInventoryEmpty(
            supabase,
            item.product_type,
            'Roscogas',
            'Naranja',
            -item.quantity
          );
          break;

        case 'compra_vacios':
          // +quantity cilindros vacíos (asumimos Roscogas)
          await updateInventoryEmpty(
            supabase,
            item.product_type,
            'Roscogas',
            'Naranja',
            item.quantity
          );
          break;
      }
    }
  } catch (error) {
    console.error('Error updating inventory for sale items:', error);
    throw error;
  }
}

/**
 * Actualizar inventario de cilindros llenos
 */
async function updateInventoryFull(
  supabase: any,
  productType: string,
  quantityChange: number
) {
  const { error } = await supabase.rpc('update_inventory_full', {
    p_product_type: productType,
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
  productType: string,
  brand: string,
  color: string,
  quantityChange: number
) {
  const { error } = await supabase.rpc('update_inventory_empty', {
    p_product_type: productType,
    p_brand: brand,
    p_color: color,
    p_quantity_change: quantityChange,
  });

  if (error) {
    console.error('Error updating empty inventory:', error);
    throw error;
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

  const expenseData = validatedData.data;

  try {
    // Crear el gasto
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        vendor_id: user.id,
        type: expenseData.type,
        amount: expenseData.amount,
        description: expenseData.description,
        status: 'pending', // Los gastos requieren aprobación del jefe
      })
      .select()
      .single();

    if (expenseError) {
      console.error('Error creating expense:', expenseError);
      return {
        success: false,
        error: 'Error al registrar el gasto. Inténtalo de nuevo.',
      };
    }

    // Revalidar la página
    revalidatePath('/dashboard/vendor/expenses');
    revalidatePath('/dashboard/vendor');

    return {
      success: true,
      data: expense,
    };
  } catch (error) {
    console.error('Error in createExpense:', error);
    return {
      success: false,
      error: 'Error interno del servidor. Inténtalo de nuevo.',
    };
  }
}

/**
 * Obtener ventas del vendedor con items
 */
export async function getVendorSales(limit = 50, offset = 0) {
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
    // Usar la nueva función RPC
    const { data: sales, error: salesError } = await supabase.rpc(
      'get_vendor_sales_with_items',
      {
        p_vendor_id: user.id,
        p_limit: limit,
        p_offset: offset,
      }
    );

    if (salesError) {
      console.error('Error fetching sales:', salesError);
      return {
        success: false,
        error: 'Error al obtener las ventas',
      };
    }

    return {
      success: true,
      data: sales,
    };
  } catch (error) {
    console.error('Error in getVendorSales:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
}

/**
 * Obtener gastos del vendedor
 */
export async function getVendorExpenses(limit = 50, offset = 0) {
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
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .eq('vendor_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (expensesError) {
      console.error('Error fetching expenses:', expensesError);
      return {
        success: false,
        error: 'Error al obtener los gastos',
      };
    }

    return {
      success: true,
      data: expenses,
    };
  } catch (error) {
    console.error('Error in getVendorExpenses:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
}

/**
 * Obtener estadísticas diarias del vendedor
 */
export async function getVendorDailyStats(date?: string) {
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'No autorizado' };
  }

  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    // Usar la función RPC actualizada
    const { data: stats, error: statsError } = await supabase.rpc(
      'get_vendor_daily_stats',
      {
        p_vendor_id: user.id,
        p_date: targetDate,
      }
    );

    if (statsError) {
      console.error('Error fetching daily stats:', statsError);
      return {
        success: false,
        error: 'Error al obtener las estadísticas',
      };
    }

    return {
      success: true,
      data: stats[0] || {
        total_sales: 0,
        total_expenses: 0,
        daily_margin: 0,
        cylinders_sold: {},
        sales_count: 0,
        expenses_count: 0,
      },
    };
  } catch (error) {
    console.error('Error in getVendorDailyStats:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
}

/**
 * Buscar clientes por nombre
 */
export async function searchCustomers(name: string) {
  console.log(
    '🔍 searchCustomers - Iniciando búsqueda para:',
    name,
    'Longitud:',
    name.length
  );

  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  console.log('👤 searchCustomers - Usuario:', user?.id || 'No autenticado');

  if (authError || !user) {
    console.log('❌ searchCustomers - Error de autenticación:', authError);
    return { success: false, error: 'No autorizado' };
  }

  if (name.length < 2 && name.length > 0) {
    console.log(
      '⚠️ searchCustomers - Nombre muy corto, devolviendo array vacío'
    );
    return { success: true, data: [] };
  }

  try {
    let customers, customersError;

    if (name.length === 0) {
      console.log('📋 searchCustomers - Obteniendo todos los clientes...');

      // Primero probemos una consulta simple sin filtros
      console.log('🔍 Probando consulta simple...');
      const simpleResult = await supabase
        .from('customers')
        .select('*')
        .limit(5);
      console.log('📦 Consulta simple:', {
        data: simpleResult.data?.length || 0,
        error: simpleResult.error,
        first: simpleResult.data?.[0],
      });

      // Si no hay nombre, obtener todos los clientes
      const result = await supabase
        .from('customers')
        .select('id, name, phone, location, custom_prices, created_at')
        .order('name')
        .limit(50);
      customers = result.data;
      customersError = result.error;
      console.log('📦 searchCustomers - Resultado directo:', {
        customers: customers?.length || 0,
        customersError,
        firstCustomer: customers?.[0],
        allCustomers: customers,
      });
    } else {
      console.log('🔍 searchCustomers - Buscando por nombre usando RPC...');
      // Buscar por nombre usando la función RPC
      const result = await supabase.rpc('search_customer_by_name', {
        p_name: name,
      });
      customers = result.data;
      customersError = result.error;
      console.log('📦 searchCustomers - Resultado RPC:', {
        customers,
        customersError,
      });
    }

    if (customersError) {
      console.error('❌ searchCustomers - Error en consulta:', customersError);
      return {
        success: false,
        error: 'Error al buscar clientes',
      };
    }

    console.log(
      '✅ searchCustomers - Éxito, devolviendo',
      customers?.length || 0,
      'clientes'
    );
    return {
      success: true,
      data: customers,
    };
  } catch (error) {
    console.error('❌ searchCustomers - Error general:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
}

/**
 * Crear un nuevo cliente automáticamente
 */
export async function createCustomer(customerData: {
  name: string;
  phone?: string;
  location?: string;
}) {
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
    // Verificar si el cliente ya existe
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id, name')
      .ilike('name', customerData.name)
      .single();

    if (existingCustomer) {
      return {
        success: true,
        data: existingCustomer,
        message: 'Cliente ya existe',
      };
    }

    // Crear nuevo cliente
    const { data: newCustomer, error: createError } = await supabase
      .from('customers')
      .insert({
        name: customerData.name.trim(),
        phone: customerData.phone?.trim() || null,
        location: customerData.location?.trim() || null,
        custom_prices: {},
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating customer:', createError);
      return {
        success: false,
        error: 'Error al crear el cliente',
      };
    }

    return {
      success: true,
      data: newCustomer,
      message: 'Cliente creado exitosamente',
    };
  } catch (error) {
    console.error('Error in createCustomer:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
}

/**
 * Actualizar un cliente existente
 */
export async function updateCustomer(customerData: {
  id: string;
  name: string;
  phone?: string;
  location?: string;
  custom_prices?: Record<string, number>;
}) {
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
    // Verificar si el cliente existe
    const { data: existingCustomer, error: fetchError } = await supabase
      .from('customers')
      .select('id, name')
      .eq('id', customerData.id)
      .single();

    if (fetchError || !existingCustomer) {
      return {
        success: false,
        error: 'Cliente no encontrado',
      };
    }

    // Verificar si hay otro cliente con el mismo nombre (excluyendo el actual)
    const { data: duplicateCustomer } = await supabase
      .from('customers')
      .select('id, name')
      .ilike('name', customerData.name)
      .neq('id', customerData.id)
      .single();

    if (duplicateCustomer) {
      return {
        success: false,
        error: 'Ya existe otro cliente con ese nombre',
      };
    }

    // Actualizar cliente
    const { data: updatedCustomer, error: updateError } = await supabase
      .from('customers')
      .update({
        name: customerData.name.trim(),
        phone: customerData.phone?.trim() || null,
        location: customerData.location?.trim() || null,
        custom_prices: customerData.custom_prices || {},
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerData.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating customer:', updateError);
      return {
        success: false,
        error: 'Error al actualizar el cliente',
      };
    }

    return {
      success: true,
      data: updatedCustomer,
      message: 'Cliente actualizado exitosamente',
    };
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
    };
  }
}
