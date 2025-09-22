import { NextRequest, NextResponse } from 'next/server';
import { createSale } from '@/actions/transactions-v2';
import { saleSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(
      '🛒 API Sales - Datos recibidos:',
      JSON.stringify(body, null, 2)
    );

    // Validar los datos
    const validatedData = saleSchema.safeParse(body);
    if (!validatedData.success) {
      console.log(
        '❌ API Sales - Validación fallida:',
        validatedData.error.flatten().fieldErrors
      );
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          details: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    console.log('✅ API Sales - Datos validados correctamente');
    console.log('🛒 API Sales - Llamando a createSale...');

    // Crear la venta
    const result = await createSale(validatedData.data);
    console.log('📦 API Sales - Resultado de createSale:', result);

    if (!result.success) {
      console.log('❌ API Sales - Error en createSale:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    console.log('✅ API Sales - Venta creada exitosamente');
    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('❌ API Sales - Error general:', error);
    console.error(
      '❌ API Sales - Error stack:',
      error instanceof Error ? error.stack : 'No stack available'
    );
    console.error(
      '❌ API Sales - Error message:',
      error instanceof Error ? error.message : String(error)
    );

    return NextResponse.json(
      {
        success: false,
        error: `Error interno del servidor: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 }
    );
  }
}
