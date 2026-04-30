import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Award, Trophy, Lock, Zap, Star, Target, Users, TrendingUp, Sparkles, User, Crown, CheckCircle } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Card } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';

export function BadgesAndAchievements() {
  const { badges, achievements, user, language } = useYieldX();
  const [selectedTab, setSelectedTab] = useState<'badges' | 'achievements'>('badges');
  const isTeacher = user?.role === 'lecturer';

  const earnedBadges = badges.filter((b) => b.earnedAt);
  const unlockedAchievements = achievements.filter((a) => a.unlocked);

  // Translations
  const t = {
    badgesAndAchievements: language === 'ar' ? 'الشارات والإنجازات' : 'Badges & Achievements',
    badges: language === 'ar' ? 'الشارات' : 'Badges',
    achievements: language === 'ar' ? 'الإنجازات' : 'Achievements',
    myBadges: language === 'ar' ? 'شاراتي' : 'My Badges',
    myAchievements: language === 'ar' ? 'إنجازاتي' : 'My Achievements',
    studentBadges: language === 'ar' ? 'شارات الطلاب' : 'Student Badges',
    earned: language === 'ar' ? 'حصلت عليها' : 'Earned',
    locked: language === 'ar' ? 'مقفلة' : 'Locked',
    noBadges: language === 'ar' ? 'لا توجد شارات بعد' : 'No badges yet',
    noBadgesDesc: language === 'ar' ? 'ستحصل على شارات عند إكمال المستويات والإنجازات' : 'You will earn badges by completing levels and achievements',
    noAchievements: language === 'ar' ? 'لا توجد إنجازات بعد' : 'No achievements yet',
    noAchievementsDesc: language === 'ar' ? 'ابدأ العمل على المستويات لفتح الإنجازات' : 'Start working on levels to unlock achievements',
    progress: language === 'ar' ? 'التقدم' : 'Progress',
    students: language === 'ar' ? 'طالب' : 'students',
    viewDetails: language === 'ar' ? 'عرض التفاصيل' : 'View Details',
    close: language === 'ar' ? 'إغلاق' : 'Close',
    totalEarned: language === 'ar' ? 'إجمالي المكتسبة' : 'Total Earned',
    unlocked: language === 'ar' ? 'مفتوحة' : 'Unlocked',
  };

  // Empty arrays for new teachers/students
  const studentBadgeStats: Array<any> = [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative bg-gradient-to-br from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 border border-yellow-500/30"
        >
          <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          {(earnedBadges.length > 0 || unlockedAchievements.length > 0) && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
              {earnedBadges.length + unlockedAchievements.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-[#1B1B3A]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            {t.badgesAndAchievements}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 dark:text-gray-400">
            {isTeacher ? t.studentBadges : (selectedTab === 'badges' ? t.myBadges : t.myAchievements)}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        {!isTeacher && (
          <div className="flex gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <Button
              variant={selectedTab === 'badges' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('badges')}
              className={selectedTab === 'badges' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' : ''}
            >
              <Award className="w-4 h-4 mr-2" />
              {t.badges}
            </Button>
            <Button
              variant={selectedTab === 'achievements' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('achievements')}
              className={selectedTab === 'achievements' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' : ''}
            >
              <Trophy className="w-4 h-4 mr-2" />
              {t.achievements}
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isTeacher ? (
            // Teacher View
            studentBadgeStats.length === 0 ? (
              <div className="text-center py-20">
                <Trophy className="w-20 h-20 mx-auto mb-6 text-slate-300 dark:text-gray-600" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {t.noBadges}
                </h3>
                <p className="text-slate-500 dark:text-gray-400 max-w-md mx-auto">
                  {language === 'ar' 
                    ? 'ستظهر إحصائيات شارات الطلاب هنا بمجرد بدء الطلاب في كسب الشارات'
                    : 'Student badge statistics will appear here once students start earning badges'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Teacher badge stats will go here */}
              </div>
            )
          ) : (
            // Student View
            selectedTab === 'badges' ? (
              earnedBadges.length === 0 ? (
                <div className="text-center py-20">
                  <Award className="w-20 h-20 mx-auto mb-6 text-slate-300 dark:text-gray-600" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {t.noBadges}
                  </h3>
                  <p className="text-slate-500 dark:text-gray-400 max-w-md mx-auto">
                    {t.noBadgesDesc}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.map((badge) => (
                    <Card
                      key={badge.id}
                      className={`p-4 ${badge.earnedAt ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-500/10 dark:to-orange-500/10 border-yellow-200 dark:border-yellow-500/30' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`text-4xl ${!badge.earnedAt && 'grayscale opacity-50'}`}>
                          {badge.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-slate-900 dark:text-white">
                              {language === 'ar' ? badge.nameAr : badge.nameEn}
                            </h4>
                            {badge.earnedAt && (
                              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            )}
                            {!badge.earnedAt && (
                              <Lock className="w-4 h-4 text-slate-400 dark:text-gray-600" />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-gray-400 mb-2">
                            {language === 'ar' ? badge.descriptionAr : badge.descriptionEn}
                          </p>
                          {badge.earnedAt && (
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                              {t.earned}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )
            ) : (
              unlockedAchievements.length === 0 ? (
                <div className="text-center py-20">
                  <Trophy className="w-20 h-20 mx-auto mb-6 text-slate-300 dark:text-gray-600" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {t.noAchievements}
                  </h3>
                  <p className="text-slate-500 dark:text-gray-400 max-w-md mx-auto">
                    {t.noAchievementsDesc}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {achievements.map((achievement) => (
                    <Card
                      key={achievement.id}
                      className={`p-4 ${achievement.unlocked ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 border-purple-200 dark:border-purple-500/30' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`text-3xl ${!achievement.unlocked && 'grayscale opacity-50'}`}>
                            {achievement.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">
                              {language === 'ar' ? achievement.nameAr : achievement.nameEn}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-gray-400">
                              {language === 'ar' ? achievement.descriptionAr : achievement.descriptionEn}
                            </p>
                          </div>
                        </div>
                        {achievement.unlocked && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            {t.unlocked}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-gray-400">{t.progress}</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {achievement.progress}/{achievement.target}
                          </span>
                        </div>
                        <Progress value={(achievement.progress / achievement.target) * 100} className="h-2" />
                      </div>
                    </Card>
                  ))}
                </div>
              )
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
