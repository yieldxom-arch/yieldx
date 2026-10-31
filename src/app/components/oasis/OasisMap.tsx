import React, { Component, Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Box, CheckCircle2, Circle, List, Lock, Minus, Plus, RotateCcw, Sparkles as SparklesIcon, X } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { translations } from '@/app/contexts/translations';
import { Card } from '@/app/components/ui/card';
import { VALLEY_LEVELS } from './oasisData';
import type { StationState, TimeOfDay } from './ValleyScene';

const ValleyScene = lazy(() => import('./ValleyScene'));

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
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
 * The level map as a living 3D Nizwa valley. Each finished level brings a part
 * of the valley to life. A side panel shows the selected level and what it gives.
 * `renderList` shows the classic card grid (also used if WebGL is missing).
 */
export function OasisMap({ renderList }: { renderList: () => React.ReactNode }) {
  const { levels, setCurrentView, language, theme, activeSavedProjectId, moduleData } = useYieldX();
  const t = translations[language];
  const isAr = language === 'ar';
  const isDark = theme === 'dark';
  const tx = (en: string, ar: string) => (isAr ? ar : en);

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
  const firstOpen = stations.find(s => s.levelId >= 0 && s.status === 'active')?.levelId ?? -1;
  const [selected, setSelected] = useState<number | null>(firstOpen);
  const timeOfDay: TimeOfDay = finished >= 8 ? 'night' : isDark ? 'dusk' : 'day';
  const businessName = String(moduleData?.level1?.businessName || '').trim() || tx('Your business', 'مشروعك');

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
      if (freshIds.length) {
        const id = freshIds[freshIds.length - 1];
        setFresh(id);
        setBanner(id);
        setSelected(id);
        setTimeout(() => setFresh(null), 9000);
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

  const openSelected = () => {
    if (!selState || selState.status === 'locked') return;
    setCurrentView(selState.levelId === -1 ? 'business-plan' : `module-${selState.levelId}`);
  };

  const statusText = (s: StationState) =>
    s.status === 'done'
      ? tx('Finished', 'مكتمل')
      : s.status === 'locked'
        ? tx('Locked', 'مقفل')
        : s.progress > 0
          ? tx(`In progress · ${Math.round(s.progress * 100)}%`, `قيد العمل · ${Math.round(s.progress * 100)}%`)
          : tx('Ready to start', 'جاهز للبدء');

  return (
    <Card className="bg-white/90 dark:bg-[#1B1B3A]/60 backdrop-blur-xl border-[#4ECDC4]/30 dark:border-[#4ECDC4]/20 p-4 sm:p-6 shadow-2xl">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{t.dashboard.educationalPath}</h2>
          <p className="text-[#2a9d94] dark:text-[#7FDBCA] mt-1">
            {tx(
              `${finished} of 8 levels finished. Each level brings more of the valley to life.`,
              `أكملت ${finished} من 8 مستويات. كل مستوى يعيد الحياة إلى جزء جديد من الوادي.`
            )}
          </p>
        </div>
        {webgl && (
          <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden text-sm" role="tablist">
            <button
              role="tab"
              aria-selected={!showList}
              onClick={() => changeView('3d')}
              className={`px-3 py-1.5 inline-flex items-center gap-1.5 ${!showList ? 'bg-[#2a9d94] text-white' : 'text-slate-700 dark:text-slate-200'}`}
            >
              <Box className="w-4 h-4" />
              {tx('3D valley', 'الوادي ثلاثي الأبعاد')}
            </button>
            <button
              role="tab"
              aria-selected={showList}
              onClick={() => changeView('list')}
              className={`px-3 py-1.5 inline-flex items-center gap-1.5 ${showList ? 'bg-[#2a9d94] text-white' : 'text-slate-700 dark:text-slate-200'}`}
            >
              <List className="w-4 h-4" />
              {tx('List', 'قائمة')}
            </button>
          </div>
        )}
      </div>

      {showList ? (
        <div>{renderList()}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="relative lg:col-span-2 h-[460px] sm:h-[580px] rounded-2xl overflow-hidden border border-black/5 dark:border-white/10" style={{ background: SKY[timeOfDay] }}>
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
                  />
                </Suspense>
              ) : (
                <Loading text={tx('Building your valley…', 'جارٍ بناء واديك…')} />
              )}
            </SceneBoundary>

            <div className="absolute bottom-3 end-3 flex flex-col gap-1.5">
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
                  className="w-9 h-9 rounded-lg bg-white/85 dark:bg-slate-900/70 border border-white/60 dark:border-white/10 text-slate-800 dark:text-slate-100 grid place-items-center shadow hover:bg-white dark:hover:bg-slate-800"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
            <div className="absolute bottom-3 start-3 rounded-lg bg-white/80 dark:bg-slate-900/70 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 shadow max-w-[70%]">
              {tx('Drag to look around · click a level to fly there', 'اسحب للتجول · اضغط على مستوى للانتقال إليه')}
            </div>
          </div>

          {/* The selected level */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/50 p-4 flex flex-col">
            {sel && selState ? (
              <>
                <AnimatePresence>
                  {banner !== null && banner === selected && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mb-3 rounded-xl border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 p-3 text-sm"
                    >
                      <div className="flex items-start gap-2">
                        <SparklesIcon className="w-5 h-5 text-amber-500 shrink-0" />
                        <div className="flex-1 font-semibold text-slate-900 dark:text-white">
                          {tx('Level finished! Watch the valley come to life.', 'أكملت المستوى! شاهد الوادي ينبض بالحياة.')}
                        </div>
                        <button onClick={() => setBanner(null)} aria-label={tx('Close', 'إغلاق')} className="text-slate-500 hover:text-slate-800 dark:hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="text-xs font-medium text-[#2a9d94] dark:text-[#7FDBCA]">
                  {sel.levelId >= 0 ? tx(`Level ${sel.levelId}`, `المستوى ${sel.levelId}`) : tx('Final step', 'الخطوة الأخيرة')}
                </div>
                <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{selState.title}</h3>
                <div
                  className={`mt-2 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    selState.status === 'done'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200'
                      : selState.status === 'locked'
                        ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        : 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200'
                  }`}
                >
                  {selState.status === 'done' ? <CheckCircle2 className="w-3.5 h-3.5" /> : selState.status === 'locked' ? <Lock className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                  {statusText(selState)}
                </div>
                {selState.status !== 'locked' && (
                  <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full bg-[#2a9d94] rounded-full transition-all" style={{ width: `${Math.round((selState.status === 'done' ? 1 : selState.progress) * 100)}%` }} />
                  </div>
                )}

                <h4 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{tx('In the valley', 'في الوادي')}</h4>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{isAr ? sel.change.ar : sel.change.en}</p>

                <h4 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{tx('What you get in this level', 'ما تحصل عليه في هذا المستوى')}</h4>
                <ul className="mt-2 space-y-1.5">
                  {sel.features.map(f => (
                    <li key={f.en} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      {selState.status === 'done' ? (
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                      )}
                      <span>{isAr ? f.ar : f.en}</span>
                    </li>
                  ))}
                </ul>

                {selLevel?.deadline && (
                  <p className="mt-3 text-xs text-amber-800 dark:text-amber-300">
                    {t.levels.deadlineText} {new Date(selLevel.deadline).toLocaleDateString(isAr ? 'ar-OM' : 'en-GB')}
                  </p>
                )}
                {selLevel?.grade !== undefined && selLevel?.grade !== null && (
                  <p className="mt-2 text-xs text-slate-700 dark:text-slate-300">
                    {t.levels.gradeLabel}: {selLevel.grade}%{selLevel.feedback ? ` · ${selLevel.feedback}` : ''}
                  </p>
                )}

                <div className="mt-auto pt-4">
                  <button
                    onClick={openSelected}
                    disabled={selState.status === 'locked'}
                    className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-[#2a9d94] hover:bg-[#23857d] disabled:bg-slate-400 disabled:cursor-not-allowed"
                  >
                    {selState.status === 'locked'
                      ? t.levels.requiresPreviousLevel
                      : selState.levelId === -1
                        ? tx('Open the full study', 'افتح الدراسة الكاملة')
                        : selState.status === 'done'
                          ? tx('Review this level', 'مراجعة المستوى')
                          : selState.progress > 0
                            ? t.levels.continue
                            : t.levels.start}
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">{tx('Click a level in the valley to see it here.', 'اضغط على مستوى في الوادي لعرضه هنا.')}</p>
            )}
          </div>

          {/* Keyboard-friendly row of levels */}
          <div className="lg:col-span-3 flex flex-wrap gap-2" aria-label={tx('Levels', 'المستويات')}>
            {stations.map(st => (
              <button
                key={st.levelId}
                onClick={() => setSelected(st.levelId)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                  selected === st.levelId
                    ? 'border-[#2a9d94] bg-[#2a9d94]/10 text-slate-900 dark:text-white'
                    : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                }`}
              >
                {st.status === 'done' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : st.status === 'locked' ? <Lock className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5 text-amber-500" />}
                {st.levelId >= 0 ? `${st.levelId} · ` : '★ '}
                {st.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function Loading({ text }: { text: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="rounded-full bg-white/80 dark:bg-slate-900/70 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 shadow">{text}</div>
    </div>
  );
}
