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
  Clock,
  ShoppingCart,
  Receipt,
  DollarSign,
  Package,
  MapPin,
  ArrowLeft,
  Filter,
  Search,
} from 'lucide-react';
import Link from 'next/link';

export default async function HistoryPage() {
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

  // Simulated transaction history - will be replaced with real data
  const todayTransactions = [
    {
      id: 1,
      type: 'sale',
      customer: 'María González',
      products: '2x Cilindro 33lb',
      amount: 300,
      payment: 'Efectivo',
      time: '14:30',
      location: 'Zona Norte',
      status: 'completed',
    },
    {
      id: 2,
      type: 'sale',
      customer: 'Carlos Ruiz',
      products: '1x Cilindro 40lb',
      amount: 250,
      payment: 'Tarjeta',
      time: '13:15',
      location: 'Zona Centro',
      status: 'completed',
    },
    {
      id: 3,
      type: 'expense',
      category: 'Comida',
      description: 'Almuerzo',
      amount: 45,
      time: '12:00',
      location: 'Restaurante El Buen Sabor',
      status: 'pending',
    },
    {
      id: 4,
      type: 'sale',
      customer: 'Ana Martínez',
      products: '3x Cilindro 33lb',
      amount: 450,
      payment: 'Efectivo',
      time: '11:45',
      location: 'Zona Sur',
      status: 'completed',
    },
    {
      id: 5,
      type: 'expense',
      category: 'Transporte',
      description: 'Taxi',
      amount: 25,
      time: '10:30',
      location: 'Zona Norte',
      status: 'completed',
    },
  ];

  const getTransactionIcon = (type: string) => {
    return type === 'sale' ? ShoppingCart : Receipt;
  };

  const getTransactionColor = (type: string) => {
    return type === 'sale' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return (
        <Badge className="bg-green-100 text-green-800 text-xs">
          Completado
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="text-yellow-600 border-yellow-600 text-xs"
      >
        Pendiente
      </Badge>
    );
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
              <Clock className="h-5 w-5 text-blue-600" />
              Historial del Día
            </h1>
            <p className="text-sm text-muted-foreground">
              Transacciones realizadas hoy
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ventas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-700">$1,000</div>
              <p className="text-xs text-green-600">3 transacciones</p>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800 flex items-center">
                <Receipt className="h-4 w-4 mr-2" />
                Gastos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-red-700">$70</div>
              <p className="text-xs text-red-600">2 transacciones</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4 text-purple-600" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">
            Transacciones de Hoy
          </h2>

          {todayTransactions.map((transaction) => {
            const Icon = getTransactionIcon(transaction.type);
            const iconColor = getTransactionColor(transaction.type);

            return (
              <Card
                key={transaction.id}
                className="border-l-4 border-l-blue-500"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Icon className={`h-5 w-5 ${iconColor}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">
                          {transaction.type === 'sale'
                            ? `Venta - ${transaction.customer}`
                            : `Gasto - ${transaction.category}`}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {transaction.time} • {transaction.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold text-sm ${iconColor}`}>
                        ${transaction.amount}
                      </div>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {transaction.type === 'sale' ? (
                      <>
                        <div className="flex items-center gap-2 text-xs">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          <span>{transaction.products}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span>Pago: {transaction.payment}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-xs">
                        <Receipt className="h-3 w-3 text-muted-foreground" />
                        <span>{transaction.description}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Load More */}
        <div className="text-center py-4">
          <Button variant="outline" size="sm">
            Cargar más transacciones
          </Button>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/vendor/sales" className="block">
              <Button className="w-full justify-start h-12" size="lg">
                <ShoppingCart className="mr-3 h-4 w-4" />
                <div className="text-left">
                  <div className="text-sm">Nueva Venta</div>
                  <div className="text-xs opacity-70">
                    Registrar transacción
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard/vendor/expenses" className="block">
              <Button
                variant="outline"
                className="w-full justify-start h-12"
                size="lg"
              >
                <Receipt className="mr-3 h-4 w-4" />
                <div className="text-left">
                  <div className="text-sm">Nuevo Gasto</div>
                  <div className="text-xs opacity-70">Registrar gasto</div>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
}
