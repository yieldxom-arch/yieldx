import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, TrendingUp, TrendingDown, ChevronRight, ChevronLeft, Zap } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { useWorldEvents } from '@/app/contexts/WorldEventsContext';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { EVENT_CATEGORY_META, SEVERITY_META } from '@/app/data/worldEventsData';
import { formatImpactMultiplier } from '@/app/utils/worldEventsEngine';

export function WorldEventsDashboardWidget() {
  const { language, setCurrentView, user, theme } = useYieldX();
  const { activeEvents, upcomingEvents, aggregateImpact, unreadCount, getUserScore } = useWorldEvents();
  const isRTL = language === 'ar';
  const isDark = theme === 'dark';

  // This widget renders entirely via inline `style` objects (not Tailwind classes),
  // so it must look up its own colors from `theme` — Tailwind's `dark:` variant has no effect here.
  const palette = {
    cardBg: isDark
      ? 'linear-gradient(135deg, rgba(27,27,58,0.95), rgba(15,15,37,0.98))'
      : 'linear-gradient(135deg, #ffffff, #f1f5f9)',
    cardBorder: isDark ? '1px solid rgba(78,205,196,0.2)' : '1px solid rgba(78,205,196,0.35)',
    emptyCardBg: isDark
      ? 'linear-gradient(135deg, rgba(27,27,58,0.8), rgba(15,15,37,0.9))'
      : 'linear-gradient(135deg, #ffffff, #f1f5f9)',
    emptyCardBorder: isDark ? '1px solid rgba(78,205,196,0.12)' : '1px solid rgba(78,205,196,0.25)',
    emptyText: isDark ? '#4B5563' : '#475569',
    titleText: isDark ? '#E5E7EB' : '#1E293B',
    mutedText: isDark ? '#9CA3AF' : '#64748B',
    subtleText: isDark ? '#6B7280' : '#64748B',
    dotInactive: isDark ? 'rgba(75,85,99,0.4)' : 'rgba(100,116,139,0.4)',
    positiveText: isDark ? '#6EE7B7' : '#059669',
    negativeText: isDark ? '#FCA5A5' : '#DC2626',
  };

  const [currentIdx, setCurrentIdx] = React.useState(0);
  const displayEvents = [...activeEvents, ...upcomingEvents.slice(0, 2)];

  const userScore = user ? getUserScore(user.id) : null;

  React.useEffect(() => {
    if (displayEvents.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((i) => (i + 1) % displayEvents.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [displayEvents.length]);

  const currentEvent = displayEvents[currentIdx];

  if (displayEvents.length === 0) {
    return (
      <Card style={{
        background: palette.emptyCardBg,
        border: palette.emptyCardBorder,
        borderRadius: 16,
        padding: '18px 20px',
        cursor: 'pointer',
        direction: isRTL ? 'rtl' : 'ltr',
      }} onClick={() => setCurrentView('world-events')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Globe size={22} color="#4ECDC480" />
          <span style={{ fontSize: 13, color: palette.emptyText }}>
            {language === 'ar' ? 'لا توجد أحداث عالمية نشطة حالياً' : 'No active world events right now'}
          </span>
        </div>
      </Card>
    );
  }

  const cat = currentEvent ? EVENT_CATEGORY_META[currentEvent.category] : null;
  const sev = currentEvent ? SEVERITY_META[currentEvent.severity] : null;

  return (
    <Card
      style={{
        background: palette.cardBg,
        border: palette.cardBorder,
        borderRadius: 16,
        overflow: 'hidden',
        direction: isRTL ? 'rtl' : 'ltr',
        position: 'relative',
      }}
    >
      {/* Top accent bar */}
      <motion.div
        style={{ height: 3, background: 'linear-gradient(90deg, #4ECDC4, #7FDBCA, #4ECDC4)' }}
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div style={{ padding: '14px 18px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              style={{ fontSize: 18 }}
            >
              🌐
            </motion.div>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: palette.titleText }}>
                {language === 'ar' ? 'الأحداث العالمية المباشرة' : 'Live World Events'}
              </span>
              {unreadCount > 0 && (
                <span style={{
                  marginInlineStart: 8,
                  background: '#EF4444', color: '#fff',
                  fontSize: 9, fontWeight: 700,
                  padding: '1px 6px', borderRadius: 10,
                }}>
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setCurrentView('world-events')}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', color: '#4ECDC4',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {language === 'ar' ? 'عرض الكل' : 'View All'}
            {isRTL ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
          </button>
        </div>

        {/* Current event carousel */}
        {currentEvent && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentEvent.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              style={{
                padding: '12px 14px',
                background: `${cat?.color ?? '#4ECDC4'}10`,
                borderRadius: 12,
                border: `1px solid ${cat?.color ?? '#4ECDC4'}25`,
                cursor: 'pointer',
              }}
              onClick={() => setCurrentView('world-events')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>{currentEvent.iconEmoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700, color: cat?.color, textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      {cat?.label[language]}
                    </span>
                    <span style={{
                      fontSize: 9, padding: '1px 6px', borderRadius: 10, fontWeight: 700,
                      background: sev?.bg, color: sev?.color,
                    }}>
                      {sev?.label[language]}
                    </span>
                    {(currentEvent.status === 'active' || currentEvent.status === 'escalating') && (
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: currentEvent.status === 'escalating' ? '#EF4444' : '#10B981',
                          display: 'inline-block',
                        }}
                      />
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: palette.titleText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentEvent.title[language]}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: palette.mutedText, lineHeight: 1.5 }}>
                {currentEvent.shortDescription[language]}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Dots */}
        {displayEvents.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 10 }}>
            {displayEvents.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                style={{
                  width: i === currentIdx ? 16 : 6, height: 6,
                  borderRadius: 3, border: 'none', cursor: 'pointer',
                  background: i === currentIdx ? '#4ECDC4' : palette.dotInactive,
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        )}

        {/* Aggregate impact row */}
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <MiniMetric
            label={language === 'ar' ? 'المكافآت' : 'Rewards'}
            value={formatImpactMultiplier(aggregateImpact.rewardMultiplier, language)}
            positive={aggregateImpact.rewardMultiplier >= 1}
            isDark={isDark}
          />
          <MiniMetric
            label={language === 'ar' ? 'الصعوبة' : 'Difficulty'}
            value={formatImpactMultiplier(aggregateImpact.challengeDifficulty, language)}
            positive={aggregateImpact.challengeDifficulty <= 1}
            isDark={isDark}
          />
          {aggregateImpact.xpModifier !== 0 && (
            <MiniMetric
              label="XP"
              value={`${aggregateImpact.xpModifier > 0 ? '+' : ''}${aggregateImpact.xpModifier}`}
              positive={aggregateImpact.xpModifier > 0}
              isDark={isDark}
            />
          )}
        </div>

        {/* User impact score pill */}
        {userScore && userScore.totalImpactScore > 0 && (
          <div style={{
            marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 10px', borderRadius: 8,
            background: 'rgba(78,205,196,0.06)', border: '1px solid rgba(78,205,196,0.12)',
          }}>
            <span style={{ fontSize: 10, color: palette.subtleText }}>
              {language === 'ar' ? 'نقاط تأثيرك العالمي' : 'Your Real-World Impact'}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#4ECDC4' }}>
              {userScore.totalImpactScore} / 1000
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

function MiniMetric({ label, value, positive, isDark }: { label: string; value: string; positive: boolean; isDark: boolean }) {
  const mutedText = isDark ? '#9CA3AF' : '#64748B';
  const positiveText = isDark ? '#6EE7B7' : '#059669';
  const negativeText = isDark ? '#FCA5A5' : '#DC2626';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 8, fontSize: 10,
      background: positive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
      border: `1px solid ${positive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
    }}>
      {positive ? <TrendingUp size={9} color={positiveText} /> : <TrendingDown size={9} color={negativeText} />}
      <span style={{ color: mutedText }}>{label}</span>
      <span style={{ fontWeight: 700, color: positive ? positiveText : negativeText }}>{value}</span>
    </div>
  );
}
