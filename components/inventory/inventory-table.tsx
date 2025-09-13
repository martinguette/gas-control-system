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
      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-300">
        <div className="text-8xl mb-6">📦</div>
        <h3 className="text-2xl font-bold text-gray-700 mb-2">
          {type === 'full' ? 'Sin Cilindros Llenos' : 'Sin Cilindros Vacíos'}
        </h3>
        <p className="text-gray-600 text-lg font-medium mb-4">
          No hay {type === 'full' ? 'cilindros llenos' : 'cilindros vacíos'} en
          el inventario
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-blue-700 font-semibold">
            {type === 'full'
              ? 'Agregar cilindros llenos'
              : 'Agregar cilindros vacíos'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border-0 shadow-xl bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="text-white font-bold text-lg py-4">
                Producto
              </TableHead>
              {type === 'empty' && (
                <>
                  <TableHead className="text-white font-bold text-lg py-4">
                    Marca
                  </TableHead>
                  <TableHead className="text-white font-bold text-lg py-4">
                    Color
                  </TableHead>
                </>
              )}
              <TableHead className="text-right text-white font-bold text-lg py-4">
                Cantidad
              </TableHead>
              {type === 'full' && (
                <TableHead className="text-right text-white font-bold text-lg py-4">
                  Costo Unitario
                </TableHead>
              )}
              <TableHead className="text-right text-white font-bold text-lg py-4">
                Última Actualización
              </TableHead>
              {showActions && (
                <TableHead className="text-center text-white font-bold text-lg py-4">
                  Acciones
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow
                key={item.id}
                className={`border-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <TableCell className="font-bold text-lg py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        type === 'full' ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                    >
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <span
                      className={
                        type === 'full' ? 'text-green-800' : 'text-orange-800'
                      }
                    >
                      {getDisplayName(item)}
                    </span>
                  </div>
                </TableCell>
                {type === 'empty' && (
                  <>
                    <TableCell className="py-4">
                      <Badge className="bg-blue-100 text-blue-800 font-semibold">
                        {(item as InventoryEmpty).brand}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className="bg-purple-100 text-purple-800 font-semibold">
                        {(item as InventoryEmpty).color}
                      </Badge>
                    </TableCell>
                  </>
                )}
                <TableCell className="text-right py-4">
                  <Badge
                    className={`font-bold text-lg px-4 py-2 ${
                      item.quantity > 10
                        ? 'bg-green-500 text-white'
                        : item.quantity > 5
                        ? 'bg-yellow-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {item.quantity}
                  </Badge>
                </TableCell>
                {type === 'full' && (
                  <TableCell className="text-right py-4 font-semibold text-lg text-green-700">
                    {formatCurrency((item as InventoryFull).unit_cost)}
                  </TableCell>
                )}
                <TableCell className="text-right py-4 text-sm text-gray-600">
                  {new Date(item.updated_at).toLocaleDateString('es-CO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                {showActions && (
                  <TableCell className="text-center py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="hover:bg-blue-100 border-blue-300 text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOperation(item, 'add')}
                        className="hover:bg-green-100 border-green-300 text-green-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOperation(item, 'subtract')}
                        className="hover:bg-orange-100 border-orange-300 text-orange-700"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOperation(item, 'set')}
                        className="hover:bg-purple-100 border-purple-300 text-purple-700"
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
