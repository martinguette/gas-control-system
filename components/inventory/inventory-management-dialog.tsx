'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Plus,
  Minus,
  DollarSign,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import {
  CylinderType,
  CylinderBrand,
  CYLINDER_TYPES,
  CYLINDER_BRANDS,
  InventoryOperation,
  getColorByBrand,
} from '@/types/inventory';
import { performInventoryOperation } from '@/actions/inventory';

interface InventoryManagementDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export default function InventoryManagementDialog({
  trigger,
  onSuccess,
}: InventoryManagementDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [operation, setOperation] = useState<InventoryOperation>({
    type: 'add',
    inventory_type: 'full',
    product_type: '33lb',
    quantity: 0,
    unit_cost: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Asegurar que el color se asigne automáticamente según la marca
      const operationWithColor = {
        ...operation,
        color:
          operation.inventory_type === 'empty'
            ? getColorByBrand((operation.brand as CylinderBrand) || 'Roscogas')
            : undefined,
      };

      await performInventoryOperation(operationWithColor);
      setOpen(false);
      onSuccess?.();
      // Reset form
      setOperation({
        type: 'add',
        inventory_type: 'full',
        product_type: '33lb',
        quantity: 0,
        unit_cost: 0,
      });
    } catch (error) {
      console.error('Error performing inventory operation:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const getOperationIcon = () => {
    switch (operation.type) {
      case 'add':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'subtract':
        return <Minus className="h-4 w-4 text-red-600" />;
      case 'set':
        return <Package className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getOperationColor = () => {
    switch (operation.type) {
      case 'add':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'subtract':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'set':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Gestionar Inventario
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Gestión de Inventario
          </DialogTitle>
          <DialogDescription>
            Actualiza tu inventario de forma sencilla
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Acción Simple */}
          <div className="space-y-1">
            <Label htmlFor="action">¿Qué quieres hacer?</Label>
            <Select
              value={operation.type}
              onValueChange={(value: 'add' | 'subtract' | 'set') =>
                setOperation({ ...operation, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-600" />
                    Llegó un camión con cilindros
                  </div>
                </SelectItem>
                <SelectItem value="subtract">
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-red-600" />
                    Se vendieron cilindros
                  </div>
                </SelectItem>
                <SelectItem value="set">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    Corregir cantidad (conteo físico)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Cilindro */}
          <div className="space-y-1">
            <Label htmlFor="inventory-type">¿Qué tipo de cilindro?</Label>
            <Select
              value={operation.inventory_type}
              onValueChange={(value: 'full' | 'empty') =>
                setOperation({ ...operation, inventory_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-green-600" />
                    Cilindros Llenos (listos para vender)
                  </div>
                </SelectItem>
                <SelectItem value="empty">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    Cilindros Vacíos (recolectados)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tamaño del Cilindro */}
          <div className="space-y-1">
            <Label htmlFor="product-type">¿Qué tamaño?</Label>
            <Select
              value={operation.product_type}
              onValueChange={(value: CylinderType) =>
                setOperation({ ...operation, product_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tamaño" />
              </SelectTrigger>
              <SelectContent>
                {CYLINDER_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    Cilindro {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Brand and Color (only for empty cylinders) */}
          {operation.inventory_type === 'empty' && (
            <>
              <div className="space-y-1">
                <Label htmlFor="brand">¿De qué marca?</Label>
                <Select
                  value={operation.brand || 'Roscogas'}
                  onValueChange={(value) =>
                    setOperation({
                      ...operation,
                      brand: value,
                      color: getColorByBrand(value as CylinderBrand),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {CYLINDER_BRANDS.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand} ({getColorByBrand(brand as CylinderBrand)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Cantidad */}
          <div className="space-y-1">
            <Label htmlFor="quantity">
              {operation.type === 'add' && '¿Cuántos llegaron?'}
              {operation.type === 'subtract' && '¿Cuántos se vendieron?'}
              {operation.type === 'set' && '¿Cuántos hay realmente?'}
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={operation.quantity}
              onChange={(e) =>
                setOperation({
                  ...operation,
                  quantity: parseInt(e.target.value) || 0,
                })
              }
              placeholder="Ingresa la cantidad"
            />
          </div>

          {/* Precio de Compra (solo para cilindros llenos) */}
          {operation.inventory_type === 'full' && (
            <div className="space-y-1">
              <Label htmlFor="unit-cost">¿Cuánto costó cada cilindro?</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="unit-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={operation.unit_cost}
                  onChange={(e) =>
                    setOperation({
                      ...operation,
                      unit_cost: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="Ej: 150.00"
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo</Label>
            <Textarea
              id="reason"
              placeholder="Describe el motivo de esta operación..."
              className="resize-none"
            />
          </div>

          {/* Operation Summary */}
          <div className="p-3 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              {getOperationIcon()}
              <span className="font-medium text-sm">Resumen de Operación</span>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                <strong>Tipo:</strong>{' '}
                {operation.type === 'add'
                  ? 'Agregar'
                  : operation.type === 'subtract'
                  ? 'Restar'
                  : 'Establecer'}
              </p>
              <p>
                <strong>Inventario:</strong>{' '}
                {operation.inventory_type === 'full'
                  ? 'Cilindros Llenos'
                  : 'Cilindros Vacíos'}
              </p>
              <p>
                <strong>Producto:</strong> Cilindro {operation.product_type}
              </p>
              {operation.inventory_type === 'empty' && (
                <p>
                  <strong>Marca/Color:</strong> {operation.brand}{' '}
                  {operation.color}
                </p>
              )}
              <p>
                <strong>Cantidad:</strong> {operation.quantity}
              </p>
              {operation.inventory_type === 'full' && (
                <p>
                  <strong>Costo:</strong> ${operation.unit_cost}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 h-9"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || operation.quantity <= 0}
              className="flex-1 h-9"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Ejecutar Operación
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
