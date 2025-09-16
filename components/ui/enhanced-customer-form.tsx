'use client';

import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { User, Plus, Edit, Search, Save, X } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  location: string;
  custom_prices: Record<string, number>;
}

interface EnhancedCustomerFormProps {
  name: string;
  label: string;
  required?: boolean;
  onCustomerSelect?: (customer: Customer) => void;
  onNewCustomer?: (customerData: {
    name: string;
    phone?: string;
    location?: string;
  }) => void;
  onCustomerUpdate?: (customer: Customer) => void;
  className?: string;
  disabled?: boolean;
}

export function EnhancedCustomerForm({
  name,
  label,
  required = false,
  onCustomerSelect,
  onNewCustomer,
  onCustomerUpdate,
  className,
  disabled = false,
}: EnhancedCustomerFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useFormContext();
  const fieldError = form.formState.errors[name];

  // Estados para nuevo cliente
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    location: '',
  });

  // Estados para editar cliente
  const [editCustomerData, setEditCustomerData] = useState({
    name: '',
    phone: '',
    location: '',
    custom_prices: {} as Record<string, number>,
  });

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

  const handleCustomerSelect = (value: string) => {
    if (value === 'new') {
      setIsNewCustomer(true);
      setSelectedCustomerId('');
      form.setValue(name, '');
    } else {
      setIsNewCustomer(false);
      setSelectedCustomerId(value);
      const customer = customers.find((c) => c.id === value);
      if (customer) {
        form.setValue(name, customer.id);
        onCustomerSelect?.(customer);
      }
    }
  };

  const handleNewCustomerSubmit = async () => {
    if (!newCustomerData.name.trim()) {
      toast.error('El nombre del cliente es obligatorio');
      return;
    }

    // Verificar duplicados
    const duplicate = customers.find(
      (c) => c.name.toLowerCase() === newCustomerData.name.toLowerCase()
    );
    if (duplicate) {
      toast.error('Ya existe un cliente con ese nombre');
      return;
    }

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomerData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success('Cliente creado exitosamente');
          onNewCustomer?.(newCustomerData);

          // Recargar clientes
          await loadAllCustomers();

          // Seleccionar el nuevo cliente
          const newCustomer = result.data;
          setSelectedCustomerId(newCustomer.id);
          setIsNewCustomer(false);
          form.setValue(name, newCustomer.id);
          onCustomerSelect?.(newCustomer);

          // Limpiar formulario
          setNewCustomerData({ name: '', phone: '', location: '' });
        } else {
          toast.error('Error al crear cliente: ' + result.error);
        }
      } else {
        toast.error('Error al crear cliente');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Error de conexión al crear cliente');
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditCustomerData({
      name: customer.name,
      phone: customer.phone || '',
      location: customer.location,
      custom_prices: customer.custom_prices || {},
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer || !editCustomerData.name.trim()) {
      toast.error('El nombre del cliente es obligatorio');
      return;
    }

    // Verificar duplicados (excluyendo el cliente actual)
    const duplicate = customers.find(
      (c) =>
        c.id !== editingCustomer.id &&
        c.name.toLowerCase() === editCustomerData.name.toLowerCase()
    );
    if (duplicate) {
      toast.error('Ya existe otro cliente con ese nombre');
      return;
    }

    try {
      const response = await fetch('/api/customers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingCustomer.id,
          ...editCustomerData,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success('Cliente actualizado exitosamente');
          onCustomerUpdate?.(result.data);

          // Recargar clientes
          await loadAllCustomers();

          // Actualizar selección si es el cliente actual
          if (selectedCustomerId === editingCustomer.id) {
            onCustomerSelect?.(result.data);
          }

          setIsEditDialogOpen(false);
          setEditingCustomer(null);
        } else {
          toast.error('Error al actualizar cliente: ' + result.error);
        }
      } else {
        toast.error('Error al actualizar cliente');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Error de conexión al actualizar cliente');
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm))
  );

  const hasError = !!fieldError;

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

                {/* Lista de clientes */}
                {filteredCustomers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-gray-500">
                            {customer.location}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCustomer(customer);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
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
        <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
          <h4 className="font-medium text-sm">Nuevo Cliente</h4>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs text-gray-600">Nombre *</label>
              <Input
                placeholder="Nombre completo"
                value={newCustomerData.name}
                onChange={(e) =>
                  setNewCustomerData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Teléfono</label>
              <Input
                placeholder="Número de teléfono"
                value={newCustomerData.phone}
                onChange={(e) =>
                  setNewCustomerData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Ubicación</label>
              <Input
                placeholder="Dirección o ubicación"
                value={newCustomerData.location}
                onChange={(e) =>
                  setNewCustomerData((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                className="text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleNewCustomerSubmit}
              size="sm"
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Crear Cliente
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsNewCustomer(false);
                setNewCustomerData({ name: '', phone: '', location: '' });
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog para editar cliente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre *</label>
              <Input
                value={editCustomerData.name}
                onChange={(e) =>
                  setEditCustomerData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Nombre completo"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Teléfono</label>
              <Input
                value={editCustomerData.phone}
                onChange={(e) =>
                  setEditCustomerData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                placeholder="Número de teléfono"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Ubicación</label>
              <Input
                value={editCustomerData.location}
                onChange={(e) =>
                  setEditCustomerData((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                placeholder="Dirección o ubicación"
              />
            </div>

            {/* Precios personalizados */}
            <div>
              <label className="text-sm font-medium">
                Precios Personalizados
              </label>
              <div className="space-y-2 mt-2">
                {['33lb', '40lb', '100lb'].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <span className="text-sm w-12">{type}:</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Precio personalizado"
                      value={editCustomerData.custom_prices[type] || ''}
                      onChange={(e) =>
                        setEditCustomerData((prev) => ({
                          ...prev,
                          custom_prices: {
                            ...prev.custom_prices,
                            [type]: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          },
                        }))
                      }
                      className="text-sm"
                    />
                    {editCustomerData.custom_prices[type] && (
                      <Badge variant="secondary" className="text-xs">
                        ${editCustomerData.custom_prices[type]}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleUpdateCustomer} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mensaje de error */}
      {hasError && (
        <p className="text-sm text-red-600">{fieldError.message as string}</p>
      )}
    </div>
  );
}
