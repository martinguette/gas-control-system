'use client';

import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Trash2, ArrowRight, Calculator } from 'lucide-react';
import { SaleFormData } from '@/types';

// Constantes para las opciones
const CYLINDER_TYPES = [
  { value: '33lb', label: '15kg (33lb)', weight: 15 },
  { value: '40lb', label: '18kg (40lb)', weight: 18 },
  { value: '100lb', label: '45kg (100lb)', weight: 45 },
] as const;

const CYLINDER_BRANDS = [
  { value: 'Roscogas', label: 'Roscogas', color: 'Naranja' },
  { value: 'Gasan', label: 'Gasan', color: 'Azul' },
  { value: 'Gaspais', label: 'Gaspais', color: 'Verde Oscuro' },
  { value: 'Vidagas', label: 'Vidagas', color: 'Verde Claro' },
] as const;

interface EmptyCylinder {
  id: string;
  brand: string;
  type: string;
  quantity: number;
}

interface ExchangeFlowSimpleProps {
  onCalculatedItems: (items: any[]) => void;
}

export function ExchangeFlowSimple({
  onCalculatedItems,
}: ExchangeFlowSimpleProps) {
  const [emptyCylinders, setEmptyCylinders] = useState<EmptyCylinder[]>([]);
  const [calculatedItems, setCalculatedItems] = useState<any[]>([]);
  const [currentBrand, setCurrentBrand] = useState('Roscogas');
  const [currentType, setCurrentType] = useState('33lb');
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const { setValue } = useFormContext<SaleFormData>();

  // Función para agregar un cilindro vacío
  const addEmptyCylinder = () => {
    const newEmpty: EmptyCylinder = {
      id: Date.now().toString(),
      brand: currentBrand,
      type: currentType,
      quantity: currentQuantity,
    };
    setEmptyCylinders([...emptyCylinders, newEmpty]);

    // Resetear valores para el siguiente cilindro
    setCurrentBrand('Roscogas');
    setCurrentType('33lb');
    setCurrentQuantity(1);
  };

  // Función para eliminar un cilindro vacío
  const removeEmptyCylinder = (id: string) => {
    setEmptyCylinders((prev) => prev.filter((cylinder) => cylinder.id !== id));
  };

  // Función para calcular los cilindros llenos a entregar
  const calculateFullCylinders = () => {
    // Agrupar vacíos por tipo
    const groupedByType = emptyCylinders.reduce((acc, cylinder) => {
      if (!acc[cylinder.type]) {
        acc[cylinder.type] = 0;
      }
      acc[cylinder.type] += cylinder.quantity;
      return acc;
    }, {} as Record<string, number>);

    // Crear items de entrega
    const items = Object.entries(groupedByType).map(([type, quantity]) => ({
      product_type: type as '33lb' | '40lb' | '100lb',
      quantity,
      unit_cost: 0, // Se calculará con precios del inventario
      total_cost: 0,
    }));

    setCalculatedItems(items);
    onCalculatedItems(items);
  };

  // Calcular automáticamente cuando cambien los vacíos
  useEffect(() => {
    if (emptyCylinders.length > 0) {
      calculateFullCylinders();
    } else {
      setCalculatedItems([]);
      onCalculatedItems([]);
    }
  }, [emptyCylinders]);

  // Función para obtener el color de la marca
  const getBrandColor = (brand: string) => {
    const brandInfo = CYLINDER_BRANDS.find((b) => b.value === brand);
    return brandInfo?.color || 'Gris';
  };

  // Función para obtener el total de vacíos
  const getTotalEmptyCylinders = () => {
    return emptyCylinders.reduce((sum, cylinder) => sum + cylinder.quantity, 0);
  };

  // Función para obtener el total de llenos a entregar
  const getTotalFullCylinders = () => {
    return calculatedItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div className="space-y-4">
      {/* Formulario Simple para Agregar Cilindro Vacío */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-sm font-medium text-blue-800 mb-3">
          Cilindros Vacíos que Recibes del Cliente
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs text-blue-700 block mb-1">Marca</label>
            <Select value={currentBrand} onValueChange={setCurrentBrand}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CYLINDER_BRANDS.map((brand) => (
                  <SelectItem key={brand.value} value={brand.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            brand.color === 'Naranja'
                              ? '#f97316'
                              : brand.color === 'Azul'
                              ? '#3b82f6'
                              : brand.color === 'Verde Oscuro'
                              ? '#166534'
                              : brand.color === 'Verde Claro'
                              ? '#22c55e'
                              : '#6b7280',
                        }}
                      />
                      <span>{brand.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-blue-700 block mb-1">Tipo</label>
            <Select value={currentType} onValueChange={setCurrentType}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CYLINDER_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-blue-700 block mb-1">Cantidad</label>
            <Input
              type="number"
              min="1"
              max="100"
              value={currentQuantity}
              onChange={(e) =>
                setCurrentQuantity(parseInt(e.target.value) || 1)
              }
              className="h-9 text-sm"
            />
          </div>

          <div>
            <Button
              type="button"
              onClick={addEmptyCylinder}
              className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </div>
        </div>
      </div>

      {/* Resumen de Cilindros Vacíos - Cards Pequeños */}
      {emptyCylinders.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-800 mb-3">
            Cilindros Vacíos Recibidos ({emptyCylinders.length})
          </h3>

          <div className="flex flex-wrap gap-2">
            {emptyCylinders.map((cylinder) => (
              <div
                key={cylinder.id}
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      getBrandColor(cylinder.brand) === 'Naranja'
                        ? '#f97316'
                        : getBrandColor(cylinder.brand) === 'Azul'
                        ? '#3b82f6'
                        : getBrandColor(cylinder.brand) === 'Verde Oscuro'
                        ? '#166534'
                        : getBrandColor(cylinder.brand) === 'Verde Claro'
                        ? '#22c55e'
                        : '#6b7280',
                  }}
                />
                <span className="text-sm text-gray-800">
                  {cylinder.brand} {cylinder.type}
                </span>
                <Badge variant="outline" className="text-xs">
                  {cylinder.quantity}
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEmptyCylinder(cylinder.id)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información de Cilindros Llenos a Entregar */}
      {calculatedItems.length > 0 && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-sm font-medium text-green-800 mb-3">
            Cilindros Llenos a Entregar (Roscogas)
          </h3>

          <div className="space-y-2">
            {calculatedItems.map((item, index) => {
              const cylinderType = CYLINDER_TYPES.find(
                (type) => type.value === item.product_type
              );
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-green-200"
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: '#f97316' }} // Naranja para Roscogas
                  />
                  <span className="text-sm text-green-800">
                    {item.quantity}x {cylinderType?.label}
                  </span>
                  <Badge variant="outline" className="text-xs text-green-700">
                    Roscogas
                  </Badge>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-green-200">
            <p className="text-sm text-green-700">
              Total: <strong>{getTotalFullCylinders()}</strong> cilindros llenos
              a entregar
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
