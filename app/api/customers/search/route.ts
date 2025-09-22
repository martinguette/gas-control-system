import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name = '', limit = 50 } = body;

    console.log('🔍 Búsqueda de clientes:', { name, limit, userId: user.id });

    // Usar la función optimizada de búsqueda
    const { data: customers, error } = await supabase.rpc('search_customers', {
      search_term: name,
      limit_count: Math.min(limit, 100) // Máximo 100 resultados
    });

    if (error) {
      console.error('❌ Error en búsqueda de clientes:', error);
      return NextResponse.json(
        { success: false, error: 'Error al buscar clientes' },
        { status: 500 }
      );
    }

    console.log('✅ Clientes encontrados:', customers?.length || 0);

    return NextResponse.json({
      success: true,
      data: customers || [],
      count: customers?.length || 0
    });

  } catch (error) {
    console.error('❌ Error en API de búsqueda de clientes:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para obtener datos de cache offline
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const cacheType = searchParams.get('type') || 'customers';

    console.log('📦 Obteniendo datos de cache:', { cacheType, userId: user.id });

    // Obtener datos para cache offline
    const { data: cacheData, error } = await supabase.rpc('get_vendor_cache_data', {
      vendor_uuid: user.id,
      cache_type_param: cacheType
    });

    if (error) {
      console.error('❌ Error obteniendo cache:', error);
      return NextResponse.json(
        { success: false, error: 'Error al obtener datos de cache' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cacheData,
      type: cacheType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error en API de cache:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}