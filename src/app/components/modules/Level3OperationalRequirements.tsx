import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Zap, Package, Clock, FileText, ArrowLeft, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { AiFeedbackCard } from '@/app/components/ai/AiFeedbackCard';
import { getLevelAiFeedback } from '@/lib/ai';

export function Level3OperationalRequirements() {
  const { moduleData, updateModuleData, language, setCurrentView, levels, updateLevelProgress, projectTypeData, theme } = useYieldX();

  const isRTL = language === 'ar';
  const isDark = theme === 'dark';
  const savedData = moduleData['level3'] || {};

  const [formData, setFormData] = useState({
    location: savedData.location || '',
    rentCost: savedData.rentCost || '',
    utilities: savedData.utilities || '',
    rawMaterials: savedData.rawMaterials || '',
    rawMaterialsCost: savedData.rawMaterialsCost || '',
    licenses: savedData.licenses || '',
    licensesCost: savedData.licensesCost || '',
    operatingHours: savedData.operatingHours || '',
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [aiFeedback, setAiFeedback] = useState<any>(savedData.aiFeedback || null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const currentLevel = levels.find(l => l.levelId === 3);
  const progressPercentage = currentLevel ? (currentLevel.xp / currentLevel.maxXp) * 100 : 0;

  const labels = {
    ar: {
      title: 'المتطلبات التشغيلية',
      subtitle: 'حدد احتياجات التشغيل اليومية لمشروعك',
      location: 'موقع المشروع',
      locationPlaceholder: 'مثال: مسقط — الموالح، صحار — المنطقة الصناعية',
      rentCost: 'تكلفة الإيجار الشهرية (ريال)',
      rentPlaceholder: 'مثال: 800',
      utilities: 'تكلفة المرافق الشهرية (ريال)',
      utilitiesPlaceholder: 'مثال: 200 (كهرباء، ماء، إنترنت)',
      rawMaterials: 'المواد الخام / المستلزمات',
      rawMaterialsPlaceholder: 'مثال: مواد تعبئة، مواد إنتاج، لوازم مكتبية',
      rawMaterialsCost: 'تكلفة المواد الشهرية (ريال)',
      rawMaterialsCostPlaceholder: 'مثال: 1500',
      licenses: 'التراخيص المطلوبة',
      licensesPlaceholder: 'مثال: السجل التجاري، تراخيص البلدية، موافقة وزارة الصحة',
      licensesCost: 'تكلفة التراخيص (ريال)',
      licensesCostPlaceholder: 'مثال: 500',
      operatingHours: 'ساعات العمل اليومية',
      operatingHoursPlaceholder: 'مثال: 8 ساعات، من 9 صباحاً حتى 5 مساءً',
      save: 'حفظ',
      submit: 'تسليم المستوى',
      back: 'رجوع',
      saving: 'جارٍ الحفظ...',
      saved: 'تم الحفظ',
      required: 'هذا الحقل مطلوب',
      xpEarned: 'نقاط مكتسبة',
      getAiFeedback: 'احصل على تقييم الذكاء الاصطناعي',
    },
    en: {
      title: 'Operational Requirements',
      subtitle: 'Define the daily operational needs of your project',
      location: 'Project Location',
      locationPlaceholder: 'e.g. Muscat — Al Mawaleh, Sohar — Industrial Zone',
      rentCost: 'Monthly Rent Cost (OMR)',
      rentPlaceholder: 'e.g. 800',
      utilities: 'Monthly Utilities Cost (OMR)',
      utilitiesPlaceholder: 'e.g. 200 (electricity, water, internet)',
      rawMaterials: 'Raw Materials / Supplies',
      rawMaterialsPlaceholder: 'e.g. packaging, production materials, office supplies',
      rawMaterialsCost: 'Monthly Materials Cost (OMR)',
      rawMaterialsCostPlaceholder: 'e.g. 1500',
      licenses: 'Required Licenses',
      licensesPlaceholder: 'e.g. Commercial Registration, Municipality, Ministry of Health',
      licensesCost: 'Licenses Cost (OMR)',
      licensesCostPlaceholder: 'e.g. 500',
      operatingHours: 'Daily Operating Hours',
      operatingHoursPlaceholder: 'e.g. 8 hours, 9am – 5pm',
      save: 'Save',
      submit: 'Submit Level',
      back: 'Back',
      saving: 'Saving...',
      saved: 'Saved',
      required: 'This field is required',
      xpEarned: 'XP Earned',
      getAiFeedback: 'Get AI Feedback',
    },
  };

  const t = labels[language] || labels.en;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const errors: string[] = [];
    if (!formData.location.trim()) errors.push(t.location);
    if (!formData.rentCost.trim()) errors.push(t.rentCost);
    if (!formData.utilities.trim()) errors.push(t.utilities);
    if (!formData.licenses.trim()) errors.push(t.licenses);
    return errors;
  };

  const handleSave = () => {
    setSaveStatus('saving');
    updateModuleData('level3', formData);
    setTimeout(() => setSaveStatus('saved'), 600);
  };

  const handleSubmit = async () => {
    const errors = validate();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    handleSave();
    updateLevelProgress(3, currentLevel?.maxXp || 200, true);

    // Fetch AI feedback after submission
    setIsLoadingAi(true);
    try {
      const feedback = await getLevelAiFeedback(3, formData, language);
      setAiFeedback(feedback);
      updateModuleData('level3', { ...formData, aiFeedback: feedback });
    } catch {
      // AI feedback is optional; don't block completion
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`min-h-screen p-4 md:p-8 ${isDark ? 'bg-[#0F0F25]' : 'bg-gray-50'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setCurrentView('space-map')}>
            <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">3</div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.title}</h1>
            </div>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.subtitle}</p>
          </div>
          {currentLevel && (
            <div className="text-right">
              <div className={`text-sm font-semibold ${isDark ? 'text-[#4ECDC4]' : 'text-teal-600'}`}>{currentLevel.xp} / {currentLevel.maxXp} XP</div>
              <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-1">
                <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>
          )}
        </div>

        <Card className={`p-6 mb-6 ${isDark ? 'bg-[#1B1B3A]/60 border-white/10' : 'bg-white border-gray-200'}`}>
          <div className="space-y-5">
            {/* Location */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <MapPin className="w-4 h-4 text-orange-500" />
                {t.location} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={e => handleChange('location', e.target.value)}
                placeholder={t.locationPlaceholder}
                className={`w-full px-4 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800/50 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'}`}
              />
            </div>

            {/* Rent & Utilities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`text-sm font-semibold mb-2 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t.rentCost} <span className="text-red-400">*</span></label>
                <input type="number" value={formData.rentCost} onChange={e => handleChange('rentCost', e.target.value)} placeholder={t.rentPlaceholder}
                  className={`w-full px-4 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800/50 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'}`} />
              </div>
              <div>
                <label className={`text-sm font-semibold mb-2 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t.utilities} <span className="text-red-400">*</span></label>
                <input type="number" value={formData.utilities} onChange={e => handleChange('utilities', e.target.value)} placeholder={t.utilitiesPlaceholder}
                  className={`w-full px-4 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800/50 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'}`} />
              </div>
            </div>

            {/* Raw Materials */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Package className="w-4 h-4 text-orange-500" />
                {t.rawMaterials}
              </label>
              <textarea value={formData.rawMaterials} onChange={e => handleChange('rawMaterials', e.target.value)} placeholder={t.rawMaterialsPlaceholder} rows={2}
                className={`w-full px-4 py-2 rounded-lg border text-sm resize-none ${isDark ? 'bg-slate-800/50 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'}`} />
            </div>
            <div>
              <label className={`text-sm font-semibold mb-2 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t.rawMaterialsCost}</label>
              <input type="number" value={formData.rawMaterialsCost} onChange={e => handleChange('rawMaterialsCost', e.target.value)} placeholder={t.rawMaterialsCostPlaceholder}
                className={`w-full px-4 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800/50 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'}`} />
            </div>

            {/* Licenses */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <FileText className="w-4 h-4 text-orange-500" />
                {t.licenses} <span className="text-red-400">*</span>
              </label>
              <textarea value={formData.licenses} onChange={e => handleChange('licenses', e.target.value)} placeholder={t.licensesPlaceholder} rows={2}
                className={`w-full px-4 py-2 rounded-lg border text-sm resize-none ${isDark ? 'bg-slate-800/50 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'}`} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`text-sm font-semibold mb-2 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t.licensesCost}</label>
                <input type="number" value={formData.licensesCost} onChange={e => handleChange('licensesCost', e.target.value)} placeholder={t.licensesCostPlaceholder}
                  className={`w-full px-4 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800/50 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'}`} />
              </div>
              <div>
                <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <Clock className="w-4 h-4 text-orange-500" />
                  {t.operatingHours}
                </label>
                <input type="text" value={formData.operatingHours} onChange={e => handleChange('operatingHours', e.target.value)} placeholder={t.operatingHoursPlaceholder}
                  className={`w-full px-4 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800/50 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400'}`} />
              </div>
            </div>
          </div>
        </Card>

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="flex items-center gap-2 text-red-400 text-sm font-semibold mb-2">
              <AlertCircle className="w-4 h-4" />
              {language === 'ar' ? 'يرجى تعبئة الحقول المطلوبة:' : 'Please fill in required fields:'}
            </div>
            <ul className="list-disc list-inside text-red-400 text-sm space-y-1">
              {validationErrors.map(e => <li key={e}>{e}</li>)}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          <Button onClick={handleSave} variant="outline" className="flex-1 gap-2" disabled={saveStatus === 'saving'}>
            {saveStatus === 'saving' ? <><Save className="w-4 h-4 animate-spin" />{t.saving}</> :
             saveStatus === 'saved' ? <><CheckCircle2 className="w-4 h-4 text-green-400" />{t.saved}</> :
             <><Save className="w-4 h-4" />{t.save}</>}
          </Button>
          <Button onClick={handleSubmit} className="flex-1 gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white">
            <Zap className="w-4 h-4" />
            {t.submit}
          </Button>
        </div>

        {/* AI Feedback */}
        <AiFeedbackCard feedback={aiFeedback} isLoading={isLoadingAi} language={language} />
      </div>
    </motion.div>
  );
}
