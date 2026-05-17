import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe, Plus, Edit3, Trash2, Pause, Play, Zap, CheckCircle,
  AlertTriangle, BarChart2, ChevronLeft, ChevronRight, Save, X,
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { useWorldEvents } from '@/app/contexts/WorldEventsContext';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { WorldEventCard } from '@/app/components/world-events/WorldEventCard';
import {
  EVENT_CATEGORY_META,
  SEVERITY_META,
  STATUS_META,
  SECTOR_META,
} from '@/app/data/worldEventsData';
import type { WorldEvent, EventCategory, EventSeverity, AffectedSector } from '@/app/types/worldEvents';

type AdminTab = 'overview' | 'events' | 'create';

const CATEGORIES: EventCategory[] = [
  'war', 'economic_recession', 'inflation', 'oil_shock',
  'climate_disaster', 'cyberattack', 'tech_breakthrough',
  'government_regulation', 'supply_chain', 'energy_crisis',
];

const SECTORS: AffectedSector[] = [
  'technology', 'energy', 'finance', 'agriculture',
  'manufacturing', 'healthcare', 'retail', 'real_estate', 'logistics', 'sustainability',
];

const SEVERITIES: EventSeverity[] = ['low', 'medium', 'high', 'critical'];

interface FormState {
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  shortDescAr: string;
  shortDescEn: string;
  category: EventCategory;
  severity: EventSeverity;
  startDate: string;
  endDate: string;
  sectors: AffectedSector[];
  iconEmoji: string;
  adminNote: string;
  rewardMultiplier: number;
  challengeDifficulty: number;
  xpModifier: number;
  costInflation: number;
  marketVolatility: number;
  rankingMomentum: number;
}

const defaultForm = (): FormState => ({
  titleAr: '', titleEn: '',
  descAr: '', descEn: '',
  shortDescAr: '', shortDescEn: '',
  category: 'economic_recession',
  severity: 'medium',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  sectors: [],
  iconEmoji: '🌐',
  adminNote: '',
  rewardMultiplier: 1,
  challengeDifficulty: 1,
  xpModifier: 0,
  costInflation: 1,
  marketVolatility: 0.3,
  rankingMomentum: 1,
});

