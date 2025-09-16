import { NextRequest, NextResponse } from 'next/server';
import { createCustomer, updateCustomer } from '@/actions/transactions-v2';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, location } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nombre de cliente requerido',
        },
        { status: 400 }
      );
    }

    // Crear cliente
    const result = await createCustomer({
      name: name.trim(),
      phone: phone?.trim() || undefined,
      location: location?.trim() || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error('Error in customers API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, phone, location, custom_prices } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de cliente requerido',
        },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nombre de cliente requerido',
        },
        { status: 400 }
      );
    }

    // Actualizar cliente
    const result = await updateCustomer({
      id,
      name: name.trim(),
      phone: phone?.trim() || undefined,
      location: location?.trim() || undefined,
      custom_prices: custom_prices || {},
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
