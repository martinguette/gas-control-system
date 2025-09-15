'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import type { InventoryStats } from '@/types/inventory';

interface InventoryStatsCardsProps {
  stats: InventoryStats;
}

export function InventoryStatsCards({ stats }: InventoryStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressValue = (current: number, max: number) => {
    if (max === 0) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Cilindros Llenos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Cilindros Llenos
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_full_cylinders}</div>
          <p className="text-xs text-muted-foreground">Total en inventario</p>
          <div className="mt-2 space-y-1">
            {Object.entries(stats.by_type).map(([type, data]) => (
              <div
                key={type}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-muted-foreground">{type}:</span>
                <Badge variant="outline" className="text-xs">
                  {data.full}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Total Cilindros Vacíos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Cilindros Vacíos
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.total_empty_cylinders}
          </div>
          <p className="text-xs text-muted-foreground">Total en inventario</p>
          <div className="mt-2 space-y-1">
            {Object.entries(stats.by_type).map(([type, data]) => (
              <div
                key={type}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-muted-foreground">{type}:</span>
                <Badge variant="outline" className="text-xs">
                  {data.empty}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Valor Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.total_value)}
          </div>
          <p className="text-xs text-muted-foreground">Valor del inventario</p>
          <div className="mt-2 space-y-1">
            {Object.entries(stats.by_type).map(([type, data]) => (
              <div
                key={type}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-muted-foreground">{type}:</span>
                <span className="font-medium">
                  {formatCurrency(data.value)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas Activas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {stats.low_stock_alerts}
          </div>
          <p className="text-xs text-muted-foreground">Stock bajo detectado</p>
          {stats.low_stock_alerts > 0 && (
            <div className="mt-2">
              <Progress value={100} className="h-2" />
              <p className="text-xs text-orange-600 mt-1">
                Requiere atención inmediata
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
