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
  Package,
  Plus,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

export default async function InventoryPage() {
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
              Gestión de Inventario
            </h1>
            <p className="text-sm lg:text-lg text-muted-foreground">
              Control y monitoreo de cilindros de gas
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="text-sm">Agregar Cilindros</span>
            </Button>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Package className="mr-2 h-4 w-4" />
              <span className="text-sm">Llegada de Camión</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">
                Total Cilindros
              </CardTitle>
              <Package className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">+12 desde ayer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">
                Cilindros Llenos
              </CardTitle>
              <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-green-600">
                189
              </div>
              <p className="text-xs text-muted-foreground">76.5% del total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">
                Cilindros Vacíos
              </CardTitle>
              <TrendingDown className="h-3 w-3 lg:h-4 lg:w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-orange-600">
                58
              </div>
              <p className="text-xs text-muted-foreground">23.5% del total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">
                Stock Bajo
              </CardTitle>
              <AlertTriangle className="h-3 w-3 lg:h-4 lg:w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-red-600">
                3
              </div>
              <p className="text-xs text-muted-foreground">
                Tipos de cilindros
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg lg:text-xl">
                  Inventario por Tipo
                </CardTitle>
                <CardDescription className="text-sm">
                  Lista detallada de cilindros disponibles
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  <span className="text-sm">Ver Todo</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <span className="text-sm">Exportar</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Sample inventory items */}
              <div className="border rounded-lg p-3 lg:p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm lg:text-base">
                        Cilindro 10kg - Azul
                      </h4>
                      <p className="text-xs lg:text-sm text-muted-foreground">
                        Marca: GasPro
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between lg:gap-6">
                    <div className="grid grid-cols-3 gap-2 lg:gap-4">
                      <div className="text-center">
                        <p className="text-lg lg:text-2xl font-bold text-green-600">
                          45
                        </p>
                        <p className="text-xs text-muted-foreground">Llenos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg lg:text-2xl font-bold text-orange-600">
                          8
                        </p>
                        <p className="text-xs text-muted-foreground">Vacíos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg lg:text-2xl font-bold">53</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                    </div>
                    <div className="flex gap-1 lg:gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3 lg:h-4 lg:w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 text-xs"
                  >
                    Stock Normal
                  </Badge>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Cilindro 15kg - Rojo</h4>
                      <p className="text-sm text-muted-foreground">
                        Marca: GasPro
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">12</p>
                      <p className="text-xs text-muted-foreground">Llenos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">3</p>
                      <p className="text-xs text-muted-foreground">Vacíos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">15</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <Badge variant="destructive">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Stock Bajo
                  </Badge>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Cilindro 20kg - Verde</h4>
                      <p className="text-sm text-muted-foreground">
                        Marca: GasPro
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">78</p>
                      <p className="text-xs text-muted-foreground">Llenos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">22</p>
                      <p className="text-xs text-muted-foreground">Vacíos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">100</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Stock Normal
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
