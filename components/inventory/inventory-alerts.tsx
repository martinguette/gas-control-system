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
      const response = await fetch('/api/inventory/summary');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.low_stock_alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialAlerts.length === 0) {
      fetchAlerts();
    }
  }, [initialAlerts.length]);

  const dismissAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/inventory/alerts/${alertId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setAlerts(alerts.filter((alert) => alert.alert_id !== alertId));
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const getAlertVariant = (alertType: string) => {
    return alertType === 'full' ? 'destructive' : 'default';
  };

  const getAlertIcon = (alertType: string) => {
    return <AlertTriangle className="h-4 w-4" />;
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-green-500" />
            Sin Alertas de Stock
          </CardTitle>
          <CardDescription>
            Todos los productos tienen stock suficiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-muted-foreground">
              No hay alertas de stock bajo activas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Alertas de Stock Bajo
          <Badge variant="destructive">{alerts.length}</Badge>
        </CardTitle>
        <CardDescription>
          Productos que requieren atención inmediata
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <Alert
            key={alert.alert_id}
            variant={getAlertVariant(alert.alert_type)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.alert_type)}
                <div className="flex-1">
                  <AlertTitle className="text-sm font-medium">
                    {alert.alert_type === 'full'
                      ? 'Cilindros Llenos'
                      : 'Cilindros Vacíos'}
                  </AlertTitle>
                  <AlertDescription className="mt-1">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {alert.product_type}
                        {alert.brand && alert.color && (
                          <span className="text-muted-foreground ml-1">
                            ({alert.brand} {alert.color})
                          </span>
                        )}
                      </p>
                      <p className="text-sm">
                        Stock actual:{' '}
                        <span className="font-semibold">
                          {alert.current_quantity}
                        </span>{' '}
                        | Mínimo requerido:{' '}
                        <span className="font-semibold">
                          {alert.min_threshold}
                        </span>
                      </p>
                    </div>
                  </AlertDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissAlert(alert.alert_id)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        ))}

        <div className="pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAlerts}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Actualizando...' : 'Actualizar Alertas'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
