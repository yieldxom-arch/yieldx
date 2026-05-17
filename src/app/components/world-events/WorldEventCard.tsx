import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, AlertTriangle, Clock, CheckCircle, Zap } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import type { WorldEvent } from '@/app/types/worldEvents';
import {
  EVENT_CATEGORY_META,
  SEVERITY_META,
  STATUS_META,
  SECTOR_META,
} from '@/app/data/worldEventsData';
import { getDaysRemaining, getDaysUntilStart, formatImpactMultiplier } from '@/app/utils/worldEventsEngine';

interface WorldEventCardProps {
  event: WorldEvent;
  language: 'ar' | 'en';
  compact?: boolean;
  onClick?: () => void;
  selected?: boolean;
}

export function WorldEventCard({ event, language, compact = false, onClick, selected = false }: WorldEventCardProps) {
  const isRTL = language === 'ar';
  const cat = EVENT_CATEGORY_META[event.category];
  const sev = SEVERITY_META[event.severity];
  const stat = STATUS_META[event.status];
  const daysLeft = getDaysRemaining(event);
  const daysUntil = getDaysUntilStart(event);
  const isUpcoming = event.status === 'upcoming';
  const isResolved = event.status === 'resolved';

  const pulseColor = event.severity === 'critical'
    ? '#EF4444'
    : event.severity === 'high'
    ? '#F97316'
    : event.severity === 'medium'
    ? '#F59E0B'
    : '#10B981';

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Card
        style={{
          background: selected
            ? 'linear-gradient(135deg, rgba(78,205,196,0.12), rgba(27,27,58,0.95))'
            : 'linear-gradient(135deg, rgba(27,27,58,0.9), rgba(15,15,37,0.95))',
          border: selected
            ? '1px solid rgba(78,205,196,0.5)'
            : `1px solid ${sev.bg}`,
          borderRadius: 12,
          padding: compact ? '12px 14px' : '16px 18px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Critical pulsing top border */}
        {(event.severity === 'critical' || event.status === 'escalating') && !isResolved && (
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, transparent, ${pulseColor}, transparent)`,
            }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {/* Paused overlay */}
        {event.isPaused && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15,15,37,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            borderRadius: 12,
          }}>
            <span style={{ color: '#6B7280', fontSize: 13, fontWeight: 600 }}>
              {language === 'ar' ? '⏸ متوقف مؤقتاً' : '⏸ Paused'}
            </span>
          </div>
        )}

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, direction: isRTL ? 'rtl' : 'ltr' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            {/* Category icon */}
            <div style={{
              width: compact ? 36 : 44,
              height: compact ? 36 : 44,
              borderRadius: 10,
              background: `${cat?.color}20`,
              border: `1px solid ${cat?.color}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: compact ? 18 : 22,
              flexShrink: 0,
            }}>
              {event.iconEmoji || cat?.emoji}
            </div>

            <div style={{ minWidth: 0 }}>
              {/* Category label */}
              <div style={{ fontSize: 10, color: cat?.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                {cat?.label[language]}
              </div>
              {/* Title */}
              <div style={{
                fontSize: compact ? 13 : 15,
                fontWeight: 700,
                color: '#E5E7EB',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: compact ? 'nowrap' : 'normal',
              }}>
                {event.title[language]}
              </div>
            </div>
          </div>

          {/* Severity badge */}
          <div style={{
            padding: '3px 8px',
            borderRadius: 20,
            background: sev.bg,
            border: `1px solid ${sev.color}40`,
            fontSize: 10,
            fontWeight: 700,
            color: sev.color,
            flexShrink: 0,
          }}>
            {sev.label[language]}
          </div>
        </div>

        {/* Description (non-compact) */}
        {!compact && (
          <p style={{
            marginTop: 10,
            fontSize: 12,
            color: '#9CA3AF',
            lineHeight: 1.6,
            direction: isRTL ? 'rtl' : 'ltr',
          }}>
            {event.shortDescription[language]}
          </p>
        )}

        {/* Status + timing row */}
        <div style={{
          marginTop: compact ? 8 : 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          direction: isRTL ? 'rtl' : 'ltr',
        }}>
          {/* Status pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <motion.div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: stat?.color ?? '#6B7280',
              }}
              animate={
                event.status === 'active' || event.status === 'escalating'
                  ? { scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }
                  : {}
              }
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span style={{ fontSize: 11, color: stat?.color ?? '#6B7280', fontWeight: 600 }}>
              {stat?.label[language]}
            </span>
          </div>

          {/* Timing */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6B7280', fontSize: 11 }}>
            <Clock size={11} />
            {isUpcoming
              ? (language === 'ar' ? `يبدأ بعد ${daysUntil} يوم` : `Starts in ${daysUntil}d`)
              : isResolved
              ? (language === 'ar' ? 'منتهي' : 'Resolved')
              : daysLeft !== null
              ? (language === 'ar' ? `${daysLeft} يوم متبقي` : `${daysLeft}d left`)
              : (language === 'ar' ? 'مستمر' : 'Ongoing')}
          </div>
        </div>

        {/* Impact row */}
        {!compact && (
          <div style={{
            marginTop: 10,
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            direction: isRTL ? 'rtl' : 'ltr',
          }}>
            {/* Reward multiplier */}
            <ImpactChip
              label={language === 'ar' ? 'المكافآت' : 'Rewards'}
              value={formatImpactMultiplier(event.impactModifiers.rewardMultiplier, language)}
              positive={event.impactModifiers.rewardMultiplier >= 1}
            />
            {/* Cost inflation */}
            <ImpactChip
              label={language === 'ar' ? 'التكاليف' : 'Costs'}
              value={formatImpactMultiplier(event.impactModifiers.costInflation, language)}
              positive={event.impactModifiers.costInflation <= 1}
            />
            {/* XP modifier */}
            {event.impactModifiers.xpModifier !== 0 && (
              <ImpactChip
                label="XP"
                value={`${event.impactModifiers.xpModifier > 0 ? '+' : ''}${event.impactModifiers.xpModifier}`}
                positive={event.impactModifiers.xpModifier > 0}
              />
            )}
          </div>
        )}

        {/* Affected sectors (non-compact) */}
        {!compact && event.affectedSectors.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', gap: 4, flexWrap: 'wrap', direction: isRTL ? 'rtl' : 'ltr' }}>
            {event.affectedSectors.slice(0, 4).map((s) => (
              <span key={s} style={{
                fontSize: 10,
                padding: '2px 7px',
                borderRadius: 10,
                background: 'rgba(78,205,196,0.1)',
                border: '1px solid rgba(78,205,196,0.2)',
                color: '#7FDBCA',
                fontWeight: 500,
              }}>
                {SECTOR_META[s]?.emoji} {SECTOR_META[s]?.label[language]}
              </span>
            ))}
            {event.affectedSectors.length > 4 && (
              <span style={{ fontSize: 10, color: '#4B5563', padding: '2px 7px' }}>
                +{event.affectedSectors.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Resolution note */}
        {isResolved && event.resolutionNote && (
          <div style={{
            marginTop: 10,
            padding: '8px 10px',
            background: 'rgba(16,185,129,0.08)',
            borderRadius: 8,
            border: '1px solid rgba(16,185,129,0.2)',
            fontSize: 11,
            color: '#6EE7B7',
            direction: isRTL ? 'rtl' : 'ltr',
          }}>
            <CheckCircle size={11} style={{ display: 'inline', marginInlineEnd: 5 }} />
            {event.resolutionNote[language]}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function ImpactChip({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 3,
      padding: '3px 7px',
      borderRadius: 8,
      background: positive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
      border: `1px solid ${positive ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
      fontSize: 10,
      fontWeight: 600,
      color: positive ? '#6EE7B7' : '#FCA5A5',
    }}>
      {positive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      <span style={{ color: '#9CA3AF' }}>{label}:</span>
      <span>{value}</span>
    </div>
  );
}
