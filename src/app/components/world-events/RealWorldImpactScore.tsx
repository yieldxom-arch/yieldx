import React from 'react';
import { motion } from 'motion/react';
import { Shield, Leaf, Cpu, TrendingUp, AlertTriangle, Star } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { useWorldEvents } from '@/app/contexts/WorldEventsContext';

interface Props {
  userId: string;
  language: 'ar' | 'en';
  compact?: boolean;
}

export function RealWorldImpactScore({ userId, language, compact = false }: Props) {
  const { getUserScore, getUserBadges } = useWorldEvents();
  const score = getUserScore(userId);
  const badges = getUserBadges(userId);
  const isRTL = language === 'ar';

  const total = score.totalImpactScore;
  const pct = (total / 1000) * 100;

  const scoreColor =
    pct >= 70 ? '#4ECDC4' :
    pct >= 40 ? '#F59E0B' :
    pct >= 20 ? '#F97316' : '#6B7280';

  const scoreLabel =
    pct >= 70 ? (language === 'ar' ? 'خبير عالمي' : 'Global Expert') :
    pct >= 40 ? (language === 'ar' ? 'محلل متقدم' : 'Advanced Analyst') :
    pct >= 20 ? (language === 'ar' ? 'مبتدئ' : 'Beginner') :
    (language === 'ar' ? 'جديد' : 'Newcomer');

  const subScores = [
    { label: { ar: 'التكيف', en: 'Adaptability' }, value: score.adaptabilityScore, icon: <TrendingUp size={12} />, color: '#4ECDC4' },
    { label: { ar: 'إدارة المخاطر', en: 'Risk Mgmt' }, value: score.riskManagementScore, icon: <Shield size={12} />, color: '#7FDBCA' },
    { label: { ar: 'الاستدامة', en: 'Sustainability' }, value: score.sustainabilityScore, icon: <Leaf size={12} />, color: '#10B981' },
    { label: { ar: 'الابتكار', en: 'Innovation' }, value: score.innovationScore, icon: <Cpu size={12} />, color: '#8B5CF6' },
    { label: { ar: 'أداء الأزمات', en: 'Crisis Perf.' }, value: score.crisisPerformanceScore, icon: <AlertTriangle size={12} />, color: '#F59E0B' },
  ];

  if (compact) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px', borderRadius: 10,
        background: 'rgba(27,27,58,0.8)',
        border: '1px solid rgba(78,205,196,0.15)',
        direction: isRTL ? 'rtl' : 'ltr',
      }}>
        <ScoreRing value={pct} color={scoreColor} size={40} />
        <div>
          <div style={{ fontSize: 11, color: scoreColor, fontWeight: 700 }}>{total} / 1000</div>
          <div style={{ fontSize: 10, color: '#6B7280' }}>
            {language === 'ar' ? 'نقاط التأثير العالمي' : 'Real-World Impact'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card style={{
      background: 'rgba(27,27,58,0.9)',
      border: '1px solid rgba(78,205,196,0.2)',
      borderRadius: 14,
      padding: 16,
      direction: isRTL ? 'rtl' : 'ltr',
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#E5E7EB', marginBottom: 14 }}>
        🌐 {language === 'ar' ? 'نقاط التأثير العالمي' : 'Real-World Impact Score'}
      </div>

      {/* Main ring + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <ScoreRing value={pct} color={scoreColor} size={64} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
            {total}
            <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 400 }}> / 1000</span>
          </div>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>{scoreLabel}</div>
          <div style={{ fontSize: 10, color: '#4B5563', marginTop: 2 }}>
            {score.eventsParticipated.length} {language === 'ar' ? 'أحداث شارك فيها' : 'events participated'}
          </div>
        </div>
      </div>

      {/* Sub-scores */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {subScores.map((s) => (
          <div key={s.label.en} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: s.color, flexShrink: 0 }}>{s.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 10, color: '#9CA3AF' }}>{s.label[language]}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: s.color }}>{s.value}/100</span>
              </div>
              <div style={{ height: 4, background: 'rgba(75,85,99,0.4)', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.value}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{ height: '100%', background: s.color, borderRadius: 4 }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Earned badges */}
      {badges.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 600, marginBottom: 7 }}>
            {language === 'ar' ? '🏅 الشارات المكتسبة' : '🏅 Earned Badges'}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {badges.map((b) => (
              <div
                key={b.id}
                title={b.description[language]}
                style={{
                  padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                  background: b.tier === 'platinum' ? 'rgba(139,92,246,0.2)' :
                              b.tier === 'gold' ? 'rgba(251,191,36,0.15)' :
                              b.tier === 'silver' ? 'rgba(148,163,184,0.15)' : 'rgba(180,120,60,0.15)',
                  border: `1px solid ${b.tier === 'platinum' ? 'rgba(139,92,246,0.4)' :
                            b.tier === 'gold' ? 'rgba(251,191,36,0.35)' :
                            b.tier === 'silver' ? 'rgba(148,163,184,0.35)' : 'rgba(180,120,60,0.35)'}`,
                  color: b.tier === 'platinum' ? '#C4B5FD' :
                         b.tier === 'gold' ? '#FDE68A' :
                         b.tier === 'silver' ? '#CBD5E1' : '#D4A96A',
                }}
              >
                {b.iconEmoji} {b.title[language]}
              </div>
            ))}
          </div>
        </div>
      )}

      {badges.length === 0 && total === 0 && (
        <div style={{ marginTop: 12, textAlign: 'center', color: '#4B5563', fontSize: 11 }}>
          {language === 'ar'
            ? 'شارك في الأحداث العالمية لبناء نقاطك'
            : 'Participate in world events to build your score'}
        </div>
      )}
    </Card>
  );
}

function ScoreRing({ value, color, size }: { value: number; color: string; size: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;

  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(75,85,99,0.3)" strokeWidth={5} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize={size < 50 ? 10 : 14} fontWeight={800} fill={color}>
        {Math.round(value)}%
      </text>
    </svg>
  );
}
