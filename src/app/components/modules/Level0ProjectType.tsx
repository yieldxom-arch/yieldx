import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sprout, Factory, ShoppingBag, Wrench, Check, ArrowLeft } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import type { ProjectType } from '@/app/contexts/YieldXContext';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

export function Level0ProjectType() {
  const { setProjectType, setCurrentView, projectTypeData, language, theme } = useYieldX();
  const [selectedType, setSelectedType] = useState<ProjectType | null>(projectTypeData?.type || null);
  const [customProjectName, setCustomProjectName] = useState<string>(projectTypeData?.customName || '');

  const isRTL = language === 'ar';
  const isDark = theme === 'dark';

  const projectTypes = [
    {
      type: 'agricultural' as ProjectType,
      icon: <Sprout className="w-12 h-12" />,
      titleAr: 'زراعي',
      titleEn: 'Agricultural',
      examplesAr: ['مزارع', 'دواجن', 'تربية المواشي', 'أسماك', 'نحل', 'أخرى'],
      examplesEn: ['Farms', 'Poultry', 'Livestock Farming', 'Fish', 'Bees', 'Other'],
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-500/20 to-emerald-600/20',
      borderColor: 'border-green-500/50',
    },
    {
      type: 'industrial' as ProjectType,
      icon: <Factory className="w-12 h-12" />,
      titleAr: 'صناعي',
      titleEn: 'Industrial',
      examplesAr: ['تصنيع', 'تجميع', 'تحويل', 'تعبئة', 'أخرى'],
      examplesEn: ['Manufacturing', 'Assembly', 'Processing', 'Packaging', 'Other'],
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'from-blue-500/20 to-cyan-600/20',
      borderColor: 'border-blue-500/50',
    },
    {
      type: 'commercial' as ProjectType,
      icon: <ShoppingBag className="w-12 h-12" />,
      titleAr: 'تجاري',
      titleEn: 'Commercial',
      examplesAr: ['تنظيم المعارض والمؤتمرات', 'تجارة جملة', 'تجارة تجزئة', 'مستودعات', 'أخرى'],
      examplesEn: ['Event & Conference Organization', 'Wholesale', 'Retail', 'Warehouses', 'Other'],
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-500/20 to-pink-600/20',
      borderColor: 'border-purple-500/50',
    },
    {
      type: 'service' as ProjectType,
      icon: <Wrench className="w-12 h-12" />,
      titleAr: 'خدمي',
      titleEn: 'Service',
      examplesAr: ['مشاريع تقنية (تطبيقات، مواقع، تسويق رقمي)', 'استشارات', 'صيانة', 'تعليم', 'أخرى'],
      examplesEn: ['Technology Projects (Apps, Websites, Digital Marketing)', 'Consulting', 'Maintenance', 'Education', 'Other'],
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-500/20 to-red-600/20',
      borderColor: 'border-orange-500/50',
    },
  ];

  const handleSelectType = (type: ProjectType) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType) {
      setProjectType(selectedType, customProjectName);
      // Navigate directly to Level 1 (Identity & Ownership)
      setCurrentView('module-1');
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100'
    }`}>
      {/* Animated Background Stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${isDark ? 'bg-white' : 'bg-purple-400'}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Back to Dashboard Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            onClick={() => setCurrentView('space-map')}
            variant="ghost"
            className={`${
              isDark 
                ? 'text-purple-200 hover:text-white hover:bg-purple-500/20' 
                : 'text-purple-700 hover:text-purple-900 hover:bg-purple-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isRTL ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-purple-900'
          }`}>
            {isRTL ? 'ما هو نوع مشروعك؟' : 'What is Your Project Type?'}
          </h1>
          <p className={`text-lg ${
            isDark ? 'text-purple-200' : 'text-purple-700'
          }`}>
            {isRTL
              ? 'اختر نوع المشروع الذي تخطط لإنشائه. سيساعدنا هذا على تخصيص الأسئلة والنماذج المناسبة لك.'
              : 'Choose the type of project you plan to create. This will help us customize the questions and templates for you.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {projectTypes.map((projectType, index) => (
            <motion.div
              key={projectType.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`relative p-6 cursor-pointer transition-all duration-300 bg-gradient-to-br ${projectType.bgColor} border-2 ${
                  selectedType === projectType.type
                    ? projectType.borderColor + ' shadow-2xl scale-105'
                    : isDark 
                      ? 'border-white/10 hover:border-white/30 hover:scale-102' 
                      : 'border-purple-200 hover:border-purple-400 hover:scale-102'
                } backdrop-blur-sm ${isDark ? '' : 'bg-white/50'}`}
                onClick={() => handleSelectType(projectType.type)}
              >
                {/* Selection Indicator */}
                {selectedType === projectType.type && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}

                {/* Icon */}
                <div className={`mb-4 text-transparent bg-clip-text bg-gradient-to-r ${projectType.color}`}>
                  {projectType.icon}
                </div>

                {/* Title */}
                <h3 className={`text-2xl font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-purple-900'
                }`}>
                  {isRTL ? projectType.titleAr : projectType.titleEn}
                </h3>

                {/* Examples */}
                <div className="space-y-1 mb-3">
                  {(isRTL ? projectType.examplesAr : projectType.examplesEn).map((example, idx) => (
                    <div key={idx} className={`flex items-center gap-2 text-sm ${
                      isDark ? 'text-purple-200' : 'text-purple-700'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        isDark ? 'bg-purple-400' : 'bg-purple-500'
                      }`}></div>
                      <span>{example}</span>
                    </div>
                  ))}
                </div>

                {/* Other Field */}
                {selectedType === projectType.type && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ delay: 0.2 }}
                    className="mt-3 pt-3 border-t"
                    style={{
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(139,92,246,0.2)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label className={`block text-xs font-semibold mb-2 ${
                      isDark ? 'text-purple-200' : 'text-purple-700'
                    }`}>
                      {isRTL ? 'أخرى (حدد مشروعك):' : 'Other (Specify your project):'}
                    </label>
                    <input
                      type="text"
                      value={customProjectName}
                      onChange={(e) => setCustomProjectName(e.target.value)}
                      placeholder={isRTL ? 'مثال: مشروع خاص...' : 'Example: Custom project...'}
                      className={`w-full px-3 py-2 rounded-lg text-sm border ${
                        isDark 
                          ? 'bg-slate-800/50 border-slate-600 text-white placeholder-slate-400' 
                          : 'bg-white border-purple-300 text-slate-900 placeholder-slate-400'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: selectedType ? 1 : 0.5 }}
          className="flex justify-center"
        >
          <Button
            onClick={handleContinue}
            disabled={!selectedType}
            className={`px-12 py-6 text-xl font-bold rounded-2xl transition-all duration-300 ${
              selectedType
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-2xl hover:shadow-purple-500/50'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            {isRTL ? 'متابعة إلى المستوى 1' : 'Continue to Level 1'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}