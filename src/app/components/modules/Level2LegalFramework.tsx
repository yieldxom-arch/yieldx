import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Shield, FileText, ArrowLeft, Save, AlertCircle, CheckCircle2, Home, Lightbulb, Sparkles } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { getMandatoryLicenses, getSectorName } from '@/app/config/sectorConfig';

interface License {
  id: string;
  name: string;
  status: 'required' | 'in-progress' | 'completed';
  cost: string;
  authority: string;
}

interface LeaseContract {
  id: string;
  propertyType: string;
  area: string;
  monthlyRent: string;
  duration: string;
  leaseOrOwn: 'rent' | 'own';
}

export function Level2LegalFramework() {
  const { moduleData, updateModuleData, language, setCurrentView, levels, updateLevelProgress, projectTypeData, theme } = useYieldX();
  
  const isRTL = language === 'ar';
  const isDark = theme === 'dark';
  const savedData = moduleData['level2'];
  
  // State
  const [licenses, setLicenses] = useState<License[]>(() => {
    if (savedData?.licenses && savedData.licenses.length > 0) {
      return savedData.licenses;
    }
    // Default Omani mandatory licenses
    return [
      { 
        id: '1', 
        name: isRTL ? 'السجل التجاري' : 'Commercial Register',
        status: 'required', 
        cost: '', 
        authority: isRTL ? 'وزارة التجارة والصناعة' : 'Ministry of Commerce & Industry'
      },
      { 
        id: '2', 
        name: isRTL ? 'الترخيص البلدي' : 'Municipal License',
        status: 'required', 
        cost: '', 
        authority: isRTL ? 'البلدية' : 'Municipality'
      },
      { 
        id: '3', 
        name: isRTL ? 'شهادة الغرفة التجارية' : 'Chamber of Commerce Certificate',
        status: 'required', 
        cost: '', 
        authority: isRTL ? 'غرفة تجارة وصناعة عمان' : 'Oman Chamber of Commerce & Industry'
      },
      { 
        id: '4', 
        name: isRTL ? 'شهادة الدفاع المدني' : 'Civil Defense Certificate',
        status: 'required', 
        cost: '', 
        authority: isRTL ? 'شرطة عمان السلطانية - الدفاع المدني' : 'Royal Oman Police - Civil Defense'
      },
      { 
        id: '5', 
        name: '', 
        status: 'required', 
        cost: '', 
        authority: ''
      }
    ];
  });
  
  const [leaseContracts, setLeaseContracts] = useState<LeaseContract[]>(() => {
    if (savedData?.leaseContracts && savedData.leaseContracts.length > 0) {
      return savedData.leaseContracts;
    }
    return [
      {
        id: '1',
        propertyType: isRTL ? 'محل تجاري' : 'Commercial Shop',
        area: '',
        monthlyRent: '',
        duration: '',
        leaseOrOwn: 'rent'
      }
    ];
  });
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const currentLevel = levels.find(l => l.levelId === 2);
  const progressPercentage = currentLevel ? (currentLevel.xp / currentLevel.maxXp) * 100 : 0;

  // Calculate total license cost
  const totalLicenseCost = licenses.reduce((total, license) => {
    return total + (parseFloat(license.cost) || 0);
  }, 0);

  // Save data automatically
  const saveCurrentData = () => {
    const data = {
      licenses,
      leaseContracts,
    };
    updateModuleData('level2', data);
  };

  useEffect(() => {
    saveCurrentData();
  }, [licenses, leaseContracts]);

  // Validate form
  const validateForm = () => {
    const errors: string[] = [];
    
    const hasValidLicense = licenses.some(l => l.name.trim() !== '' && l.cost !== '');
    if (!hasValidLicense) {
      errors.push(isRTL ? 'يجب إدخال ترخيص واحد على الأقل' : 'At least one license is required');
    }
    
    const hasValidLeaseContract = leaseContracts.some(l => l.area !== '' && l.monthlyRent !== '' && l.duration !== '');
    if (!hasValidLeaseContract) {
      errors.push(isRTL ? 'يجب إدخال عقد إيجار/ملكية واحد على الأقل' : 'At least one lease/ownership contract is required');
    }
    
    return errors;
  };

  // Add license
  const addLicense = () => {
    const newLicense: License = {
      id: Date.now().toString(),
      name: '',
      status: 'required',
      cost: '',
      authority: '',
    };
    setLicenses([...licenses, newLicense]);
  };

  // Remove license
  const removeLicense = (id: string) => {
    if (licenses.length > 1) {
      setLicenses(licenses.filter(l => l.id !== id));
    }
  };

  // Update license
  const updateLicense = (id: string, field: keyof License, value: string) => {
    setLicenses(licenses.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  // Add lease contract
  const addLeaseContract = () => {
    const newLeaseContract: LeaseContract = {
      id: Date.now().toString(),
      propertyType: isRTL ? 'محل تجاري' : 'Commercial Shop',
      area: '',
      monthlyRent: '',
      duration: '',
      leaseOrOwn: 'rent'
    };
    setLeaseContracts([...leaseContracts, newLeaseContract]);
  };

  // Remove lease contract
  const removeLeaseContract = (id: string) => {
    if (leaseContracts.length > 1) {
      setLeaseContracts(leaseContracts.filter(l => l.id !== id));
    }
  };

  // Update lease contract
  const updateLeaseContract = (id: string, field: keyof LeaseContract, value: string) => {
    setLeaseContracts(leaseContracts.map(l => l.id === id ? { ...l, [field]: value } : l));
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
          updateLevelProgress(2, currentLevel.maxXp, true);
        }
        
        setTimeout(() => {
          setSaveStatus('idle');
          setCurrentView('module-3');
        }, 1500);
      }
    }, 500);
  };

  return (
    <div className={`min-h-screen p-6 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100'
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
                ? 'text-blue-200 hover:text-white hover:bg-blue-500/20' 
                : 'text-blue-700 hover:text-blue-900 hover:bg-blue-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isRTL ? 'العودة إلى الخريطة' : 'Back to Map'}
          </Button>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-blue-900'
              }`}>
                {isRTL ? 'المستوى 2: الإطار القانوني والتنظيمي' : 'Level 2: Legal Framework'}
              </h1>
              <p className={isDark ? 'text-blue-200' : 'text-blue-700'}>
                {isRTL ? 'استكمال المتطلبات القانونية والتراخيص اللازمة' : 'Complete legal requirements and necessary licenses'}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-sm mb-1 ${isDark ? 'text-blue-200' : 'text-blue-600'}`}>
                {isRTL ? 'التقدم' : 'Progress'}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-32 h-2 rounded-full overflow-hidden ${
                  isDark ? 'bg-slate-700' : 'bg-blue-200'
                }`}>
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Licenses Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`p-6 backdrop-blur-sm mb-6 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/80 border-blue-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-blue-900'
              }`}>
                <Shield className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                {isRTL ? 'التراخيص والموافقات' : 'Licenses & Approvals'}
              </h2>
              <Button
                onClick={addLicense}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-1" />
                {isRTL ? 'إضافة ترخيص' : 'Add License'}
              </Button>
            </div>

            {/* Info Banner - Omani Standard Licenses */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-4 rounded-lg border ${
                isDark 
                  ? 'bg-blue-500/10 border-blue-500/30' 
                  : 'bg-blue-50 border-blue-300'
              }`}>
              <div className="flex items-start gap-3">
                <Lightbulb className={`w-5 h-5 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <div className="flex-1">
                  <h3 className={`font-bold mb-1 text-sm ${
                    isDark ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    {isRTL ? '💡 التراخيص الأساسية في سلطنة عمان' : '💡 Core Licenses in Sultanate of Oman'}
                  </h3>
                  <p className={`text-xs leading-relaxed ${
                    isDark ? 'text-blue-200' : 'text-blue-600'
                  }`}>
                    {isRTL 
                      ? 'تم إدراج التراخيص الأساسية الأربعة المطلوبة في سلطنة عمان كأمثلة توجيهية. يمكنك تعديلها أو إضافة تراخيص إضافية خاصة بنوع مشروعك.'
                      : 'The four core licenses required in the Sultanate of Oman are pre-listed as guidance. You can modify them or add additional licenses specific to your project type.'
                    }
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-3">
              {licenses.map((license, index) => (
                <motion.div
                  key={license.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700/30 border-slate-600' 
                      : 'bg-blue-50/50 border-blue-200'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {/* License Name */}
                    <div className="md:col-span-2">
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-blue-200' : 'text-blue-700'
                      }`}>
                        {isRTL ? 'اسم الترخيص' : 'License Name'}
                      </label>
                      <input
                        type="text"
                        value={license.name}
                        onChange={(e) => updateLicense(license.id, 'name', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'مثال: السجل التجاري' : 'e.g., Commercial Registration'}
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-blue-200' : 'text-blue-700'
                      }`}>
                        {isRTL ? 'الحالة' : 'Status'}
                      </label>
                      <select
                        value={license.status}
                        onChange={(e) => updateLicense(license.id, 'status', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="required">{isRTL ? 'مطلوب' : 'Required'}</option>
                        <option value="in-progress">{isRTL ? 'قيد الإجراء' : 'In Progress'}</option>
                        <option value="completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
                      </select>
                    </div>

                    {/* Cost */}
                    <div>
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-blue-200' : 'text-blue-700'
                      }`}>
                        {isRTL ? 'التكلفة (ر.ع)' : 'Cost (OMR)'}
                      </label>
                      <input
                        type="number"
                        value={license.cost}
                        onChange={(e) => updateLicense(license.id, 'cost', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder="50"
                        min="0"
                      />
                    </div>

                    {/* Authority & Delete */}
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className={`block text-xs mb-1 ${
                          isDark ? 'text-blue-200' : 'text-blue-700'
                        }`}>
                          {isRTL ? 'الجهة' : 'Authority'}
                        </label>
                        <input
                          type="text"
                          value={license.authority}
                          onChange={(e) => updateLicense(license.id, 'authority', e.target.value)}
                          className={`w-full px-3 py-2 rounded text-sm border ${
                            isDark 
                              ? 'bg-slate-700 border-slate-600 text-white' 
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                          placeholder={isRTL ? 'الوزارة/البلدية' : 'Ministry/Municipality'}
                        />
                      </div>
                      {licenses.length > 1 && (
                        <Button
                          onClick={() => removeLicense(license.id)}
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

            {/* Total Cost */}
            <div className={`mt-4 p-3 rounded-lg border ${
              isDark 
                ? 'bg-slate-700/50 border-slate-600' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`font-medium ${
                  isDark ? 'text-blue-200' : 'text-blue-700'
                }`}>
                  {isRTL ? 'إجمالي تكلفة التراخيص:' : 'Total License Cost:'}
                </span>
                <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>
                  {totalLicenseCost.toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Lease Contracts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className={`p-6 backdrop-blur-sm mb-6 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/80 border-blue-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-blue-900'
              }`}>
                <FileText className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                {isRTL ? 'عقود الإيجار (محل، مستودع، مسكن، وغيرها)' : 'Lease Agreements (Shop, Warehouse, Housing, Other)'}
              </h2>
              <Button
                onClick={addLeaseContract}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-1" />
                {isRTL ? 'إضافة عقد' : 'Add Contract'}
              </Button>
            </div>

            <div className="space-y-4">
              {leaseContracts.map((contract, index) => (
                <motion.div
                  key={contract.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700/30 border-slate-600' 
                      : 'bg-blue-50/50 border-blue-200'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                    {/* Property Type */}
                    <div>
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-blue-200' : 'text-blue-700'
                      }`}>
                        {isRTL ? 'نوع العقار' : 'Property Type'}
                      </label>
                      <input
                        type="text"
                        value={contract.propertyType}
                        onChange={(e) => updateLeaseContract(contract.id, 'propertyType', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'محل/مستودع/مسكن' : 'Shop/Warehouse/Housing'}
                      />
                    </div>

                    {/* Area */}
                    <div>
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-blue-200' : 'text-blue-700'
                      }`}>
                        {isRTL ? 'المساحة (م²)' : 'Area (m²)'}
                        <span className="text-red-400 ml-1">*</span>
                      </label>
                      <input
                        type="number"
                        value={contract.area}
                        onChange={(e) => updateLeaseContract(contract.id, 'area', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder="100"
                        min="0"
                      />
                    </div>

                    {/* Monthly Rent */}
                    <div>
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-blue-200' : 'text-blue-700'
                      }`}>
                        {isRTL ? 'القيمة الشهرية (ر.ع)' : 'Monthly Value (OMR)'}
                        <span className="text-red-400 ml-1">*</span>
                      </label>
                      <input
                        type="number"
                        value={contract.monthlyRent}
                        onChange={(e) => updateLeaseContract(contract.id, 'monthlyRent', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder="500"
                        min="0"
                      />
                    </div>

                    {/* Duration */}
                    <div>
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-blue-200' : 'text-blue-700'
                      }`}>
                        {isRTL ? 'المدة (أشهر)' : 'Duration (months)'}
                        <span className="text-red-400 ml-1">*</span>
                      </label>
                      <input
                        type="number"
                        value={contract.duration}
                        onChange={(e) => updateLeaseContract(contract.id, 'duration', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder="12"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Lease Type & Delete Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className={`block text-xs mb-2 ${
                        isDark ? 'text-blue-200' : 'text-blue-700'
                      }`}>
                        {isRTL ? 'نوع الحيازة' : 'Tenure Type'}
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateLeaseContract(contract.id, 'leaseOrOwn', 'rent')}
                          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                            contract.leaseOrOwn === 'rent'
                              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                              : isDark 
                                ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' 
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {isRTL ? 'إيجار' : 'Rent'}
                        </button>
                        <button
                          onClick={() => updateLeaseContract(contract.id, 'leaseOrOwn', 'own')}
                          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                            contract.leaseOrOwn === 'own'
                              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                              : isDark 
                                ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' 
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {isRTL ? 'تملك' : 'Own'}
                        </button>
                      </div>
                    </div>
                    {leaseContracts.length > 1 && (
                      <Button
                        onClick={() => removeLeaseContract(contract.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
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
          transition={{ delay: 0.4 }}
          className="flex justify-end gap-4"
        >
          <Button
            onClick={() => setCurrentView('space-map')}
            variant="outline"
            className={`${
              isDark 
                ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                : 'border-blue-300 text-blue-700 hover:bg-blue-100'
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
                : 'bg-blue-500 hover:bg-blue-600'
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
      </div>
    </div>
  );
}