import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Rocket } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { useYieldX } from '@/app/contexts/YieldXContext';

const tutorialSteps = [
  {
    title: 'مرحباً في YieldX! 🚀',
    titleEn: 'Welcome to YieldX! 🚀',
    description: 'منصتك الشاملة لإعداد دراسات الجدوى التفصيلية بطريقة تفاعلية وممتعة',
    descriptionEn: 'Your all-in-one platform for building detailed feasibility studies in an interactive, engaging way',
    icon: '🎯',
  },
  {
    title: 'رحلة من 8 مستويات (0-7)',
    titleEn: 'An 8-Level Journey (0–7)',
    description: 'أكمل 8 مستويات وفق معايير الجدوى العُمانية: من اختيار نوع المشروع وحتى نموذج الأعمال الشامل ورؤية 2040',
    descriptionEn: 'Complete 8 levels aligned with Omani feasibility study standards — from choosing your project type to a full business model and Oman Vision 2040 alignment',
    icon: '🗺️',
  },
  {
    title: 'اكسب النقاط والإنجازات',
    titleEn: 'Earn Points & Achievements',
    description: 'احصل على نقاط XP مقابل كل قسم تكمله. كلما تقدمت، تفتح مستويات جديدة',
    descriptionEn: 'Earn XP for every section you complete. As you progress, new levels unlock',
    icon: '⭐',
  },
  {
    title: 'احفظ وتابع لاحقاً',
    titleEn: 'Save & Continue Anytime',
    description: 'بياناتك محفوظة تلقائياً. يمكنك العودة في أي وقت لإكمال رحلتك',
    descriptionEn: 'Your data is saved automatically. Come back anytime to continue your journey',
    icon: '💾',
  },
  {
    title: 'احصل على تقريرك الشامل',
    titleEn: 'Get Your Complete Report',
    description: 'عند الانتهاء، احصل على تقرير PDF احترافي كامل بدراسة الجدوى لمشروعك',
    descriptionEn: "When you're done, get a complete, professional PDF report of your project's feasibility study",
    icon: '📄',
  },
];

export function WelcomeTutorial() {
  const { theme, language } = useYieldX();
  const isDark = theme === 'dark';
  const isAr = language === 'ar';
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('yieldx_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('yieldx_tutorial_seen', 'true');
    setShowTutorial(false);
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  return (
    <AnimatePresence>
      {showTutorial && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-full max-w-2xl"
          >
            <Card className={`p-8 relative overflow-hidden ${
              isDark
                ? 'bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/50'
                : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300'
            }`}>
              {/* Animated Background */}
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 30 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-1 h-1 rounded-full ${isDark ? 'bg-white' : 'bg-purple-400'}`}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      opacity: [0.2, 1, 0.2],
                      scale: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className={`absolute top-4 left-4 transition-colors z-10 ${
                  isDark ? 'text-white/50 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <X className="w-6 h-6" />
              </button>

              {/* Content */}
              <div className="relative z-10">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <Rocket className="w-16 h-16 text-purple-400" />
                  </motion.div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    <div className="text-6xl mb-4">{tutorialSteps[currentStep].icon}</div>
                    <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {isAr ? tutorialSteps[currentStep].title : tutorialSteps[currentStep].titleEn}
                    </h2>
                    <p className={`text-lg leading-relaxed ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>
                      {isAr ? tutorialSteps[currentStep].description : tutorialSteps[currentStep].descriptionEn}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mt-8 mb-6">
                  {tutorialSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentStep
                          ? 'bg-purple-400 w-8'
                          : isDark ? 'bg-white/30' : 'bg-purple-900/20'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className={isDark ? 'text-purple-300 hover:text-white' : 'text-purple-600 hover:text-slate-900'}
                  >
                    {isAr ? 'تخطي' : 'Skip'}
                  </Button>

                  <div className="flex gap-2">
                    {currentStep > 0 && (
                      <Button
                        variant="outline"
                        onClick={handlePrevious}
                        className={isDark
                          ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
                          : 'bg-slate-900/5 border-slate-900/10 hover:bg-slate-900/10 text-slate-900'}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        {isAr ? 'السابق' : 'Previous'}
                      </Button>
                    )}

                    <Button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      {currentStep === tutorialSteps.length - 1 ? (isAr ? 'ابدأ الآن' : 'Start Now') : (isAr ? 'التالي' : 'Next')}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}