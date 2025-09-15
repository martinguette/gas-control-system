import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import AdminLayout from '@/components/layout/admin-layout';
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
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Truck,
  Clock,
  Eye,
  Plus,
  FileText,
  Settings,
  UserCheck,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/log-in');
  }

  const role = (user.user_metadata as Record<string, unknown> | null)?.role;
  if (role !== 'jefe') {
    redirect('/dashboard/vendor');
  }

  // Resolve full name from metadata, fallback to profiles
  let fullName = (user.user_metadata as Record<string, unknown> | null)
    ?.full_name as string | undefined;
  if (!fullName) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    if (profile?.full_name) fullName = profile.full_name;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            ¡Bienvenido{fullName ? `, ${fullName}` : ''}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Panel de control administrativo - Sistema de Gas
          </p>
          <Badge variant="secondary" className="text-sm">
            Rol: Jefe - Acceso Completo
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vendedores Activos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                2 en ruta, 1 en base
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Inventario Total
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">
                Cilindros disponibles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,450</div>
              <p className="text-xs text-muted-foreground">+15% vs ayer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">
                Stock bajo en 2 productos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vendedores en Ruta */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Vendedores en Ruta
                  </CardTitle>
                  <CardDescription>
                    Monitoreo en tiempo real del equipo de ventas
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  En Vivo
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Vendedor 1 */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Carlos Mendoza</h4>
                      <p className="text-sm text-muted-foreground">
                        Ruta Norte
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Activo
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Asignados</p>
                    <p className="font-medium">15 cilindros</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vendidos</p>
                    <p className="font-medium">8 cilindros</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ventas</p>
                    <p className="font-medium">$1,200</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: '53%' }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  53% de objetivo cumplido
                </p>
              </div>

              {/* Vendedor 2 */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Ana García</h4>
                      <p className="text-sm text-muted-foreground">Ruta Sur</p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    En Tránsito
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Asignados</p>
                    <p className="font-medium">12 cilindros</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vendidos</p>
                    <p className="font-medium">5 cilindros</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ventas</p>
                    <p className="font-medium">$750</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: '42%' }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  42% de objetivo cumplido
                </p>
              </div>

              <div className="pt-2">
                <Link href="/dashboard/admin/vendors">
                  <Button variant="outline" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Todos los Vendedores
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>
                Acceso directo a funciones principales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/admin/inventory">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  Gestionar Inventario
                </Button>
              </Link>

              <Link href="/dashboard/admin/reports">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Reportes
                </Button>
              </Link>

              <Link href="/dashboard/admin/truck-arrivals">
                <Button variant="outline" className="w-full justify-start">
                  <Truck className="mr-2 h-4 w-4" />
                  Llegada de Camión
                </Button>
              </Link>

              <Link href="/dashboard/admin/assignments">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Asignar Cilindros
                </Button>
              </Link>

              <Link href="/dashboard/admin/settings">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Alertas y Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertas del Sistema
            </CardTitle>
            <CardDescription>
              Notificaciones importantes que requieren atención
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border border-orange-200 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-orange-900">Stock Bajo</h4>
                  <p className="text-sm text-orange-700">
                    Cilindros de 10kg están por debajo del nivel mínimo (5
                    unidades restantes)
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    <Clock className="inline h-3 w-3 mr-1" />
                    Hace 2 horas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border border-blue-200 bg-blue-50 rounded-lg">
                <Truck className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">
                    Camión Programado
                  </h4>
                  <p className="text-sm text-blue-700">
                    Llegada de camión programada para mañana a las 8:00 AM
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    <Clock className="inline h-3 w-3 mr-1" />
                    Hace 4 horas
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
