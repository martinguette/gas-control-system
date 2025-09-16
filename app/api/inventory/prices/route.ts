import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'No autorizado',
        },
        { status: 401 }
      );
    }

    console.log(
      '💰 API Inventory Prices - Obteniendo precios para usuario:',
      user.id
    );

    // Obtener precios del inventario lleno
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory_full')
      .select('type, unit_cost')
      .order('type');

    if (inventoryError) {
      console.error('❌ Error obteniendo inventario:', inventoryError);
      return NextResponse.json(
        {
          success: false,
          error: 'Error al obtener precios del inventario',
        },
        { status: 500 }
      );
    }

    // Convertir a formato de precios
    const prices: Record<string, number> = {};
    inventory?.forEach((item) => {
      prices[item.type] = item.unit_cost;
    });

    console.log('✅ API Inventory Prices - Precios obtenidos:', prices);

    return NextResponse.json({
      success: true,
      data: prices,
    });
  } catch (error) {
    console.error('❌ API Inventory Prices - Error general:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
