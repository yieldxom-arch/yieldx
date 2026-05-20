import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, User, Info, ArrowLeft, Save, Sparkles, Star, X } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { AINameChecker } from '@/app/components/naming/AINameChecker';

interface Shareholder {
  id: string;
  name: string;
  share: string;
  role: string;
}

export function DynamicShareholderModule() {
  const { moduleData, updateModuleData, language, setCurrentView, levels, updateLevelProgress } = useYieldX();
  
  // Initialize state from saved data or defaults
  const savedData = moduleData[1];
  const [shareholders, setShareholders] = useState<Shareholder[]>(
    savedData?.shareholders && savedData.shareholders.length > 0 
      ? savedData.shareholders 
      : [{ id: '1', name: '', share: '', role: '' }]
  );
  const [companyName, setCompanyName] = useState(savedData?.companyName || '');
  const [totalCapital, setTotalCapital] = useState(savedData?.totalCapital || '');
  const [notes, setNotes] = useState(savedData?.notes || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const currentLevel = levels.find(l => l.levelId === 7);
  const progressPercentage = currentLevel ? (currentLevel.xp / currentLevel.maxXp) * 100 : 0;

  // Helper function to save current state
  const saveCurrentData = (updatedShareholders?: Shareholder[], updatedCompanyName?: string, updatedTotalCapital?: string, updatedNotes?: string) => {
    const data = { 
      companyName: updatedCompanyName ?? companyName, 
      totalCapital: updatedTotalCapital ?? totalCapital, 
      notes: updatedNotes ?? notes, 
      shareholders: updatedShareholders ?? shareholders 
    };
    updateModuleData('1', data);
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    // Validate company name
    if (!companyName || companyName.trim() === '') {
      errors.push(language === 'ar' ? 'اسم الشركة مطلوب' : 'Company name is required');
    }
    
    // Validate at least one shareholder with name and share
    const hasValidShareholder = shareholders.some(sh => sh.name.trim() !== '' && sh.share !== '');
    if (!hasValidShareholder) {
      errors.push(language === 'ar' ? 'يجب إدخال اسم ونسبة مساهمة لمساهم واحد على الأقل' : 'At least one shareholder with name and share is required');
    }
    
    // Validate shareholding percentage equals 100%
    const totalShare = calculateTotalShare();
    if (totalShare !== 100) {
      errors.push(language === 'ar' ? 'مجموع نسب المساهمين يجب أن يساوي 100%' : 'Total shareholding must equal 100%');
    }
    
    // Validate total capital
    if (!totalCapital || parseFloat(totalCapital) <= 0) {
      errors.push(language === 'ar' ? 'رأس المال الإجمالي مطلوب' : 'Total capital is required');
    }
    
    return errors;
  };

  const handleSave = () => {
    setSaveStatus('saving');
    setValidationErrors([]);
    
    // Always save the current data first
    saveCurrentData();
    
    setTimeout(() => {
      // Validate the form
      const errors = validateForm();
      
      if (errors.length > 0) {
        // Validation failed - show errors
        setSaveStatus('error');
        setValidationErrors(errors);
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        // Validation passed - complete the level
        setSaveStatus('saved');
        
        // Award full completion XP (complete the level)
        if (currentLevel && currentLevel.xp < currentLevel.maxXp) {
          updateLevelProgress(1, currentLevel.maxXp);
        }
        
        setTimeout(() => {
          setSaveStatus('idle');
          // Optionally redirect to dashboard after successful save
          // setCurrentView('dashboard');
        }, 2000);
      }
    }, 800);
  };

  const addShareholder = () => {
    const newId = (shareholders.length + 1).toString();
    const newShareholders = [...shareholders, { id: newId, name: '', share: '', role: '' }];
    setShareholders(newShareholders);
    saveCurrentData(newShareholders);
  };

  const removeShareholder = (id: string) => {
    if (shareholders.length > 1) {
      const newShareholders = shareholders.filter(sh => sh.id !== id);
      setShareholders(newShareholders);
      saveCurrentData(newShareholders);
    }
  };

  const updateShareholder = (id: string, field: keyof Shareholder, value: string) => {
    const newShareholders = shareholders.map(sh => 
      sh.id === id ? { ...sh, [field]: value } : sh
    );
    setShareholders(newShareholders);
    saveCurrentData(newShareholders);
  };

  const handleCompanyNameChange = (value: string) => {
    setCompanyName(value);
    saveCurrentData(undefined, value);
  };

  const handleTotalCapitalChange = (value: string) => {
    setTotalCapital(value);
    saveCurrentData(undefined, undefined, value);
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    saveCurrentData(undefined, undefined, undefined, value);
  };

  const handleClearAll = () => {
    // Reset all fields to empty
    setCompanyName('');
    setTotalCapital('');
    setNotes('');
    setShareholders([{ id: '1', name: '', share: '', role: '' }]);
    setValidationErrors([]);
    
    // Save the empty state
    const emptyData = { 
      companyName: '', 
      totalCapital: '', 
      notes: '', 
      shareholders: [{ id: '1', name: '', share: '', role: '' }] 
    };
    updateModuleData('1', emptyData);
  };

  const calculateTotalShare = () => {
    return shareholders.reduce((sum, sh) => sum + (parseFloat(sh.share) || 0), 0);
  };

  const totalShare = calculateTotalShare();
  const isValidShare = totalShare === 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-violet-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-violet-200 sticky top-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <motion.button
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-100 hover:bg-violet-200 border border-violet-300 text-violet-700 transition-all group"
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 group-hover:animate-pulse" />
              <span className="font-medium">
                {language === 'ar' ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
              </span>
            </motion.button>

            {/* Level Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-500" />
                <div className="text-right">
                  <h1 className="text-xl font-bold text-slate-800">
                    {language === 'ar' ? 'المستوى 1: معلومات المساهمين' : 'Level 1: Shareholder Information'}
                  </h1>
                  <p className="text-sm text-violet-600">
                    {currentLevel?.xp || 0} / {currentLevel?.maxXp || 100} XP
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Clear All Button */}
              <motion.button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 font-medium transition-all shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5" />
                {language === 'ar' ? 'حذف الكل' : 'Clear All'}
              </motion.button>

              {/* Save Button */}
              <motion.button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all shadow-md ${
                  saveStatus === 'saved'
                    ? 'bg-green-500 text-white'
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {saveStatus === 'saving' ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                  </>
                ) : saveStatus === 'saved' ? (
                  <>
                    <Save className="w-5 h-5" />
                    {language === 'ar' ? 'تم الحفظ!' : 'Saved!'}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {language === 'ar' ? 'حفظ التقدم' : 'Save Progress'}
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-4">
            <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden border border-violet-200">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse" />
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-700 drop-shadow-sm">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl border border-violet-200 p-8 shadow-2xl"
        >
          <div className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 text-right">
                {language === 'ar' ? 'اسم الشركة' : 'Company Name'} *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => handleCompanyNameChange(e.target.value)}
                placeholder={language === 'ar' ? 'مثال: شركة الابتكار للتقنية' : 'Example: Innovation Tech Company'}
                className="w-full px-4 py-3 rounded-xl border-2 border-violet-200 bg-white text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all outline-none text-right"
                required
              />
              <p className="mt-1 text-xs text-violet-600 text-right flex items-center justify-end gap-1">
                <Info className="w-3 h-3" />
                {language === 'ar' ? 'اختر اسماً احترافياً يعكس نشاط الشركة' : "Choose a professional name that reflects the company's activity"}
              </p>
              
              {/* AI Name Intelligence System */}
              <AINameChecker 
                businessName={companyName} 
                language={language}
                onNameSelect={(selectedName) => handleCompanyNameChange(selectedName)}
              />
            </div>

            {/* Shareholders Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <motion.button
                  type="button"
                  onClick={addShareholder}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-4 h-4" />
                  {language === 'ar' ? 'إضافة مساهم' : 'Add Shareholder'}
                </motion.button>
                
                <div className={`text-sm font-medium ${isValidShare ? 'text-green-600' : 'text-amber-600'} flex items-center gap-2`}>
                  {language === 'ar' ? 'المجموع:' : 'Total:'} {totalShare}%
                  {isValidShare && <span className="text-green-600">✓</span>}
                  {!isValidShare && totalShare > 0 && (
                    <span className="text-xs text-amber-600">
                      ({language === 'ar' ? 'يجب أن يساوي 100%' : 'Must equal 100%'})
                    </span>
                  )}
                </div>
              </div>

              <AnimatePresence mode="popLayout">
                {shareholders.map((shareholder, index) => (
                  <motion.div
                    key={shareholder.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.3 }}
                    className="p-5 rounded-xl border-2 border-violet-200 bg-white shadow-md space-y-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                          {index + 1}
                        </div>
                        <h3 className="font-semibold text-slate-800">
                          {language === 'ar' ? `المساهم ${index + 1}` : `Shareholder ${index + 1}`}
                        </h3>
                      </div>
                      
                      {shareholders.length > 1 && (
                        <motion.button
                          type="button"
                          onClick={() => removeShareholder(shareholder.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Shareholder Name */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 text-right">
                          {language === 'ar' ? 'اسم المساهم' : 'Shareholder Name'} *
                        </label>
                        <input
                          type="text"
                          value={shareholder.name}
                          onChange={(e) => updateShareholder(shareholder.id, 'name', e.target.value)}
                          placeholder={language === 'ar' ? 'مثال: أحمد بن محمد' : 'Example: Ahmed bin Mohammed'}
                          className="w-full px-4 py-3 rounded-xl border-2 border-violet-200 bg-white text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all outline-none text-right"
                          required
                        />
                      </div>

                      {/* Shareholding Percentage */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 text-right">
                          {language === 'ar' ? 'نسبة المساهمة %' : 'Shareholding %'} *
                        </label>
                        <input
                          type="number"
                          value={shareholder.share}
                          onChange={(e) => updateShareholder(shareholder.id, 'share', e.target.value)}
                          placeholder={language === 'ar' ? 'مثال: 50' : 'Example: 50'}
                          min="0"
                          max="100"
                          className="w-full px-4 py-3 rounded-xl border-2 border-violet-200 bg-white text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all outline-none text-right"
                          required
                        />
                        <p className="mt-1 text-xs text-violet-600 text-right">
                          {language === 'ar' ? 'النطاق الموصى به: 20-80%' : 'Recommended range: 20-80%'}
                        </p>
                      </div>
                    </div>

                    {/* Shareholder Role */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 text-right">
                        {language === 'ar' ? 'دور المساهم' : 'Shareholder Role'}
                      </label>
                      <input
                        type="text"
                        value={shareholder.role}
                        onChange={(e) => updateShareholder(shareholder.id, 'role', e.target.value)}
                        placeholder={language === 'ar' ? 'مثال: المدير التنفيذي' : 'Example: Chief Executive Officer'}
                        className="w-full px-4 py-3 rounded-xl border-2 border-violet-200 bg-white text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all outline-none text-right"
                      />
                      <p className="mt-1 text-xs text-violet-600 text-right flex items-center justify-end gap-1">
                        <Info className="w-3 h-3" />
                        {language === 'ar' ? 'حدد المسؤوليات والمهام' : 'Specify responsibilities and tasks'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Total Capital */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 text-right">
                {language === 'ar' ? 'رأس المال الإجمالي (ريال)' : 'Total Capital (OMR)'} *
              </label>
              <input
                type="number"
                value={totalCapital}
                onChange={(e) => handleTotalCapitalChange(e.target.value)}
                placeholder={language === 'ar' ? 'مثال: 100000' : 'Example: 100000'}
                className="w-full px-4 py-3 rounded-xl border-2 border-violet-200 bg-white text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all outline-none text-right"
                required
              />
              <div className="mt-2 space-y-1">
                <p className="text-xs text-violet-600 text-right flex items-center justify-end gap-1">
                  <Info className="w-3 h-3" />
                  {language === 'ar' ? 'احسب جميع التكاليف التأسيسية والتشغيلية لأول 6 شهور' : 'Calculate all establishment and operating costs for the first 6 months'}
                </p>
                <p className="text-xs text-violet-600 text-right">
                  {language === 'ar' ? 'النطاق الموصى به: 50,000 - 500,000 ريال للمشاريع الصغيرة' : 'Recommended range: 50,000 - 500,000 OMR for small projects'}
                </p>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 text-right">
                {language === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder={language === 'ar' ? 'أي معلومات أخرى عن هيكل المساهمين أو الاتفاقيات' : 'Any other information about shareholder structure or agreements'}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-violet-200 bg-white text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all outline-none text-right resize-none"
              />
            </div>

            {/* Share Validation Warning */}
            {!isValidShare && totalShare > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 shadow-sm"
              >
                <p className="text-sm text-amber-800 text-right font-medium">
                  ⚠️ {language === 'ar' ? 'مجموع نسب المساهمين يجب أن يساوي 100%' : 'Total shareholding percentage must equal 100%'}
                </p>
                <p className="text-xs text-amber-700 text-right mt-1">
                  {language === 'ar' ? `المجموع الحالي: ${totalShare}%` : `Current total: ${totalShare}%`}
                </p>
              </motion.div>
            )}

            {/* Success Message */}
            {isValidShare && shareholders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-green-50 border-2 border-green-300 shadow-sm"
              >
                <p className="text-sm text-green-800 text-right font-medium">
                  ✅ {language === 'ar' ? 'مجموع النسب صحيح! (100%)' : 'Total percentage is correct! (100%)'}
                </p>
              </motion.div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-50 border-2 border-red-300 shadow-sm"
              >
                <p className="text-sm text-red-800 text-right font-medium">
                  ⚠️ {language === 'ar' ? 'هناك أخطاء في النموذج' : 'There are errors in the form'}
                </p>
                <ul className="text-xs text-red-700 text-right mt-1 list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}