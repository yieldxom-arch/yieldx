import React, { Component, Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Award, Box, Check, CheckCircle2, Circle, Clock, List, Lock, Minus, Plus, RotateCcw, Sparkles as SparklesIcon, Star, X } from 'lucide-react';
import '@fontsource/noto-kufi-arabic/700.css';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { translations } from '@/app/contexts/translations';
import { Card } from '@/app/components/ui/card';
import { VALLEY_LEVELS } from './oasisData';
import type { StationState, TimeOfDay } from './ValleyScene';

const ValleyScene = lazy(() => import('./ValleyScene'));

/** Omani palette used across the journey screen. */
const C = {
  palm: '#174D3B',
  falaj: '#239C91',
  falajDark: '#16645d',
  sand: '#D7B889',
  terracotta: '#A76542',
  limestone: '#F4F0E7',
  charcoal: '#252C2A',
  gold: '#C9A227',
};

/** Faint eight-point-star lattice, a nod to Omani geometric ornament. */
const PATTERN = (stroke: string, opacity: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'><g fill='none' stroke='${stroke}' stroke-opacity='${opacity}' stroke-width='1'><rect x='16' y='16' width='24' height='24'/><rect x='16' y='16' width='24' height='24' transform='rotate(45 28 28)'/><circle cx='28' cy='28' r='5'/><path d='M0 0 L8 8 M56 0 L48 8 M0 56 L8 48 M56 56 L48 48'/></g></svg>`
  )}")`;

/** Rough time each level takes (shown as "about"). */
const EST_MIN: Record<number, number> = { 0: 3, 1: 10, 2: 10, 3: 10, 4: 15, 5: 10, 6: 20, 7: 15, [-1]: 5 };

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function useWide() {
  const q = '(min-width: 1024px)';
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
}

class SceneBoundary extends Component<{ fallback: React.ReactNode; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn('3D valley failed, showing the list instead:', error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const SEEN_KEY = 'yieldx_oasis_done';
const VIEW_KEY = 'yieldx_map_view';

const SKY: Record<TimeOfDay, string> = {
  day: 'linear-gradient(180deg,#9fd0ea 0%,#cfe6ee 38%,#f4e3c4 72%,#efd3a6 100%)',
  dusk: 'linear-gradient(180deg,#1f2050 0%,#5a3f78 40%,#c0686a 75%,#f0a46e 100%)',
  night: 'linear-gradient(180deg,#05071a 0%,#0e1438 50%,#1c2350 100%)',
};

/**
 * The level map as a living 3D Nizwa valley with a mission card, a top bar
 * (progress and XP) and a connected progress track.
 * `renderList` shows the classic card grid (also used if WebGL is missing).
 */
export function OasisMap({ renderList }: { renderList: () => React.ReactNode }) {
  const { levels, setCurrentView, language, theme, activeSavedProjectId, moduleData, totalXP, badges } = useYieldX();
  const t = translations[language];
  const isAr = language === 'ar';
  const isDark = theme === 'dark';
  const tx = (en: string, ar: string) => (isAr ? ar : en);
  const heading = isAr ? { fontFamily: '"Noto Kufi Arabic", system-ui, sans-serif' } : undefined;
  const wide = useWide();

  const webgl = useMemo(hasWebGL, []);
  const [view, setView] = useState<'3d' | 'list'>(() => {
    try {
      return (localStorage.getItem(VIEW_KEY) as '3d' | 'list') || '3d';
    } catch {
      return '3d';
    }
  });
  const [resetSignal, setResetSignal] = useState(0);
  const [zoom, setZoom] = useState({ n: 0, dir: 1 as 1 | -1 });
  const [fresh, setFresh] = useState<number | null>(null);
  const [banner, setBanner] = useState<number | null>(null);
  const [settled, setSettled] = useState(false);

  const stations: StationState[] = useMemo(() => {
    const done = levels.filter(l => l.completed).length;
    return VALLEY_LEVELS.map(v => {
      if (v.levelId === -1) {
        return { levelId: -1, status: done >= 8 ? 'done' : 'active', progress: Math.min(1, done / 8), title: t.levels.capstoneFullTitle } as StationState;
      }
      const level = levels.find(l => l.levelId === v.levelId);
      const progress = level ? Math.max(0, Math.min(1, (level.xp || 0) / (level.maxXp || 1))) : 0;
      return {
        levelId: v.levelId,
        status: level?.completed ? 'done' : level?.unlocked ? 'active' : 'locked',
        progress,
        title: (t.levels as any)[`level${v.levelId}Title`] || `Level ${v.levelId}`,
      } as StationState;
    });
  }, [levels, t]);

  const finished = stations.filter(s => s.levelId >= 0 && s.status === 'done').length;
  const current = stations.find(s => s.levelId >= 0 && s.status === 'active')?.levelId ?? null;
  const [selected, setSelectedRaw] = useState<number | null>(current ?? -1);
  const picked = useRef(false);
  const setSelected = (id: number | null) => {
    picked.current = true;
    setSelectedRaw(id);
  };
  const timeOfDay: TimeOfDay = finished >= 8 ? 'night' : isDark ? 'dusk' : 'day';
  const businessName = String(moduleData?.level1?.businessName || '').trim() || tx('Your business', 'مشروعك');
  const earnedBadges = (badges || []).filter(b => b.earnedAt).length;
  const xpOf = (id: number) => (id >= 0 ? levels.find(l => l.levelId === id)?.maxXp || 100 : levels.reduce((s, l) => s + (l.maxXp || 0), 0));

  // Find levels finished since the last visit (per study). Levels load a moment
  // after the map mounts, so wait until they settle before comparing.
  useEffect(() => {
    const doneIds = stations.filter(s => s.levelId >= 0 && s.status === 'done').map(s => s.levelId);
    const key = `${SEEN_KEY}:${activeSavedProjectId || 'default'}`;
    const timer = setTimeout(() => {
      let seen: number[] | null = null;
      try {
        const raw = localStorage.getItem(key);
        seen = raw ? JSON.parse(raw) : null;
        localStorage.setItem(key, JSON.stringify(Array.from(new Set([...(seen || []), ...doneIds]))));
      } catch {
        /* storage can be unavailable */
      }
      const freshIds = seen ? doneIds.filter(id => !seen!.includes(id)) : [];
      if (!freshIds.length && !picked.current) {
        // open on the level to do next
        setSelectedRaw(stations.find(s => s.levelId >= 0 && s.status === 'active')?.levelId ?? -1);
      }
      if (freshIds.length) {
        const id = freshIds[freshIds.length - 1];
        setFresh(id);
        setBanner(id);
        setSelectedRaw(id);
        setTimeout(() => setFresh(null), 9000);
        setTimeout(() => setBanner(null), 7000);
      }
      setSettled(true);
    }, 900);
    return () => clearTimeout(timer);
  }, [stations, activeSavedProjectId]);

  const changeView = (v: '3d' | 'list') => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* ignore */
    }
  };