export function WorldEventsAdmin() {
  const { language, user, setCurrentView } = useYieldX();
  const {
    events, activeEvents, upcomingEvents, resolvedEvents, notifications,
    adminCreateEvent, adminUpdateEvent, adminResolveEvent,
    adminTogglePause, adminDeleteEvent, adminTriggerEmergencyEvent,
  } = useWorldEvents();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [form, setForm] = useState<FormState>(defaultForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const isRTL = language === 'ar';

  if (user?.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', background: '#0F0F25', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#EF4444', fontSize: 16 }}>
          {language === 'ar' ? 'غير مصرح — يتطلب صلاحيات المدير' : 'Unauthorized — admin access required'}
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!form.titleAr || !form.titleEn) return;
    const payload = {
      title: { ar: form.titleAr, en: form.titleEn },
      description: { ar: form.descAr, en: form.descEn },
      shortDescription: { ar: form.shortDescAr, en: form.shortDescEn },
      category: form.category,
      severity: form.severity,
      startDate: new Date(form.startDate).toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      affectedSectors: form.sectors,
      iconEmoji: form.iconEmoji,
      adminNote: form.adminNote,
      impactModifiers: {
        rewardMultiplier: form.rewardMultiplier,
        challengeDifficulty: form.challengeDifficulty,
        xpModifier: form.xpModifier,
        costInflation: form.costInflation,
        marketVolatility: form.marketVolatility,
        rankingMomentum: form.rankingMomentum,
      },
      status: 'upcoming' as const,
    };

    if (editingId) {
      adminUpdateEvent(editingId, payload);
    } else {
      adminCreateEvent(payload, user.id);
    }
    setForm(defaultForm());
    setEditingId(null);
    setTab('events');
  };

  const startEdit = (event: WorldEvent) => {
    setForm({
      titleAr: event.title.ar,
      titleEn: event.title.en,
      descAr: event.description.ar,
      descEn: event.description.en,
      shortDescAr: event.shortDescription.ar,
      shortDescEn: event.shortDescription.en,
      category: event.category,
      severity: event.severity,
      startDate: event.startDate.split('T')[0],
      endDate: event.endDate?.split('T')[0] ?? '',
      sectors: [...event.affectedSectors],
      iconEmoji: event.iconEmoji,
      adminNote: event.adminNote ?? '',
      rewardMultiplier: event.impactModifiers.rewardMultiplier,
      challengeDifficulty: event.impactModifiers.challengeDifficulty,
      xpModifier: event.impactModifiers.xpModifier,
      costInflation: event.impactModifiers.costInflation,
      marketVolatility: event.impactModifiers.marketVolatility,
      rankingMomentum: event.impactModifiers.rankingMomentum,
    });
    setEditingId(event.id);
    setTab('create');
  };

  const tabs: { id: AdminTab; label: string; count?: number }[] = [
    { id: 'overview', label: language === 'ar' ? 'نظرة عامة' : 'Overview' },
    { id: 'events',   label: language === 'ar' ? 'الأحداث' : 'Events', count: events.length },
    { id: 'create',   label: editingId ? (language === 'ar' ? 'تعديل' : 'Edit') : (language === 'ar' ? 'إنشاء' : 'Create') },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F0F25 0%, #1B1B3A 100%)',
      direction: isRTL ? 'rtl' : 'ltr',
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(15,15,37,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(139,92,246,0.2)',
        padding: '14px 24px', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setCurrentView('world-events')}
              style={{ background: 'none', border: 'none', color: '#C4B5FD', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
            >
              {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              {language === 'ar' ? 'الأحداث العالمية' : 'World Events'}
            </button>
            <div style={{ width: 1, height: 20, background: 'rgba(139,92,246,0.3)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'linear-gradient(135deg, #8B5CF6, #1B1B3A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Globe size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#E5E7EB' }}>
                  {language === 'ar' ? 'لوحة إدارة الأحداث العالمية' : 'World Events Admin Panel'}
                </div>
                <div style={{ fontSize: 10, color: '#6B7280' }}>
                  {language === 'ar' ? 'للمديرين فقط' : 'Admin access only'}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => { if (t.id !== 'create') { setEditingId(null); setForm(defaultForm()); } setTab(t.id); }}
                style={{
                  padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', border: '1px solid',
                  borderColor: tab === t.id ? 'rgba(139,92,246,0.5)' : 'rgba(139,92,246,0.15)',
                  background: tab === t.id ? 'rgba(139,92,246,0.2)' : 'transparent',
                  color: tab === t.id ? '#C4B5FD' : '#6B7280',
                }}
              >
                {t.label}
                {t.count !== undefined && (
                  <span style={{ marginInlineStart: 5, background: 'rgba(139,92,246,0.25)', borderRadius: 8, padding: '1px 6px', fontSize: 10 }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: language === 'ar' ? 'أحداث نشطة' : 'Active Events',     value: activeEvents.length,   color: '#10B981', emoji: '🟢' },
              { label: language === 'ar' ? 'أحداث قادمة' : 'Upcoming Events',  value: upcomingEvents.length, color: '#3B82F6', emoji: '🔵' },
              { label: language === 'ar' ? 'أحداث منتهية' : 'Resolved Events', value: resolvedEvents.length, color: '#6B7280', emoji: '⚪' },
              { label: language === 'ar' ? 'إجمالي الإشعارات' : 'Total Notifications', value: notifications.length, color: '#F59E0B', emoji: '🔔' },
            ].map((stat) => (
              <Card key={stat.label} style={{
                background: 'rgba(27,27,58,0.9)', border: `1px solid ${stat.color}25`,
                borderRadius: 14, padding: 20, textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.emoji}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{stat.label}</div>
              </Card>
            ))}
          </div>
        )}

        {/* EVENTS TAB */}
        {tab === 'events' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <Button
                onClick={() => { setTab('create'); setEditingId(null); setForm(defaultForm()); }}
                style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', color: '#C4B5FD', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={14} />
                {language === 'ar' ? 'إنشاء حدث جديد' : 'Create New Event'}
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {events.map((event) => (
                <Card key={event.id} style={{
                  background: 'rgba(27,27,58,0.85)', border: '1px solid rgba(78,205,196,0.1)',
                  borderRadius: 12, padding: '12px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 22 }}>{event.iconEmoji}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#E5E7EB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {event.title[language]}
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: SEVERITY_META[event.severity]?.bg, color: SEVERITY_META[event.severity]?.color, fontWeight: 700 }}>
                            {SEVERITY_META[event.severity]?.label[language]}
                          </span>
                          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: 'rgba(75,85,99,0.3)', color: STATUS_META[event.status]?.color, fontWeight: 600 }}>
                            {STATUS_META[event.status]?.label[language]}
                          </span>
                          {event.isPaused && (
                            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: 'rgba(107,114,128,0.2)', color: '#6B7280', fontWeight: 600 }}>
                              ⏸ {language === 'ar' ? 'موقوف' : 'Paused'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {/* Emergency trigger */}
                      {event.status !== 'resolved' && (
                        <button
                          title={language === 'ar' ? 'تفعيل طارئ' : 'Emergency Trigger'}
                          onClick={() => adminTriggerEmergencyEvent(event.id)}
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: '#FCA5A5' }}
                        >
                          <Zap size={13} />
                        </button>
                      )}
                      {/* Pause/resume */}
                      {event.status !== 'resolved' && (
                        <button
                          title={event.isPaused ? (language === 'ar' ? 'استئناف' : 'Resume') : (language === 'ar' ? 'إيقاف مؤقت' : 'Pause')}
                          onClick={() => adminTogglePause(event.id)}
                          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: '#FDE68A' }}
                        >
                          {event.isPaused ? <Play size={13} /> : <Pause size={13} />}
                        </button>
                      )}
                      {/* Resolve */}
                      {event.status !== 'resolved' && (
                        <button
                          title={language === 'ar' ? 'إنهاء الحدث' : 'Resolve Event'}
                          onClick={() => setResolvingId(event.id)}
                          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: '#6EE7B7' }}
                        >
                          <CheckCircle size={13} />
                        </button>
                      )}
                      {/* Edit */}
                      <button
                        title={language === 'ar' ? 'تعديل' : 'Edit'}
                        onClick={() => startEdit(event)}
                        style={{ background: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.3)', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: '#4ECDC4' }}
                      >
                        <Edit3 size={13} />
                      </button>
                      {/* Delete */}
                      <button
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                        onClick={() => setConfirmDelete(event.id)}
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: '#FCA5A5' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Resolve panel */}
                  <AnimatePresence>
                    {resolvingId === event.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input
                            value={resolveNote}
                            onChange={(e) => setResolveNote(e.target.value)}
                            placeholder={language === 'ar' ? 'ملاحظة الإنهاء...' : 'Resolution note...'}
                            style={{
                              flex: 1, padding: '7px 12px', borderRadius: 8, fontSize: 12,
                              background: 'rgba(15,15,37,0.8)', border: '1px solid rgba(16,185,129,0.3)',
                              color: '#E5E7EB', outline: 'none',
                            }}
                          />
                          <Button
                            onClick={() => {
                              adminResolveEvent(event.id, { ar: resolveNote, en: resolveNote });
                              setResolvingId(null);
                              setResolveNote('');
                            }}
                            style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#6EE7B7', fontSize: 12 }}
                          >
                            {language === 'ar' ? 'إنهاء' : 'Resolve'}
                          </Button>
                          <button onClick={() => setResolvingId(null)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer' }}>
                            <X size={14} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              ))}
            </div>

            {/* Delete confirm */}
            <AnimatePresence>
              {confirmDelete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
                  }}
                  onClick={() => setConfirmDelete(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: '#1B1B3A', border: '1px solid rgba(239,68,68,0.4)',
                      borderRadius: 16, padding: 28, maxWidth: 360, width: '90%',
                    }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#FCA5A5', marginBottom: 10 }}>
                      {language === 'ar' ? '⚠ تأكيد الحذف' : '⚠ Confirm Delete'}
                    </div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 20 }}>
                      {language === 'ar' ? 'هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure? This action cannot be undone.'}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <Button
                        onClick={() => { adminDeleteEvent(confirmDelete); setConfirmDelete(null); }}
                        style={{ flex: 1, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#FCA5A5' }}
                      >
                        {language === 'ar' ? 'حذف' : 'Delete'}
                      </Button>
                      <Button
                        onClick={() => setConfirmDelete(null)}
                        style={{ flex: 1, background: 'rgba(75,85,99,0.2)', border: '1px solid rgba(75,85,99,0.3)', color: '#9CA3AF' }}
                      >
                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* CREATE / EDIT TAB */}
        {tab === 'create' && (
          <Card style={{ background: 'rgba(27,27,58,0.9)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#E5E7EB', marginBottom: 20 }}>
              {editingId ? (language === 'ar' ? '✏ تعديل الحدث' : '✏ Edit Event') : (language === 'ar' ? '+ إنشاء حدث جديد' : '+ Create New Event')}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <FieldGroup label={language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}>
                <input value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} style={inputStyle} placeholder="عنوان الحدث..." />
              </FieldGroup>
              <FieldGroup label={language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}>
                <input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} style={inputStyle} placeholder="Event title..." />
              </FieldGroup>

              <FieldGroup label={language === 'ar' ? 'وصف قصير (عربي)' : 'Short Description (Arabic)'}>
                <input value={form.shortDescAr} onChange={(e) => setForm({ ...form, shortDescAr: e.target.value })} style={inputStyle} placeholder="وصف مختصر..." />
              </FieldGroup>
              <FieldGroup label={language === 'ar' ? 'وصف قصير (إنجليزي)' : 'Short Description (English)'}>
                <input value={form.shortDescEn} onChange={(e) => setForm({ ...form, shortDescEn: e.target.value })} style={inputStyle} placeholder="Short description..." />
              </FieldGroup>

              <FieldGroup label={language === 'ar' ? 'الوصف الكامل (عربي)' : 'Full Description (Arabic)'} span>
                <textarea value={form.descAr} onChange={(e) => setForm({ ...form, descAr: e.target.value })} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="الوصف التفصيلي..." />
              </FieldGroup>
              <FieldGroup label={language === 'ar' ? 'الوصف الكامل (إنجليزي)' : 'Full Description (English)'} span>
                <textarea value={form.descEn} onChange={(e) => setForm({ ...form, descEn: e.target.value })} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Full description..." />
              </FieldGroup>

              <FieldGroup label={language === 'ar' ? 'الفئة' : 'Category'}>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as EventCategory })} style={inputStyle}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{EVENT_CATEGORY_META[c]?.emoji} {EVENT_CATEGORY_META[c]?.label[language]}</option>
                  ))}
                </select>
              </FieldGroup>
              <FieldGroup label={language === 'ar' ? 'الخطورة' : 'Severity'}>
                <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as EventSeverity })} style={inputStyle}>
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>{SEVERITY_META[s]?.label[language]}</option>
                  ))}
                </select>
              </FieldGroup>

              <FieldGroup label={language === 'ar' ? 'تاريخ البدء' : 'Start Date'}>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} style={inputStyle} />
              </FieldGroup>
              <FieldGroup label={language === 'ar' ? 'تاريخ الانتهاء (اختياري)' : 'End Date (optional)'}>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} style={inputStyle} />
              </FieldGroup>

              <FieldGroup label={language === 'ar' ? 'رمز الحدث (Emoji)' : 'Icon Emoji'}>
                <input value={form.iconEmoji} onChange={(e) => setForm({ ...form, iconEmoji: e.target.value })} style={inputStyle} maxLength={4} />
              </FieldGroup>
              <FieldGroup label={language === 'ar' ? 'ملاحظة المدير' : 'Admin Note'}>
                <input value={form.adminNote} onChange={(e) => setForm({ ...form, adminNote: e.target.value })} style={inputStyle} placeholder={language === 'ar' ? 'ملاحظة داخلية...' : 'Internal note...'} />
              </FieldGroup>

              {/* Sectors */}
              <FieldGroup label={language === 'ar' ? 'القطاعات المتأثرة' : 'Affected Sectors'} span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {SECTORS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((f) => ({
                        ...f,
                        sectors: f.sectors.includes(s) ? f.sectors.filter((x) => x !== s) : [...f.sectors, s],
                      }))}
                      style={{
                        padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        background: form.sectors.includes(s) ? 'rgba(78,205,196,0.2)' : 'rgba(75,85,99,0.15)',
                        border: `1px solid ${form.sectors.includes(s) ? 'rgba(78,205,196,0.4)' : 'rgba(75,85,99,0.3)'}`,
                        color: form.sectors.includes(s) ? '#4ECDC4' : '#6B7280',
                      }}
                    >
                      {SECTOR_META[s]?.emoji} {SECTOR_META[s]?.label[language]}
                    </button>
                  ))}
                </div>
              </FieldGroup>

              {/* Impact modifiers */}
              <FieldGroup label={language === 'ar' ? 'مضاعف المكافآت' : 'Reward Multiplier'}>
                <SliderField
                  value={form.rewardMultiplier} min={0.2} max={3} step={0.05}
                  onChange={(v) => setForm({ ...form, rewardMultiplier: v })}
                  format={(v) => `×${v.toFixed(2)}`}
                  color="#4ECDC4"
                />
              </FieldGroup>
              <FieldGroup label={language === 'ar' ? 'صعوبة التحديات' : 'Challenge Difficulty'}>
                <SliderField
                  value={form.challengeDifficulty} min={0.5} max={3} step={0.05}
                  onChange={(v) => setForm({ ...form, challengeDifficulty: v })}
                  format={(v) => `×${v.toFixed(2)}`}
                  color="#F59E0B"
                />
              </FieldGroup>
              <FieldGroup label="XP Modifier">
                <SliderField
                  value={form.xpModifier} min={-100} max={200} step={5}
                  onChange={(v) => setForm({ ...form, xpModifier: v })}
                  format={(v) => `${v > 0 ? '+' : ''}${v}`}
                  color={form.xpModifier >= 0 ? '#10B981' : '#EF4444'}
                />
              </FieldGroup>
              <FieldGroup label={language === 'ar' ? 'تضخم التكاليف' : 'Cost Inflation'}>
                <SliderField
                  value={form.costInflation} min={0.5} max={3} step={0.05}
                  onChange={(v) => setForm({ ...form, costInflation: v })}
                  format={(v) => `×${v.toFixed(2)}`}
                  color="#F97316"
                />
              </FieldGroup>
              <FieldGroup label={language === 'ar' ? 'تقلب السوق' : 'Market Volatility'}>
                <SliderField
                  value={form.marketVolatility} min={0} max={1} step={0.05}
                  onChange={(v) => setForm({ ...form, marketVolatility: v })}
                  format={(v) => `${Math.round(v * 100)}%`}
                  color="#8B5CF6"
                />
              </FieldGroup>
              <FieldGroup label={language === 'ar' ? 'زخم الترتيب' : 'Ranking Momentum'}>
                <SliderField
                  value={form.rankingMomentum} min={0.5} max={2} step={0.05}
                  onChange={(v) => setForm({ ...form, rankingMomentum: v })}
                  format={(v) => `×${v.toFixed(2)}`}
                  color="#7FDBCA"
                />
              </FieldGroup>
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <Button
                onClick={handleSubmit}
                disabled={!form.titleAr || !form.titleEn}
                style={{
                  background: 'linear-gradient(135deg, rgba(78,205,196,0.3), rgba(78,205,196,0.1))',
                  border: '1px solid rgba(78,205,196,0.5)', color: '#4ECDC4',
                  padding: '10px 28px', fontSize: 13, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6,
                  opacity: (!form.titleAr || !form.titleEn) ? 0.5 : 1,
                }}
              >
                <Save size={14} />
                {editingId ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (language === 'ar' ? 'إنشاء الحدث' : 'Create Event')}
              </Button>
              <Button
                onClick={() => { setForm(defaultForm()); setEditingId(null); setTab('events'); }}
                style={{ background: 'transparent', border: '1px solid rgba(75,85,99,0.3)', color: '#6B7280', padding: '10px 20px', fontSize: 13 }}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function FieldGroup({ label, children, span }: { label: string; children: React.ReactNode; span?: boolean }) {
  return (
    <div style={{ gridColumn: span ? '1 / -1' : undefined }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 12,
  background: 'rgba(15,15,37,0.8)', border: '1px solid rgba(78,205,196,0.2)',
  color: '#E5E7EB', outline: 'none', boxSizing: 'border-box',
};

function SliderField({
  value, min, max, step, onChange, format, color,
}: { value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ flex: 1, accentColor: color }}
      />
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 48, textAlign: 'center' }}>
        {format(value)}
      </span>
    </div>
  );
}
