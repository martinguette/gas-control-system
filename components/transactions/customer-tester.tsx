'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { customerSchema } from '@/lib/validations';
import { Customer } from '@/types';
import {
  User,
  Plus,
  CheckCircle,
  AlertTriangle,
  Info,
  Phone,
  MapPin,
  DollarSign,
} from 'lucide-react';

interface CustomerFormData {
  name: string;
  phone?: string;
  location: string;
  custom_prices: Record<string, number>;
}

interface CustomerTesterProps {
  onCustomerCreated?: (customer: Customer) => void;
}

export function CustomerTester({ onCustomerCreated }: CustomerTesterProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCustomers, setCreatedCustomers] = useState<Customer[]>([]);
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      location: '',
      custom_prices: {},
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);

    try {
      console.log('👤 Creando cliente:', data);
      console.log('💰 Precios personalizados:', customPrices);

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          custom_prices: customPrices,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear cliente');
      }

      const result = await response.json();
      console.log('✅ Cliente creado exitosamente:', result);

      if (result.success) {
        const newCustomer = result.data;
        setCreatedCustomers((prev) => [...prev, newCustomer]);

        // Mostrar notificación con precios personalizados
        const customPricesCount = Object.keys(customPrices).length;
        if (customPricesCount > 0) {
          toast.success(
            `Cliente creado con ${customPricesCount} precio(s) personalizado(s)`
          );
        } else {
          toast.success('Cliente creado exitosamente');
        }

        form.reset();
        setCustomPrices({});
        onCustomerCreated?.(newCustomer);
      }
    } catch (error) {
      console.error('❌ Error al crear cliente:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al crear cliente'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCustomPrice = (productType: string, price: number) => {
    setCustomPrices((prev) => ({
      ...prev,
      [productType]: price,
    }));
  };

  const removeCustomPrice = (productType: string) => {
    setCustomPrices((prev) => {
      const newPrices = { ...prev };
      delete newPrices[productType];
      return newPrices;
    });
  };

  const clearAllCustomers = () => {
    setCreatedCustomers([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Prueba de Creación de Clientes
        </CardTitle>
        <CardDescription>
          Crea clientes nuevos y configura precios personalizados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Información básica del cliente */}
            <div className="space-y-4">
              <h4 className="font-medium">Información Básica</h4>

              <FormField
                control={form.control}
                name="name"
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
                name="phone"
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
                name="location"
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

            {/* Precios personalizados */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Precios Personalizados</h4>
                <Badge variant="secondary" className="text-xs">
                  Opcional
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['33lb', '40lb', '100lb'].map((type) => (
                  <div key={type} className="space-y-2">
                    <label className="text-sm font-medium">
                      {type === '33lb'
                        ? '15kg (33lb)'
                        : type === '40lb'
                        ? '18kg (40lb)'
                        : '45kg (100lb)'}
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Precio personalizado"
                        value={customPrices[type] || ''}
                        onChange={(e) => {
                          const price = parseFloat(e.target.value) || 0;
                          if (price > 0) {
                            updateCustomPrice(type, price);
                          } else {
                            removeCustomPrice(type);
                          }
                        }}
                      />
                      {customPrices[type] && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeCustomPrice(type)}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                    {customPrices[type] && (
                      <div className="text-xs text-green-600">
                        💰 Precio personalizado: ${customPrices[type]}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {Object.keys(customPrices).length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Los precios personalizados se aplicarán automáticamente
                    cuando este cliente sea seleccionado en una venta.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Botón de envío */}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando Cliente...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Cliente
                </>
              )}
            </Button>
          </form>
        </Form>

        {/* Clientes creados */}
        {createdCustomers.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Clientes Creados en esta Sesión</h4>
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {createdCustomers.length} creados
                </Badge>
                <Button variant="outline" size="sm" onClick={clearAllCustomers}>
                  Limpiar
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {createdCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-4 border rounded-lg bg-green-50 border-green-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">
                      {customer.name}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-green-700">
                    {customer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {customer.location}
                    </div>
                    {Object.keys(customer.custom_prices).length > 0 && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3 w-3" />
                        <span>Precios personalizados configurados</span>
                      </div>
                    )}
                  </div>

                  {Object.keys(customer.custom_prices).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(customer.custom_prices).map(
                        ([type, price]) => (
                          <Badge
                            key={type}
                            variant="secondary"
                            className="text-xs"
                          >
                            {type}: ${price}
                          </Badge>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instrucciones */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">Casos de Prueba Sugeridos:</div>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Crear cliente con información básica</li>
                <li>Crear cliente con precios personalizados</li>
                <li>Verificar que los precios se apliquen en ventas</li>
                <li>Probar validaciones de campos obligatorios</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
