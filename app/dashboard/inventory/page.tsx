import { Suspense } from 'react';
import {
  getInventorySummary,
  getFullInventory,
  getEmptyInventory,
} from '@/actions/inventory';
import { InventoryStatsCards } from '@/components/inventory/inventory-stats-cards';
import { InventoryAlerts } from '@/components/inventory/inventory-alerts';
import { InventoryTable } from '@/components/inventory/inventory-table';
import { InventoryActions } from '@/components/inventory/inventory-actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Package, TrendingUp } from 'lucide-react';

export default async function InventoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="space-y-8 p-6">
        {/* Header con gradiente */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                📦 Inventario Inteligente
              </h1>
              <p className="text-blue-100 text-lg">
                Gestiona el inventario de cilindros de gas y monitorea el stock
                en tiempo real
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <div className="text-2xl font-bold">Dashboard</div>
                <div className="text-blue-200">Panel de Control</div>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas de Stock Bajo */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8 bg-white rounded-xl shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando alertas...</span>
            </div>
          }
        >
          <InventoryAlerts />
        </Suspense>

        {/* Estadísticas Generales */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8 bg-white rounded-xl shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">
                Cargando estadísticas...
              </span>
            </div>
          }
        >
          <InventoryStatsSection />
        </Suspense>

        {/* Tablas de Inventario */}
        <div className="grid gap-8 md:grid-cols-2">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-8 bg-white rounded-xl shadow-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                <span className="ml-3 text-gray-600">
                  Cargando inventario lleno...
                </span>
              </div>
            }
          >
            <InventoryFullSection />
          </Suspense>

          <Suspense
            fallback={
              <div className="flex items-center justify-center p-8 bg-white rounded-xl shadow-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">
                  Cargando inventario vacío...
                </span>
              </div>
            }
          >
            <InventoryEmptySection />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function InventoryStatsSection() {
  const { summary, alerts, stats, error } = await getInventorySummary();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar las estadísticas: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Cilindros Llenos */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-green-800">
            🟢 Cilindros Llenos
          </CardTitle>
          <div className="p-2 bg-green-500 rounded-lg">
            <Package className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-green-700 mb-1">
            {stats?.total_full_cylinders || 0}
          </div>
          <p className="text-sm text-green-600 font-medium">
            Total en inventario
          </p>
          <div className="mt-2 w-full bg-green-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: '75%' }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Cilindros Vacíos */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-100 hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-orange-800">
            🟠 Cilindros Vacíos
          </CardTitle>
          <div className="p-2 bg-orange-500 rounded-lg">
            <Package className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-orange-700 mb-1">
            {stats?.total_empty_cylinders || 0}
          </div>
          <p className="text-sm text-orange-600 font-medium">
            Total en inventario
          </p>
          <div className="mt-2 w-full bg-orange-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full"
              style={{ width: '60%' }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Valor Total */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-blue-800">
            💰 Valor Total
          </CardTitle>
          <div className="p-2 bg-blue-500 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-blue-700 mb-1">
            ${stats?.total_value?.toLocaleString() || '0'}
          </div>
          <p className="text-sm text-blue-600 font-medium">
            Valor del inventario
          </p>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: '85%' }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas Activas */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-100 hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-20 h-20 bg-red-200 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-red-800">
            🚨 Alertas Activas
          </CardTitle>
          <div className="p-2 bg-red-500 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-red-700 mb-1">
            {stats?.low_stock_alerts || 0}
          </div>
          <p className="text-sm text-red-600 font-medium">
            Stock bajo detectado
          </p>
          <div className="mt-2 w-full bg-red-200 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full animate-pulse"
              style={{ width: stats?.low_stock_alerts ? '100%' : '0%' }}
            ></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function InventoryFullSection() {
  const { data: fullInventory, error } = await getFullInventory();

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cilindros Llenos</CardTitle>
          <CardDescription>
            Inventario de cilindros llenos disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Error: {error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          <div className="p-2 bg-white/20 rounded-lg">
            <Package className="h-6 w-6" />
          </div>
          🟢 Cilindros Llenos
        </CardTitle>
        <CardDescription className="text-green-100 text-base">
          Inventario de cilindros llenos disponibles para venta
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <InventoryTable
          data={fullInventory || []}
          type="full"
          showActions={true}
        />
      </CardContent>
    </Card>
  );
}

async function InventoryEmptySection() {
  const { data: emptyInventory, error } = await getEmptyInventory();

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cilindros Vacíos</CardTitle>
          <CardDescription>
            Inventario de cilindros vacíos por marca y color
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Error: {error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-50 hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          <div className="p-2 bg-white/20 rounded-lg">
            <Package className="h-6 w-6" />
          </div>
          🟠 Cilindros Vacíos
        </CardTitle>
        <CardDescription className="text-orange-100 text-base">
          Inventario de cilindros vacíos organizados por marca y color
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <InventoryTable
          data={emptyInventory || []}
          type="empty"
          showActions={true}
        />
      </CardContent>
    </Card>
  );
}
