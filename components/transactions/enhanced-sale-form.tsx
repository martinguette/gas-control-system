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
import { EnhancedCustomerSelector } from '@/components/ui/enhanced-customer-selector';
import { ConnectionStatus } from '@/components/ui/connection-status';
import { saleSchema, saleItemSchema } from '@/lib/validations';
import { SaleFormData, SaleItem } from '@/types';
import { useInventoryPrices } from '@/hooks/use-inventory-prices';
import { useOfflineManager } from '@/hooks/use-offline-manager';
import {
  ShoppingCart,
  Package,
  DollarSign,
  User,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
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

interface EnhancedSaleFormProps {
  onSuccess?: () => void;
}

export function EnhancedSaleForm({ onSuccess }: EnhancedSaleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const router = useRouter();

  // Hooks para funcionalidad offline
  const { isOnline, addPendingSale, pendingSales, syncPendingSales } =
    useOfflineManager();

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
    setIsNewCustomer(false);

    // Cargar datos del cliente en el formulario
    form.setValue('customer_name', customer.name);
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

    toast.success(`Cliente seleccionado: ${customer.name}`);
  };

  // Crear nuevo cliente
  const handleNewCustomer = () => {
    setSelectedCustomer(null);
    setIsNewCustomer(true);
    form.setValue('customer_name', '');
    form.setValue('customer_phone', '');
    form.setValue('customer_location', '');
    toast.info('Modo: Nuevo cliente');
  };

  // Manejar cambio de tipo de producto
  const handleProductTypeChange = (index: number, productType: string) => {
    const inventoryPrice =
      inventoryPrices[productType as keyof typeof inventoryPrices];
    const customPrice = selectedCustomer?.custom_prices[productType];

    const price = customPrice || inventoryPrice || 0;
    const quantity = form.getValues(`items.${index}.quantity`);

    form.setValue(`items.${index}.unit_cost`, price);
    form.setValue(`items.${index}.total_cost`, price * quantity);
  };

  const onSubmit = async (data: SaleFormData) => {
    setIsSubmitting(true);

    try {
      console.log('📝 Enviando venta:', data);

      if (!isOnline) {
        // Modo offline: guardar localmente
        const pendingId = addPendingSale(data);
        toast.success(
          'Venta guardada localmente. Se sincronizará cuando haya conexión.'
        );

        form.reset();
        setSelectedCustomer(null);
        setIsNewCustomer(false);
        onSuccess?.();
        return;
      }

      // Modo online: enviar al servidor
      let customerId = selectedCustomer?.id;

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
            customerId = createResult.data.id;
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
        body: JSON.stringify({
          ...data,
          customer_id: customerId,
        }),
      });

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
        setIsNewCustomer(false);
        onSuccess?.();
        router.refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Error al registrar venta:', error);
      toast.error('Error al registrar la venta', {
        description:
          error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con estado de conexión */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                Nueva Venta
              </CardTitle>
              <CardDescription>
                Registra una nueva transacción de venta
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <ConnectionStatus />
              {pendingSales.length > 0 && (
                <Badge variant="outline" className="text-orange-600">
                  <Clock className="h-3 w-3 mr-1" />
                  {pendingSales.length} pendiente
                  {pendingSales.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Selección de Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <EnhancedCustomerSelector
                name="customer_name"
                label="Cliente"
                required
                onCustomerSelect={handleCustomerSelect}
                onNewCustomer={handleNewCustomer}
                showCustomerDetails={true}
              />

              {/* Campos de cliente (solo para nuevos clientes o cuando no hay selección) */}
              {(isNewCustomer || !selectedCustomer) && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">
                    {isNewCustomer
                      ? 'Datos del nuevo cliente'
                      : 'Datos del cliente'}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customer_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            Teléfono
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Número de teléfono"
                              {...field}
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
                          <FormLabel className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Ubicación *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Dirección o ubicación"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Información del cliente seleccionado */}
              {selectedCustomer && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Cliente seleccionado</span>
                  </div>
                  <div className="mt-2 text-sm text-green-700">
                    <div>📞 {selectedCustomer.phone || 'Sin teléfono'}</div>
                    <div>📍 {selectedCustomer.location}</div>
                    {Object.keys(selectedCustomer.custom_prices).length > 0 && (
                      <div className="text-xs text-green-600 mt-1">
                        ✅ Precios personalizados disponibles
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Productos y Detalles de Venta */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-600" />
                Productos y Detalles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tipo de Venta */}
              <FormField
                control={form.control}
                name="sale_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Venta</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo de venta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SALE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Badge className={type.color}>{type.label}</Badge>
                              <span className="text-sm text-muted-foreground">
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

              {/* Items de la venta */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Productos</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        product_type: '33lb',
                        quantity: 1,
                        unit_cost: 0,
                        total_cost: 0,
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Tipo de Producto */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.product_type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleProductTypeChange(index, value);
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CYLINDER_TYPES.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Cantidad */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => {
                                  const quantity =
                                    parseInt(e.target.value) || 1;
                                  field.onChange(quantity);
                                  const unitCost = form.getValues(
                                    `items.${index}.unit_cost`
                                  );
                                  form.setValue(
                                    `items.${index}.total_cost`,
                                    unitCost * quantity
                                  );
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Precio Unitario */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.unit_cost`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio Unitario</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...field}
                                onChange={(e) => {
                                  const unitCost =
                                    parseFloat(e.target.value) || 0;
                                  field.onChange(unitCost);
                                  const quantity = form.getValues(
                                    `items.${index}.quantity`
                                  );
                                  form.setValue(
                                    `items.${index}.total_cost`,
                                    unitCost * quantity
                                  );
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Total y Botón Eliminar */}
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <FormField
                            control={form.control}
                            name={`items.${index}.total_cost`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Total</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...field}
                                    readOnly
                                    className="bg-gray-50"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                            className="h-10 w-10 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Método de Pago */}
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pago</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el método de pago" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            <div className="flex items-center gap-2">
                              <span>{method.icon}</span>
                              {method.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Total */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-blue-800">
                    Total de la Venta:
                  </span>
                  <span className="text-xl font-bold text-blue-900">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {isOnline ? 'Registrando...' : 'Guardando...'}
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  {isOnline ? 'Registrar Venta' : 'Guardar Localmente'}
                </>
              )}
            </Button>

            {!isOnline && pendingSales.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={syncPendingSales}
                className="flex items-center gap-2"
              >
                <Wifi className="h-4 w-4" />
                Sincronizar ({pendingSales.length})
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
