'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { expenseSchema } from '@/lib/validations';
import { createExpense } from '@/actions/transactions';
import { ExpenseFormData } from '@/types';
import { Receipt, DollarSign, FileText, AlertCircle } from 'lucide-react';

// Constantes para las opciones del formulario
const EXPENSE_TYPES = [
  {
    value: 'gasolina',
    label: 'Gasolina',
    description: 'Combustible para vehículo',
    icon: '⛽',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
  {
    value: 'comida',
    label: 'Comida',
    description: 'Alimentación durante el trabajo',
    icon: '🍽️',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  {
    value: 'reparaciones',
    label: 'Reparaciones',
    description: 'Mantenimiento de vehículo o equipo',
    icon: '🔧',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    value: 'imprevistos',
    label: 'Imprevistos',
    description: 'Gastos no planificados',
    icon: '⚠️',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  {
    value: 'otros',
    label: 'Otros',
    description: 'Otros gastos operativos',
    icon: '📋',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
] as const;

interface ExpenseFormProps {
  onSuccess?: () => void;
}

export function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      type: 'gasolina',
      amount: 0,
      description: '',
      receipt_url: '',
    },
  });

  const selectedExpenseType = form.watch('type');

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);

    try {
      const result = await createExpense(data);

      if (result.success) {
        const expenseType = EXPENSE_TYPES.find((t) => t.value === data.type);
        toast.success('Gasto registrado exitosamente', {
          description: `Se registró el gasto de ${
            expenseType?.label
          } por $${data.amount.toFixed(2)}`,
        });

        form.reset();
        onSuccess?.();
        router.refresh();
      } else {
        toast.error('Error al registrar el gasto', {
          description: result.error || 'Ocurrió un error inesperado',
        });
      }
    } catch (error) {
      console.error('Error submitting expense:', error);
      toast.error('Error al registrar el gasto', {
        description: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Receipt className="h-5 w-5 text-red-600" />
          Nuevo Gasto
        </CardTitle>
        <CardDescription>
          Registra un gasto operativo para tu trabajo
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información del Gasto */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-4 w-4 text-red-600" />
                <h3 className="font-medium text-sm text-gray-900">
                  Información del Gasto
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Gasto *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Selecciona el tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EXPENSE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <span>{type.icon}</span>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {type.label}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {type.description}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto del Gasto *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción del Gasto *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe el gasto realizado..."
                        {...field}
                        className="text-sm min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Comprobante (Opcional) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-blue-600" />
                <h3 className="font-medium text-sm text-gray-900">
                  Comprobante (Opcional)
                </h3>
              </div>

              <FormField
                control={form.control}
                name="receipt_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del Recibo</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://ejemplo.com/recibo.jpg"
                        {...field}
                        className="text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500">
                      Puedes subir una foto del recibo a WhatsApp y pegar el
                      enlace aquí
                    </p>
                  </FormItem>
                )}
              />
            </div>

            {/* Información de Estado */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Estado del Gasto</p>
                  <p>
                    Todos los gastos requieren aprobación del jefe antes de ser
                    considerados en los reportes financieros.
                  </p>
                </div>
              </div>
            </div>

            {/* Resumen del Gasto */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm text-gray-900">
                Resumen del Gasto
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Tipo:</span>
                  <Badge
                    className={
                      EXPENSE_TYPES.find((t) => t.value === selectedExpenseType)
                        ?.color
                    }
                  >
                    {
                      EXPENSE_TYPES.find((t) => t.value === selectedExpenseType)
                        ?.icon
                    }{' '}
                    {
                      EXPENSE_TYPES.find((t) => t.value === selectedExpenseType)
                        ?.label
                    }
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Monto:</span>
                  <span className="font-medium text-red-600">
                    ${form.watch('amount').toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estado:</span>
                  <Badge
                    variant="outline"
                    className="text-yellow-600 border-yellow-600"
                  >
                    Pendiente de Aprobación
                  </Badge>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registrando...
                  </>
                ) : (
                  <>
                    <Receipt className="h-4 w-4 mr-2" />
                    Registrar Gasto
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isSubmitting}
                className="px-6"
              >
                Limpiar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
