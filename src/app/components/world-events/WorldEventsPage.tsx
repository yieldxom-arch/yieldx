import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe, Zap, Clock, CheckCircle, TrendingUp, TrendingDown,
  Bell, BellOff, Filter, ChevronLeft, ChevronRight, AlertTriangle,
  BarChart2, Shield, Leaf, Cpu, Activity, ArrowLeft,
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { useWorldEvents } from '@/app/contexts/WorldEventsContext';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { WorldEventCard } from './WorldEventCard';
import { RealWorldImpactScore } from './RealWorldImpactScore';
import { SECTOR_META, EVENT_CATEGORY_META } from '@/app/data/worldEventsData';
import { formatImpactMultiplier } from '@/app/utils/worldEventsEngine';
import type { AffectedSector } from '@/app/types/worldEvents';

type Tab = 'active' | 'upcoming' | 'history';

export function WorldEventsPage() {
  const { user, language, setCurrentView } = useYieldX();
  const {
    activeEvents, upcomingEvents, resolvedEvents,
    aggregateImpact, unreadCount, notifications,
    markAllRead, getSectorImpact,
  } = useWorldEvents();

  const [tab, setTab] = useState<Tab>('active');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const isRTL = language === 'ar';

  const allEvents = useMemo(() => {
    if (tab === 'active') return activeEvents;
    if (tab === 'upcoming') return upcomingEvents;
    return resolvedEvents;
  }, [tab, activeEvents, upcomingEvents, resolvedEvents]);

  const selectedEvent = useMemo(
    () => [...activeEvents, ...upcomingEvents, ...resolvedEvents].find((e) => e.id === selectedEventId),
    [selectedEventId, activeEvents, upcomingEvents, resolvedEvents],
  );

  const sectors: AffectedSector[] = [
    'technology', 'energy', 'finance', 'agriculture',
    'manufacturing', 'sustainability', 'logistics', 'retail',
  ];

  const tabs: { id: Tab; label: { ar: string; en: string }; count: number; icon: React.ReactNode }[] = [
    { id: 'active',    label: { ar: 'نشط',   en: 'Active' },   count: activeEvents.length,   icon: <Activity size={14} /> },
    { id: 'upcoming',  label: { ar: 'قادم',  en: 'Upcoming' }, count: upcomingEvents.length, icon: <Clock size={14} /> },
    { id: 'history',   label: { ar: 'الأرشيف', en: 'Archive' }, count: resolvedEvents.length, icon: <CheckCircle size={14} /> },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F0F25 0%, #1B1B3A 50%, #0F0F25 100%)',
      direction: isRTL ? 'rtl' : 'ltr',
    }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(15,15,37,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(78,205,196,0.15)',
        padding: '14px 24px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setCurrentView('dashboard')}
              style={{ background: 'none', border: 'none', color: '#4ECDC4', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
            >
              {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              {language === 'ar' ? 'الرئيسية' : 'Dashboard'}
            </button>
            <div style={{ width: 1, height: 20, background: 'rgba(78,205,196,0.2)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #4ECDC4, #1B1B3A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Globe size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#E5E7EB' }}>
                  {language === 'ar' ? 'الأحداث العالمية المباشرة' : 'Live World Events'}
                </div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>
                  {language === 'ar'
                    ? `${activeEvents.length} حدث نشط يؤثر على منصة YieldX`
                    : `${activeEvents.length} active events affecting the YieldX platform`}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Admin link */}
            {user?.role === 'admin' && (
              <Button
                onClick={() => setCurrentView('admin-world-events')}
                style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', color: '#C4B5FD', fontSize: 12, padding: '6px 14px', borderRadius: 8 }}
              >
                {language === 'ar' ? '⚙ إدارة' : '⚙ Manage'}
              </Button>
            )}
            {/* Notifications bell */}
            <button
              onClick={() => { setShowNotifs(!showNotifs); if (user) markAllRead(user.id); }}
              style={{
                position: 'relative', background: showNotifs ? 'rgba(78,205,196,0.15)' : 'rgba(78,205,196,0.08)',
                border: '1px solid rgba(78,205,196,0.25)', borderRadius: 8, padding: '7px 10px',
                cursor: 'pointer', color: '#4ECDC4',
              }}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  background: '#EF4444', color: '#fff',
                  fontSize: 9, fontWeight: 700,
                  width: 16, height: 16, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 48px' }}>

        {/* ── Notifications Panel ──────────────────────────────────────────── */}
        <AnimatePresence>
          {showNotifs && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginBottom: 20 }}
            >
              <Card style={{ background: 'rgba(27,27,58,0.95)', border: '1px solid rgba(78,205,196,0.2)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#E5E7EB', marginBottom: 12 }}>
                  {language === 'ar' ? '🔔 الإشعارات' : '🔔 Notifications'}
                </div>
                {notifications.length === 0 ? (
                  <div style={{ color: '#6B7280', fontSize: 12 }}>{language === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                    {[...notifications].reverse().slice(0, 15).map((n) => (
                      <div key={n.id} style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: 'rgba(78,205,196,0.06)',
                        border: '1px solid rgba(78,205,196,0.12)',
                        fontSize: 12,
                      }}>
                        <div style={{ color: '#E5E7EB', fontWeight: 600 }}>{n.title[language]}</div>
                        <div style={{ color: '#9CA3AF', marginTop: 2 }}>{n.body[language]}</div>
                        <div style={{ color: '#4B5563', fontSize: 10, marginTop: 3 }}>
                          {new Date(n.createdAt).toLocaleDateString(language === 'ar' ? 'ar-OM' : 'en-GB')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Aggregate Impact Banner ──────────────────────────────────────── */}
        {activeEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 24 }}
          >
            <Card style={{
              background: 'linear-gradient(135deg, rgba(78,205,196,0.1), rgba(27,27,58,0.9))',
              border: '1px solid rgba(78,205,196,0.3)',
              borderRadius: 14,
              padding: '16px 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    style={{ fontSize: 22 }}
                  >
                    🌐
                  </motion.div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#4ECDC4' }}>
                      {language === 'ar' ? 'التأثير العالمي المُجمَّع' : 'Aggregate Global Impact'}
                    </div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>
                      {language === 'ar'
                        ? `${activeEvents.length} أحداث نشطة تؤثر على المنصة`
                        : `${activeEvents.length} active events affecting your platform`}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <MetricPill
                    label={language === 'ar' ? 'المكافآت' : 'Rewards'}
                    value={formatImpactMultiplier(aggregateImpact.rewardMultiplier, language)}
                    positive={aggregateImpact.rewardMultiplier >= 1}
                  />
                  <MetricPill
                    label={language === 'ar' ? 'الصعوبة' : 'Difficulty'}
                    value={formatImpactMultiplier(aggregateImpact.challengeDifficulty, language)}
                    positive={aggregateImpact.challengeDifficulty <= 1}
                  />
                  <MetricPill
                    label={language === 'ar' ? 'التكاليف' : 'Costs'}
                    value={formatImpactMultiplier(aggregateImpact.costInflation, language)}
                    positive={aggregateImpact.costInflation <= 1}
                  />
                  {aggregateImpact.xpModifier !== 0 && (
                    <MetricPill
                      label="XP"
                      value={`${aggregateImpact.xpModifier > 0 ? '+' : ''}${aggregateImpact.xpModifier}`}
                      positive={aggregateImpact.xpModifier > 0}
                    />
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── Main Grid ───────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

          {/* Left: Event feed */}
          <div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setSelectedEventId(null); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: tab === t.id ? 'rgba(78,205,196,0.15)' : 'rgba(27,27,58,0.6)',
                    border: tab === t.id ? '1px solid rgba(78,205,196,0.4)' : '1px solid rgba(78,205,196,0.1)',
                    color: tab === t.id ? '#4ECDC4' : '#6B7280',
                  }}
                >
                  {t.icon}
                  {t.label[language]}
                  <span style={{
                    background: tab === t.id ? 'rgba(78,205,196,0.25)' : 'rgba(75,85,99,0.3)',
                    borderRadius: 10, padding: '1px 7px', fontSize: 10,
                  }}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Event list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <AnimatePresence mode="popLayout">
                {allEvents.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ textAlign: 'center', padding: '48px 24px', color: '#4B5563' }}
                  >
                    <Globe size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                    <div style={{ fontSize: 14 }}>
                      {language === 'ar' ? 'لا توجد أحداث في هذه الفئة' : 'No events in this category'}
                    </div>
                  </motion.div>
                ) : (
                  allEvents.map((event, i) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: i * 0.05, duration: 0.25 }}
                    >
                      <WorldEventCard
                        event={event}
                        language={language}
                        onClick={() => setSelectedEventId(selectedEventId === event.id ? null : event.id)}
                        selected={selectedEventId === event.id}
                      />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Detail panel + sector impact + score */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80 }}>

            {/* Detail panel */}
            <AnimatePresence mode="wait">
              {selectedEvent ? (
                <motion.div
                  key={selectedEvent.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card style={{
                    background: 'rgba(27,27,58,0.95)',
                    border: '1px solid rgba(78,205,196,0.25)',
                    borderRadius: 14,
                    padding: 18,
                  }}>
                    <div style={{ fontSize: 11, color: '#4ECDC4', fontWeight: 700, marginBottom: 8 }}>
                      {language === 'ar' ? 'تفاصيل الحدث' : 'Event Details'}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#E5E7EB', marginBottom: 10 }}>
                      {selectedEvent.title[language]}
                    </div>
                    <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.7, direction: isRTL ? 'rtl' : 'ltr' }}>
                      {selectedEvent.description[language]}
                    </p>

                    {/* Modifiers breakdown */}
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, marginBottom: 8 }}>
                        {language === 'ar' ? 'تأثيرات على المنصة' : 'Platform Effects'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {[
                          { label: language === 'ar' ? 'مضاعف المكافآت' : 'Reward Multiplier', value: formatImpactMultiplier(selectedEvent.impactModifiers.rewardMultiplier, language), pos: selectedEvent.impactModifiers.rewardMultiplier >= 1 },
                          { label: language === 'ar' ? 'صعوبة التحديات' : 'Challenge Difficulty', value: formatImpactMultiplier(selectedEvent.impactModifiers.challengeDifficulty, language), pos: selectedEvent.impactModifiers.challengeDifficulty <= 1 },
                          { label: language === 'ar' ? 'تضخم التكاليف' : 'Cost Inflation', value: formatImpactMultiplier(selectedEvent.impactModifiers.costInflation, language), pos: selectedEvent.impactModifiers.costInflation <= 1 },
                          { label: language === 'ar' ? 'تعديل XP' : 'XP Modifier', value: `${selectedEvent.impactModifiers.xpModifier > 0 ? '+' : ''}${selectedEvent.impactModifiers.xpModifier}`, pos: selectedEvent.impactModifiers.xpModifier >= 0 },
                          { label: language === 'ar' ? 'تقلب السوق' : 'Market Volatility', value: `${Math.round(selectedEvent.impactModifiers.marketVolatility * 100)}%`, pos: selectedEvent.impactModifiers.marketVolatility <= 0.3 },
                        ].map((row) => (
                          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: '#9CA3AF' }}>{row.label}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: row.pos ? '#6EE7B7' : '#FCA5A5' }}>
                              {row.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chained events hint */}
                    {selectedEvent.chainedEventIds && selectedEvent.chainedEventIds.length > 0 && (
                      <div style={{
                        marginTop: 12, padding: '8px 10px',
                        background: 'rgba(139,92,246,0.1)',
                        border: '1px solid rgba(139,92,246,0.2)',
                        borderRadius: 8,
                        fontSize: 11, color: '#C4B5FD',
                      }}>
                        {language === 'ar'
                          ? `⚠ قد يُطلق هذا الحدث ${selectedEvent.chainedEventIds.length} حدث مرتبط`
                          : `⚠ This event may trigger ${selectedEvent.chainedEventIds.length} chained event(s)`}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card style={{
                    background: 'rgba(27,27,58,0.5)',
                    border: '1px dashed rgba(78,205,196,0.15)',
                    borderRadius: 14,
                    padding: 20,
                    textAlign: 'center',
                  }}>
                    <Globe size={28} style={{ margin: '0 auto 8px', color: '#4ECDC480' }} />
                    <div style={{ fontSize: 12, color: '#4B5563' }}>
                      {language === 'ar' ? 'اختر حدثاً لعرض تفاصيله' : 'Select an event to view details'}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sector Impact */}
            <Card style={{
              background: 'rgba(27,27,58,0.9)',
              border: '1px solid rgba(78,205,196,0.15)',
              borderRadius: 14,
              padding: 16,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#E5E7EB', marginBottom: 12 }}>
                {language === 'ar' ? '📊 تأثير القطاعات' : '📊 Sector Impact'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sectors.map((s) => {
                  const impact = getSectorImpact(s);
                  const meta = SECTOR_META[s];
                  const pct = Math.round(impact.rewardDelta * 100);
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{meta?.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: 10, color: '#9CA3AF' }}>{meta?.label[language]}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            color: pct > 0 ? '#6EE7B7' : pct < 0 ? '#FCA5A5' : '#6B7280',
                          }}>
                            {pct === 0 ? '—' : `${pct > 0 ? '+' : ''}${pct}%`}
                          </span>
                        </div>
                        <div style={{ height: 3, background: 'rgba(75,85,99,0.4)', borderRadius: 4, overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, Math.abs(pct) * 2)}%` }}
                            transition={{ duration: 0.6 }}
                            style={{
                              height: '100%',
                              background: pct > 0 ? '#4ECDC4' : pct < 0 ? '#EF4444' : '#4B5563',
                              borderRadius: 4,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* User Impact Score */}
            {user && <RealWorldImpactScore userId={user.id} language={language} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricPill({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '5px 12px', borderRadius: 20,
      background: positive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
      border: `1px solid ${positive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
    }}>
      {positive ? <TrendingUp size={11} color="#6EE7B7" /> : <TrendingDown size={11} color="#FCA5A5" />}
      <span style={{ fontSize: 11, color: '#9CA3AF' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: positive ? '#6EE7B7' : '#FCA5A5' }}>{value}</span>
    </div>
  );
}
