'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, X, Bell, BellOff, RefreshCw } from 'lucide-react';
import type { LowStockAlert } from '@/types/inventory';

interface InventoryAlertsProps {
  initialAlerts?: LowStockAlert[];
}

export function InventoryAlerts({ initialAlerts = [] }: InventoryAlertsProps) {
  const [alerts, setAlerts] = useState<LowStockAlert[]>(initialAlerts);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/inventory/alerts');
      const data = await response.json();

      if (response.ok) {
        setAlerts(data.low_stock_alerts || []);
      } else {
        console.error('Error fetching alerts:', data.error);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.alert_id !== alertId));
  };

  const getAlertIcon = (alertType: string) => {
    return alertType === 'full' ? (
      <Bell className="h-4 w-4" />
    ) : (
      <BellOff className="h-4 w-4" />
    );
  };

  const getAlertVariant = (alertType: string) => {
    return alertType === 'full' ? 'destructive' : 'default';
  };

  if (alerts.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-2xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-white/20 rounded-lg">
              <AlertTriangle className="h-6 w-6" />
            </div>
            ✅ Estado del Inventario
          </CardTitle>
          <CardDescription className="text-green-100 text-base">
            Todas las alertas de stock están bajo control
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl mb-6 animate-bounce">🎉</div>
              <h3 className="text-2xl font-bold text-green-700 mb-2">
                ¡Todo Perfecto!
              </h3>
              <p className="text-green-600 text-lg font-medium">
                No hay alertas de stock bajo activas
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-semibold">
                  Sistema Saludable
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-pink-50 hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          <div className="p-2 bg-white/20 rounded-lg">
            <AlertTriangle className="h-6 w-6" />
          </div>
          🚨 Alertas de Stock Bajo
          <Badge className="ml-2 bg-white text-red-600 font-bold text-lg px-3 py-1 animate-pulse">
            {alerts.length}
          </Badge>
        </CardTitle>
        <CardDescription className="text-red-100 text-base">
          Productos que requieren atención inmediata
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {alerts.map((alert, index) => (
          <Alert
            key={alert.alert_id}
            className={`border-0 shadow-lg ${
              alert.alert_type === 'full'
                ? 'bg-gradient-to-r from-red-100 to-pink-100 border-l-4 border-red-500'
                : 'bg-gradient-to-r from-orange-100 to-yellow-100 border-l-4 border-orange-500'
            } hover:shadow-xl transition-all duration-300`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-lg ${
                    alert.alert_type === 'full' ? 'bg-red-500' : 'bg-orange-500'
                  }`}
                >
                  {getAlertIcon(alert.alert_type)}
                </div>
                <div className="flex-1">
                  <AlertTitle
                    className={`text-lg font-bold ${
                      alert.alert_type === 'full'
                        ? 'text-red-800'
                        : 'text-orange-800'
                    }`}
                  >
                    {alert.alert_type === 'full'
                      ? '🟢 Cilindros Llenos'
                      : '🟠 Cilindros Vacíos'}
                  </AlertTitle>
                  <AlertDescription className="mt-2">
                    <div className="space-y-2">
                      <p
                        className={`font-semibold text-lg ${
                          alert.alert_type === 'full'
                            ? 'text-red-700'
                            : 'text-orange-700'
                        }`}
                      >
                        {alert.product_type}
                        {alert.brand && alert.color && (
                          <span className="text-gray-600 ml-2 font-normal">
                            ({alert.brand} {alert.color})
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-4">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-bold ${
                            alert.current_quantity <= alert.min_threshold
                              ? 'bg-red-200 text-red-800'
                              : 'bg-yellow-200 text-yellow-800'
                          }`}
                        >
                          Stock: {alert.current_quantity}
                        </div>
                        <div className="px-3 py-1 rounded-full text-sm font-bold bg-gray-200 text-gray-800">
                          Mínimo: {alert.min_threshold}
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissAlert(alert.alert_id)}
                className="h-10 w-10 p-0 hover:bg-red-200 rounded-full"
              >
                <X className="h-5 w-5 text-red-600" />
              </Button>
            </div>
          </Alert>
        ))}

        <div className="pt-4 border-t border-red-200">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAlerts}
            disabled={isLoading}
            className="w-full bg-white hover:bg-red-50 border-red-300 text-red-700 hover:text-red-800 font-semibold"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                Actualizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                🔄 Actualizar Alertas
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
