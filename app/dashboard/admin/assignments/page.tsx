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
  Plus,
  Users,
  Package,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  UserCheck,
  MapPin,
} from 'lucide-react';

export default async function AssignmentsPage() {
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Asignaciones Diarias
            </h1>
            <p className="text-lg text-muted-foreground">
              Gestión de cilindros asignados a vendedores
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Asignación
            </Button>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Programar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Asignaciones Hoy
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">27</div>
              <p className="text-xs text-muted-foreground">
                Cilindros asignados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vendedores Activos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Con asignaciones</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">13</div>
              <p className="text-xs text-muted-foreground">48% del total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">14</div>
              <p className="text-xs text-muted-foreground">52% del total</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Assignments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Asignaciones de Hoy
                </CardTitle>
                <CardDescription>
                  Cilindros asignados para el día de hoy
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="text-blue-600 border-blue-600"
              >
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Assignment 1 */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Carlos Mendoza</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Ruta Norte
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  En Progreso
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">15</p>
                  <p className="text-xs text-muted-foreground">Asignados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">8</p>
                  <p className="text-xs text-muted-foreground">Vendidos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">7</p>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">53%</p>
                  <p className="text-xs text-muted-foreground">Progreso</p>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: '53%' }}
                ></div>
              </div>

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Asignado: 8:00 AM</span>
                <span>Última venta: 2:30 PM</span>
              </div>
            </div>

            {/* Assignment 2 */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Ana García</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Ruta Sur
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800"
                >
                  En Tránsito
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">12</p>
                  <p className="text-xs text-muted-foreground">Asignados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">5</p>
                  <p className="text-xs text-muted-foreground">Vendidos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">7</p>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">42%</p>
                  <p className="text-xs text-muted-foreground">Progreso</p>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: '42%' }}
                ></div>
              </div>

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Asignado: 8:30 AM</span>
                <span>Última venta: 1:15 PM</span>
              </div>
            </div>

            {/* Assignment 3 */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Luis Rodríguez</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Ruta Este
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-800"
                >
                  Sin Asignar
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">0</p>
                  <p className="text-xs text-muted-foreground">Asignados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">0</p>
                  <p className="text-xs text-muted-foreground">Vendidos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">0</p>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">0%</p>
                  <p className="text-xs text-muted-foreground">Progreso</p>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-gray-400 h-2 rounded-full"
                  style={{ width: '0%' }}
                ></div>
              </div>

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Sin asignación</span>
                <span>-</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>
                Operaciones comunes de asignación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Asignar Cilindros a Vendedor
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                Reasignar Cilindros
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle className="mr-2 h-4 w-4" />
                Finalizar Asignaciones
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alertas</CardTitle>
              <CardDescription>Notificaciones importantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 border border-orange-200 bg-orange-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-orange-900">
                    Asignación Pendiente
                  </h4>
                  <p className="text-sm text-orange-700">
                    Luis Rodríguez no tiene cilindros asignados para hoy
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border border-blue-200 bg-blue-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">
                    Reseteo Automático
                  </h4>
                  <p className="text-sm text-blue-700">
                    Las asignaciones se reiniciarán automáticamente a las 00:00
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
