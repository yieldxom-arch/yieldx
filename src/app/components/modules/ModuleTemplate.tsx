import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, CheckCircle, Info, HelpCircle } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Progress } from '@/app/components/ui/progress';
import { toast } from 'sonner';

interface ModuleTemplateProps {
  moduleId: number;
  title: string;
  description: string;
  fields: {
    id: string;
    label: string;
    type: 'text' | 'number' | 'textarea' | 'email';
    placeholder?: string;
    required?: boolean;
    helpText?: string;
    recommendedRange?: string;
  }[];
}

export function ModuleTemplate({ moduleId, title, description, fields }: ModuleTemplateProps) {
  const { setCurrentView, updateLevelProgress, moduleData, updateModuleData, levels } = useYieldX();
  const [formData, setFormData] = useState<Record<string, any>>(moduleData[`module-${moduleId}`] || {});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const currentLevel = levels.find((l) => l.levelId === moduleId);
  const progress = currentLevel ? (currentLevel.xp / currentLevel.maxXp) * 100 : 0;

  const handleChange = (fieldId: string, value: any, fieldType: string) => {
    // Validate number fields
    if (fieldType === 'number') {
      // Check if value contains non-numeric characters (except for decimal point and minus)
      if (value && !/^-?\d*\.?\d*$/.test(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          [fieldId]: 'يرجى إدخال أرقام فقط'
        }));
        return; // Don't update the value
      } else {
        // Clear error if valid
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldId];
          return newErrors;
        });
      }
    }

    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSave = () => {
    updateModuleData(`module-${moduleId}`, formData);
    
    // Calculate XP based on filled REQUIRED fields only
    const requiredFields = fields.filter(f => f.required);
    const filledRequiredFields = requiredFields.filter(f => 
      formData[f.id] && formData[f.id].toString().trim() !== ''
    ).length;
    const xpPerField = currentLevel ? currentLevel.maxXp / requiredFields.length : 0;
    const earnedXP = Math.floor(filledRequiredFields * xpPerField);
    
    updateLevelProgress(moduleId, earnedXP);
    
    toast.success('تم حفظ التقدم بنجاح! ✓');
  };

  const handleComplete = () => {
    handleSave();
    updateLevelProgress(moduleId, currentLevel?.maxXp || 0, true);
    toast.success('🎉 تهانينا! لقد أكملت هذا المستوى');
    setTimeout(() => {
      setCurrentView('space-map');
    }, 1500);
  };

  // Only count REQUIRED fields for completion
  const requiredFields = fields.filter(f => f.required);
  const filledRequiredFields = requiredFields.filter(f => 
    formData[f.id] && formData[f.id].toString().trim() !== ''
  ).length;
  const isComplete = filledRequiredFields === requiredFields.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 relative overflow-hidden" dir="rtl">
      {/* Background Stars */}
      <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-500">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.1, 0.6, 0.1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              {isComplete && (
                <Button
                  onClick={handleComplete}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  <CheckCircle className="w-4 h-4 ml-2" />
                  إكمال المستوى
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={handleSave}
                className="bg-blue-100 dark:bg-blue-500/20 border-blue-300 dark:border-blue-500/50 hover:bg-blue-200 dark:hover:bg-blue-500/30 text-blue-700 dark:text-blue-200"
              >
                <Save className="w-4 h-4 ml-2" />
                حفظ التقدم
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentView('dashboard')}
              className="bg-purple-50 dark:bg-white/10 border-purple-300 dark:border-white/20 hover:bg-purple-100 dark:hover:bg-white/20 text-purple-700 dark:text-white"
            >
              العودة للخريطة
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Button>
          </div>

          {/* Module Card */}
          <Card className="bg-white/95 dark:bg-white/10 backdrop-blur-md border-purple-300 dark:border-white/20 p-8">
            {/* Title and Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="text-right">
                  <p className="text-slate-900 dark:text-white text-sm mb-1">
                    {filledRequiredFields} / {requiredFields.length} مكتمل
                  </p>
                  <p className="text-purple-600 dark:text-purple-300 text-xs">
                    {currentLevel?.xp || 0} / {currentLevel?.maxXp || 0} XP
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900 dark:text-white text-right">{title}</h1>
                      <p className="text-purple-600 dark:text-purple-300 mt-1 text-right">{description}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 dark:bg-purple-500 flex items-center justify-center text-white font-bold">
                      {moduleId}
                    </div>
                  </div>
                </div>
              </div>
              
              <Progress value={progress} className="h-3" />
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map((field) => (
                <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="text-slate-900 dark:text-white text-sm mb-2 block text-right">
                    {field.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      value={formData[field.id] || ''}
                      onChange={(e) => handleChange(field.id, e.target.value, field.type)}
                      placeholder={field.placeholder}
                      className="bg-purple-50 dark:bg-white/10 border-purple-300 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/50 min-h-[120px] text-right"
                      required={field.required}
                    />
                  ) : (
                    <Input
                      type={field.type}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleChange(field.id, e.target.value, field.type)}
                      placeholder={field.placeholder}
                      className="bg-purple-50 dark:bg-white/10 border-purple-300 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/50 text-right"
                      required={field.required}
                    />
                  )}
                  {fieldErrors[field.id] && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1 text-right">{fieldErrors[field.id]}</p>
                  )}
                  {field.helpText && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1 justify-start">
                      <Info className="w-4 h-4 ml-2" />
                      <span className="text-right">{field.helpText}</span>
                    </div>
                  )}
                  {field.recommendedRange && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1 justify-start">
                      <HelpCircle className="w-4 h-4 ml-2" />
                      <span className="text-right">النطاق الموصى به: {field.recommendedRange}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Tips Section */}
            <Card className="mt-8 bg-purple-100 dark:bg-purple-500/20 border-purple-300 dark:border-purple-500/30 p-6">
              <h3 className="text-slate-900 dark:text-white font-semibold mb-2 text-right">💡 نصائح مهمة</h3>
              <ul className="text-slate-700 dark:text-purple-200 text-sm space-y-1 list-disc list-inside text-right">
                <li>تأكد من ملء جميع الحقول المطلوبة بدقة</li>
                <li>يمكنك حفظ تقدمك والعودة لاحقاً</li>
                <li>ستحصل على نقاط XP عند ملء كل حقل</li>
                <li>أكمل جميع الحقول للحصول على النقاط الكاملة</li>
              </ul>
            </Card>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}