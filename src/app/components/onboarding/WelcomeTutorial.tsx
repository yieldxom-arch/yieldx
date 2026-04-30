import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Rocket } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';

const tutorialSteps = [
  {
    title: 'مرحباً في YieldX! 🚀',
    description: 'منصتك الشاملة لإعداد دراسات الجدوى التفصيلية بطريقة تفاعلية وممتعة',
    icon: '🎯',
  },
  {
    title: 'رحلة من 8 مستويات (0-7)',
    description: 'أكمل 8 مستويات وفق معايير الجدوى العُمانية: من اختيار نوع المشروع وحتى نموذج الأعمال الشامل ورؤية 2040',
    icon: '🗺️',
  },
  {
    title: 'اكسب النقاط والإنجازات',
    description: 'احصل على نقاط XP مقابل كل قسم تكمله. كلما تقدمت، تفتح مستويات جديدة',
    icon: '⭐',
  },
  {
    title: 'احفظ وتابع لاحقاً',
    description: 'بياناتك محفوظة تلقائياً. يمكنك العودة في أي وقت لإكمال رحلتك',
    icon: '💾',
  },
  {
    title: 'احصل على تقريرك الشامل',
    description: 'عند الانتهاء، احصل على تقرير PDF احترافي كامل بدراسة الجدوى لمشروعك',
    icon: '📄',
  },
];

export function WelcomeTutorial() {
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
            <Card className="bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/50 p-8 relative overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 30 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
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
                className="absolute top-4 left-4 text-white/50 hover:text-white transition-colors z-10"
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
                    <h2 className="text-3xl font-bold text-white mb-4">
                      {tutorialSteps[currentStep].title}
                    </h2>
                    <p className="text-purple-200 text-lg leading-relaxed">
                      {tutorialSteps[currentStep].description}
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
                          : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-purple-300 hover:text-white"
                  >
                    تخطي
                  </Button>

                  <div className="flex gap-2">
                    {currentStep > 0 && (
                      <Button
                        variant="outline"
                        onClick={handlePrevious}
                        className="bg-white/10 border-white/20 hover:bg-white/20"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        السابق
                      </Button>
                    )}
                    
                    <Button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {currentStep === tutorialSteps.length - 1 ? 'ابدأ الآن' : 'التالي'}
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