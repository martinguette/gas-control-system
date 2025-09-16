import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import AdminLayout from '@/components/layout/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Package,
  Plus,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import {
  getInventorySummary,
  getInventoryStats,
  initializeInventory,
} from '@/actions/inventory';
import { getColorByBrand } from '@/types/inventory';
import { CYLINDER_TYPES } from '@/types/inventory';
import InventoryManagementDialog from '@/components/inventory/inventory-management-dialog';

// Función para obtener los colores CSS según la marca
const getBrandColors = (brand: string) => {
  switch (brand) {
    case 'Roscogas':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: 'bg-orange-100',
        iconColor: 'text-orange-600',
        text: 'text-orange-600',
      };
    case 'Gasan':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'bg-blue-100',
        iconColor: 'text-blue-600',
        text: 'text-blue-600',
      };
    case 'Gaspais':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'bg-green-100',
        iconColor: 'text-green-600',
        text: 'text-green-600',
      };
    case 'Vidagas':
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        icon: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        text: 'text-emerald-600',
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        icon: 'bg-gray-100',
        iconColor: 'text-gray-600',
        text: 'text-gray-600',
      };
  }
};

export default async function InventoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/log-in');
  }

  const role = (user.user_metadata as Record<string, unknown> | null)?.role;
  if (role !== 'jefe') {
    redirect('/dashboard/vendor');
  }

  // Obtener datos del inventario
  let inventorySummary: any[] = [];
  let inventoryStats: any;

  try {
    // Inicializar inventario si es necesario
    await initializeInventory();

    inventorySummary = await getInventorySummary();
    inventoryStats = await getInventoryStats();
  } catch (error) {
    console.error('Error loading inventory:', error);
    // En caso de error, usar datos vacíos
    inventorySummary = [];
    inventoryStats = {
      total_full_cylinders: 0,
      total_empty_cylinders: 0,
      total_value: 0,
      low_stock_alerts: 0,
      by_type: {
        '33lb': { full: 0, empty: 0, value: 0 },
        '40lb': { full: 0, empty: 0, value: 0 },
        '100lb': { full: 0, empty: 0, value: 0 },
      },
    };
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Gestión de Inventario
            </h1>
            <p className="text-sm lg:text-lg text-muted-foreground">
              Control y monitoreo de cilindros de gas
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <InventoryManagementDialog
              trigger={
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="text-sm">Gestionar Inventario</span>
                </Button>
              }
            />
            <Button variant="outline" className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              <span className="text-sm">Actualizar</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-green-800">
                Cilindros Llenos
              </CardTitle>
              <Package className="h-3 w-3 lg:h-4 lg:w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-green-700">
                {inventoryStats.total_full_cylinders}
              </div>
              <p className="text-xs text-green-600">En stock</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-blue-800">
                Cilindros Vacíos
              </CardTitle>
              <Package className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-blue-700">
                {inventoryStats.total_empty_cylinders}
              </div>
              <p className="text-xs text-blue-600">Recolectados</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-purple-800">
                Valor Total
              </CardTitle>
              <DollarSign className="h-3 w-3 lg:h-4 lg:w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-purple-700">
                ${inventoryStats.total_value.toLocaleString()}
              </div>
              <p className="text-xs text-purple-600">En inventario</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-orange-800">
                Alertas
              </CardTitle>
              <AlertTriangle className="h-3 w-3 lg:h-4 lg:w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-orange-700">
                {inventoryStats.low_stock_alerts}
              </div>
              <p className="text-xs text-orange-600">Stock bajo</p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cilindros Llenos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                <Package className="h-4 w-4 text-green-600" />
                Cilindros Llenos (Roscogas)
              </CardTitle>
              <CardDescription className="text-sm">
                Inventario de cilindros listos para venta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {inventorySummary.map((item) => (
                <div
                  key={item.product_type}
                  className="flex items-center justify-between p-3 border rounded-lg bg-green-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        Cilindro {item.product_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Roscogas - Naranja
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {item.full_quantity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${item.full_unit_cost} c/u
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Cilindros Vacíos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                Cilindros Vacíos
              </CardTitle>
              <CardDescription className="text-sm">
                Inventario de cilindros recolectados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {inventorySummary.map((item) => (
                <div key={item.product_type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">
                      Cilindro {item.product_type}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      Total: {item.empty_total_quantity}
                    </Badge>
                  </div>

                  {item.empty_brands.length > 0 ? (
                    <div className="space-y-1">
                      {item.empty_brands.map((brand: any, index: number) => {
                        const colors = getBrandColors(brand.brand);
                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-2 border rounded ${colors.bg} ${colors.border}`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 ${colors.icon} rounded-full flex items-center justify-center`}
                              >
                                <Package
                                  className={`h-3 w-3 ${colors.iconColor}`}
                                />
                              </div>
                              <div>
                                <p className="text-xs font-medium">
                                  {brand.brand}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {brand.color}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`text-sm font-bold ${colors.text}`}
                            >
                              {brand.quantity}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No hay cilindros vacíos de este tipo
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base lg:text-lg flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription className="text-sm">
              Operaciones comunes de inventario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto py-3 flex flex-col">
                <Plus className="h-4 w-4 mb-1" />
                <span className="text-xs">Entrada de Camión</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex flex-col">
                <Edit className="h-4 w-4 mb-1" />
                <span className="text-xs">Ajustar Stock</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex flex-col">
                <Eye className="h-4 w-4 mb-1" />
                <span className="text-xs">Ver Historial</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex flex-col">
                <BarChart3 className="h-4 w-4 mb-1" />
                <span className="text-xs">Reportes</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Section */}
        {inventoryStats.low_stock_alerts > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-4 w-4" />
                Alertas de Stock Bajo
              </CardTitle>
              <CardDescription className="text-orange-700">
                Algunos productos requieren atención inmediata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-white">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="font-medium text-sm">
                        Cilindro 33lb - Stock Bajo
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Solo quedan 2 unidades
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-orange-600 border-orange-600"
                  >
                    Reabastecer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
