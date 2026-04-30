import React from 'react';
import { motion } from 'motion/react';
import { X, Eye, FileText, Users, Building2, Briefcase, Settings, BarChart3, DollarSign, BookOpen, Layers, Shield, Boxes, Grid3x3, Target } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';

interface LevelPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  levelNumber: number;
}

export function LevelPreview({ isOpen, onClose, levelNumber }: LevelPreviewProps) {
  const { language } = useYieldX();

  // Translations
  const t = {
    preview: language === 'ar' ? 'معاينة المستوى' : 'Level Preview',
    studentView: language === 'ar' ? 'ما يراه الطالب' : 'Student View',
    close: language === 'ar' ? 'إغلاق' : 'Close',
    viewOnly: language === 'ar' ? 'للمعاينة فقط - لن يتم حفظ البيانات' : 'Preview Only - Data will not be saved',
    newSystem: language === 'ar' ? '🆕 النظام الجديد (0-7)' : '🆕 New System (0-7)',
  };

  // NEW 7-LEVEL SYSTEM (0-7) - Updated configurations following Omani standards
  const levelConfigs = {
    0: {
      titleAr: 'المستوى 0: اختيار نوع المشروع',
      titleEn: 'Level 0: Project Type Selection',
      icon: <Layers className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      fields: [
        { nameAr: 'نوع المشروع', nameEn: 'Project Type', type: 'select', required: true, options: ['زراعي', 'صناعي', 'تجاري', 'خدمي'] },
        { nameAr: 'وصف موجز', nameEn: 'Brief Description', type: 'textarea', required: true },
      ],
    },
    1: {
      titleAr: 'المستوى 1: الهوية والملكية',
      titleEn: 'Level 1: Identity & Ownership',
      icon: <Building2 className="w-6 h-6" />,
      color: 'from-purple-500 to-indigo-500',
      fields: [
        { nameAr: 'الاسم التجاري', nameEn: 'Business Name', type: 'text', required: true },
        { nameAr: 'فكرة المشروع', nameEn: 'Project Idea', type: 'text', required: true },
        { nameAr: 'وصف المنتج/الخدمة', nameEn: 'Product/Service Description', type: 'textarea', required: true },
        { nameAr: 'حالة المشروع', nameEn: 'Project Status', type: 'select', required: true, options: ['فكرة', 'قيد التخطيط', 'قيد التنفيذ', 'قائم'] },
        { nameAr: 'الموقع', nameEn: 'Location', type: 'text', required: true },
        { nameAr: 'المالك 1 - الاسم', nameEn: 'Owner 1 - Name', type: 'text', required: true },
        { nameAr: 'المالك 1 - الجنسية', nameEn: 'Owner 1 - Nationality', type: 'select', required: true, options: ['عماني', 'وافد'] },
        { nameAr: 'المالك 1 - نسبة الملكية %', nameEn: 'Owner 1 - Share %', type: 'number', required: true },
        { nameAr: 'المالك 1 - العمر', nameEn: 'Owner 1 - Age', type: 'number', required: true },
        { nameAr: 'المالك 1 - الخبرة', nameEn: 'Owner 1 - Experience', type: 'select', required: true, options: ['مبتدئ', 'متوسط', 'خبير'] },
      ],
    },
    2: {
      titleAr: 'المستوى 2: الإطار القانوني والتنظيمي',
      titleEn: 'Level 2: Legal Framework',
      icon: <Shield className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      fields: [
        { nameAr: 'الترخيص 1 - الاسم', nameEn: 'License 1 - Name', type: 'text', required: true },
        { nameAr: 'الترخيص 1 - الجهة المصدرة', nameEn: 'License 1 - Issuing Authority', type: 'text', required: true },
        { nameAr: 'الترخيص 1 - التكلفة', nameEn: 'License 1 - Cost', type: 'number', required: true },
        { nameAr: 'الترخيص 1 - الحالة', nameEn: 'License 1 - Status', type: 'select', required: true, options: ['مطلوب', 'قيد الإجراء', 'مكتمل'] },
        { nameAr: 'عقود الإيجار - محل', nameEn: 'Lease Agreements - Shop', type: 'number', required: false },
        { nameAr: 'عقود الإيجار - مستودع', nameEn: 'Lease Agreements - Warehouse', type: 'number', required: false },
        { nameAr: 'عقود الإيجار - مسكن', nameEn: 'Lease Agreements - Housing', type: 'number', required: false },
        { nameAr: 'عقود الإيجار - أخرى', nameEn: 'Lease Agreements - Other', type: 'number', required: false },
      ],
    },
    3: {
      titleAr: 'المستوى 3: الأصول',
      titleEn: 'Level 3: Assets',
      icon: <Boxes className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      fields: [
        { nameAr: 'الأصل 1 - الاسم', nameEn: 'Asset 1 - Name', type: 'text', required: true },
        { nameAr: 'الأصل 1 - النوع', nameEn: 'Asset 1 - Type', type: 'select', required: true, options: ['مباني', 'آلات', 'معدات', 'أثاث', 'مركبات', 'أخرى'] },
        { nameAr: 'الأصل 1 - طريقة الحصول', nameEn: 'Asset 1 - Acquisition', type: 'select', required: true, options: ['شراء', 'إيجار'] },
        { nameAr: 'الأصل 1 - التكلفة', nameEn: 'Asset 1 - Cost', type: 'number', required: true },
        { nameAr: 'الأصل 1 - الكمية', nameEn: 'Asset 1 - Quantity', type: 'number', required: true },
        { nameAr: 'المادة الخام 1 - الاسم', nameEn: 'Raw Material 1 - Name', type: 'text', required: false },
        { nameAr: 'المادة الخام 1 - التكلفة الشهرية', nameEn: 'Raw Material 1 - Monthly Cost', type: 'number', required: false },
        { nameAr: 'إجمالي الأصول', nameEn: 'Total Assets', type: 'number', required: true },
        { nameAr: 'إجمالي الإهلاك السنوي', nameEn: 'Total Annual Depreciation', type: 'number', required: true },
      ],
    },
    4: {
      titleAr: 'المستوى 4: الموارد البشرية والتنظيمية',
      titleEn: 'Level 4: Human Resources',
      icon: <Users className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      fields: [
        { nameAr: 'الموظف 1 - المسمى الوظيفي', nameEn: 'Employee 1 - Position', type: 'text', required: true },
        { nameAr: 'الموظف 1 - الجنسية', nameEn: 'Employee 1 - Nationality', type: 'select', required: true, options: ['عماني', 'وافد'] },
        { nameAr: 'الموظف 1 - الراتب الشهري', nameEn: 'Employee 1 - Monthly Salary', type: 'number', required: true },
        { nameAr: 'الموظف 1 - العدد', nameEn: 'Employee 1 - Count', type: 'number', required: true },
        { nameAr: 'نسبة التعمين %', nameEn: 'Omanization Rate %', type: 'number', required: true },
        { nameAr: 'إجمالي الرواتب الشهرية', nameEn: 'Total Monthly Salaries', type: 'number', required: true },
        { nameAr: 'تكلفة التأمينات الاجتماعية', nameEn: 'Social Insurance Cost', type: 'number', required: true },
        { nameAr: 'تكلفة التأمين الصحي', nameEn: 'Health Insurance Cost', type: 'number', required: true },
        { nameAr: 'تكلفة التدريب السنوية', nameEn: 'Annual Training Cost', type: 'number', required: false },
      ],
    },
    5: {
      titleAr: 'المستوى 5: السوق والاستراتيجية',
      titleEn: 'Level 5: Market & Strategy',
      icon: <Target className="w-6 h-6" />,
      color: 'from-pink-500 to-purple-500',
      fields: [
        { nameAr: 'المنافس 1 - الاسم', nameEn: 'Competitor 1 - Name', type: 'text', required: true },
        { nameAr: 'المنافس 1 - نقاط القوة', nameEn: 'Competitor 1 - Strengths', type: 'textarea', required: true },
        { nameAr: 'المنافس 1 - نقاط الضعف', nameEn: 'Competitor 1 - Weaknesses', type: 'textarea', required: true },
        { nameAr: 'المنتج/الخدمة 1 - الاسم', nameEn: 'Product/Service 1 - Name', type: 'text', required: true },
        { nameAr: 'المنتج/الخدمة 1 - السعر', nameEn: 'Product/Service 1 - Price', type: 'number', required: true },
        { nameAr: 'المنتج/الخدمة 1 - الكمية الشهرية', nameEn: 'Product/Service 1 - Monthly Quantity', type: 'number', required: true },
        { nameAr: 'أولاً: SWOT مشروعنا - نقاط القوة', nameEn: 'First: Our Project SWOT - Strengths', type: 'textarea', required: true },
        { nameAr: 'أولاً: SWOT مشروعنا - نقاط الضعف', nameEn: 'First: Our Project SWOT - Weaknesses', type: 'textarea', required: true },
        { nameAr: 'أولاً: SWOT مشروعنا - الفرص', nameEn: 'First: Our Project SWOT - Opportunities', type: 'textarea', required: true },
        { nameAr: 'أولاً: SWOT مشروعنا - التهديدات', nameEn: 'First: Our Project SWOT - Threats', type: 'textarea', required: true },
        { nameAr: 'ثانياً: SWOT المنافسين - نقاط القوة', nameEn: 'Second: Competitors SWOT - Strengths', type: 'textarea', required: false },
        { nameAr: 'ثانياً: SWOT المنافسين - نقاط الضعف', nameEn: 'Second: Competitors SWOT - Weaknesses', type: 'textarea', required: false },
        { nameAr: 'ثانياً: SWOT المنافسين - الفرص', nameEn: 'Second: Competitors SWOT - Opportunities', type: 'textarea', required: false },
        { nameAr: 'ثانياً: SWOT المنافسين - التهديدات', nameEn: 'Second: Competitors SWOT - Threats', type: 'textarea', required: false },
        { nameAr: 'إجمالي الإيرادات الشهرية', nameEn: 'Total Monthly Revenue', type: 'number', required: true },
      ],
    },
    6: {
      titleAr: 'المستوى 6: التمويل والمؤشرات المالية',
      titleEn: 'Level 6: Financing & Financial KPIs',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-cyan-500 to-blue-500',
      fields: [
        { nameAr: 'إجمالي الاستثمار المطلوب', nameEn: 'Total Investment Required', type: 'number', required: true },
        { nameAr: 'رأس المال الخاص', nameEn: 'Equity Capital', type: 'number', required: true },
        { nameAr: 'القرض المطلوب', nameEn: 'Loan Amount', type: 'number', required: false },
        { nameAr: 'سعر الفائدة السنوي %', nameEn: 'Annual Interest Rate %', type: 'number', required: false },
        { nameAr: 'فترة السداد (سنوات)', nameEn: 'Loan Term (Years)', type: 'number', required: false },
        { nameAr: 'معدل نمو الإيرادات السنوي %', nameEn: 'Annual Revenue Growth %', type: 'number', required: true },
        { nameAr: 'معدل نمو التكاليف السنوي %', nameEn: 'Annual Cost Growth %', type: 'number', required: true },
        { nameAr: 'معدل العائد الداخلي (IRR) %', nameEn: 'Internal Rate of Return (IRR) %', type: 'number', required: false },
        { nameAr: 'صافي القيمة الحالية (NPV)', nameEn: 'Net Present Value (NPV)', type: 'number', required: false },
        { nameAr: 'العائد على الاستثمار (ROI) %', nameEn: 'Return on Investment (ROI) %', type: 'number', required: false },
        { nameAr: 'فترة الاسترداد (سنوات)', nameEn: 'Payback Period (years)', type: 'number', required: false },
        { nameAr: 'نقطة التعادل (وحدات/شهر)', nameEn: 'Break-even Point (units/month)', type: 'number', required: false },
      ],
    },
    7: {
      titleAr: 'المستوى 7: النموذج الشامل والتنفيذ',
      titleEn: 'Level 7: BMC & Implementation',
      icon: <Grid3x3 className="w-6 h-6" />,
      color: 'from-indigo-500 to-purple-500',
      fields: [
        { nameAr: 'BMC - الشركاء الرئيسيون', nameEn: 'BMC - Key Partners', type: 'textarea', required: true },
        { nameAr: 'BMC - الأنشطة الرئيسية', nameEn: 'BMC - Key Activities', type: 'textarea', required: true },
        { nameAr: 'BMC - الموارد الرئيسية', nameEn: 'BMC - Key Resources', type: 'textarea', required: true },
        { nameAr: 'BMC - عرض القيمة', nameEn: 'BMC - Value Proposition', type: 'textarea', required: true },
        { nameAr: 'BMC - العلاقة مع العملاء', nameEn: 'BMC - Customer Relationships', type: 'textarea', required: true },
        { nameAr: 'BMC - القنوات', nameEn: 'BMC - Channels', type: 'textarea', required: true },
        { nameAr: 'BMC - شرائح العملاء', nameEn: 'BMC - Customer Segments', type: 'textarea', required: true },
        { nameAr: 'BMC - هيكل التكاليف', nameEn: 'BMC - Cost Structure', type: 'textarea', required: true },
        { nameAr: 'BMC - مصادر الإيرادات', nameEn: 'BMC - Revenue Streams', type: 'textarea', required: true },
        { nameAr: 'الجدول الزمني - المعلم 1', nameEn: 'Timeline - Milestone 1', type: 'text', required: true },
        { nameAr: 'رؤية عُمان 2040 - الوظائف المباشرة', nameEn: 'Oman 2040 - Direct Jobs', type: 'number', required: true },
        { nameAr: 'رؤية عُمان 2040 - المساهمة في التنويع الاقتصادي', nameEn: 'Oman 2040 - Economic Diversification', type: 'textarea', required: true },
      ],
    },
  };

  const level = levelConfigs[levelNumber as keyof typeof levelConfigs];
  
  if (!level) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-[#1B1B3A]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center shadow-lg`}>
              {level.icon}
            </div>
            <div>
              <div>{t.preview}: {language === 'ar' ? level.titleAr : level.titleEn}</div>
              <p className="text-sm font-normal text-slate-600 dark:text-gray-400">
                {t.studentView}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* New System Badge */}
        <div className="px-6 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
              {t.newSystem}
            </p>
          </div>
        </div>

        {/* Preview Notice */}
        <div className="px-6 py-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              {t.viewOnly}
            </p>
          </div>
        </div>

        {/* Form Preview */}
        <div className="flex-1 overflow-auto px-6 pb-6">
          <div className="space-y-6">
            {level.fields.map((field, index) => (
              <div key={index} className="space-y-2">
                <Label className="text-slate-900 dark:text-white flex items-center gap-2">
                  {language === 'ar' ? field.nameAr : field.nameEn}
                  {field.required && (
                    <span className="text-red-500 text-sm">*</span>
                  )}
                  {!field.required && (
                    <span className="text-slate-400 text-xs">
                      ({language === 'ar' ? 'اختياري' : 'optional'})
                    </span>
                  )}
                </Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    placeholder={language === 'ar' ? field.nameAr : field.nameEn}
                    disabled
                    className="bg-slate-50 dark:bg-slate-800/50"
                    rows={4}
                  />
                ) : field.type === 'select' ? (
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder={`${language === 'ar' ? 'اختر' : 'Select'}: ${field.options?.join(', ')}`}
                      disabled
                      className="bg-slate-50 dark:bg-slate-800/50"
                    />
                  </div>
                ) : (
                  <Input
                    type={field.type}
                    placeholder={language === 'ar' ? field.nameAr : field.nameEn}
                    disabled
                    className="bg-slate-50 dark:bg-slate-800/50"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs text-slate-500 dark:text-gray-400 text-center">
            {language === 'ar' 
              ? `هذا المستوى يحتوي على ${level.fields.length} حقل${level.fields.length > 2 ? 'اً' : ''} للطلاب لملئها`
              : `This level contains ${level.fields.length} field${level.fields.length > 1 ? 's' : ''} for students to complete`
            }
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}