'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  User,
  Plus,
  Search,
  Wifi,
  WifiOff,
  RefreshCw,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCustomerCache } from '@/hooks/use-customer-cache';
import { useOfflineManager } from '@/hooks/use-offline-manager';

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

interface EnhancedCustomerSelectorProps {
  name: string;
  label: string;
  required?: boolean;
  onCustomerSelect?: (customer: Customer) => void;
  onNewCustomer?: () => void;
  className?: string;
  disabled?: boolean;
  showCustomerDetails?: boolean;
}

export function EnhancedCustomerSelector({
  name,
  label,
  required = false,
  onCustomerSelect,
  onNewCustomer,
  className,
  disabled = false,
  showCustomerDetails = true,
}: EnhancedCustomerSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);

  const { customers, isLoading, isOffline, lastUpdated, searchCustomers } =
    useCustomerCache();
  const { isOnline, pendingSales } = useOfflineManager();

  const form = useFormContext();
  const fieldError = form.formState.errors[name];

  // Búsqueda con debounce
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (!term.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchCustomers(term);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Error en búsqueda:', error);
        toast.error('Error al buscar clientes');
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [searchCustomers]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchTerm(customer.name);
    setShowResults(false);
    form.setValue(name, customer.name);
    onCustomerSelect?.(customer);

    toast.success(`Cliente seleccionado: ${customer.name}`);
  };

  const handleNewCustomer = () => {
    setSelectedCustomer(null);
    setSearchTerm('');
    setShowResults(false);
    form.setValue(name, '');
    onNewCustomer?.();
  };

  const handleClearSelection = () => {
    setSelectedCustomer(null);
    setSearchTerm('');
    setShowResults(false);
    form.setValue(name, '');
  };

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

  const hasError = !!fieldError;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header con label y estado */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Indicadores de estado */}
        <div className="flex items-center gap-2">
          {!isOnline && (
            <Badge variant="destructive" className="text-xs">
              <WifiOff className="h-3 w-3 mr-1" />
              Offline
            </Badge>
          )}
          {isOnline && lastUpdated && (
            <Badge variant="secondary" className="text-xs">
              <Wifi className="h-3 w-3 mr-1" />
              {getLastUpdatedText()}
            </Badge>
          )}
          {pendingSales.length > 0 && (
            <Badge variant="outline" className="text-xs text-orange-600">
              <Clock className="h-3 w-3 mr-1" />
              {pendingSales.length} pendiente
              {pendingSales.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Campo de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente por nombre, teléfono o ubicación..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowResults(true)}
          className={cn(
            'pl-10 pr-10',
            hasError && 'border-red-500',
            selectedCustomer && 'bg-green-50 border-green-200'
          )}
          disabled={disabled}
        />

        {/* Botón de limpiar */}
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSelection}
            className="absolute right-2 top-1 h-6 w-6 p-0"
          >
            ×
          </Button>
        )}

        {/* Indicador de búsqueda */}
        {isSearching && (
          <div className="absolute right-8 top-2">
            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Resultados de búsqueda */}
      {showResults && (searchResults.length > 0 || searchTerm) && (
        <Card className="max-h-60 overflow-y-auto">
          <CardContent className="p-0">
            {searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => handleCustomerSelect(customer)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{customer.name}</span>
                          {customer.relevance && customer.relevance > 0.5 && (
                            <Badge variant="secondary" className="text-xs">
                              Relevante
                            </Badge>
                          )}
                        </div>

                        {showCustomerDetails && (
                          <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                            {customer.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {customer.location}
                            </div>
                            {Object.keys(customer.custom_prices).length > 0 && (
                              <div className="text-xs text-green-600">
                                Precios personalizados disponibles
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm && !isSearching ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                No se encontraron clientes
                <div className="text-xs mt-1">
                  Intenta con otro término de búsqueda
                </div>
              </div>
            ) : null}

            {/* Opción para crear nuevo cliente */}
            <Separator />
            <div
              onClick={handleNewCustomer}
              className="p-3 hover:bg-green-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 text-green-600">
                <Plus className="h-4 w-4" />
                <span className="font-medium">Crear nuevo cliente</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Registrar un cliente que no existe en el sistema
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cliente seleccionado */}
      {selectedCustomer && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">
                  Cliente seleccionado: {selectedCustomer.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
              >
                ×
              </Button>
            </div>

            {showCustomerDetails && (
              <div className="mt-2 text-sm text-green-700">
                {selectedCustomer.phone && (
                  <div>📞 {selectedCustomer.phone}</div>
                )}
                <div>📍 {selectedCustomer.location}</div>
                {Object.keys(selectedCustomer.custom_prices).length > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    ✅ Precios personalizados aplicados
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mensaje de error */}
      {hasError && (
        <p className="text-sm text-red-600">{fieldError.message as string}</p>
      )}

      {/* Información adicional */}
      <div className="text-xs text-muted-foreground">
        {customers.length > 0 && (
          <div>
            {customers.length} cliente{customers.length !== 1 ? 's' : ''}{' '}
            disponible{customers.length !== 1 ? 's' : ''}
            {isOffline && ' (modo offline)'}
          </div>
        )}
        {!isOnline && (
          <div className="text-orange-600">
            ⚠️ Sin conexión - Los datos se sincronizarán cuando se restaure la
            conexión
          </div>
        )}
      </div>
    </div>
  );
}

// Función de debounce
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
