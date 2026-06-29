import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Grid3x3, Calendar, Upload, Flag, ArrowLeft, Save, AlertCircle, CheckCircle2, Rocket, Award } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { generateCEOInsights } from '@/lib/copilot-ai';
import type { BMCData, Oman2040Contribution } from '@/app/contexts/YieldXContext';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

export function Level7BMCImplementation() {
  const { moduleData, updateModuleData, language, setCurrentView, updateBMC, updateOman2040, bmcData, oman2040, projectTypeData, studyModeData, enhancedSWOT, financialKPIs, theme } = useYieldX();

  const isRTL = language === 'ar';
  const isDark = theme === 'dark';
  const savedData = moduleData['bmcImplementation'];
  
  // BMC State
  const [keyPartners, setKeyPartners] = useState<string[]>(
    bmcData?.keyPartners || savedData?.bmc?.keyPartners || ['']
  );
  const [keyActivities, setKeyActivities] = useState<string[]>(
    bmcData?.keyActivities || savedData?.bmc?.keyActivities || ['']
  );
  const [keyResources, setKeyResources] = useState<string[]>(
    bmcData?.keyResources || savedData?.bmc?.keyResources || ['']
  );
  const [valueProposition, setValueProposition] = useState<string[]>(
    bmcData?.valueProposition || savedData?.bmc?.valueProposition || ['']
  );
  const [customerRelationships, setCustomerRelationships] = useState<string[]>(
    bmcData?.customerRelationships || savedData?.bmc?.customerRelationships || ['']
  );
  const [channels, setChannels] = useState<string[]>(
    bmcData?.channels || savedData?.bmc?.channels || ['']
  );
  const [customerSegments, setCustomerSegments] = useState<string[]>(
    bmcData?.customerSegments || savedData?.bmc?.customerSegments || ['']
  );
  const [costStructure, setCostStructure] = useState<string[]>(
    bmcData?.costStructure || savedData?.bmc?.costStructure || ['']
  );
  const [revenueStreams, setRevenueStreams] = useState<string[]>(
    bmcData?.revenueStreams || savedData?.bmc?.revenueStreams || ['']
  );

  // Oman 2040 State
  const [directJobs, setDirectJobs] = useState(
    oman2040?.directJobs?.toString() || savedData?.oman2040?.directJobs?.toString() || ''
  );
  const [indirectJobs, setIndirectJobs] = useState(
    oman2040?.indirectJobs?.toString() || savedData?.oman2040?.indirectJobs?.toString() || ''
  );
  const [economicDiversification, setEconomicDiversification] = useState(
    oman2040?.economicDiversification || savedData?.oman2040?.economicDiversification || ''
  );
  const [skillsDevelopment, setSkillsDevelopment] = useState(
    oman2040?.skillsDevelopment || savedData?.oman2040?.skillsDevelopment || ''
  );

  // Timeline milestones
  const [milestones, setMilestones] = useState<Array<{id: string; task: string; duration: string; startMonth: string}>>(
    savedData?.milestones || [
      { id: '1', task: '', duration: '', startMonth: '1' }
    ]
  );
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Standalone completion tracker — BMC Implementation is bonus content, not one of the
  // official levelId 0-7 entries in INITIAL_LEVELS, so it does not use the shared levels/XP system.
  const [isComplete, setIsComplete] = useState<boolean>(savedData?.completed || false);
  const progressPercentage = isComplete ? 100 : 0;

  // Helper functions for array management
  const addItem = (arr: string[], setter: (arr: string[]) => void) => {
    if (arr.length < 5) {
      setter([...arr, '']);
    }
  };

  const removeItem = (arr: string[], index: number, setter: (arr: string[]) => void) => {
    if (arr.length > 1) {
      setter(arr.filter((_, i) => i !== index));
    }
  };

  const updateItem = (arr: string[], index: number, value: string, setter: (arr: string[]) => void) => {
    const newArr = [...arr];
    newArr[index] = value;
    setter(newArr);
  };

  // Milestone functions
  const addMilestone = () => {
    const newMilestone = {
      id: Date.now().toString(),
      task: '',
      duration: '',
      startMonth: '1',
    };
    setMilestones([...milestones, newMilestone]);
  };

  const removeMilestone = (id: string) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter(m => m.id !== id));
    }
  };

  const updateMilestone = (id: string, field: string, value: string) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  // Save data automatically
  const saveCurrentData = (completedOverride?: boolean) => {
    const bmcDataToSave: BMCData = {
      keyPartners,
      keyActivities,
      keyResources,
      valueProposition,
      customerRelationships,
      channels,
      customerSegments,
      costStructure,
      revenueStreams,
    };

    const oman2040ToSave: Oman2040Contribution = {
      directJobs: parseInt(directJobs) || 0,
      indirectJobs: parseInt(indirectJobs) || 0,
      economicDiversification,
      skillsDevelopment,
    };

    const data = {
      bmc: bmcDataToSave,
      oman2040: oman2040ToSave,
      milestones,
      completed: completedOverride ?? isComplete,
    };

    updateModuleData('bmcImplementation', data);
    updateBMC(bmcDataToSave);
    updateOman2040(oman2040ToSave);
  };

  useEffect(() => {
    saveCurrentData();
  }, [keyPartners, keyActivities, keyResources, valueProposition, customerRelationships, channels, customerSegments, costStructure, revenueStreams, directJobs, indirectJobs, economicDiversification, skillsDevelopment, milestones]);

  // Validate form
  const validateForm = () => {
    const errors: string[] = [];
    
    const hasValidBMC = 
      keyPartners.some(p => p.trim() !== '') &&
      keyActivities.some(a => a.trim() !== '') &&
      keyResources.some(r => r.trim() !== '') &&
      valueProposition.some(v => v.trim() !== '') &&
      customerSegments.some(c => c.trim() !== '') &&
      costStructure.some(c => c.trim() !== '') &&
      revenueStreams.some(r => r.trim() !== '');
    
    if (!hasValidBMC) {
      errors.push(isRTL ? 'يجب إكمال جميع أقسام نموذج الأعمال' : 'All Business Model Canvas sections must be completed');
    }
    
    if (!directJobs || parseInt(directJobs) <= 0) {
      errors.push(isRTL ? 'يجب تحديد عدد الوظائف المباشرة' : 'Direct jobs count is required');
    }
    
    if (!economicDiversification.trim()) {
      errors.push(isRTL ? 'يجب شرح المساهمة في التنويع الاقتصادي' : 'Economic diversification contribution is required');
    }
    
    const hasValidMilestone = milestones.some(m => m.task.trim() !== '' && m.duration !== '');
    if (!hasValidMilestone) {
      errors.push(isRTL ? 'يجب إضافة معلم واحد على الأقل في الجدول الزمني' : 'At least one milestone is required in the timeline');
    }
    
    return errors;
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

        if (!isComplete) {
          setIsComplete(true);
          saveCurrentData(true);
        }

        void (async () => {
          try {
            const insights = await generateCEOInsights(
              {
                projectTypeData,
                studyModeData,
                moduleData,
                enhancedSWOT,
                financialKPIs,
                bmcData,
                oman2040,
              },
              language
            );
            window.dispatchEvent(new CustomEvent('yieldx:copilot-insights-generated', {
              detail: {
                role: 'CEO',
                messages: insights,
              },
            }));
          } catch (error) {
            console.error('Orion background generation failed', error);
            window.dispatchEvent(new CustomEvent('yieldx:copilot-insights-error', {
              detail: {
                role: 'CEO',
                error: language === 'ar'
                  ? 'فشل إنشاء الرؤى الاستراتيجية في الخلفية. حاول مرة أخرى.'
                  : 'Strategic insights generation failed in the background. Please try again.',
              },
            }));
          }
        })();

        setTimeout(() => {
          setSaveStatus('idle');
          setCurrentView('space-map');
        }, 1500);
      }
    }, 500);
  };

  return (
    <div className={`min-h-screen p-6 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900' 
        : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100'
    }`}>
      <div className="max-w-7xl mx-auto">
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
                ? 'text-indigo-200 hover:text-white hover:bg-indigo-500/20' 
                : 'text-indigo-700 hover:text-indigo-900 hover:bg-indigo-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isRTL ? 'العودة إلى الخريطة' : 'Back to Map'}
          </Button>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-indigo-900'
              }`}>
                {isRTL ? 'النموذج الشامل والتنفيذ' : 'Comprehensive Model & Implementation'}
              </h1>
              <p className={isDark ? 'text-indigo-200' : 'text-indigo-700'}>
                {isRTL ? 'إكمال Business Model Canvas والجدول الزمني والمساهمة في رؤية عُمان 2040' : 'Complete Business Model Canvas, timeline, and Oman 2040 contribution'}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-sm mb-1 ${isDark ? 'text-indigo-200' : 'text-indigo-600'}`}>
                {isRTL ? 'التقدم' : 'Progress'}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-32 h-2 rounded-full overflow-hidden ${
                  isDark ? 'bg-slate-700' : 'bg-indigo-200'
                }`}>
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-indigo-900'}`}>
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Business Model Canvas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`p-6 backdrop-blur-sm mb-6 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/80 border-indigo-200'
          }`}>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-indigo-900'
            }`}>
              <Grid3x3 className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
              {isRTL ? 'نموذج الأعمال التفاعلي (Business Model Canvas)' : 'Interactive Business Model Canvas'}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-4">
                {/* Key Partners */}
                <div className={`p-4 rounded-lg border ${
                  isDark 
                    ? 'bg-purple-500/10 border-purple-500/30' 
                    : 'bg-purple-50 border-purple-300'
                }`}>
                  <h3 className={`font-bold mb-2 text-sm ${
                    isDark ? 'text-purple-300' : 'text-purple-700'
                  }`}>
                    {isRTL ? 'الشركاء الرئيسيون' : 'Key Partners'}
                  </h3>
                  {keyPartners.map((partner, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={partner}
                        onChange={(e) => updateItem(keyPartners, idx, e.target.value, setKeyPartners)}
                        className={`flex-1 px-2 py-1 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700/50 border-slate-600 text-white' 
                            : 'bg-white border-purple-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'موردون، موزعون...' : 'Suppliers, distributors...'}
                      />
                      {keyPartners.length > 1 && (
                        <button onClick={() => removeItem(keyPartners, idx, setKeyPartners)} className="text-red-400 text-xs">×</button>
                      )}
                    </div>
                  ))}
                  {keyPartners.length < 5 && (
                    <Button 
                      onClick={() => addItem(keyPartners, setKeyPartners)} 
                      size="sm" 
                      variant="ghost" 
                      className={`text-xs ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
                    >
                      + {isRTL ? 'إضافة' : 'Add'}
                    </Button>
                  )}
                </div>

                {/* Key Activities */}
                <div className={`p-4 rounded-lg border ${
                  isDark 
                    ? 'bg-blue-500/10 border-blue-500/30' 
                    : 'bg-blue-50 border-blue-300'
                }`}>
                  <h3 className={`font-bold mb-2 text-sm ${
                    isDark ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    {isRTL ? 'الأنشطة الرئيسية' : 'Key Activities'}
                  </h3>
                  {keyActivities.map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={activity}
                        onChange={(e) => updateItem(keyActivities, idx, e.target.value, setKeyActivities)}
                        className={`flex-1 px-2 py-1 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700/50 border-slate-600 text-white' 
                            : 'bg-white border-blue-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'إنتاج، تسويق...' : 'Production, marketing...'}
                      />
                      {keyActivities.length > 1 && (
                        <button onClick={() => removeItem(keyActivities, idx, setKeyActivities)} className="text-red-400 text-xs">×</button>
                      )}
                    </div>
                  ))}
                  {keyActivities.length < 5 && (
                    <Button 
                      onClick={() => addItem(keyActivities, setKeyActivities)} 
                      size="sm" 
                      variant="ghost" 
                      className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                    >
                      + {isRTL ? 'إضافة' : 'Add'}
                    </Button>
                  )}
                </div>

                {/* Key Resources */}
                <div className={`p-4 rounded-lg border ${
                  isDark 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-green-50 border-green-300'
                }`}>
                  <h3 className={`font-bold mb-2 text-sm ${
                    isDark ? 'text-green-300' : 'text-green-700'
                  }`}>
                    {isRTL ? 'الموارد الرئيسية' : 'Key Resources'}
                  </h3>
                  {keyResources.map((resource, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={resource}
                        onChange={(e) => updateItem(keyResources, idx, e.target.value, setKeyResources)}
                        className={`flex-1 px-2 py-1 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700/50 border-slate-600 text-white' 
                            : 'bg-white border-green-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'معدات، موظفون...' : 'Equipment, staff...'}
                      />
                      {keyResources.length > 1 && (
                        <button onClick={() => removeItem(keyResources, idx, setKeyResources)} className="text-red-400 text-xs">×</button>
                      )}
                    </div>
                  ))}
                  {keyResources.length < 5 && (
                    <Button 
                      onClick={() => addItem(keyResources, setKeyResources)} 
                      size="sm" 
                      variant="ghost" 
                      className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}
                    >
                      + {isRTL ? 'إضافة' : 'Add'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Center Column */}
              <div className="space-y-4">
                {/* Value Proposition */}
                <div className={`p-4 rounded-lg border-2 ${
                  isDark 
                    ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/50' 
                    : 'bg-gradient-to-br from-orange-100 to-red-100 border-orange-400'
                }`}>
                  <h3 className={`font-bold mb-2 text-sm ${
                    isDark ? 'text-orange-300' : 'text-orange-700'
                  }`}>
                    {isRTL ? 'عرض القيمة' : 'Value Proposition'}
                  </h3>
                  {valueProposition.map((value, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateItem(valueProposition, idx, e.target.value, setValueProposition)}
                        className={`flex-1 px-2 py-1 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700/50 border-slate-600 text-white' 
                            : 'bg-white border-orange-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'ما الذي يميز منتجك؟' : 'What makes your product unique?'}
                      />
                      {valueProposition.length > 1 && (
                        <button onClick={() => removeItem(valueProposition, idx, setValueProposition)} className="text-red-400 text-xs">×</button>
                      )}
                    </div>
                  ))}
                  {valueProposition.length < 5 && (
                    <Button 
                      onClick={() => addItem(valueProposition, setValueProposition)} 
                      size="sm" 
                      variant="ghost" 
                      className={`text-xs ${isDark ? 'text-orange-400' : 'text-orange-600'}`}
                    >
                      + {isRTL ? 'إضافة' : 'Add'}
                    </Button>
                  )}
                </div>

                {/* Customer Relationships */}
                <div className={`p-4 rounded-lg border ${
                  isDark 
                    ? 'bg-teal-500/10 border-teal-500/30' 
                    : 'bg-teal-50 border-teal-300'
                }`}>
                  <h3 className={`font-bold mb-2 text-sm ${
                    isDark ? 'text-teal-300' : 'text-teal-700'
                  }`}>
                    {isRTL ? 'العلاقة مع العملاء' : 'Customer Relationships'}
                  </h3>
                  {customerRelationships.map((rel, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={rel}
                        onChange={(e) => updateItem(customerRelationships, idx, e.target.value, setCustomerRelationships)}
                        className={`flex-1 px-2 py-1 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700/50 border-slate-600 text-white' 
                            : 'bg-white border-teal-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'خدمة عملاء، برنامج ولاء...' : 'Customer service, loyalty program...'}
                      />
                      {customerRelationships.length > 1 && (
                        <button onClick={() => removeItem(customerRelationships, idx, setCustomerRelationships)} className="text-red-400 text-xs">×</button>
                      )}
                    </div>
                  ))}
                  {customerRelationships.length < 5 && (
                    <Button 
                      onClick={() => addItem(customerRelationships, setCustomerRelationships)} 
                      size="sm" 
                      variant="ghost" 
                      className={`text-xs ${isDark ? 'text-teal-400' : 'text-teal-600'}`}
                    >
                      + {isRTL ? 'إضافة' : 'Add'}
                    </Button>
                  )}
                </div>

                {/* Channels */}
                <div className={`p-4 rounded-lg border ${
                  isDark 
                    ? 'bg-cyan-500/10 border-cyan-500/30' 
                    : 'bg-cyan-50 border-cyan-300'
                }`}>
                  <h3 className={`font-bold mb-2 text-sm ${
                    isDark ? 'text-cyan-300' : 'text-cyan-700'
                  }`}>
                    {isRTL ? 'القنوات' : 'Channels'}
                  </h3>
                  {channels.map((channel, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={channel}
                        onChange={(e) => updateItem(channels, idx, e.target.value, setChannels)}
                        className={`flex-1 px-2 py-1 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700/50 border-slate-600 text-white' 
                            : 'bg-white border-cyan-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'متجر، موقع إلكتروني...' : 'Store, website...'}
                      />
                      {channels.length > 1 && (
                        <button onClick={() => removeItem(channels, idx, setChannels)} className="text-red-400 text-xs">×</button>
                      )}
                    </div>
                  ))}
                  {channels.length < 5 && (
                    <Button 
                      onClick={() => addItem(channels, setChannels)} 
                      size="sm" 
                      variant="ghost" 
                      className={`text-xs ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}
                    >
                      + {isRTL ? 'إضافة' : 'Add'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-2 space-y-4">
                {/* Customer Segments */}
                <div className={`p-4 rounded-lg border ${
                  isDark 
                    ? 'bg-pink-500/10 border-pink-500/30' 
                    : 'bg-pink-50 border-pink-300'
                }`}>
                  <h3 className={`font-bold mb-2 text-sm ${
                    isDark ? 'text-pink-300' : 'text-pink-700'
                  }`}>
                    {isRTL ? 'شرائح العملاء' : 'Customer Segments'}
                  </h3>
                  {customerSegments.map((segment, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={segment}
                        onChange={(e) => updateItem(customerSegments, idx, e.target.value, setCustomerSegments)}
                        className={`flex-1 px-2 py-1 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700/50 border-slate-600 text-white' 
                            : 'bg-white border-pink-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'أفراد، شركات...' : 'Individuals, companies...'}
                      />
                      {customerSegments.length > 1 && (
                        <button onClick={() => removeItem(customerSegments, idx, setCustomerSegments)} className="text-red-400 text-xs">×</button>
                      )}
                    </div>
                  ))}
                  {customerSegments.length < 5 && (
                    <Button 
                      onClick={() => addItem(customerSegments, setCustomerSegments)} 
                      size="sm" 
                      variant="ghost" 
                      className={`text-xs ${isDark ? 'text-pink-400' : 'text-pink-600'}`}
                    >
                      + {isRTL ? 'إضافة' : 'Add'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Bottom Row */}
              <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cost Structure */}
                <div className={`p-4 rounded-lg border ${
                  isDark 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : 'bg-red-50 border-red-300'
                }`}>
                  <h3 className={`font-bold mb-2 text-sm ${
                    isDark ? 'text-red-300' : 'text-red-700'
                  }`}>
                    {isRTL ? 'هيكل التكاليف' : 'Cost Structure'}
                  </h3>
                  {costStructure.map((cost, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={cost}
                        onChange={(e) => updateItem(costStructure, idx, e.target.value, setCostStructure)}
                        className={`flex-1 px-2 py-1 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700/50 border-slate-600 text-white' 
                            : 'bg-white border-red-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'رواتب، إيجار، مواد...' : 'Salaries, rent, materials...'}
                      />
                      {costStructure.length > 1 && (
                        <button onClick={() => removeItem(costStructure, idx, setCostStructure)} className="text-red-400 text-xs">×</button>
                      )}
                    </div>
                  ))}
                  {costStructure.length < 5 && (
                    <Button 
                      onClick={() => addItem(costStructure, setCostStructure)} 
                      size="sm" 
                      variant="ghost" 
                      className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}
                    >
                      + {isRTL ? 'إضافة' : 'Add'}
                    </Button>
                  )}
                </div>

                {/* Revenue Streams */}
                <div className={`p-4 rounded-lg border ${
                  isDark 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : 'bg-emerald-50 border-emerald-300'
                }`}>
                  <h3 className={`font-bold mb-2 text-sm ${
                    isDark ? 'text-emerald-300' : 'text-emerald-700'
                  }`}>
                    {isRTL ? 'مصادر الإيرادات' : 'Revenue Streams'}
                  </h3>
                  {revenueStreams.map((stream, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={stream}
                        onChange={(e) => updateItem(revenueStreams, idx, e.target.value, setRevenueStreams)}
                        className={`flex-1 px-2 py-1 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700/50 border-slate-600 text-white' 
                            : 'bg-white border-emerald-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'مبيعات، اشتراكات...' : 'Sales, subscriptions...'}
                      />
                      {revenueStreams.length > 1 && (
                        <button onClick={() => removeItem(revenueStreams, idx, setRevenueStreams)} className="text-red-400 text-xs">×</button>
                      )}
                    </div>
                  ))}
                  {revenueStreams.length < 5 && (
                    <Button 
                      onClick={() => addItem(revenueStreams, setRevenueStreams)} 
                      size="sm" 
                      variant="ghost" 
                      className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                    >
                      + {isRTL ? 'إضافة' : 'Add'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Implementation Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={`p-6 backdrop-blur-sm mb-6 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/80 border-indigo-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-indigo-900'
              }`}>
                <Calendar className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                {isRTL ? 'الجدول الزمني التنفيذي' : 'Implementation Timeline'}
              </h2>
              <Button onClick={addMilestone} size="sm" className="bg-indigo-500 hover:bg-indigo-600">
                + {isRTL ? 'إضافة معلم' : 'Add Milestone'}
              </Button>
            </div>

            <div className="space-y-3">
              {milestones.map((milestone, idx) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-3 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700/30 border-slate-600' 
                      : 'bg-indigo-50 border-indigo-200'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-indigo-200' : 'text-indigo-700'
                      }`}>
                        {isRTL ? 'المهمة' : 'Task'}
                      </label>
                      <input
                        type="text"
                        value={milestone.task}
                        onChange={(e) => updateMilestone(milestone.id, 'task', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-indigo-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'مثال: التسجيل القانوني' : 'e.g., Legal registration'}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-indigo-200' : 'text-indigo-700'
                      }`}>
                        {isRTL ? 'المدة (أسابيع)' : 'Duration (weeks)'}
                      </label>
                      <input
                        type="number"
                        value={milestone.duration}
                        onChange={(e) => updateMilestone(milestone.id, 'duration', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-indigo-300 text-slate-900'
                        }`}
                        placeholder="2"
                        min="1"
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className={`block text-xs mb-1 ${
                          isDark ? 'text-indigo-200' : 'text-indigo-700'
                        }`}>
                          {isRTL ? 'شهر البدء' : 'Start Month'}
                        </label>
                        <input
                          type="number"
                          value={milestone.startMonth}
                          onChange={(e) => updateMilestone(milestone.id, 'startMonth', e.target.value)}
                          className={`w-full px-3 py-2 rounded text-sm border ${
                            isDark 
                              ? 'bg-slate-700 border-slate-600 text-white' 
                              : 'bg-white border-indigo-300 text-slate-900'
                          }`}
                          placeholder="1"
                          min="1"
                          max="12"
                        />
                      </div>
                      {milestones.length > 1 && (
                        <Button
                          onClick={() => removeMilestone(milestone.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Oman 2040 Contribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className={`p-6 backdrop-blur-sm mb-6 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/80 border-indigo-200'
          }`}>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-indigo-900'
            }`}>
              <Flag className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
              {isRTL ? 'المساهمة في رؤية عُمان 2040' : 'Contribution to Oman Vision 2040'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30' 
                  : 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-400'
              }`}>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-green-200' : 'text-green-700'
                }`}>
                  <Award className="w-4 h-4 inline mr-1" />
                  {isRTL ? 'الوظائف المباشرة' : 'Direct Jobs Created'}
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  type="number"
                  value={directJobs}
                  onChange={(e) => setDirectJobs(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700/50 border-slate-600 text-white' 
                      : 'bg-white border-green-300 text-slate-900'
                  }`}
                  placeholder="5"
                  min="1"
                />
              </div>

              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30' 
                  : 'bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-400'
              }`}>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-blue-200' : 'text-blue-700'
                }`}>
                  {isRTL ? 'الوظائف غير المباشرة' : 'Indirect Jobs Created'}
                </label>
                <input
                  type="number"
                  value={indirectJobs}
                  onChange={(e) => setIndirectJobs(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700/50 border-slate-600 text-white' 
                      : 'bg-white border-blue-300 text-slate-900'
                  }`}
                  placeholder="10"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-indigo-200' : 'text-indigo-700'
                }`}>
                  {isRTL ? 'المساهمة في التنويع الاقتصادي' : 'Economic Diversification Contribution'}
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <textarea
                  value={economicDiversification}
                  onChange={(e) => setEconomicDiversification(e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700/50 border-slate-600 text-white' 
                      : 'bg-white border-indigo-300 text-slate-900'
                  }`}
                  placeholder={isRTL ? 'كيف يساهم مشروعك في تنويع الاقتصاد العُماني؟' : 'How does your project contribute to Omani economic diversification?'}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-indigo-200' : 'text-indigo-700'
                }`}>
                  {isRTL ? 'تطوير المهارات الوطنية' : 'National Skills Development'}
                </label>
                <textarea
                  value={skillsDevelopment}
                  onChange={(e) => setSkillsDevelopment(e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700/50 border-slate-600 text-white' 
                      : 'bg-white border-indigo-300 text-slate-900'
                  }`}
                  placeholder={isRTL ? 'ما هي المهارات التي سيطورها مشروعك للكوادر الوطنية؟' : 'What skills will your project develop for national talent?'}
                />
              </div>
            </div>

            {/* Summary Card */}
            <div className={`mt-4 p-4 rounded-lg border-2 ${
              isDark 
                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/50' 
                : 'bg-gradient-to-r from-indigo-100 to-purple-100 border-indigo-400'
            }`}>
              <div className="flex items-center gap-3">
                <Rocket className={`w-8 h-8 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <div className="flex-1">
                  <div className={`text-sm mb-1 ${isDark ? 'text-indigo-200' : 'text-indigo-700'}`}>
                    {isRTL ? 'تأثير المشروع' : 'Project Impact'}
                  </div>
                  <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-indigo-900'}`}>
                    {parseInt(directJobs) + parseInt(indirectJobs) || 0} {isRTL ? 'فرصة عمل إجمالية' : 'Total Job Opportunities'}
                  </div>
                </div>
              </div>
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
                : 'border-indigo-300 text-indigo-700 hover:bg-indigo-100'
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
                : 'bg-indigo-500 hover:bg-indigo-600'
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
                {isRTL ? '🎉 مكتمل!' : '🎉 Complete!'}
              </>
            )}
            {(saveStatus === 'idle' || saveStatus === 'error') && (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isRTL ? 'حفظ وإنهاء' : 'Save & Finish'}
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}