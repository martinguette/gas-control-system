'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  inventoryFullSchema,
  inventoryFullUpdateSchema,
  inventoryEmptySchema,
  inventoryEmptyUpdateSchema,
  inventoryAlertSchema,
  inventoryAlertUpdateSchema,
  inventoryOperationSchema,
} from '@/lib/validations';
import type {
  InventoryFull,
  InventoryEmpty,
  InventoryAlert,
  InventorySummary,
  LowStockAlert,
  InventoryStats,
} from '@/types/inventory';

// =====================================================
// SERVER ACTIONS PARA INVENTARIO DE CILINDROS LLENOS
// =====================================================

export async function getFullInventory(): Promise<{
  data: InventoryFull[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('inventory_full')
      .select('*')
      .order('type');

    if (error) {
      console.error('Error fetching full inventory:', error);
      return {
        data: null,
        error: 'Error al obtener inventario de cilindros llenos',
      };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { data: null, error: 'Error interno del servidor' };
  }
}

export async function updateFullInventory(formData: FormData) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      redirect('/log-in?error=No autorizado');
    }

    // Verificar que el usuario sea jefe
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'jefe') {
      redirect('/dashboard?error=Solo los jefes pueden gestionar inventario');
    }

    const type = formData.get('type') as string;
    const quantity = parseInt(formData.get('quantity') as string);
    const unit_cost = parseFloat(formData.get('unit_cost') as string);

    // Validar datos
    const validation = inventoryFullSchema.safeParse({
      type,
      quantity,
      unit_cost,
    });
    if (!validation.success) {
      redirect(
        `/dashboard/inventory?error=${encodeURIComponent('Datos inválidos')}`
      );
    }

    const { data, error } = await supabase
      .from('inventory_full')
      .upsert({
        type: validation.data.type,
        quantity: validation.data.quantity,
        unit_cost: validation.data.unit_cost,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating full inventory:', error);
      redirect(
        `/dashboard/inventory?error=${encodeURIComponent(
          'Error al actualizar inventario'
        )}`
      );
    }

    revalidatePath('/dashboard/inventory');
    redirect(
      '/dashboard/inventory?success=Inventario actualizado exitosamente'
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    redirect(
      `/dashboard/inventory?error=${encodeURIComponent(
        'Error interno del servidor'
      )}`
    );
  }
}

// =====================================================
// SERVER ACTIONS PARA INVENTARIO DE CILINDROS VACÍOS
// =====================================================

export async function getEmptyInventory(): Promise<{
  data: InventoryEmpty[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('inventory_empty')
      .select('*')
      .order('type, brand, color');

    if (error) {
      console.error('Error fetching empty inventory:', error);
      return {
        data: null,
        error: 'Error al obtener inventario de cilindros vacíos',
      };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { data: null, error: 'Error interno del servidor' };
  }
}

export async function updateEmptyInventory(formData: FormData) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      redirect('/log-in?error=No autorizado');
    }

    // Verificar que el usuario sea jefe
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'jefe') {
      redirect('/dashboard?error=Solo los jefes pueden gestionar inventario');
    }

    const type = formData.get('type') as string;
    const brand = formData.get('brand') as string;
    const color = formData.get('color') as string;
    const quantity = parseInt(formData.get('quantity') as string);

    // Validar datos
    const validation = inventoryEmptySchema.safeParse({
      type,
      brand,
      color,
      quantity,
    });
    if (!validation.success) {
      redirect(
        `/dashboard/inventory?error=${encodeURIComponent('Datos inválidos')}`
      );
    }

    const { data, error } = await supabase
      .from('inventory_empty')
      .upsert({
        type: validation.data.type,
        brand: validation.data.brand,
        color: validation.data.color,
        quantity: validation.data.quantity,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating empty inventory:', error);
      redirect(
        `/dashboard/inventory?error=${encodeURIComponent(
          'Error al actualizar inventario'
        )}`
      );
    }

    revalidatePath('/dashboard/inventory');
    redirect(
      '/dashboard/inventory?success=Inventario actualizado exitosamente'
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    redirect(
      `/dashboard/inventory?error=${encodeURIComponent(
        'Error interno del servidor'
      )}`
    );
  }
}

// =====================================================
// SERVER ACTIONS PARA RESUMEN DE INVENTARIO
// =====================================================

