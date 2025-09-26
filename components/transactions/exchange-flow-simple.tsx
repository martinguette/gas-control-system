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
    <div className="space-y-6">
      {/* Card para Agregar Cilindro Vacío */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-base text-blue-800">
              Agregar Cilindro Vacío
            </CardTitle>
          </div>
          <CardDescription className="text-blue-600">
            Registra los cilindros vacíos que el cliente te entrega
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <FormLabel className="text-xs text-blue-700">Marca</FormLabel>
              <Select value={currentBrand} onValueChange={setCurrentBrand}>
                <SelectTrigger className="text-sm border-blue-200">
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
                        <Badge variant="outline" className="text-xs">
                          {brand.color}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <FormLabel className="text-xs text-blue-700">Tipo</FormLabel>
              <Select value={currentType} onValueChange={setCurrentType}>
                <SelectTrigger className="text-sm border-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CYLINDER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{type.label}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {type.weight}kg
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <FormLabel className="text-xs text-blue-700">Cantidad</FormLabel>
              <Input
                type="number"
                min="1"
                max="100"
                value={currentQuantity}
                onChange={(e) =>
                  setCurrentQuantity(parseInt(e.target.value) || 1)
                }
                className="text-sm border-blue-200"
              />
            </div>

            <div>
              <Button
                type="button"
                onClick={addEmptyCylinder}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Cilindro Vacío
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Cilindros Vacíos Agregados */}
      {emptyCylinders.length > 0 && (
        <Card className="border-gray-200 bg-gray-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-600" />
              <CardTitle className="text-base text-gray-800">
                Cilindros Vacíos Recibidos ({emptyCylinders.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {emptyCylinders.map((cylinder) => (
                <Card
                  key={cylinder.id}
                  className="p-3 bg-white border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
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
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {cylinder.brand} {cylinder.type}
                        </p>
                        <p className="text-xs text-gray-600">
                          {cylinder.quantity} unidades
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeEmptyCylinder(cylinder.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 border-red-200"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flecha de Proceso */}
      {emptyCylinders.length > 0 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-blue-600">
            <ArrowRight className="h-5 w-5" />
            <span className="text-sm font-medium">Cálculo Automático</span>
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      )}

      {/* Sección de Llenos a Entregar */}
      {calculatedItems.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-green-600" />
              <CardTitle className="text-base text-green-800">
                Cilindros Llenos a Entregar
              </CardTitle>
            </div>
            <CardDescription className="text-green-600">
              Calculados automáticamente basados en los vacíos recibidos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              {calculatedItems.map((item, index) => {
                const cylinderType = CYLINDER_TYPES.find(
                  (type) => type.value === item.product_type
                );
                return (
                  <Card key={index} className="p-3 bg-white border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: '#f97316' }} // Naranja para Roscogas
                        />
                        <div>
                          <p className="font-medium text-green-800">
                            {item.quantity}x {cylinderType?.label}
                          </p>
                          <p className="text-xs text-green-600">
                            Roscogas - Naranja
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-green-700 border-green-300"
                      >
                        {item.quantity} unidades
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Resumen de Llenos */}
            <div className="bg-green-100 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Resumen de Llenos a Entregar
                </span>
              </div>
              <div className="text-sm text-green-700">
                <p>
                  Total de cilindros llenos:{' '}
                  <strong>{getTotalFullCylinders()}</strong>
                </p>
                <p className="text-xs mt-1">
                  Todos los cilindros llenos son marca <strong>Roscogas</strong>{' '}
                  (color naranja)
                </p>
              </div>
            </div>

            {/* Validación de Consistencia */}
            {getTotalEmptyCylinders() !== getTotalFullCylinders() && (
              <div className="bg-yellow-100 border border-yellow-300 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Advertencia: La cantidad de vacíos recibidos (
                  {getTotalEmptyCylinders()}) no coincide con la cantidad de
                  llenos a entregar ({getTotalFullCylinders()})
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
