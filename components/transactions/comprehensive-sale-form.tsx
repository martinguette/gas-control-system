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
import { SaleFormData, SaleItem, Customer } from '@/types';
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
  RefreshCw,
  Edit3,
  Save,
  X,
  AlertTriangle,
  Info,
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

interface ComprehensiveSaleFormProps {
  onSuccess?: () => void;
}

export function ComprehensiveSaleForm({
  onSuccess,
}: ComprehensiveSaleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [editingPrices, setEditingPrices] = useState<Record<number, boolean>>(
    {}
  );
  const [customPrices, setCustomPrices] = useState<
    Record<number, Record<string, number>>
  >({});
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

  // Cargar precios por defecto cuando cambian los precios del inventario
  useEffect(() => {
    if (inventoryPrices && !selectedCustomer) {
      items.forEach((_, index) => {
        const productType = form.getValues(`items.${index}.product_type`);
        const defaultPrice = inventoryPrices[productType] || 0;
        form.setValue(`items.${index}.unit_cost`, defaultPrice);
        const quantity = form.getValues(`items.${index}.quantity`);
        form.setValue(`items.${index}.total_cost`, defaultPrice * quantity);
      });
    }
  }, [inventoryPrices, selectedCustomer, items, form]);

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

    // Mostrar notificación si el cliente tiene precios personalizados
    if (Object.keys(customer.custom_prices).length > 0) {
      toast.success(
        `Cliente seleccionado con precios personalizados aplicados`
      );
    }
  };

  // Crear nuevo cliente
  const handleNewCustomer = () => {
    setSelectedCustomer(null);
    setIsNewCustomer(true);
    form.setValue('customer_name', '');
    form.setValue('customer_phone', '');
    form.setValue('customer_location', '');
  };

  // Manejar cambio de tipo de producto
  const handleProductTypeChange = (index: number, productType: string) => {
    const price =
      selectedCustomer?.custom_prices[productType] ||
      inventoryPrices[productType] ||
      0;
    form.setValue(`items.${index}.unit_cost`, price);
    const quantity = form.getValues(`items.${index}.quantity`);
    form.setValue(`items.${index}.total_cost`, price * quantity);

    // Mostrar notificación si se aplicó precio personalizado
    if (selectedCustomer?.custom_prices[productType]) {
      toast.info(
        `Precio personalizado aplicado: $${price} para ${productType}`
      );
    }
  };

  // Manejar cambio de cantidad
  const handleQuantityChange = (index: number, quantity: number) => {
    const unitCost = form.getValues(`items.${index}.unit_cost`);
    form.setValue(`items.${index}.total_cost`, unitCost * quantity);
  };

  // Manejar cambio de precio unitario
  const handleUnitCostChange = (index: number, unitCost: number) => {
    const quantity = form.getValues(`items.${index}.quantity`);
    form.setValue(`items.${index}.total_cost`, unitCost * quantity);
  };

  // Agregar nuevo item
  const addItem = () => {
    const defaultPrice =
      selectedCustomer?.custom_prices['33lb'] || inventoryPrices['33lb'] || 0;
    append({
      product_type: '33lb',
      quantity: 1,
      unit_cost: defaultPrice,
      total_cost: defaultPrice,
    });
  };

  // Eliminar item
  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Toggle edición de precios
  const togglePriceEdit = (index: number) => {
    setEditingPrices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Guardar precio personalizado
  const saveCustomPrice = (
    index: number,
    productType: string,
    price: number
  ) => {
    setCustomPrices((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [productType]: price,
      },
    }));
    setEditingPrices((prev) => ({
      ...prev,
      [index]: false,
    }));
  };

  // Obtener precio para mostrar
  const getDisplayPrice = (index: number, productType: string) => {
    if (editingPrices[index]) {
      return (
        customPrices[index]?.[productType] || inventoryPrices[productType] || 0
      );
    }

    if (selectedCustomer?.custom_prices[productType]) {
      return selectedCustomer.custom_prices[productType];
    }

    return inventoryPrices[productType] || 0;
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

        // Recopilar precios personalizados de los items
        const customPrices: Record<string, number> = {};
        data.items.forEach((item) => {
          const standardPrice = inventoryPrices[item.product_type] || 0;
          if (item.unit_cost !== standardPrice && item.unit_cost > 0) {
            customPrices[item.product_type] = item.unit_cost;
          }
        });

        console.log('💰 Precios personalizados recopilados:', customPrices);

        const createCustomerResponse = await fetch('/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.customer_name,
            phone: data.customer_phone,
            location: data.customer_location,
            custom_prices: customPrices,
          }),
        });

        if (createCustomerResponse.ok) {
          const createResult = await createCustomerResponse.json();
          if (createResult.success) {
            console.log('✅ Cliente creado exitosamente');
            customerId = createResult.data.id;

            // Mostrar notificación con precios personalizados
            const customPricesCount = Object.keys(customPrices).length;
            if (customPricesCount > 0) {
              toast.success(
                `Cliente creado con ${customPricesCount} precio(s) personalizado(s)`
              );
            } else {
              toast.success('Cliente creado exitosamente');
            }
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar la venta');
      }

      const result = await response.json();
      console.log('✅ Venta creada exitosamente:', result);

      toast.success('Venta registrada exitosamente');
      form.reset();
      setSelectedCustomer(null);
      setIsNewCustomer(false);
      onSuccess?.();
    } catch (error) {
      console.error('❌ Error al procesar venta:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al procesar la venta'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Estado de conexión */}
      <ConnectionStatus />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Información del Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Información del Cliente
              </CardTitle>
              <CardDescription>
                Selecciona un cliente existente o crea uno nuevo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selector de cliente */}
              {!isNewCustomer && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cliente</label>
                  <OptimizedCustomerSelector
                    name="customer_name"
                    label="Cliente"
                    onCustomerSelect={handleCustomerSelect}
                    selectedCustomer={selectedCustomer}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleNewCustomer}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Nuevo Cliente
                  </Button>
                </div>
              )}

              {/* Formulario de nuevo cliente */}
              {isNewCustomer && (
                <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-blue-900">Nuevo Cliente</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsNewCustomer(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name="customer_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Cliente *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nombre completo del cliente"
                            {...field}
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
                            placeholder="Número de teléfono (opcional)"
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
                        <FormLabel>Ubicación *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Dirección o ubicación específica"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Información del cliente seleccionado */}
              {selectedCustomer && (
                <div className="p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">
                      {selectedCustomer.name}
                    </span>
                  </div>
                  {selectedCustomer.phone && (
                    <p className="text-sm text-green-700">
                      📞 {selectedCustomer.phone}
                    </p>
                  )}
                  <p className="text-sm text-green-700">
                    📍 {selectedCustomer.location}
                  </p>
                  {Object.keys(selectedCustomer.custom_prices).length > 0 && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        Precios personalizados
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Productos y Precios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Productos y Precios
              </CardTitle>
              <CardDescription>
                Agrega los productos que se van a vender
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Producto {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tipo de producto */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.product_type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Cilindro *</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleProductTypeChange(index, value);
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CYLINDER_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
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
                          <FormLabel>Cantidad *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              {...field}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 1;
                                field.onChange(value);
                                handleQuantityChange(index, value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Precio unitario */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel>Precio Unitario *</FormLabel>
                      <div className="flex items-center gap-2">
                        {selectedCustomer?.custom_prices[
                          form.getValues(`items.${index}.product_type`)
                        ] && (
                          <Badge variant="secondary" className="text-xs">
                            Precio personalizado
                          </Badge>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePriceEdit(index)}
                        >
                          {editingPrices[index] ? (
                            <Save className="h-4 w-4" />
                          ) : (
                            <Edit3 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {editingPrices[index] ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={
                            customPrices[index]?.[
                              form.getValues(`items.${index}.product_type`)
                            ] || ''
                          }
                          onChange={(e) => {
                            const price = parseFloat(e.target.value) || 0;
                            const productType = form.getValues(
                              `items.${index}.product_type`
                            );
                            setCustomPrices((prev) => ({
                              ...prev,
                              [index]: {
                                ...prev[index],
                                [productType]: price,
                              },
                            }));
                          }}
                          placeholder="Precio personalizado"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const productType = form.getValues(
                              `items.${index}.product_type`
                            );
                            const price =
                              customPrices[index]?.[productType] || 0;
                            form.setValue(`items.${index}.unit_cost`, price);
                            handleUnitCostChange(index, price);
                            setEditingPrices((prev) => ({
                              ...prev,
                              [index]: false,
                            }));
                          }}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setEditingPrices((prev) => ({
                              ...prev,
                              [index]: false,
                            }))
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <FormField
                        control={form.control}
                        name={`items.${index}.unit_cost`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...field}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  field.onChange(value);
                                  handleUnitCostChange(index, value);
                                }}
                                className={
                                  selectedCustomer?.custom_prices[
                                    form.getValues(
                                      `items.${index}.product_type`
                                    )
                                  ]
                                    ? 'bg-green-50 border-green-200'
                                    : ''
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Información de precio */}
                    <div className="text-xs text-muted-foreground">
                      {selectedCustomer?.custom_prices[
                        form.getValues(`items.${index}.product_type`)
                      ] ? (
                        <span className="text-green-600">
                          💰 Precio personalizado para este cliente
                        </span>
                      ) : (
                        <span>
                          💰 Precio estándar: $
                          {inventoryPrices[
                            form.getValues(`items.${index}.product_type`)
                          ] || 0}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Total del item */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total del Item:</span>
                      <span className="text-lg font-bold text-green-600">
                        $
                        {form.getValues(`items.${index}.total_cost`).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Botón para agregar más productos */}
              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                className="w-full"
                disabled={fields.length >= 10}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Otro Producto
                {fields.length >= 10 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Máximo 10 productos)
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Tipo de Venta y Método de Pago */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-purple-600" />
                Detalles de la Venta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de venta */}
                <FormField
                  control={form.control}
                  name="sale_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Venta *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SALE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <Badge className={type.color}>
                                  {type.label}
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

                {/* Método de pago */}
                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Pago *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
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

              {/* Información adicional según el tipo de venta */}
              {selectedSaleType === 'intercambio' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      Intercambio
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    El cliente entregará un cilindro vacío a cambio del cilindro
                    lleno. Asegúrate de registrar la marca y color del cilindro
                    vacío recibido.
                  </p>
                </div>
              )}

              {selectedSaleType === 'completa' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">
                      Venta Completa
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    El cliente solo recibe el cilindro lleno sin entregar nada a
                    cambio.
                  </p>
                </div>
              )}

              {selectedSaleType === 'venta_vacios' && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-900">
                      Venta de Vacíos
                    </span>
                  </div>
                  <p className="text-sm text-orange-700">
                    Se venden cilindros vacíos al cliente. No se entregan
                    cilindros llenos.
                  </p>
                </div>
              )}

              {selectedSaleType === 'compra_vacios' && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-purple-900">
                      Compra de Vacíos
                    </span>
                  </div>
                  <p className="text-sm text-purple-700">
                    Se compran cilindros vacíos del cliente. No se entregan
                    cilindros llenos.
                  </p>
                </div>
              )}

              {/* Alerta para transferencias */}
              {form.watch('payment_method') === 'transferencia' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-900">
                      Transferencia Bancaria
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Recuerda enviar el comprobante de transferencia al jefe por
                    WhatsApp inmediatamente después de confirmar la venta.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumen Total */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Resumen de la Venta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm">
                      {
                        CYLINDER_TYPES.find(
                          (t) => t.value === item.product_type
                        )?.label
                      }{' '}
                      x {item.quantity}
                    </span>
                    <span className="font-medium">
                      ${item.total_cost.toFixed(2)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total a Cobrar:</span>
                  <span className="text-green-600">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isOnline}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Registrar Venta
                </>
              )}
            </Button>
          </div>

          {/* Estado offline */}
          {!isOnline && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <WifiOff className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-900">
                  Modo Offline
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                La venta se guardará localmente y se sincronizará cuando se
                restablezca la conexión.
              </p>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
