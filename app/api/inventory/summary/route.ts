import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// =====================================================
// GET /api/inventory/summary - Obtener resumen completo del inventario
// =====================================================
export async function GET() {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener resumen usando la función de la base de datos
    const { data: summary, error: summaryError } = await supabase.rpc(
      'get_inventory_summary'
    );

    if (summaryError) {
      console.error('Error fetching inventory summary:', summaryError);
      return NextResponse.json(
        { error: 'Error al obtener resumen de inventario' },
        { status: 500 }
      );
    }

    // Obtener alertas de stock bajo
    const { data: alerts, error: alertsError } = await supabase.rpc(
      'check_low_stock_alerts'
    );

    if (alertsError) {
      console.error('Error fetching low stock alerts:', alertsError);
      // No fallar si no se pueden obtener las alertas
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

    const stats = {
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

    return NextResponse.json({
      summary,
      alerts: alerts || [],
      stats,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
