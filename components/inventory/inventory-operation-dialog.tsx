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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { z } from 'zod';
import { performInventoryOperation } from '@/actions/inventory';
import { Loader2, Plus, Minus, Package, AlertTriangle } from 'lucide-react';
import type { InventoryFull, InventoryEmpty } from '@/types/inventory';

const operationSchema = z.object({
  quantity: z.number().int().min(1, 'La cantidad debe ser mayor a 0'),
  reason: z
    .string()
    .min(1, 'La razón es requerida')
    .max(500, 'La razón es demasiado larga'),
});

interface InventoryOperationDialogProps {
  item: InventoryFull | InventoryEmpty;
  type: 'full' | 'empty';
  operationType: 'add' | 'subtract' | 'set';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryOperationDialog({
  item,
  type,
  operationType,
  open,
  onOpenChange,
}: InventoryOperationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(operationSchema),
    defaultValues: {
      quantity: 0,
      reason: '',
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', operationType);
      formData.append('inventory_type', type);
      formData.append('product_type', item.type);
      formData.append('quantity', data.quantity.toString());
      formData.append('reason', data.reason);

      if (type === 'empty') {
        const emptyItem = item as InventoryEmpty;
        formData.append('brand', emptyItem.brand);
        formData.append('color', emptyItem.color);
      }

      await performInventoryOperation(formData);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error performing operation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOperationIcon = () => {
    switch (operationType) {
      case 'add':
        return <Plus className="h-4 w-4" />;
      case 'subtract':
        return <Minus className="h-4 w-4" />;
      case 'set':
        return <Package className="h-4 w-4" />;
    }
  };

  const getOperationTitle = () => {
    switch (operationType) {
      case 'add':
        return 'Agregar al Inventario';
      case 'subtract':
        return 'Restar del Inventario';
      case 'set':
        return 'Establecer Cantidad';
    }
  };

  const getOperationDescription = () => {
    const itemName =
      type === 'full'
        ? `${item.type} (${
            item.type === '33lb'
              ? '15kg'
              : item.type === '40lb'
              ? '18kg'
              : '45kg'
          })`
        : `${item.type} - ${(item as InventoryEmpty).brand} ${
            (item as InventoryEmpty).color
          }`;

    switch (operationType) {
      case 'add':
        return `Agregar cilindros a: ${itemName}`;
      case 'subtract':
        return `Restar cilindros de: ${itemName}`;
      case 'set':
        return `Establecer cantidad para: ${itemName}`;
    }
  };

  const getCurrentQuantity = () => {
    return item.quantity;
  };

  const getNewQuantity = (inputQuantity: number) => {
    switch (operationType) {
      case 'add':
        return getCurrentQuantity() + inputQuantity;
      case 'subtract':
        return Math.max(0, getCurrentQuantity() - inputQuantity);
      case 'set':
        return inputQuantity;
    }
  };

  const watchedQuantity = form.watch('quantity');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getOperationIcon()}
            {getOperationTitle()}
          </DialogTitle>
          <DialogDescription>{getOperationDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información actual */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Cantidad Actual</p>
              <p className="text-2xl font-bold">{getCurrentQuantity()}</p>
            </div>
            <Badge variant="outline">
              {type === 'full' ? 'Cilindros Llenos' : 'Cilindros Vacíos'}
            </Badge>
          </div>

          {/* Previsualización del resultado */}
          {watchedQuantity > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Resultado de la operación:</p>
                  <p className="text-sm">
                    Cantidad actual:{' '}
                    <span className="font-semibold">
                      {getCurrentQuantity()}
                    </span>
                    {operationType !== 'set' && (
                      <>
                        {' '}
                        {operationType === 'add' ? '+' : '-'}{' '}
                        <span className="font-semibold">{watchedQuantity}</span>
                      </>
                    )}{' '}
                    ={' '}
                    <span className="font-bold text-primary">
                      {getNewQuantity(watchedQuantity)}
                    </span>
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Cantidad{' '}
                      {operationType === 'set'
                        ? 'a establecer'
                        : 'a ' +
                          (operationType === 'add' ? 'agregar' : 'restar')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
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
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razón de la operación</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Explica por qué se realiza esta operación..."
                        className="resize-none"
                        rows={3}
                        {...field}
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
                  {getOperationTitle()}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
