import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Sparkles,
  Building2,
  Rocket,
  Database
} from 'lucide-react';
import type { Colony, ColonyModule, ColonyResources, CosmicEvent } from '@/app/types/colony';

interface SpaceColonyProps {
  colony: Colony;
  onModuleClick: (module: ColonyModule) => void;
  onResourceCollect: (resources: ColonyResources) => void;
  language: 'en' | 'ar';
}

export function SpaceColony({ colony, onModuleClick, onResourceCollect, language }: SpaceColonyProps) {
  const [selectedModule, setSelectedModule] = useState<ColonyModule | null>(null);
  const [showResourceAnimation, setShowResourceAnimation] = useState(false);
  const [activeEvent, setActiveEvent] = useState<CosmicEvent | null>(null);

  // Calculate total production with event effects
  const calculateEffectiveProduction = () => {
    let production = { ...colony.totalProduction };
    
    // Apply cosmic event effects
    // This would be implemented based on active events
    
    return production;
  };

  const getResourceIcon = (type: keyof ColonyResources) => {
    switch (type) {
      case 'energy':
        return <Zap className="w-4 h-4" />;
      case 'credits':
        return <DollarSign className="w-4 h-4" />;
      case 'population':
        return <Users className="w-4 h-4" />;
    }
  };

  const getResourceColor = (type: keyof ColonyResources) => {
    switch (type) {
      case 'energy':
        return '#FFD700'; // Gold
      case 'credits':
        return '#4ECDC4'; // Turquoise
      case 'population':
        return '#FF6B9D'; // Pink
    }
  };

  const getModuleIcon = (type: ColonyModule['type']) => {
    switch (type) {
      case 'finance':
        return <DollarSign className="w-6 h-6" />;
      case 'marketing':
        return <TrendingUp className="w-6 h-6" />;
      case 'operations':
        return <Building2 className="w-6 h-6" />;
      case 'research':
        return <Sparkles className="w-6 h-6" />;
      case 'production':
        return <Rocket className="w-6 h-6" />;
      case 'logistics':
        return <Database className="w-6 h-6" />;
    }
  };

  return (
    <div className="relative w-full h-full min-h-[600px] bg-gradient-to-br from-[#0A0A1B] via-[#1A1A2E] to-[#0A0A1B] rounded-3xl overflow-hidden border border-white/10">
      {/* Animated Background Stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Resource Display Panel */}
      <motion.div
        className="absolute top-6 left-6 right-6 z-20"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            {/* Colony Name & Level */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4ECDC4] to-[#5DD9C1] flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">
                  {language === 'ar' ? colony.nameAr : colony.name}
                </h3>
                <p className="text-gray-400 text-sm">
                  {language === 'ar' ? 'المستوى' : 'Level'} {colony.level}
                </p>
              </div>
            </div>

            {/* Resources */}
            <div className="flex items-center gap-6">
              {(Object.keys(colony.resources) as Array<keyof ColonyResources>).map((resourceType) => (
                <motion.div
                  key={resourceType}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10"
                  whileHover={{ scale: 1.05 }}
                >
                  <div style={{ color: getResourceColor(resourceType) }}>
                    {getResourceIcon(resourceType)}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">
                      {Math.floor(colony.resources[resourceType]).toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-xs capitalize">
                      {resourceType}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-green-400 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    +{Math.floor(colony.totalProduction[resourceType])}/h
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Colony Health */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-white font-bold text-sm">
                  {colony.visualState.happiness}%
                </p>
                <p className="text-gray-400 text-xs">
                  {language === 'ar' ? 'الرضا' : 'Happiness'}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-xs">
                {language === 'ar' ? 'اكتمال المستعمرة' : 'Colony Completion'}
              </span>
              <span className="text-white text-xs font-bold">
                {colony.visualState.size}%
              </span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#4ECDC4] to-[#5DD9C1]"
                initial={{ width: 0 }}
                animate={{ width: `${colony.visualState.size}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Colony Modules Grid */}
      <div className="absolute inset-x-6 top-48 bottom-6 overflow-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {colony.modules.map((module, index) => (
            <motion.div
              key={module.id}
              className="relative group cursor-pointer"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: module.unlocked ? 1 : 0.8, 
                opacity: module.unlocked ? 1 : 0.3 
              }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: module.unlocked ? 1.05 : 0.8 }}
              onClick={() => module.unlocked && onModuleClick(module)}
            >
              {/* Module Card */}
              <div className={`
                relative h-48 rounded-2xl overflow-hidden border-2 transition-all
                ${module.unlocked 
                  ? 'bg-white/10 backdrop-blur-md border-white/20 hover:border-[#4ECDC4]/50' 
                  : 'bg-white/5 border-white/10'
                }
              `}>
                {/* Glow Effect */}
                {module.active && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4ECDC4]/20 to-[#5DD9C1]/20 blur-xl" />
                )}

                <div className="relative z-10 p-4 h-full flex flex-col">
                  {/* Icon & Level */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center
                      ${module.active 
                        ? 'bg-gradient-to-br from-[#4ECDC4] to-[#5DD9C1]' 
                        : 'bg-white/10'
                      }
                    `}>
                      <div className={module.active ? 'text-white' : 'text-gray-400'}>
                        {getModuleIcon(module.type)}
                      </div>
                    </div>
                    <div className="px-2 py-1 rounded-lg bg-white/10 text-white text-xs font-bold">
                      Lv.{module.level}
                    </div>
                  </div>

                  {/* Name */}
                  <h4 className="text-white font-bold text-sm mb-2">
                    {language === 'ar' ? module.nameAr : module.name}
                  </h4>

                  {/* Completion Progress */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400 text-xs">
                        {language === 'ar' ? 'التقدم' : 'Progress'}
                      </span>
                      <span className="text-white text-xs font-bold">
                        {module.completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#4ECDC4] to-[#5DD9C1]"
                        initial={{ width: 0 }}
                        animate={{ width: `${module.completionPercentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                    </div>
                  </div>

                  {/* Production Stats */}
                  {module.active && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">
                        +{module.resourceProduction.credits}/h
                      </span>
                    </div>
                  )}
                </div>

                {/* Lock Overlay */}
                {!module.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      </div>
                      <p className="text-white text-xs font-semibold">
                        {language === 'ar' ? 'مقفل' : 'Locked'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Pulse Animation */}
              {module.active && (
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-[#4ECDC4]"
                  animate={{
                    opacity: [0, 0.5, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cosmic Event Notification */}
      <AnimatePresence>
        {activeEvent && (
          <motion.div
            className="absolute bottom-6 left-6 right-6 z-30"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl border border-orange-500/50 p-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold">
                    {language === 'ar' ? activeEvent.nameAr : activeEvent.name}
                  </h4>
                  <p className="text-gray-300 text-sm">
                    {language === 'ar' ? activeEvent.descriptionAr : activeEvent.description}
                  </p>
                </div>
                <button
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors"
                  onClick={() => setActiveEvent(null)}
                >
                  {language === 'ar' ? 'حسناً' : 'OK'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
