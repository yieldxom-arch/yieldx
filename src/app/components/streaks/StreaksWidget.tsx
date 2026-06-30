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
    <Card className="bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 border-orange-500/30 p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-2xl" />

      <div className="relative z-10 space-y-3">
        {/* Header row */}
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          >
            <Flame className="w-5 h-5 text-orange-500" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm leading-tight ${titleText}`}>{t.dashboard.currentStreak}</h3>
            <p className="text-orange-500 dark:text-orange-300 text-[11px]">
              {language === 'ar' ? 'حافظ على تسجيل الدخول اليومي!' : 'Maintain daily login!'}
            </p>
          </div>
        </div>

        {/* Streak numbers — compact inline row */}
        <div className={`rounded-lg p-2.5 flex items-center justify-between ${innerCardBg}`}>
          <div>
            <p className={`text-[11px] mb-0.5 ${mutedText}`}>{language === 'ar' ? 'السلسلة' : 'Streak'}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-orange-400 leading-none">{streak.currentStreak}</span>
              <span className="text-orange-500 dark:text-orange-300 text-xs">{language === 'ar' ? 'يوم' : t.dashboard.days}</span>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-right">
            <p className={`text-[11px] mb-0.5 ${mutedText}`}>{language === 'ar' ? 'الأطول' : 'Best'}</p>
            <div className="flex items-center gap-1 justify-end">
              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-yellow-500 dark:text-yellow-400 font-bold text-lg leading-none">{streak.longestStreak}</span>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-right">
            <p className={`text-[11px] mb-0.5 ${mutedText}`}>{language === 'ar' ? 'إجمالي' : 'Total'}</p>
            <div className="flex items-center gap-1 justify-end">
              <Calendar className="w-3.5 h-3.5 text-[#7FDBCA]" />
              <span className="text-[#0d9488] dark:text-[#4ECDC4] font-semibold text-lg leading-none">{streak.totalLoginDays}</span>
            </div>
          </div>
        </div>

        {/* Next Reward Progress */}
        {nextReward && (
          <div className={`rounded-lg p-2.5 ${innerCardBgAlt}`}>
            <div className="flex items-center justify-between mb-1.5">
              <p className={`text-xs font-medium ${titleText}`}>{language === 'ar' ? 'المكافأة القادمة' : 'Next Reward'}</p>
              <div className="flex items-center gap-1">
                <Gift className="w-3.5 h-3.5 text-[#0d9488] dark:text-[#4ECDC4]" />
                <span className="text-[#0d9488] dark:text-[#4ECDC4] font-bold text-xs">+{nextReward.xpBonus} XP</span>
              </div>
            </div>
            <Progress value={(streak.currentStreak / nextReward.days) * 100} className="h-1.5 mb-1" />
            <p className={`text-[11px] text-center ${mutedText}`}>
              {nextReward.days - streak.currentStreak} {t.dashboard.daysRemaining} {nextReward.days} {t.dashboard.daysGoal}
            </p>
          </div>
        )}

        {/* Claimable Rewards */}
        {canClaimRewards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-3 border border-green-500/40"
          >
            <p className="text-green-700 dark:text-green-400 font-semibold text-xs mb-1.5 flex items-center gap-1.5">
              <Gift className="w-4 h-4" />
              {language === 'ar' ? 'مكافآت جاهزة للاستلام!' : 'Rewards ready to claim!'}
            </p>
            <div className="space-y-1.5">
              {canClaimRewards.map((reward) => (
                <Button
                  key={reward.days}
                  onClick={() => claimStreakReward(reward.days)}
                  size="sm"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xs h-7"
                >
                  <Trophy className="w-3 h-3 mr-1.5" />
                  {language === 'ar'
                    ? `استلم ${reward.xpBonus} XP (${reward.days} أيام)`
                    : `Claim ${reward.xpBonus} XP (${reward.days} days)`}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Milestone row — compact horizontal pills */}
        <div className="flex items-center gap-1">
          {streak.streakRewards.map((reward) => (
            <div
              key={reward.days}
              className={`flex-1 text-center py-1 px-1 rounded ${
                reward.claimed
                  ? 'bg-green-500/20 border border-green-500/40'
                  : streak.currentStreak >= reward.days
                  ? 'bg-yellow-500/20 border border-yellow-500/40'
                  : isDark ? 'bg-gray-700/20 border border-gray-700/40' : 'bg-slate-400/10 border border-slate-400/30'
              }`}
            >
              <p className={`text-[11px] font-bold leading-tight ${
                reward.claimed
                  ? 'text-green-600 dark:text-green-400'
                  : streak.currentStreak >= reward.days
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : isDark ? 'text-gray-500' : 'text-slate-500'
              }`}>
                {reward.days}
              </p>
              <p className={`text-[9px] leading-tight ${mutedTextFaint}`}>{t.dashboard.daysGoal}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
