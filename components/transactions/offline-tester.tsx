'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  Upload,
  Info,
} from 'lucide-react';

interface OfflineSale {
  id: string;
  data: any;
  timestamp: Date;
  synced: boolean;
}

interface OfflineTesterProps {
  onSimulateOffline?: () => void;
  onSimulateOnline?: () => void;
}

export function OfflineTester({
  onSimulateOffline,
  onSimulateOnline,
}: OfflineTesterProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSales, setPendingSales] = useState<OfflineSale[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Simular estado de conexión
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cargar ventas pendientes del localStorage
    loadPendingSales();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPendingSales = () => {
    try {
      const stored = localStorage.getItem('pending-sales');
      if (stored) {
        const sales = JSON.parse(stored).map((sale: any) => ({
          ...sale,
          timestamp: new Date(sale.timestamp),
        }));
        setPendingSales(sales);
      }
    } catch (error) {
      console.error('Error loading pending sales:', error);
    }
  };

  const savePendingSales = (sales: OfflineSale[]) => {
    try {
      localStorage.setItem('pending-sales', JSON.stringify(sales));
      setPendingSales(sales);
    } catch (error) {
      console.error('Error saving pending sales:', error);
    }
  };

  const addPendingSale = (saleData: any) => {
    const newSale: OfflineSale = {
      id: `offline-${Date.now()}`,
      data: saleData,
      timestamp: new Date(),
      synced: false,
    };

    const updatedSales = [...pendingSales, newSale];
    savePendingSales(updatedSales);
    return newSale.id;
  };

  const simulateOffline = () => {
    setIsOnline(false);
    onSimulateOffline?.();
  };

  const simulateOnline = () => {
    setIsOnline(true);
    onSimulateOnline?.();
  };

  const simulateSale = () => {
    const mockSaleData = {
      customer_name: 'Cliente Prueba',
      customer_phone: '1234567890',
      customer_location: 'Ubicación de Prueba',
      items: [
        {
          product_type: '33lb',
          quantity: 1,
          unit_cost: 15000,
          total_cost: 15000,
        },
      ],
      sale_type: 'intercambio',
      payment_method: 'efectivo',
    };

    addPendingSale(mockSaleData);
  };

  const syncPendingSales = async () => {
    setIsSyncing(true);

    try {
      // Simular sincronización
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Marcar todas las ventas como sincronizadas
      const updatedSales = pendingSales.map((sale) => ({
        ...sale,
        synced: true,
      }));

      savePendingSales(updatedSales);
      setLastSyncTime(new Date());

      // Limpiar ventas sincronizadas después de un tiempo
      setTimeout(() => {
        const remainingSales = updatedSales.filter((sale) => !sale.synced);
        savePendingSales(remainingSales);
      }, 3000);
    } catch (error) {
      console.error('Error syncing sales:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const clearPendingSales = () => {
    savePendingSales([]);
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-600" />
          )}
          Prueba de Funcionalidad Offline
        </CardTitle>
        <CardDescription>
          Simula diferentes estados de conexión y prueba la sincronización
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado de conexión */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <div>
              <div className="font-medium">
                Estado: {isOnline ? 'En Línea' : 'Sin Conexión'}
              </div>
              <div className="text-sm text-muted-foreground">
                Última sincronización: {getLastSyncText()}
              </div>
            </div>
          </div>
          <Badge
            className={
              isOnline
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }
          >
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {/* Controles de simulación */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={simulateOffline}
            disabled={!isOnline}
            className="flex items-center gap-2"
          >
            <WifiOff className="h-4 w-4" />
            Simular Offline
          </Button>
          <Button
            variant="outline"
            onClick={simulateOnline}
            disabled={isOnline}
            className="flex items-center gap-2"
          >
            <Wifi className="h-4 w-4" />
            Simular Online
          </Button>
        </div>

        {/* Ventas pendientes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Ventas Pendientes</h4>
            <Badge variant="secondary">
              {pendingSales.filter((s) => !s.synced).length} pendientes
            </Badge>
          </div>

          {pendingSales.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay ventas pendientes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingSales.map((sale) => (
                <div
                  key={sale.id}
                  className={`p-3 border rounded-lg ${
                    sale.synced
                      ? 'bg-green-50 border-green-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {sale.synced ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                      <div>
                        <div className="font-medium text-sm">
                          {sale.data.customer_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {sale.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={
                        sale.synced
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {sale.synced ? 'Sincronizado' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={simulateSale}
            disabled={isOnline}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Simular Venta Offline
          </Button>
          <Button
            onClick={syncPendingSales}
            disabled={
              !isOnline ||
              pendingSales.filter((s) => !s.synced).length === 0 ||
              isSyncing
            }
            className="flex items-center gap-2"
          >
            <Upload className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
        </div>

        {/* Limpiar datos */}
        {pendingSales.length > 0 && (
          <Button
            variant="outline"
            onClick={clearPendingSales}
            className="w-full text-red-600 hover:text-red-700"
          >
            Limpiar Datos de Prueba
          </Button>
        )}

        {/* Información adicional */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">Instrucciones de Prueba:</div>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>
                  Simula estar offline para probar el almacenamiento local
                </li>
                <li>Agrega ventas mientras estás offline</li>
                <li>Vuelve a simular online para sincronizar</li>
                <li>Verifica que las ventas se sincronicen correctamente</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
