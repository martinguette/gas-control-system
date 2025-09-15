import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import VendorLayout from '@/components/layout/vendor-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Package,
  Calendar,
  ArrowLeft,
  Download,
  Share,
} from 'lucide-react';
import Link from 'next/link';

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/log-in');
  }

  const role = (user.user_metadata as Record<string, unknown> | null)?.role;
  if (role !== 'vendedor') {
    redirect('/dashboard/admin');
  }

  // Simulated performance data - will be replaced with real data
  const performanceData = {
    today: {
      sales: 1000,
      expenses: 70,
      margin: 930,
      cylindersSold: 5,
      progress: 67,
    },
    week: {
      sales: 6500,
      expenses: 420,
      margin: 6080,
      cylindersSold: 32,
      progress: 85,
    },
    month: {
      sales: 25000,
      expenses: 1800,
      margin: 23200,
      cylindersSold: 125,
      progress: 78,
    },
  };

  const goals = {
    daily: 1500,
    weekly: 8000,
    monthly: 30000,
  };

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
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Mis Reportes
            </h1>
            <p className="text-sm text-muted-foreground">
              Rendimiento y estadísticas
            </p>
          </div>
        </div>

        {/* Performance Overview */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Resumen de Rendimiento
            </CardTitle>
            <CardDescription>
              Tu desempeño en diferentes períodos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Today */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Hoy</span>
                <Badge variant="outline" className="text-xs">
                  {performanceData.today.progress}% del objetivo
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-white rounded border">
                  <p className="text-sm font-bold text-green-600">
                    ${performanceData.today.sales}
                  </p>
                  <p className="text-xs text-muted-foreground">Ventas</p>
                </div>
                <div className="p-2 bg-white rounded border">
                  <p className="text-sm font-bold text-red-600">
                    ${performanceData.today.expenses}
                  </p>
                  <p className="text-xs text-muted-foreground">Gastos</p>
                </div>
                <div className="p-2 bg-white rounded border">
                  <p className="text-sm font-bold text-blue-600">
                    {performanceData.today.cylindersSold}
                  </p>
                  <p className="text-xs text-muted-foreground">Cilindros</p>
                </div>
              </div>
            </div>

            {/* Week */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Esta Semana</span>
                <Badge variant="outline" className="text-xs">
                  {performanceData.week.progress}% del objetivo
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-white rounded border">
                  <p className="text-sm font-bold text-green-600">
                    ${performanceData.week.sales.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Ventas</p>
                </div>
                <div className="p-2 bg-white rounded border">
                  <p className="text-sm font-bold text-red-600">
                    ${performanceData.week.expenses}
                  </p>
                  <p className="text-xs text-muted-foreground">Gastos</p>
                </div>
                <div className="p-2 bg-white rounded border">
                  <p className="text-sm font-bold text-blue-600">
                    {performanceData.week.cylindersSold}
                  </p>
                  <p className="text-xs text-muted-foreground">Cilindros</p>
                </div>
              </div>
            </div>

            {/* Month */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Este Mes</span>
                <Badge variant="outline" className="text-xs">
                  {performanceData.month.progress}% del objetivo
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-white rounded border">
                  <p className="text-sm font-bold text-green-600">
                    ${performanceData.month.sales.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Ventas</p>
                </div>
                <div className="p-2 bg-white rounded border">
                  <p className="text-sm font-bold text-red-600">
                    ${performanceData.month.expenses.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Gastos</p>
                </div>
                <div className="p-2 bg-white rounded border">
                  <p className="text-sm font-bold text-blue-600">
                    {performanceData.month.cylindersSold}
                  </p>
                  <p className="text-xs text-muted-foreground">Cilindros</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              Progreso de Objetivos
            </CardTitle>
            <CardDescription>
              Cómo vas con tus metas establecidas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Daily Goal */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Objetivo Diario</span>
                <span className="font-medium">
                  ${performanceData.today.sales} / ${goals.daily}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${performanceData.today.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Weekly Goal */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Objetivo Semanal</span>
                <span className="font-medium">
                  ${performanceData.week.sales.toLocaleString()} / $
                  {goals.weekly.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${performanceData.week.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Monthly Goal */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Objetivo Mensual</span>
                <span className="font-medium">
                  ${performanceData.month.sales.toLocaleString()} / $
                  {goals.monthly.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${performanceData.month.progress}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-green-600" />
              Productos Más Vendidos
            </CardTitle>
            <CardDescription>Tus productos estrella del mes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Package className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Cilindro 33lb</p>
                  <p className="text-xs text-muted-foreground">
                    Color: Naranja
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">45</p>
                <p className="text-xs text-muted-foreground">vendidos</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Cilindro 40lb</p>
                  <p className="text-xs text-muted-foreground">
                    Color: Naranja
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">32</p>
                <p className="text-xs text-muted-foreground">vendidos</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Package className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Cilindro 100lb</p>
                  <p className="text-xs text-muted-foreground">
                    Color: Naranja
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-600">28</p>
                <p className="text-xs text-muted-foreground">vendidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4 text-blue-600" />
              Exportar Reportes
            </CardTitle>
            <CardDescription>
              Descarga tus reportes en diferentes formatos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start h-12">
              <Download className="mr-3 h-4 w-4" />
              <div className="text-left">
                <div className="text-sm">Reporte Diario</div>
                <div className="text-xs opacity-70">PDF • Excel • CSV</div>
              </div>
            </Button>

            <Button variant="outline" className="w-full justify-start h-12">
              <Download className="mr-3 h-4 w-4" />
              <div className="text-left">
                <div className="text-sm">Reporte Semanal</div>
                <div className="text-xs opacity-70">PDF • Excel • CSV</div>
              </div>
            </Button>

            <Button variant="outline" className="w-full justify-start h-12">
              <Download className="mr-3 h-4 w-4" />
              <div className="text-left">
                <div className="text-sm">Reporte Mensual</div>
                <div className="text-xs opacity-70">PDF • Excel • CSV</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-2 pb-4">
          <Link href="/dashboard/vendor/sales" className="block">
            <Button className="w-full h-12 text-base" size="lg">
              <TrendingUp className="mr-2 h-5 w-5" />
              Nueva Venta
            </Button>
          </Link>

          <Link href="/dashboard/vendor/history" className="block">
            <Button variant="outline" className="w-full h-12" size="lg">
              <Calendar className="mr-2 h-5 w-5" />
              Ver Historial Completo
            </Button>
          </Link>
        </div>
      </div>
    </VendorLayout>
  );
}
