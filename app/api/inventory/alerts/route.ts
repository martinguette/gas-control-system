import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  inventoryAlertSchema,
  inventoryAlertUpdateSchema,
} from '@/lib/validations';

// =====================================================
// GET /api/inventory/alerts - Obtener alertas de inventario
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

    // Verificar que el usuario sea jefe
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'jefe') {
      return NextResponse.json(
        { error: 'Solo los jefes pueden ver alertas' },
        { status: 403 }
      );
    }

    // Obtener alertas activas
    const { data, error } = await supabase
      .from('inventory_alerts')
      .select('*')
      .eq('is_active', true)
      .order('type, product_type');

    if (error) {
      console.error('Error fetching inventory alerts:', error);
      return NextResponse.json(
        { error: 'Error al obtener alertas' },
        { status: 500 }
      );
    }

    // Obtener alertas de stock bajo actuales
    const { data: lowStockAlerts, error: alertsError } = await supabase.rpc(
      'check_low_stock_alerts'
    );

    if (alertsError) {
      console.error('Error fetching low stock alerts:', alertsError);
    }

    return NextResponse.json({
      alerts: data,
      low_stock_alerts: lowStockAlerts || [],
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST /api/inventory/alerts - Crear nueva alerta
// =====================================================
export async function POST(request: NextRequest) {
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

    // Verificar que el usuario sea jefe
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'jefe') {
      return NextResponse.json(
        { error: 'Solo los jefes pueden crear alertas' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validar datos
    const validation = inventoryAlertSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { type, product_type, brand, color, min_threshold, is_active } =
      validation.data;

    // Crear alerta
    const { data, error } = await supabase
      .from('inventory_alerts')
      .insert({
        type,
        product_type,
        brand,
        color,
        min_threshold,
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating inventory alert:', error);
      return NextResponse.json(
        { error: 'Error al crear alerta' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, message: 'Alerta creada exitosamente' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT /api/inventory/alerts - Actualizar alerta
// =====================================================
export async function PUT(request: NextRequest) {
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

    // Verificar que el usuario sea jefe
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'jefe') {
      return NextResponse.json(
        { error: 'Solo los jefes pueden actualizar alertas' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    // Validar datos
    const validation = inventoryAlertUpdateSchema.safeParse(updateData);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // Actualizar alerta
    const { data, error } = await supabase
      .from('inventory_alerts')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating inventory alert:', error);
      return NextResponse.json(
        { error: 'Error al actualizar alerta' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: 'Alerta actualizada exitosamente',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE /api/inventory/alerts - Eliminar alerta
// =====================================================
export async function DELETE(request: NextRequest) {
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

    // Verificar que el usuario sea jefe
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'jefe') {
      return NextResponse.json(
        { error: 'Solo los jefes pueden eliminar alertas' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    // Eliminar alerta
    const { error } = await supabase
      .from('inventory_alerts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting inventory alert:', error);
      return NextResponse.json(
        { error: 'Error al eliminar alerta' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Alerta eliminada exitosamente' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
