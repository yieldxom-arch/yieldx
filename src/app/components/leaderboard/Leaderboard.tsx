import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Users,
  Globe,
  MapPin,
  GraduationCap,
  BookOpen,
  Star,
  Award,
  Zap,
  ArrowLeft,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { translations } from '@/app/contexts/translations';
import { useWorldEvents } from '@/app/contexts/WorldEventsContext';

type LeaderboardScope = 'global' | 'country' | 'university' | 'class';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  level: number;
  rank: number;
  country?: string;
  university?: string;
  class?: string;
  completedModules: number;
  badges: number;
}

export function Leaderboard() {
  const { user, setCurrentView, language, totalXP, levels } = useYieldX();
  const { activeEvents, aggregateImpact } = useWorldEvents();
  const [scope, setScope] = useState<LeaderboardScope>('global');
  const [isLoading, setIsLoading] = useState(true);
  const t = translations[language];

  // Return empty array - no fake users until platform launches  
  // In a real implementation, this would fetch real user data from backend
  const allUsers = useMemo((): LeaderboardUser[] => {
    return [];
  }, []);

  // Simulate loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [scope]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCurrentView('dashboard');
      }
      if (e.key === '1') setScope('global');
      if (e.key === '2') setScope('country');
      if (e.key === '3') setScope('university');
      if (e.key === '4') setScope('class');
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setCurrentView]);

  const filteredUsers = useMemo(() => {
    let filtered = [...allUsers];

    switch (scope) {
      case 'country':
        filtered = filtered.filter((u) => u.country === user?.country);
        break;
      case 'university':
        filtered = filtered.filter((u) => u.university === user?.university);
        break;
      case 'class':
        filtered = filtered.filter((u) => u.class === user?.class);
        break;
      default:
        break;
    }

    // Re-rank based on filtered list
    return filtered
      .sort((a, b) => b.points - a.points)
      .map((u, index) => ({ ...u, rank: index + 1 }));
  }, [allUsers, scope, user]);

  const currentUser = filteredUsers.find((u) => u.id === user?.id);

  const scopes = [
    { id: 'global' as LeaderboardScope, label: t.leaderboard.global, icon: Globe, color: 'from-blue-500 to-purple-500' },
    { id: 'country' as LeaderboardScope, label: t.leaderboard.oman, icon: MapPin, color: 'from-green-500 to-emerald-500' },
    {
      id: 'university' as LeaderboardScope,
      label: t.leaderboard.myUniversity,
      icon: GraduationCap,
      color: 'from-orange-500 to-red-500',
    },
    { id: 'class' as LeaderboardScope, label: t.leaderboard.myClass, icon: BookOpen, color: 'from-pink-500 to-rose-500' },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" fill="currentColor" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-400" />;
    return null;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white';
    return 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  // Generate avatar color based on user name
  const getAvatarColor = (name: string) => {
    const colors = [
      'from-pink-400 to-rose-500',
      'from-purple-400 to-indigo-500',
      'from-blue-400 to-cyan-500',
      'from-green-400 to-emerald-500',
      'from-yellow-400 to-orange-500',
      'from-red-400 to-pink-500',
    ];
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="divide-y divide-purple-100 dark:divide-[#4ECDC4]/10">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="p-4 animate-pulse">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-1 flex justify-center">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </div>
            <div className="col-span-5 flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="col-span-2 flex justify-center">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-full w-16"></div>
            </div>
            <div className="col-span-2 flex justify-center">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
            </div>
            <div className="col-span-2 flex justify-center">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="p-12 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-12 h-12 text-purple-400 dark:text-purple-300" />
        </div>
      </motion.div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t.leaderboard.noData}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{t.leaderboard.noUsersFound}</p>
      {scope !== 'global' && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setScope('global')}
          className="px-6 py-2 bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          {t.leaderboard.viewGlobalRanking}
        </motion.button>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 dark:from-[#0a0a1f] dark:via-[#1B1B3A] dark:to-[#0a0a1f] p-8"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Keyboard Shortcuts Hint */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className={`fixed bottom-6 ${language === 'ar' ? 'left-6' : 'right-6'} bg-white/90 dark:bg-[#1B1B3A]/90 backdrop-blur-sm border border-purple-200 dark:border-[#4ECDC4]/20 rounded-lg p-3 shadow-lg z-50`}
      >
        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-mono">Esc</kbd>
            <span>{t.leaderboard.backShortcut}</span>
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-mono">1-4</kbd>
            <span>{t.leaderboard.switchShortcut}</span>
          </div>
        </div>
      </motion.div>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: language === 'ar' ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => setCurrentView('dashboard')}
        className="mb-6 flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1B1B3A]/50 hover:bg-gray-50 dark:hover:bg-[#1B1B3A] border border-purple-200 dark:border-[#4ECDC4]/20 hover:border-[#4ECDC4] text-gray-700 dark:text-gray-300 rounded-lg transition-all shadow-sm hover:shadow-md group"
      >
        <ArrowLeft className={`w-5 h-5 group-hover:${language === 'ar' ? 'translate-x-1' : '-translate-x-1'} transition-transform ${language === 'ar' ? '' : 'rotate-180'}`} />
        <span className="font-semibold">{t.leaderboard.backToDashboard}</span>
      </motion.button>

      {/* World Events impact banner — shown only when events are active */}
      {activeEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 flex-wrap px-4 py-3 rounded-xl border"
          style={{
            background: 'rgba(78,205,196,0.08)',
            borderColor: 'rgba(78,205,196,0.25)',
          }}
        >
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="text-lg"
          >
            🌐
          </motion.span>
          <span className="text-sm font-semibold dark:text-[#4ECDC4] text-teal-700">
            {language === 'ar'
              ? `${activeEvents.length} أحداث عالمية تؤثر على الترتيب الآن`
              : `${activeEvents.length} world event(s) affecting rankings now`}
          </span>
          {aggregateImpact.rankingMomentum !== 1 && (
            <span
              className="text-xs font-bold px-2 py-1 rounded-full"
              style={{
                background: aggregateImpact.rankingMomentum > 1 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: aggregateImpact.rankingMomentum > 1 ? '#6EE7B7' : '#FCA5A5',
              }}
            >
              {language === 'ar' ? 'زخم الترتيب' : 'Ranking momentum'}{' '}
              {aggregateImpact.rankingMomentum > 1 ? '+' : ''}
              {Math.round((aggregateImpact.rankingMomentum - 1) * 100)}%
            </span>
          )}
          {aggregateImpact.xpModifier !== 0 && (
            <span
              className="text-xs font-bold px-2 py-1 rounded-full"
              style={{
                background: aggregateImpact.xpModifier > 0 ? 'rgba(78,205,196,0.15)' : 'rgba(239,68,68,0.15)',
                color: aggregateImpact.xpModifier > 0 ? '#4ECDC4' : '#FCA5A5',
              }}
            >
              XP {aggregateImpact.xpModifier > 0 ? '+' : ''}{aggregateImpact.xpModifier}
            </span>
          )}
          <button
            onClick={() => setCurrentView('world-events')}
            className="ms-auto text-xs underline dark:text-[#7FDBCA] text-teal-600 hover:opacity-80"
          >
            {language === 'ar' ? 'عرض الأحداث ←' : '← View Events'}
          </button>
        </motion.div>
      )}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 bg-clip-text text-transparent">
            {t.leaderboard.title}
          </h1>
        </div>
        <p className={`text-gray-600 dark:text-gray-400 ${language === 'ar' ? 'mr-16' : 'ml-16'}`}>{t.leaderboard.competeWithBest}</p>
      </motion.div>

      {/* Scope Selector */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {scopes.map((s) => {
            const Icon = s.icon;
            const isActive = scope === s.id;

            return (
              <motion.button
                key={s.id}
                onClick={() => setScope(s.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-white dark:bg-[#1B1B3A] border-[#4ECDC4] shadow-lg shadow-[#4ECDC4]/20'
                    : 'bg-white/50 dark:bg-[#1B1B3A]/30 border-purple-200 dark:border-[#4ECDC4]/20 hover:border-[#4ECDC4]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 bg-gradient-to-r ${s.color} rounded-lg flex items-center justify-center shadow-md`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-slate-900 dark:text-white font-semibold">{s.label}</span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeScope"
                    className="absolute bottom-0 right-0 left-0 h-1 bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] rounded-b-xl"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Current User Stats - Only show if user has data */}
      {currentUser && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-6 bg-gradient-to-r from-[#4ECDC4]/10 to-[#7FDBCA]/10 border border-[#4ECDC4]/30 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-[#4ECDC4] to-[#7FDBCA] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                #{currentUser.rank}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {t.leaderboard.yourCurrentRank}
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.leaderboard.level} {currentUser.level} • {currentUser.points.toLocaleString()} {t.leaderboard.points}
                </p>
              </div>
            </div>
            <div className={language === 'ar' ? 'text-left' : 'text-right'}>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">{t.leaderboard.completedModules}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{currentUser.completedModules}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">{t.leaderboard.badges}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <Award className="w-5 h-5 text-[#4ECDC4]" />
                    {currentUser.badges}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-[#1B1B3A]/50 border border-purple-200 dark:border-[#4ECDC4]/20 rounded-xl overflow-hidden shadow-lg"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-[#1B1B3A] dark:to-[#1B1B3A] border-b border-purple-200 dark:border-[#4ECDC4]/20 p-4">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <div className="col-span-1 text-center">{t.leaderboard.rank}</div>
            <div className="col-span-5">{t.leaderboard.user}</div>
            <div className="col-span-2 text-center">{t.leaderboard.level}</div>
            <div className="col-span-2 text-center">{t.leaderboard.points}</div>
            <div className="col-span-2 text-center">{t.leaderboard.modules}</div>
          </div>
        </div>

        {/* Users List */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredUsers.length > 0 ? (
          <div className="divide-y divide-purple-100 dark:divide-[#4ECDC4]/10">
            <AnimatePresence mode="popLayout">
              {filteredUsers.slice(0, 20).map((leaderUser, index) => {
                const isCurrentUser = leaderUser.id === user?.id;

                return (
                  <motion.div
                    key={leaderUser.id}
                    initial={{ opacity: 0, x: language === 'ar' ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: language === 'ar' ? 20 : -20 }}
                    transition={{ delay: index * 0.03 }}
                    className={`p-4 hover:bg-purple-50 dark:hover:bg-[#1B1B3A]/80 transition-colors ${
                      isCurrentUser ? 'bg-[#4ECDC4]/10 dark:bg-[#4ECDC4]/5' : ''
                    }`}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Rank */}
                      <div className="col-span-1 flex justify-center">
                        {getRankIcon(leaderUser.rank) || (
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${getRankBadgeColor(
                                leaderUser.rank
                              )}`}
                          >
                            {leaderUser.rank}
                          </div>
                        )}
                      </div>

                      {/* User */}
                      <div className="col-span-5 flex items-center gap-3">
                        <div
                          className={`w-12 h-12 bg-gradient-to-r ${getAvatarColor(
                            leaderUser.name
                          )} rounded-full flex items-center justify-center text-white font-bold shadow-md`}
                        >
                          {leaderUser.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {leaderUser.name}
                            {isCurrentUser && (
                              <span className="px-2 py-0.5 bg-[#4ECDC4] text-white text-xs rounded-full">{t.leaderboard.you}</span>
                            )}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                            {leaderUser.badges} {t.leaderboard.badges}
                          </div>
                        </div>
                      </div>

                      {/* Level */}
                      <div className="col-span-2 text-center">
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold">
                          <Zap className="w-4 h-4" />
                          {leaderUser.level}
                        </div>
                      </div>

                      {/* Points */}
                      <div className="col-span-2 text-center">
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {leaderUser.points.toLocaleString()}
                        </p>
                      </div>

                      {/* Modules */}
                      <div className="col-span-2 text-center">
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {leaderUser.completedModules}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState />
        )}
      </motion.div>
    </motion.div>
  );
}
