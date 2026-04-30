import React from 'react';
import { motion } from 'motion/react';
import {
  Users,
  TrendingUp,
  Package,
  UserPlus,
  Settings,
  BarChart3,
  DollarSign,
  FileText,
  Lock,
  CheckCircle,
  Clock,
  Calendar,
  Target,
  AlertCircle,
  Upload,
  Award,
  Sparkles,
  Eye,
  Layers,
  Building,
  Shield,
  Boxes,
  Grid3x3,
} from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { translations } from '@/app/contexts/translations';
import { Card } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

// Updated for NEW 7-LEVEL SYSTEM (0-7)
const levelIcons = [
  Layers,      // Level 0: Project Type
  Building,    // Level 1: Identity & Ownership
  Shield,      // Level 2: Legal Framework
  Boxes,       // Level 3: Physical Resources
  Users,       // Level 4: Human Resources
  Target,      // Level 5: Market & Strategy
  DollarSign,  // Level 6: Financing & KPIs
  Grid3x3,     // Level 7: BMC & Implementation
];

const levelColors = [
  'from-purple-500 to-pink-500',      // Level 0: Purple/Pink
  'from-purple-500 to-indigo-500',    // Level 1: Purple/Indigo
  'from-blue-500 to-cyan-500',        // Level 2: Blue/Cyan
  'from-green-500 to-emerald-500',    // Level 3: Green/Emerald
  'from-orange-500 to-red-500',       // Level 4: Orange/Red
  'from-pink-500 to-purple-500',      // Level 5: Pink/Purple
  'from-cyan-500 to-blue-500',        // Level 6: Cyan/Blue
  'from-indigo-500 to-purple-500',    // Level 7: Indigo/Purple
];

const getStatusBadge = (status?: string, language: 'ar' | 'en', t: any) => {
  switch (status) {
    case 'not-started':
      return (
        <Badge className="bg-gray-500/20 text-gray-300">
          <AlertCircle className="w-3 h-3 mr-1" />
          {t.levels.statusNotStarted}
        </Badge>
      );
    case 'in-progress':
      return (
        <Badge className="bg-yellow-500/20 text-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          {t.levels.statusInProgress}
        </Badge>
      );
    case 'submitted':
      return (
        <Badge className="bg-blue-500/20 text-blue-300">
          <Upload className="w-3 h-3 mr-1" />
          {t.levels.statusSubmitted}
        </Badge>
      );
    case 'graded':
      return (
        <Badge className="bg-green-500/20 text-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          {t.levels.statusGraded}
        </Badge>
      );
    case 'late':
      return (
        <Badge className="bg-red-500/20 text-red-300">
          <AlertCircle className="w-3 h-3 mr-1" />
          {t.levels.statusLate}
        </Badge>
      );
    default:
      return null;
  }
};

