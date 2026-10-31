import React, { Component, Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Circle, Lock, Map as MapIcon, Minus, Plus, RotateCcw, Sparkles as SparklesIcon, X, Box, List } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { translations } from '@/app/contexts/translations';
import { Card } from '@/app/components/ui/card';
import { OASIS_STATIONS } from './oasisData';
import type { StationState } from './OasisScene';

const OasisScene = lazy(() => import('./OasisScene'));

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
    console.warn('Oasis 3D view failed, showing the list instead:', error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const SEEN_KEY = 'yieldx_oasis_done';
const VIEW_KEY = 'yieldx_map_view';

/**
 * The level map as a 3D Omani oasis. Each level is a place on a falaj; finished
 * places come alive. A side panel shows the selected place and what it unlocks.
 * `renderList` shows the classic card grid (also used if WebGL is missing).
 */
export function OasisMap({ renderList }: { renderList: () => React.ReactNode }) {
  const { levels, setCurrentView, language, theme, activeSavedProjectId } = useYieldX();
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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [resetSignal, setResetSignal] = useState(0);
  const [celebrate, setCelebrate] = useState<number | null>(null);
  const [toast, setToast] = useState<number | null>(null);

  const stations: StationState[] = useMemo(() => {
    const done = levels.filter(l => l.completed).length;
    return OASIS_STATIONS.map(s => {
      if (s.levelId === -1) {
        return {
          levelId: -1,
          status: done >= 8 ? 'done' : 'active',
          progress: Math.min(1, done / 8),
          title: t.levels.capstoneFullTitle,
        } as StationState;
      }
      const level = levels.find(l => l.levelId === s.levelId);
      const progress = level ? Math.max(0, Math.min(1, (level.xp || 0) / (level.maxXp || 1))) : 0;
      return {
        levelId: s.levelId,
        status: level?.completed ? 'done' : level?.unlocked ? 'active' : 'locked',
        progress,
        title: (t.levels as any)[`level${s.levelId}Title`] || `Level ${s.levelId}`,
      } as StationState;
    });
  }, [levels, t]);

  const finished = stations.filter(s => s.levelId >= 0 && s.status === 'done').length;
  const firstOpen = stations.find(s => s.levelId >= 0 && s.status === 'active')?.levelId ?? -1;
  const [selected, setSelected] = useState<number | null>(firstOpen);

  // Celebrate places finished since the last visit (per study). Levels load a
  // moment after the map mounts, so wait until they settle before comparing.
  useEffect(() => {
    const doneIds = stations.filter(s => s.levelId >= 0 && s.status === 'done').map(s => s.levelId);
    const key = `${SEEN_KEY}:${activeSavedProjectId || 'default'}`;
    const settle = setTimeout(() => {
      let seen: number[] | null = null;
      try {
        const raw = localStorage.getItem(key);
        seen = raw ? JSON.parse(raw) : null;
        const union = Array.from(new Set([...(seen || []), ...doneIds]));
        localStorage.setItem(key, JSON.stringify(union));
      } catch {
        /* storage can be unavailable */
      }
      if (!seen) return;
      const fresh = doneIds.filter(id => !seen!.includes(id));
      if (!fresh.length) return;
      const id = fresh[fresh.length - 1];
      setCelebrate(id);
      setToast(id);
      setSelected(doneIds.length >= 8 ? -1 : id);
      setTimeout(() => setCelebrate(null), 6000);
    }, 1200);
    return () => clearTimeout(settle);
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
  const sel = OASIS_STATIONS.find(s => s.levelId === selected) ?? null;
  const selState = stations.find(s => s.levelId === selected) ?? null;
  const selLevel = selected !== null && selected >= 0 ? levels.find(l => l.levelId === selected) : undefined;
  const toastStation = OASIS_STATIONS.find(s => s.levelId === toast);

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
              `${finished} of 8 places in your oasis are alive. Finish a level to bring the next one to life.`,
              `${finished} من 8 أماكن في واحتك نابضة بالحياة. أكمل مستوى لتعيد الحياة إلى المكان التالي.`
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
              {tx('3D oasis', 'الواحة ثلاثية الأبعاد')}
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
          {/* The 3D world */}
          <div
            className={`relative lg:col-span-2 h-[440px] sm:h-[540px] rounded-2xl overflow-hidden border ${
              isDark
                ? 'bg-gradient-to-b from-[#141433] via-[#3a2252] to-[#7a4a3a] border-white/10'
                : 'bg-gradient-to-b from-[#bfe6f2] via-[#f7ecd6] to-[#f1d9ad] border-amber-200'
            }`}
          >
            <SceneBoundary fallback={<div className="p-4">{renderList()}</div>}>
              <Suspense
                fallback={
                  <div className="absolute inset-0 grid place-items-center text-slate-600 dark:text-slate-300 text-sm">
                    {tx('Building your oasis…', 'جارٍ بناء واحتك…')}
                  </div>
                }
              >
                <OasisScene
                  stations={stations}
                  selected={selected}
                  onSelect={setSelected}
                  celebrate={celebrate}
                  isDark={isDark}
                  isAr={isAr}
                  zoomLevel={zoomLevel}
                  resetSignal={resetSignal}
                />
              </Suspense>
            </SceneBoundary>

            {/* Controls */}
            <div className="absolute bottom-3 end-3 flex flex-col gap-1.5">
              {[
                { icon: Plus, label: tx('Zoom in', 'تكبير'), on: () => setZoomLevel(z => Math.min(1.8, z + 0.2)) },
                { icon: Minus, label: tx('Zoom out', 'تصغير'), on: () => setZoomLevel(z => Math.max(0.6, z - 0.2)) },
                {
                  icon: RotateCcw,
                  label: tx('Reset view', 'إعادة العرض'),
                  on: () => {
                    setZoomLevel(1);
                    setResetSignal(n => n + 1);
                  },
                },
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
              {tx('Drag to turn the oasis · click a place to open it', 'اسحب لتدوير الواحة · اضغط على مكان لفتحه')}
            </div>

          </div>

          {/* Details of the selected place */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/50 p-4 flex flex-col">
            {sel && selState ? (
              <>
                <AnimatePresence>
                  {toastStation && toast === selected && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mb-3 rounded-xl border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 p-3 text-sm"
                    >
                      <div className="flex items-start gap-2">
                        <SparklesIcon className="w-5 h-5 text-amber-500 shrink-0" />
                        <div className="flex-1 font-semibold text-slate-900 dark:text-white">
                          {tx(`${toastStation.place.en} is alive! You just finished this level.`, `${toastStation.place.ar} نابض بالحياة! أكملت هذا المستوى للتو.`)}
                        </div>
                        <button onClick={() => setToast(null)} aria-label={tx('Close', 'إغلاق')} className="text-slate-500 hover:text-slate-800 dark:hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center gap-2 text-xs font-medium text-[#2a9d94] dark:text-[#7FDBCA]">
                  <MapIcon className="w-4 h-4" />
                  {isAr ? sel.place.ar : sel.place.en}
                  {sel.levelId >= 0 && <span className="text-slate-500 dark:text-slate-400">· {tx(`Level ${sel.levelId}`, `المستوى ${sel.levelId}`)}</span>}
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
                    <div className="h-full bg-[#2a9d94] rounded-full transition-all" style={{ width: `${Math.round(selState.progress * 100)}%` }} />
                  </div>
                )}

                <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{isAr ? sel.alive.ar : sel.alive.en}</p>

                <h4 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{tx('What you get here', 'ما تحصل عليه هنا')}</h4>
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
              <p className="text-sm text-slate-600 dark:text-slate-300">{tx('Click a place in the oasis to see it here.', 'اضغط على مكان في الواحة لعرضه هنا.')}</p>
            )}
          </div>

          {/* Keyboard-friendly row of places */}
          <div className="lg:col-span-3 flex flex-wrap gap-2" aria-label={tx('Places', 'الأماكن')}>
            {OASIS_STATIONS.map(s => {
              const st = stations.find(x => x.levelId === s.levelId)!;
              return (
                <button
                  key={s.levelId}
                  onClick={() => setSelected(s.levelId)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                    selected === s.levelId
                      ? 'border-[#2a9d94] bg-[#2a9d94]/10 text-slate-900 dark:text-white'
                      : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {st.status === 'done' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : st.status === 'locked' ? <Lock className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5 text-amber-500" />}
                  {s.levelId >= 0 ? `${s.levelId} · ` : '★ '}
                  {isAr ? s.place.ar : s.place.en}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
