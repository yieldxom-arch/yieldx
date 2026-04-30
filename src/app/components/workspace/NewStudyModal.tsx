import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Rocket, AlertTriangle, RefreshCw, PlusCircle, Sparkles } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';

interface NewStudyModalProps {
  onClose: () => void;
}

export function NewStudyModal({ onClose }: NewStudyModalProps) {
  const { language, resetFeasibilityStudy, setCurrentView, activeSavedProjectId, savedProjects } = useYieldX();
  const [step, setStep] = useState<'choose' | 'confirm'>('choose');
  const isRTL = language === 'ar';

  const activeProject = savedProjects.find(p => p.id === activeSavedProjectId);

  const handleStartFresh = () => {
    if (activeProject) {
      setStep('confirm');
    } else {
      doStartFresh();
    }
  };

  const doStartFresh = () => {
    resetFeasibilityStudy();
    setCurrentView('dashboard');
    onClose();
    toast.success(
      language === 'ar' ? '🚀 تم إنشاء دراسة جدوى جديدة!' : '🚀 New feasibility study started!',
      { description: language === 'ar' ? 'ابدأ من المستوى 0' : 'Start from Level 0' }
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 24 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 24 }}
          onClick={e => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{isRTL ? 'دراسة جدوى جديدة' : 'New Feasibility Study'}</h2>
                <p className="text-indigo-200 text-sm">{isRTL ? 'ابدأ مشروعاً من الصفر' : 'Start a project from scratch'}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {step === 'choose' ? (
              <>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                  {isRTL
                    ? 'ستبدأ دراسة جدوى جديدة من المستوى 0. يمكنك العودة إلى مشاريعك المحفوظة في أي وقت من "مساحة العمل".'
                    : 'You\'ll start a brand new feasibility study from Level 0. You can return to saved projects anytime from the Workspace.'}
                </p>

                <div className="space-y-3 mb-6">
                  {[
                    { icon: '🎯', text: isRTL ? 'اختر نوع مشروعك الجديد' : 'Choose your new project type' },
                    { icon: '📋', text: isRTL ? 'أكمل المستويات 0-7 بترتيب' : 'Complete levels 0–7 in order' },
                    { icon: '💾', text: isRTL ? 'احفظ مشروعك في أي وقت' : 'Save your project anytime' },
                    { icon: '📄', text: isRTL ? 'صدّر تقريرك النهائي بصيغة PDF' : 'Export your final report as PDF' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{item.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleStartFresh}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white gap-2 py-5"
                  >
                    <Rocket className="w-4 h-4" />
                    {isRTL ? 'ابدأ الآن' : 'Start Now'}
                  </Button>
                  <Button variant="outline" onClick={onClose} className="flex-1 py-5">
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Confirm step when there's an active unsaved project */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl mb-6">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                      {isRTL ? 'تنبيه: مشروع نشط' : 'Warning: Active Project'}
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      {isRTL
                        ? `المشروع الحالي "${activeProject?.name}" سيتم إلغاء تحديده. بياناته محفوظة في "مساحة العمل".`
                        : `The current project "${activeProject?.name}" will be deselected. Its data is saved in the Workspace.`}
                    </p>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                  {isRTL
                    ? 'هل تريد المتابعة وبدء دراسة جدوى جديدة تماماً؟'
                    : 'Do you want to continue and start a completely new feasibility study?'}
                </p>

                <div className="flex gap-3">
                  <Button
                    onClick={doStartFresh}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white gap-2 py-5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {isRTL ? 'نعم، ابدأ جديداً' : 'Yes, Start Fresh'}
                  </Button>
                  <Button variant="outline" onClick={() => setStep('choose')} className="flex-1 py-5">
                    {isRTL ? 'رجوع' : 'Back'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
