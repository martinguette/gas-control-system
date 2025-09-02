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
import { BarChart3, Clock, ShoppingCart, Target } from 'lucide-react';

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

  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-foreground">
            ¡Bienvenido Vendedor!
          </h1>
          <p className="text-base text-muted-foreground">
            Tus credenciales fueron verificadas exitosamente
          </p>
          <Badge variant="secondary" className="text-sm">
            Rol: Vendedor - Panel Móvil
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ventas Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">$2,350</div>
              <p className="text-xs text-muted-foreground">8 órdenes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Meta Mensual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">75%</div>
              <p className="text-xs text-muted-foreground">$18,750 / $25,000</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            <CardDescription>
              Herramientas optimizadas para vendedores móviles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start h-12" size="lg">
              <ShoppingCart className="mr-3 h-5 w-5" />
              Nueva Venta
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-12 bg-transparent"
              size="lg"
            >
              <BarChart3 className="mr-3 h-5 w-5" />
              Ver Reportes
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-12 bg-transparent"
              size="lg"
            >
              <Clock className="mr-3 h-5 w-5" />
              Historial de Ventas
            </Button>
          </CardContent>
        </Card>

        {/* Vendor Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Panel Vendedor</CardTitle>
            <CardDescription>
              Diseño optimizado para dispositivos móviles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Funciones Disponibles</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Registro de ventas en tiempo real</li>
                <li>• Consulta de inventario</li>
                <li>• Reportes de rendimiento</li>
                <li>• Gestión de clientes</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Optimización Móvil</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Navegación táctil intuitiva</li>
                <li>• Interfaz responsive</li>
                <li>• Acceso offline básico</li>
                <li>• Sincronización automática</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
}
