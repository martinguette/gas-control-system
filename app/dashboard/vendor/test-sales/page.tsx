'use client';

import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import VendorLayout from '@/components/layout/vendor-layout';
import { ComprehensiveSaleForm } from '@/components/transactions/comprehensive-sale-form';
import { InventoryValidator } from '@/components/transactions/inventory-validator';
import { OfflineTester } from '@/components/transactions/offline-tester';
import { CustomerTester } from '@/components/transactions/customer-tester';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  ArrowLeft,
  TestTube,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import Link from 'next/link';

export default function TestSalesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [testItems, setTestItems] = useState<
    Array<{
      product_type: '33lb' | '40lb' | '100lb';
      quantity: number;
    }>
  >([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        redirect('/log-in');
        return;
      }

      // Verificar que el usuario es vendedor
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !userData || userData.role !== 'vendedor') {
        redirect(
          '/log-in?message=Acceso denegado. Solo vendedores pueden acceder a esta página.'
        );
        return;
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error checking auth:', error);
      redirect('/log-in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaleSuccess = () => {
    console.log('✅ Venta procesada exitosamente');
  };

  const handleItemsChange = (
    items: Array<{
      product_type: '33lb' | '40lb' | '100lb';
      quantity: number;
    }>
  ) => {
    setTestItems(items);
  };

  if (isLoading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </VendorLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/vendor">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <TestTube className="h-6 w-6 text-blue-600" />
                Panel de Pruebas - Ventas
              </h1>
              <p className="text-muted-foreground">
                Prueba todos los casos de uso del sistema de ventas
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            <TestTube className="w-3 h-3 mr-1" />
            Modo Prueba
          </Badge>
        </div>

        {/* Información de casos de uso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Casos de Uso a Probar
            </CardTitle>
            <CardDescription>
              Lista de funcionalidades que puedes probar en este formulario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-green-700">
                  ✅ Funcionalidades Básicas
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Registrar venta con múltiples productos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Cambiar precios unitarios en tiempo real
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Crear nuevos clientes desde el formulario
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Aplicar precios personalizados por cliente
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Diferentes tipos de venta (intercambio, completa, etc.)
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-blue-700">
                  🔧 Funcionalidades Avanzadas
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    Modo offline con sincronización automática
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    Validaciones de inventario en tiempo real
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    Cálculo automático de totales
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    Alertas para transferencias bancarias
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    Interfaz móvil optimizada
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validador de inventario */}
        {testItems.length > 0 && (
          <InventoryValidator
            items={testItems}
            onValidationChange={(isValid, errors) => {
              console.log('Validación de inventario:', { isValid, errors });
            }}
          />
        )}

        {/* Formulario de ventas completo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              Formulario de Ventas Completo
            </CardTitle>
            <CardDescription>
              Prueba todas las funcionalidades del sistema de ventas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComprehensiveSaleForm onSuccess={handleSaleSuccess} />
          </CardContent>
        </Card>

        {/* Prueba de creación de clientes */}
        <CustomerTester
          onCustomerCreated={(customer) => {
            console.log('✅ Cliente creado:', customer);
          }}
        />

        {/* Prueba de funcionalidad offline */}
        <OfflineTester />

        {/* Instrucciones de prueba */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Instrucciones de Prueba
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">
                  🧪 Casos de Prueba Sugeridos
                </h4>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  <li>Crear un nuevo cliente con precios personalizados</li>
                  <li>
                    Hacer una venta de intercambio con múltiples productos
                  </li>
                  <li>Cambiar precios unitarios durante la venta</li>
                  <li>Probar diferentes métodos de pago</li>
                  <li>Verificar cálculos automáticos de totales</li>
                  <li>Probar modo offline (desconectar internet)</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium mb-3">
                  ⚠️ Validaciones a Verificar
                </h4>
                <ul className="space-y-2 text-sm list-disc list-inside">
                  <li>Campos obligatorios no pueden estar vacíos</li>
                  <li>Precios no pueden ser negativos</li>
                  <li>Cantidades deben ser números enteros positivos</li>
                  <li>Nombres solo pueden contener letras y espacios</li>
                  <li>Teléfonos deben tener formato válido</li>
                  <li>Ubicaciones deben tener al menos 5 caracteres</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
}
