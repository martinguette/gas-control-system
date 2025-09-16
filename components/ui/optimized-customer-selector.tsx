'use client';

import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { User, Plus, Search, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCustomerCache } from '@/hooks/use-customer-cache';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  location: string;
  custom_prices: Record<string, number>;
}

interface OptimizedCustomerSelectorProps {
  name: string;
  label: string;
  required?: boolean;
  onCustomerSelect?: (customer: Customer) => void;
  onNewCustomer?: () => void;
  className?: string;
  disabled?: boolean;
}

export function OptimizedCustomerSelector({
  name,
  label,
  required = false,
  onCustomerSelect,
  onNewCustomer,
  className,
  disabled = false,
}: OptimizedCustomerSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { customers, isLoading, isOffline, lastUpdated, refreshCustomers } =
    useCustomerCache();

  const form = useFormContext();
  const fieldError = form.formState.errors[name];

  // Cargar clientes cuando se abra el dropdown por primera vez
  const handleDropdownOpen = (open: boolean) => {
    setIsDropdownOpen(open);
    if (open && customers.length === 0 && !isLoading) {
      refreshCustomers();
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
        form.setValue(name, customer.name); // Usar el nombre en lugar del ID
        onCustomerSelect?.(customer);
      }
    }
  };

  const handleRefresh = async () => {
    await refreshCustomers();
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasError = !!fieldError;

  // Formatear tiempo desde última actualización
  const getLastUpdatedText = () => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Actualizado ahora';
    if (minutes < 60) return `Actualizado hace ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `Actualizado hace ${hours}h`;
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Indicadores de estado */}
        <div className="flex items-center gap-2">
          {isOffline && (
            <Badge variant="destructive" className="text-xs">
              <WifiOff className="h-3 w-3 mr-1" />
              Offline
            </Badge>
          )}
          {!isOffline && lastUpdated && (
            <Badge variant="secondary" className="text-xs">
              <Wifi className="h-3 w-3 mr-1" />
              {getLastUpdatedText()}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </div>

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

          {/* Estado de carga */}
          {isLoading && customers.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              <span className="text-sm text-muted-foreground">
                Cargando clientes...
              </span>
            </div>
          ) : (
            <>
              {/* Lista de clientes */}
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span>{customer.name}</span>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  {searchTerm
                    ? 'No se encontraron clientes'
                    : 'No hay clientes disponibles'}
                </div>
              )}

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

      {/* Información adicional */}
      {customers.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {customers.length} cliente{customers.length !== 1 ? 's' : ''}{' '}
          disponible{customers.length !== 1 ? 's' : ''}
          {isOffline && ' (modo offline)'}
        </div>
      )}
    </div>
  );
}
