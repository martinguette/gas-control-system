'use client';

import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import VendorLayout from '@/components/layout/vendor-layout';
import { SaleFormV2 } from '@/components/transactions/sale-form-v2';
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
  TrendingUp,
  DollarSign,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { getVendorDailyStats } from '@/actions/transactions-v2';

interface DailyStats {
  totalSales: number;
  totalExpenses: number;
  dailyMargin: number;
  cylindersSold: Record<string, number>;
  salesCount: number;
  expensesCount: number;
}

export default function SalesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [showForm, setShowForm] = useState(false);

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
      loadDailyStats();
    } catch (error) {
      console.error('Error checking auth:', error);
      redirect('/log-in');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDailyStats = async () => {
    try {
      const result = await getVendorDailyStats();
      if (result.success) {
        setDailyStats(result.data);
      }
    } catch (error) {
      console.error('Error loading daily stats:', error);
    }
  };

  const handleSaleSuccess = () => {
    setShowForm(false);
    loadDailyStats(); // Recargar estadísticas
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
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/vendor">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              Ventas
            </h1>
            <p className="text-sm text-muted-foreground">
              Registra ventas y consulta estadísticas del día
            </p>
          </div>
        </div>

        {/* Estadísticas del Día */}
        {dailyStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium text-green-800">
                  Ventas del Día
                </CardTitle>
                <DollarSign className="h-3 w-3 lg:h-4 lg:w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg lg:text-2xl font-bold text-green-700">
                  ${dailyStats.totalSales.toFixed(2)}
                </div>
                <p className="text-xs text-green-600">
                  {dailyStats.salesCount} transacciones
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium text-red-800">
                  Gastos del Día
                </CardTitle>
                <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg lg:text-2xl font-bold text-red-700">
                  ${dailyStats.totalExpenses.toFixed(2)}
                </div>
                <p className="text-xs text-red-600">
                  {dailyStats.expensesCount} gastos
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium text-blue-800">
                  Margen Diario
                </CardTitle>
                <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-lg lg:text-2xl font-bold ${
                    dailyStats.dailyMargin >= 0
                      ? 'text-blue-700'
                      : 'text-red-700'
                  }`}
                >
                  ${dailyStats.dailyMargin.toFixed(2)}
                </div>
                <p className="text-xs text-blue-600">
                  {dailyStats.dailyMargin >= 0 ? 'Ganancia' : 'Pérdida'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium text-orange-800">
                  Cilindros Vendidos
                </CardTitle>
                <Package className="h-3 w-3 lg:h-4 lg:w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg lg:text-2xl font-bold text-orange-700">
                  {Object.values(dailyStats.cylindersSold).reduce(
                    (sum, qty) => sum + qty,
                    0
                  )}
                </div>
                <p className="text-xs text-orange-600">
                  {Object.keys(dailyStats.cylindersSold).length > 0
                    ? Object.entries(dailyStats.cylindersSold)
                        .map(([type, qty]) => `${qty} ${type}`)
                        .join(', ')
                    : 'Sin ventas'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Botón para Nueva Venta */}
        {!showForm && (
          <div className="flex justify-center">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Nueva Venta
            </Button>
          </div>
        )}

        {/* Formulario de Venta */}
        {showForm && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Registrar Nueva Venta</h2>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="text-sm"
              >
                Cancelar
              </Button>
            </div>
            <SaleFormV2 onSuccess={handleSaleSuccess} />
          </div>
        )}
      </div>
    </VendorLayout>
  );
}
