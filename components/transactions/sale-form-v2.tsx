'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { OptimizedCustomerSelector } from '@/components/ui/optimized-customer-selector';
import { ConnectionStatus } from '@/components/ui/connection-status';
import { saleSchema, saleItemSchema } from '@/lib/validations';
import { SaleFormData, SaleItem } from '@/types';
import { useInventoryPrices } from '@/hooks/use-inventory-prices';
import {
  ShoppingCart,
  Package,
  DollarSign,
  User,
  Phone,
  MapPin,
  Plus,
  Trash2,
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

const PAYMENT_METHODS = [
  { value: 'efectivo', label: 'Efectivo', icon: '💵' },
  { value: 'transferencia', label: 'Transferencia', icon: '🏦' },
  { value: 'credito', label: 'Crédito', icon: '📋' },
] as const;

interface Customer {
  id: string;
  name: string;
  phone?: string;
  location: string;
  custom_prices: Record<string, number>;
}

interface SaleFormProps {
  onSuccess?: () => void;
}

export function SaleFormV2({ onSuccess }: SaleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const router = useRouter();

  // Hook para obtener precios del inventario
  const { prices: inventoryPrices, isLoading: pricesLoading } =
    useInventoryPrices();

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customer_name: '',
      customer_phone: '',
      customer_location: '',
      items: [
        {
          product_type: '33lb',
          quantity: 1,
          unit_cost: 0,
          total_cost: 0,
        },
      ],
      sale_type: 'intercambio',
      payment_method: 'efectivo',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const selectedSaleType = form.watch('sale_type');
  const items = form.watch('items');

  // Calcular monto total
  const totalAmount = items.reduce((sum, item) => sum + item.total_cost, 0);

  // Seleccionar cliente existente
  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);

    // Cargar datos del cliente en el formulario
    form.setValue('customer_name', customer.name); // Usar el nombre del cliente
    form.setValue('customer_phone', customer.phone || '');
    form.setValue('customer_location', customer.location || '');

    // Aplicar precios personalizados a los items existentes
    items.forEach((_, index) => {
      const productType = form.getValues(`items.${index}.product_type`);
      const customPrice = customer.custom_prices[productType];
      if (customPrice) {
        form.setValue(`items.${index}.unit_cost`, customPrice);
        const quantity = form.getValues(`items.${index}.quantity`);
        form.setValue(`items.${index}.total_cost`, customPrice * quantity);
      }
    });
  };

  // Crear nuevo cliente
  const handleNewCustomer = () => {
    setSelectedCustomer(null);
    // Limpiar campos del formulario para nuevo cliente
    form.setValue('customer_phone', '');
    form.setValue('customer_location', '');
  };

  // Agregar nuevo item
  const addItem = () => {
    const newItem = {
      product_type: '33lb' as const,
      quantity: 1,
      unit_cost: 0,
      total_cost: 0,
    };

    // Si hay un cliente seleccionado, aplicar precio personalizado si existe
    if (selectedCustomer && selectedCustomer.custom_prices['33lb']) {
      newItem.unit_cost = selectedCustomer.custom_prices['33lb'];
      newItem.total_cost = newItem.quantity * newItem.unit_cost;
    } else {
      // Usar precio base del inventario
      const basePrice = inventoryPrices['33lb'] || 0;
      if (basePrice > 0) {
        newItem.unit_cost = basePrice;
        newItem.total_cost = newItem.quantity * newItem.unit_cost;
      }
    }

    append(newItem);
  };

  // Actualizar total de item
  const updateItemTotal = (index: number) => {
    const quantity = form.getValues(`items.${index}.quantity`);
    const unitCost = form.getValues(`items.${index}.unit_cost`);
    const totalCost = quantity * unitCost;
    form.setValue(`items.${index}.total_cost`, totalCost);
  };

  // Aplicar precio personalizado cuando cambia el tipo de producto
  const handleProductTypeChange = (
    index: number,
    productType: '33lb' | '40lb' | '100lb'
  ) => {
    form.setValue(`items.${index}.product_type`, productType);

    // Si hay un cliente seleccionado, aplicar precio personalizado si existe
    if (selectedCustomer && selectedCustomer.custom_prices[productType]) {
      const customPrice = selectedCustomer.custom_prices[productType];
      form.setValue(`items.${index}.unit_cost`, customPrice);
      const quantity = form.getValues(`items.${index}.quantity`);
      form.setValue(`items.${index}.total_cost`, customPrice * quantity);
    } else {
      // Si no hay precio personalizado, usar precio base del inventario
      const basePrice = inventoryPrices[productType] || 0;
      if (basePrice > 0) {
        form.setValue(`items.${index}.unit_cost`, basePrice);
        const quantity = form.getValues(`items.${index}.quantity`);
        form.setValue(`items.${index}.total_cost`, basePrice * quantity);
      }
    }
  };

  const onSubmit = async (data: SaleFormData) => {
    setIsSubmitting(true);

    try {
      console.log('🛒 Enviando datos de venta:', JSON.stringify(data, null, 2));

      // Si hay un cliente seleccionado, actualizar sus datos si han cambiado
      if (
        selectedCustomer &&
        data.customer_name &&
        data.customer_name === selectedCustomer.name
      ) {
        // Capturar precios personalizados desde los items del formulario
        const currentCustomPrices: Record<string, number> = {};
        data.items.forEach((item) => {
          if (item.unit_cost && item.unit_cost > 0) {
            currentCustomPrices[item.product_type] = item.unit_cost;
          }
        });

        const customerDataChanged =
          selectedCustomer.phone !== data.customer_phone ||
          selectedCustomer.location !== data.customer_location ||
          JSON.stringify(selectedCustomer.custom_prices) !==
            JSON.stringify(currentCustomPrices);

        if (customerDataChanged) {
          console.log('📝 Actualizando datos del cliente...');

          const updateResponse = await fetch('/api/customers', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: selectedCustomer.id,
              name: selectedCustomer.name,
              phone: data.customer_phone,
              location: data.customer_location,
              custom_prices: currentCustomPrices,
            }),
          });

          if (updateResponse.ok) {
            const updateResult = await updateResponse.json();
            if (updateResult.success) {
              console.log('✅ Cliente actualizado exitosamente');
              toast.success('Datos del cliente actualizados');
            }
          }
        }
      }

      // Si no hay cliente seleccionado pero hay nombre, crear nuevo cliente
      if (!selectedCustomer && data.customer_name) {
        console.log('👤 Creando nuevo cliente...');
        const createCustomerResponse = await fetch('/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.customer_name,
            phone: data.customer_phone,
            location: data.customer_location,
            custom_prices: {},
          }),
        });

        if (createCustomerResponse.ok) {
          const createResult = await createCustomerResponse.json();
          if (createResult.success) {
            console.log('✅ Cliente creado exitosamente');
            toast.success('Cliente creado exitosamente');
          }
        }
      }

      // Llamada a la API para crear la venta
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('📡 Response status:', response.status);
      console.log(
        '📡 Response headers:',
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(
          `Error al registrar la venta: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      if (result.success) {
        toast.success('Venta registrada exitosamente', {
          description: `Se registró la venta por $${totalAmount.toFixed(2)}`,
        });

        form.reset();
        setSelectedCustomer(null);
        onSuccess?.();
        router.refresh();
      } else {
        throw new Error(result.error);
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="h-5 w-5 text-green-600" />
            Nueva Venta
          </CardTitle>
          <ConnectionStatus
            onRetry={() => {
              // Recargar precios y clientes
              window.location.reload();
            }}
          />
        </div>
        <CardDescription>
          Registra una nueva transacción de venta con múltiples tipos de
          cilindros
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Búsqueda de Cliente */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-blue-600" />
                <h3 className="font-medium text-sm text-gray-900">
                  Información del Cliente
                </h3>
              </div>

              <OptimizedCustomerSelector
                name="customer_name"
                label="Nombre del Cliente"
                required
                onCustomerSelect={handleCustomerSelect}
                onNewCustomer={handleNewCustomer}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <FormField
                  control={form.control}
                  name="customer_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación *</FormLabel>
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
            </div>

            <Separator />

            {/* Items de la Venta */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-orange-600" />
                  <h3 className="font-medium text-sm text-gray-900">
                    Cilindros a Vender
                  </h3>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Agregar Cilindro
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <FormField
                        control={form.control}
                        name={`items.${index}.product_type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Cilindro *</FormLabel>
                            <Select
                              onValueChange={(
                                value: '33lb' | '40lb' | '100lb'
                              ) => {
                                field.onChange(value);
                                handleProductTypeChange(index, value);
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="text-sm">
                                  <SelectValue placeholder="Selecciona el tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CYLINDER_TYPES.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
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
                        name={`items.${index}.quantity`}
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
                                  field.onChange(parseInt(e.target.value) || 1);
                                  updateItemTotal(index);
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
                        name={`items.${index}.unit_cost`}
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
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  );
                                  updateItemTotal(index);
                                }}
                                className="text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <FormLabel>Total</FormLabel>
                          <div className="h-10 px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 flex items-center">
                            $
                            {form.watch(`items.${index}.total_cost`).toFixed(2)}
                          </div>
                        </div>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                            className="h-10 w-10 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tipo de Transacción y Método de Pago */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <span className="font-medium">{type.label}</span>
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

            {/* Resumen de la Transacción */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm text-gray-900">
                Resumen de la Transacción
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                {items.map((item, index) => {
                  const cylinderType = CYLINDER_TYPES.find(
                    (type) => type.value === item.product_type
                  );
                  return (
                    <div key={index} className="flex justify-between">
                      <span>
                        {item.quantity}x {cylinderType?.label}
                      </span>
                      <span className="font-medium">
                        ${item.total_cost.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total a Cobrar:</span>
                  <span className="font-bold text-green-600 text-base">
                    ${totalAmount.toFixed(2)}
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
                onClick={() => {
                  form.reset();
                  setSelectedCustomer(null);
                }}
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
