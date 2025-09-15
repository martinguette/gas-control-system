'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { inventoryAlertSchema } from '@/lib/validations';
import {
  CYLINDER_TYPES,
  CYLINDER_BRANDS,
  CYLINDER_COLORS,
} from '@/types/inventory';
import { createInventoryAlert } from '@/actions/inventory';
import { Loader2, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import type { InventoryAlert } from '@/types/inventory';

interface InventoryAlertsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryAlertsDialog({
  open,
  onOpenChange,
}: InventoryAlertsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const form = useForm({
    resolver: zodResolver(inventoryAlertSchema),
    defaultValues: {
      type: '',
      product_type: '',
      brand: '',
      color: '',
      min_threshold: 5,
      is_active: true,
    },
  });

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/inventory/alerts');
      const data = await response.json();

      if (response.ok) {
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAlerts();
    }
  }, [open]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', data.type);
      formData.append('product_type', data.product_type);
      formData.append('min_threshold', data.min_threshold.toString());
      formData.append('is_active', data.is_active.toString());

      if (data.brand) formData.append('brand', data.brand);
      if (data.color) formData.append('color', data.color);

      await createInventoryAlert(formData);
      form.reset();
      setShowAddForm(false);
      fetchAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertTypeLabel = (type: string) => {
    return type === 'full' ? 'Cilindros Llenos' : 'Cilindros Vacíos';
  };

  const getProductDisplayName = (alert: InventoryAlert) => {
    let name = alert.product_type;
    if (alert.brand && alert.color) {
      name += ` (${alert.brand} ${alert.color})`;
    }
    return name;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Configuración de Alertas
          </DialogTitle>
          <DialogDescription>
            Gestiona las alertas de stock bajo para el inventario
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Botón para agregar nueva alerta */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Alertas Configuradas</h3>
            <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Alerta
            </Button>
          </div>

          {/* Formulario para agregar alerta */}
          {showAddForm && (
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Crear Nueva Alerta</h4>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Inventario</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="full">
                                Cilindros Llenos
                              </SelectItem>
                              <SelectItem value="empty">
                                Cilindros Vacíos
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="product_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Producto</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el producto" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CYLINDER_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type} (
                                  {type === '33lb'
                                    ? '15kg'
                                    : type === '40lb'
                                    ? '18kg'
                                    : '45kg'}
                                  )
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch('type') === 'empty' && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Marca</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona la marca" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CYLINDER_BRANDS.map((brand) => (
                                  <SelectItem key={brand} value={brand}>
                                    {brand}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona el color" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CYLINDER_COLORS.map((color) => (
                                  <SelectItem key={color} value={color}>
                                    {color}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="min_threshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Umbral Mínimo</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Alerta Activa</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              La alerta estará activa y enviará notificaciones
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        form.reset();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Crear Alerta
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {/* Tabla de alertas existentes */}
          {alerts.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Umbral Mínimo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {getAlertTypeLabel(alert.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {getProductDisplayName(alert)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{alert.min_threshold}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={alert.is_active ? 'default' : 'secondary'}
                        >
                          {alert.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay alertas configuradas
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
