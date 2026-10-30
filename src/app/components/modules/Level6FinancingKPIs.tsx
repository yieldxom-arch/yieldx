import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DollarSign, TrendingUp, Calculator, BarChart3, ArrowLeft, Save, AlertCircle, CheckCircle2, PieChart, Shield, Plus, Trash2 } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { generateCFOInsights } from '@/lib/copilot-ai';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { getLevelAiFeedback, type AiFeedback } from '@/lib/ai';
import { AiFeedbackCard } from '@/app/components/ai/AiFeedbackCard';
import { ScenarioRiskPanel } from '@/app/components/scenario/ScenarioRiskPanel';
import type { BaseProjection } from '@/lib/scenario';

interface Insurance {
  id: string;
  type: string;
  coverage: string;
  annualCost: string;
}

export function Level6FinancingKPIs() {
  const { moduleData, updateModuleData, language, setCurrentView, levels, updateLevelProgress, updateFinancialKPIs, financialKPIs, studyModeData, projectTypeData, enhancedSWOT, bmcData, oman2040, theme } = useYieldX();
  
  const isRTL = language === 'ar';
  const isDark = theme === 'dark';
  const savedData = moduleData['level6'];
  
  // Get data from the other levels. Keys follow the journey routing:
  // level2 = Legal (licences, leases), level3 = Operational (rent, utilities),
  // level4 = Physical resources (assets, raw materials), level5 = Human resources,
  // level7 = Market & Strategy (products, revenue).
  const legalData = moduleData['level2'];
  const operationsData = moduleData['level3'];
  const physicalData = moduleData['level4'];
  const hrData = moduleData['level5'];
  const marketData = moduleData['level7'];
  const num = (v: any) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  // State
  const [equityAmount, setEquityAmount] = useState(savedData?.equityAmount || '');
  const [loanAmount, setLoanAmount] = useState(savedData?.loanAmount || '');
  const [interestRate, setInterestRate] = useState(savedData?.interestRate || '5');
  const [gracePeriodMonths, setGracePeriodMonths] = useState(savedData?.gracePeriodMonths || '6');
  const [loanTermYears, setLoanTermYears] = useState(savedData?.loanTermYears || '5');
  const [revenueGrowthRate, setRevenueGrowthRate] = useState(savedData?.revenueGrowthRate || '10');
  const [costGrowthRate, setCostGrowthRate] = useState(savedData?.costGrowthRate || '5');
  // Used only when Market & Strategy (Level 7) has no products yet.
  const [manualMonthlyRevenue, setManualMonthlyRevenue] = useState(savedData?.manualMonthlyRevenue || '');
  
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
  const fixedAssetsCost = num(physicalData?.totalFixedAssetsCost);
  const legalLicenseCosts = (legalData?.licenses || []).reduce((sum: number, l: any) => sum + num(l.cost), 0);
  // Licence costs come from Level 2; fall back to the Operational estimate if Level 2 has none.
  const licenseCosts = legalLicenseCosts > 0 ? legalLicenseCosts : num(operationsData?.licensesCost);
  // Staff cost includes social insurance, expat health insurance and training (Level 5 total).
  const monthlySalaries = hrData?.totalAnnualHRCost ? num(hrData.totalAnnualHRCost) / 12 : num(hrData?.totalMonthlySalaries);
  // Raw materials from Level 4; fall back to the Operational estimate.
  const monthlyRawMaterials = num(physicalData?.totalMonthlyRawMaterialCost) > 0
    ? num(physicalData?.totalMonthlyRawMaterialCost)
    : num(operationsData?.rawMaterialsCost);
  const workingCapital = (monthlySalaries + monthlyRawMaterials) * 3; // 3 months
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
  const marketMonthlyRevenue = num(marketData?.totalMonthlyRevenue);
  const revenueFromMarket = marketMonthlyRevenue > 0;
  const monthlyRevenue = revenueFromMarket ? marketMonthlyRevenue : num(manualMonthlyRevenue);
  // Rent: rented premises from Level 2 lease contracts; fall back to the Operational rent.
  const leaseRent = (legalData?.leaseContracts || []).reduce((total: number, contract: any) => {
    return contract?.leaseOrOwn === 'own' ? total : total + num(contract?.monthlyRent);
  }, 0);
  const monthlyPropertyCost = leaseRent > 0 ? leaseRent : num(operationsData?.rentCost);
  // Utilities from Level 3; 200 OMR/month only as a default estimate if not entered.
  const monthlyUtilities = num(operationsData?.utilities) > 0 ? num(operationsData?.utilities) : 200;
  const monthlyOperatingCosts = monthlySalaries + monthlyRawMaterials + monthlyPropertyCost + monthlyInsurance + monthlyUtilities;

  // Annual calculations
  const annualRevenue = monthlyRevenue * 12;
  const annualOperatingCosts = monthlyOperatingCosts * 12;
  const annualDepreciation = num(physicalData?.totalAnnualDepreciation);
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
  // Cash flow = profit + depreciation: depreciation is a non-cash expense, and the
  // investment is already counted once at year 0, so it must not be deducted twice.
  const projectCashFlows = [-totalInvestment, ...projections.map(p => p.profit + p.depreciation)];

  const npvAt = (rate: number) =>
    projectCashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0);

  const calculateIRR = () => {
    // Bisection on NPV(rate) = 0 between -99% and +1000%: always converges when a root exists.
    let lo = -0.99;
    let hi = 10;
    let fLo = npvAt(lo);
    const fHi = npvAt(hi);
    if (!Number.isFinite(fLo) || !Number.isFinite(fHi) || fLo * fHi > 0) return 0; // no IRR in range
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2;
      const fMid = npvAt(mid);
      if (Math.abs(fMid) < 1e-6) return mid * 100;
      if (fLo * fMid < 0) {
        hi = mid;
      } else {
        lo = mid;
        fLo = fMid;
      }
    }
    return ((lo + hi) / 2) * 100; // Convert to percentage
  };

  const calculateNPV = (discountRate: number = 0.1) => npvAt(discountRate);

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
      const yearCash = projections[i].profit + projections[i].depreciation;
      cumulativeCashFlow += yearCash;
      if (cumulativeCashFlow >= 0 && yearCash > 0) {
        return i + 1 - cumulativeCashFlow / yearCash;
      }
    }

    return projections.length; // If not recovered within projection period
  };

  const calculateBreakEven = () => {
    // Break-even sales (units per month), using the sales mix from Market & Strategy.
    const fixedCosts = monthlySalaries + monthlyPropertyCost + monthlyInsurance + monthlyUtilities + (annualDepreciation / 12) + (annualInterest / 12);
    const products: any[] = (marketData?.products || []).filter((p: any) => num(p.price) > 0);
    if (products.length === 0) return 0;
    const totalQty = products.reduce((s: number, p: any) => s + num(p.monthlyQuantity), 0);
    // Weighted average contribution per unit (price × margin), weighted by planned monthly quantity.
    const contributionPerUnit = products.reduce((s: number, p: any) => {
      const weight = totalQty > 0 ? num(p.monthlyQuantity) / totalQty : 1 / products.length;
      const margin = (num(p.profitMargin) || 30) / 100;
      return s + num(p.price) * margin * weight;
    }, 0);
    return contributionPerUnit > 0 ? fixedCosts / contributionPerUnit : 0;
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

  // Inputs for the Monte Carlo risk simulation, taken from the same figures as the table above.
  const scenarioBase: BaseProjection | null = annualRevenue > 0
    ? (() => {
        const revGrowth = (parseFloat(revenueGrowthRate) || 0) / 100;
        const costGrowth = (parseFloat(costGrowthRate) || 0) / 100;
        const years = Array.from({ length: projectionYears }, (_, y) => y);
        const fixedMonthly = monthlySalaries + monthlyPropertyCost + monthlyInsurance + monthlyUtilities;
        return {
          initialInvestment: totalInvestment,
          revenue: years.map(y => annualRevenue * Math.pow(1 + revGrowth, y)),
          costs: [
            { label: 'Raw materials', type: 'variable' as const, yearly: years.map(y => monthlyRawMaterials * 12 * Math.pow(1 + costGrowth, y)) },
            { label: 'Salaries, rent, insurance, utilities', type: 'fixed' as const, yearly: years.map(y => fixedMonthly * 12 * Math.pow(1 + costGrowth, y)) },
            { label: 'Loan interest', type: 'fixed' as const, yearly: years.map(() => annualInterest) },
          ],
        };
      })()
    : null;

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
      manualMonthlyRevenue,
      monthlyRevenue,
      revenueSource: revenueFromMarket ? 'market' : 'manual',
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
  }, [equityAmount, loanAmount, interestRate, gracePeriodMonths, loanTermYears, revenueGrowthRate, costGrowthRate, insurances, manualMonthlyRevenue, marketMonthlyRevenue]);

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

            {/* Where the monthly figures come from (traceable inputs) */}
            {revenueFromMarket ? (
              <div className={`mb-4 p-3 rounded-lg border text-sm ${isDark ? 'bg-green-500/10 border-green-500/30 text-green-200' : 'bg-green-50 border-green-300 text-green-800'}`}>
                {isRTL
                  ? `الإيرادات الشهرية مأخوذة من مستوى السوق والاستراتيجية (المنتجات): ${Math.round(marketMonthlyRevenue).toLocaleString('en-US')} ر.ع`
                  : `Monthly revenue comes from Market & Strategy (your products): ${Math.round(marketMonthlyRevenue).toLocaleString('en-US')} OMR`}
              </div>
            ) : (
              <div className={`mb-4 p-4 rounded-lg border ${isDark ? 'bg-amber-500/10 border-amber-500/40' : 'bg-amber-50 border-amber-300'}`}>
                <div className={`text-sm mb-3 ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                  {isRTL
                    ? 'لا توجد منتجات في مستوى السوق والاستراتيجية بعد. أدخل الإيرادات الشهرية المتوقعة هنا، أو أكمل ذلك المستوى ليتم حسابها من منتجاتك وأسعارك.'
                    : 'No products in Market & Strategy yet. Enter your expected monthly revenue here, or complete that level so it is calculated from your products and prices.'}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                  <div className="flex-1">
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-amber-100' : 'text-amber-900'}`}>
                      {isRTL ? 'الإيرادات الشهرية المتوقعة (ر.ع)' : 'Expected monthly revenue (OMR)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={manualMonthlyRevenue}
                      onChange={(e) => setManualMonthlyRevenue(e.target.value)}
                      placeholder="3000"
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700/50 border-slate-600 text-white' : 'bg-white border-amber-300 text-slate-900'}`}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentView('module-7')}
                    className={isDark ? 'border-amber-400/50 text-amber-200 hover:bg-amber-500/20' : 'border-amber-400 text-amber-800 hover:bg-amber-100'}
                  >
                    {isRTL ? 'الذهاب إلى السوق والاستراتيجية' : 'Go to Market & Strategy'}
                  </Button>
                </div>
              </div>
            )}

            <div className={`mb-5 overflow-x-auto rounded-lg border ${isDark ? 'border-slate-700' : 'border-cyan-200'}`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className={isDark ? 'bg-slate-900/40 text-slate-300' : 'bg-cyan-50 text-cyan-800'}>
                    <th className="px-3 py-2 text-start font-medium">{isRTL ? 'التكلفة الشهرية' : 'Monthly cost'}</th>
                    <th className="px-3 py-2 text-end font-medium">{isRTL ? 'ر.ع' : 'OMR'}</th>
                    <th className="px-3 py-2 text-start font-medium">{isRTL ? 'المصدر' : 'Source'}</th>
                  </tr>
                </thead>
                <tbody className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                  {[
                    { label: isRTL ? 'الموظفون (رواتب وتأمينات وتدريب)' : 'Staff (salaries, insurance, training)', value: monthlySalaries, source: isRTL ? 'المستوى 5' : 'Level 5' },
                    { label: isRTL ? 'الإيجار' : 'Rent', value: monthlyPropertyCost, source: leaseRent > 0 ? (isRTL ? 'المستوى 2' : 'Level 2') : (isRTL ? 'المستوى 3' : 'Level 3') },
                    { label: isRTL ? 'المواد الخام' : 'Raw materials', value: monthlyRawMaterials, source: num(physicalData?.totalMonthlyRawMaterialCost) > 0 ? (isRTL ? 'المستوى 4' : 'Level 4') : (isRTL ? 'المستوى 3' : 'Level 3') },
                    { label: isRTL ? 'المرافق' : 'Utilities', value: monthlyUtilities, source: num(operationsData?.utilities) > 0 ? (isRTL ? 'المستوى 3' : 'Level 3') : (isRTL ? 'تقدير افتراضي' : 'Default estimate') },
                    { label: isRTL ? 'التأمين' : 'Insurance', value: monthlyInsurance, source: isRTL ? 'هذا المستوى' : 'This level' },
                  ].map((row) => (
                    <tr key={row.label} className={`border-t ${isDark ? 'border-slate-700' : 'border-cyan-100'}`}>
                      <td className="px-3 py-1.5">{row.label}</td>
                      <td className="px-3 py-1.5 text-end tabular-nums">{Math.round(row.value).toLocaleString('en-US')}</td>
                      <td className={`px-3 py-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{row.source}</td>
                    </tr>
                  ))}
                  <tr className={`border-t font-semibold ${isDark ? 'border-slate-600' : 'border-cyan-200'}`}>
                    <td className="px-3 py-1.5">{isRTL ? 'الإجمالي' : 'Total'}</td>
                    <td className="px-3 py-1.5 text-end tabular-nums">{Math.round(monthlyOperatingCosts).toLocaleString('en-US')}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>

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
                      • المستوى 2 (التراخيص والإيجار) • المستوى 3 (المرافق) • المستوى 4 (الأصول والمواد والإهلاك) • المستوى 5 (الموظفون) • المستوى 7 (الإيرادات)
                      <br />
                      معدلات النمو: إيرادات {revenueGrowthRate}% | تكاليف {costGrowthRate}%
                    </>
                  ) : (
                    <>
                      <span className="font-bold">Auto-calculated:</span> Values below are automatically calculated from:
                      <br />
                      • Level 2 (licences, rent) • Level 3 (utilities) • Level 4 (assets, materials, depreciation) • Level 5 (staff) • Level 7 (revenue)
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

        {/* Monte Carlo risk simulation */}
        <ScenarioRiskPanel
          base={scenarioBase}
          language={language as 'ar' | 'en'}
          isDark={isDark}
          onResult={(summary) => updateModuleData('level6', { scenario: summary })}
        />

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