import React from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent } from '@/app/components/ui/card';
import { Product } from '@/app/types/businessPlan';
import { Plus, Trash2 } from 'lucide-react';

interface ProductsFormProps {
  data: Product[];
  onChange: (data: Product[]) => void;
}

export default function ProductsForm({ data, onChange }: ProductsFormProps) {
  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: '',
      description: '',
      category: '',
      unit: 'وحدة',
      unitPrice: 0,
      targetQuantityYear1: 0,
      targetQuantityYear2: 0,
      targetQuantityYear3: 0,
    };
    onChange([...data, newProduct]);
  };

  const removeProduct = (id: string) => {
    onChange(data.filter((p) => p.id !== id));
  };

  const updateProduct = (id: string, field: keyof Product, value: any) => {
    onChange(data.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">حدد المنتجات أو الخدمات التي سيقدمها المشروع</p>
        <Button onClick={addProduct} className="bg-[#4ECDC4] hover:bg-[#3dbdb4]">
          <Plus className="w-4 h-4 ml-2" />
          إضافة منتج
        </Button>
      </div>

      {data.map((product, index) => (
        <Card key={product.id}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">منتج {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProduct(product.id)}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>اسم المنتج *</Label>
                  <Input
                    value={product.name}
                    onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الفئة</Label>
                  <Input
                    value={product.category}
                    onChange={(e) => updateProduct(product.id, 'category', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الوحدة</Label>
                  <Input
                    value={product.unit}
                    onChange={(e) => updateProduct(product.id, 'unit', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>سعر الوحدة (ريال)</Label>
                  <Input
                    type="number"
                    value={product.unitPrice}
                    onChange={(e) => updateProduct(product.id, 'unitPrice', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الكمية المستهدفة - السنة 1</Label>
                  <Input
                    type="number"
                    value={product.targetQuantityYear1}
                    onChange={(e) => updateProduct(product.id, 'targetQuantityYear1', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الكمية المستهدفة - السنة 2</Label>
                  <Input
                    type="number"
                    value={product.targetQuantityYear2}
                    onChange={(e) => updateProduct(product.id, 'targetQuantityYear2', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}