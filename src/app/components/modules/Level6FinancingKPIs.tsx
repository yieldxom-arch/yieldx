import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DollarSign, TrendingUp, Calculator, BarChart3, ArrowLeft, Save, AlertCircle, CheckCircle2, PieChart, Shield, Plus, Trash2 } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { generateCFOInsights } from '@/lib/copilot-ai';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { getLevelAiFeedback, type AiFeedback } from '@/lib/ai';
import { AiFeedbackCard } from '@/app/components/ai/AiFeedbackCard';

interface Insurance {
  id: string;
  type: string;
  coverage: string;
  annualCost: string;
}

export function Level6FinancingKPIs() {
  const { moduleData, updateModuleData, language, setCurrentView, levels, updateLevelProgress, updateFinancialKPIs, studyModeData, projectTypeData, enhancedSWOT, bmcData, oman2040, theme } = useYieldX();
  
  const isRTL = language === 'ar';
  const isDark = theme === 'dark';
  const savedData = moduleData['level6'];
  
  // Get data from previous levels
  const level2Data = moduleData['level2'];
  const level3Data = moduleData['level3'];
  const level4Data = moduleData['level4'];
  const level5Data = moduleData['level5'];

  // State
  const [equityAmount, setEquityAmount] = useState(savedData?.equityAmount || '');
  const [loanAmount, setLoanAmount] = useState(savedData?.loanAmount || '');
  const [interestRate, setInterestRate] = useState(savedData?.interestRate || '5');
  const [gracePeriodMonths, setGracePeriodMonths] = useState(savedData?.gracePeriodMonths || '6');
  const [loanTermYears, setLoanTermYears] = useState(savedData?.loanTermYears || '5');
  const [revenueGrowthRate, setRevenueGrowthRate] = useState(savedData?.revenueGrowthRate || '10');
  const [costGrowthRate, setCostGrowthRate] = useState(savedData?.costGrowthRate || '5');
  
  const [insurances, setInsurances] = useState<Insurance[]>(
    savedData?.insurances && savedData.insurances.length > 0
      ? savedData.insurances
      : [
          { id: '1', type: isRTL ? 'التأمين الصحي' : 'Health Insurance', coverage: '', annualCost: '' },
          { id: '2', type: isRTL ? 'تأمين الممتلكات' : 'Property Insurance', coverage: '', annualCost: '' }
        ]
  );
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [aiFeedback, setAiFeedback] = useState<AiFeedback | null>(moduleData['level6']?.aiFeedback || null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const currentLevel = levels.find(l => l.levelId === 6);
  const progressPercentage = currentLevel ? (currentLevel.xp / currentLevel.maxXp) * 100 : 0;

  // Determine projection years based on study mode
  const projectionYears = studyModeData?.mode === 'advanced' ? 10 : 5;

  // Calculate total investment
  const fixedAssetsCost = level3Data?.totalFixedAssetsCost || 0;
  const licenseCosts = level2Data?.licenses?.reduce((sum: number, l: any) => sum + (parseFloat(l.cost) || 0), 0) || 0;
  const workingCapital = ((level4Data?.totalMonthlySalaries || 0) + (level3Data?.totalMonthlyRawMaterialCost || 0)) * 3; // 3 months
  const preOperatingCosts = licenseCosts * 1.2; // 20% buffer for pre-operating
  
  const totalInvestment = fixedAssetsCost + workingCapital + preOperatingCosts;

  // Calculate financing
  const equity = parseFloat(equityAmount) || 0;
  const loan = parseFloat(loanAmount) || 0;
  const totalFinancing = equity + loan;
  const equityPercent = totalFinancing > 0 ? (equity / totalFinancing * 100) : 0;
  const loanPercent = totalFinancing > 0 ? (loan / totalFinancing * 100) : 0;

  // Calculate total insurance cost
  const totalAnnualInsurance = insurances.reduce((total, ins) => {
    return total + (parseFloat(ins.annualCost) || 0);
  }, 0);
  const monthlyInsurance = totalAnnualInsurance / 12;

  // Insurance helper functions
  const addInsurance = () => {
    const newInsurance: Insurance = {
      id: Date.now().toString(),
      type: '',
      coverage: '',
      annualCost: '',
    };
    setInsurances([...insurances, newInsurance]);
  };

  const removeInsurance = (id: string) => {
    if (insurances.length > 1) {
      setInsurances(insurances.filter(ins => ins.id !== id));
    }
  };

  const updateInsurance = (id: string, field: keyof Insurance, value: string) => {
    setInsurances(insurances.map(ins => ins.id === id ? { ...ins, [field]: value } : ins));
  };

  // Monthly calculations
  const monthlyRevenue = level5Data?.totalMonthlyRevenue || 0;
  const monthlySalaries = level4Data?.totalMonthlySalaries || 0;
  const monthlyRawMaterials = level3Data?.totalMonthlyRawMaterialCost || 0;
  // Calculate total monthly property cost from all lease contracts
  const monthlyPropertyCost = level2Data?.leaseContracts?.reduce((total: number, contract: any) => {
    return total + (parseFloat(contract.monthlyRent) || 0);
  }, 0) || 0;
  const monthlyOperatingCosts = monthlySalaries + monthlyRawMaterials + monthlyPropertyCost + monthlyInsurance + 200; // +200 for utilities

  // Annual calculations
  const annualRevenue = monthlyRevenue * 12;
  const annualOperatingCosts = monthlyOperatingCosts * 12;
  const annualDepreciation = level3Data?.totalAnnualDepreciation || 0;
  const annualInterest = loan * (parseFloat(interestRate) / 100);
  const annualProfit = annualRevenue - annualOperatingCosts - annualDepreciation - annualInterest;

  // Generate 5-10 year projections
  const generateProjections = () => {
    const projections = [];
    const revGrowth = parseFloat(revenueGrowthRate) / 100;
    const costGrowth = parseFloat(costGrowthRate) / 100;

    for (let year = 1; year <= projectionYears; year++) {
      const yearRevenue = annualRevenue * Math.pow(1 + revGrowth, year - 1);
      const yearCosts = annualOperatingCosts * Math.pow(1 + costGrowth, year - 1);
      const yearProfit = yearRevenue - yearCosts - annualDepreciation - annualInterest;
      
      projections.push({
        year,
        revenue: yearRevenue,
        costs: yearCosts,
        depreciation: annualDepreciation,
        interest: annualInterest,
        profit: yearProfit,
      });
    }
    
    return projections;
  };

  const projections = generateProjections();

  // Calculate Financial KPIs
  const calculateIRR = () => {
    // Simplified IRR calculation (approximation)
    const cashFlows = [-totalInvestment, ...projections.map(p => p.profit)];
    let irr = 0.1; // Start with 10% guess
    
    // Newton-Raphson method (simplified for 5 iterations)
    for (let i = 0; i < 5; i++) {
      let npv = 0;
      let derivative = 0;
      
      cashFlows.forEach((cf, t) => {
        npv += cf / Math.pow(1 + irr, t);
        derivative -= (t * cf) / Math.pow(1 + irr, t + 1);
      });
      
      irr = irr - npv / derivative;
    }
    
    return irr * 100; // Convert to percentage
  };

  const calculateNPV = (discountRate: number = 0.1) => {
    const cashFlows = [-totalInvestment, ...projections.map(p => p.profit)];
    return cashFlows.reduce((npv, cf, t) => npv + cf / Math.pow(1 + discountRate, t), 0);
  };

  const calculateROI = () => {
    const totalProfit = projections.reduce((sum, p) => sum + p.profit, 0);
    return totalInvestment > 0 ? (totalProfit / totalInvestment * 100) : 0;
  };

  const calculateROE = () => {
    const avgAnnualProfit = projections.reduce((sum, p) => sum + p.profit, 0) / projections.length;
    return equity > 0 ? (avgAnnualProfit / equity * 100) : 0;
  };

  const calculatePaybackPeriod = () => {
    let cumulativeCashFlow = -totalInvestment;
    
    for (let i = 0; i < projections.length; i++) {
      cumulativeCashFlow += projections[i].profit;
      if (cumulativeCashFlow >= 0) {
        return i + 1 - (cumulativeCashFlow - projections[i].profit) / projections[i].profit;
      }
    }
    
    return projections.length; // If not recovered within projection period
  };

  const calculateBreakEven = () => {
    // Break-even units per month
    const fixedCosts = monthlySalaries + monthlyPropertyCost + (annualDepreciation / 12);
    const avgProductPrice = level5Data?.products?.[0] ? parseFloat(level5Data.products[0].price) || 100 : 100;
    const avgProfitMargin = level5Data?.products?.[0] ? parseFloat(level5Data.products[0].profitMargin) / 100 || 0.3 : 0.3;
    const variableCostPerUnit = avgProductPrice * (1 - avgProfitMargin);
    
    return fixedCosts / (avgProductPrice - variableCostPerUnit);
  };

  const calculateCurrentRatio = () => {
    // Current Assets / Current Liabilities (simplified)
    const currentAssets = workingCapital;
    const currentLiabilities = monthlyOperatingCosts * 3; // 3 months of operating costs
    return currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
  };

  const calculateDebtToEquity = () => {
    return equity > 0 ? loan / equity : 0;
  };

  // Calculate all KPIs
  const irr = calculateIRR();
  const npv = calculateNPV();
  const roi = calculateROI();
  const roe = calculateROE();
  const paybackPeriod = calculatePaybackPeriod();
  const breakEvenUnits = calculateBreakEven();
  const currentRatio = calculateCurrentRatio();
  const debtToEquity = calculateDebtToEquity();

  // Save data automatically
  const saveCurrentData = () => {
    const data = {
      equityAmount,
      loanAmount,
      interestRate,
      gracePeriodMonths,
      loanTermYears,
      revenueGrowthRate,
      costGrowthRate,
      totalInvestment,
      projections,
      kpis: {
        irr,
        npv,
        roi,
        roe,
        paybackPeriod,
        breakEvenUnits,
        currentRatio,
        debtToEquity,
      },
      insurances,
    };
    updateModuleData('level6', data);
    
    // Update context KPIs
    updateFinancialKPIs({
      roi,
      irr,
      npv,
      paybackPeriod,
      breakEvenPoint: breakEvenUnits,
      roe,
      currentRatio,
      debtToEquity,
    });
  };

  useEffect(() => {
    saveCurrentData();
  }, [equityAmount, loanAmount, interestRate, gracePeriodMonths, loanTermYears, revenueGrowthRate, costGrowthRate, insurances]);

  // Validate form
  const validateForm = () => {
    const errors: string[] = [];
    
    if (!equityAmount || parseFloat(equityAmount) <= 0) {
      errors.push(isRTL ? 'رأس المال الخاص مطلوب' : 'Equity amount is required');
    }
    
    if (totalFinancing < totalInvestment * 0.9) {
      errors.push(isRTL ? 'إجمالي التمويل يجب أن يغطي على الأقل 90% من الاستثمار' : 'Total financing must cover at least 90% of investment');
    }
    
    if (paybackPeriod > projectionYears) {
      errors.push(isRTL ? `فترة الاسترداد تتجاوز ${projectionYears} سنوات - قد لا يكون المشروع مجدياً` : `Payback period exceeds ${projectionYears} years - project may not be viable`);
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
        
        if (currentLevel && currentLevel.xp < currentLevel.maxXp) {
          updateLevelProgress(6, currentLevel.maxXp, true);
        }

        void (async () => {
          try {
            const insights = await generateCFOInsights(
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
                role: 'CFO',
                messages: insights,
              },
            }));
          } catch (error) {
            console.error('Atlas background generation failed', error);
            window.dispatchEvent(new CustomEvent('yieldx:copilot-insights-error', {
              detail: {
                role: 'CFO',
                error: language === 'ar'
                  ? 'فشل إنشاء الرؤى المالية في الخلفية. حاول مرة أخرى.'
                  : 'Financial insights generation failed in the background. Please try again.',
              },
            }));
          }
        })();

        // YieldX AI level feedback (includes 3-year financial projection for Level 6)
        getLevelAiFeedback(6, moduleData['level6'] || {}, language as 'ar' | 'en')
          .then(fb => { setAiFeedback(fb); updateModuleData('level6', { aiFeedback: fb }); })
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
        ? 'bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900' 
        : 'bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100'
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
                ? 'text-cyan-200 hover:text-white hover:bg-cyan-500/20' 
                : 'text-cyan-700 hover:text-cyan-900 hover:bg-cyan-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isRTL ? 'العودة إلى الخريطة' : 'Back to Map'}
          </Button>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-cyan-900'
              }`}>
                {isRTL ? 'المستوى 6: التمويل والمؤشرات المالية' : 'Level 6: Financing & Financial KPIs'}
              </h1>
              <p className={isDark ? 'text-cyan-200' : 'text-cyan-700'}>
                {isRTL ? `إعداد الخطة المالية والمؤشرات (${projectionYears} سنوات)` : `Prepare financial plan and KPIs (${projectionYears} years)`}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-sm mb-1 ${isDark ? 'text-cyan-200' : 'text-cyan-600'}`}>
                {isRTL ? 'التقدم' : 'Progress'}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-32 h-2 rounded-full overflow-hidden ${
                  isDark ? 'bg-slate-700' : 'bg-cyan-200'
                }`}>
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-cyan-900'}`}>
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Investment Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`p-6 backdrop-blur-sm mb-6 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/80 border-cyan-200'
          }`}>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-cyan-900'
            }`}>
              <Calculator className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              {isRTL ? 'ملخص الاستثمار (محسوب من المستويات السابقة)' : 'Investment Summary (Calculated from Previous Levels)'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg ${
                isDark ? 'bg-slate-700/30' : 'bg-cyan-50'
              }`}>
                <div className={`text-sm mb-1 ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>
                  {isRTL ? 'الأصول الثابتة' : 'Fixed Assets'}
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-cyan-900'}`}>
                  {fixedAssetsCost.toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                </div>
              </div>

              <div className={`p-3 rounded-lg ${
                isDark ? 'bg-slate-700/30' : 'bg-cyan-50'
              }`}>
                <div className={`text-sm mb-1 ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>
                  {isRTL ? 'رأس المال العامل (3 أشهر)' : 'Working Capital (3 months)'}
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-cyan-900'}`}>
                  {workingCapital.toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                </div>
              </div>

              <div className={`p-3 rounded-lg ${
                isDark ? 'bg-slate-700/30' : 'bg-cyan-50'
              }`}>
                <div className={`text-sm mb-1 ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>
                  {isRTL ? 'تكاليف ما قبل التشغيل' : 'Pre-Operating Costs'}
                </div>
                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-cyan-900'}`}>
                  {preOperatingCosts.toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                </div>
              </div>

              <div className={`p-3 rounded-lg border-2 ${
                isDark 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50' 
                  : 'bg-gradient-to-r from-cyan-100 to-blue-100 border-cyan-400'
              }`}>
                <div className={`text-sm mb-1 ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>
                  {isRTL ? 'إجمالي الاستثمار المطلوب' : 'Total Investment Required'}
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-cyan-900'}`}>
                  {totalInvestment.toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Financing Structure */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={`p-6 backdrop-blur-sm mb-6 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/80 border-cyan-200'
          }`}>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-cyan-900'
            }`}>
              <PieChart className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              {isRTL ? 'هيكل التمويل' : 'Financing Structure'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-cyan-200' : 'text-cyan-700'
                }`}>
                  {isRTL ? 'رأس المال الخاص (ر.ع)' : 'Equity Capital (OMR)'}
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  type="number"
                  value={equityAmount}
                  onChange={(e) => setEquityAmount(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700/50 border-slate-600 text-white' 
                      : 'bg-white border-cyan-300 text-slate-900'
                  }`}
                  placeholder="50000"
                  min="0"
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`}>
                  {equityPercent.toFixed(1)}% {isRTL ? 'من التمويل' : 'of financing'}
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-cyan-200' : 'text-cyan-700'
                }`}>
                  {isRTL ? 'القرض المطلوب (ر.ع)' : 'Loan Amount (OMR)'}
                </label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700/50 border-slate-600 text-white' 
                      : 'bg-white border-cyan-300 text-slate-900'
                  }`}
                  placeholder="30000"
                  min="0"
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`}>
                  {loanPercent.toFixed(1)}% {isRTL ? 'من التمويل' : 'of financing'}
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-cyan-200' : 'text-cyan-700'
                }`}>
                  {isRTL ? 'سعر الفائدة السنوي (%)' : 'Annual Interest Rate (%)'}
                </label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700/50 border-slate-600 text-white' 
                      : 'bg-white border-cyan-300 text-slate-900'
                  }`}
                  placeholder="5"
                  min="0"
                  max="20"
                  step="0.1"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-cyan-200' : 'text-cyan-700'
                }`}>
                  {isRTL ? 'فترة السداد (سنوات)' : 'Loan Term (Years)'}
                </label>
                <input
                  type="number"
                  value={loanTermYears}
                  onChange={(e) => setLoanTermYears(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700/50 border-slate-600 text-white' 
                      : 'bg-white border-cyan-300 text-slate-900'
                  }`}
                  placeholder="5"
                  min="1"
                  max="15"
                />
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              isDark 
                ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30' 
                : 'bg-gradient-to-r from-cyan-100 to-blue-100 border-cyan-400'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={isDark ? 'text-cyan-200' : 'text-cyan-700'}>
                  {isRTL ? 'إجمالي التمويل:' : 'Total Financing:'}
                </span>
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-cyan-900'}`}>
                  {totalFinancing.toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={isDark ? 'text-cyan-300' : 'text-cyan-600'}>
                  {isRTL ? 'الفرق عن الاستثمار المطلوب:' : 'Difference from required:'}
                </span>
                <span className={`font-bold ${totalFinancing >= totalInvestment ? 'text-green-400' : 'text-red-400'}`}>
                  {(totalFinancing - totalInvestment).toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Insurance - Operational Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className={`p-6 backdrop-blur-sm mb-6 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/80 border-cyan-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-cyan-900'
              }`}>
                <Shield className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                {isRTL ? 'التأمينات (المصروفات التشغيلية)' : 'Insurance (Operational Expenses)'}
              </h2>
              <Button
                onClick={addInsurance}
                size="sm"
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                <Plus className="w-4 h-4 mr-1" />
                {isRTL ? 'إضافة تأمين' : 'Add Insurance'}
              </Button>
            </div>

            <div className="space-y-3">
              {insurances.map((insurance, index) => (
                <motion.div
                  key={insurance.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700/30 border-slate-600' 
                      : 'bg-cyan-50/50 border-cyan-200'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Insurance Type */}
                    <div className="md:col-span-2">
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-cyan-200' : 'text-cyan-700'
                      }`}>
                        {isRTL ? 'نوع التأمين' : 'Insurance Type'}
                      </label>
                      <input
                        type="text"
                        value={insurance.type}
                        onChange={(e) => updateInsurance(insurance.id, 'type', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'مثال: التأمين الصحي' : 'e.g., Health Insurance'}
                      />
                    </div>

                    {/* Coverage */}
                    <div>
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-cyan-200' : 'text-cyan-700'
                      }`}>
                        {isRTL ? 'التغطية' : 'Coverage'}
                      </label>
                      <input
                        type="text"
                        value={insurance.coverage}
                        onChange={(e) => updateInsurance(insurance.id, 'coverage', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'شامل/جزئي' : 'Comprehensive/Basic'}
                      />
                    </div>

                    {/* Annual Cost & Delete */}
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className={`block text-xs mb-1 ${
                          isDark ? 'text-cyan-200' : 'text-cyan-700'
                        }`}>
                          {isRTL ? 'التكلفة السنوية (ر.ع)' : 'Annual Cost (OMR)'}
                        </label>
                        <input
                          type="number"
                          value={insurance.annualCost}
                          onChange={(e) => updateInsurance(insurance.id, 'annualCost', e.target.value)}
                          className={`w-full px-3 py-2 rounded text-sm border ${
                            isDark 
                              ? 'bg-slate-700 border-slate-600 text-white' 
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                          placeholder="1200"
                          min="0"
                        />
                      </div>
                      {insurances.length > 1 && (
                        <Button
                          onClick={() => removeInsurance(insurance.id)}
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

            {/* Total Insurance Cost */}
            <div className={`mt-4 p-4 rounded-lg border ${
              isDark 
                ? 'bg-slate-700/50 border-slate-600' 
                : 'bg-cyan-50 border-cyan-200'
            }`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className={`text-xs mb-1 ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>
                    {isRTL ? 'إجمالي التأمين السنوي:' : 'Total Annual Insurance:'}
                  </div>
                  <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-cyan-900'}`}>
                    {totalAnnualInsurance.toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                  </div>
                </div>
                <div>
                  <div className={`text-xs mb-1 ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>
                    {isRTL ? 'التأمين الشهري:' : 'Monthly Insurance:'}
                  </div>
                  <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-cyan-900'}`}>
                    {monthlyInsurance.toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                  </div>
                </div>
              </div>
              <div className={`mt-2 text-xs ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`}>
                {isRTL 
                  ? '💡 يتم إضافة تكاليف التأمين تلقائياً إلى المصروفات التشغيلية الشهرية' 
                  : '💡 Insurance costs are automatically added to monthly operational expenses'
                }
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Growth Assumptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className={`p-6 backdrop-blur-sm mb-6 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/80 border-cyan-200'
          }`}>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-cyan-900'
            }`}>
              <TrendingUp className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              {isRTL ? 'افتراضات النمو' : 'Growth Assumptions'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-cyan-200' : 'text-cyan-700'
                }`}>
                  {isRTL ? 'معدل نمو الإيرادات السنوي (%)' : 'Annual Revenue Growth Rate (%)'}
                </label>
                <input
                  type="number"
                  value={revenueGrowthRate}
                  onChange={(e) => setRevenueGrowthRate(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700/50 border-slate-600 text-white' 
                      : 'bg-white border-cyan-300 text-slate-900'
                  }`}
                  placeholder="10"
                  min="0"
                  max="50"
                  step="1"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-cyan-200' : 'text-cyan-700'
                }`}>
                  {isRTL ? 'معدل نمو التكاليف السنوي (%)' : 'Annual Cost Growth Rate (%)'}
                </label>
                <input
                  type="number"
                  value={costGrowthRate}
                  onChange={(e) => setCostGrowthRate(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700/50 border-slate-600 text-white' 
                      : 'bg-white border-cyan-300 text-slate-900'
                  }`}
                  placeholder="5"
                  min="0"
                  max="30"
                  step="1"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Income Statement Projections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className={`p-6 backdrop-blur-sm mb-6 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/80 border-cyan-200'
          }`}>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-cyan-900'
            }`}>
              <BarChart3 className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              {isRTL ? `قائمة الدخل (${projectionYears} سنوات)` : `Income Statement (${projectionYears} Years)`}
            </h2>

            {/* Auto-calculation info banner */}
            <div className={`mb-4 p-3 rounded-lg border ${
              isDark 
                ? 'bg-blue-500/10 border-blue-500/30' 
                : 'bg-blue-50 border-blue-300'
            }`}>
              <div className="flex items-start gap-2">
                <Calculator className={`w-4 h-4 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <div className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                  {isRTL ? (
                    <>
                      <span className="font-bold">تُحسب تلقائياً:</span> القيم أدناه محسوبة تلقائياً بناءً على:
                      <br />
                      • المستوى 2 (تكاليف الموقع) • المستوى 3 (الإنتاج والإهلاك) • المستوى 4 (الرواتب) • المستوى 5 (الإيرادات)
                      <br />
                      معدلات النمو: إيرادات {revenueGrowthRate}% | تكاليف {costGrowthRate}%
                    </>
                  ) : (
                    <>
                      <span className="font-bold">Auto-calculated:</span> Values below are automatically calculated from:
                      <br />
                      • Level 2 (Property Costs) • Level 3 (Production & Depreciation) • Level 4 (Salaries) • Level 5 (Revenue)
                      <br />
                      Growth rates: Revenue {revenueGrowthRate}% | Costs {costGrowthRate}%
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-slate-600' : 'border-cyan-200'}`}>
                    <th className={`text-left p-2 ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>
                      {isRTL ? 'السنة' : 'Year'}
                    </th>
                    <th className={`text-right p-2 ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>
                      {isRTL ? 'الإيرادات' : 'Revenue'}
                    </th>
                    <th className={`text-right p-2 ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>
                      {isRTL ? 'التكاليف' : 'Costs'}
                    </th>
                    <th className={`text-right p-2 ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>
                      {isRTL ? 'الإهلاك' : 'Deprec.'}
                    </th>
                    <th className={`text-right p-2 ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>
                      {isRTL ? 'الفوائد' : 'Interest'}
                    </th>
                    <th className={`text-right p-2 font-bold ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>
                      {isRTL ? 'الربح' : 'Profit'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projections.map((proj) => (
                    <tr key={proj.year} className={`border-b ${
                      isDark ? 'border-slate-700' : 'border-cyan-100'
                    }`}>
                      <td className={`p-2 ${isDark ? 'text-white' : 'text-cyan-900'}`}>
                        {proj.year}
                      </td>
                      <td className="p-2 text-right text-green-400">{proj.revenue.toFixed(0)}</td>
                      <td className="p-2 text-right text-red-400">{proj.costs.toFixed(0)}</td>
                      <td className="p-2 text-right text-orange-400">{proj.depreciation.toFixed(0)}</td>
                      <td className="p-2 text-right text-yellow-400">{proj.interest.toFixed(0)}</td>
                      <td className={`p-2 text-right font-bold ${proj.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {proj.profit.toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Financial KPIs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className={`p-6 backdrop-blur-sm mb-6 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/80 border-cyan-200'
          }`}>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-cyan-900'
            }`}>
              <DollarSign className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              {isRTL ? 'المؤشرات المالية الرئيسية' : 'Key Financial Indicators'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* IRR */}
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30' 
                  : 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-400'
              }`}>
                <div className={`text-xs mb-1 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                  {isRTL ? 'معدل العائد الداخلي' : 'Internal Rate of Return'}
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-green-900'}`}>
                  {irr.toFixed(2)}%
                </div>
                <div className={`text-xs mt-1 ${isDark ? 'text-green-200' : 'text-green-600'}`}>IRR</div>
              </div>

              {/* NPV */}
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30' 
                  : 'bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-400'
              }`}>
                <div className={`text-xs mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                  {isRTL ? 'صافي القيمة الحالية' : 'Net Present Value'}
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>
                  {npv.toFixed(0)} {isRTL ? 'ر.ع' : 'OMR'}
                </div>
                <div className={`text-xs mt-1 ${isDark ? 'text-blue-200' : 'text-blue-600'}`}>NPV @ 10%</div>
              </div>

              {/* ROI */}
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30' 
                  : 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-400'
              }`}>
                <div className={`text-xs mb-1 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                  {isRTL ? 'العائد على الاستثمار' : 'Return on Investment'}
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-purple-900'}`}>
                  {roi.toFixed(2)}%
                </div>
                <div className={`text-xs mt-1 ${isDark ? 'text-purple-200' : 'text-purple-600'}`}>ROI</div>
              </div>

              {/* Payback Period */}
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30' 
                  : 'bg-gradient-to-br from-orange-100 to-red-100 border-orange-400'
              }`}>
                <div className={`text-xs mb-1 ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                  {isRTL ? 'فترة الاسترداد' : 'Payback Period'}
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-orange-900'}`}>
                  {paybackPeriod.toFixed(1)} {isRTL ? 'سنوات' : 'years'}
                </div>
                <div className={`text-xs mt-1 ${isDark ? 'text-orange-200' : 'text-orange-600'}`}>
                  {isRTL ? 'سنوات' : 'Years'}
                </div>
              </div>

              {/* Break-even */}
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-500/30' 
                  : 'bg-gradient-to-br from-yellow-100 to-amber-100 border-yellow-400'
              }`}>
                <div className={`text-xs mb-1 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  {isRTL ? 'نقطة التعادل' : 'Break-even Point'}
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-yellow-900'}`}>
                  {breakEvenUnits.toFixed(0)}
                </div>
                <div className={`text-xs mt-1 ${isDark ? 'text-yellow-200' : 'text-yellow-600'}`}>
                  {isRTL ? 'وحدة/شهر' : 'units/month'}
                </div>
              </div>

              {/* ROE */}
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border-teal-500/30' 
                  : 'bg-gradient-to-br from-teal-100 to-cyan-100 border-teal-400'
              }`}>
                <div className={`text-xs mb-1 ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                  {isRTL ? 'العائد على حقوق الملكية' : 'Return on Equity'}
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-teal-900'}`}>
                  {roe.toFixed(2)}%
                </div>
                <div className={`text-xs mt-1 ${isDark ? 'text-teal-200' : 'text-teal-600'}`}>ROE</div>
              </div>

              {/* Current Ratio */}
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/30' 
                  : 'bg-gradient-to-br from-indigo-100 to-purple-100 border-indigo-400'
              }`}>
                <div className={`text-xs mb-1 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  {isRTL ? 'نسبة السيولة' : 'Current Ratio'}
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-indigo-900'}`}>
                  {currentRatio.toFixed(2)}
                </div>
                <div className={`text-xs mt-1 ${isDark ? 'text-indigo-200' : 'text-indigo-600'}`}>
                  {isRTL ? 'السيولة' : 'Liquidity'}
                </div>
              </div>

              {/* Debt to Equity */}
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-gradient-to-br from-rose-500/20 to-pink-500/20 border-rose-500/30' 
                  : 'bg-gradient-to-br from-rose-100 to-pink-100 border-rose-400'
              }`}>
                <div className={`text-xs mb-1 ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>
                  {isRTL ? 'نسبة الدين إلى حقوق الملكية' : 'Debt-to-Equity Ratio'}
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-rose-900'}`}>
                  {debtToEquity.toFixed(2)}
                </div>
                <div className={`text-xs mt-1 ${isDark ? 'text-rose-200' : 'text-rose-600'}`}>D/E</div>
              </div>
            </div>

            {/* Feasibility Assessment */}
            <div className={`mt-6 p-4 rounded-lg border-2 ${
              isDark 
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50' 
                : 'bg-gradient-to-r from-cyan-100 to-blue-100 border-cyan-400'
            }`}>
              <div className="flex items-center gap-3">
                {irr > 15 && npv > 0 && paybackPeriod < projectionYears ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                    <div>
                      <div className="text-lg font-bold text-green-400">
                        {isRTL ? '✅ المشروع مجدي مالياً' : '✅ Project is Financially Viable'}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>
                        {isRTL ? 'المؤشرات المالية إيجابية وتشير إلى جدوى المشروع' : 'Financial indicators are positive and indicate project viability'}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-8 h-8 text-yellow-400" />
                    <div>
                      <div className="text-lg font-bold text-yellow-400">
                        {isRTL ? '⚠️ يحتاج المشروع إلى مراجعة' : '⚠️ Project Needs Review'}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>
                        {isRTL ? 'بعض المؤشرات المالية تحتاج إلى تحسين' : 'Some financial indicators need improvement'}
                      </div>
                    </div>
                  </>
                )}
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
          transition={{ delay: 0.6 }}
          className="flex justify-end gap-4"
        >
          <Button
            onClick={() => setCurrentView('space-map')}
            variant="outline"
            className={`${
              isDark 
                ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                : 'border-cyan-300 text-cyan-700 hover:bg-cyan-100'
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
                : 'bg-cyan-500 hover:bg-cyan-600'
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

        {/* AI Feedback with 3-Year Financial Projection */}
        <div className="mt-8">
          <AiFeedbackCard feedback={aiFeedback} isLoading={isLoadingAi} language={language as 'ar' | 'en'} />
        </div>
      </div>
    </div>
  );
}