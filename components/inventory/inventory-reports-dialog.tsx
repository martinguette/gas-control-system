'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  Download,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
} from 'lucide-react';
import type { InventoryStats, InventorySummary } from '@/types/inventory';

interface InventoryReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryReportsDialog({
  open,
  onOpenChange,
}: InventoryReportsDialogProps) {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [summary, setSummary] = useState<InventorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/inventory/summary');
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchReportData();
    }
  }, [open]);

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

  const exportToCSV = () => {
    if (!summary.length) return;

    const headers = [
      'Tipo',
      'Cilindros Llenos',
      'Costo Unitario',
      'Cilindros Vacíos',
      'Valor Total',
    ];
    const rows = summary.map((item) => [
      item.product_type,
      item.full_quantity,
      item.full_unit_cost,
      item.empty_total_quantity,
      item.full_quantity * item.full_unit_cost,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Reportes de Inventario
          </DialogTitle>
          <DialogDescription>
            Análisis detallado del estado actual del inventario
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Botón de exportar */}
          <div className="flex justify-end">
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Resumen General</TabsTrigger>
              <TabsTrigger value="detailed">Detalle por Tipo</TabsTrigger>
              <TabsTrigger value="alerts">Estado de Alertas</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">
                    Cargando datos...
                  </p>
                </div>
              ) : stats ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Cilindros
                      </CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.total_full_cylinders +
                          stats.total_empty_cylinders}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Llenos: {stats.total_full_cylinders} | Vacíos:{' '}
                        {stats.total_empty_cylinders}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Valor Total
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(stats.total_value)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Valor del inventario
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Alertas Activas
                      </CardTitle>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {stats.low_stock_alerts}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Requieren atención
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Estado General
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {stats.low_stock_alerts === 0 ? 'Óptimo' : 'Atención'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats.low_stock_alerts === 0
                          ? 'Todo bajo control'
                          : 'Revisar alertas'}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No se pudieron cargar los datos
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="detailed" className="space-y-4">
              {summary.length > 0 ? (
                <div className="space-y-4">
                  {summary.map((item) => (
                    <Card key={item.product_type}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>
                            {item.product_type} (
                            {item.product_type === '33lb'
                              ? '15kg'
                              : item.product_type === '40lb'
                              ? '18kg'
                              : '45kg'}
                            )
                          </span>
                          <Badge variant="outline">
                            {formatCurrency(
                              item.full_quantity * item.full_unit_cost
                            )}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Análisis detallado por tipo de cilindro
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Cilindros Llenos
                            </p>
                            <p className="text-2xl font-bold">
                              {item.full_quantity}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Costo unitario:{' '}
                              {formatCurrency(item.full_unit_cost)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Cilindros Vacíos
                            </p>
                            <p className="text-2xl font-bold">
                              {item.empty_total_quantity}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Total por tipo
                            </p>
                          </div>
                        </div>

                        {item.empty_brands.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              Distribución por Marca
                            </p>
                            <div className="space-y-2">
                              {item.empty_brands.map((brand, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between"
                                >
                                  <span className="text-sm">
                                    {brand.brand} {brand.color}
                                  </span>
                                  <Badge variant="outline">
                                    {brand.quantity}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No hay datos disponibles
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Estado de Alertas</CardTitle>
                  <CardDescription>
                    Monitoreo de alertas de stock bajo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats && stats.low_stock_alerts > 0 ? (
                    <div className="space-y-4">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>{stats.low_stock_alerts}</strong> alertas
                          activas requieren atención inmediata.
                        </AlertDescription>
                      </Alert>
                      <div className="text-center">
                        <Button
                          variant="outline"
                          onClick={() => fetchReportData()}
                        >
                          Actualizar Estado
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">✅</div>
                      <p className="text-muted-foreground">
                        Todas las alertas están bajo control
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
