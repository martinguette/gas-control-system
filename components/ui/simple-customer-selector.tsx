'use client';

import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { User, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  const form = useFormContext();
  const fieldError = form.formState.errors[name];

  // Cargar clientes cuando se abra el dropdown
  const handleDropdownOpen = (open: boolean) => {
    if (open && customers.length === 0) {
      loadAllCustomers();
    }
  };

  const loadAllCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/customers/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: '' }), // Buscar todos
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCustomers(result.data || []);
        } else {
          toast.error('Error al cargar clientes: ' + result.error);
        }
      } else {
        toast.error('Error al cargar clientes');
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Error de conexión al cargar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerSelect = (value: string) => {
    if (value === 'new') {
      setSelectedCustomerId('');
      form.setValue(name, '');
      onNewCustomer?.();
    } else {
      setSelectedCustomerId(value);
      const customer = customers.find((c) => c.id === value);
      if (customer) {
        form.setValue(name, customer.id);
        onCustomerSelect?.(customer);
      }
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasError = !!fieldError;

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <Select
        value={selectedCustomerId}
        onValueChange={handleCustomerSelect}
        onOpenChange={handleDropdownOpen}
        disabled={disabled}
      >
        <SelectTrigger className={cn(hasError && 'border-red-500')}>
          <SelectValue placeholder="Seleccionar cliente o crear nuevo" />
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
              {/* Barra de búsqueda */}
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8"
                  />
                </div>
              </div>

              {/* Lista de clientes - solo nombres */}
              {filteredCustomers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span>{customer.name}</span>
                  </div>
                </SelectItem>
              ))}

              <SelectItem value="new">
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4 text-green-600" />
                  <span>Crear nuevo cliente</span>
                </div>
              </SelectItem>
            </>
          )}
        </SelectContent>
      </Select>

      {/* Mensaje de error */}
      {hasError && (
        <p className="text-sm text-red-600">{fieldError.message as string}</p>
      )}
    </div>
  );
}
