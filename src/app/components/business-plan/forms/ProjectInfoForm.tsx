import React from 'react';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { ProjectInfo } from '@/app/types/businessPlan';

interface ProjectInfoFormProps {
  data?: ProjectInfo;
  onChange: (data: ProjectInfo) => void;
}

export default function ProjectInfoForm({ data, onChange }: ProjectInfoFormProps) {
  const handleChange = (field: keyof ProjectInfo, value: any) => {
    onChange({
      ...data,
      [field]: value,
    } as ProjectInfo);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="projectName">اسم المشروع *</Label>
          <Input
            id="projectName"
            value={data?.projectName || ''}
            onChange={(e) => handleChange('projectName', e.target.value)}
            placeholder="أدخل اسم المشروع"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="legalName">الاسم القانوني *</Label>
          <Input
            id="legalName"
            value={data?.legalName || ''}
            onChange={(e) => handleChange('legalName', e.target.value)}
            placeholder="الاسم القانوني المسجل"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="legalForm">الشكل القانوني *</Label>
          <Select
            value={data?.legalForm}
            onValueChange={(value) => handleChange('legalForm', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الشكل القانوني" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="فردي">مؤسسة فردية</SelectItem>
              <SelectItem value="شراكة">شركة تضامنية</SelectItem>
              <SelectItem value="شركة محدودة">شركة ذات مسؤولية محدودة</SelectItem>
              <SelectItem value="شركة مساهمة">شركة مساهمة</SelectItem>
              <SelectItem value="أخرى">أخرى</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectType">نوع المشروع *</Label>
          <Input
            id="projectType"
            value={data?.projectType || ''}
            onChange={(e) => handleChange('projectType', e.target.value)}
            placeholder="مثال: تجاري، صناعي، خدمي"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">القطاع *</Label>
          <Input
            id="industry"
            value={data?.industry || ''}
            onChange={(e) => handleChange('industry', e.target.value)}
            placeholder="القطاع أو المجال"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="establishmentDate">تاريخ التأسيس</Label>
          <Input
            id="establishmentDate"
            type="date"
            value={data?.establishmentDate || ''}
            onChange={(e) => handleChange('establishmentDate', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="commercialRegistration">السجل التجاري</Label>
          <Input
            id="commercialRegistration"
            value={data?.commercialRegistration || ''}
            onChange={(e) => handleChange('commercialRegistration', e.target.value)}
            placeholder="رقم السجل التجاري"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxNumber">الرقم الضريبي</Label>
          <Input
            id="taxNumber"
            value={data?.taxNumber || ''}
            onChange={(e) => handleChange('taxNumber', e.target.value)}
            placeholder="الرقم الضريبي"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف *</Label>
          <Input
            id="phone"
            value={data?.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+966 xx xxx xxxx"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني *</Label>
          <Input
            id="email"
            type="email"
            value={data?.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="email@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">الموقع الإلكتروني</Label>
          <Input
            id="website"
            value={data?.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://www.example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">العنوان *</Label>
          <Input
            id="address"
            value={data?.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="المدينة، الحي، الشارع"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">وصف المشروع *</Label>
        <Textarea
          id="description"
          value={data?.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="وصف شامل للمشروع ونشاطه"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vision">الرؤية *</Label>
          <Textarea
            id="vision"
            value={data?.vision || ''}
            onChange={(e) => handleChange('vision', e.target.value)}
            placeholder="رؤية المشروع المستقبلية"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mission">الرسالة *</Label>
          <Textarea
            id="mission"
            value={data?.mission || ''}
            onChange={(e) => handleChange('mission', e.target.value)}
            placeholder="رسالة المشروع وأهدافه"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}