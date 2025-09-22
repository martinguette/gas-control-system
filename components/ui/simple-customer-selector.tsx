'use client';

import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  User,
  Plus,
  CheckCircle,
  MapPin,
  Phone,
  DollarSign,
  Edit3,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCustomerCache } from '@/hooks/use-customer-cache';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  location: string;
  custom_prices: Record<string, number>;
  created_at?: string;
  updated_at?: string;
  relevance?: number;
}

interface SimpleCustomerSelectorProps {
  name: string;
  label: string;
  required?: boolean;
  onCustomerSelect?: (customer: Customer) => void;
  onNewCustomer?: () => void;
  className?: string;
  disabled?: boolean;
}

export function SimpleCustomerSelector({
  name,
  label,
  required = false,
  onCustomerSelect,
  onNewCustomer,
  className,
  disabled = false,
}: SimpleCustomerSelectorProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { customers, isLoading } = useCustomerCache();
  const form = useFormContext();

  // Manejar selección de cliente
  const handleCustomerSelect = (customerId: string) => {
    if (customerId === 'new') {
      setIsNewCustomer(true);
      setSelectedCustomer(null);
      setIsEditing(false);
      onNewCustomer?.();
      return;
    }

    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setIsNewCustomer(false);
      setIsEditing(false);
      onCustomerSelect?.(customer);

      // Actualizar campos del formulario
      form.setValue('customer_name', customer.name);
      form.setValue('customer_phone', customer.phone || '');
      form.setValue('customer_location', customer.location);
    }
  };

  // Manejar edición de cliente
  const handleEditCustomer = () => {
    setIsEditing(true);
  };

  // Guardar cambios del cliente
  const handleSaveCustomer = () => {
    if (selectedCustomer) {
      // Aquí iría la lógica para guardar los cambios del cliente
      toast.success('Cliente actualizado correctamente');
      setIsEditing(false);
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Actualizar datos del cliente
  const updateCustomerField = (field: keyof Customer, value: any) => {
    if (selectedCustomer) {
      const updatedCustomer = { ...selectedCustomer, [field]: value };
      setSelectedCustomer(updatedCustomer);

      // Actualizar formulario
      if (field === 'name') form.setValue('customer_name', value);
      if (field === 'phone') form.setValue('customer_phone', value);
      if (field === 'location') form.setValue('customer_location', value);
    }
  };

  // Actualizar precios personalizados
  const updateCustomPrice = (productType: string, price: number) => {
    if (selectedCustomer) {
      const updatedCustomer = {
        ...selectedCustomer,
        custom_prices: {
          ...selectedCustomer.custom_prices,
          [productType]: price,
        },
      };
      setSelectedCustomer(updatedCustomer);
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            {label}
            {required && <span className="text-red-500">*</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selector de Cliente */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Seleccionar Cliente</Label>
            <Select
              onValueChange={handleCustomerSelect}
              value={selectedCustomer?.id || ''}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Buscar cliente o crear uno nuevo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new" className="text-green-600 font-medium">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Crear Nuevo Cliente
                  </div>
                </SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{customer.name}</span>
                      <span className="text-xs text-gray-500">
                        📍 {customer.location}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cliente Seleccionado */}
          {selectedCustomer && !isNewCustomer && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    {selectedCustomer.name}
                  </span>
                  {Object.keys(selectedCustomer.custom_prices).length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Precios especiales
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleEditCustomer}
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSaveCustomer}
                      >
                        Guardar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Información del Cliente */}
              <div className="space-y-3">
                {/* Nombre del Cliente */}
                <div>
                  <Label className="text-xs font-medium text-gray-600">
                    <User className="h-3 w-3 inline mr-1" />
                    Nombre del Cliente *
                  </Label>
                  {isEditing ? (
                    <Input
                      value={selectedCustomer.name}
                      onChange={(e) =>
                        updateCustomerField('name', e.target.value)
                      }
                      placeholder="Nombre completo del cliente"
                      className="text-sm h-8"
                    />
                  ) : (
                    <div className="text-sm text-gray-700 p-2 bg-white rounded border">
                      {selectedCustomer.name}
                    </div>
                  )}
                </div>

                {/* Datos Básicos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium text-gray-600">
                      <Phone className="h-3 w-3 inline mr-1" />
                      Teléfono
                    </Label>
                    {isEditing ? (
                      <Input
                        value={selectedCustomer.phone || ''}
                        onChange={(e) =>
                          updateCustomerField('phone', e.target.value)
                        }
                        placeholder="Número de teléfono"
                        className="text-sm h-8"
                      />
                    ) : (
                      <div className="text-sm text-gray-700 p-2 bg-white rounded border">
                        {selectedCustomer.phone || 'Sin teléfono'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      📍 Ubicación *
                    </Label>
                    {isEditing ? (
                      <Input
                        value={selectedCustomer.location}
                        onChange={(e) =>
                          updateCustomerField('location', e.target.value)
                        }
                        placeholder="Dirección del cliente"
                        className="text-sm h-8"
                      />
                    ) : (
                      <div className="text-sm text-gray-700 p-2 bg-white rounded border">
                        {selectedCustomer.location}
                      </div>
                    )}
                  </div>
                </div>

                {/* Indicador de precios personalizados */}
                {Object.keys(selectedCustomer.custom_prices).length > 0 && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-700">
                        ✅ Este cliente tiene precios personalizados
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Los precios se aplicarán automáticamente en "Productos y
                      Detalles"
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Formulario para Nuevo Cliente */}
          {isNewCustomer && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Plus className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">
                  Nuevo Cliente
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">
                    Nombre del Cliente *
                  </Label>
                  <Input
                    placeholder="Nombre completo del cliente"
                    {...form.register('customer_name')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Teléfono</Label>
                    <Input
                      placeholder="Número de teléfono"
                      {...form.register('customer_phone')}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      📍 Ubicación *
                    </Label>
                    <Input
                      placeholder="Dirección del cliente"
                      {...form.register('customer_location')}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
