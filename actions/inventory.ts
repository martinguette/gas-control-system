'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  InventoryFull,
  InventoryEmpty,
  InventoryFullInsert,
  InventoryEmptyInsert,
  InventoryFullUpdate,
  InventoryEmptyUpdate,
  InventorySummary,
  InventoryStats,
  LowStockAlert,
  CylinderType,
  InventoryOperation,
} from '@/types/inventory';

// =====================================================
// FUNCIONES DE AUTENTICACIÓN Y AUTORIZACIÓN
// =====================================================

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/log-in');
  }

  return user;
}

async function checkAdminRole() {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'jefe') {
    redirect('/dashboard/vendor');
  }

  return user;
}

// =====================================================
// INVENTARIO DE CILINDROS LLENOS
// =====================================================

export async function getInventoryFull(): Promise<InventoryFull[]> {
  await checkAdminRole();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('inventory_full')
    .select('*')
    .order('type');

  if (error) {
    console.error('Error fetching full inventory:', error);
    throw new Error('Error al obtener inventario de cilindros llenos');
  }

  return data || [];
}

export async function updateInventoryFull(
  type: CylinderType,
  updates: InventoryFullUpdate
): Promise<InventoryFull> {
  await checkAdminRole();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('inventory_full')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('type', type)
    .select()
    .single();

  if (error) {
    console.error('Error updating full inventory:', error);
    throw new Error('Error al actualizar inventario de cilindros llenos');
  }

  revalidatePath('/dashboard/admin/inventory');
  return data;
}

export async function addInventoryFull(
  insert: InventoryFullInsert
): Promise<InventoryFull> {
  await checkAdminRole();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('inventory_full')
    .insert({
      ...insert,
      quantity: insert.quantity || 0,
      unit_cost: insert.unit_cost || 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding full inventory:', error);
    throw new Error('Error al agregar inventario de cilindros llenos');
  }

  revalidatePath('/dashboard/admin/inventory');
  return data;
}

// =====================================================
// INVENTARIO DE CILINDROS VACÍOS
// =====================================================

export async function getInventoryEmpty(): Promise<InventoryEmpty[]> {
  await checkAdminRole();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('inventory_empty')
    .select('*')
    .order('type, brand, color');

  if (error) {
    console.error('Error fetching empty inventory:', error);
    throw new Error('Error al obtener inventario de cilindros vacíos');
  }

  return data || [];
}

export async function updateInventoryEmpty(
  id: string,
  updates: InventoryEmptyUpdate
): Promise<InventoryEmpty> {
  await checkAdminRole();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('inventory_empty')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating empty inventory:', error);
    throw new Error('Error al actualizar inventario de cilindros vacíos');
  }

  revalidatePath('/dashboard/admin/inventory');
  return data;
}

export async function addInventoryEmpty(
  insert: InventoryEmptyInsert
): Promise<InventoryEmpty> {
  await checkAdminRole();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('inventory_empty')
    .insert({
      ...insert,
      quantity: insert.quantity || 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding empty inventory:', error);
    throw new Error('Error al agregar inventario de cilindros vacíos');
  }

  revalidatePath('/dashboard/admin/inventory');
  return data;
}

export async function deleteInventoryEmpty(id: string): Promise<void> {
  await checkAdminRole();
  const supabase = await createClient();

  const { error } = await supabase
    .from('inventory_empty')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting empty inventory:', error);
    throw new Error('Error al eliminar inventario de cilindros vacíos');
  }

  revalidatePath('/dashboard/admin/inventory');
}

// =====================================================
// RESUMEN Y ESTADÍSTICAS
// =====================================================

export async function getInventorySummary(): Promise<InventorySummary[]> {
  await checkAdminRole();
  const supabase = await createClient();

  // Obtener inventario lleno
  const { data: fullInventory, error: fullError } = await supabase
    .from('inventory_full')
    .select('*')
    .order('type');

  if (fullError) {
    console.error('Error fetching full inventory for summary:', fullError);
    throw new Error('Error al obtener resumen de inventario');
  }

  // Obtener inventario vacío agrupado
  const { data: emptyInventory, error: emptyError } = await supabase
    .from('inventory_empty')
    .select('*')
    .order('type, brand, color');

  if (emptyError) {
    console.error('Error fetching empty inventory for summary:', emptyError);
    throw new Error('Error al obtener resumen de inventario');
  }

  // Procesar datos para crear resumen
  const summary: InventorySummary[] = [];
  const types: CylinderType[] = ['33lb', '40lb', '100lb'];

  for (const type of types) {
    const fullItem = fullInventory?.find((item) => item.type === type);
    const emptyItems =
      emptyInventory?.filter((item) => item.type === type) || [];

    const emptyTotalQuantity = emptyItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const emptyBrands = emptyItems.map((item) => ({
      brand: item.brand,
      color: item.color,
      quantity: item.quantity,
    }));

    summary.push({
      product_type: type,
      full_quantity: fullItem?.quantity || 0,
      full_unit_cost: fullItem?.unit_cost || 0,
      empty_total_quantity: emptyTotalQuantity,
      empty_brands: emptyBrands,
    });
  }

  return summary;
}

