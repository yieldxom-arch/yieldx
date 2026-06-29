import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, User, Building, MapPin, ArrowLeft, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { AINameChecker } from '@/app/components/naming/AINameChecker';
import { getSectorConfig } from '@/app/config/sectorConfig';
import { getLevelAiFeedback, type AiFeedback } from '@/lib/ai';
import { AiFeedbackCard } from '@/app/components/ai/AiFeedbackCard';

interface Owner {
  id: string;
  name: string;
  nationality: 'omani' | 'expat';
  age: string;
  sharePercentage: string;
  experience: 'beginner' | 'intermediate' | 'expert';
}

export function Level1IdentityOwnership() {
  const { moduleData, updateModuleData, language, setCurrentView, levels, updateLevelProgress, projectTypeData, theme } = useYieldX();
  
  const isRTL = language === 'ar';
  const isDark = theme === 'dark';
  const savedData = moduleData['level7'];
  
  // State
  const [businessName, setBusinessName] = useState(savedData?.businessName || '');
  const [projectIdea, setProjectIdea] = useState(savedData?.projectIdea || '');
  const [productDescription, setProductDescription] = useState(savedData?.productDescription || '');
  const [projectStatus, setProjectStatus] = useState<'new' | 'expansion'>(savedData?.projectStatus || 'new');
  const [location, setLocation] = useState(savedData?.location || '');
  const [owners, setOwners] = useState<Owner[]>(
    savedData?.owners && savedData.owners.length > 0
      ? savedData.owners
      : [{ id: '1', name: '', nationality: 'omani', age: '', sharePercentage: '', experience: 'beginner' }]
  );
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [aiFeedback, setAiFeedback] = useState<AiFeedback | null>(moduleData['level7']?.aiFeedback || null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const currentLevel = levels.find(l => l.levelId === 7);
  const progressPercentage = currentLevel ? (currentLevel.xp / currentLevel.maxXp) * 100 : 0;

  // Calculate total share percentage
  const calculateTotalShare = () => {
    return owners.reduce((total, owner) => {
      const share = parseFloat(owner.sharePercentage) || 0;
      return total + share;
    }, 0);
  };

  const totalShare = calculateTotalShare();

  // Save data automatically
  const saveCurrentData = () => {
    const data = {
      businessName,
      projectIdea,
      productDescription,
      projectStatus,
      location,
      owners,
    };
    updateModuleData('level7', data);
  };

  useEffect(() => {
    saveCurrentData();
  }, [businessName, projectIdea, productDescription, projectStatus, location, owners]);

  // Validate form
  const validateForm = () => {
    const errors: string[] = [];
    
    if (!businessName.trim()) {
      errors.push(isRTL ? 'الاسم التجاري مطلوب' : 'Business name is required');
    }
    
    if (!projectIdea.trim()) {
      errors.push(isRTL ? 'فكرة المشروع مطلوبة' : 'Project idea is required');
    }
    
    if (!productDescription.trim()) {
      errors.push(isRTL ? 'وصف المنتج/الخدمة مطلوب' : 'Product/Service description is required');
    }
    
    if (!location.trim()) {
      errors.push(isRTL ? 'الموقع مطلوب' : 'Location is required');
    }
    
    const hasValidOwner = owners.some(o => o.name.trim() !== '' && o.sharePercentage !== '');
    if (!hasValidOwner) {
      errors.push(isRTL ? 'يجب إدخال مالك واحد على الأقل' : 'At least one owner is required');
    }
    
    if (totalShare !== 100) {
      errors.push(isRTL ? `مجموع نسب الملكية يجب أن يساوي 100% (الحالي: ${totalShare}%)` : `Total ownership must equal 100% (current: ${totalShare}%)`);
    }
    
    return errors;
  };

  // Add owner
  const addOwner = () => {
    const newOwner: Owner = {
      id: Date.now().toString(),
      name: '',
      nationality: 'omani',
      age: '',
      sharePercentage: '',
      experience: 'beginner',
    };
    setOwners([...owners, newOwner]);
  };

  // Remove owner
  const removeOwner = (id: string) => {
    if (owners.length > 1) {
      setOwners(owners.filter(o => o.id !== id));
    }
  };

  // Update owner
  const updateOwner = (id: string, field: keyof Owner, value: string) => {
    setOwners(owners.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  // Handle save
  const handleSave = () => {
    setSaveStatus('saving');
    setValidationErrors([]);
    
    saveCurrentData();
    
    setTimeout(() => {
      const errors = validateForm();
      
      if (errors.length > 0) {
        setSaveStatus('error');
        setValidationErrors(errors);
        setTimeout(() => setSaveStatus('idle'), 4000);
      } else {
        setSaveStatus('saved');
        
        if (currentLevel && currentLevel.xp < currentLevel.maxXp) {
          updateLevelProgress(7, currentLevel.maxXp, true);
          getLevelAiFeedback(7, moduleData['level7'] || {}, language as 'ar' | 'en')
            .then(fb => { setAiFeedback(fb); updateModuleData('level7', { aiFeedback: fb }); })
            .catch(() => {})
            .finally(() => setIsLoadingAi(false));
          setIsLoadingAi(true);
        }
        
        setTimeout(() => {
          setSaveStatus('idle');
          setCurrentView('module-2');
        }, 1500);
      }
    }, 500);
  };

  return (
    <div className={`min-h-screen p-6 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100'
    }`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            onClick={() => setCurrentView('space-map')}
            variant="ghost"
            className={`mb-4 ${
              isDark 
                ? 'text-purple-200 hover:text-white hover:bg-purple-500/20' 
                : 'text-purple-700 hover:text-purple-900 hover:bg-purple-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isRTL ? 'العودة إلى الخريطة' : 'Back to Map'}
          </Button>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-purple-900'
              }`}>
                {isRTL ? 'المستوى 7: الهوية والملكية' : 'Level 7: Identity & Ownership'}
              </h1>
              <p className={isDark ? 'text-purple-200' : 'text-purple-700'}>
                {isRTL ? 'تحديد تفاصيل المشروع الأساسية وهيكل الملكية' : 'Define basic project details and ownership structure'}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-sm mb-1 ${isDark ? 'text-purple-200' : 'text-purple-600'}`}>
                {isRTL ? 'التقدم' : 'Progress'}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-32 h-2 rounded-full overflow-hidden ${
                  isDark ? 'bg-slate-700' : 'bg-purple-200'
                }`}>
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-purple-900'}`}>
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Project Type Badge */}
        {projectTypeData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Card className={`p-4 ${
              isDark 
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30' 
                : 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300'
            }`}>
              <div className="flex items-center gap-3">
                <Building className={`w-5 h-5 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} />
                <div>
                  <div className={`text-sm ${isDark ? 'text-purple-200' : 'text-purple-600'}`}>
                    {isRTL ? 'نوع المشروع المحدد:' : 'Selected Project Type:'}
                  </div>
                  <div className={`font-bold capitalize ${isDark ? 'text-white' : 'text-purple-900'}`}>
                    {projectTypeData.type}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Basic Project Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`p-6 backdrop-blur-sm mb-6 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/80 border-purple-200'
          }`}>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-purple-900'
            }`}>
              <Building className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              {isRTL ? 'تفاصيل المشروع الأساسية' : 'Basic Project Details'}
            </h2>

            <div className="space-y-4">
              {/* Business Name with AI Checker */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-purple-200' : 'text-purple-700'
                }`}>
                  {isRTL ? 'الاسم التجاري' : 'Business Name'}
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <AINameChecker
                  value={businessName}
                  onChange={setBusinessName}
                  language={language}
                  placeholder={isRTL ? 'أدخل اسم المشروع التجاري' : 'Enter business name'}
                />
              </div>

              {/* Project Idea */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-purple-200' : 'text-purple-700'
                }`}>
                  {isRTL ? 'فكرة المشروع' : 'Project Idea'}
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={projectIdea}
                  onChange={(e) => setProjectIdea(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark 
                      ? 'bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400' 
                      : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500'
                  }`}
                  placeholder={isRTL ? 'وصف موجز لفكرة المشروع' : 'Brief description of project idea'}
                />
              </div>

              {/* Product/Service Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-purple-200' : 'text-purple-700'
                }`}>
                  {isRTL ? 'وصف المنتج/الخدمة' : 'Product/Service Description'}
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark 
                      ? 'bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400' 
                      : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500'
                  }`}
                  placeholder={isRTL ? 'وصف تفصيلي للمنتج أو الخدمة المقدمة' : 'Detailed description of the product or service'}
                />
              </div>

              {/* Project Status */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-purple-200' : 'text-purple-700'
                }`}>
                  {isRTL ? 'حالة المشروع' : 'Project Status'}
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setProjectStatus('new')}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                      projectStatus === 'new'
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                        : isDark 
                          ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' 
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    {isRTL ? 'تأسيس جديد' : 'New Establishment'}
                  </button>
                  <button
                    onClick={() => setProjectStatus('expansion')}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                      projectStatus === 'expansion'
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                        : isDark 
                          ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' 
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    {isRTL ? 'توسعة' : 'Expansion'}
                  </button>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-purple-200' : 'text-purple-700'
                }`}>
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {isRTL ? 'الموقع' : 'Location'}
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark 
                      ? 'bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400' 
                      : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500'
                  }`}
                  placeholder={isRTL ? 'المدينة، المحافظة' : 'City, Governorate'}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Owners/Shareholders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={`p-6 backdrop-blur-sm mb-6 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/80 border-purple-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-purple-900'
              }`}>
                <User className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                {isRTL ? 'الملاك والشركاء' : 'Owners & Partners'}
              </h2>
              <Button
                onClick={addOwner}
                size="sm"
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Plus className="w-4 h-4 mr-1" />
                {isRTL ? 'إضافة مالك' : 'Add Owner'}
              </Button>
            </div>

            <div className="space-y-3">
              {owners.map((owner, index) => (
                <motion.div
                  key={owner.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700/30 border-slate-600' 
                      : 'bg-purple-50/50 border-purple-200'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    {/* Name */}
                    <div className="md:col-span-2">
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-purple-200' : 'text-purple-700'
                      }`}>
                        {isRTL ? 'الاسم' : 'Name'}
                      </label>
                      <input
                        type="text"
                        value={owner.name}
                        onChange={(e) => updateOwner(owner.id, 'name', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        } border`}
                        placeholder={isRTL ? 'اسم المالك' : 'Owner name'}
                      />
                    </div>

                    {/* Nationality */}
                    <div>
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-purple-200' : 'text-purple-700'
                      }`}>
                        {isRTL ? 'الجنسية' : 'Nationality'}
                      </label>
                      <select
                        value={owner.nationality}
                        onChange={(e) => updateOwner(owner.id, 'nationality', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        } border`}
                      >
                        <option value="omani">{isRTL ? 'عماني' : 'Omani'}</option>
                        <option value="expat">{isRTL ? 'وافد' : 'Expat'}</option>
                      </select>
                    </div>

                    {/* Age */}
                    <div>
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-purple-200' : 'text-purple-700'
                      }`}>
                        {isRTL ? 'العمر' : 'Age'}
                      </label>
                      <input
                        type="number"
                        value={owner.age}
                        onChange={(e) => updateOwner(owner.id, 'age', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        } border`}
                        placeholder="25"
                      />
                    </div>

                    {/* Share % */}
                    <div>
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-purple-200' : 'text-purple-700'
                      }`}>
                        {isRTL ? 'النسبة %' : 'Share %'}
                      </label>
                      <input
                        type="number"
                        value={owner.sharePercentage}
                        onChange={(e) => updateOwner(owner.id, 'sharePercentage', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        } border`}
                        placeholder="50"
                        min="0"
                        max="100"
                      />
                    </div>

                    {/* Experience */}
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className={`block text-xs mb-1 ${
                          isDark ? 'text-purple-200' : 'text-purple-700'
                        }`}>
                          {isRTL ? 'الخبرة' : 'Experience'}
                        </label>
                        <select
                          value={owner.experience}
                          onChange={(e) => updateOwner(owner.id, 'experience', e.target.value)}
                          className={`w-full px-3 py-2 rounded text-sm ${
                            isDark 
                              ? 'bg-slate-700 border-slate-600 text-white' 
                              : 'bg-white border-slate-300 text-slate-900'
                          } border`}
                        >
                          <option value="beginner">{isRTL ? 'مبتدئ' : 'Beginner'}</option>
                          <option value="intermediate">{isRTL ? 'متوسط' : 'Intermediate'}</option>
                          <option value="expert">{isRTL ? 'خبير' : 'Expert'}</option>
                        </select>
                      </div>
                      {owners.length > 1 && (
                        <Button
                          onClick={() => removeOwner(owner.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Total Share */}
            <div className={`mt-4 p-3 rounded-lg border ${
              isDark 
                ? 'bg-slate-700/50 border-slate-600' 
                : 'bg-purple-50 border-purple-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`font-medium ${
                  isDark ? 'text-purple-200' : 'text-purple-700'
                }`}>
                  {isRTL ? 'المجموع:' : 'Total:'}
                </span>
                <span className={`text-xl font-bold ${
                  totalShare === 100 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {totalShare}%
                </span>
              </div>
              {totalShare !== 100 && (
                <p className="text-xs text-yellow-400 mt-1">
                  {isRTL ? 'يجب أن يساوي المجموع 100%' : 'Total must equal 100%'}
                </p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className={`p-4 ${
              isDark 
                ? 'bg-red-500/10 border-red-500/50' 
                : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-red-400 font-bold mb-2">
                    {isRTL ? 'يرجى تصحيح الأخطاء التالية:' : 'Please fix the following errors:'}
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, idx) => (
                      <li key={idx} className="text-red-300 text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end gap-4"
        >
          <Button
            onClick={() => setCurrentView('space-map')}
            variant="outline"
            className={`${
              isDark 
                ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                : 'border-purple-300 text-purple-700 hover:bg-purple-100'
            }`}
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={`px-8 ${
              saveStatus === 'saved'
                ? 'bg-green-500 hover:bg-green-600'
                : saveStatus === 'error'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-purple-500 hover:bg-purple-600'
            }`}
          >
            {saveStatus === 'saving' && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                {isRTL ? 'جاري الحفظ...' : 'Saving...'}
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {isRTL ? 'تم الحفظ!' : 'Saved!'}
              </>
            )}
            {(saveStatus === 'idle' || saveStatus === 'error') && (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isRTL ? 'حفظ والمتابعة' : 'Save & Continue'}
              </>
            )}
          </Button>
        </motion.div>

        {/* AI Feedback */}
        <div className="mt-8">
          <AiFeedbackCard feedback={aiFeedback} isLoading={isLoadingAi} language={language as 'ar' | 'en'} />
        </div>
      </div>
    </div>
  );
}