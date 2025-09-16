import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import VendorLayout from '@/components/layout/vendor-layout';
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
  ShoppingCart,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  Target,
  Plus,
  Receipt,
  MapPin,
  CheckCircle,
  Activity,
  Zap,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';

export default async function VendorDashboard() {
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

  // Resolve full name from metadata, fallback to users table
  let fullName = (user.user_metadata as Record<string, unknown> | null)
    ?.full_name as string | undefined;
  if (!fullName) {
    const { data: userData } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single();
    if (userData?.name) fullName = userData.name;
  }

  // Simulated daily data - will be replaced with real data
  const dailyStats = {
    assigned: {
      '33lb': 8,
      '40lb': 5,
      '100lb': 2,
      total: 15,
    },
    sold: {
      '33lb': 4,
      '40lb': 3,
      '100lb': 1,
      total: 8,
    },
    remaining: {
      '33lb': 4,
      '40lb': 2,
      '100lb': 1,
      total: 7,
    },
    emptyReceived: {
      '33lb': 3,
      '40lb': 2,
      '100lb': 0,
      total: 5,
    },
    sales: 2400,
    expenses: 150,
    margin: 2250,
    progress: 53,
    assignedRoute: 'Zona Norte - Centro',
    lastUpdate: 'hace 2 minutos',
  };

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <VendorLayout>
      <div className="space-y-4">
        {/* Welcome Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                ¡Hola{fullName ? `, ${fullName}` : ''}! 👋
              </h1>
              <p className="text-sm text-muted-foreground capitalize">
                {today}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Panel Móvil
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 text-xs">
              <UserCheck className="w-3 h-3 mr-1" />
              Activo en Ruta
            </Badge>
            <Badge
              variant="outline"
              className="text-green-600 border-green-600 text-xs"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              En Vivo
            </Badge>
          </div>
        </div>

        {/* Cilindros Asignados - Estado STANDBY */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              Cilindros Asignados (Estado STANDBY)
            </CardTitle>
            <CardDescription className="text-sm">
              Cilindros entregados para la ruta del día
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso de Ventas</span>
                <span className="font-medium">{dailyStats.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${dailyStats.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Cilindros por Tipo */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm font-bold text-orange-600">33lb</p>
                  <p className="text-xs text-muted-foreground">
                    {dailyStats.assigned['33lb']} asignados
                  </p>
                  <p className="text-xs text-green-600">
                    {dailyStats.sold['33lb']} vendidos
                  </p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-bold text-blue-600">40lb</p>
                  <p className="text-xs text-muted-foreground">
                    {dailyStats.assigned['40lb']} asignados
                  </p>
                  <p className="text-xs text-green-600">
                    {dailyStats.sold['40lb']} vendidos
                  </p>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-bold text-purple-600">100lb</p>
                  <p className="text-xs text-muted-foreground">
                    {dailyStats.assigned['100lb']} asignados
                  </p>
                  <p className="text-xs text-green-600">
                    {dailyStats.sold['100lb']} vendidos
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Actions */}
        <div className="space-y-3">
          <Link href="/dashboard/vendor/sales" className="block">
            <Button className="w-full justify-start h-14 text-base" size="lg">
              <Plus className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div>Registrar Venta</div>
                <div className="text-sm opacity-90">Nueva transacción</div>
              </div>
            </Button>
          </Link>

          <Link href="/dashboard/vendor/expenses" className="block">
            <Button
              variant="outline"
              className="w-full justify-start h-14 text-base"
              size="lg"
            >
              <Receipt className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div>Registrar Gasto</div>
                <div className="text-sm opacity-70">
                  Comida, transporte, etc.
                </div>
              </div>
            </Button>
          </Link>
        </div>

        {/* Daily Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-green-800">
                <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                Ventas Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-700">
                ${dailyStats.sales.toLocaleString()}
              </div>
              <p className="text-xs text-green-600">
                {dailyStats.sold.total} cilindros vendidos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-red-800">
                <Receipt className="h-4 w-4 mr-2 text-red-600" />
                Gastos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-red-700">
                ${dailyStats.expenses}
              </div>
              <p className="text-xs text-red-600">Del día</p>
            </CardContent>
          </Card>
        </div>

        {/* Margen y Cilindros Vacíos */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-purple-800">
                <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
                Margen del Día
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-purple-700">
                ${dailyStats.margin.toLocaleString()}
              </div>
              <p className="text-xs text-purple-600">Ventas - Gastos</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-gray-800">
                <Package className="h-4 w-4 mr-2 text-gray-600" />
                Vacíos Recibidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-gray-700">
                {dailyStats.emptyReceived.total}
              </div>
              <p className="text-xs text-gray-600">En intercambios</p>
            </CardContent>
          </Card>
        </div>

        {/* Route Info */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-600" />
              Ruta Asignada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {dailyStats.assignedRoute}
                </span>
                <Badge className="bg-green-100 text-green-800 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Activa
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Última actualización: {dailyStats.lastUpdate}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="h-3 w-3" />
                <span>Sincronizado con panel "En Ruta"</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/vendor/history" className="block">
              <Button
                variant="outline"
                className="w-full justify-start h-12"
                size="lg"
              >
                <Clock className="mr-3 h-4 w-4" />
                <div className="text-left">
                  <div className="text-sm">Historial de Ventas</div>
                  <div className="text-xs opacity-70">
                    Ver transacciones del día
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard/vendor/reports" className="block">
              <Button
                variant="outline"
                className="w-full justify-start h-12"
                size="lg"
              >
                <TrendingUp className="mr-3 h-4 w-4" />
                <div className="text-left">
                  <div className="text-sm">Mis Reportes</div>
                  <div className="text-xs opacity-70">
                    Rendimiento y estadísticas
                  </div>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
}
