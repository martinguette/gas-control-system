import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  inventoryFullSchema,
  inventoryFullUpdateSchema,
} from '@/lib/validations';

// =====================================================
// GET /api/inventory/full - Obtener inventario de cilindros llenos
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

    // Obtener inventario de cilindros llenos
    const { data, error } = await supabase
      .from('inventory_full')
      .select('*')
      .order('type');

    if (error) {
      console.error('Error fetching full inventory:', error);
      return NextResponse.json(
        { error: 'Error al obtener inventario' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST /api/inventory/full - Crear/actualizar inventario de cilindros llenos
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
        { error: 'Solo los jefes pueden gestionar inventario' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validar datos
    const validation = inventoryFullSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { type, quantity, unit_cost } = validation.data;

    // Insertar o actualizar inventario
    const { data, error } = await supabase
      .from('inventory_full')
      .upsert({
        type,
        quantity,
        unit_cost,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting full inventory:', error);
      return NextResponse.json(
        { error: 'Error al actualizar inventario' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: 'Inventario actualizado exitosamente',
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
// PUT /api/inventory/full - Actualizar inventario de cilindros llenos
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
        { error: 'Solo los jefes pueden gestionar inventario' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    // Validar datos
    const validation = inventoryFullUpdateSchema.safeParse(updateData);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // Actualizar inventario
    const { data, error } = await supabase
      .from('inventory_full')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating full inventory:', error);
      return NextResponse.json(
        { error: 'Error al actualizar inventario' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: 'Inventario actualizado exitosamente',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
