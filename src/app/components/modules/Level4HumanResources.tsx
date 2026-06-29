import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Users, Calculator, ArrowLeft, Save, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { getOmanizationRequirement, validateOmanizationCompliance, getSectorName } from '@/app/config/sectorConfig';
import { getLevelAiFeedback, type AiFeedback } from '@/lib/ai';
import { AiFeedbackCard } from '@/app/components/ai/AiFeedbackCard';

interface Employee {
  id: string;
  position: string;
  count: string;
  nationality: 'omani' | 'expat';
  monthlySalary: string;
}

export function Level4HumanResources() {
  const { moduleData, updateModuleData, language, setCurrentView, levels, updateLevelProgress, projectTypeData, theme } = useYieldX();
  
  const isRTL = language === 'ar';
  const isDark = theme === 'dark';
  const savedData = moduleData['level5'];
  
  // Get sector-specific Omanization requirement
  const sectorOmanizationMin = getOmanizationRequirement(projectTypeData?.type || null);
  const sectorName = getSectorName(projectTypeData?.type || null, language);
  
  // State
  const [employees, setEmployees] = useState<Employee[]>(
    savedData?.employees && savedData.employees.length > 0
      ? savedData.employees
      : [{ id: '1', position: '', count: '', nationality: 'omani', monthlySalary: '' }]
  );
  
  const [socialInsuranceRate] = useState(15); // 15% for Omani employees
  const [healthInsurancePerExpat, setHealthInsurancePerExpat] = useState(savedData?.healthInsurancePerExpat || '100');
  const [trainingBudgetPercent] = useState(5); // 5% of total salaries
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [aiFeedback, setAiFeedback] = useState<AiFeedback | null>(moduleData['level5']?.aiFeedback || null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const currentLevel = levels.find(l => l.levelId === 5);
  const progressPercentage = currentLevel ? (currentLevel.xp / currentLevel.maxXp) * 100 : 0;

  // Calculate HR metrics
  const omaniEmployees = employees.filter(e => e.nationality === 'omani').reduce((sum, e) => sum + (parseInt(e.count) || 0), 0);
  const expatEmployees = employees.filter(e => e.nationality === 'expat').reduce((sum, e) => sum + (parseInt(e.count) || 0), 0);
  const totalEmployees = omaniEmployees + expatEmployees;
  const omanizationRate = totalEmployees > 0 ? (omaniEmployees / totalEmployees * 100) : 0;

  const totalMonthlySalaries = employees.reduce((sum, emp) => {
    const count = parseInt(emp.count) || 0;
    const salary = parseFloat(emp.monthlySalary) || 0;
    return sum + (count * salary);
  }, 0);

  const omaniSalaries = employees
    .filter(e => e.nationality === 'omani')
    .reduce((sum, emp) => {
      const count = parseInt(emp.count) || 0;
      const salary = parseFloat(emp.monthlySalary) || 0;
      return sum + (count * salary);
    }, 0);

  const socialInsuranceMonthly = (omaniSalaries * socialInsuranceRate) / 100;
  const healthInsuranceMonthly = expatEmployees * (parseFloat(healthInsurancePerExpat) || 0) / 12;
  const trainingBudgetAnnual = (totalMonthlySalaries * 12 * trainingBudgetPercent) / 100;

  const totalAnnualHRCost = (totalMonthlySalaries * 12) + (socialInsuranceMonthly * 12) + (healthInsuranceMonthly * 12) + trainingBudgetAnnual;

  // Save data automatically
  const saveCurrentData = () => {
    const data = {
      employees,
      healthInsurancePerExpat,
      omaniEmployees,
      expatEmployees,
      totalEmployees,
      omanizationRate,
      totalMonthlySalaries,
      socialInsuranceMonthly,
      healthInsuranceMonthly,
      trainingBudgetAnnual,
      totalAnnualHRCost,
    };
    updateModuleData('level5', data);
  };

  useEffect(() => {
    saveCurrentData();
  }, [employees, healthInsurancePerExpat]);

  // Validate form
  const validateForm = () => {
    const errors: string[] = [];
    
    const hasValidEmployee = employees.some(e => e.position.trim() !== '' && e.count !== '' && e.monthlySalary !== '');
    if (!hasValidEmployee) {
      errors.push(isRTL ? 'يجب إدخال موظف واحد على الأقل' : 'At least one employee is required');
    }
    
    if (omanizationRate < sectorOmanizationMin) {
      errors.push(isRTL 
        ? `نسبة التعمين يجب أن تكون ${sectorOmanizationMin}% على الأقل (${sectorName})`
        : `Omanization rate must be at least ${sectorOmanizationMin}% (${sectorName})`
      );
    }
    
    // Check minimum wage for Omanis (325 OMR)
    const belowMinWage = employees.some(e => {
      if (e.nationality === 'omani') {
        const salary = parseFloat(e.monthlySalary) || 0;
        return salary > 0 && salary < 325;
      }
      return false;
    });
    
    if (belowMinWage) {
      errors.push(isRTL ? 'الحد الأدنى للأجور للعمانيين هو 325 ريال' : 'Minimum wage for Omanis is 325 OMR');
    }
    
    return errors;
  };

  // Add employee
  const addEmployee = () => {
    const newEmployee: Employee = {
      id: Date.now().toString(),
      position: '',
      count: '',
      nationality: 'omani',
      monthlySalary: '',
    };
    setEmployees([...employees, newEmployee]);
  };

  // Remove employee
  const removeEmployee = (id: string) => {
    if (employees.length > 1) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

  // Update employee
  const updateEmployee = (id: string, field: keyof Employee, value: string) => {
    setEmployees(employees.map(e => e.id === id ? { ...e, [field]: value } : e));
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
          updateLevelProgress(5, currentLevel.maxXp, true);
          getLevelAiFeedback(5, moduleData['level5'] || {}, language as 'ar' | 'en')
            .then(fb => { setAiFeedback(fb); updateModuleData('level5', { aiFeedback: fb }); })
            .catch(() => {})
            .finally(() => setIsLoadingAi(false));
          setIsLoadingAi(true);
        }
        
        setTimeout(() => {
          setSaveStatus('idle');
          setCurrentView('module-5');
        }, 1500);
      }
    }, 500);
  };

  return (
    <div className={`min-h-screen p-6 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900' 
        : 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100'
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
                ? 'text-orange-200 hover:text-white hover:bg-orange-500/20' 
                : 'text-orange-700 hover:text-orange-900 hover:bg-orange-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isRTL ? 'العودة إلى الخريطة' : 'Back to Map'}
          </Button>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-orange-900'
              }`}>
                {isRTL ? 'المستوى 5: الموارد البشرية والتنظيمية' : 'Level 5: Human Resources'}
              </h1>
              <p className={isDark ? 'text-orange-200' : 'text-orange-700'}>
                {isRTL ? 'بناء الهيكل الوظيفي وحساب تكاليف الموارد البشرية' : 'Build organizational structure and calculate HR costs'}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-sm mb-1 ${isDark ? 'text-orange-200' : 'text-orange-600'}`}>
                {isRTL ? 'التقدم' : 'Progress'}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-32 h-2 rounded-full overflow-hidden ${
                  isDark ? 'bg-slate-700' : 'bg-orange-200'
                }`}>
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-orange-900'}`}>
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Omanization Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className={`p-4 ${omanizationRate >= sectorOmanizationMin ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className={`w-6 h-6 ${omanizationRate >= sectorOmanizationMin ? 'text-green-400' : 'text-red-400'}`} />
                <div>
                  <div className="text-sm text-slate-300">
                    {isRTL ? `نسبة التعمين (${sectorName})` : `Omanization Rate (${sectorName})`}
                  </div>
                  <div className={`text-2xl font-bold ${omanizationRate >= sectorOmanizationMin ? 'text-green-400' : 'text-red-400'}`}>
                    {omanizationRate.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="text-right text-sm text-slate-300">
                <div>{isRTL ? `عمانيون: ${omaniEmployees}` : `Omanis: ${omaniEmployees}`}</div>
                <div>{isRTL ? `وافدون: ${expatEmployees}` : `Expats: ${expatEmployees}`}</div>
                <div className="font-bold">{isRTL ? `الإجمالي: ${totalEmployees}` : `Total: ${totalEmployees}`}</div>
              </div>
            </div>
            {omanizationRate < sectorOmanizationMin && (
              <p className="mt-2 text-xs text-red-300">
                {isRTL ? `⚠️ الحد الأدنى المطلوب: ${sectorOmanizationMin}%` : `⚠️ Minimum required: ${sectorOmanizationMin}%`}
              </p>
            )}
          </Card>
        </motion.div>

        {/* Employee Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={`p-6 backdrop-blur-sm mb-6 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/80 border-orange-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-orange-900'
              }`}>
                <Users className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                {isRTL ? 'الهيكل الوظيفي' : 'Organizational Structure'}
              </h2>
              <Button
                onClick={addEmployee}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="w-4 h-4 mr-1" />
                {isRTL ? 'إضافة وظيفة' : 'Add Position'}
              </Button>
            </div>

            <div className="space-y-3">
              {employees.map((employee, index) => (
                <motion.div
                  key={employee.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700/30 border-slate-600' 
                      : 'bg-orange-50/50 border-orange-200'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {/* Position */}
                    <div className="md:col-span-2">
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-orange-200' : 'text-orange-700'
                      }`}>
                        {isRTL ? 'المسمى الوظيفي' : 'Position'}
                      </label>
                      <input
                        type="text"
                        value={employee.position}
                        onChange={(e) => updateEmployee(employee.id, 'position', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'مثال: مدير، محاسب، فني' : 'e.g., Manager, Accountant, Technician'}
                      />
                    </div>

                    {/* Count */}
                    <div>
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-orange-200' : 'text-orange-700'
                      }`}>
                        {isRTL ? 'العدد' : 'Count'}
                      </label>
                      <input
                        type="number"
                        value={employee.count}
                        onChange={(e) => updateEmployee(employee.id, 'count', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder="1"
                        min="1"
                      />
                    </div>

                    {/* Nationality */}
                    <div>
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-orange-200' : 'text-orange-700'
                      }`}>
                        {isRTL ? 'الجنسية' : 'Nationality'}
                      </label>
                      <select
                        value={employee.nationality}
                        onChange={(e) => updateEmployee(employee.id, 'nationality', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="omani">{isRTL ? 'عماني' : 'Omani'}</option>
                        <option value="expat">{isRTL ? 'وافد' : 'Expat'}</option>
                      </select>
                    </div>

                    {/* Monthly Salary & Delete */}
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className={`block text-xs mb-1 ${
                          isDark ? 'text-orange-200' : 'text-orange-700'
                        }`}>
                          {isRTL ? 'لراتب/شهر (ر.ع)' : 'Salary/Month (OMR)'}
                        </label>
                        <input
                          type="number"
                          value={employee.monthlySalary}
                          onChange={(e) => updateEmployee(employee.id, 'monthlySalary', e.target.value)}
                          className={`w-full px-3 py-2 rounded text-sm border ${
                            isDark 
                              ? 'bg-slate-700 border-slate-600 text-white' 
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                          placeholder={employee.nationality === 'omani' ? '325' : '200'}
                          min={employee.nationality === 'omani' ? '325' : '0'}
                        />
                      </div>
                      {employees.length > 1 && (
                        <Button
                          onClick={() => removeEmployee(employee.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Calculated Total for this position */}
                  <div className={`mt-2 pt-2 border-t text-xs ${
                    isDark ? 'border-slate-600 text-slate-400' : 'border-orange-200 text-black font-medium'
                  }`}>
                    {isRTL ? 'الإجمالي الشهري لهذه الوظيفة:' : 'Monthly total for this position:'} {((parseInt(employee.count) || 0) * (parseFloat(employee.monthlySalary) || 0)).toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* HR Costs Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className={`p-6 backdrop-blur-sm mb-6 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/80 border-orange-200'
          }`}>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-orange-900'
            }`}>
              <Calculator className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
              {isRTL ? 'تكاليف الموارد البشرية السنوية' : 'Annual HR Costs'}
            </h2>

            <div className="space-y-3">
              {/* Monthly Salaries */}
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                isDark ? 'bg-slate-700/30' : 'bg-orange-50'
              }`}>
                <span className={isDark ? 'text-orange-200' : 'text-orange-700'}>
                  {isRTL ? 'الرواتب الأساسية (شهرياً):' : 'Basic Salaries (Monthly):'}
                </span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-orange-900'}`}>
                  {totalMonthlySalaries.toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                </span>
              </div>

              {/* Annual Salaries */}
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                isDark ? 'bg-slate-700/30' : 'bg-orange-50'
              }`}>
                <span className={isDark ? 'text-orange-200' : 'text-orange-700'}>
                  {isRTL ? 'الرواتب السنوية:' : 'Annual Salaries:'}
                </span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-orange-900'}`}>
                  {(totalMonthlySalaries * 12).toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                </span>
              </div>

              {/* Social Insurance */}
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                isDark ? 'bg-slate-700/30' : 'bg-orange-50'
              }`}>
                <div className="flex-1">
                  <div className={isDark ? 'text-orange-200' : 'text-orange-700'}>
                    {isRTL ? 'التأمينات الاجتماعية (15% للعمانيين):' : 'Social Insurance (15% for Omanis):'}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-black font-medium'}`}>
                    {isRTL ? 'شهرياً' : 'Monthly'}: {socialInsuranceMonthly.toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                  </div>
                </div>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-orange-900'}`}>
                  {(socialInsuranceMonthly * 12).toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                </span>
              </div>

              {/* Health Insurance */}
              <div className={`p-3 rounded-lg ${
                isDark ? 'bg-slate-700/30' : 'bg-orange-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className={isDark ? 'text-orange-200' : 'text-orange-700'}>
                      {isRTL ? 'التأمين الصحي (للوافدين):' : 'Health Insurance (Expats):'}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-black font-medium'}`}>
                      {isRTL ? 'شهرياً' : 'Monthly'}: {healthInsuranceMonthly.toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                    </div>
                  </div>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-orange-900'}`}>
                    {(healthInsuranceMonthly * 12).toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                  </span>
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${
                    isDark ? 'text-orange-200' : 'text-orange-700'
                  }`}>
                    {isRTL ? 'التكلفة السنوية لكل موظف وافد (ر.ع):' : 'Annual cost per expat (OMR):'}
                  </label>
                  <input
                    type="number"
                    value={healthInsurancePerExpat}
                    onChange={(e) => setHealthInsurancePerExpat(e.target.value)}
                    className={`w-full px-3 py-2 rounded text-sm border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    placeholder="100"
                    min="0"
                  />
                </div>
              </div>

              {/* Training Budget */}
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                isDark ? 'bg-slate-700/30' : 'bg-orange-50'
              }`}>
                <div>
                  <div className={isDark ? 'text-orange-200' : 'text-orange-700'}>
                    {isRTL ? 'ميزانية التدريب (5% من الرواتب):' : 'Training Budget (5% of salaries):'}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-black font-medium'}`}>
                    {isRTL ? 'الاستثمار في تطوير الموظفين' : 'Investment in employee development'}
                  </div>
                </div>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-orange-900'}`}>
                  {trainingBudgetAnnual.toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                </span>
              </div>

              {/* Total Annual HR Cost */}
              <div className={`flex items-center justify-between p-4 rounded-lg border-2 mt-4 ${
                isDark 
                  ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/50' 
                  : 'bg-gradient-to-r from-orange-100 to-red-100 border-orange-400'
              }`}>
                <span className={`font-bold text-lg ${isDark ? 'text-orange-200' : 'text-orange-800'}`}>
                  {isRTL ? 'إجمالي التكلفة السنوية:' : 'Total Annual Cost:'}
                </span>
                <span className={`font-bold text-2xl ${isDark ? 'text-white' : 'text-orange-900'}`}>
                  {totalAnnualHRCost.toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                </span>
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
                : 'border-orange-300 text-orange-700 hover:bg-orange-100'
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
                : 'bg-orange-500 hover:bg-orange-600'
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