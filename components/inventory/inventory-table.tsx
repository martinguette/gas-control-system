'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, Minus, Trash2, Package } from 'lucide-react';
import { InventoryEditDialog } from './inventory-edit-dialog';
import { InventoryOperationDialog } from './inventory-operation-dialog';
import type { InventoryFull, InventoryEmpty } from '@/types/inventory';

interface InventoryTableProps {
  data: (InventoryFull | InventoryEmpty)[];
  type: 'full' | 'empty';
  showActions?: boolean;
}

export function InventoryTable({
  data,
  type,
  showActions = false,
}: InventoryTableProps) {
  const [editingItem, setEditingItem] = useState<
    InventoryFull | InventoryEmpty | null
  >(null);
  const [operationItem, setOperationItem] = useState<
    InventoryFull | InventoryEmpty | null
  >(null);
  const [operationType, setOperationType] = useState<
    'add' | 'subtract' | 'set' | null
  >(null);

  const handleEdit = (item: InventoryFull | InventoryEmpty) => {
    setEditingItem(item);
  };

  const handleOperation = (
    item: InventoryFull | InventoryEmpty,
    opType: 'add' | 'subtract' | 'set'
  ) => {
    setOperationItem(item);
    setOperationType(opType);
  };

  const getQuantityColor = (quantity: number) => {
    if (quantity === 0) return 'destructive';
    if (quantity <= 5) return 'secondary';
    return 'default';
  };

  const getQuantityVariant = (quantity: number) => {
    if (quantity === 0) return 'destructive';
    if (quantity <= 5) return 'secondary';
    return 'default';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDisplayName = (item: InventoryFull | InventoryEmpty) => {
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

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          No hay {type === 'full' ? 'cilindros llenos' : 'cilindros vacíos'} en
          el inventario
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              {type === 'empty' && (
                <>
                  <TableHead>Marca</TableHead>
                  <TableHead>Color</TableHead>
                </>
              )}
              <TableHead className="text-right">Cantidad</TableHead>
              {type === 'full' && (
                <TableHead className="text-right">Costo Unitario</TableHead>
              )}
              <TableHead className="text-right">Última Actualización</TableHead>
              {showActions && (
                <TableHead className="text-center">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {getDisplayName(item)}
                </TableCell>
                {type === 'empty' && (
                  <>
                    <TableCell>
                      <Badge variant="outline">
                        {(item as InventoryEmpty).brand}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {(item as InventoryEmpty).color}
                      </Badge>
                    </TableCell>
                  </>
                )}
                <TableCell className="text-right">
                  <Badge variant={getQuantityVariant(item.quantity)}>
                    {item.quantity}
                  </Badge>
                </TableCell>
                {type === 'full' && (
                  <TableCell className="text-right">
                    {formatCurrency((item as InventoryFull).unit_cost)}
                  </TableCell>
                )}
                <TableCell className="text-right text-sm text-muted-foreground">
                  {new Date(item.updated_at).toLocaleDateString('es-CO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                {showActions && (
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOperation(item, 'add')}
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOperation(item, 'subtract')}
                        className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOperation(item, 'set')}
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                      >
                        <Package className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      {editingItem && (
        <InventoryEditDialog
          item={editingItem}
          type={type}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
        />
      )}

      {operationItem && operationType && (
        <InventoryOperationDialog
          item={operationItem}
          type={type}
          operationType={operationType}
          open={!!operationItem}
          onOpenChange={(open) => {
            if (!open) {
              setOperationItem(null);
              setOperationType(null);
            }
          }}
        />
      )}
    </>
  );
}
