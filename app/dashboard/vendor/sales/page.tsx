'use client';

import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  Package,
  DollarSign,
  User,
  MapPin,
  Plus,
  ArrowLeft,
  Search,
  Edit3,
  Check,
  X,
  RefreshCcw,
} from 'lucide-react';
import Link from 'next/link';

type CylinderType = '33lb' | '40lb' | '100lb';
type PriceMap = Record<CylinderType, number>;

export default function SalesPage() {
  // Estados del formulario
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [selectedCylinder, setSelectedCylinder] = useState<CylinderType | ''>(
    ''
  );
  const [cylinderQuantity, setCylinderQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  // Estados para múltiples productos
  const [selectedProducts, setSelectedProducts] = useState<
    Array<{
      type: CylinderType;
      quantity: number;
      unitPrice: number;
      total: number;
    }>
  >([]);

  // Estados para precios personalizados
  const [isCustomerRegistered, setIsCustomerRegistered] = useState(false);
  const [customerPrices, setCustomerPrices] = useState<PriceMap>({
    '33lb': 0,
    '40lb': 0,
    '100lb': 0,
  });
  const [editingPrices, setEditingPrices] = useState(false);
  const [tempPrices, setTempPrices] = useState<PriceMap>({
    '33lb': 0,
    '40lb': 0,
    '100lb': 0,
  });

  // Precios estándar (fallback)
  const standardPrices: PriceMap = {
    '33lb': 150,
    '40lb': 200,
    '100lb': 450,
  };

  // Cilindros asignados
  const assignedCylinders = [
    { id: 1, type: '33lb', brand: 'Roscogas', color: 'Naranja', quantity: 5 },
    { id: 2, type: '40lb', brand: 'Roscogas', color: 'Naranja', quantity: 3 },
    { id: 3, type: '100lb', brand: 'Roscogas', color: 'Naranja', quantity: 4 },
  ];

  const transactionTypes = [
    { value: 'intercambio', label: 'Intercambio (Lleno por Vacío)' },
    { value: 'completa', label: 'Venta Completa (Solo Lleno)' },
    { value: 'venta_vacios', label: 'Venta Vacía (Solo Vacío)' },
    { value: 'compra_vacios', label: 'Compra Vacía' },
  ];

  const paymentMethods = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'credito', label: 'Crédito' },
  ];

  // Simular búsqueda de cliente
  const searchCustomer = async (name: string) => {
    if (name.length < 3) {
      setIsCustomerRegistered(false);
      return;
    }

    // Simular búsqueda en base de datos
    // En implementación real, esto haría una consulta a Supabase
    const mockCustomer = {
      name: 'Juan Pérez',
      phone: '555-0123',
      location: 'Zona Norte',
      customPrices: {
        '33lb': 140,
        '40lb': 180,
        '100lb': 420,
      },
    };

    if (name.toLowerCase().includes('juan')) {
      setIsCustomerRegistered(true);
      setCustomerPrices(mockCustomer.customPrices);
      setTempPrices(mockCustomer.customPrices);
      setCustomerPhone(mockCustomer.phone);
      setCustomerLocation(mockCustomer.location);
    } else {
      setIsCustomerRegistered(false);
      setCustomerPrices(standardPrices);
      setTempPrices(standardPrices);
    }
  };

  // Calcular total
  const calculateTotal = () => {
    const total = selectedProducts.reduce(
      (sum, product) => sum + product.total,
      0
    );
    setTotalAmount(total);
  };

  // Agregar producto a la lista
  const addProduct = () => {
    if (selectedCylinder && cylinderQuantity > 0) {
      const unitPrice = editingPrices
        ? tempPrices[selectedCylinder as CylinderType]
        : customerPrices[selectedCylinder as CylinderType];

      const newProduct = {
        type: selectedCylinder as CylinderType,
        quantity: cylinderQuantity,
        unitPrice,
        total: unitPrice * cylinderQuantity,
      };

      // Verificar si ya existe este tipo de cilindro
      const existingIndex = selectedProducts.findIndex(
        (p) => p.type === selectedCylinder
      );

      if (existingIndex >= 0) {
        // Actualizar cantidad existente
        const updatedProducts = [...selectedProducts];
        updatedProducts[existingIndex].quantity += cylinderQuantity;
        updatedProducts[existingIndex].total =
          updatedProducts[existingIndex].quantity * unitPrice;
        setSelectedProducts(updatedProducts);
      } else {
        // Agregar nuevo producto
        setSelectedProducts([...selectedProducts, newProduct]);
      }

      // Resetear selección
      setSelectedCylinder('');
      setCylinderQuantity(1);
    }
  };

  // Remover producto de la lista
  const removeProduct = (index: number) => {
    const updatedProducts = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updatedProducts);
  };

  // Actualizar cantidad de un producto existente
  const updateProductQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeProduct(index);
      return;
    }

    const updatedProducts = [...selectedProducts];
    updatedProducts[index].quantity = newQuantity;
    updatedProducts[index].total =
      newQuantity * updatedProducts[index].unitPrice;
    setSelectedProducts(updatedProducts);
  };

  // Efectos
  useEffect(() => {
    searchCustomer(customerName);
  }, [customerName]);

  useEffect(() => {
    calculateTotal();
  }, [selectedProducts]);

  // Handlers
  const handleEditPrices = () => {
    setEditingPrices(true);
    setTempPrices(customerPrices);
  };

  const handleSavePrices = () => {
    setCustomerPrices(tempPrices);
    setEditingPrices(false);
  };

  const handleCancelEdit = () => {
    setTempPrices(customerPrices);
    setEditingPrices(false);
  };

  const handleSubmit = () => {
    // Aquí se enviaría la venta a la base de datos
    console.log('Venta registrada:', {
      customerName,
      customerPhone,
      customerLocation,
      transactionType,
      products: selectedProducts,
      paymentMethod,
      totalAmount,
    });
  };

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
              <ShoppingCart className="h-5 w-5 text-green-600" />
              Nueva Venta
            </h1>
            <p className="text-sm text-muted-foreground">
              Registra una nueva transacción
            </p>
          </div>
        </div>

        {/* Customer Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Información del Cliente
            </CardTitle>
            <CardDescription>
              Busca el cliente o ingresa uno nuevo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Nombre del Cliente *</Label>
              <div className="relative">
                <Input
                  id="customer-name"
                  placeholder="Ingresa el nombre del cliente"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
              {customerName.length >= 3 && (
                <div className="flex items-center gap-2">
                  {isCustomerRegistered ? (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      <Check className="w-3 h-3 mr-1" />
                      Cliente Registrado
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-blue-600 border-blue-600 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Cliente Nuevo
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="customer-phone">Teléfono</Label>
                <Input
                  id="customer-phone"
                  placeholder="555-0123"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-location">Ubicación *</Label>
                <Input
                  id="customer-location"
                  placeholder="Zona Norte, Pueblo X"
                  value={customerLocation}
                  onChange={(e) => setCustomerLocation(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Type */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              Tipo de Transacción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona el tipo de transacción" />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Product Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-600" />
              Selección de Productos
            </CardTitle>
            <CardDescription>
              Agrega uno o más tipos de cilindros a la venta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cylinder-type">Tipo de Cilindro</Label>
                <Select
                  value={selectedCylinder}
                  onValueChange={(value) =>
                    setSelectedCylinder(value as CylinderType)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona el tipo de cilindro" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedCylinders.map((cylinder) => (
                      <SelectItem key={cylinder.id} value={cylinder.type}>
                        {cylinder.type} - {cylinder.brand} ({cylinder.color}) -
                        Disponibles: {cylinder.quantity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCylinderQuantity(Math.max(1, cylinderQuantity - 1))
                    }
                    disabled={cylinderQuantity <= 1}
                  >
                    -
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={cylinderQuantity}
                    onChange={(e) =>
                      setCylinderQuantity(parseInt(e.target.value) || 1)
                    }
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCylinderQuantity(cylinderQuantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            <Button
              onClick={addProduct}
              disabled={!selectedCylinder || cylinderQuantity <= 0}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Producto
            </Button>
          </CardContent>
        </Card>

        {/* Selected Products */}
        {selectedProducts.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-green-600" />
                Productos Seleccionados ({selectedProducts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedProducts.map((product, index) => (
                <div
                  key={`${product.type}-${index}`}
                  className="flex items-center justify-between p-3 border rounded-lg bg-green-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        Cilindro {product.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Roscogas - Naranja
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateProductQuantity(index, product.quantity - 1)
                        }
                        className="h-8 w-8 p-0"
                      >
                        -
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {product.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateProductQuantity(index, product.quantity + 1)
                        }
                        className="h-8 w-8 p-0"
                      >
                        +
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        ${product.total.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${product.unitPrice} c/u
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeProduct(index)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Pricing */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                Precios por Cilindro
              </CardTitle>
              {!editingPrices ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditPrices}
                  className="text-xs"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  Editar Precios
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSavePrices}
                    className="text-xs"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Guardar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
            <CardDescription>
              {isCustomerRegistered
                ? 'Precios personalizados del cliente (editables)'
                : 'Precios estándar (editables)'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(['33lb', '40lb', '100lb'] as CylinderType[]).map((type) => (
              <div
                key={type}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Cilindro {type}</p>
                    <p className="text-xs text-muted-foreground">
                      Roscogas - Naranja
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">$</span>
                  {editingPrices ? (
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={tempPrices[type as CylinderType]}
                      onChange={(e) =>
                        setTempPrices({
                          ...tempPrices,
                          [type as CylinderType]:
                            parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-20 text-right"
                    />
                  ) : (
                    <span className="font-bold text-green-600 w-20 text-right">
                      {customerPrices[type as CylinderType]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Información de Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-method">Método de Pago</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona el método de pago" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-800">
                  Total a Cobrar:
                </span>
                <span className="text-2xl font-bold text-green-700">
                  ${totalAmount.toLocaleString()}
                </span>
              </div>

              {selectedProducts.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-medium text-green-800">
                    Desglose:
                  </p>
                  {selectedProducts.map((product, index) => (
                    <p key={index} className="text-sm text-green-600">
                      {product.quantity}x Cilindro {product.type} = $
                      {product.total.toLocaleString()}
                    </p>
                  ))}
                </div>
              )}

              {selectedProducts.length === 0 && (
                <p className="text-sm text-green-600 mt-1">
                  Agrega productos para ver el total
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="space-y-3">
          <Button
            className="w-full h-12 text-base"
            size="lg"
            onClick={handleSubmit}
            disabled={
              !customerName ||
              !customerLocation ||
              !transactionType ||
              selectedProducts.length === 0 ||
              !paymentMethod
            }
          >
            <ShoppingCart className="mr-3 h-5 w-5" />
            Registrar Venta
          </Button>

          <Link href="/dashboard/vendor" className="block">
            <Button variant="outline" className="w-full">
              Cancelar
            </Button>
          </Link>
        </div>
      </div>
    </VendorLayout>
  );
}
