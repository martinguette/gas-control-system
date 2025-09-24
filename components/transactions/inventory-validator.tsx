'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Package,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Info,
} from 'lucide-react';

interface InventoryStatus {
  type: '33lb' | '40lb' | '100lb';
  available: number;
  assigned: number;
  total: number;
  status: 'available' | 'low' | 'out';
}

interface InventoryValidatorProps {
  items: Array<{
    product_type: '33lb' | '40lb' | '100lb';
    quantity: number;
  }>;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
}

export function InventoryValidator({
  items,
  onValidationChange,
}: InventoryValidatorProps) {
  const [inventoryStatus, setInventoryStatus] = useState<InventoryStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    checkInventory();
  }, [items]);

  const checkInventory = async () => {
    setIsLoading(true);
    try {
      // Simular datos de inventario - en producción esto vendría de la API
      const mockInventory: InventoryStatus[] = [
        {
          type: '33lb',
          available: 25,
          assigned: 8,
          total: 33,
          status: 'available',
        },
        {
          type: '40lb',
          available: 15,
          assigned: 5,
          total: 20,
          status: 'available',
        },
        {
          type: '100lb',
          available: 3,
          assigned: 2,
          total: 5,
          status: 'low',
        },
      ];

      setInventoryStatus(mockInventory);
      validateItems(mockInventory);
    } catch (error) {
      console.error('Error checking inventory:', error);
      setErrors(['Error al verificar inventario']);
    } finally {
      setIsLoading(false);
    }
  };

  const validateItems = (inventory: InventoryStatus[]) => {
    const validationErrors: string[] = [];

    items.forEach((item) => {
      const inventoryItem = inventory.find(
        (inv) => inv.type === item.product_type
      );

      if (!inventoryItem) {
        validationErrors.push(
          `Tipo de producto ${item.product_type} no encontrado en inventario`
        );
        return;
      }

      if (inventoryItem.available < item.quantity) {
        validationErrors.push(
          `No hay suficientes cilindros de ${item.product_type}. Disponibles: ${inventoryItem.available}, Solicitados: ${item.quantity}`
        );
      }

      if (inventoryItem.status === 'out') {
        validationErrors.push(`Cilindros de ${item.product_type} agotados`);
      }
    });

    setErrors(validationErrors);
    onValidationChange?.(validationErrors.length === 0, validationErrors);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'out':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'out':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'low':
        return 'Stock Bajo';
      case 'out':
        return 'Agotado';
      default:
        return 'Desconocido';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Verificando Inventario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-muted-foreground">
              Verificando disponibilidad...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          Estado del Inventario
        </CardTitle>
        <CardDescription>
          Verificación de disponibilidad para los productos seleccionados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado general del inventario */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {inventoryStatus.map((item) => (
            <div key={item.type} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{item.type}</span>
                <Badge className={getStatusColor(item.status)}>
                  {getStatusIcon(item.status)}
                  <span className="ml-1">{getStatusLabel(item.status)}</span>
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Disponibles:</span>
                  <span className="font-medium">{item.available}</span>
                </div>
                <div className="flex justify-between">
                  <span>Asignados:</span>
                  <span className="font-medium">{item.assigned}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium">{item.total}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Validación de items seleccionados */}
        {items.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">
              Validación de Productos Seleccionados
            </h4>
            {items.map((item, index) => {
              const inventoryItem = inventoryStatus.find(
                (inv) => inv.type === item.product_type
              );
              const isValid =
                inventoryItem && inventoryItem.available >= item.quantity;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <span className="font-medium">{item.product_type}</span>
                      <span className="text-muted-foreground ml-2">
                        Cantidad: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {inventoryItem ? (
                      <div className="text-sm">
                        <div className="font-medium">
                          {inventoryItem.available} disponibles
                        </div>
                        <div
                          className={`text-xs ${
                            isValid ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {isValid ? '✅ Disponible' : '❌ Insuficiente'}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">
                        Producto no encontrado
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Errores de validación */}
        {errors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-medium text-red-900">
                  Errores de Validación:
                </div>
                {errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700">
                    • {error}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Botón de actualización */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={checkInventory}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
            />
            Actualizar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
