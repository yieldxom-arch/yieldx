import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Package, Boxes, TrendingDown, ArrowLeft, Save, AlertCircle, CheckCircle2, Calculator } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { shouldShowRawMaterials, getSectorName } from '@/app/config/sectorConfig';

interface FixedAsset {
  id: string;
  name: string;
  acquisitionMethod: 'purchase' | 'lease';
  quantity: string;
  unitPrice: string;
  depreciationRate: string; // Auto-set based on asset type
  assetType: 'building' | 'machinery' | 'furniture' | 'vehicle' | 'other';
}

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  monthlyQuantity: string;
  unitPrice: string;
}

export function Level3PhysicalResources() {
  const { moduleData, updateModuleData, language, setCurrentView, levels, updateLevelProgress, projectTypeData, theme } = useYieldX();
  
  const isRTL = language === 'ar';
  const isDark = theme === 'dark';
  const savedData = moduleData['level3'];
  
  // State
  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>(
    savedData?.fixedAssets && savedData.fixedAssets.length > 0
      ? savedData.fixedAssets
      : [{ id: '1', name: '', acquisitionMethod: 'purchase', quantity: '', unitPrice: '', depreciationRate: '10', assetType: 'machinery' }]
  );
  
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(
    savedData?.rawMaterials && savedData.rawMaterials.length > 0
      ? savedData.rawMaterials
      : [{ id: '1', name: '', unit: 'kg', monthlyQuantity: '', unitPrice: '' }]
  );
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const currentLevel = levels.find(l => l.levelId === 3);
  const progressPercentage = currentLevel ? (currentLevel.xp / currentLevel.maxXp) * 100 : 0;

  // Depreciation rates based on asset type
  const depreciationRates = {
    building: 5,
    machinery: 10,
    furniture: 20,
    vehicle: 25,
    other: 10,
  };

  // Calculate totals
  const totalFixedAssetsCost = fixedAssets.reduce((total, asset) => {
    const qty = parseFloat(asset.quantity) || 0;
    const price = parseFloat(asset.unitPrice) || 0;
    return total + (qty * price);
  }, 0);

  const totalMonthlyRawMaterialCost = rawMaterials.reduce((total, material) => {
    const qty = parseFloat(material.monthlyQuantity) || 0;
    const price = parseFloat(material.unitPrice) || 0;
    return total + (qty * price);
  }, 0);

  const totalAnnualDepreciation = fixedAssets.reduce((total, asset) => {
    if (asset.acquisitionMethod === 'purchase') {
      const qty = parseFloat(asset.quantity) || 0;
      const price = parseFloat(asset.unitPrice) || 0;
      const rate = parseFloat(asset.depreciationRate) || 0;
      return total + ((qty * price * rate) / 100);
    }
    return total;
  }, 0);

  // Save data automatically
  const saveCurrentData = () => {
    const data = {
      fixedAssets,
      rawMaterials,
      totalFixedAssetsCost,
      totalMonthlyRawMaterialCost,
      totalAnnualDepreciation,
    };
    updateModuleData('level3', data);
  };

  useEffect(() => {
    saveCurrentData();
  }, [fixedAssets, rawMaterials]);

  // Validate form
  const validateForm = () => {
    const errors: string[] = [];
    
    const hasValidAsset = fixedAssets.some(a => a.name.trim() !== '' && a.quantity !== '' && a.unitPrice !== '');
    if (!hasValidAsset) {
      errors.push(isRTL ? 'يجب إدخال أصل ثابت واحد على الأقل' : 'At least one fixed asset is required');
    }
    
    // Raw materials validation only for industrial and agricultural projects
    if (shouldShowRawMaterials(projectTypeData?.type)) {
      const hasValidMaterial = rawMaterials.some(m => m.name.trim() !== '' && m.monthlyQuantity !== '');
      if (!hasValidMaterial) {
        errors.push(isRTL ? 'يجب إدخال مادة خام واحدة على الأقل للمشاريع الصناعية والزراعية' : 'At least one raw material is required for industrial/agricultural projects');
      }
    }
    
    return errors;
  };

  // Add fixed asset
  const addFixedAsset = () => {
    const newAsset: FixedAsset = {
      id: Date.now().toString(),
      name: '',
      acquisitionMethod: 'purchase',
      quantity: '',
      unitPrice: '',
      depreciationRate: '10',
      assetType: 'machinery',
    };
    setFixedAssets([...fixedAssets, newAsset]);
  };

  // Remove fixed asset
  const removeFixedAsset = (id: string) => {
    if (fixedAssets.length > 1) {
      setFixedAssets(fixedAssets.filter(a => a.id !== id));
    }
  };

  // Update fixed asset
  const updateFixedAsset = (id: string, field: keyof FixedAsset, value: string) => {
    setFixedAssets(fixedAssets.map(a => {
      if (a.id === id) {
        const updated = { ...a, [field]: value };
        // Auto-update depreciation rate when asset type changes
        if (field === 'assetType') {
          updated.depreciationRate = depreciationRates[value as keyof typeof depreciationRates].toString();
        }
        return updated;
      }
      return a;
    }));
  };

  // Add raw material
  const addRawMaterial = () => {
    const newMaterial: RawMaterial = {
      id: Date.now().toString(),
      name: '',
      unit: 'kg',
      monthlyQuantity: '',
      unitPrice: '',
    };
    setRawMaterials([...rawMaterials, newMaterial]);
  };

  // Remove raw material
  const removeRawMaterial = (id: string) => {
    if (rawMaterials.length > 1) {
      setRawMaterials(rawMaterials.filter(m => m.id !== id));
    }
  };

  // Update raw material
  const updateRawMaterial = (id: string, field: keyof RawMaterial, value: string) => {
    setRawMaterials(rawMaterials.map(m => m.id === id ? { ...m, [field]: value } : m));
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
          updateLevelProgress(3, currentLevel.maxXp, true);
        }
        
        setTimeout(() => {
          setSaveStatus('idle');
          setCurrentView('module-4');
        }, 1500);
      }
    }, 500);
  };

  return (
    <div className={`min-h-screen p-6 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-green-900 to-slate-900' 
        : 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100'
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
                ? 'text-green-200 hover:text-white hover:bg-green-500/20' 
                : 'text-green-700 hover:text-green-900 hover:bg-green-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isRTL ? 'العودة إلى الخريطة' : 'Back to Map'}
          </Button>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-green-900'
              }`}>
                {isRTL ? 'المستوى 3: الموارد المادية والفنية' : 'Level 3: Physical Resources'}
              </h1>
              <p className={isDark ? 'text-green-200' : 'text-green-700'}>
                {isRTL ? 'حساب الأصول والمواد الخام والإهلاك' : 'Calculate assets, raw materials, and depreciation'}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-sm mb-1 ${isDark ? 'text-green-200' : 'text-green-600'}`}>
                {isRTL ? 'التقدم' : 'Progress'}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-32 h-2 rounded-full overflow-hidden ${
                  isDark ? 'bg-slate-700' : 'bg-green-200'
                }`}>
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-green-900'}`}>
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Assets Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`p-6 backdrop-blur-sm mb-6 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/80 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-green-900'
              }`}>
                <Package className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                {isRTL ? 'الأصول' : 'Assets'}
              </h2>
              <Button
                onClick={addFixedAsset}
                size="sm"
                className="bg-green-500 hover:bg-green-600"
              >
                <Plus className="w-4 h-4 mr-1" />
                {isRTL ? 'إضافة أصل' : 'Add Asset'}
              </Button>
            </div>

            <div className="space-y-3">
              {fixedAssets.map((asset, index) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700/30 border-slate-600' 
                      : 'bg-green-50/50 border-green-200'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                    {/* Asset Name */}
                    <div className="md:col-span-2">
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-green-200' : 'text-green-700'
                      }`}>
                        {isRTL ? 'اسم الأصل' : 'Asset Name'}
                      </label>
                      <input
                        type="text"
                        value={asset.name}
                        onChange={(e) => updateFixedAsset(asset.id, 'name', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder={isRTL ? 'مثال: مبنى، آلة، أثاث' : 'e.g., Building, Machine, Furniture'}
                      />
                    </div>

                    {/* Asset Type */}
                    <div>
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-green-200' : 'text-green-700'
                      }`}>
                        {isRTL ? 'النوع' : 'Type'}
                      </label>
                      <select
                        value={asset.assetType}
                        onChange={(e) => updateFixedAsset(asset.id, 'assetType', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="building">{isRTL ? 'مبنى (5%)' : 'Building (5%)'}</option>
                        <option value="machinery">{isRTL ? 'آلات (10%)' : 'Machinery (10%)'}</option>
                        <option value="furniture">{isRTL ? 'أثاث (20%)' : 'Furniture (20%)'}</option>
                        <option value="vehicle">{isRTL ? 'مركبات (25%)' : 'Vehicle (25%)'}</option>
                        <option value="other">{isRTL ? 'أخرى (10%)' : 'Other (10%)'}</option>
                      </select>
                    </div>

                    {/* Acquisition Method */}
                    <div>
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-green-200' : 'text-green-700'
                      }`}>
                        {isRTL ? 'الطريقة' : 'Method'}
                      </label>
                      <select
                        value={asset.acquisitionMethod}
                        onChange={(e) => updateFixedAsset(asset.id, 'acquisitionMethod', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="purchase">{isRTL ? 'شراء' : 'Purchase'}</option>
                        <option value="lease">{isRTL ? 'إيجار' : 'Lease'}</option>
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-green-200' : 'text-green-700'
                      }`}>
                        {isRTL ? 'الكمية' : 'Quantity'}
                      </label>
                      <input
                        type="number"
                        value={asset.quantity}
                        onChange={(e) => updateFixedAsset(asset.id, 'quantity', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder="1"
                        min="0"
                      />
                    </div>

                    {/* Unit Price */}
                    <div>
                      <label className={`block text-xs mb-1 ${
                        isDark ? 'text-green-200' : 'text-green-700'
                      }`}>
                        {isRTL ? 'السعر (ر.ع)' : 'Price (OMR)'}
                      </label>
                      <input
                        type="number"
                        value={asset.unitPrice}
                        onChange={(e) => updateFixedAsset(asset.id, 'unitPrice', e.target.value)}
                        className={`w-full px-3 py-2 rounded text-sm border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                        placeholder="1000"
                        min="0"
                      />
                    </div>

                    {/* Delete */}
                    <div className="flex items-end">
                      {fixedAssets.length > 1 && (
                        <Button
                          onClick={() => removeFixedAsset(asset.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Calculated Total */}
                  <div className={`mt-2 pt-2 border-t flex items-center justify-between text-xs ${
                    isDark ? 'border-slate-600' : 'border-green-200'
                  }`}>
                    <span className={isDark ? 'text-slate-400' : 'text-green-600'}>
                      {isRTL ? 'الإجمالي:' : 'Total:'} {((parseFloat(asset.quantity) || 0) * (parseFloat(asset.unitPrice) || 0)).toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                    </span>
                    {asset.acquisitionMethod === 'purchase' && (
                      <span className={isDark ? 'text-slate-400' : 'text-green-600'}>
                        {isRTL ? `إهلاك سنوي: ${(((parseFloat(asset.quantity) || 0) * (parseFloat(asset.unitPrice) || 0) * (parseFloat(asset.depreciationRate) || 0)) / 100).toFixed(2)} ر.ع` 
                               : `Annual Depreciation: ${(((parseFloat(asset.quantity) || 0) * (parseFloat(asset.unitPrice) || 0) * (parseFloat(asset.depreciationRate) || 0)) / 100).toFixed(2)} OMR`}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Total Assets */}
            <div className={`mt-4 p-3 rounded-lg border ${
              isDark 
                ? 'bg-slate-700/50 border-slate-600' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`font-medium ${
                  isDark ? 'text-green-200' : 'text-green-700'
                }`}>
                  {isRTL ? 'إجمالي الأصول:' : 'Total Assets:'}
                </span>
                <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-green-900'}`}>
                  {totalFixedAssetsCost.toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Raw Materials Section (Show for industrial/agricultural) */}
        {shouldShowRawMaterials(projectTypeData?.type) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className={`p-6 backdrop-blur-sm mb-6 ${
              isDark 
                ? 'bg-slate-800/50 border-slate-700' 
                : 'bg-white/80 border-green-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-green-900'
                }`}>
                  <Boxes className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  {isRTL ? 'المواد الخام' : 'Raw Materials'}
                </h2>
                <Button
                  onClick={addRawMaterial}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {isRTL ? 'إضافة مادة' : 'Add Material'}
                </Button>
              </div>

              <div className="space-y-3">
                {rawMaterials.map((material, index) => (
                  <motion.div
                    key={material.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-700/30 border-slate-600' 
                        : 'bg-green-50/50 border-green-200'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div className="md:col-span-2">
                        <label className={`block text-xs mb-1 ${
                          isDark ? 'text-green-200' : 'text-green-700'
                        }`}>
                          {isRTL ? 'اسم المادة' : 'Material Name'}
                        </label>
                        <input
                          type="text"
                          value={material.name}
                          onChange={(e) => updateRawMaterial(material.id, 'name', e.target.value)}
                          className={`w-full px-3 py-2 rounded text-sm border ${
                            isDark 
                              ? 'bg-slate-700 border-slate-600 text-white' 
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                          placeholder={isRTL ? 'مثال: دقيق، بلاستيك، حديد' : 'e.g., Flour, Plastic, Steel'}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs mb-1 ${
                          isDark ? 'text-green-200' : 'text-green-700'
                        }`}>
                          {isRTL ? 'الوحدة' : 'Unit'}
                        </label>
                        <select
                          value={material.unit}
                          onChange={(e) => updateRawMaterial(material.id, 'unit', e.target.value)}
                          className={`w-full px-3 py-2 rounded text-sm border ${
                            isDark 
                              ? 'bg-slate-700 border-slate-600 text-white' 
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        >
                          <option value="kg">{isRTL ? 'كيلوغرام' : 'Kilogram'}</option>
                          <option value="liter">{isRTL ? 'لتر' : 'Liter'}</option>
                          <option value="ton">{isRTL ? 'طن' : 'Ton'}</option>
                          <option value="unit">{isRTL ? 'وحدة' : 'Unit'}</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-xs mb-1 ${
                          isDark ? 'text-green-200' : 'text-green-700'
                        }`}>
                          {isRTL ? 'الكمية/شهر' : 'Qty/Month'}
                        </label>
                        <input
                          type="number"
                          value={material.monthlyQuantity}
                          onChange={(e) => updateRawMaterial(material.id, 'monthlyQuantity', e.target.value)}
                          className={`w-full px-3 py-2 rounded text-sm border ${
                            isDark 
                              ? 'bg-slate-700 border-slate-600 text-white' 
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                          placeholder="100"
                          min="0"
                        />
                      </div>

                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className={`block text-xs mb-1 ${
                            isDark ? 'text-green-200' : 'text-green-700'
                          }`}>
                            {isRTL ? 'السعر (ر.ع)' : 'Price (OMR)'}
                          </label>
                          <input
                            type="number"
                            value={material.unitPrice}
                            onChange={(e) => updateRawMaterial(material.id, 'unitPrice', e.target.value)}
                            className={`w-full px-3 py-2 rounded text-sm border ${
                              isDark 
                                ? 'bg-slate-700 border-slate-600 text-white' 
                                : 'bg-white border-slate-300 text-slate-900'
                            }`}
                            placeholder="5"
                            min="0"
                          />
                        </div>
                        {rawMaterials.length > 1 && (
                          <Button
                            onClick={() => removeRawMaterial(material.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Calculated Monthly Cost */}
                    <div className={`mt-2 pt-2 border-t text-xs ${
                      isDark ? 'border-slate-600 text-slate-400' : 'border-green-200 text-green-600'
                    }`}>
                      {isRTL ? 'التكلفة الشهرية:' : 'Monthly Cost:'} {((parseFloat(material.monthlyQuantity) || 0) * (parseFloat(material.unitPrice) || 0)).toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Total Raw Materials */}
              <div className={`mt-4 p-3 rounded-lg border ${
                isDark 
                  ? 'bg-slate-700/50 border-slate-600' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${
                    isDark ? 'text-green-200' : 'text-green-700'
                  }`}>
                    {isRTL ? 'إجمالي التكلفة الشهرية للمواد الخام:' : 'Total Monthly Raw Material Cost:'}
                  </span>
                  <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-green-900'}`}>
                    {totalMonthlyRawMaterialCost.toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Depreciation Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className={`p-6 backdrop-blur-sm mb-6 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/80 border-green-200'
          }`}>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-green-900'
            }`}>
              <TrendingDown className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              {isRTL ? 'ملخص الإهلاك (محسوب تلقائياً)' : 'Depreciation Summary (Auto-calculated)'}
            </h2>

            <div className="space-y-3">
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                isDark ? 'bg-slate-700/30' : 'bg-green-50'
              }`}>
                <div className="flex items-center gap-2">
                  <Calculator className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={isDark ? 'text-green-200' : 'text-green-700'}>
                    {isRTL ? 'إجمالي الإهلاك السنوي:' : 'Total Annual Depreciation:'}
                  </span>
                </div>
                <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-green-900'}`}>
                  {totalAnnualDepreciation.toFixed(2)} {isRTL ? 'ر.ع' : 'OMR'}
                </span>
              </div>

              <div className={`text-xs p-3 rounded ${
                isDark ? 'text-slate-400 bg-slate-700/20' : 'text-green-600 bg-green-50'
              }`}>
                <p className="mb-2">
                  {isRTL ? '📌 معدلات الإهلاك المطبقة:' : '📌 Applied Depreciation Rates:'}
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{isRTL ? 'المباني: 5% سنوياً' : 'Buildings: 5% annually'}</li>
                  <li>{isRTL ? 'الآلات: 10% سنوياً' : 'Machinery: 10% annually'}</li>
                  <li>{isRTL ? 'الأثاث: 20% سنوياً' : 'Furniture: 20% annually'}</li>
                  <li>{isRTL ? 'المركبات: 25% سنوياً' : 'Vehicles: 25% annually'}</li>
                </ul>
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
                : 'border-green-300 text-green-700 hover:bg-green-100'
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
                : 'bg-green-500 hover:bg-green-600'
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