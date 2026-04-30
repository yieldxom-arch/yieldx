import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Calendar,
  CheckSquare,
  ChevronRight,
  ChevronLeft,
  Download,
  X
} from 'lucide-react';
import { BusinessPlan } from '@/app/types/businessPlan';
import ProjectInfoForm from './forms/ProjectInfoForm';
import ShareholdersForm from './forms/ShareholdersForm';
import SWOTForm from './forms/SWOTForm';
import CompetitorsForm from './forms/CompetitorsForm';
import ProductsForm from './forms/ProductsForm';
import MarketingMixForm from './forms/MarketingMixForm';
import FinancialPlanningForm from './forms/FinancialPlanningForm';
import ImplementationForm from './forms/ImplementationForm';
import { exportBusinessPlanToExcel } from '@/app/utils/businessPlanExport';
import { toast } from 'sonner';
import { useYieldX } from '@/app/contexts/YieldXContext';

const STEPS = [
  { id: 'project', title: 'معلومات المشروع', icon: FileText, description: 'البيانات الأساسية للمشروع' },
  { id: 'shareholders', title: 'الشركاء والمساهمون', icon: Users, description: 'معلومات الملاك والشركاء' },
  { id: 'swot', title: 'تحليل SWOT', icon: TrendingUp, description: 'نقاط القوة والضعف' },
  { id: 'market', title: 'تحليل السوق', icon: ShoppingCart, description: 'المنافسون والاتجاهات' },
  { id: 'products', title: 'المنتجات والخدمات', icon: ShoppingCart, description: 'عرض المنتجات' },
  { id: 'marketing', title: 'المزيج التسويقي', icon: TrendingUp, description: '4Ps التسويق' },
  { id: 'financial', title: 'التخطيط المالي', icon: DollarSign, description: 'الخطة المالية الشاملة' },
  { id: 'implementation', title: 'خطة التنفيذ', icon: Calendar, description: 'جدول التنفيذ والمتطلبات' },
];

interface BusinessPlanWizardProps {
  initialData?: Partial<BusinessPlan>;
  onSave?: (data: BusinessPlan) => void;
  onClose?: () => void;
}

export default function BusinessPlanWizard({ initialData, onSave, onClose }: BusinessPlanWizardProps) {
  const { setCurrentView } = useYieldX();
  const [currentStep, setCurrentStep] = useState(0);
  const [businessPlan, setBusinessPlan] = useState<Partial<BusinessPlan>>(
    initialData || {
      status: 'draft',
      completionPercentage: 0,
    }
  );

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleUpdateSection = (section: string, data: any) => {
    setBusinessPlan((prev) => ({
      ...prev,
      [section]: data,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleExport = () => {
    if (businessPlan.projectInfo?.projectName) {
      exportBusinessPlanToExcel(businessPlan as BusinessPlan);
    } else {
      toast.error('يجب إدخال معلومات المشروع أولاً');
    }
  };

  const handleSave = () => {
    if (onSave && businessPlan) {
      onSave(businessPlan as BusinessPlan);
      toast.success('تم حفظ الخطة بنجاح');
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setCurrentView('dashboard');
    }
  };

  const renderStepContent = () => {
    const step = STEPS[currentStep];

    switch (step.id) {
      case 'project':
        return (
          <ProjectInfoForm
            data={businessPlan.projectInfo}
            onChange={(data) => handleUpdateSection('projectInfo', data)}
          />
        );
      case 'shareholders':
        return (
          <ShareholdersForm
            data={businessPlan.shareholders || []}
            onChange={(data) => handleUpdateSection('shareholders', data)}
          />
        );
      case 'swot':
        return (
          <SWOTForm
            data={businessPlan.swotAnalysis}
            onChange={(data) => handleUpdateSection('swotAnalysis', data)}
          />
        );
      case 'market':
        return (
          <CompetitorsForm
            competitors={businessPlan.competitors || []}
            trends={businessPlan.marketTrends || []}
            onCompetitorsChange={(data) => handleUpdateSection('competitors', data)}
            onTrendsChange={(data) => handleUpdateSection('marketTrends', data)}
          />
        );
      case 'products':
        return (
          <ProductsForm
            data={businessPlan.products || []}
            onChange={(data) => handleUpdateSection('products', data)}
          />
        );
      case 'marketing':
        return (
          <MarketingMixForm
            data={businessPlan.marketingMix}
            onChange={(data) => handleUpdateSection('marketingMix', data)}
          />
        );
      case 'financial':
        return (
          <FinancialPlanningForm
            businessPlan={businessPlan}
            onChange={setBusinessPlan}
          />
        );
      case 'implementation':
        return (
          <ImplementationForm
            tasks={businessPlan.implementationTasks || []}
            checklist={businessPlan.documentChecklist}
            onTasksChange={(data) => handleUpdateSection('implementationTasks', data)}
            onChecklistChange={(data) => handleUpdateSection('documentChecklist', data)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <Card className="bg-gradient-to-r from-[#1B1B3A] to-[#2D2D5F] text-white">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute left-4 top-4 text-white hover:bg-white/20 hover:text-white"
            title="العودة للوحة التحكم"
          >
            <X className="w-5 h-5" />
          </Button>
          <CardTitle className="text-2xl flex items-center gap-2">
            <FileText className="w-8 h-8 text-[#4ECDC4]" />
            دراسة الجدوى الشاملة
          </CardTitle>
          <CardDescription className="text-gray-300">
            أكمل جميع الأقسام لإنشاء دراسة جدوى احترافية لمشروعك
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">التقدم الإجمالي</span>
              <span className="text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Steps Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <Card
              key={step.id}
              className={`cursor-pointer transition-all ${
                isActive
                  ? 'ring-2 ring-[#4ECDC4] bg-[#4ECDC4]/5'
                  : isCompleted
                  ? 'bg-green-50 dark:bg-green-900/10'
                  : ''
              }`}
              onClick={() => setCurrentStep(index)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isActive
                        ? 'bg-[#4ECDC4] text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{step.title}</div>
                    <div className="text-xs text-gray-500 truncate">{step.description}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(STEPS[currentStep].icon, { className: 'w-6 h-6 text-[#4ECDC4]' })}
            {STEPS[currentStep].title}
          </CardTitle>
          <CardDescription>{STEPS[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSave} className="gap-2">
                <CheckSquare className="w-4 h-4" />
                حفظ
              </Button>
              <Button variant="outline" onClick={handleExport} className="gap-2">
                <Download className="w-4 h-4" />
                تصدير Excel
              </Button>
            </div>

            <Button
              onClick={handleNext}
              disabled={currentStep === STEPS.length - 1}
              className="bg-[#4ECDC4] hover:bg-[#3dbdb4] gap-2"
            >
              التالي
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}