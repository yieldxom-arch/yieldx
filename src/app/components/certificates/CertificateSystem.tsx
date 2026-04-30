import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Download, Trophy, Star, CheckCircle, Zap, Target, Calendar } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Separator } from '@/app/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import {
  generateCertificatePDF,
  generateCertificateId,
  calculatePerformanceScore,
  shouldReceiveExcellenceCertificate,
  shouldShowProgressCheckpoint,
  type CertificateData
} from '@/app/utils/certificateGenerator';

export function CertificateSystem() {
  const { user, levels, moduleData, totalXP, language, activeProject } = useYieldX();
  const [showCertificateDialog, setShowCertificateDialog] = useState(false);
  const [userName, setUserName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCheckpoint, setShowCheckpoint] = useState(false);

  const maxTotalXP = levels.reduce((sum, level) => sum + level.maxXp, 0);
  const completedLevels = levels.filter((l) => l.completed).length;
  const completionPercentage = levels.length > 0 ? (completedLevels / levels.length) * 100 : 0;

  // Calculate performance score
  const performanceScore = calculatePerformanceScore(
    completionPercentage,
    totalXP,
    maxTotalXP
  );

  const isFullyCompleted = completionPercentage === 100;
  const isExcellence = shouldReceiveExcellenceCertificate(performanceScore);
  const atCheckpoint = shouldShowProgressCheckpoint(completionPercentage);

  // Show checkpoint notification
  useEffect(() => {
    if (atCheckpoint && !showCheckpoint) {
      setShowCheckpoint(true);
    }
  }, [atCheckpoint]);

  const handleGenerateCertificate = async () => {
    if (!userName.trim()) {
      alert(language === 'ar' ? 'الرجاء إدخال اسمك' : 'Please enter your name');
      return;
    }

    setIsGenerating(true);

    try {
      const certificateData: CertificateData = {
        userName: userName.trim(),
        projectTitle: activeProject?.name || (language === 'ar' ? 'مشروعي' : 'My Project'),
        completionDate: new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        performanceScore,
        certificateId: generateCertificateId(),
        certificateType: isExcellence ? 'excellence' : 'completion'
      };

      // Save certificate to localStorage for verification
      const savedCertificates = JSON.parse(localStorage.getItem('yieldx_certificates') || '[]');
      savedCertificates.push({
        ...certificateData,
        userId: user?.id,
        generatedAt: new Date().toISOString()
      });
      localStorage.setItem('yieldx_certificates', JSON.stringify(savedCertificates));

      // Generate PDF
      await generateCertificatePDF(certificateData, language);

      // Close dialog
      setShowCertificateDialog(false);
      
      // Show success message
      alert(language === 'ar' 
        ? '🎉 تم إنشاء الشهادة بنجاح! تحقق من التنزيلات.'
        : '🎉 Certificate generated successfully! Check your downloads.');
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert(language === 'ar' 
        ? 'حدث خطأ أثناء إنشاء الشهادة. حاول مرة أخرى.'
        : 'Error generating certificate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const t = {
    ar: {
      certificateSystem: 'نظام الشهادات',
      yourProgress: 'تقدمك الحالي',
      completion: 'الإنجاز',
      performance: 'الأداء',
      unlockCertificate: 'فتح الشهادة',
      certificateLocked: 'الشهادة مقفلة',
      certificateUnlocked: 'الشهادة متاحة!',
      completionRequired: 'أكمل جميع المهام المطلوبة لفتح الشهادة',
      generateCertificate: 'إنشاء الشهادة',
      downloadCertificate: 'تحميل الشهادة',
      enterName: 'أدخل اسمك',
      namePlaceholder: 'الاسم الكامل',
      certificateType: 'نوع الشهادة',
      completionCertificate: 'شهادة إتمام',
      excellenceCertificate: 'شهادة تميّز',
      excellenceDesc: 'تُمنح للأداء المتميز (90%+)',
      completionDesc: 'تُمنح عند إكمال جميع المتطلبات',
      checkpointTitle: '🎯 أنت قريب جداً!',
      checkpointDesc: 'أكمل الخطوات المتبقية لفتح شهادتك',
      remainingSteps: 'خطوات متبقية',
      keepGoing: 'استمر في التقدم!',
      closeCheckpoint: 'حسناً، شكراً!',
      projectName: 'اسم المشروع',
      completionDate: 'تاريخ الإكمال',
      certificateId: 'رقم الشهادة',
      generating: 'جاري الإنشاء...',
      levelsCompleted: 'مستويات مكتملة',
      totalPoints: 'إجمالي النقاط',
      achievementUnlocked: 'إنجاز مفتوح',
      readyToGenerate: 'جاهز لإنشاء الشهادة'
    },
    en: {
      certificateSystem: 'Certificate System',
      yourProgress: 'Your Progress',
      completion: 'Completion',
      performance: 'Performance',
      unlockCertificate: 'Unlock Certificate',
      certificateLocked: 'Certificate Locked',
      certificateUnlocked: 'Certificate Unlocked!',
      completionRequired: 'Complete all required tasks to unlock your certificate',
      generateCertificate: 'Generate Certificate',
      downloadCertificate: 'Download Certificate',
      enterName: 'Enter Your Name',
      namePlaceholder: 'Full Name',
      certificateType: 'Certificate Type',
      completionCertificate: 'Completion Certificate',
      excellenceCertificate: 'Excellence Certificate',
      excellenceDesc: 'Awarded for exceptional performance (90%+)',
      completionDesc: 'Awarded upon completing all requirements',
      checkpointTitle: '🎯 You\'re Almost There!',
      checkpointDesc: 'Complete the remaining steps to unlock your certificate',
      remainingSteps: 'Steps Remaining',
      keepGoing: 'Keep Going!',
      closeCheckpoint: 'Got it, Thanks!',
      projectName: 'Project Name',
      completionDate: 'Completion Date',
      certificateId: 'Certificate ID',
      generating: 'Generating...',
      levelsCompleted: 'Levels Completed',
      totalPoints: 'Total Points',
      achievementUnlocked: 'Achievement Unlocked',
      readyToGenerate: 'Ready to Generate Certificate'
    }
  };

  const text = t[language];

  return (
    <>
      <Card className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 dark:from-violet-500/10 dark:to-purple-500/10 border-violet-300 dark:border-violet-500/30 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              {isFullyCompleted ? (
                <Trophy className="w-6 h-6 text-white" />
              ) : (
                <Award className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {text.certificateSystem}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {isFullyCompleted ? text.certificateUnlocked : text.completionRequired}
              </p>
            </div>
          </div>

          {isFullyCompleted && (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="w-4 h-4 mr-1" />
              {text.achievementUnlocked}
            </Badge>
          )}
        </div>

        <Separator className="my-6 bg-slate-200 dark:bg-white/10" />

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-300">{text.completion}</span>
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {Math.round(completionPercentage)}%
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2 mt-2" />
          </Card>

          <Card className="bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-300">{text.performance}</span>
              <Zap className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {performanceScore}%
              </span>
              {isExcellence && (
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              )}
            </div>
            <Progress value={performanceScore} className="h-2 mt-2" />
          </Card>

          <Card className="bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-300">{text.levelsCompleted}</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {completedLevels}/{levels.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {totalXP} {text.totalPoints}
            </p>
          </Card>
        </div>

        {/* Certificate Type Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className={`p-4 border-2 transition-all ${
            isExcellence
              ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400 dark:border-yellow-600'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <Trophy className={`w-6 h-6 ${isExcellence ? 'text-yellow-500' : 'text-slate-400'}`} />
              <h3 className="font-bold text-slate-900 dark:text-white">
                {text.excellenceCertificate}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
              {text.excellenceDesc}
            </p>
            {isExcellence && (
              <Badge className="bg-yellow-500 text-white">
                <Star className="w-3 h-3 mr-1" />
                {language === 'ar' ? 'مؤهل' : 'Qualified'}
              </Badge>
            )}
          </Card>

          <Card className={`p-4 border-2 transition-all ${
            isFullyCompleted && !isExcellence
              ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-400 dark:border-blue-600'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <Award className={`w-6 h-6 ${isFullyCompleted ? 'text-blue-500' : 'text-slate-400'}`} />
              <h3 className="font-bold text-slate-900 dark:text-white">
                {text.completionCertificate}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
              {text.completionDesc}
            </p>
            {isFullyCompleted && (
              <Badge className="bg-blue-500 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                {language === 'ar' ? 'مؤهل' : 'Qualified'}
              </Badge>
            )}
          </Card>
        </div>

        {/* Generate Certificate Button */}
        <Button
          onClick={() => setShowCertificateDialog(true)}
          disabled={!isFullyCompleted}
          className={`w-full py-6 text-lg font-bold ${
            isFullyCompleted
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700'
              : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
          }`}
          size="lg"
        >
          <Download className="w-5 h-5 mr-2" />
          {isFullyCompleted ? text.downloadCertificate : text.certificateLocked}
        </Button>

        {!isFullyCompleted && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-3">
            {Math.round(100 - completionPercentage)}% {text.remainingSteps}
          </p>
        )}
      </Card>

      {/* Certificate Generation Dialog */}
      <Dialog open={showCertificateDialog} onOpenChange={setShowCertificateDialog}>
        <DialogContent className="bg-white dark:bg-slate-900 border-violet-200 dark:border-violet-500/30">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white text-2xl flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              {text.generateCertificate}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-300">
              {isExcellence ? text.excellenceCertificate : text.completionCertificate}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="userName" className="text-slate-900 dark:text-white">
                {text.enterName}
              </Label>
              <Input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder={text.namePlaceholder}
                className="mt-2"
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">{text.projectName}:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {activeProject?.name || (language === 'ar' ? 'مشروعي' : 'My Project')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">{text.performance}:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {performanceScore}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">{text.certificateType}:</span>
                <Badge className={isExcellence ? 'bg-yellow-500' : 'bg-blue-500'}>
                  {isExcellence ? text.excellenceCertificate : text.completionCertificate}
                </Badge>
              </div>
            </div>

            <Button
              onClick={handleGenerateCertificate}
              disabled={isGenerating || !userName.trim()}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full"
                  />
                  {text.generating}
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  {text.downloadCertificate}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Progress Checkpoint Dialog */}
      <AnimatePresence>
        {showCheckpoint && (
          <Dialog open={showCheckpoint} onOpenChange={setShowCheckpoint}>
            <DialogContent className="bg-gradient-to-br from-violet-500 to-purple-600 border-none text-white">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-white text-3xl text-center">
                    {text.checkpointTitle}
                  </DialogTitle>
                  <DialogDescription className="text-violet-100 text-center text-lg mt-2">
                    {text.checkpointDesc}
                  </DialogDescription>
                </DialogHeader>

                <div className="my-8">
                  <div className="text-center mb-4">
                    <div className="inline-block bg-white/20 rounded-full px-6 py-3">
                      <span className="text-6xl font-bold text-white">
                        {Math.round(completionPercentage)}%
                      </span>
                    </div>
                  </div>
                  <Progress value={completionPercentage} className="h-3 bg-white/20" />
                  <p className="text-center text-violet-100 mt-3">
                    {Math.round(100 - completionPercentage)}% {text.remainingSteps}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 mb-6">
                  <Zap className="w-6 h-6 text-yellow-300" />
                  <span className="text-xl font-semibold">{text.keepGoing}</span>
                  <Zap className="w-6 h-6 text-yellow-300" />
                </div>

                <Button
                  onClick={() => setShowCheckpoint(false)}
                  className="w-full bg-white text-violet-600 hover:bg-violet-50"
                  size="lg"
                >
                  {text.closeCheckpoint}
                </Button>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