  const showList = view === 'list' || !webgl;
  const sel = VALLEY_LEVELS.find(v => v.levelId === selected) ?? null;
  const selState = stations.find(s => s.levelId === selected) ?? null;
  const selLevel = selected !== null && selected >= 0 ? levels.find(l => l.levelId === selected) : undefined;
  const bannerState = stations.find(s => s.levelId === banner);

  const openSelected = () => {
    if (!selState || selState.status === 'locked') return;
    setCurrentView(selState.levelId === -1 ? 'business-plan' : `module-${selState.levelId}`);
  };

  // ─── Mission card ────────────────────────────────────────────────────────────
  const missionCard = sel && selState && (
    <div
      className="h-full flex flex-col rounded-2xl border shadow-2xl overflow-hidden"
      style={{
        background: isDark ? 'rgba(37,44,42,.94)' : 'rgba(244,240,231,.96)',
        backgroundImage: PATTERN(isDark ? C.sand : C.terracotta, isDark ? 0.08 : 0.1),
        borderColor: isDark ? 'rgba(215,184,137,.25)' : C.sand,
        color: isDark ? C.limestone : C.charcoal,
      }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${C.palm}, ${C.falaj}, ${C.gold}, ${C.terracotta})` }} />
      <div className="p-4 sm:p-5 flex-1 flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: selState.status === 'done' ? C.falaj : C.terracotta }}>
          <span>
            {selState.levelId === -1
              ? tx('Final mission', 'المهمة الأخيرة')
              : selState.status === 'done'
                ? tx('Mission complete', 'مهمة مكتملة')
                : selState.levelId === current
                  ? tx('Current mission', 'المهمة الحالية')
                  : selState.status === 'locked'
                    ? tx('Locked mission', 'مهمة مقفلة')
                    : tx('Mission', 'مهمة')}
          </span>
          <span className="opacity-70 normal-case">
            {selState.levelId >= 0 ? tx(`Level ${selState.levelId}`, `المستوى ${selState.levelId}`) : tx(`${finished} of 8 levels`, `${finished} من 8 مستويات`)}
          </span>
        </div>

        <h3 className="mt-2 text-xl sm:text-2xl font-bold leading-snug" style={heading}>
          {selState.title}
        </h3>
        <p className="mt-1.5 text-sm opacity-80">
          {selState.levelId >= 0 ? (t.levels as any)[`level${selState.levelId}Objective`] : isAr ? sel.change.ar : sel.change.en}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5 text-xs font-semibold">
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1" style={{ background: isDark ? 'rgba(244,240,231,.08)' : 'rgba(37,44,42,.06)' }}>
            <Clock className="w-3.5 h-3.5" />
            {tx(`about ${EST_MIN[selState.levelId]} min`, `حوالي ${EST_MIN[selState.levelId]} دقيقة`)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1" style={{ background: 'rgba(201,162,39,.16)', color: isDark ? '#f1d27a' : '#7a5f0d' }}>
            <Star className="w-3.5 h-3.5" />
            {tx(`+${xpOf(selState.levelId)} XP`, `+${xpOf(selState.levelId)} نقطة خبرة`)}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1"
            style={{
              background: selState.status === 'done' ? 'rgba(35,156,145,.16)' : selState.status === 'locked' ? 'rgba(37,44,42,.08)' : 'rgba(167,101,66,.14)',
              color: selState.status === 'done' ? (isDark ? '#7fe0d4' : C.falajDark) : undefined,
            }}
          >
            {selState.status === 'done' ? <CheckCircle2 className="w-3.5 h-3.5" /> : selState.status === 'locked' ? <Lock className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
            {selState.status === 'done'
              ? tx('Finished', 'مكتمل')
              : selState.status === 'locked'
                ? tx('Locked', 'مقفل')
                : selState.progress > 0
                  ? tx(`${Math.round(selState.progress * 100)}% done`, `أُنجز ${Math.round(selState.progress * 100)}%`)
                  : tx('Not started', 'لم تبدأ')}
          </span>
        </div>

        <div className="mt-4 rounded-xl p-3 text-sm" style={{ background: isDark ? 'rgba(35,156,145,.12)' : 'rgba(35,156,145,.08)', border: `1px solid ${isDark ? 'rgba(35,156,145,.3)' : 'rgba(35,156,145,.25)'}` }}>
          <div className="text-xs font-bold mb-1" style={{ color: isDark ? '#7fe0d4' : C.falajDark }}>
            {tx('In the valley', 'في الوادي')}
          </div>
          {isAr ? sel.change.ar : sel.change.en}
        </div>

        <div className="mt-4 text-xs font-bold" style={{ color: C.terracotta }}>
          {tx('You unlock', 'ستحصل على')}
        </div>
        <ul className="mt-1.5 space-y-1.5">
          {sel.features.map(f => (
            <li key={f.en} className="flex items-start gap-2 text-sm">
              {selState.status === 'done' ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.falaj }} />
              ) : (
                <Circle className="w-4 h-4 mt-0.5 shrink-0 opacity-40" />
              )}
              <span className="opacity-90">{isAr ? f.ar : f.en}</span>
            </li>
          ))}
        </ul>

        {selLevel?.deadline && (
          <p className="mt-3 text-xs" style={{ color: C.terracotta }}>
            {t.levels.deadlineText} {new Date(selLevel.deadline).toLocaleDateString(isAr ? 'ar-OM' : 'en-GB')}
          </p>
        )}
        {selLevel?.grade !== undefined && selLevel?.grade !== null && (
          <p className="mt-2 text-xs opacity-80">
            {t.levels.gradeLabel}: {selLevel.grade}%{selLevel.feedback ? ` · ${selLevel.feedback}` : ''}
          </p>
        )}

        <div className="mt-auto pt-5">
          <button
            onClick={openSelected}
            disabled={selState.status === 'locked'}
            className="w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition-transform active:translate-y-0.5 disabled:cursor-not-allowed"
            style={{
              background: selState.status === 'locked' ? '#8b8f8d' : `linear-gradient(180deg, ${C.falaj}, ${C.falajDark})`,
              boxShadow: selState.status === 'locked' ? 'none' : `0 4px 0 ${C.palm}, 0 10px 22px rgba(35,156,145,.35)`,
              border: `1px solid ${selState.status === 'locked' ? '#8b8f8d' : C.gold}`,
              ...heading,
            }}
          >
            {selState.status === 'locked'
              ? t.levels.requiresPreviousLevel
              : selState.levelId === -1
                ? tx('Open the full study', 'افتح الدراسة الكاملة')
                : selState.status === 'done'
                  ? tx('Review mission', 'راجع المهمة')
                  : selState.progress > 0
                    ? tx('Continue mission', 'تابع المهمة')
                    : tx('Start mission', 'ابدأ المهمة')}
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Progress track ──────────────────────────────────────────────────────────
  const track = (
    <div className="flex items-center rounded-2xl px-3 py-2.5 shadow-xl backdrop-blur-md" style={{ background: 'rgba(37,44,42,.72)', border: '1px solid rgba(215,184,137,.25)' }} dir={isAr ? 'rtl' : 'ltr'}>
      {stations.map((st, i) => {
        const isCur = st.levelId === current;
        const done = st.status === 'done';
        const locked = st.status === 'locked' && !isCur;
        const size = isCur ? 32 : done ? 24 : 20;
        return (
          <React.Fragment key={st.levelId}>
            <button
              onClick={() => setSelected(st.levelId)}
              title={st.title}
              aria-label={st.title}
              className="relative grid place-items-center rounded-full shrink-0 transition-transform hover:scale-110"
              style={{
                width: size,
                height: size,
                background: isCur ? C.falaj : done ? C.palm : st.levelId === -1 ? 'rgba(201,162,39,.25)' : 'rgba(244,240,231,.12)',
                border: `2px solid ${isCur ? C.gold : done ? '#9fe0c9' : selected === st.levelId ? C.limestone : 'rgba(244,240,231,.35)'}`,
                boxShadow: selected === st.levelId ? '0 0 0 3px rgba(244,240,231,.45)' : undefined,
              }}
            >
              {isCur && <span className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(201,162,39,.4)' }} />}
              {done ? (
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              ) : locked ? (
                <Lock className="w-2.5 h-2.5" style={{ color: C.limestone, opacity: 0.8 }} />
              ) : st.levelId === -1 ? (
                <Star className="w-3 h-3" style={{ color: C.gold }} />
              ) : (
                <span className="relative text-[11px] font-bold" style={{ color: C.limestone }}>
                  {st.levelId}
                </span>
              )}
            </button>
            {i < stations.length - 1 && (
              <span
                className="flex-1 mx-1 h-1 rounded-full min-w-[8px]"
                style={{
                  background: stations[i + 1].status === 'done' ? `linear-gradient(90deg, ${C.falaj}, #57c7b9)` : done ? `linear-gradient(90deg, ${C.falaj}, ${C.gold})` : 'rgba(244,240,231,.18)',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const progressPct = Math.round((finished / 8) * 100);

  return (
    <Card
      className="p-4 sm:p-6 shadow-2xl border"
      style={{
        background: isDark ? '#1d2322' : C.limestone,
        backgroundImage: PATTERN(isDark ? C.sand : C.terracotta, isDark ? 0.05 : 0.07),
        borderColor: isDark ? 'rgba(215,184,137,.18)' : C.sand,
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: isDark ? C.limestone : C.charcoal, ...heading }}>
            {t.dashboard.educationalPath}
          </h2>
          <p className="mt-1" style={{ color: isDark ? '#7fe0d4' : C.falajDark }}>
            {tx('Every finished level brings more of the valley to life.', 'كل مستوى تكمله يعيد الحياة إلى جزء جديد من الوادي.')}
          </p>
        </div>
        {webgl && (
          <div className="inline-flex rounded-xl overflow-hidden text-sm border" style={{ borderColor: isDark ? 'rgba(215,184,137,.3)' : C.sand }} role="tablist">
            {[
              { v: '3d' as const, icon: Box, label: tx('3D valley', 'الوادي ثلاثي الأبعاد') },
              { v: 'list' as const, icon: List, label: tx('List', 'قائمة') },
            ].map(({ v, icon: Icon, label }) => {
              const on = (v === 'list') === showList;
              return (
                <button
                  key={v}
                  role="tab"
                  aria-selected={on}
                  onClick={() => changeView(v)}
                  className="px-3 py-1.5 inline-flex items-center gap-1.5 font-medium"
                  style={{ background: on ? C.falaj : 'transparent', color: on ? '#fff' : isDark ? C.limestone : C.charcoal }}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {showList ? (
        <div>{renderList()}</div>
      ) : (
        <>
          <div className="relative h-[520px] lg:h-[660px] rounded-2xl overflow-hidden border" style={{ background: SKY[timeOfDay], borderColor: isDark ? 'rgba(215,184,137,.2)' : C.sand }}>
            <SceneBoundary fallback={<div className="p-4 bg-white/90 dark:bg-slate-900/80 h-full overflow-auto">{renderList()}</div>}>
              {settled ? (
                <Suspense fallback={<Loading text={tx('Building your valley…', 'جارٍ بناء واديك…')} />}>
                  <ValleyScene
                    stations={stations}
                    selected={selected}
                    onSelect={setSelected}
                    fresh={fresh}
                    timeOfDay={timeOfDay}
                    isAr={isAr}
                    businessName={businessName}
                    resetSignal={resetSignal}
                    zoomSignal={zoom.n}
                    zoomDir={zoom.dir}
                    current={current}
                    panelSide={wide ? (isAr ? 'right' : 'left') : 'none'}
                  />
                </Suspense>
              ) : (
                <Loading text={tx('Building your valley…', 'جارٍ بناء واديك…')} />
              )}
            </SceneBoundary>

            {/* Top bar: progress and XP */}
            <div
              className="absolute z-40 top-3 end-3 flex items-center gap-3 rounded-2xl px-3.5 py-2 shadow-xl backdrop-blur-md text-xs"
              style={{ background: 'rgba(37,44,42,.72)', border: '1px solid rgba(215,184,137,.25)', color: C.limestone }}
              dir={isAr ? 'rtl' : 'ltr'}
            >
              <div>
                <div className="font-bold" style={heading}>
                  {tx(`${finished} of 8 levels`, `${finished} من 8 مستويات`)}
                </div>
                <div className="mt-1 h-1.5 w-28 rounded-full overflow-hidden" style={{ background: 'rgba(244,240,231,.18)' }}>
                  <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${C.falaj}, ${C.gold})` }} />
                </div>
              </div>
              <div className="h-7 w-px" style={{ background: 'rgba(244,240,231,.2)' }} />
              <div className="inline-flex items-center gap-1 font-bold" style={{ color: '#f1d27a' }}>
                <Star className="w-4 h-4" />
                {totalXP} {tx('XP', 'نقطة')}
              </div>
              {earnedBadges > 0 && (
                <div className="inline-flex items-center gap-1 font-bold">
                  <Award className="w-4 h-4" style={{ color: C.sand }} />
                  {earnedBadges}
                </div>
              )}
            </div>

            {/* Mission card over the map on wide screens */}
            {wide && <div className="absolute z-40 top-3 bottom-3 start-3 w-[340px]">{missionCard}</div>}

            {/* Progress track */}
            <div className={`absolute z-40 bottom-3 ${wide ? 'start-[364px]' : 'start-3'} end-16`}>{track}</div>

            {/* Camera buttons */}
            <div className="absolute z-40 bottom-3 end-3 flex flex-col gap-1.5">
              {[
                { icon: Plus, label: tx('Zoom in', 'تكبير'), on: () => setZoom(z => ({ n: z.n + 1, dir: 1 })) },
                { icon: Minus, label: tx('Zoom out', 'تصغير'), on: () => setZoom(z => ({ n: z.n + 1, dir: -1 })) },
                { icon: RotateCcw, label: tx('Reset view', 'إعادة العرض'), on: () => setResetSignal(n => n + 1) },
              ].map(({ icon: Icon, label, on }) => (
                <button
                  key={label}
                  onClick={on}
                  title={label}
                  aria-label={label}
                  className="w-10 h-10 rounded-xl grid place-items-center shadow-lg backdrop-blur-md hover:brightness-125"
                  style={{ background: 'rgba(37,44,42,.72)', border: '1px solid rgba(215,184,137,.25)', color: C.limestone }}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Mission complete */}
            <AnimatePresence>
              {bannerState && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className={`absolute z-50 top-16 ${wide ? (isAr ? 'left-6' : 'right-6') : 'inset-x-3'} rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3`}
                  style={{ background: 'rgba(37,44,42,.88)', border: `1px solid ${C.gold}`, color: C.limestone }}
                  dir={isAr ? 'rtl' : 'ltr'}
                >
                  <div className="grid place-items-center w-10 h-10 rounded-full" style={{ background: `radial-gradient(circle, ${C.gold}, ${C.terracotta})` }}>
                    <SparklesIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold" style={heading}>
                      {tx('Mission complete!', 'أنجزت المهمة!')}
                    </div>
                    <div className="text-xs opacity-85">
                      {bannerState.title} · <span style={{ color: '#f1d27a' }}>{tx(`+${xpOf(bannerState.levelId)} XP`, `+${xpOf(bannerState.levelId)} نقطة خبرة`)}</span>
                    </div>
                  </div>
                  <button onClick={() => setBanner(null)} aria-label={tx('Close', 'إغلاق')} className="opacity-70 hover:opacity-100">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mission card below the map on small screens */}
          {!wide && <div className="mt-4">{missionCard}</div>}
        </>
      )}
    </Card>
  );
}

function Loading({ text }: { text: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="rounded-full px-4 py-2 text-sm shadow" style={{ background: 'rgba(37,44,42,.72)', color: '#F4F0E7' }}>
        {text}
      </div>
    </div>
  );
}
