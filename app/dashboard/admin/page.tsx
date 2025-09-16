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

  // Resolve full name from metadata, fallback to users table
  let fullName = (user.user_metadata as Record<string, unknown> | null)
    ?.full_name as string | undefined;
  if (!fullName) {
    const { data: userData } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single();
    fullName = userData?.name;
  }

  return (
    <AdminLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              ¡Bienvenido, {fullName || 'Administrador'}!
            </h1>
            <p className="text-sm lg:text-base text-muted-foreground">
              Panel de control del sistema de gestión de gas
            </p>
          </div>
          <Badge variant="secondary" className="text-xs lg:text-sm w-fit">
            Rol: Jefe - Acceso Completo
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">
                Vendedores Activos
              </CardTitle>
              <Users className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">2 en ruta</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">
                Inventario Total
              </CardTitle>
              <Package className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">Cilindros</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">
                Ventas Hoy
              </CardTitle>
              <DollarSign className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold">$2,450</div>
              <p className="text-xs text-muted-foreground">+15% vs ayer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">
                Alertas
              </CardTitle>
              <AlertTriangle className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-orange-600">
                2
              </div>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Vendedores en Ruta */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                      <Users className="h-4 w-4 lg:h-5 lg:w-5" />
                      Vendedores en Ruta
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Monitoreo en tiempo real del equipo de ventas
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600 w-fit"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    En Vivo
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 lg:space-y-4">
                {/* Vendor 1 */}
                <div className="border rounded-lg p-3 lg:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserCheck className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm lg:text-base">
                          Carlos Mendoza
                        </h4>
                        <p className="text-xs lg:text-sm text-muted-foreground">
                          Ruta Norte
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 w-fit"
                    >
                      Activo
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 lg:gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-lg lg:text-2xl font-bold text-blue-600">
                        15
                      </p>
                      <p className="text-xs text-muted-foreground">Asignados</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg lg:text-2xl font-bold text-green-600">
                        8
                      </p>
                      <p className="text-xs text-muted-foreground">Vendidos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg lg:text-2xl font-bold text-orange-600">
                        7
                      </p>
                      <p className="text-xs text-muted-foreground">Restantes</p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: '53%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    53% de objetivo cumplido
                  </p>
                </div>

                {/* Vendor 2 */}
                <div className="border rounded-lg p-3 lg:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <UserCheck className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm lg:text-base">
                          Ana García
                        </h4>
                        <p className="text-xs lg:text-sm text-muted-foreground">
                          Ruta Sur
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 w-fit"
                    >
                      En Tránsito
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 lg:gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-lg lg:text-2xl font-bold text-blue-600">
                        12
                      </p>
                      <p className="text-xs text-muted-foreground">Asignados</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg lg:text-2xl font-bold text-green-600">
                        5
                      </p>
                      <p className="text-xs text-muted-foreground">Vendidos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg lg:text-2xl font-bold text-orange-600">
                        7
                      </p>
                      <p className="text-xs text-muted-foreground">Restantes</p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: '42%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    42% de objetivo cumplido
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Acciones Rápidas */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-4 w-4 lg:h-5 lg:w-5" />
                  Acciones Rápidas
                </CardTitle>
                <CardDescription className="text-sm">
                  Acceso directo a funciones principales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/dashboard/admin/en-ruta" className="block">
                  <Button className="w-full justify-start cursor-pointer bg-green-600 hover:bg-green-700">
                    <Activity className="mr-2 h-4 w-4" />
                    <span className="text-sm">Monitoreo En Ruta</span>
                  </Button>
                </Link>

                <Link href="/dashboard/admin/inventory" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start cursor-pointer"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    <span className="text-sm">Gestionar Inventario</span>
                  </Button>
                </Link>

                <Link href="/dashboard/admin/reports" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start cursor-pointer"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span className="text-sm">Ver Reportes</span>
                  </Button>
                </Link>

                <Link href="/dashboard/admin/assignments" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start cursor-pointer"
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    <span className="text-sm">Asignar Cilindros</span>
                  </Button>
                </Link>

                <Link href="/dashboard/admin/settings" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span className="text-sm">Configuración</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alertas del Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-4 w-4 lg:h-5 lg:w-5" />
              Alertas del Sistema
            </CardTitle>
            <CardDescription className="text-sm">
              Notificaciones importantes que requieren atención
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 border border-orange-200 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 lg:h-5 lg:w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-orange-900 text-sm lg:text-base">
                  Stock Bajo
                </h4>
                <p className="text-xs lg:text-sm text-orange-700">
                  Cilindros de 10kg están por debajo del nivel mínimo (5
                  unidades restantes)
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Última actualización: hace 15 minutos
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border border-blue-200 bg-blue-50 rounded-lg">
              <Truck className="h-4 w-4 lg:h-5 lg:w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-blue-900 text-sm lg:text-base">
                  Camión Programado
                </h4>
                <p className="text-xs lg:text-sm text-blue-700">
                  Llegada de camión programada para mañana a las 8:00 AM
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Preparar recepción de 50 cilindros nuevos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
