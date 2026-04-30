import React from 'react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { SpaceColony } from '@/app/components/colony/SpaceColony';
import { createMockColony } from '@/app/data/mockRevolutionaryData';
import type { ColonyModule } from '@/app/types/colony';

export function ColonyPage() {
  const { user, language, setCurrentView } = useYieldX();
  
  // Create mock colony for the user
  const colony = user ? createMockColony(user.id) : createMockColony('demo');

  const handleModuleClick = (module: ColonyModule) => {
    // Navigate to the relevant business plan module
    const moduleMap: Record<string, string> = {
      'finance': 'module-7',
      'marketing': 'module-2',
      'operations': 'module-5',
      'research': 'module-6',
    };
    
    const viewId = moduleMap[module.type];
    if (viewId) {
      setCurrentView(viewId);
    }
  };

  const handleResourceCollect = () => {
    console.log('Resources collected!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A1B] via-[#1A1A2E] to-[#0A0A1B]">
      {/* Header */}
      <div className="px-8 py-6">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="mb-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          ← {language === 'ar' ? 'العودة للوحة القيادة' : 'Back to Dashboard'}
        </button>
      </div>

      {/* Colony Component */}
      <div className="px-8 pb-8">
        <SpaceColony
          colony={colony}
          language={language}
          onModuleClick={handleModuleClick}
          onResourceCollect={handleResourceCollect}
        />
      </div>
    </div>
  );
}
