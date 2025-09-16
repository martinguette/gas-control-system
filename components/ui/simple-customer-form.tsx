'use client';

import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { User, Plus, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  location: string;
  custom_prices: Record<string, number>;
}

interface SimpleCustomerFormProps {
  name: string;
  label: string;
  required?: boolean;
  onCustomerSelect?: (customer: Customer) => void;
  onNewCustomer?: (customerData: {
    name: string;
    phone?: string;
    location?: string;
  }) => void;
  className?: string;
  disabled?: boolean;
}

export function SimpleCustomerForm({
  name,
  label,
  required = false,
  onCustomerSelect,
  onNewCustomer,
  className,
  disabled = false,
}: SimpleCustomerFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    location: '',
  });

  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const fieldError = errors[name];
  const hasError = !!fieldError;

  // Cargar clientes cuando se abra el dropdown
  const handleDropdownOpen = (open: boolean) => {
    if (open && customers.length === 0) {
      loadAllCustomers();
    }
  };

  const loadAllCustomers = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Cargando todos los clientes...');
      const response = await fetch('/api/customers/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: '' }), // Buscar todos
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('📦 Resultado completo:', JSON.stringify(result, null, 2));
        if (result.success) {
          setCustomers(result.data || []);
          console.log('✅ Clientes cargados:', result.data?.length || 0);
        } else {
          console.error('❌ Error en resultado:', result.error);
          toast.error('Error al cargar clientes: ' + result.error);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Error HTTP:', response.status, errorText);
        toast.error('Error al cargar clientes');
      }
    } catch (error) {
      console.error('❌ Error loading customers:', error);
      toast.error('Error de conexión al cargar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    if (customerId === 'new') {
      setIsNewCustomer(true);
      setSelectedCustomerId('');
      setValue(name, '');
      setValue('customer_phone', '');
      setValue('customer_location', '');
    } else {
      setIsNewCustomer(false);
      setSelectedCustomerId(customerId);
      const customer = customers.find((c) => c.id === customerId);
      if (customer) {
        setValue(name, customer.name);
        setValue('customer_phone', customer.phone || '');
        setValue('customer_location', customer.location);
        onCustomerSelect?.(customer);
      }
    }
  };

  const handleNewCustomerSubmit = async () => {
    if (!newCustomerData.name.trim()) {
      toast.error('El nombre del cliente es requerido');
      return;
    }

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCustomerData.name.trim(),
          phone: newCustomerData.phone.trim() || undefined,
          location: newCustomerData.location.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setValue(name, newCustomerData.name.trim());
        setValue('customer_phone', newCustomerData.phone.trim());
        setValue('customer_location', newCustomerData.location.trim());

        // Recargar la lista de clientes
        await loadAllCustomers();

        // Seleccionar el nuevo cliente
        setSelectedCustomerId(result.data.id);
        setIsNewCustomer(false);

        onNewCustomer?.(newCustomerData);
        toast.success('Cliente creado exitosamente');

        // Limpiar el formulario de nuevo cliente
        setNewCustomerData({ name: '', phone: '', location: '' });
      } else {
        throw new Error(result.error || 'Error al crear cliente');
      }
    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast.error('Error al crear cliente');
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Selector de cliente existente o nuevo */}
      <div className="space-y-2">
        <Select
          value={isNewCustomer ? 'new' : selectedCustomerId}
          onValueChange={handleCustomerSelect}
          onOpenChange={handleDropdownOpen}
          disabled={disabled}
        >
          <SelectTrigger className={cn(hasError && 'border-red-500')}>
            <SelectValue placeholder="Seleccionar cliente existente o crear nuevo" />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                <span className="text-sm text-muted-foreground">
                  Cargando clientes...
                </span>
              </div>
            ) : (
              <>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-gray-500">
                          {customer.location}
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
                <SelectItem value="new">
                  <div className="flex items-center space-x-2">
                    <Plus className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Crear nuevo cliente</span>
                  </div>
                </SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Formulario para nuevo cliente */}
      {isNewCustomer && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
          <h4 className="font-medium text-sm text-gray-900">
            Datos del Nuevo Cliente
          </h4>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700">
                Nombre *
              </label>
              <Input
                value={newCustomerData.name}
                onChange={(e) =>
                  setNewCustomerData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Nombre completo del cliente"
                className="text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700">
                Teléfono
              </label>
              <Input
                value={newCustomerData.phone}
                onChange={(e) =>
                  setNewCustomerData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                placeholder="Número de teléfono"
                className="text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700">
                Ubicación
              </label>
              <Input
                value={newCustomerData.location}
                onChange={(e) =>
                  setNewCustomerData((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                placeholder="Dirección o ubicación"
                className="text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleNewCustomerSubmit}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Crear Cliente
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setIsNewCustomer(false);
                setNewCustomerData({ name: '', phone: '', location: '' });
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {hasError && (
        <p className="text-sm text-red-600">{fieldError.message as string}</p>
      )}
    </div>
  );
}
