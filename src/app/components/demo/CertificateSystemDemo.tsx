/**
 * YieldX Certificate System Demo Component
 * 
 * This component demonstrates all features of the certificate system:
 * - Certificate progress tracking
 * - Certificate generation (Completion & Excellence)
 * - Certificate gallery
 * - Branded search
 * - Progress checkpoint
 * 
 * Use this as a reference implementation or testing ground.
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Award, Trophy, Search, Star, CheckCircle, Zap } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { CertificateSystem } from '@/app/components/certificates/CertificateSystem';
import { CertificateGallery } from '@/app/components/certificates/CertificateGallery';
import { BrandedSearch, BrandedSearchWithResults } from '@/app/components/ui/branded-search';
import { useYieldX } from '@/app/contexts/YieldXContext';
import {
  calculatePerformanceScore,
  shouldReceiveExcellenceCertificate,
  shouldShowProgressCheckpoint
} from '@/app/utils/certificateGenerator';

export function CertificateSystemDemo() {
  const { language, levels, totalXP } = useYieldX();
  const [demoTab, setDemoTab] = useState('overview');

  // Calculate demo stats
  const maxTotalXP = levels.reduce((sum, level) => sum + level.maxXp, 0);
  const completedLevels = levels.filter((l) => l.completed).length;
  const completionPercentage = levels.length > 0 ? (completedLevels / levels.length) * 100 : 0;
  const performanceScore = calculatePerformanceScore(completionPercentage, totalXP, maxTotalXP);
  const isExcellence = shouldReceiveExcellenceCertificate(performanceScore);
  const showCheckpoint = shouldShowProgressCheckpoint(completionPercentage);

  const demoSearchResults = [
    {
      id: 'level-1',
      title: language === 'ar' ? 'المستوى 1: نوع المشروع' : 'Level 1: Project Type',
      description: language === 'ar' ? 'تحديد نوع وطبيعة المشروع' : 'Define project type and nature',
      type: language === 'ar' ? 'مستوى' : 'Level',
      icon: <Star className="w-4 h-4" />
    },
    {
      id: 'cert-1',
      title: language === 'ar' ? 'شهادة إتمام' : 'Completion Certificate',
      description: language === 'ar' ? 'شهادة معتمدة للإنجاز' : 'Official completion credential',
      type: language === 'ar' ? 'شهادة' : 'Certificate',
      icon: <Award className="w-4 h-4" />
    }
  ];

  const t = {
    ar: {
      title: 'عرض توضيحي لنظام الشهادات',
      subtitle: 'استكشف جميع ميزات نظام الشهادات في YieldX',
      overview: 'نظرة عامة',
      features: 'الميزات',
      components: 'المكونات',
      testing: 'الاختبار',
      currentProgress: 'التقدم الحالي',
      completion: 'الإكمال',
      performance: 'الأداء',
      certificateType: 'نوع الشهادة',
      completionCert: 'شهادة إتمام',
      excellenceCert: 'شهادة تميّز',
      checkpointActive: 'نقطة التحقق نشطة',
      certificateLocked: 'الشهادة مقفلة',
      certificateReady: 'الشهادة جاهزة',
      feature1: 'تتبع التقدم الذكي',
      feature1Desc: 'تتبع دقيق للإنجاز والأداء',
      feature2: 'نوعان من الشهادات',
      feature2Desc: 'إتمام وتميّز بناءً على الأداء',
      feature3: 'توليد PDF',
      feature3Desc: 'شهادات احترافية قابلة للتنزيل',
      feature4: 'بحث مميّز',
      feature4Desc: 'بحث ذكي مع هوية YieldX',
      trySearch: 'جرّب البحث',
      viewSystem: 'عرض نظام الشهادات',
      viewGallery: 'عرض المعرض',
    },
    en: {
      title: 'Certificate System Demo',
      subtitle: 'Explore all features of the YieldX certificate system',
      overview: 'Overview',
      features: 'Features',
      components: 'Components',
      testing: 'Testing',
      currentProgress: 'Current Progress',
      completion: 'Completion',
      performance: 'Performance',
      certificateType: 'Certificate Type',
      completionCert: 'Completion Certificate',
      excellenceCert: 'Excellence Certificate',
      checkpointActive: 'Checkpoint Active',
      certificateLocked: 'Certificate Locked',
      certificateReady: 'Certificate Ready',
      feature1: 'Smart Progress Tracking',
      feature1Desc: 'Accurate completion and performance tracking',
      feature2: 'Two Certificate Types',
      feature2Desc: 'Completion and Excellence based on performance',
      feature3: 'PDF Generation',
      feature3Desc: 'Professional downloadable certificates',
      feature4: 'Branded Search',
      feature4Desc: 'Smart search with YieldX identity',
      trySearch: 'Try Search',
      viewSystem: 'View Certificate System',
      viewGallery: 'View Gallery',
    }
  };

  const text = t[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-yellow-500" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              {text.title}
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {text.subtitle}
          </p>
        </motion.div>

        {/* Demo Tabs */}
        <Tabs value={demoTab} onValueChange={setDemoTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">{text.overview}</TabsTrigger>
            <TabsTrigger value="features">{text.features}</TabsTrigger>
            <TabsTrigger value="components">{text.components}</TabsTrigger>
            <TabsTrigger value="testing">{text.testing}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-300 dark:border-blue-600">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{text.completion}</h3>
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {Math.round(completionPercentage)}%
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-300 dark:border-purple-600">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{text.performance}</h3>
                  <Zap className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {performanceScore}%
                </div>
                <Progress value={performanceScore} className="h-2" />
              </Card>

              <Card className={`p-6 ${
                isExcellence
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400 dark:border-yellow-600'
                  : 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-600'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{text.certificateType}</h3>
                  {isExcellence ? (
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Award className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {isExcellence ? text.excellenceCert : text.completionCert}
                </div>
                {isExcellence && (
                  <Badge className="mt-2 bg-yellow-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    90%+
                  </Badge>
                )}
              </Card>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
                  {text.currentProgress}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {language === 'ar' ? 'المستويات المكتملة' : 'Completed Levels'}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {completedLevels}/{levels.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {language === 'ar' ? 'إجمالي النقاط' : 'Total XP'}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {totalXP}/{maxTotalXP}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {language === 'ar' ? 'حالة الشهادة' : 'Certificate Status'}
                    </span>
                    <Badge className={completionPercentage === 100 ? 'bg-green-500' : 'bg-slate-500'}>
                      {completionPercentage === 100 ? text.certificateReady : text.certificateLocked}
                    </Badge>
                  </div>
                  {showCheckpoint && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {language === 'ar' ? 'نقطة التحقق' : 'Checkpoint'}
                      </span>
                      <Badge className="bg-yellow-500">
                        {text.checkpointActive}
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
                  {text.trySearch}
                </h3>
                <BrandedSearch
                  language={language}
                  placeholder={language === 'ar' ? 'ابحث في YieldX...' : 'Search in YieldX...'}
                  onSearch={(query) => console.log('Search:', query)}
                />
              </Card>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: CheckCircle, title: text.feature1, desc: text.feature1Desc, color: 'blue' },
                { icon: Trophy, title: text.feature2, desc: text.feature2Desc, color: 'yellow' },
                { icon: Award, title: text.feature3, desc: text.feature3Desc, color: 'green' },
                { icon: Search, title: text.feature4, desc: text.feature4Desc, color: 'purple' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className={`w-12 h-12 rounded-full bg-${feature.color}-100 dark:bg-${feature.color}-900/20 flex items-center justify-center mb-4`}>
                      <feature.icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {feature.desc}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-4">
                {text.viewSystem}
              </h3>
              <CertificateSystem />
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-4">
                {text.viewGallery}
              </h3>
              <CertificateGallery />
            </Card>
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-4">
                {language === 'ar' ? 'بحث مع النتائج' : 'Search with Results'}
              </h3>
              <BrandedSearchWithResults
                language={language}
                placeholder={language === 'ar' ? 'ابحث...' : 'Search...'}
                results={demoSearchResults}
                onSearch={(query) => console.log('Search:', query)}
                onResultClick={(id) => console.log('Clicked:', id)}
              />
            </Card>

            <Card className="p-6 bg-slate-50 dark:bg-slate-800">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-4">
                {language === 'ar' ? 'معلومات التطوير' : 'Developer Info'}
              </h3>
              <div className="space-y-2 text-sm font-mono text-slate-600 dark:text-slate-300">
                <p>completionPercentage: {completionPercentage}%</p>
                <p>performanceScore: {performanceScore}%</p>
                <p>isExcellence: {isExcellence ? 'true' : 'false'}</p>
                <p>showCheckpoint: {showCheckpoint ? 'true' : 'false'}</p>
                <p>completedLevels: {completedLevels}/{levels.length}</p>
                <p>totalXP: {totalXP}/{maxTotalXP}</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
