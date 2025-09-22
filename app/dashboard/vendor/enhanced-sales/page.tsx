'use client';

import { EnhancedSaleForm } from '@/components/transactions/enhanced-sale-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOfflineManager } from '@/hooks/use-offline-manager';
import { useCustomerCache } from '@/hooks/use-customer-cache';
import {
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Users,
  ShoppingCart,
} from 'lucide-react';
import { toast } from 'sonner';

export default function EnhancedSalesPage() {
  const { isOnline, pendingSales, syncPendingSales, lastSyncTime } =
    useOfflineManager();

  const {
    customers,
    isLoading,
    isOffline,
    lastUpdated,
    refreshCustomers,
    syncPendingData,
  } = useCustomerCache();

  const handleSuccess = () => {
    toast.success('Venta procesada exitosamente');
  };

  const handleSyncAll = async () => {
    try {
      await Promise.all([syncPendingSales(), syncPendingData()]);
      toast.success('Sincronización completada');
    } catch (error) {
      toast.error('Error en la sincronización');
    }
  };

  const getLastSyncText = () => {
    if (!lastSyncTime) return 'Nunca';
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `Hace ${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header con información del sistema */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Estado de conexión */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              <div>
                <div className="text-sm font-medium">
                  {isOnline ? 'Conectado' : 'Sin conexión'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isOnline ? 'Sincronización activa' : 'Modo offline'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ventas pendientes */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-sm font-medium">
                  {pendingSales.length} pendiente
                  {pendingSales.length !== 1 ? 's' : ''}
                </div>
                <div className="text-xs text-muted-foreground">
                  {pendingSales.length > 0
                    ? 'Esperando sincronización'
                    : 'Todo sincronizado'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clientes disponibles */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium">
                  {customers.length} cliente{customers.length !== 1 ? 's' : ''}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isOffline ? 'Modo offline' : 'Actualizado'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Última sincronización */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm font-medium">Última sync</div>
                <div className="text-xs text-muted-foreground">
                  {getLastSyncText()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas y acciones */}
      {!isOnline && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <div className="text-sm font-medium text-orange-800">
                  Modo Offline Activo
                </div>
                <div className="text-xs text-orange-700">
                  Las ventas se guardarán localmente y se sincronizarán cuando
                  se restaure la conexión.
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncAll}
                className="text-orange-600 border-orange-300 hover:bg-orange-100"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Sincronizar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {pendingSales.length > 0 && isOnline && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <div className="text-sm font-medium text-blue-800">
                  {pendingSales.length} venta
                  {pendingSales.length !== 1 ? 's' : ''} pendiente
                  {pendingSales.length !== 1 ? 's' : ''}
                </div>
                <div className="text-xs text-blue-700">
                  Hay ventas guardadas localmente que pueden sincronizarse.
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncAll}
                className="text-blue-600 border-blue-300 hover:bg-blue-100"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Sincronizar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulario de ventas mejorado */}
      <EnhancedSaleForm onSuccess={handleSuccess} />

      {/* Información adicional para desarrollo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Información del Sistema</CardTitle>
          <CardDescription>
            Estado actual del sistema de ventas mejorado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Estado de conexión:</strong>{' '}
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <div>
              <strong>Ventas pendientes:</strong> {pendingSales.length}
            </div>
            <div>
              <strong>Clientes en cache:</strong> {customers.length}
            </div>
            <div>
              <strong>Última actualización:</strong>{' '}
              {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Nunca'}
            </div>
          </div>

          {pendingSales.length > 0 && (
            <div className="mt-4">
              <strong>Ventas pendientes:</strong>
              <div className="mt-2 space-y-1">
                {pendingSales.slice(0, 3).map((sale, index) => (
                  <div
                    key={sale.id}
                    className="text-xs bg-gray-100 p-2 rounded"
                  >
                    Venta {index + 1}: {sale.saleData.customer_name} - $
                    {sale.saleData.items
                      ?.reduce(
                        (sum: number, item: any) => sum + item.total_cost,
                        0
                      )
                      .toFixed(2)}
                  </div>
                ))}
                {pendingSales.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    ... y {pendingSales.length - 3} más
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
