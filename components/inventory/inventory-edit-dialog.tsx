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
  inventoryFullUpdateSchema,
  inventoryEmptyUpdateSchema,
} from '@/lib/validations';
import { Loader2 } from 'lucide-react';
import type { InventoryFull, InventoryEmpty } from '@/types/inventory';

interface InventoryEditDialogProps {
  item: InventoryFull | InventoryEmpty;
  type: 'full' | 'empty';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryEditDialog({
  item,
  type,
  open,
  onOpenChange,
}: InventoryEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(
      type === 'full' ? inventoryFullUpdateSchema : inventoryEmptyUpdateSchema
    ),
    defaultValues: {
      quantity: item.quantity,
      ...(type === 'full' && { unit_cost: (item as InventoryFull).unit_cost }),
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('id', item.id);
      formData.append('quantity', data.quantity.toString());

      if (type === 'full') {
        formData.append('unit_cost', data.unit_cost.toString());
        // Aquí llamarías a la función de actualización para cilindros llenos
      } else {
        // Aquí llamarías a la función de actualización para cilindros vacíos
      }

      // await updateInventory(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getItemDisplayName = () => {
    if (type === 'full') {
      const fullItem = item as InventoryFull;
      return `${fullItem.type} (${
        fullItem.type === '33lb'
          ? '15kg'
          : fullItem.type === '40lb'
          ? '18kg'
          : '45kg'
      })`;
    } else {
      const emptyItem = item as InventoryEmpty;
      return `${emptyItem.type} - ${emptyItem.brand} ${emptyItem.color}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Editar Inventario</DialogTitle>
          <DialogDescription>
            Modifica la información de: {getItemDisplayName()}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
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

            {type === 'full' && (
              <FormField
                control={form.control}
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
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
