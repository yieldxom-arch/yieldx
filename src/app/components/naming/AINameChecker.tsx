import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  X, 
  AlertTriangle, 
  Lightbulb, 
  Globe, 
  Sparkles, 
  TrendingUp,
  Link as LinkIcon,
  Info,
  ChevronRight,
  Zap,
  Target
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';

interface AINameCheckerProps {
  value?: string;
  businessName?: string;
  language?: 'ar' | 'en';
  onChange?: (value: string) => void;
  onNameSelect?: (name: string) => void;
  placeholder?: string;
}

interface NameAnalysis {
  platformAvailable: boolean;
  globalAwareness: 'unique' | 'common' | 'similar';
  brandScore: number;
  feedback: string;
  suggestions: string[];
  domainSuggestions: string[];
}

export function AINameChecker({ value, businessName, language = 'en', onChange, onNameSelect, placeholder }: AINameCheckerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<NameAnalysis | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value || businessName || '');

  // Sync with external value changes
  useEffect(() => {
    setInputValue(value || businessName || '');
  }, [value, businessName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const t = {
    checking: language === 'ar' ? 'جاري الفحص...' : 'Checking...',
    platformCheck: language === 'ar' ? 'فحص المنصة' : 'Platform Check',
    platformAvailable: language === 'ar' ? 'متوفر في YieldX' : 'Available in YieldX',
    platformTaken: language === 'ar' ? 'مُستخدم مسبقاً في YieldX' : 'Already used in YieldX',
    globalAwareness: language === 'ar' ? 'الوعي العالمي' : 'Global Awareness',
    globalUnique: language === 'ar' ? 'يبدو هذا الاسم فريداً أو أقل شيوعاً' : 'This name appears unique or less common',
    globalCommon: language === 'ar' ? 'هذا الاسم شائع الاستخدام عالمياً' : 'This name is commonly used worldwide',
    globalSimilar: language === 'ar' ? 'هذا الاسم مشابه لعلامات تجارية موجودة' : 'This name is similar to existing brands',
    brandScore: language === 'ar' ? 'تقييم العلامة التجارية' : 'Brand Score',
    feedback: language === 'ar' ? 'تحليل' : 'Analysis',
    suggestions: language === 'ar' ? 'اقتراحات ذكية' : 'Smart Suggestions',
    viewSuggestions: language === 'ar' ? 'عرض الاقتراحات' : 'View Suggestions',
    hideSuggestions: language === 'ar' ? 'إخفاء الاقتراحات' : 'Hide Suggestions',
    domainSuggestions: language === 'ar' ? 'اقتراحات النطاقات' : 'Domain Suggestions',
    useName: language === 'ar' ? 'استخدام' : 'Use',
    disclaimer: language === 'ar' 
      ? 'هذه الأداة توفر إرشادات للعلامة التجارية فقط. يجب على المستخدمين إجراء فحوصات قانونية وعلامة تجارية بشكل مستقل قبل الاستخدام الفعلي.'
      : 'This tool provides branding guidance only. Users should perform legal and trademark checks independently before real-world use.',
    informational: language === 'ar' ? '(معلومات فقط، وليس تحققاً قانونياً)' : '(informational only, not legal verification)',
  };

  useEffect(() => {
    if (inputValue && inputValue.trim().length >= 3) {
      analyzeBusinessName(inputValue);
    } else {
      setAnalysis(null);
    }
  }, [inputValue]);

  const analyzeBusinessName = async (name: string) => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis (in production, this would call an AI API)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Layer 1: Platform Check (mock - in production, check database)
    const platformAvailable = !checkIfNameExistsInPlatform(name);

    // Layer 2: Global Awareness (AI-powered analysis)
    const globalAwareness = analyzeGlobalPresence(name);

    // AI Brand Intelligence
    const brandScore = calculateBrandScore(name);
    const feedback = generateBrandFeedback(name, brandScore);

    // Smart Suggestions
    const suggestions = generateSmartSuggestions(name);
    const domainSuggestions = generateDomainSuggestions(name);

    setAnalysis({
      platformAvailable,
      globalAwareness,
      brandScore,
      feedback,
      suggestions,
      domainSuggestions,
    });

    setIsAnalyzing(false);
  };

  // Mock platform check (replace with actual database query)
  const checkIfNameExistsInPlatform = (name: string): boolean => {
    const existingNames = ['Tesla', 'Apple', 'Microsoft', 'Amazon', 'Google'];
    return existingNames.some(n => n.toLowerCase() === name.toLowerCase());
  };

  // AI-powered global presence analysis
  const analyzeGlobalPresence = (name: string): 'unique' | 'common' | 'similar' => {
    const lowerName = name.toLowerCase().trim();
    
    // Geographic locations (countries, cities, regions) - VERY COMMON
    const geoLocations = [
      'oman', 'muscat', 'dubai', 'saudi', 'arabia', 'qatar', 'kuwait', 'bahrain',
      'uae', 'emirates', 'riyadh', 'jeddah', 'doha', 'manama', 'abu dhabi',
      'america', 'usa', 'uk', 'europe', 'asia', 'africa', 'london', 'paris',
      'new york', 'tokyo', 'china', 'india', 'egypt', 'jordan', 'lebanon',
      'salalah', 'sohar', 'nizwa', 'sur', 'ibri', 'oman', 'gulf', 'middle east'
    ];
    
    // Famous brand patterns and common tech terms
    const famousBrands = [
      'nova', 'prime', 'elite', 'pro', 'max', 'plus', 'ultra', 'mega',
      'super', 'smart', 'tech', 'digital', 'cloud', 'web', 'net', 'app',
      'soft', 'ware', 'system', 'solution', 'service', 'global', 'international'
    ];
    
    // Extremely common generic words
    const commonWords = [
      'store', 'shop', 'market', 'cafe', 'restaurant', 'company', 'solutions',
      'business', 'enterprise', 'group', 'corporation', 'industries', 'trading',
      'services', 'consulting', 'development', 'agency', 'studio', 'design',
      'creative', 'media', 'marketing', 'sales', 'retail', 'wholesale',
      'food', 'coffee', 'hotel', 'travel', 'transport', 'logistics'
    ];
    
    // Check if it's a geographic location (highest priority)
    if (geoLocations.some(geo => lowerName === geo || lowerName.includes(geo))) {
      return 'common'; // Geographic names are VERY common
    }
    
    // Check if it's a famous brand pattern
    if (famousBrands.some(brand => lowerName.includes(brand))) {
      return 'similar';
    }
    
    // Check if it contains common generic words
    if (commonWords.some(word => lowerName.includes(word))) {
      return 'common';
    }
    
    // If it's a very short word (3-4 letters), likely common
    if (lowerName.length <= 4 && /^[a-z]+$/.test(lowerName)) {
      return 'common';
    }
    
    return 'unique';
  };

  // AI brand scoring algorithm
  const calculateBrandScore = (name: string): number => {
    let score = 5.0; // Start neutral instead of perfect
    
    const lowerName = name.toLowerCase().trim();
    const length = lowerName.length;
    
    // CRITICAL: Geographic location penalty (country/city names are terrible for branding)
    const geoLocations = [
      'oman', 'muscat', 'dubai', 'saudi', 'arabia', 'qatar', 'kuwait', 'bahrain',
      'uae', 'emirates', 'riyadh', 'jeddah', 'doha', 'manama', 'abu dhabi',
      'america', 'usa', 'uk', 'europe', 'asia', 'africa', 'london', 'paris',
      'new york', 'tokyo', 'china', 'india', 'egypt', 'jordan', 'lebanon',
      'salalah', 'sohar', 'nizwa', 'sur', 'ibri', 'gulf', 'middle east'
    ];
    
    if (geoLocations.some(geo => lowerName === geo || lowerName.includes(geo))) {
      score -= 3.0; // Major penalty for geographic names
    }
    
    // 1. Length scoring (5-10 characters is ideal)
    if (length >= 5 && length <= 10) {
      score += 2.0;
    } else if (length >= 3 && length <= 12) {
      score += 1.0;
    } else if (length < 3) {
      score -= 2.0;
    } else if (length > 15) {
      score -= 1.5;
    }
    
    // 2. Pronounceability check (vowel ratio)
    const vowels = (lowerName.match(/[aeiou]/g) || []).length;
    const consonants = (lowerName.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
    const vowelRatio = vowels / (vowels + consonants);
    
    // Good vowel ratio is between 30-50%
    if (vowelRatio >= 0.3 && vowelRatio <= 0.5) {
      score += 1.5;
    } else if (vowelRatio < 0.15 || vowelRatio > 0.7) {
      score -= 2.0; // Too many consonants or vowels
    }
    
    // 3. Repeated characters penalty (like "dd", "oo", "ff")
    const hasExcessiveRepeats = /(.)\1{2,}/.test(lowerName); // 3+ same chars in a row
    const hasMultipleDoubles = (lowerName.match(/(.)\1/g) || []).length >= 3;
    
    if (hasExcessiveRepeats) {
      score -= 2.5;
    } else if (hasMultipleDoubles) {
      score -= 1.5;
    }
    
    // 4. Consonant clusters penalty (hard to pronounce)
    const hasHardClusters = /[bcdfghjklmnpqrstvwxyz]{4,}/.test(lowerName);
    if (hasHardClusters) {
      score -= 1.5;
    }
    
    // 5. Common/dictionary-like words bonus
    const commonPrefixes = ['tech', 'smart', 'digital', 'cloud', 'web', 'app', 'net'];
    const commonSuffixes = ['labs', 'tech', 'soft', 'ware', 'hub', 'pro', 'max'];
    
    const hasGoodPrefix = commonPrefixes.some(prefix => lowerName.startsWith(prefix));
    const hasGoodSuffix = commonSuffixes.some(suffix => lowerName.endsWith(suffix));
    
    if (hasGoodPrefix || hasGoodSuffix) {
      score += 1.0;
    }
    
    // 6. Special characters penalty
    if (/[^a-z0-9\s]/.test(lowerName)) {
      score -= 2.0;
    }
    
    // 7. Numbers penalty (usually not professional)
    if (/\d/.test(lowerName)) {
      score -= 1.0;
    }
    
    // 8. All caps or weird casing penalty
    if (name === name.toUpperCase() && name.length > 3) {
      score -= 0.5;
    }
    
    // 9. Spaces handling (compound names can be good)
    const wordCount = lowerName.split(/\s+/).length;
    if (wordCount === 2 || wordCount === 3) {
      score += 0.5;
    } else if (wordCount > 4) {
      score -= 1.0;
    }
    
    return Math.max(1.0, Math.min(10.0, score));
  };

  // Generate contextual feedback
  const generateBrandFeedback = (name: string, score: number): string => {
    const lowerName = name.toLowerCase().trim();
    
    // Check if it's a geographic name
    const geoLocations = [
      'oman', 'muscat', 'dubai', 'saudi', 'arabia', 'qatar', 'kuwait', 'bahrain',
      'uae', 'emirates', 'riyadh', 'jeddah', 'doha', 'manama', 'abu dhabi',
      'america', 'usa', 'uk', 'europe', 'asia', 'africa', 'london', 'paris',
      'new york', 'tokyo', 'china', 'india', 'egypt', 'jordan', 'lebanon',
      'salalah', 'sohar', 'nizwa', 'sur', 'ibri', 'gulf', 'middle east'
    ];
    
    const isGeoName = geoLocations.some(geo => lowerName === geo || lowerName.includes(geo));
    
    // Context-aware feedback
    if (isGeoName) {
      return language === 'ar' 
        ? 'اسم جغرافي: معروف ولكن يفتقر للتفرد وصعب حمايته قانونياً'
        : 'Geographic name: Well-known but lacks uniqueness and trademark protection';
    }
    
    if (language === 'ar') {
      if (score >= 8.5) return 'اسم ممتاز: واضح، سهل النطق، وفريد';
      if (score >= 7.0) return 'اسم جيد: مميز ولكن قد يحتاج تحسين طفيف';
      if (score >= 5.5) return 'اسم مقبول: واضح لكنه شائع أو عام';
      if (score >= 3.0) return 'اسم ضعيف: عام جداً أو يفتقر للتميز';
      return 'اسم ضعيف جداً: صعب النطق أو التذكر';
    } else {
      if (score >= 8.5) return 'Excellent: Clear, easy to pronounce, and unique';
      if (score >= 7.0) return 'Good: Distinctive but may need slight refinement';
      if (score >= 5.5) return 'Acceptable: Clear but common or generic';
      if (score >= 3.0) return 'Weak: Too generic or lacks distinction';
      return 'Very weak: Hard to pronounce or remember';
    }
  };

  // Generate smart name suggestions
  const generateSmartSuggestions = (name: string): string[] => {
    const baseName = name.trim();
    const suggestions: string[] = [];
    
    // Professional suffixes (language-aware)
    const suffixes = language === 'ar' 
      ? ['برو', 'بلس', 'جروب', 'ون', 'لابز', 'هب', 'اكس']
      : ['Labs', 'One', 'X', 'App', 'Hub', 'HQ', 'Global', 'Pro', 'Plus', 'Group'];
    
    suffixes.slice(0, 5).forEach(suffix => {
      suggestions.push(`${baseName}${suffix}`);
    });
    
    // Prefixes (language-aware)
    const prefixes = language === 'ar'
      ? ['احصل على', 'جرب', 'ماي', 'ذا']
      : ['Get', 'Try', 'My', 'The'];
    
    prefixes.slice(0, 2).forEach(prefix => {
      suggestions.push(`${prefix}${baseName}`);
    });
    
    // Creative variations (works for both languages)
    const vowels = language === 'ar' ? 'اويى' : 'aeiou';
    const lastChar = baseName.slice(-1).toLowerCase();
    if (vowels.includes(lastChar)) {
      if (language === 'ar') {
        suggestions.push(baseName.slice(0, -1) + 'ا');
        suggestions.push(baseName.slice(0, -1) + 'ي');
      } else {
        suggestions.push(baseName.slice(0, -1) + 'a');
        suggestions.push(baseName.slice(0, -1) + 'i');
      }
    }
    
    return suggestions.slice(0, 10);
  };

  // Generate domain suggestions
  const generateDomainSuggestions = (name: string): string[] => {
    const cleanName = name.toLowerCase().replace(/\s+/g, '');
    return [
      `${cleanName}.com`,
      `get${cleanName}.com`,
      `try${cleanName}.com`,
      `${cleanName}app.io`,
      `${cleanName}hq.com`,
      `${cleanName}.om`,
    ];
  };

  const getScoreColor = (score: number): string => {
    if (score >= 8.5) return 'text-green-600 dark:text-green-400';
    if (score >= 7.0) return 'text-blue-600 dark:text-blue-400';
    if (score >= 5.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 8.5) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-500/30';
    if (score >= 7.0) return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/30';
    if (score >= 5.5) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-500/30';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-500/30';
  };

  return (
    <div className="space-y-4">
      {/* Input Field */}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder={placeholder || (language === 'ar' ? 'أدخل اسم المشروع' : 'Enter business name')}
      />

      {/* Only show analysis if input is long enough */}
      {inputValue && inputValue.trim().length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Analyzing State */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-500/30 p-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </motion.div>
                    <span className="text-purple-700 dark:text-purple-300 font-medium">
                      {t.checking}
                    </span>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analysis Results */}
          {!isAnalyzing && analysis && (
            <div className="space-y-4">
              {/* Layer 1: Platform Check */}
              <Card className={`p-4 ${analysis.platformAvailable ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-500/30' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-500/30'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {analysis.platformAvailable ? (
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                        <X className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {t.platformCheck}
                      </h4>
                      <p className={`text-sm ${analysis.platformAvailable ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                        {analysis.platformAvailable ? t.platformAvailable : t.platformTaken}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={analysis.platformAvailable ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'}>
                    {language === 'ar' ? 'إلزامي' : 'Mandatory'}
                  </Badge>
                </div>
              </Card>

              {/* Layer 2: Global Awareness */}
              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-500/30 p-4">
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        🌍 {t.globalAwareness}
                      </h4>
                      <Badge variant="outline" className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs">
                        {t.informational}
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {analysis.globalAwareness === 'unique' && t.globalUnique}
                      {analysis.globalAwareness === 'common' && t.globalCommon}
                      {analysis.globalAwareness === 'similar' && t.globalSimilar}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Brand Score */}
              <Card className={`p-4 border-2 ${getScoreBgColor(analysis.brandScore)}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`w-5 h-5 ${getScoreColor(analysis.brandScore)}`} />
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {t.brandScore}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-3xl font-bold ${getScoreColor(analysis.brandScore)}`}>
                      {analysis.brandScore.toFixed(1)}
                    </span>
                    <span className="text-slate-500 dark:text-gray-400">/10</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.brandScore * 10}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-2 rounded-full ${
                      analysis.brandScore >= 8.5 ? 'bg-green-500' :
                      analysis.brandScore >= 7.0 ? 'bg-blue-500' :
                      analysis.brandScore >= 5.5 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                  />
                </div>

                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-slate-500 dark:text-gray-400 mt-0.5" />
                  <p className="text-sm text-slate-700 dark:text-gray-300">
                    {analysis.feedback}
                  </p>
                </div>
              </Card>

              {/* Smart Suggestions */}
              {analysis.suggestions.length > 0 && (
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-500/30 p-4">
                  <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {t.suggestions}
                      </h4>
                      <Badge variant="outline" className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300">
                        {analysis.suggestions.length}
                      </Badge>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-purple-600 dark:text-purple-400 transition-transform ${showSuggestions ? 'rotate-90' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showSuggestions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 grid grid-cols-2 gap-2"
                      >
                        {analysis.suggestions.map((suggestion, index) => (
                          <motion.div
                            key={suggestion}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <button
                              onClick={() => onNameSelect?.(suggestion)}
                              className="w-full bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 rounded-lg p-3 text-left hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-900 dark:text-white text-sm">
                                  {suggestion}
                                </span>
                                <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              )}

              {/* Domain Suggestions */}
              <Card className="bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 border-cyan-200 dark:border-cyan-500/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <LinkIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    🌐 {t.domainSuggestions}
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {analysis.domainSuggestions.map((domain, index) => (
                    <motion.div
                      key={domain}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white dark:bg-slate-800 border border-cyan-200 dark:border-cyan-500/30 rounded-lg px-3 py-2"
                    >
                      <p className="text-sm font-mono text-cyan-700 dark:text-cyan-300">
                        {domain}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Disclaimer */}
              <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-slate-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                    {t.disclaimer}
                  </p>
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}