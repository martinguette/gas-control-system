import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import VendorLayout from '@/components/layout/vendor-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
  Receipt,
  DollarSign,
  Camera,
  MapPin,
  Plus,
  ArrowLeft,
  Upload,
} from 'lucide-react';
import Link from 'next/link';

export default async function ExpensesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/log-in');
  }

  const role = (user.user_metadata as Record<string, unknown> | null)?.role;
  if (role !== 'vendedor') {
    redirect('/dashboard/admin');
  }

  const expenseCategories = [
    { value: 'food', label: 'Comida y Bebidas' },
    { value: 'transport', label: 'Transporte' },
    { value: 'fuel', label: 'Combustible' },
    { value: 'parking', label: 'Estacionamiento' },
    { value: 'communication', label: 'Comunicaciones' },
    { value: 'supplies', label: 'Suministros' },
    { value: 'other', label: 'Otros' },
  ];

  return (
    <VendorLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/vendor">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Receipt className="h-5 w-5 text-red-600" />
              Registrar Gasto
            </h1>
            <p className="text-sm text-muted-foreground">
              Registra un gasto del día
            </p>
          </div>
        </div>

        {/* Expense Category */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-blue-600" />
              Categoría del Gasto
            </CardTitle>
            <CardDescription>
              Selecciona la categoría que mejor describe el gasto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Amount and Description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Detalles del Gasto
            </CardTitle>
            <CardDescription>
              Ingresa el monto y descripción del gasto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  className="pl-10 text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe el gasto realizado..."
                className="text-sm min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Receipt Photo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-4 w-4 text-purple-600" />
              Foto del Recibo
            </CardTitle>
            <CardDescription>
              Toma una foto del recibo para respaldar el gasto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Photo Preview Placeholder */}
              <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                <Camera className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 text-center">
                  Toca para tomar foto del recibo
                </p>
                <p className="text-xs text-gray-400">
                  o selecciona desde galería
                </p>
              </div>

              {/* Photo Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-10">
                  <Camera className="mr-2 h-4 w-4" />
                  Cámara
                </Button>
                <Button variant="outline" className="h-10">
                  <Upload className="mr-2 h-4 w-4" />
                  Galería
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-600" />
              Ubicación
            </CardTitle>
            <CardDescription>
              Registra dónde se realizó el gasto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación del gasto</Label>
              <Input
                id="location"
                placeholder="Ej: Restaurante El Buen Sabor, Zona Norte"
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Today's Expenses Summary */}
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-red-800">
              Gastos del Día
            </CardTitle>
            <CardDescription className="text-red-600">
              Resumen de gastos registrados hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total de gastos:</span>
                <span className="font-bold text-red-600">$150.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Número de gastos:</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Último gasto:</span>
                <span className="text-xs text-muted-foreground">
                  Hace 1 hora
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3 pb-4">
          <Button className="w-full h-12 text-base" size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Registrar Gasto
          </Button>
          <Link href="/dashboard/vendor" className="block">
            <Button variant="outline" className="w-full h-12" size="lg">
              Cancelar
            </Button>
          </Link>
        </div>
      </div>
    </VendorLayout>
  );
}
