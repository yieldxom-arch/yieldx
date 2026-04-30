import React from 'react';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { MarketingMix } from '@/app/types/businessPlan';
import { Package, DollarSign, MapPin, Megaphone } from 'lucide-react';

interface MarketingMixFormProps {
  data?: MarketingMix;
  onChange: (data: MarketingMix) => void;
}

export default function MarketingMixForm({ data, onChange }: MarketingMixFormProps) {
  const updateField = (category: keyof MarketingMix, field: string, value: any) => {
    onChange({
      ...data,
      [category]: {
        ...(data?.[category] || {}),
        [field]: value,
      },
    } as MarketingMix);
  };

  const sections = [
    {
      key: 'product',
      title: 'المنتج',
      subtitle: 'Product',
      icon: Package,
      color: 'bg-blue-500',
      fields: [
        { key: 'description', label: 'الوصف', type: 'textarea' },
        { key: 'quality', label: 'الجودة', type: 'input' },
        { key: 'packaging', label: 'التغليف', type: 'input' },
      ],
    },
    {
      key: 'price',
      title: 'السعر',
      subtitle: 'Price',
      icon: DollarSign,
      color: 'bg-green-500',
      fields: [
        { key: 'strategy', label: 'استراتيجية التسعير', type: 'input' },
        { key: 'basePrice', label: 'السعر الأساسي', type: 'number' },
        { key: 'discounts', label: 'الخصومات', type: 'input' },
        { key: 'paymentTerms', label: 'شروط الدفع', type: 'input' },
      ],
    },
    {
      key: 'place',
      title: 'المكان',
      subtitle: 'Place',
      icon: MapPin,
      color: 'bg-purple-500',
      fields: [
        { key: 'location', label: 'الموقع', type: 'input' },
        { key: 'coverage', label: 'التغطية', type: 'input' },
      ],
    },
    {
      key: 'promotion',
      title: 'الترويج',
      subtitle: 'Promotion',
      icon: Megaphone,
      color: 'bg-orange-500',
      fields: [
        { key: 'budget', label: 'الميزانية', type: 'number' },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <Card key={section.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${section.color} text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div>{section.title}</div>
                  <div className="text-sm font-normal text-gray-500">{section.subtitle}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label>{field.label}</Label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      value={data?.[section.key as keyof MarketingMix]?.[field.key] || ''}
                      onChange={(e) => updateField(section.key as keyof MarketingMix, field.key, e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <Input
                      type={field.type}
                      value={data?.[section.key as keyof MarketingMix]?.[field.key] || ''}
                      onChange={(e) => updateField(section.key as keyof MarketingMix, field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}