export async function getInventoryStats(): Promise<InventoryStats> {
  await checkAdminRole();
  const supabase = await createClient();

  // Obtener inventario completo
  const { data: fullInventory, error: fullError } = await supabase
    .from('inventory_full')
    .select('*');

  if (fullError) {
    console.error('Error fetching full inventory for stats:', fullError);
    throw new Error('Error al obtener estadísticas de inventario');
  }

  const { data: emptyInventory, error: emptyError } = await supabase
    .from('inventory_empty')
    .select('*');

  if (emptyError) {
    console.error('Error fetching empty inventory for stats:', emptyError);
    throw new Error('Error al obtener estadísticas de inventario');
  }

  // Calcular estadísticas
  const totalFullCylinders =
    fullInventory?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalEmptyCylinders =
    emptyInventory?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalValue =
    fullInventory?.reduce(
      (sum, item) => sum + item.quantity * item.unit_cost,
      0
    ) || 0;

  // Estadísticas por tipo
  const byType = {
    '33lb': { full: 0, empty: 0, value: 0 },
    '40lb': { full: 0, empty: 0, value: 0 },
    '100lb': { full: 0, empty: 0, value: 0 },
  };

  fullInventory?.forEach((item) => {
    byType[item.type as CylinderType].full = item.quantity;
    byType[item.type as CylinderType].value = item.quantity * item.unit_cost;
  });

  emptyInventory?.forEach((item) => {
    byType[item.type as CylinderType].empty += item.quantity;
  });

  return {
    total_full_cylinders: totalFullCylinders,
    total_empty_cylinders: totalEmptyCylinders,
    total_value: totalValue,
    low_stock_alerts: 0, // TODO: Implementar alertas
    by_type: byType,
  };
}

// =====================================================
// OPERACIONES DE INVENTARIO
// =====================================================

export async function performInventoryOperation(
  operation: InventoryOperation
): Promise<void> {
  await checkAdminRole();
  const supabase = await createClient();

  try {
    if (operation.inventory_type === 'full') {
      const { data: currentItem, error: fetchError } = await supabase
        .from('inventory_full')
        .select('quantity, unit_cost')
        .eq('type', operation.product_type)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(`Error al obtener inventario: ${fetchError.message}`);
      }

      if (!currentItem) {
        // Si no existe, crear nuevo registro
        await addInventoryFull({
          type: operation.product_type,
          quantity: operation.quantity,
          unit_cost: operation.unit_cost || 0,
        });
        return;
      }

      let newQuantity: number;
      switch (operation.type) {
        case 'add':
          newQuantity = currentItem.quantity + operation.quantity;
          break;
        case 'subtract':
          newQuantity = Math.max(0, currentItem.quantity - operation.quantity);
          break;
        case 'set':
          newQuantity = operation.quantity;
          break;
        default:
          throw new Error('Tipo de operación no válido');
      }

      await updateInventoryFull(operation.product_type, {
        quantity: newQuantity,
        unit_cost:
          operation.unit_cost !== undefined
            ? operation.unit_cost
            : currentItem.unit_cost,
      });
    } else if (operation.inventory_type === 'empty') {
      // Para cilindros vacíos, necesitamos buscar por tipo, marca y color
      const { data: currentItem, error: fetchError } = await supabase
        .from('inventory_empty')
        .select('id, quantity')
        .eq('type', operation.product_type)
        .eq('brand', operation.brand || 'Roscogas')
        .eq('color', operation.color || 'Naranja')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(
          `Error al obtener inventario vacío: ${fetchError.message}`
        );
      }

      if (!currentItem) {
        // Si no existe, crear nuevo registro
        await addInventoryEmpty({
          type: operation.product_type,
          brand: operation.brand || 'Roscogas',
          color: operation.color || 'Naranja',
          quantity: operation.quantity,
        });
        return;
      }

      let newQuantity: number;
      switch (operation.type) {
        case 'add':
          newQuantity = currentItem.quantity + operation.quantity;
          break;
        case 'subtract':
          newQuantity = Math.max(0, currentItem.quantity - operation.quantity);
          break;
        case 'set':
          newQuantity = operation.quantity;
          break;
        default:
          throw new Error('Tipo de operación no válido');
      }

      await updateInventoryEmpty(currentItem.id, {
        quantity: newQuantity,
      });
    }

    revalidatePath('/dashboard/admin/inventory');
  } catch (error) {
    console.error('Error performing inventory operation:', error);
    throw new Error(
      `Error al realizar operación de inventario: ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`
    );
  }
}

// =====================================================
// ALERTAS DE STOCK BAJO
// =====================================================

export async function getLowStockAlerts(): Promise<LowStockAlert[]> {
  await checkAdminRole();
  const supabase = await createClient();

  // TODO: Implementar sistema de alertas
  // Por ahora retornamos array vacío
  return [];
}

// =====================================================
// UTILIDADES
// =====================================================

export async function initializeInventory(): Promise<void> {
  await checkAdminRole();
  const supabase = await createClient();

  // Verificar si ya existe inventario
  const { data: existingFull } = await supabase
    .from('inventory_full')
    .select('id')
    .limit(1);

  if (existingFull && existingFull.length > 0) {
    return; // Ya está inicializado
  }

  // Inicializar inventario lleno
  const fullTypes: CylinderType[] = ['33lb', '40lb', '100lb'];
  for (const type of fullTypes) {
    await addInventoryFull({
      type,
      quantity: 0,
      unit_cost: 0,
    });
  }

  // Inicializar inventario vacío con todas las marcas
  const brands = [
    { brand: 'Roscogas', color: 'Naranja' },
    { brand: 'Gasan', color: 'Azul' },
    { brand: 'Gaspais', color: 'Verde Oscuro' },
    { brand: 'Vidagas', color: 'Verde Claro' },
  ];

  for (const type of fullTypes) {
    for (const { brand, color } of brands) {
      await addInventoryEmpty({
        type,
        brand,
        color,
        quantity: 0,
      });
    }
  }

  revalidatePath('/dashboard/admin/inventory');
}
