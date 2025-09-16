'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
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
import { saleSchema } from '@/lib/validations';
import { createSale } from '@/actions/transactions';
import { SaleFormData } from '@/types';
import {
  ShoppingCart,
  Package,
  DollarSign,
  MapPin,
  User,
  Phone,
  CreditCard,
} from 'lucide-react';

// Constantes para las opciones del formulario
const CYLINDER_TYPES = [
  { value: '33lb', label: '15kg (33lb)', weight: 15 },
  { value: '40lb', label: '18kg (40lb)', weight: 18 },
  { value: '100lb', label: '45kg (100lb)', weight: 45 },
] as const;

const SALE_TYPES = [
  {
    value: 'intercambio',
    label: 'Intercambio',
    description: 'Entrega cilindro lleno, recibe cilindro vacío',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    value: 'completa',
    label: 'Venta Completa',
    description: 'Solo entrega cilindro lleno',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  {
    value: 'venta_vacios',
    label: 'Venta de Vacíos',
    description: 'Vende cilindros vacíos al cliente',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  {
    value: 'compra_vacios',
    label: 'Compra de Vacíos',
    description: 'Compra cilindros vacíos del cliente',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
] as const;

const CYLINDER_BRANDS = [
  { value: 'Roscogas', label: 'Roscogas', color: 'Naranja' },
  { value: 'Gasan', label: 'Gasan', color: 'Azul' },
  { value: 'Gaspais', label: 'Gaspais', color: 'Verde Oscuro' },
  { value: 'Vidagas', label: 'Vidagas', color: 'Verde Claro' },
] as const;

const PAYMENT_METHODS = [
  { value: 'efectivo', label: 'Efectivo', icon: '💵' },
  { value: 'transferencia', label: 'Transferencia', icon: '🏦' },
  { value: 'credito', label: 'Crédito', icon: '📋' },
] as const;

interface SaleFormProps {
  onSuccess?: () => void;
}

export function SaleForm({ onSuccess }: SaleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customer_name: '',
      customer_phone: '',
      customer_location: '',
      product_type: '33lb',
      quantity: 1,
      sale_type: 'intercambio',
      amount_charged: 0,
      unit_cost: 0,
      payment_method: 'efectivo',
    },
  });

  const selectedSaleType = form.watch('sale_type');
  const selectedProductType = form.watch('product_type');
  const quantity = form.watch('quantity');
  const unitCost = form.watch('unit_cost');

  // Obtener el peso en kg del tipo seleccionado
  const selectedCylinder = CYLINDER_TYPES.find(
    (type) => type.value === selectedProductType
  );
  const weightInKg = selectedCylinder?.weight || 0;

  // Actualizar automáticamente el monto total cuando cambien cantidad o costo unitario
  useEffect(() => {
    const total = quantity * unitCost;
    form.setValue('amount_charged', total);
  }, [quantity, unitCost, form]);

  const onSubmit = async (data: SaleFormData) => {
    setIsSubmitting(true);

    try {
      const result = await createSale(data);

      if (result.success) {
        toast.success('Venta registrada exitosamente', {
          description: `Se registró la venta de ${
            selectedCylinder?.label
          } por $${data.amount_charged.toFixed(2)}`,
        });

        form.reset();
        onSuccess?.();
        router.refresh();
      } else {
        toast.error('Error al registrar la venta', {
          description: result.error || 'Ocurrió un error inesperado',
        });
      }
    } catch (error) {
      console.error('Error submitting sale:', error);
      toast.error('Error al registrar la venta', {
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
          <ShoppingCart className="h-5 w-5 text-green-600" />
          Nueva Venta
        </CardTitle>
        <CardDescription>
          Registra una nueva transacción de venta
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información del Cliente */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-blue-600" />
                <h3 className="font-medium text-sm text-gray-900">
                  Información del Cliente
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Cliente *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nombre completo"
                          {...field}
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Número de teléfono"
                          {...field}
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
                name="customer_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación del Cliente *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Dirección o ubicación"
                        {...field}
                        className="text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Información del Producto */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4 text-orange-600" />
                <h3 className="font-medium text-sm text-gray-900">
                  Información del Producto
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="product_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Cilindro *</FormLabel>
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
                          {CYLINDER_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center justify-between w-full">
                                <span>{type.label}</span>
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs"
                                >
                                  {type.weight}kg
                                </Badge>
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
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="1"
                          {...field}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 1;
                            field.onChange(newQuantity);
                            // Actualizar el monto total automáticamente
                            const currentUnitCost = form.getValues('unit_cost');
                            form.setValue(
                              'amount_charged',
                              newQuantity * currentUnitCost
                            );
                          }}
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sale_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Transacción *</FormLabel>
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
                          {SALE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {type.label}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {type.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Información de Pago */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-4 w-4 text-green-600" />
                <h3 className="font-medium text-sm text-gray-900">
                  Información de Pago
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="unit_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo Unitario *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            const unitCost = parseFloat(e.target.value) || 0;
                            field.onChange(unitCost);
                            // Actualizar el monto total automáticamente
                            const quantity = form.getValues('quantity');
                            form.setValue(
                              'amount_charged',
                              unitCost * quantity
                            );
                          }}
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount_charged"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto Total *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          className="text-sm bg-gray-50"
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Pago *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Selecciona el método" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PAYMENT_METHODS.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              <div className="flex items-center gap-2">
                                <span>{method.icon}</span>
                                <span>{method.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Resumen de la Transacción */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm text-gray-900">
                Resumen de la Transacción
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Producto:</span>
                  <span className="font-medium">
                    {selectedCylinder?.label} ({weightInKg}kg)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cantidad:</span>
                  <span className="font-medium">
                    {form.watch('quantity')} cilindros
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Costo Unitario:</span>
                  <span className="font-medium">
                    ${form.watch('unit_cost').toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tipo:</span>
                  <Badge
                    className={
                      SALE_TYPES.find((t) => t.value === selectedSaleType)
                        ?.color
                    }
                  >
                    {
                      SALE_TYPES.find((t) => t.value === selectedSaleType)
                        ?.label
                    }
                  </Badge>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-green-600 text-base">
                    ${form.watch('amount_charged').toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registrando...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Registrar Venta
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
