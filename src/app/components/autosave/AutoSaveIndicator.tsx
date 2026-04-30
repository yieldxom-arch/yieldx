import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, CloudOff, Check, Loader2, WifiOff } from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';

interface AutoSaveIndicatorProps {
  /** If true, renders inline (no fixed positioning). Default: false (fixed). */
  inline?: boolean;
}

export function AutoSaveIndicator({ inline = false }: AutoSaveIndicatorProps) {
  const { autoSaveState, language, activeSavedProjectId } = useYieldX();

  // Only show if there is an active project being tracked
  if (!activeSavedProjectId) return null;

  const formatLastSaved = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (language === 'ar') {
      if (seconds < 5) return 'تم الحفظ الآن';
      if (seconds < 60) return `منذ ${seconds}ث`;
      if (minutes < 60) return `منذ ${minutes}د`;
      return `${date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      if (seconds < 5) return 'Saved just now';
      if (seconds < 60) return `${seconds}s ago`;
      if (minutes < 60) return `${minutes}m ago`;
      return date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
    }
  };

  const label = autoSaveState.isSaving
    ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...')
    : autoSaveState.hasUnsavedChanges
    ? (language === 'ar' ? 'تغييرات غير محفوظة' : 'Unsaved changes')
    : autoSaveState.lastSaved
    ? formatLastSaved(autoSaveState.lastSaved)
    : (language === 'ar' ? 'محفوظ محلياً' : 'Saved locally');

  const colorClass = autoSaveState.isSaving
    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
    : autoSaveState.hasUnsavedChanges
    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';

  const Icon = autoSaveState.isSaving
    ? Loader2
    : autoSaveState.hasUnsavedChanges
    ? (autoSaveState.lastSaved ? CloudOff : WifiOff)
    : Check;

  const badge = (
    <AnimatePresence mode="wait">
      <motion.div
        key={autoSaveState.isSaving ? 'saving' : autoSaveState.hasUnsavedChanges ? 'unsaved' : 'saved'}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all backdrop-blur-sm ${colorClass}`}
      >
        <Icon className={`w-3 h-3 ${autoSaveState.isSaving ? 'animate-spin' : ''}`} />
        <span>{label}</span>
        {!autoSaveState.isSaving && !autoSaveState.hasUnsavedChanges && (
          <span className="text-[10px] opacity-60">{language === 'ar' ? '☁️ سحابي' : '☁️ cloud'}</span>
        )}
      </motion.div>
    </AnimatePresence>
  );

  if (inline) return badge;

  return (
    <div className="fixed bottom-24 right-6 z-40">
      {badge}
    </div>
  );
}
