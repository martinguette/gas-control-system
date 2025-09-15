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
  Activity,
  MapPin,
  Phone,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Bell,
  Eye,
  Send,
  UserCheck,
  Navigation,
  Zap,
} from 'lucide-react';

export default async function EnRutaPage() {
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
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
              <Activity className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
              Monitoreo En Ruta
            </h1>
            <p className="text-sm lg:text-lg text-muted-foreground">
              Seguimiento en tiempo real del equipo de ventas
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              <span className="text-sm">Actualizar</span>
            </Button>
            <Button size="sm" className="w-full sm:w-auto">
              <Bell className="mr-2 h-4 w-4" />
              <span className="text-sm">Notificar Equipo</span>
            </Button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-6">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-green-800">
                Vendedores Activos
              </CardTitle>
              <UserCheck className="h-3 w-3 lg:h-4 lg:w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-green-700">
                2
              </div>
              <p className="text-xs text-green-600">En campo</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-blue-800">
                Ventas Hoy
              </CardTitle>
              <DollarSign className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-blue-700">
                $1,950
              </div>
              <p className="text-xs text-blue-600">+23% vs ayer</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-orange-800">
                Cilindros Vendidos
              </CardTitle>
              <Package className="h-3 w-3 lg:h-4 lg:w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-orange-700">
                13
              </div>
              <p className="text-xs text-orange-600">De 27 asignados</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-red-800">
                Alertas
              </CardTitle>
              <AlertTriangle className="h-3 w-3 lg:h-4 lg:w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-red-700">
                1
              </div>
              <p className="text-xs text-red-600">Requiere atención</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Vendedores en Ruta - Detallado */}
          <div className="xl:col-span-2 space-y-3 lg:space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                      <Navigation className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                      Vendedores en Campo
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Monitoreo detallado en tiempo real
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600 w-fit"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    En Vivo
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 lg:space-y-4">
                {/* Vendedor 1 - Carlos Mendoza */}
                <div className="border rounded-lg p-3 lg:p-4 bg-gradient-to-r from-green-50 to-blue-50">
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserCheck className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base lg:text-lg">
                          Carlos Mendoza
                        </h4>
                        <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            Ruta Norte - Zona Centro
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span>Última actualización: hace 2 min</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Activo
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-blue-600 border-blue-600 text-xs"
                      >
                        <Zap className="mr-1 h-3 w-3" />
                        Alto Rendimiento
                      </Badge>
                    </div>
                  </div>

                  {/* Métricas Detalladas */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mb-4">
                    <div className="text-center p-2 lg:p-3 bg-white rounded-lg border">
                      <p className="text-lg lg:text-2xl font-bold text-blue-600">
                        15
                      </p>
                      <p className="text-xs text-muted-foreground">Asignados</p>
                    </div>
                    <div className="text-center p-2 lg:p-3 bg-white rounded-lg border">
                      <p className="text-lg lg:text-2xl font-bold text-green-600">
                        8
                      </p>
                      <p className="text-xs text-muted-foreground">Vendidos</p>
                    </div>
                    <div className="text-center p-2 lg:p-3 bg-white rounded-lg border">
                      <p className="text-lg lg:text-2xl font-bold text-orange-600">
                        7
                      </p>
                      <p className="text-xs text-muted-foreground">Restantes</p>
                    </div>
                    <div className="text-center p-2 lg:p-3 bg-white rounded-lg border">
                      <p className="text-lg lg:text-2xl font-bold text-purple-600">
                        $1,200
                      </p>
                      <p className="text-xs text-muted-foreground">Ventas</p>
                    </div>
                  </div>

                  {/* Progreso */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progreso del día</span>
                      <span className="font-medium">53%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 lg:h-3 rounded-full transition-all duration-500"
                        style={{ width: '53%' }}
                      ></div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                    >
                      <Phone className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                      <span className="text-xs lg:text-sm hidden sm:inline">
                        Llamar
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                    >
                      <MessageSquare className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                      <span className="text-xs lg:text-sm hidden sm:inline">
                        Mensaje
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                    >
                      <Eye className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                      <span className="text-xs lg:text-sm hidden sm:inline">
                        Detalles
                      </span>
                    </Button>
                  </div>
                </div>

                {/* Vendedor 2 - Ana García */}
                <div className="border rounded-lg p-3 lg:p-4 bg-gradient-to-r from-yellow-50 to-orange-50">
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <UserCheck className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base lg:text-lg">
                          Ana García
                        </h4>
                        <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            Ruta Sur - Zona Industrial
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span>Última actualización: hace 5 min</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        En Tránsito
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-orange-600 border-orange-600 text-xs"
                      >
                        <TrendingDown className="mr-1 h-3 w-3" />
                        Bajo Rendimiento
                      </Badge>
                    </div>
                  </div>

                  {/* Métricas Detalladas */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mb-4">
                    <div className="text-center p-2 lg:p-3 bg-white rounded-lg border">
                      <p className="text-lg lg:text-2xl font-bold text-blue-600">
                        12
                      </p>
                      <p className="text-xs text-muted-foreground">Asignados</p>
                    </div>
                    <div className="text-center p-2 lg:p-3 bg-white rounded-lg border">
                      <p className="text-lg lg:text-2xl font-bold text-green-600">
                        5
                      </p>
                      <p className="text-xs text-muted-foreground">Vendidos</p>
                    </div>
                    <div className="text-center p-2 lg:p-3 bg-white rounded-lg border">
                      <p className="text-lg lg:text-2xl font-bold text-orange-600">
                        7
                      </p>
                      <p className="text-xs text-muted-foreground">Restantes</p>
                    </div>
                    <div className="text-center p-2 lg:p-3 bg-white rounded-lg border">
                      <p className="text-lg lg:text-2xl font-bold text-purple-600">
                        $750
                      </p>
                      <p className="text-xs text-muted-foreground">Ventas</p>
                    </div>
                  </div>

                  {/* Progreso */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progreso del día</span>
                      <span className="font-medium">42%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
                      <div
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 lg:h-3 rounded-full transition-all duration-500"
                        style={{ width: '42%' }}
                      ></div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                    >
                      <Phone className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                      <span className="text-xs lg:text-sm hidden sm:inline">
                        Llamar
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                    >
                      <MessageSquare className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                      <span className="text-xs lg:text-sm hidden sm:inline">
                        Mensaje
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                    >
                      <Eye className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                      <span className="text-xs lg:text-sm hidden sm:inline">
                        Detalles
                      </span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel Lateral - Alertas y Acciones */}
          <div className="space-y-3 lg:space-y-4">
            {/* Alertas del Sistema */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg text-red-800">
                  <AlertTriangle className="h-4 w-4 lg:h-5 lg:w-5" />
                  Alertas Activas
                </CardTitle>
                <CardDescription className="text-sm">
                  Situaciones que requieren atención inmediata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 border border-red-200 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-red-900 text-sm">
                      Ana García - Bajo Rendimiento
                    </h4>
                    <p className="text-xs text-red-700">
                      Solo ha vendido 5 de 12 cilindros asignados. Rendimiento
                      30% por debajo del promedio.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs cursor-pointer"
                      >
                        <Send className="mr-1 h-3 w-3" />
                        Contactar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs cursor-pointer"
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acciones Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  <Zap className="h-4 w-4 lg:h-5 lg:w-5" />
                  Acciones Rápidas
                </CardTitle>
                <CardDescription className="text-sm">
                  Comandos para el equipo en campo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start cursor-pointer text-sm"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span className="text-sm">Mensaje a Todo el Equipo</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start cursor-pointer text-sm"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  <span className="text-sm">Recordatorio de Objetivos</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start cursor-pointer text-sm"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span className="text-sm">Solicitar Actualización</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start cursor-pointer text-sm"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  <span className="text-sm">Revisar Estrategias</span>
                </Button>
              </CardContent>
            </Card>

            {/* Resumen del Día */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5" />
                  Resumen del Día
                </CardTitle>
                <CardDescription className="text-sm">
                  Estadísticas generales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Objetivo Diario
                  </span>
                  <span className="font-medium">$3,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Ventas Actuales
                  </span>
                  <span className="font-medium text-green-600">$1,950</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Progreso
                  </span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                    style={{ width: '65%' }}
                  ></div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Faltan $1,050 para alcanzar el objetivo
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
