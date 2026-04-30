import React from 'react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { WarpDrive } from '@/app/components/learning-paths/WarpDrive';
import { mockGalaxies } from '@/app/data/mockRevolutionaryData';

export function WarpDrivePage() {
  const { language, setCurrentView } = useYieldX();

  const handleGalaxySelect = (galaxyId: string) => {
    console.log('Selected galaxy:', galaxyId);
  };

  const handleStarClick = (starId: string) => {
    console.log('Clicked star:', starId);
    // Navigate to relevant module
  };

  const handleWormholeClick = (wormholeId: string) => {
    console.log('Clicked wormhole:', wormholeId);
  };

  return (
    <div className="relative">
      {/* Warp Drive Component with back button functionality */}
      <WarpDrive
        galaxies={mockGalaxies}
        currentGalaxy="galaxy-tech"
        language={language}
        onGalaxySelect={handleGalaxySelect}
        onStarClick={handleStarClick}
        onWormholeClick={handleWormholeClick}
        onBack={() => setCurrentView('dashboard')}
      />
    </div>
  );
}