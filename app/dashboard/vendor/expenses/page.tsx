'use client';

import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import VendorLayout from '@/components/layout/vendor-layout';
import { ExpenseForm } from '@/components/transactions/expense-form';
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
  Receipt,
  ArrowLeft,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { getVendorExpenses } from '@/actions/transactions';

interface Expense {
  id: string;
  type: string;
  amount: number;
  description: string;
  receipt_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
}

export default function ExpensesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        redirect('/log-in');
        return;
      }

      // Verificar que el usuario es vendedor
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !userData || userData.role !== 'vendedor') {
        redirect(
          '/log-in?message=Acceso denegado. Solo vendedores pueden acceder a esta página.'
        );
        return;
      }

      setIsAuthenticated(true);
      loadExpenses();
    } catch (error) {
      console.error('Error checking auth:', error);
      redirect('/log-in');
    } finally {
      setIsLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      const result = await getVendorExpenses(20);
      if (result.success) {
        setExpenses(result.data);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const handleExpenseSuccess = () => {
    setShowForm(false);
    loadExpenses(); // Recargar gastos
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Aprobado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rechazado</Badge>;
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'gasolina':
        return '⛽';
      case 'comida':
        return '🍽️';
      case 'reparaciones':
        return '🔧';
      case 'imprevistos':
        return '⚠️';
      default:
        return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </VendorLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
              <Receipt className="h-5 w-5 text-red-600" />
              Gastos
            </h1>
            <p className="text-sm text-muted-foreground">
              Registra gastos operativos y consulta el historial
            </p>
          </div>
        </div>

        {/* Resumen de Gastos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800">
                Total Gastos
              </CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">
                $
                {expenses
                  .reduce((sum, expense) => sum + expense.amount, 0)
                  .toFixed(2)}
              </div>
              <p className="text-xs text-red-600">
                {expenses.length} gastos registrados
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">
                Pendientes
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">
                {expenses.filter((e) => e.status === 'pending').length}
              </div>
              <p className="text-xs text-yellow-600">Esperando aprobación</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">
                Aprobados
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {expenses.filter((e) => e.status === 'approved').length}
              </div>
              <p className="text-xs text-green-600">Gastos aprobados</p>
            </CardContent>
          </Card>
        </div>

        {/* Botón para Nuevo Gasto */}
        {!showForm && (
          <div className="flex justify-center">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
            >
              <Receipt className="mr-2 h-5 w-5" />
              Nuevo Gasto
            </Button>
          </div>
        )}

        {/* Formulario de Gasto */}
        {showForm && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Registrar Nuevo Gasto</h2>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="text-sm"
              >
                Cancelar
              </Button>
            </div>
            <ExpenseForm onSuccess={handleExpenseSuccess} />
          </div>
        )}

        {/* Historial de Gastos */}
        {expenses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Historial de Gastos
              </CardTitle>
              <CardDescription>Últimos gastos registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {getTypeIcon(expense.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium capitalize">
                            {expense.type.replace('_', ' ')}
                          </h4>
                          {getStatusIcon(expense.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {expense.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(expense.created_at)}
                        </p>
                        {expense.rejection_reason && (
                          <p className="text-xs text-red-600 mt-1">
                            Motivo: {expense.rejection_reason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-lg">
                        ${expense.amount.toFixed(2)}
                      </div>
                      {getStatusBadge(expense.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mensaje si no hay gastos */}
        {expenses.length === 0 && !showForm && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay gastos registrados
              </h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                Registra tu primer gasto operativo para comenzar a llevar el
                control
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Receipt className="mr-2 h-4 w-4" />
                Registrar Primer Gasto
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </VendorLayout>
  );
}