export async function getInventorySummary(): Promise<{
  summary: InventorySummary[] | null;
  alerts: LowStockAlert[] | null;
  stats: InventoryStats | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    // Obtener resumen usando la función de la base de datos
    const { data: summary, error: summaryError } = await supabase.rpc(
      'get_inventory_summary'
    );

    if (summaryError) {
      console.error('Error fetching inventory summary:', summaryError);
      return {
        summary: null,
        alerts: null,
        stats: null,
        error: 'Error al obtener resumen de inventario',
      };
    }

    // Obtener alertas de stock bajo
    const { data: alerts, error: alertsError } = await supabase.rpc(
      'check_low_stock_alerts'
    );

    if (alertsError) {
      console.error('Error fetching low stock alerts:', alertsError);
    }

    // Calcular estadísticas
    const totalFullCylinders =
      summary?.reduce(
        (sum: number, item: any) => sum + item.full_quantity,
        0
      ) || 0;
    const totalEmptyCylinders =
      summary?.reduce(
        (sum: number, item: any) => sum + item.empty_total_quantity,
        0
      ) || 0;
    const totalValue =
      summary?.reduce(
        (sum: number, item: any) =>
          sum + item.full_quantity * item.full_unit_cost,
        0
      ) || 0;

    const stats: InventoryStats = {
      total_full_cylinders: totalFullCylinders,
      total_empty_cylinders: totalEmptyCylinders,
      total_value: totalValue,
      low_stock_alerts: alerts?.length || 0,
      by_type:
        summary?.reduce((acc: any, item: any) => {
          acc[item.product_type] = {
            full: item.full_quantity,
            empty: item.empty_total_quantity,
            value: item.full_quantity * item.full_unit_cost,
          };
          return acc;
        }, {}) || {},
    };

    return {
      summary: summary || [],
      alerts: alerts || [],
      stats,
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      summary: null,
      alerts: null,
      stats: null,
      error: 'Error interno del servidor',
    };
  }
}

// =====================================================
// SERVER ACTIONS PARA ALERTAS DE INVENTARIO
// =====================================================

export async function getInventoryAlerts(): Promise<{
  alerts: InventoryAlert[] | null;
  low_stock_alerts: LowStockAlert[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { alerts: null, low_stock_alerts: null, error: 'No autorizado' };
    }

    // Verificar que el usuario sea jefe
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'jefe') {
      return {
        alerts: null,
        low_stock_alerts: null,
        error: 'Solo los jefes pueden ver alertas',
      };
    }

    // Obtener alertas activas
    const { data: alerts, error: alertsError } = await supabase
      .from('inventory_alerts')
      .select('*')
      .eq('is_active', true)
      .order('type, product_type');

    if (alertsError) {
      console.error('Error fetching inventory alerts:', alertsError);
      return {
        alerts: null,
        low_stock_alerts: null,
        error: 'Error al obtener alertas',
      };
    }

    // Obtener alertas de stock bajo actuales
    const { data: lowStockAlerts, error: lowStockError } = await supabase.rpc(
      'check_low_stock_alerts'
    );

    if (lowStockError) {
      console.error('Error fetching low stock alerts:', lowStockError);
    }

    return {
      alerts: alerts || [],
      low_stock_alerts: lowStockAlerts || [],
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      alerts: null,
      low_stock_alerts: null,
      error: 'Error interno del servidor',
    };
  }
}

export async function createInventoryAlert(formData: FormData) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      redirect('/log-in?error=No autorizado');
    }

    // Verificar que el usuario sea jefe
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'jefe') {
      redirect('/dashboard?error=Solo los jefes pueden crear alertas');
    }

    const type = formData.get('type') as string;
    const product_type = formData.get('product_type') as string;
    const brand = formData.get('brand') as string;
    const color = formData.get('color') as string;
    const min_threshold = parseInt(formData.get('min_threshold') as string);
    const is_active = formData.get('is_active') === 'true';

    // Validar datos
    const validation = inventoryAlertSchema.safeParse({
      type,
      product_type,
      brand: brand || undefined,
      color: color || undefined,
      min_threshold,
      is_active,
    });

    if (!validation.success) {
      redirect(
        `/dashboard/inventory/alerts?error=${encodeURIComponent(
          'Datos inválidos'
        )}`
      );
    }

    const { data, error } = await supabase
      .from('inventory_alerts')
      .insert({
        type: validation.data.type,
        product_type: validation.data.product_type,
        brand: validation.data.brand,
        color: validation.data.color,
        min_threshold: validation.data.min_threshold,
        is_active: validation.data.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating inventory alert:', error);
      redirect(
        `/dashboard/inventory/alerts?error=${encodeURIComponent(
          'Error al crear alerta'
        )}`
      );
    }

    revalidatePath('/dashboard/inventory/alerts');
    redirect('/dashboard/inventory/alerts?success=Alerta creada exitosamente');
  } catch (error) {
    console.error('Unexpected error:', error);
    redirect(
      `/dashboard/inventory/alerts?error=${encodeURIComponent(
        'Error interno del servidor'
      )}`
    );
  }
}

