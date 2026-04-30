import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent } from '@/app/components/ui/card';
import { Shareholder } from '@/app/types/businessPlan';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareholdersFormProps {
  data: Shareholder[];
  onChange: (data: Shareholder[]) => void;
}

export default function ShareholdersForm({ data, onChange }: ShareholdersFormProps) {
  const [shareholders, setShareholders] = useState<Shareholder[]>(data || []);

  const addShareholder = () => {
    const newShareholder: Shareholder = {
      id: Date.now().toString(),
      name: '',
      nationality: 'سعودي',
      idNumber: '',
      shares: 0,
      sharePercentage: 0,
      capitalContribution: 0,
      role: '',
    };
    const updated = [...shareholders, newShareholder];
    setShareholders(updated);
    onChange(updated);
  };

  const removeShareholder = (id: string) => {
    const updated = shareholders.filter((s) => s.id !== id);
    setShareholders(updated);
    onChange(updated);
    toast.success('تم حذف المساهم');
  };

  const updateShareholder = (id: string, field: keyof Shareholder, value: any) => {
    const updated = shareholders.map((s) => {
      if (s.id === id) {
        const updatedShareholder = { ...s, [field]: value };
        
        // Auto-calculate sharePercentage if shares change
        if (field === 'shares' || field === 'capitalContribution') {
          const totalShares = shareholders.reduce((sum, sh) => 
            sh.id === id ? sum + Number(value) : sum + sh.shares, 0);
          updatedShareholder.sharePercentage = totalShares > 0 
            ? (Number(value) / totalShares) * 100 
            : 0;
        }
        
        return updatedShareholder;
      }
      return s;
    });
    
    setShareholders(updated);
    onChange(updated);
  };

  const totalShares = shareholders.reduce((sum, s) => sum + s.shares, 0);
  const totalCapital = shareholders.reduce((sum, s) => sum + s.capitalContribution, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">المساهمون والشركاء</h3>
          <p className="text-sm text-gray-500">أدخل معلومات جميع الشركاء في المشروع</p>
        </div>
        <Button onClick={addShareholder} className="bg-[#4ECDC4] hover:bg-[#3dbdb4]">
          <Plus className="w-4 h-4 ml-2" />
          إضافة مساهم
        </Button>
      </div>

      <div className="space-y-4">
        {shareholders.map((shareholder, index) => (
          <Card key={shareholder.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">المساهم {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeShareholder(shareholder.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>الاسم الكامل *</Label>
                    <Input
                      value={shareholder.name}
                      onChange={(e) => updateShareholder(shareholder.id, 'name', e.target.value)}
                      placeholder="أدخل الاسم"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>الجنسية *</Label>
                    <Input
                      value={shareholder.nationality}
                      onChange={(e) => updateShareholder(shareholder.id, 'nationality', e.target.value)}
                      placeholder="سعودي"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>رقم الهوية *</Label>
                    <Input
                      value={shareholder.idNumber}
                      onChange={(e) => updateShareholder(shareholder.id, 'idNumber', e.target.value)}
                      placeholder="رقم الهوية الوطنية"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>عدد الأسهم *</Label>
                    <Input
                      type="number"
                      value={shareholder.shares}
                      onChange={(e) => updateShareholder(shareholder.id, 'shares', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>نسبة المساهمة</Label>
                    <Input
                      type="number"
                      value={shareholder.sharePercentage.toFixed(2)}
                      readOnly
                      className="bg-gray-50"
                      placeholder="0%"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>المساهمة المالية (ريال) *</Label>
                    <Input
                      type="number"
                      value={shareholder.capitalContribution}
                      onChange={(e) => updateShareholder(shareholder.id, 'capitalContribution', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>الدور/المنصب *</Label>
                    <Input
                      value={shareholder.role}
                      onChange={(e) => updateShareholder(shareholder.id, 'role', e.target.value)}
                      placeholder="مثال: المدير التنفيذي"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>رقم الهاتف</Label>
                    <Input
                      value={shareholder.phone || ''}
                      onChange={(e) => updateShareholder(shareholder.id, 'phone', e.target.value)}
                      placeholder="+966 xx xxx xxxx"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      value={shareholder.email || ''}
                      onChange={(e) => updateShareholder(shareholder.id, 'email', e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {shareholders.length > 0 && (
        <Card className="bg-[#1B1B3A] text-white">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-300">إجمالي الأسهم</p>
                <p className="text-2xl font-bold text-[#4ECDC4]">{totalShares.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-300">رأس المال الإجمالي</p>
                <p className="text-2xl font-bold text-[#4ECDC4]">{totalCapital.toLocaleString()} ريال</p>
              </div>
              <div>
                <p className="text-sm text-gray-300">عدد المساهمين</p>
                <p className="text-2xl font-bold text-[#4ECDC4]">{shareholders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}