import { NextRequest, NextResponse } from 'next/server';
import { searchCustomers } from '@/actions/transactions-v2';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    console.log('🔍 API Customers Search - Búsqueda para:', name);

    // Validar que name sea string
    if (typeof name !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'El parámetro name debe ser un string',
        },
        { status: 400 }
      );
    }

    // Buscar clientes
    const result = await searchCustomers(name);

    if (!result.success) {
      console.error('❌ API Customers Search - Error:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    console.log(
      '✅ API Customers Search - Encontrados:',
      result.data?.length || 0,
      'clientes'
    );
    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('❌ API Customers Search - Error general:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