export function EnhancedSpaceMap() {
  const { levels, setCurrentView, user, language } = useYieldX();
  
  // Get translations for current language
  const t = translations[language];

  // Helper function to get translated level title
  const getLevelTitle = (levelId: number) => {
    const titleKey = `level${levelId}Title` as keyof typeof t.levels;
    return t.levels[titleKey] || `Level ${levelId}`;
  };

  // Helper function to get translated objective
  const getLevelObjective = (levelId: number) => {
    const objectiveKey = `level${levelId}Objective` as keyof typeof t.levels;
    return t.levels[objectiveKey] || '';
  };

  // Helper function to get translated deliverable
  const getLevelDeliverable = (levelId: number) => {
    const deliverableKey = `level${levelId}Deliverable` as keyof typeof t.levels;
    return t.levels[deliverableKey] || '';
  };

  const handleLevelClick = (levelId: number, unlocked: boolean) => {
    if (unlocked) {
      setCurrentView(`module-${levelId}`);
    }
  };

  const getUnlockMessage = (level: any, index: number) => {
    if (level.deadline) {
      const deadline = new Date(level.deadline);
      return language === 'ar' ? `سيُفتح بتاريخ: ${deadline.toLocaleDateString('ar-SA')}` : `Will unlock on: ${deadline.toLocaleDateString('en-US')}`;
    }
    if (index > 0) {
      return t.levels.requiresPreviousLevel;
    }
    return t.levels.locked;
  };

  // Calculate if capstone is unlocked (FOR TESTING: Always unlocked)
  const completedLevels = levels.filter(l => l.completed).length;
  const capstoneUnlocked = true; // Changed to always unlock for testing (was: completedLevels >= 6)
  const capstoneProgress = Math.min((completedLevels / 8) * 100, 100); // Total is now 8 levels (0-7)

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Card className="bg-white/90 dark:bg-[#1B1B3A]/60 backdrop-blur-xl border-[#4ECDC4]/30 dark:border-[#4ECDC4]/20 p-8 shadow-2xl">
          <div className="text-center mb-12">
            <motion.h2
              className="text-5xl font-bold text-slate-900 dark:text-white mb-3"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
            >
              {t.dashboard.educationalPath}
            </motion.h2>
            <p className="text-[#4ECDC4] dark:text-[#7FDBCA] text-lg mb-2">
              {t.dashboard.completeBySchedule}
            </p>
            <p className="text-[#5DD9C1] dark:text-[#A8E6CF] text-sm">
              {t.levels.eachLevelDesc}
            </p>
          </div>

          {/* Levels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {levels.map((level, index) => {
              const Icon = levelIcons[index];
              const colorClass = levelColors[index];
              const progress = (level.xp / level.maxXp) * 100;

              return (
                <motion.div
                  key={level.levelId}
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="relative"
                >
                  {/* Connection Line */}
                  {index < levels.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 left-full w-6 h-0.5 bg-gradient-to-r from-[#4ECDC4]/70 dark:from-[#4ECDC4]/50 to-transparent -translate-y-1/2 z-0" />
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="cursor-pointer">
                        <CardContainer className="inter-var w-full h-full">
                          <CardBody className="w-full h-full">
                            <Card
                              className={`p-6 relative overflow-hidden transition-all duration-300 ${
                                level.completed
                                  ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-500/20 dark:to-emerald-500/20 border-green-400 dark:border-green-500/50'
                                  : level.unlocked
                                  ? `bg-gradient-to-br ${colorClass} bg-opacity-20 border-[#4ECDC4]/40 dark:border-white/20 hover:border-[#4ECDC4]/60 dark:hover:border-white/40`
                                  : 'bg-slate-200/70 dark:bg-slate-800/50 border-slate-400 dark:border-slate-700'
                              }`}
                            >
                              {/* Level Number Badge */}
                              <CardItem translateZ="20" className="absolute top-3 right-3">
                                <div
                                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-sm font-bold shadow-md`}
                                >
                                  {level.levelId}
                                </div>
                              </CardItem>

                              {/* Lock/Check Icon */}
                              <CardItem translateZ="80" className="mb-4">
                                {level.completed ? (
                                  <div className="bg-green-500 rounded-full p-3 inline-block shadow-lg">
                                    <CheckCircle className="w-8 h-8 text-white" />
                                  </div>
                                ) : level.unlocked ? (
                                  <div className={`bg-gradient-to-br ${colorClass} rounded-full p-3 inline-block shadow-lg`}>
                                    <Icon className="w-8 h-8 text-white" />
                                  </div>
                                ) : (
                                  <div className="bg-slate-400 dark:bg-slate-700 rounded-full p-3 inline-block">
                                    <Lock className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                                  </div>
                                )}
                              </CardItem>

                              {/* Title */}
                              <CardItem translateZ="50" as="h3" className={`text-lg font-bold mb-2 ${level.unlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                {getLevelTitle(level.levelId)}
                              </CardItem>

                              {/* Status Badge */}
                              <CardItem translateZ="40" className="mb-3">
                                {level.unlocked ? (
                                  getStatusBadge(level.submissionStatus, language, t)
                                ) : (
                                  <Badge className="bg-slate-400 dark:bg-slate-700 text-slate-700 dark:text-slate-400">
                                    <Lock className="w-3 h-3 mr-1" />
                                    {t.levels.locked}
                                  </Badge>
                                )}
                              </CardItem>

                              {/* Progress Bar */}
                              {level.unlocked && (
                                <CardItem translateZ="30" className="w-full">
                                  <div className="mb-2">
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className="text-[#4ECDC4] dark:text-[#7FDBCA]">{t.levels.progress}</span>
                                      <span className="text-slate-900 dark:text-white font-semibold">
                                        {level.xp} / {level.maxXp} XP
                                      </span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                  </div>

                                  {/* Deadline */}
                                  {level.deadline && (
                                    <div className="flex items-center gap-2 text-xs text-[#4ECDC4] dark:text-[#7FDBCA] mt-2">
                                      <Calendar className="w-3 h-3" />
                                      <span>{t.levels.deadlineText} {new Date(level.deadline).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                                    </div>
                                  )}
                                </CardItem>
                              )}

                              {/* Locked Message */}
                              {!level.unlocked && (
                                <CardItem translateZ="20" as="p" className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                  {getUnlockMessage(level, index)}
                                </CardItem>
                              )}

                              {/* Action Button - Preview for Locked Levels */}
                              {!level.unlocked && (
                                <CardItem translateZ="60" className="w-full">
                                  <div className="w-full mt-4 px-4 py-2 text-sm font-medium border border-[#4ECDC4]/40 text-[#4ECDC4] rounded-md bg-transparent hover:bg-[#4ECDC4]/10 dark:border-[#4ECDC4]/30 dark:text-[#7FDBCA] dark:hover:bg-[#4ECDC4]/20 flex items-center justify-center gap-2">
                                    <Eye className="w-4 h-4" />
                                    {t.levels.previewContent}
                                  </div>
                                </CardItem>
                              )}

                              {/* Action Button - Start for Unlocked Levels */}
                              {level.unlocked && (
                                <CardItem translateZ="60" className="w-full">
                                  <Button
                                    size="sm"
                                    className={`w-full mt-4 ${
                                      level.completed
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : `bg-gradient-to-r ${colorClass} hover:opacity-90`
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLevelClick(level.levelId, level.unlocked);
                                    }}
                                  >
                                    {level.submissionStatus === 'graded'
                                      ? t.levels.viewGrading
                                      : level.submissionStatus === 'submitted'
                                      ? t.levels.viewSubmission
                                      : level.submissionStatus === 'in-progress'
                                      ? t.levels.continue
                                      : t.levels.start}
                                  </Button>
                                </CardItem>
                              )}
                            </Card>
                          </CardBody>
                        </CardContainer>
                      </div>
                    </DialogTrigger>

                    {/* Level Details Dialog */}
                    <DialogContent className="bg-white dark:bg-slate-900 border-[#4ECDC4]/40 dark:border-[#4ECDC4]/50 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-slate-900 dark:text-white text-2xl flex items-center gap-3">
                          <div className={`bg-gradient-to-br ${colorClass} rounded-full p-2`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          {getLevelTitle(level.levelId)}
                        </DialogTitle>
                        <DialogDescription className="text-[#4ECDC4] dark:text-[#7FDBCA]">
                          {language === 'ar' ? `المستوى ${level.levelId} من 8` : `Level ${level.levelId} of 8`}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6 mt-4">
                        {/* Locked Level Preview Banner */}
                        {!level.unlocked && (
                          <div className="bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 border-2 border-amber-400 dark:border-amber-500/50 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="bg-amber-500 rounded-full p-2">
                                <Eye className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="text-amber-900 dark:text-amber-200 font-bold text-lg">
                                  {language === 'ar' ? '👁️ وضع المعاينة' : '👁️ Preview Mode'}
                                </h4>
                                <p className="text-amber-800 dark:text-amber-300 text-sm">
                                  {language === 'ar' 
                                    ? 'هذا المستوى مقفل حالياً. يمكنك معاينة المحتوى فقط.' 
                                    : 'This level is currently locked. You can only preview the content.'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3 text-sm text-amber-800 dark:text-amber-300">
                              <Lock className="w-4 h-4" />
                              <span className="font-medium">
                                {getUnlockMessage(level, index)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Objective */}
                        {level.objective && (
                          <div className="bg-blue-100 dark:bg-blue-500/10 border border-blue-400 dark:border-blue-500/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              <h4 className="text-slate-900 dark:text-white font-semibold">{t.levels.objective}</h4>
                            </div>
                            <p className="text-blue-800 dark:text-blue-200 text-sm">{level.objective}</p>
                          </div>
                        )}

                        {/* Deliverable */}
                        {level.deliverable && (
                          <div className="bg-[#4ECDC4]/10 dark:bg-[#4ECDC4]/10 border border-[#4ECDC4]/40 dark:border-[#4ECDC4]/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Upload className="w-5 h-5 text-[#4ECDC4] dark:text-[#4ECDC4]" />
                              <h4 className="text-slate-900 dark:text-white font-semibold">{t.levels.deliverableTitle}</h4>
                            </div>
                            <p className="text-[#1B1B3A] dark:text-[#7FDBCA] text-sm">{level.deliverable}</p>
                          </div>
                        )}

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <Card className="bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 p-4">
                            <div className="text-[#4ECDC4] dark:text-[#7FDBCA] text-sm mb-1">{t.levels.pointsLabel}</div>
                            <div className="text-slate-900 dark:text-white text-2xl font-bold">
                              {level.xp} / {level.maxXp}
                            </div>
                          </Card>

                          <Card className="bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 p-4">
                            <div className="text-[#4ECDC4] dark:text-[#7FDBCA] text-sm mb-1">{t.levels.attemptsLabel}</div>
                            <div className="text-slate-900 dark:text-white text-2xl font-bold">
                              {level.currentAttempts || 0} / {level.maxAttempts || 3}
                            </div>
                          </Card>
                        </div>

                        {/* Deadline Info */}
                        {level.deadline && (
                          <Card className="bg-yellow-100 dark:bg-yellow-500/10 border-yellow-400 dark:border-yellow-500/30 p-4">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                              <div>
                                <div className="text-yellow-800 dark:text-yellow-300 font-semibold">{t.levels.deadlineTitle}</div>
                                <div className="text-yellow-700 dark:text-yellow-200 text-sm">
                                  {new Date(level.deadline).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                </div>
                              </div>
                            </div>
                          </Card>
                        )}

                        {/* Feedback (if graded) */}
                        {level.feedback && (
                          <Card className="bg-green-100 dark:bg-green-500/10 border-green-400 dark:border-green-500/30 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                              <h4 className="text-slate-900 dark:text-white font-semibold">{t.levels.teacherFeedbackTitle}</h4>
                            </div>
                            <p className="text-green-800 dark:text-green-200 text-sm">{level.feedback}</p>
                            {level.grade && (
                              <div className="mt-2 text-green-700 dark:text-green-300 font-semibold">
                                {t.levels.gradeLabel}: {level.grade}%
                              </div>
                            )}
                          </Card>
                        )}

                        {/* Action Buttons */}
                        {level.unlocked && (
                          <div className="flex gap-3">
                            <Button
                              className={`flex-1 ${
                                level.completed
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : `bg-gradient-to-r ${colorClass} hover:opacity-90`
                              }`}
                              onClick={() => handleLevelClick(level.levelId, level.unlocked)}
                            >
                              {level.submissionStatus === 'graded'
                                ? t.levels.viewFullGrading
                                : level.submissionStatus === 'submitted'
                                ? t.levels.viewSubmission
                                : level.submissionStatus === 'in-progress'
                                ? t.levels.continueWork
                                : t.levels.startLevel}
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </motion.div>
              );
            })}

            {/* CAPSTONE PROJECT: Business Plan Wizard */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="md:col-span-2 lg:col-span-4 relative mt-8"
            >
              {/* Decorative Connection Line */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 w-0.5 h-8 bg-gradient-to-b from-[#4ECDC4]/70 to-transparent" />
              
              <motion.div
                whileHover={capstoneUnlocked ? { scale: 1.02, y: -5 } : {}}
                className={`relative ${capstoneUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                onClick={() => capstoneUnlocked && setCurrentView('business-plan')}
              >
                <Card
                  className={`p-8 relative overflow-hidden transition-all duration-500 border-2 ${
                    capstoneUnlocked
                      ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20 border-amber-400 dark:border-amber-500/50 hover:border-amber-500 dark:hover:border-amber-400 shadow-2xl hover:shadow-amber-500/20'
                      : 'bg-slate-200/70 dark:bg-slate-800/50 border-slate-400 dark:border-slate-700'
                  }`}
                >
                  {/* Sparkle Effect for Unlocked State */}
                  {capstoneUnlocked && (
                    <>
                      <div className="absolute top-4 right-4 animate-pulse">
                        <Sparkles className="w-6 h-6 text-amber-500" />
                      </div>
                      <div className="absolute top-4 left-4 animate-pulse delay-150">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div className="absolute bottom-4 right-1/4 animate-pulse delay-300">
                        <Sparkles className="w-4 h-4 text-orange-500" />
                      </div>
                    </>
                  )}

                  {/* Special Badge */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2">
                    <Badge 
                      className={`px-4 py-1.5 text-sm font-bold ${
                        capstoneUnlocked
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                          : 'bg-slate-500 text-slate-200'
                      }`}
                    >
                      <Award className="w-4 h-4 mr-2" />
                      {t.levels.finalProjectBadge}
                    </Badge>
                  </div>

                  <div className="text-center mt-12">
                    {/* Icon */}
                    <div className="mb-6 flex justify-center">
                      {capstoneUnlocked ? (
                        <motion.div
                          className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-full p-6 inline-block shadow-2xl"
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <FileText className="w-16 h-16 text-white" />
                        </motion.div>
                      ) : (
                        <div className="bg-slate-400 dark:bg-slate-700 rounded-full p-6 inline-block">
                          <Lock className="w-16 h-16 text-slate-600 dark:text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className={`text-3xl font-bold mb-4 ${
                      capstoneUnlocked 
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400' 
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {t.levels.capstoneFullTitle}
                    </h3>

                    {/* Description */}
                    <p className={`text-lg mb-6 max-w-3xl mx-auto ${
                      capstoneUnlocked
                        ? 'text-amber-800 dark:text-amber-200'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {capstoneUnlocked
                        ? t.levels.capstoneDesc
                        : t.levels.capstoneLocked
                      }
                    </p>

                    {/* Progress Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-2xl mx-auto">
                      <Card className={`p-4 ${
                        capstoneUnlocked
                          ? 'bg-white/60 dark:bg-slate-900/40 border-amber-300 dark:border-amber-600/30'
                          : 'bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700'
                      }`}>
                        <div className={`text-sm mb-1 ${capstoneUnlocked ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>
                          {t.levels.completedLevelsLabel}
                        </div>
                        <div className={`text-2xl font-bold ${capstoneUnlocked ? 'text-amber-700 dark:text-amber-300' : 'text-slate-600 dark:text-slate-400'}`}>
                          {completedLevels} / 8
                        </div>
                      </Card>

                      <Card className={`p-4 ${
                        capstoneUnlocked
                          ? 'bg-white/60 dark:bg-slate-900/40 border-amber-300 dark:border-amber-600/30'
                          : 'bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700'
                      }`}>
                        <div className={`text-sm mb-1 ${capstoneUnlocked ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>
                          {t.levels.progressLabel}
                        </div>
                        <div className={`text-2xl font-bold ${capstoneUnlocked ? 'text-amber-700 dark:text-amber-300' : 'text-slate-600 dark:text-slate-400'}`}>
                          {Math.round(capstoneProgress)}%
                        </div>
                      </Card>

                      <Card className={`p-4 ${
                        capstoneUnlocked
                          ? 'bg-white/60 dark:bg-slate-900/40 border-amber-300 dark:border-amber-600/30'
                          : 'bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700'
                      }`}>
                        <div className={`text-sm mb-1 ${capstoneUnlocked ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>
                          {t.levels.sectionsLabel}
                        </div>
                        <div className={`text-2xl font-bold ${capstoneUnlocked ? 'text-amber-700 dark:text-amber-300' : 'text-slate-600 dark:text-slate-400'}`}>
                          {t.levels.sectionsNumber}
                        </div>
                      </Card>
                    </div>

                    {/* Progress Bar */}
                    <div className="max-w-2xl mx-auto mb-6">
                      <Progress 
                        value={capstoneProgress} 
                        className={`h-3 ${capstoneUnlocked ? 'bg-amber-200 dark:bg-amber-900/30' : ''}`}
                      />
                    </div>

                    {/* Features List */}
                    {capstoneUnlocked && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 max-w-4xl mx-auto text-sm">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                          <CheckCircle className="w-4 h-4" />
                          <span>{t.levels.featureProjectInfo}</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                          <CheckCircle className="w-4 h-4" />
                          <span>{t.levels.featureSWOT}</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                          <CheckCircle className="w-4 h-4" />
                          <span>{t.levels.featureMarketAnalysis}</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                          <CheckCircle className="w-4 h-4" />
                          <span>{t.levels.featureFinancialPlanning}</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                          <CheckCircle className="w-4 h-4" />
                          <span>{t.levels.featureFinancialTables}</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                          <CheckCircle className="w-4 h-4" />
                          <span>{t.levels.featureExcelExport}</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                          <CheckCircle className="w-4 h-4" />
                          <span>{t.levels.featureAutoCalculations}</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                          <CheckCircle className="w-4 h-4" />
                          <span>{t.levels.featureProfessionalTemplates}</span>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      size="lg"
                      disabled={!capstoneUnlocked}
                      className={`text-lg px-8 py-6 ${
                        capstoneUnlocked
                          ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white shadow-xl hover:shadow-2xl'
                          : 'bg-slate-400 dark:bg-slate-700 text-slate-200 cursor-not-allowed'
                      }`}
                    >
                      {capstoneUnlocked ? (
                        <>
                          <FileText className="w-6 h-6 mr-2" />
                          {t.levels.startComprehensiveStudy}
                          <Sparkles className="w-5 h-5 ml-2" />
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 mr-2" />
                          {language === 'ar' ? `مقفل - أكمل ${6 - completedLevels} مستويات إضافية` : `Locked - Complete ${6 - completedLevels} more levels`}
                        </>
                      )}
                    </Button>

                    {/* Unlock Hint */}
                    {!capstoneUnlocked && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                        {t.levels.unlockTip}
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </div>

          {/* Helper Text */}
          <div className="mt-8 text-center">
            <p className="text-[#4ECDC4] dark:text-[#7FDBCA] text-sm">
              {t.levels.helperText}
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}