import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, data } = body;

    console.log('🔄 Sincronización offline:', { action, userId: user.id });

    switch (action) {
      case 'sync_pending_sales':
        return await syncPendingSales(supabase, user.id);

      case 'update_cache':
        return await updateVendorCache(supabase, user.id, data);

      case 'get_cache':
        return await getVendorCache(supabase, user.id, data?.type);

      default:
        return NextResponse.json(
          { success: false, error: 'Acción no válida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ Error en sincronización offline:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function syncPendingSales(supabase: any, userId: string) {
  try {
    // Sincronizar ventas pendientes
    const { data: syncResult, error } = await supabase.rpc(
      'sync_pending_sales',
      {
        vendor_uuid: userId,
      }
    );

    if (error) {
      console.error('❌ Error sincronizando ventas:', error);
      return NextResponse.json(
        { success: false, error: 'Error al sincronizar ventas' },
        { status: 500 }
      );
    }

    const result = syncResult?.[0];
    console.log('✅ Ventas sincronizadas:', result);

    return NextResponse.json({
      success: true,
      data: {
        processed: result?.processed_count || 0,
        failed: result?.failed_count || 0,
      },
    });
  } catch (error) {
    console.error('❌ Error en syncPendingSales:', error);
    return NextResponse.json(
      { success: false, error: 'Error al sincronizar ventas' },
      { status: 500 }
    );
  }
}

async function updateVendorCache(
  supabase: any,
  userId: string,
  cacheData: any
) {
  try {
    const { cacheType, data } = cacheData;

    // Actualizar o insertar cache
    const { data: result, error } = await supabase
      .from('vendor_offline_cache')
      .upsert(
        {
          vendor_id: userId,
          cache_type: cacheType,
          cache_data: data,
          last_sync: new Date().toISOString(),
        },
        {
          onConflict: 'vendor_id,cache_type',
        }
      )
      .select();

    if (error) {
      console.error('❌ Error actualizando cache:', error);
      return NextResponse.json(
        { success: false, error: 'Error al actualizar cache' },
        { status: 500 }
      );
    }

    console.log('✅ Cache actualizado:', cacheType);

    return NextResponse.json({
      success: true,
      data: result?.[0],
    });
  } catch (error) {
    console.error('❌ Error en updateVendorCache:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar cache' },
      { status: 500 }
    );
  }
}

async function getVendorCache(
  supabase: any,
  userId: string,
  cacheType?: string
) {
  try {
    let query = supabase
      .from('vendor_offline_cache')
      .select('*')
      .eq('vendor_id', userId);

    if (cacheType) {
      query = query.eq('cache_type', cacheType);
    }

    const { data: cache, error } = await query;

    if (error) {
      console.error('❌ Error obteniendo cache:', error);
      return NextResponse.json(
        { success: false, error: 'Error al obtener cache' },
        { status: 500 }
      );
    }

    console.log('✅ Cache obtenido:', cache?.length || 0, 'registros');

    return NextResponse.json({
      success: true,
      data: cache,
    });
  } catch (error) {
    console.error('❌ Error en getVendorCache:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener cache' },
      { status: 500 }
    );
  }
}
