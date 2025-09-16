'use client';

import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronDown, Plus, User } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  location: string;
  custom_prices: Record<string, number>;
}

interface CustomerSelectProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  onCustomerSelect?: (customer: Customer) => void;
  onNewCustomer?: (name: string) => void;
  className?: string;
  disabled?: boolean;
}

export function CustomerSelect({
  name,
  label,
  placeholder = 'Buscar cliente...',
  required = false,
  onCustomerSelect,
  onNewCustomer,
  className,
  disabled = false,
}: CustomerSelectProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const currentValue = watch(name);
  const fieldError = errors[name];
  const hasError = !!fieldError;

  // Sincronizar con el valor del formulario
  useEffect(() => {
    if (currentValue) {
      setSearchValue(currentValue);
    }
  }, [currentValue]);

  // Buscar clientes
  const searchCustomers = async (query: string) => {
    if (query.length < 2) {
      setCustomers([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/customers/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: query }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setCustomers(result.data || []);
      } else {
        throw new Error(result.error || 'Error al buscar clientes');
      }
    } catch (error: any) {
      console.error('❌ Error searching customers:', error);
      setCustomers([]);
      toast.error('Error al buscar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  // Crear nuevo cliente
  const createNewCustomer = async (name: string) => {
    if (!name.trim()) return;

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: watch('customer_phone') || undefined,
          location: watch('customer_location') || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setValue(name, name.trim());
        setSearchValue(name.trim());
        setShowDropdown(false);
        onNewCustomer?.(name.trim());
        toast.success('Cliente creado exitosamente');
      } else {
        throw new Error(result.error || 'Error al crear cliente');
      }
    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast.error('Error al crear cliente');
    }
  };

  // Seleccionar cliente existente
  const selectCustomer = (customer: Customer) => {
    setValue(name, customer.name);
    setValue('customer_phone', customer.phone || '');
    setValue('customer_location', customer.location);
    setSearchValue(customer.name);
    setShowDropdown(false);
    onCustomerSelect?.(customer);
  };

  // Manejar búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue.length >= 2) {
        searchCustomers(searchValue);
        setShowDropdown(true);
      } else {
        setCustomers([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pr-8',
            hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500'
          )}
        />

        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

        {/* Dropdown de resultados */}
        {showDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {/* Clientes encontrados */}
            {customers.length > 0 && (
              <div className="py-1">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => selectCustomer(customer)}
                  >
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{customer.name}</p>
                        <p className="text-xs text-gray-500">
                          {customer.location}
                        </p>
                        {customer.phone && (
                          <p className="text-xs text-gray-500">
                            {customer.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Opción para crear nuevo cliente */}
            {searchValue.length >= 2 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <div
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => createNewCustomer(searchValue)}
                >
                  <Plus className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">Crear "{searchValue}"</p>
                    <p className="text-xs text-gray-500">Nuevo cliente</p>
                  </div>
                </div>
              </div>
            )}

            {/* Estado vacío */}
            {!isLoading &&
              searchValue.length >= 2 &&
              customers.length === 0 && (
                <div className="p-3 text-sm text-gray-500 text-center">
                  No se encontraron clientes
                </div>
              )}

            {/* Indicador de carga */}
            {isLoading && (
              <div className="p-3 text-sm text-gray-500 text-center">
                Buscando...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {hasError && (
        <p className="text-sm text-red-600">{fieldError.message as string}</p>
      )}
    </div>
  );
}
