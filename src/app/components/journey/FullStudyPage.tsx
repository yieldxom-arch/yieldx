// The journey's final step: the full feasibility study built from the levels.

import React, { useMemo } from 'react';
import { useYieldX, type SavedProject } from '@/app/contexts/YieldXContext';
import { FeasibilityStudyExport } from '@/app/components/reports/FeasibilityStudyExport';

export function FullStudyPage() {
  const { savedProjects, activeSavedProjectId, moduleData, levels, projectTypeData, setCurrentView, user, language } = useYieldX();

  const project: SavedProject = useMemo(() => {
    const saved = savedProjects.find(p => p.id === activeSavedProjectId);
    if (saved) return saved;
    const now = new Date().toISOString();
    const name =
      String(moduleData?.level1?.businessName || projectTypeData?.customName || '').trim() ||
      (language === 'ar' ? 'دراسة الجدوى' : 'Feasibility study');
    return {
      id: activeSavedProjectId || 'current',
      name,
      userId: user?.id || '',
      currentLevel: Math.max(0, ...levels.filter(l => l.completed).map(l => l.levelId)),
      status: levels.every(l => l.completed) ? 'completed' : 'in-progress',
      lastEditedDate: now,
      createdAt: now,
      source: 'manual',
      projectType: projectTypeData?.type,
      levelsSnapshot: levels,
      moduleDataSnapshot: moduleData,
    } as SavedProject;
  }, [savedProjects, activeSavedProjectId, moduleData, levels, projectTypeData, user, language]);

  return <FeasibilityStudyExport project={project} onClose={() => setCurrentView('dashboard')} />;
}
