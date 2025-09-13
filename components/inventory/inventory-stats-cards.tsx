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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Cilindros Llenos */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-2xl transition-all duration-500 hover:scale-105">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-xl">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              🟢 Cilindros Llenos
            </CardTitle>
            <div className="p-2 bg-white/20 rounded-lg">
              <Package className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-4xl font-black text-green-800 mb-2">
            {stats.total_full_cylinders}
          </div>
          <p className="text-green-600 font-semibold mb-4">
            Total en inventario
          </p>
          <div className="space-y-2">
            {Object.entries(stats.by_type).map(([type, data]) => (
              <div
                key={type}
                className="flex items-center justify-between p-2 bg-green-100 rounded-lg"
              >
                <span className="text-green-700 font-medium">{type}:</span>
                <Badge className="bg-green-500 text-white font-bold">
                  {data.full}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Total Cilindros Vacíos */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-yellow-50 hover:shadow-2xl transition-all duration-500 hover:scale-105">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-t-xl">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              🟠 Cilindros Vacíos
            </CardTitle>
            <div className="p-2 bg-white/20 rounded-lg">
              <Package className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-4xl font-black text-orange-800 mb-2">
            {stats.total_empty_cylinders}
          </div>
          <p className="text-orange-600 font-semibold mb-4">
            Total en inventario
          </p>
          <div className="space-y-2">
            {Object.entries(stats.by_type).map(([type, data]) => (
              <div
                key={type}
                className="flex items-center justify-between p-2 bg-orange-100 rounded-lg"
              >
                <span className="text-orange-700 font-medium">{type}:</span>
                <Badge className="bg-orange-500 text-white font-bold">
                  {data.empty}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Valor Total */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-2xl transition-all duration-500 hover:scale-105">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-xl">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              💰 Valor Total
            </CardTitle>
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-4xl font-black text-purple-800 mb-2">
            {formatCurrency(stats.total_value)}
          </div>
          <p className="text-purple-600 font-semibold mb-4">
            Valor del inventario
          </p>
          <div className="space-y-2">
            {Object.entries(stats.by_type).map(([type, data]) => (
              <div
                key={type}
                className="flex items-center justify-between p-2 bg-purple-100 rounded-lg"
              >
                <span className="text-purple-700 font-medium">{type}:</span>
                <span className="font-bold text-purple-800">
                  {formatCurrency(data.value)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas Activas */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-pink-50 hover:shadow-2xl transition-all duration-500 hover:scale-105">
        <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-xl">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              🚨 Alertas Activas
            </CardTitle>
            <div className="p-2 bg-white/20 rounded-lg">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-4xl font-black text-red-800 mb-2">
            {stats.low_stock_alerts}
          </div>
          <p className="text-red-600 font-semibold mb-4">
            Stock bajo detectado
          </p>
          {stats.low_stock_alerts > 0 && (
            <div className="mt-4">
              <div className="w-full bg-red-200 rounded-full h-3 mb-2">
                <div
                  className="bg-gradient-to-r from-red-500 to-pink-500 h-3 rounded-full animate-pulse"
                  style={{ width: '100%' }}
                ></div>
              </div>
              <p className="text-red-700 font-bold text-center">
                ⚠️ Requiere atención inmediata
              </p>
            </div>
          )}
          {stats.low_stock_alerts === 0 && (
            <div className="mt-4 p-3 bg-green-100 rounded-lg">
              <p className="text-green-700 font-bold text-center">
                ✅ Todo en orden
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
