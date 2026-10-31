// Shown after a level is saved successfully: one consistent way to move on.
// Levels announce completion with the 'yieldx:level-complete' event.

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, CheckCircle2, Map as MapIcon, X } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { translations } from '@/app/contexts/translations';

export function LevelCompleteBar() {
  const { setCurrentView, language, currentView } = useYieldX();
  const t = translations[language];
  const isAr = language === 'ar';
  const tx = (en: string, ar: string) => (isAr ? ar : en);
  const [levelId, setLevelId] = useState<number | null>(null);

  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent<{ levelId: number }>).detail?.levelId;
      if (typeof id === 'number') setLevelId(id);
    };
    window.addEventListener('yieldx:level-complete', on);
    return () => window.removeEventListener('yieldx:level-complete', on);
  }, []);

  // hide it when the user leaves the level
  useEffect(() => {
    if (levelId !== null && currentView !== `module-${levelId}`) setLevelId(null);
  }, [currentView]);

  const next = levelId !== null && levelId < 7 ? levelId + 1 : null;
  const nextTitle = next !== null ? (t.levels as any)[`level${next}Title`] : '';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <AnimatePresence>
      {levelId !== null && (
        <motion.div
          dir={isAr ? 'rtl' : 'ltr'}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="fixed bottom-24 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 rounded-2xl shadow-2xl px-4 py-3 flex flex-wrap items-center gap-3"
          style={{ background: 'rgba(37,44,42,.95)', border: '1px solid #C9A227', color: '#F4F0E7' }}
          role="status"
        >
          <CheckCircle2 className="w-6 h-6 shrink-0" style={{ color: '#57c7b9' }} />
          <div className="me-2">
            <div className="font-bold text-sm">{tx(`Level ${levelId} saved`, `تم حفظ المستوى ${levelId}`)}</div>
            <div className="text-xs opacity-80">
              {next !== null ? tx(`Next: ${nextTitle}`, `التالي: ${nextTitle}`) : tx('All levels done. Your full study is ready.', 'أكملت كل المستويات. دراستك الكاملة جاهزة.')}
            </div>
          </div>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold"
            style={{ background: 'rgba(244,240,231,.1)' }}
          >
            <MapIcon className="w-4 h-4" />
            {tx('Journey map', 'خريطة الرحلة')}
          </button>
          <button
            onClick={() => setCurrentView(next !== null ? `module-${next}` : 'full-study')}
            className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold text-white"
            style={{ background: 'linear-gradient(180deg,#239C91,#16645d)', border: '1px solid #C9A227' }}
          >
            {next !== null ? tx('Next level', 'المستوى التالي') : tx('Open the full study', 'افتح الدراسة الكاملة')}
            <Arrow className="w-4 h-4" />
          </button>
          <button onClick={() => setLevelId(null)} className="opacity-60 hover:opacity-100" aria-label={tx('Close', 'إغلاق')}>
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
