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
  Settings,
  Users,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Key,
  BellRing,
  Database as DbIcon,
  Palette as PaletteIcon,
} from 'lucide-react';

export default async function SettingsPage() {
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Configuración del Sistema
            </h1>
            <p className="text-sm lg:text-lg text-muted-foreground">
              Gestión de configuraciones y preferencias
            </p>
          </div>
          <Button size="sm" className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            <span className="text-sm">Guardar Cambios</span>
          </Button>
        </div>

        {/* Settings Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Perfil de Usuario
              </CardTitle>
              <CardDescription>
                Información personal y credenciales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre Completo</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={user.user_metadata?.full_name || ''}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={user.email || ''}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Teléfono</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+52 555 123 4567"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rol</label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Jefe</Badge>
                  <span className="text-sm text-muted-foreground">
                    Acceso completo al sistema
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración del Sistema
              </CardTitle>
              <CardDescription>
                Ajustes generales de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Nombre de la Empresa
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="Gas Control System"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Zona Horaria</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="America/Mexico_City">
                    México Central (GMT-6)
                  </option>
                  <option value="America/Mexico_City">
                    México Pacífico (GMT-7)
                  </option>
                  <option value="America/Mexico_City">
                    México Este (GMT-5)
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Idioma</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Formato de Moneda</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="MXN">Peso Mexicano (MXN)</option>
                  <option value="USD">Dólar Americano (USD)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificaciones
              </CardTitle>
              <CardDescription>
                Configuración de alertas y notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alertas de Stock Bajo</p>
                  <p className="text-sm text-muted-foreground">
                    Notificar cuando el inventario esté bajo
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificaciones de Ventas</p>
                  <p className="text-sm text-muted-foreground">
                    Alertas de nuevas ventas
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Recordatorios de Camión</p>
                  <p className="text-sm text-muted-foreground">
                    Alertas de llegadas programadas
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Reportes Diarios</p>
                  <p className="text-sm text-muted-foreground">
                    Envío automático de reportes
                  </p>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguridad
              </CardTitle>
              <CardDescription>
                Configuración de seguridad y acceso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Cambiar Contraseña
                </label>
                <Button variant="outline" size="sm" className="w-full">
                  <Key className="mr-2 h-4 w-4" />
                  Actualizar Contraseña
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Autenticación de Dos Factores</p>
                  <p className="text-sm text-muted-foreground">
                    Seguridad adicional
                  </p>
                </div>
                <input type="checkbox" className="rounded" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sesión Automática</p>
                  <p className="text-sm text-muted-foreground">
                    Mantener sesión iniciada
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Tiempo de Inactividad
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Database */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Base de Datos
              </CardTitle>
              <CardDescription>Gestión de datos y respaldos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Respaldo Automático
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Retención de Datos
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="1">1 año</option>
                  <option value="2">2 años</option>
                  <option value="5">5 años</option>
                  <option value="indefinite">Indefinido</option>
                </select>
              </div>

              <Button variant="outline" size="sm" className="w-full">
                <DbIcon className="mr-2 h-4 w-4" />
                Crear Respaldo Manual
              </Button>

              <Button variant="outline" size="sm" className="w-full">
                <Database className="mr-2 h-4 w-4" />
                Restaurar desde Respaldo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Estado del Sistema
            </CardTitle>
            <CardDescription>
              Información del estado actual del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Database className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium">Base de Datos</h4>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Conectada
                </Badge>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BellRing className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium">Notificaciones</h4>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Activas
                </Badge>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium">Seguridad</h4>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Protegido
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
