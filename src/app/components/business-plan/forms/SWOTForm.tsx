import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { SWOTAnalysis } from '@/app/types/businessPlan';
import { Plus, X, TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react';

interface SWOTFormProps {
  data?: SWOTAnalysis;
  onChange: (data: SWOTAnalysis) => void;
}

export default function SWOTForm({ data, onChange }: SWOTFormProps) {
  const [swot, setSwot] = useState<SWOTAnalysis>(
    data || {
      strengths: [''],
      weaknesses: [''],
      opportunities: [''],
      threats: [''],
    }
  );

  const addItem = (category: keyof SWOTAnalysis) => {
    const updated = {
      ...swot,
      [category]: [...swot[category], ''],
    };
    setSwot(updated);
    onChange(updated);
  };

  const removeItem = (category: keyof SWOTAnalysis, index: number) => {
    const updated = {
      ...swot,
      [category]: swot[category].filter((_, i) => i !== index),
    };
    setSwot(updated);
    onChange(updated);
  };

  const updateItem = (category: keyof SWOTAnalysis, index: number, value: string) => {
    const updated = {
      ...swot,
      [category]: swot[category].map((item, i) => (i === index ? value : item)),
    };
    setSwot(updated);
    onChange(updated);
  };

  const sections = [
    {
      key: 'strengths' as keyof SWOTAnalysis,
      title: 'نقاط القوة',
      subtitle: 'Strengths',
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/10',
    },
    {
      key: 'weaknesses' as keyof SWOTAnalysis,
      title: 'نقاط الضعف',
      subtitle: 'Weaknesses',
      icon: TrendingDown,
      color: 'bg-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/10',
    },
    {
      key: 'opportunities' as keyof SWOTAnalysis,
      title: 'الفرص',
      subtitle: 'Opportunities',
      icon: Target,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/10',
    },
    {
      key: 'threats' as keyof SWOTAnalysis,
      title: 'التهديدات',
      subtitle: 'Threats',
      icon: AlertTriangle,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <Card key={section.key} className={section.bgColor}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${section.color} text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg">{section.title}</div>
                  <div className="text-sm font-normal text-gray-500">{section.subtitle}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {swot[section.key].map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateItem(section.key, index, e.target.value)}
                    placeholder={`أدخل ${section.title}...`}
                    className="flex-1"
                  />
                  {swot[section.key].length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(section.key, index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addItem(section.key)}
                className="w-full"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة المزيد
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}