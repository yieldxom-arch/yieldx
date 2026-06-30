import React, { useState, useEffect } from 'react';
import { CompetitorAnalysisMap } from './CompetitorAnalysisMap';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Target, TrendingUp, Lightbulb, ArrowLeft, Save, AlertCircle, CheckCircle2, Sparkles, Info } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { generateCMOInsights } from '@/lib/copilot-ai';
import type { SWOTPoint } from '@/app/contexts/YieldXContext';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { getSWOTSuggestions, getTypicalProfitMargin, getSectorName } from '@/app/config/sectorConfig';
import { getLevelAiFeedback, type AiFeedback } from '@/lib/ai';
import { AiFeedbackCard } from '@/app/components/ai/AiFeedbackCard';

interface Competitor {
  id: string;
  name: string;
  strengths: string;
  weaknesses: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
  monthlyQuantity: string;
  profitMargin: string;
}

export function Level5MarketStrategy() {
  const { moduleData, updateModuleData, language, setCurrentView, levels, updateLevelProgress, updateEnhancedSWOT, enhancedSWOT, projectTypeData, studyModeData, financialKPIs, bmcData, oman2040, theme } = useYieldX();
  
  const isRTL = language === 'ar';
  const isDark = theme === 'dark';
  const savedData = moduleData['level7'];
  
  // State
  const [competitors, setCompetitors] = useState<Competitor[]>(
    savedData?.competitors && savedData.competitors.length > 0
      ? savedData.competitors
      : [{ id: '1', name: '', strengths: '', weaknesses: '' }]
  );
  
  const [products, setProducts] = useState<Product[]>(
    savedData?.products && savedData.products.length > 0
      ? savedData.products
      : [{ id: '1', name: '', price: '', monthlyQuantity: '', profitMargin: '' }]
  );

  // SWOT State - Our Project
  const [strengths, setStrengths] = useState<SWOTPoint[]>(
    enhancedSWOT?.strengths || savedData?.swot?.strengths || [{ id: '1', text: '', category: 'strength', order: 0 }]
  );
  const [weaknesses, setWeaknesses] = useState<SWOTPoint[]>(
    enhancedSWOT?.weaknesses || savedData?.swot?.weaknesses || [{ id: '1', text: '', category: 'weakness', order: 0 }]
  );
  const [opportunities, setOpportunities] = useState<SWOTPoint[]>(
    enhancedSWOT?.opportunities || savedData?.swot?.opportunities || [{ id: '1', text: '', category: 'opportunity', order: 0 }]
  );
  const [threats, setThreats] = useState<SWOTPoint[]>(
    enhancedSWOT?.threats || savedData?.swot?.threats || [{ id: '1', text: '', category: 'threat', order: 0 }]
  );

  // SWOT State - Competitors
  const [competitorStrengths, setCompetitorStrengths] = useState<SWOTPoint[]>(
    savedData?.competitorSwot?.strengths || [{ id: '1', text: '', category: 'strength', order: 0 }]
  );
  const [competitorWeaknesses, setCompetitorWeaknesses] = useState<SWOTPoint[]>(
    savedData?.competitorSwot?.weaknesses || [{ id: '1', text: '', category: 'weakness', order: 0 }]
  );
  const [competitorOpportunities, setCompetitorOpportunities] = useState<SWOTPoint[]>(
    savedData?.competitorSwot?.opportunities || [{ id: '1', text: '', category: 'opportunity', order: 0 }]
  );
  const [competitorThreats, setCompetitorThreats] = useState<SWOTPoint[]>(
    savedData?.competitorSwot?.threats || [{ id: '1', text: '', category: 'threat', order: 0 }]
  );
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [aiFeedback, setAiFeedback] = useState<AiFeedback | null>(moduleData['level7']?.aiFeedback || null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const currentLevel = levels.find(l => l.levelId === 7);
  const progressPercentage = currentLevel ? (currentLevel.xp / currentLevel.maxXp) * 100 : 0;

  // Calculate total monthly revenue
  const totalMonthlyRevenue = products.reduce((sum, product) => {
    const price = parseFloat(product.price) || 0;
    const qty = parseFloat(product.monthlyQuantity) || 0;
    return sum + (price * qty);
  }, 0);

  // Save data automatically
  const saveCurrentData = () => {
    const data = {
      competitors,
      products,
      totalMonthlyRevenue,
      swot: {
        strengths,
        weaknesses,
        opportunities,
        threats,
      },
      competitorSwot: {
        strengths: competitorStrengths,
        weaknesses: competitorWeaknesses,
        opportunities: competitorOpportunities,
        threats: competitorThreats,
      },
    };
    updateModuleData('level7', data);
    
    // Update context SWOT
    updateEnhancedSWOT({
      strengths,
      weaknesses,
      opportunities,
      threats,
    });
  };

  useEffect(() => {
    saveCurrentData();
  }, [competitors, products, strengths, weaknesses, opportunities, threats, competitorStrengths, competitorWeaknesses, competitorOpportunities, competitorThreats]);

  // Validate form
  const validateForm = () => {
    const errors: string[] = [];
    
    const hasValidCompetitor = competitors.some(c => c.name.trim() !== '');
    if (!hasValidCompetitor) {
      errors.push(isRTL ? 'يجب إدخال منافس واحد على الأقل' : 'At least one competitor is required');
    }
    
    const hasValidProduct = products.some(p => p.name.trim() !== '' && p.price !== '');
    if (!hasValidProduct) {
      errors.push(isRTL ? 'يجب إدخال منتج/خدمة واحدة على الأقل' : 'At least one product/service is required');
    }
    
    const hasValidStrength = strengths.some(s => s.text.trim() !== '');
    const hasValidWeakness = weaknesses.some(w => w.text.trim() !== '');
    const hasValidOpportunity = opportunities.some(o => o.text.trim() !== '');
    const hasValidThreat = threats.some(t => t.text.trim() !== '');
    
    if (!hasValidStrength || !hasValidWeakness || !hasValidOpportunity || !hasValidThreat) {
      errors.push(isRTL ? 'يجب إكمال تحليل SWOT بنقطة واحدة على الأقل في كل قسم' : 'SWOT analysis must have at least one point in each category');
    }
    
    return errors;
  };

  // Competitor functions
  const addCompetitor = () => {
    if (competitors.length < 3) {
      const newCompetitor: Competitor = {
        id: Date.now().toString(),
        name: '',
        strengths: '',
        weaknesses: '',
      };
      setCompetitors([...competitors, newCompetitor]);
    }
  };

  const removeCompetitor = (id: string) => {
    if (competitors.length > 1) {
      setCompetitors(competitors.filter(c => c.id !== id));
    }
  };

  const updateCompetitor = (id: string, field: keyof Competitor, value: string) => {
    setCompetitors(competitors.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // Product functions
  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: '',
      price: '',
      monthlyQuantity: '',
      profitMargin: '',
    };
    setProducts([...products, newProduct]);
  };

  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const updateProduct = (id: string, field: keyof Product, value: string) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // SWOT functions - Our Project
  const addSWOTPoint = (category: 'strength' | 'weakness' | 'opportunity' | 'threat') => {
    const getCurrentList = () => {
      switch(category) {
        case 'strength': return strengths;
        case 'weakness': return weaknesses;
        case 'opportunity': return opportunities;
        case 'threat': return threats;
      }
    };
    
    const setList = (list: SWOTPoint[]) => {
      switch(category) {
        case 'strength': setStrengths(list); break;
        case 'weakness': setWeaknesses(list); break;
        case 'opportunity': setOpportunities(list); break;
        case 'threat': setThreats(list); break;
      }
    };
    
    const currentList = getCurrentList();
    const newPoint: SWOTPoint = {
      id: Date.now().toString(),
      text: '',
      category,
      order: currentList.length,
    };
    setList([...currentList, newPoint]);
  };

  const removeSWOTPoint = (category: 'strength' | 'weakness' | 'opportunity' | 'threat', id: string) => {
    const getCurrentList = () => {
      switch(category) {
        case 'strength': return strengths;
        case 'weakness': return weaknesses;
        case 'opportunity': return opportunities;
        case 'threat': return threats;
      }
    };
    
    const setList = (list: SWOTPoint[]) => {
      switch(category) {
        case 'strength': setStrengths(list); break;
        case 'weakness': setWeaknesses(list); break;
        case 'opportunity': setOpportunities(list); break;
        case 'threat': setThreats(list); break;
      }
    };
    
    const currentList = getCurrentList();
    if (currentList.length > 1) {
      setList(currentList.filter(p => p.id !== id));
    }
  };

  const updateSWOTPoint = (category: 'strength' | 'weakness' | 'opportunity' | 'threat', id: string, text: string) => {
    const updateList = (list: SWOTPoint[]) => list.map(p => p.id === id ? { ...p, text } : p);
    
    switch(category) {
      case 'strength': setStrengths(updateList(strengths)); break;
      case 'weakness': setWeaknesses(updateList(weaknesses)); break;
      case 'opportunity': setOpportunities(updateList(opportunities)); break;
      case 'threat': setThreats(updateList(threats)); break;
    }
  };

  // SWOT functions - Competitors
  const addCompetitorSWOTPoint = (category: 'strength' | 'weakness' | 'opportunity' | 'threat') => {
    const getCurrentList = () => {
      switch(category) {
        case 'strength': return competitorStrengths;
        case 'weakness': return competitorWeaknesses;
        case 'opportunity': return competitorOpportunities;
        case 'threat': return competitorThreats;
      }
    };
    
    const setList = (list: SWOTPoint[]) => {
      switch(category) {
        case 'strength': setCompetitorStrengths(list); break;
        case 'weakness': setCompetitorWeaknesses(list); break;
        case 'opportunity': setCompetitorOpportunities(list); break;
        case 'threat': setCompetitorThreats(list); break;
      }
    };
    
    const currentList = getCurrentList();
    const newPoint: SWOTPoint = {
      id: Date.now().toString(),
      text: '',
      category,
      order: currentList.length,
    };
    setList([...currentList, newPoint]);
  };

  const removeCompetitorSWOTPoint = (category: 'strength' | 'weakness' | 'opportunity' | 'threat', id: string) => {
    const getCurrentList = () => {
      switch(category) {
        case 'strength': return competitorStrengths;
        case 'weakness': return competitorWeaknesses;
        case 'opportunity': return competitorOpportunities;
        case 'threat': return competitorThreats;
      }
    };
    
    const setList = (list: SWOTPoint[]) => {
      switch(category) {
        case 'strength': setCompetitorStrengths(list); break;
        case 'weakness': setCompetitorWeaknesses(list); break;
        case 'opportunity': setCompetitorOpportunities(list); break;
        case 'threat': setCompetitorThreats(list); break;
      }
    };
    
    const currentList = getCurrentList();
    if (currentList.length > 1) {
      setList(currentList.filter(p => p.id !== id));
    }
  };

  const updateCompetitorSWOTPoint = (category: 'strength' | 'weakness' | 'opportunity' | 'threat', id: string, text: string) => {
    const updateList = (list: SWOTPoint[]) => list.map(p => p.id === id ? { ...p, text } : p);
    
    switch(category) {
      case 'strength': setCompetitorStrengths(updateList(competitorStrengths)); break;
      case 'weakness': setCompetitorWeaknesses(updateList(competitorWeaknesses)); break;
      case 'opportunity': setCompetitorOpportunities(updateList(competitorOpportunities)); break;
      case 'threat': setCompetitorThreats(updateList(competitorThreats)); break;
    }
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
        }

        void (async () => {
          try {
            const insights = await generateCMOInsights(
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
                role: 'CMO',
                messages: insights,
              },
            }));
          } catch (error) {
            console.error('Nova background generation failed', error);
            window.dispatchEvent(new CustomEvent('yieldx:copilot-insights-error', {
              detail: {
                role: 'CMO',
                error: language === 'ar'
                  ? 'فشل إنشاء رؤى السوق في الخلفية. حاول مرة أخرى.'
                  : 'Market insights generation failed in the background. Please try again.',
              },
            }));
          }
        })();
        
        // YieldX AI level feedback
        getLevelAiFeedback(7, moduleData['level7'] || {}, language as 'ar' | 'en')
          .then(fb => { setAiFeedback(fb); updateModuleData('level7', { aiFeedback: fb }); })
          .catch(() => {})
          .finally(() => setIsLoadingAi(false));
        setIsLoadingAi(true);

        setTimeout(() => setSaveStatus('idle'), 1500);
      }
    }, 500);
  };

  return (
    <div className={`min-h-screen p-6 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-pink-900 to-slate-900' 
        : 'bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100'
    }`}>
      <div className="max-w-6xl mx-auto">
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
                ? 'text-pink-200 hover:text-white hover:bg-pink-500/20' 
                : 'text-pink-700 hover:text-pink-900 hover:bg-pink-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isRTL ? 'العودة إلى الخريطة' : 'Back to Map'}
          </Button>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-pink-900'
              }`}>
                {isRTL ? 'المستوى 7: السوق والاستراتيجية' : 'Level 7: Market & Strategy'}
              </h1>
              <p className={isDark ? 'text-pink-200' : 'text-pink-700'}>
                {isRTL ? 'تحليل المنافسين وتحديد المنتجات وإجراء تحليل SWOT متطور' : 'Analyze competitors, define products, conduct advanced SWOT analysis'}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-sm mb-1 ${isDark ? 'text-pink-200' : 'text-pink-600'}`}>
                {isRTL ? 'التقدم' : 'Progress'}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-32 h-2 rounded-full overflow-hidden ${
                  isDark ? 'bg-slate-700' : 'bg-pink-200'
                }`}>
                  <motion.div
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-pink-900'}`}>
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Competitors Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`p-6 backdrop-blur-sm mb-6 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/80 border-pink-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-pink-900'
              }`}>
                <Target className={`w-5 h-5 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} />
                {isRTL ? 'تحليل المنافسين (حتى 3 منافسين)' : 'Competitor Analysis (Up to 3)'}
              </h2>
              {competitors.length < 3 && (
                <Button
                  onClick={addCompetitor}
                  size="sm"
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {isRTL ? 'إضافة منافس' : 'Add Competitor'}
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {competitors.map((competitor, index) => (
                <motion.div
                  key={competitor.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700/30 border-slate-600' 
                      : 'bg-pink-50/50 border-pink-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-bold ${isDark ? 'text-pink-300' : 'text-pink-700'}`}>
                      {isRTL ? `المنافس ${index + 1}` : `Competitor ${index + 1}`}
                    </h3>
                    {competitors.length > 1 && (
                      <Button
                        onClick={() => removeCompetitor(competitor.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-pink-200' : 'text-pink-700'
                      }`}>
                        {isRTL ? 'اسم المنافس' : 'Competitor Name'}
                      </label>
                      <input
                        type="text"
                        value={competitor.name}
                        onChange={(e) => updateCompetitor(competitor.id, 'name', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'مثال: شركة التميز للخدمات' : 'e.g., Excellence Services Co.'}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs mb-1 ${
                          isDark ? 'text-pink-200' : 'text-pink-700'
                        }`}>
                          {isRTL ? 'نقاط القوة' : 'Strengths'}
                        </label>
                        <textarea
                          value={competitor.strengths}
                          onChange={(e) => updateCompetitor(competitor.id, 'strengths', e.target.value)}
                          rows={3}
                          className={`w-full px-3 py-2 rounded text-sm border ${
                            isDark 
                              ? 'bg-slate-700 border-slate-600 text-white' 
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                          placeholder={isRTL ? 'علامة تجارية قوية، خبرة طويلة...' : 'Strong brand, long experience...'}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs mb-1 ${
                          isDark ? 'text-pink-200' : 'text-pink-700'
                        }`}>
                          {isRTL ? 'نقاط الضعف' : 'Weaknesses'}
                        </label>
                        <textarea
                          value={competitor.weaknesses}
                          onChange={(e) => updateCompetitor(competitor.id, 'weaknesses', e.target.value)}
                          rows={3}
                          className={`w-full px-3 py-2 rounded text-sm border ${
                            isDark 
                              ? 'bg-slate-700 border-slate-600 text-white' 
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                          placeholder={isRTL ? 'خدمة عملاء ضعيفة، أسعار مرتفعة...' : 'Poor customer service, high prices...'}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* ── COMPETITOR MAP ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
            isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-pink-200'
          }`}>
            <h2 className={`text-xl font-bold flex items-center gap-2 mb-5 ${
              isDark ? 'text-white' : 'text-pink-900'
            }`}>
              <span>🗺️</span>
              {isRTL ? 'خريطة المنافسين التفاعلية' : 'Interactive Competitor Map'}
            </h2>
            <CompetitorAnalysisMap
              location={moduleData['level1']?.location || 'مسقط'}
              sector={moduleData['level0']?.selectedSector || projectTypeData?.type || 'commercial'}
              businessIdea={moduleData['level1']?.projectIdea || ''}
              businessName={moduleData['level1']?.businessName || ''}
              language={language}
              isDark={isDark}
            />
          </div>
        </motion.div>

        {/* Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={`p-6 backdrop-blur-sm mb-6 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/80 border-pink-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-pink-900'
              }`}>
                <TrendingUp className={`w-5 h-5 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} />
                {isRTL ? 'المنتجات والخدمات' : 'Products & Services'}
              </h2>
              <Button
                onClick={addProduct}
                size="sm"
                className="bg-pink-500 hover:bg-pink-600"
              >
                <Plus className="w-4 h-4 mr-1" />
                {isRTL ? 'إضافة منتج' : 'Add Product'}
              </Button>
            </div>

            <div className="space-y-3">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700/30 border-slate-600' 
                      : 'bg-pink-50/50 border-pink-200'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="md:col-span-2">
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-pink-200' : 'text-pink-700'
                      }`}>
                        {isRTL ? 'اسم المنتج/الخدمة' : 'Product/Service Name'}
                      </label>
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'مثال: خدمة استشارية' : 'e.g., Consulting Service'}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-pink-200' : 'text-pink-700'
                      }`}>
                        {isRTL ? 'السعر (ر.ع)' : 'Price (OMR)'}
                      </label>
                      <input
                        type="number"
                        value={product.price}
                        onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder="100"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-pink-200' : 'text-pink-700'
                      }`}>
                        {isRTL ? 'الكمية/شهر' : 'Qty/Month'}
                      </label>
                      <input
                        type="number"
                        value={product.monthlyQuantity}
                        onChange={(e) => updateProduct(product.id, 'monthlyQuantity', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder="10"
                        min="0"
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className={`block text-xs mb-1 ${
                          isDark ? 'text-pink-200' : 'text-pink-700'
                        }`}>
                          {isRTL ? 'هامش الربح %' : 'Profit Margin %'}
                        </label>
                        <input
                          type="number"
                          value={product.profitMargin}
                          onChange={(e) => updateProduct(product.id, 'profitMargin', e.target.value)}
                          className={`w-full px-3 py-2 rounded text-sm border ${
                            isDark 
                              ? 'bg-slate-700 border-slate-600 text-white' 
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                          placeholder="30"
                          min="0"
                          max="100"
                        />
                      </div>
                      {products.length > 1 && (
                        <Button
                          onClick={() => removeProduct(product.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Calculated Monthly Revenue */}
                  <div className={`mt-2 pt-2 border-t text-xs ${
                    isDark ? 'border-slate-600 text-slate-400' : 'border-pink-200 text-pink-600'
                  }`}>
                    {isRTL ? 'الإيراد الشهري:' : 'Monthly Revenue:'} {((parseFloat(product.price) || 0) * (parseFloat(product.monthlyQuantity) || 0)).toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Total Monthly Revenue */}
            <div className={`mt-4 p-3 rounded-lg border ${
              isDark 
                ? 'bg-slate-700/50 border-slate-600' 
                : 'bg-pink-100 border-pink-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`font-medium ${isDark ? 'text-pink-200' : 'text-pink-800'}`}>
                  {isRTL ? 'إجمالي الإيراد الشهري المتوقع:' : 'Total Expected Monthly Revenue:'}
                </span>
                <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-pink-900'}`}>
                  {totalMonthlyRevenue.toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Enhanced SWOT Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className={`p-6 backdrop-blur-sm mb-6 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/80 border-pink-200'
          }`}>
            <div className="mb-4">
              <h2 className={`text-xl font-bold flex items-center gap-2 mb-2 ${
                isDark ? 'text-white' : 'text-pink-900'
              }`}>
                <Lightbulb className={`w-5 h-5 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} />
                {isRTL ? 'أولاً: تحليل SWOT لمشروعنا' : 'First: SWOT Analysis of Our Project'}
              </h2>
              <p className={`text-sm ${isDark ? 'text-pink-200/70' : 'text-pink-600'}`}>
                {isRTL ? 'اكتب أكبر عدد ممكن من النقاط تحت كل قسم (نقاط القوة، نقاط الضعف، الفرص، التهديدات)' : 'Write as many points as possible under each section (Strengths, Weaknesses, Opportunities, Threats)'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-green-50 border-green-300'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold flex items-center gap-2 ${
                    isDark ? 'text-green-400' : 'text-green-700'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                    {isRTL ? 'نقاط القوة' : 'Strengths'}
                  </h3>
                  <Button
                    onClick={() => addSWOTPoint('strength')}
                    size="sm"
                    variant="ghost"
                    className={isDark 
                      ? 'text-green-400 hover:bg-green-500/20' 
                      : 'text-green-600 hover:bg-green-200'
                    }
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {strengths.map((point, idx) => (
                    <div key={point.id} className="flex items-center gap-2">
                      <span className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={point.text}
                        onChange={(e) => updateSWOTPoint('strength', point.id, e.target.value)}
                        className={`flex-1 px-2 py-1 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700/50 border-slate-600 text-white' 
                            : 'bg-white border-green-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'أدخل نقطة قوة...' : 'Enter strength...'}
                      />
                      {strengths.length > 1 && (
                        <button
                          onClick={() => removeSWOTPoint('strength', point.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold flex items-center gap-2 ${
                    isDark ? 'text-red-400' : 'text-red-700'
                  }`}>
                    <AlertCircle className="w-4 h-4" />
                    {isRTL ? 'نقاط الضعف' : 'Weaknesses'}
                  </h3>
                  <Button
                    onClick={() => addSWOTPoint('weakness')}
                    size="sm"
                    variant="ghost"
                    className={isDark 
                      ? 'text-red-400 hover:bg-red-500/20' 
                      : 'text-red-600 hover:bg-red-200'
                    }
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {weaknesses.map((point, idx) => (
                    <div key={point.id} className="flex items-center gap-2">
                      <span className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={point.text}
                        onChange={(e) => updateSWOTPoint('weakness', point.id, e.target.value)}
                        className={`flex-1 px-2 py-1 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700/50 border-slate-600 text-white' 
                            : 'bg-white border-red-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'أدخل نقطة ضعف...' : 'Enter weakness...'}
                      />
                      {weaknesses.length > 1 && (
                        <button
                          onClick={() => removeSWOTPoint('weakness', point.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Opportunities */}
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-blue-500/10 border-blue-500/30' 
                  : 'bg-blue-50 border-blue-300'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold flex items-center gap-2 ${
                    isDark ? 'text-blue-400' : 'text-blue-700'
                  }`}>
                    <Sparkles className="w-4 h-4" />
                    {isRTL ? 'الفرص' : 'Opportunities'}
                  </h3>
                  <Button
                    onClick={() => addSWOTPoint('opportunity')}
                    size="sm"
                    variant="ghost"
                    className={isDark 
                      ? 'text-blue-400 hover:bg-blue-500/20' 
                      : 'text-blue-600 hover:bg-blue-200'
                    }
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {opportunities.map((point, idx) => (
                    <div key={point.id} className="flex items-center gap-2">
                      <span className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={point.text}
                        onChange={(e) => updateSWOTPoint('opportunity', point.id, e.target.value)}
                        className={`flex-1 px-2 py-1 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700/50 border-slate-600 text-white' 
                            : 'bg-white border-blue-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'أدخل فرصة...' : 'Enter opportunity...'}
                      />
                      {opportunities.length > 1 && (
                        <button
                          onClick={() => removeSWOTPoint('opportunity', point.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Threats */}
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-yellow-500/10 border-yellow-500/30' 
                  : 'bg-yellow-50 border-yellow-300'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold flex items-center gap-2 ${
                    isDark ? 'text-yellow-400' : 'text-yellow-700'
                  }`}>
                    <AlertCircle className="w-4 h-4" />
                    {isRTL ? 'التهديدات' : 'Threats'}
                  </h3>
                  <Button
                    onClick={() => addSWOTPoint('threat')}
                    size="sm"
                    variant="ghost"
                    className={isDark 
                      ? 'text-yellow-400 hover:bg-yellow-500/20' 
                      : 'text-yellow-600 hover:bg-yellow-200'
                    }
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {threats.map((point, idx) => (
                    <div key={point.id} className="flex items-center gap-2">
                      <span className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={point.text}
                        onChange={(e) => updateSWOTPoint('threat', point.id, e.target.value)}
                        className={`flex-1 px-2 py-1 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700/50 border-slate-600 text-white' 
                            : 'bg-white border-yellow-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'أدخل تهديد...' : 'Enter threat...'}
                      />
                      {threats.length > 1 && (
                        <button
                          onClick={() => removeSWOTPoint('threat', point.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* SWOT Analysis - Competitors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className={`p-6 backdrop-blur-sm mb-6 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/80 border-pink-200'
          }`}>
            <div className="mb-4">
              <h2 className={`text-xl font-bold flex items-center gap-2 mb-2 ${
                isDark ? 'text-white' : 'text-pink-900'
              }`}>
                <Target className={`w-5 h-5 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} />
                {isRTL ? 'ثانياً: تحليل SWOT للمنافسين' : 'Second: SWOT Analysis of Competitors'}
              </h2>
              <p className={`text-sm ${isDark ? 'text-pink-200/70' : 'text-pink-600'}`}>
                {isRTL ? 'اكتب أكبر عدد ممكن من النقاط تحت كل قسم (نقاط القوة، نقاط الضعف، الفرص، التهديدات)' : 'Write as many points as possible under each section (Strengths, Weaknesses, Opportunities, Threats)'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Competitor Strengths */}
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-green-50 border-green-300'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold flex items-center gap-2 ${
                    isDark ? 'text-green-400' : 'text-green-700'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                    {isRTL ? 'نقاط القوة' : 'Strengths'}
                  </h3>
                  <Button
                    onClick={() => addCompetitorSWOTPoint('strength')}
                    size="sm"
                    variant="ghost"
                    className={isDark 
                      ? 'text-green-400 hover:bg-green-500/20' 
                      : 'text-green-600 hover:bg-green-200'
                    }
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {competitorStrengths.map((point, idx) => (
                    <div key={point.id} className="flex items-center gap-2">
                      <span className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={point.text}
                        onChange={(e) => updateCompetitorSWOTPoint('strength', point.id, e.target.value)}
                        className={`flex-1 px-2 py-1 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700/50 border-slate-600 text-white' 
                            : 'bg-white border-green-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'أدخل نقطة قوة...' : 'Enter strength...'}
                      />
                      {competitorStrengths.length > 1 && (
                        <button
                          onClick={() => removeCompetitorSWOTPoint('strength', point.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Competitor Weaknesses */}
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold flex items-center gap-2 ${
                    isDark ? 'text-red-400' : 'text-red-700'
                  }`}>
                    <AlertCircle className="w-4 h-4" />
                    {isRTL ? 'نقاط الضعف' : 'Weaknesses'}
                  </h3>
                  <Button
                    onClick={() => addCompetitorSWOTPoint('weakness')}
                    size="sm"
                    variant="ghost"
                    className={isDark 
                      ? 'text-red-400 hover:bg-red-500/20' 
                      : 'text-red-600 hover:bg-red-200'
                    }
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {competitorWeaknesses.map((point, idx) => (
                    <div key={point.id} className="flex items-center gap-2">
                      <span className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={point.text}
                        onChange={(e) => updateCompetitorSWOTPoint('weakness', point.id, e.target.value)}
                        className={`flex-1 px-2 py-1 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700/50 border-slate-600 text-white' 
                            : 'bg-white border-red-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'أدخل نقطة ضعف...' : 'Enter weakness...'}
                      />
                      {competitorWeaknesses.length > 1 && (
                        <button
                          onClick={() => removeCompetitorSWOTPoint('weakness', point.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Competitor Opportunities */}
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-blue-500/10 border-blue-500/30' 
                  : 'bg-blue-50 border-blue-300'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold flex items-center gap-2 ${
                    isDark ? 'text-blue-400' : 'text-blue-700'
                  }`}>
                    <Sparkles className="w-4 h-4" />
                    {isRTL ? 'الفرص' : 'Opportunities'}
                  </h3>
                  <Button
                    onClick={() => addCompetitorSWOTPoint('opportunity')}
                    size="sm"
                    variant="ghost"
                    className={isDark 
                      ? 'text-blue-400 hover:bg-blue-500/20' 
                      : 'text-blue-600 hover:bg-blue-200'
                    }
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {competitorOpportunities.map((point, idx) => (
                    <div key={point.id} className="flex items-center gap-2">
                      <span className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={point.text}
                        onChange={(e) => updateCompetitorSWOTPoint('opportunity', point.id, e.target.value)}
                        className={`flex-1 px-2 py-1 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700/50 border-slate-600 text-white' 
                            : 'bg-white border-blue-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'أدخل فرصة...' : 'Enter opportunity...'}
                      />
                      {competitorOpportunities.length > 1 && (
                        <button
                          onClick={() => removeCompetitorSWOTPoint('opportunity', point.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Competitor Threats */}
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-yellow-500/10 border-yellow-500/30' 
                  : 'bg-yellow-50 border-yellow-300'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold flex items-center gap-2 ${
                    isDark ? 'text-yellow-400' : 'text-yellow-700'
                  }`}>
                    <AlertCircle className="w-4 h-4" />
                    {isRTL ? 'التهديدات' : 'Threats'}
                  </h3>
                  <Button
                    onClick={() => addCompetitorSWOTPoint('threat')}
                    size="sm"
                    variant="ghost"
                    className={isDark 
                      ? 'text-yellow-400 hover:bg-yellow-500/20' 
                      : 'text-yellow-600 hover:bg-yellow-200'
                    }
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {competitorThreats.map((point, idx) => (
                    <div key={point.id} className="flex items-center gap-2">
                      <span className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={point.text}
                        onChange={(e) => updateCompetitorSWOTPoint('threat', point.id, e.target.value)}
                        className={`flex-1 px-2 py-1 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700/50 border-slate-600 text-white' 
                            : 'bg-white border-yellow-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'أدخل تهديد...' : 'Enter threat...'}
                      />
                      {competitorThreats.length > 1 && (
                        <button
                          onClick={() => removeCompetitorSWOTPoint('threat', point.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
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
                : 'border-pink-300 text-pink-700 hover:bg-pink-100'
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
                : 'bg-pink-500 hover:bg-pink-600'
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