// =====================================================
// SERVER ACTIONS PARA OPERACIONES DE INVENTARIO
// =====================================================

export async function performInventoryOperation(formData: FormData) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      redirect('/log-in?error=No autorizado');
    }

    // Verificar que el usuario sea jefe
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'jefe') {
      redirect(
        '/dashboard?error=Solo los jefes pueden realizar operaciones de inventario'
      );
    }

    const type = formData.get('type') as string;
    const inventory_type = formData.get('inventory_type') as string;
    const product_type = formData.get('product_type') as string;
    const brand = formData.get('brand') as string;
    const color = formData.get('color') as string;
    const quantity = parseInt(formData.get('quantity') as string);
    const unit_cost = formData.get('unit_cost')
      ? parseFloat(formData.get('unit_cost') as string)
      : undefined;
    const reason = formData.get('reason') as string;

    // Validar datos
    const validation = inventoryOperationSchema.safeParse({
      type,
      inventory_type,
      product_type,
      brand: brand || undefined,
      color: color || undefined,
      quantity,
      unit_cost,
      reason,
    });

    if (!validation.success) {
      redirect(
        `/dashboard/inventory?error=${encodeURIComponent('Datos inválidos')}`
      );
    }

    const {
      type: operationType,
      inventory_type: invType,
      product_type: prodType,
      brand: opBrand,
      color: opColor,
      quantity: opQuantity,
      unit_cost: opUnitCost,
      reason: opReason,
    } = validation.data;

    // Realizar operación según el tipo
    if (invType === 'full') {
      // Operación en inventario de cilindros llenos
      const { data: currentData, error: fetchError } = await supabase
        .from('inventory_full')
        .select('quantity, unit_cost')
        .eq('type', prodType)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('Error fetching current inventory:', fetchError);
        redirect(
          `/dashboard/inventory?error=${encodeURIComponent(
            'Error al obtener inventario actual'
          )}`
        );
      }

      const currentQuantity = currentData?.quantity || 0;
      const currentUnitCost = currentData?.unit_cost || 0;

      let newQuantity: number;
      let newUnitCost = opUnitCost || currentUnitCost;

      switch (operationType) {
        case 'add':
          newQuantity = currentQuantity + opQuantity;
          break;
        case 'subtract':
          newQuantity = Math.max(0, currentQuantity - opQuantity);
          break;
        case 'set':
          newQuantity = opQuantity;
          break;
        default:
          redirect(
            `/dashboard/inventory?error=${encodeURIComponent(
              'Tipo de operación no válido'
            )}`
          );
      }

      const { error: updateError } = await supabase
        .from('inventory_full')
        .upsert({
          type: prodType,
          quantity: newQuantity,
          unit_cost: newUnitCost,
          updated_at: new Date().toISOString(),
        });

      if (updateError) {
        console.error('Error updating full inventory:', updateError);
        redirect(
          `/dashboard/inventory?error=${encodeURIComponent(
            'Error al actualizar inventario'
          )}`
        );
      }
    } else {
      // Operación en inventario de cilindros vacíos
      const { data: currentData, error: fetchError } = await supabase
        .from('inventory_empty')
        .select('quantity')
        .eq('type', prodType)
        .eq('brand', opBrand)
        .eq('color', opColor)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching current empty inventory:', fetchError);
        redirect(
          `/dashboard/inventory?error=${encodeURIComponent(
            'Error al obtener inventario actual'
          )}`
        );
      }

      const currentQuantity = currentData?.quantity || 0;

      let newQuantity: number;

      switch (operationType) {
        case 'add':
          newQuantity = currentQuantity + opQuantity;
          break;
        case 'subtract':
          newQuantity = Math.max(0, currentQuantity - opQuantity);
          break;
        case 'set':
          newQuantity = opQuantity;
          break;
        default:
          redirect(
            `/dashboard/inventory?error=${encodeURIComponent(
              'Tipo de operación no válido'
            )}`
          );
      }

      const { error: updateError } = await supabase
        .from('inventory_empty')
        .upsert({
          type: prodType,
          brand: opBrand!,
          color: opColor!,
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        });

      if (updateError) {
        console.error('Error updating empty inventory:', updateError);
        redirect(
          `/dashboard/inventory?error=${encodeURIComponent(
            'Error al actualizar inventario'
          )}`
        );
      }
    }

    revalidatePath('/dashboard/inventory');
    redirect(
      `/dashboard/inventory?success=${encodeURIComponent(
        'Operación realizada exitosamente'
      )}`
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    redirect(
      `/dashboard/inventory?error=${encodeURIComponent(
        'Error interno del servidor'
      )}`
    );
  }
}
