import React from 'react';
import { motion } from 'motion/react';
import { Flame, Trophy, Gift, Calendar } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { translations } from '@/app/contexts/translations';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';

export function StreaksWidget() {
  const { streak, claimStreakReward, language, theme } = useYieldX();
  const isDark = theme === 'dark';

  // Get translations for current language
  const t = translations[language];

  const nextReward = streak.streakRewards.find((r) => !r.claimed && r.days > streak.currentStreak);
  const canClaimRewards = streak.streakRewards.filter(
    (r) => !r.claimed && r.days <= streak.currentStreak
  );

  const titleText = isDark ? 'text-white' : 'text-slate-900';
  const mutedText = isDark ? 'text-gray-300' : 'text-slate-600';
  const mutedTextFaint = isDark ? 'text-gray-400' : 'text-slate-500';
  const innerCardBg = isDark ? 'bg-[#1B1B3A]/50' : 'bg-orange-900/5';
  const innerCardBgAlt = isDark ? 'bg-[#0F0F25]/50' : 'bg-orange-900/5';

  return (
    <Card className="bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 border-orange-500/30 p-6 relative overflow-hidden">
      {/* Animated flame background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              <Flame className="w-8 h-8 text-orange-500" />
            </motion.div>
            <div>
              <h3 className={`font-bold text-xl ${titleText}`}>{t.dashboard.currentStreak}</h3>
              <p className="text-orange-500 dark:text-orange-300 text-sm">{language === 'ar' ? 'حافظ على تسجيل الدخول اليومي!' : 'Maintain daily login!'}</p>
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className={`rounded-lg p-4 mb-4 ${innerCardBg}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm mb-1 ${mutedText}`}>{language === 'ar' ? 'السلسلة الحالية' : 'Current Streak'}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-orange-400">{streak.currentStreak}</span>
                <span className="text-orange-500 dark:text-orange-300 text-lg">{language === 'ar' ? 'يوم' : t.dashboard.days}</span>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm mb-1 ${mutedText}`}>{language === 'ar' ? 'أطول سلسلة' : 'Longest Streak'}</p>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-yellow-500 dark:text-yellow-400 font-bold text-2xl">{streak.longestStreak}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Login Days */}
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-[#7FDBCA]" />
          <p className={`text-sm ${mutedText}`}>
            {language === 'ar' ? 'مجموع أيام الدخول:' : 'Total login days:'} <span className="text-[#0d9488] dark:text-[#4ECDC4] font-semibold">{streak.totalLoginDays}</span>
          </p>
        </div>

        {/* Next Reward Progress */}
        {nextReward && (
          <div className={`rounded-lg p-4 mb-4 ${innerCardBgAlt}`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-semibold ${titleText}`}>{language === 'ar' ? 'المكافأة القادمة' : 'Next Reward'}</p>
              <div className="flex items-center gap-1">
                <Gift className="w-4 h-4 text-[#0d9488] dark:text-[#4ECDC4]" />
                <span className="text-[#0d9488] dark:text-[#4ECDC4] font-bold">+{nextReward.xpBonus} XP</span>
              </div>
            </div>
            <Progress
              value={(streak.currentStreak / nextReward.days) * 100}
              className="h-2 mb-2"
            />
            <p className={`text-xs text-center ${mutedText}`}>
              {nextReward.days - streak.currentStreak} {t.dashboard.daysRemaining} {nextReward.days} {t.dashboard.daysGoal}
            </p>
          </div>
        )}

        {/* Claimable Rewards */}
        {canClaimRewards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-500/40"
          >
            <p className="text-green-700 dark:text-green-400 font-semibold mb-2 flex items-center gap-2">
              <Gift className="w-5 h-5" />
              مكافآت جاهزة للاستلام!
            </p>
            <div className="space-y-2">
              {canClaimRewards.map((reward) => (
                <Button
                  key={reward.days}
                  onClick={() => claimStreakReward(reward.days)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  استلم {reward.xpBonus} XP (سلسلة {reward.days} أيام)
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Streak Milestones */}
        <div className="flex items-center justify-between gap-2 mt-4">
          {streak.streakRewards.map((reward) => (
            <div
              key={reward.days}
              className={`flex-1 text-center p-2 rounded-lg ${
                reward.claimed
                  ? 'bg-green-500/20 border border-green-500/40'
                  : streak.currentStreak >= reward.days
                  ? 'bg-yellow-500/20 border border-yellow-500/40'
                  : isDark ? 'bg-gray-700/20 border border-gray-700/40' : 'bg-slate-400/10 border border-slate-400/30'
              }`}
            >
              <p className={`text-xs font-bold ${
                reward.claimed
                  ? 'text-green-600 dark:text-green-400'
                  : streak.currentStreak >= reward.days
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : isDark ? 'text-gray-500' : 'text-slate-500'
              }`}>
                {reward.days}
              </p>
              <p className={`text-xs ${mutedTextFaint}`}>{t.dashboard.daysGoal}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}