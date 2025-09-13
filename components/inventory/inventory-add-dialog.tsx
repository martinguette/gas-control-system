'use client';

import { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { inventoryFullSchema, inventoryEmptySchema } from '@/lib/validations';
import {
  CYLINDER_TYPES,
  CYLINDER_BRANDS,
  CYLINDER_COLORS,
} from '@/types/inventory';
import { updateFullInventory, updateEmptyInventory } from '@/actions/inventory';
import { Loader2 } from 'lucide-react';

interface InventoryAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryAddDialog({
  open,
  onOpenChange,
}: InventoryAddDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('full');

  const fullForm = useForm({
    resolver: zodResolver(inventoryFullSchema),
    defaultValues: {
      type: '',
      quantity: 0,
      unit_cost: 0,
    },
  });

  const emptyForm = useForm({
    resolver: zodResolver(inventoryEmptySchema),
    defaultValues: {
      type: '',
      brand: '',
      color: '',
      quantity: 0,
    },
  });

  const onSubmitFull = async (data: any) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', data.type);
      formData.append('quantity', data.quantity.toString());
      formData.append('unit_cost', data.unit_cost.toString());

      await updateFullInventory(formData);
      onOpenChange(false);
      fullForm.reset();
    } catch (error) {
      console.error('Error updating full inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitEmpty = async (data: any) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', data.type);
      formData.append('brand', data.brand);
      formData.append('color', data.color);
      formData.append('quantity', data.quantity.toString());

      await updateEmptyInventory(formData);
      onOpenChange(false);
      emptyForm.reset();
    } catch (error) {
      console.error('Error updating empty inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar al Inventario</DialogTitle>
          <DialogDescription>
            Agrega nuevos cilindros al inventario del sistema
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="full">Cilindros Llenos</TabsTrigger>
            <TabsTrigger value="empty">Cilindros Vacíos</TabsTrigger>
          </TabsList>

          <TabsContent value="full" className="space-y-4">
            <Form {...fullForm}>
              <form
                onSubmit={fullForm.handleSubmit(onSubmitFull)}
                className="space-y-4"
              >
                <FormField
                  control={fullForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Cilindro</FormLabel>
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

                <FormField
                  control={fullForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
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
                  control={fullForm.control}
                  name="unit_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo Unitario (COP)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Agregar
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="empty" className="space-y-4">
            <Form {...emptyForm}>
              <form
                onSubmit={emptyForm.handleSubmit(onSubmitEmpty)}
                className="space-y-4"
              >
                <FormField
                  control={emptyForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Cilindro</FormLabel>
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

                <FormField
                  control={emptyForm.control}
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
                  control={emptyForm.control}
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

                <FormField
                  control={emptyForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
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

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Agregar
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
