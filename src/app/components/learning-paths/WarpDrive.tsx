import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  Star, 
  Zap, 
  Lock,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Award,
  MapPin
} from 'lucide-react';
import type { Galaxy, Star as StarType, Wormhole, AsteroidBelt, BlackHole } from '@/app/types/learning-paths';

interface WarpDriveProps {
  galaxies: Galaxy[];
  currentGalaxy: string;
  onGalaxySelect: (galaxyId: string) => void;
  onStarClick: (starId: string) => void;
  onWormholeClick: (wormholeId: string) => void;
  language: 'en' | 'ar';
  onBack?: () => void;
}

export function WarpDrive({ 
  galaxies, 
  currentGalaxy, 
  onGalaxySelect, 
  onStarClick,
  onWormholeClick,
  language,
  onBack
}: WarpDriveProps) {
  const [selectedGalaxy, setSelectedGalaxy] = useState<Galaxy | null>(
    galaxies.find(g => g.id === currentGalaxy) || null
  );
  const [hoveredStar, setHoveredStar] = useState<string | null>(null);
  const [view, setView] = useState<'map' | 'galaxy'>('map');

  const getGalaxyIcon = (type: Galaxy['type']) => {
    const icons: Record<Galaxy['type'], string> = {
      technology: '💻',
      retail: '🛍️',
      service: '🤝',
      manufacturing: '🏭',
      finance: '💰',
      healthcare: '🏥',
      education: '📚',
    };
    return icons[type] || '🌟';
  };

  const getStarSize = (star: StarType) => {
    const baseSize = star.type === 'milestone' ? 60 : 40;
    const brightnessBonus = (star.brightness / 100) * 20;
    return baseSize + brightnessBonus;
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#0A0A1B] via-[#1A1A2E] to-[#0A0A1B] relative overflow-hidden">
      {/* Animated Space Background */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-20 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md font-semibold"
              >
                ← {language === 'ar' ? 'العودة' : 'Back'}
              </button>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {language === 'ar' ? 'محرك الالتواء - مسارات التعلم' : 'Warp Drive - Learning Paths'}
              </h1>
              <p className="text-gray-400">
                {language === 'ar' 
                  ? 'اختر مجرتك واستكشف الكون' 
                  : 'Choose your galaxy and explore the universe'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                view === 'map'
                  ? 'bg-[#4ECDC4] text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
              onClick={() => setView('map')}
            >
              {language === 'ar' ? 'الخريطة' : 'Map'}
            </button>
            <button
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                view === 'galaxy'
                  ? 'bg-[#4ECDC4] text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
              onClick={() => setView('galaxy')}
              disabled={!selectedGalaxy}
            >
              {language === 'ar' ? 'المجرة' : 'Galaxy'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-[calc(100vh-120px)] px-8">
        <AnimatePresence mode="wait">
          {view === 'map' ? (
            /* Galaxy Map View */
            <motion.div
              key="map"
              className="h-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 h-full overflow-y-auto py-6">
                {galaxies.map((galaxy, index) => (
                  <motion.div
                    key={galaxy.id}
                    className="relative group cursor-pointer"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, z: 10 }}
                    onClick={() => {
                      if (galaxy.unlocked) {
                        setSelectedGalaxy(galaxy);
                        setView('galaxy');
                        onGalaxySelect(galaxy.id);
                      }
                    }}
                  >
                    {/* Galaxy Card */}
                    <div className={`
                      relative h-80 rounded-3xl overflow-hidden border-2 transition-all
                      ${galaxy.unlocked 
                        ? 'bg-white/10 backdrop-blur-md border-white/20 hover:border-[#4ECDC4]/50' 
                        : 'bg-white/5 border-white/10 opacity-50'
                      }
                    `}>
                      {/* Glow Effect */}
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          background: `radial-gradient(circle at center, ${galaxy.color}40, transparent)`,
                        }}
                      />

                      <div className="relative z-10 p-6 h-full flex flex-col">
                        {/* Icon */}
                        <div 
                          className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl"
                          style={{ backgroundColor: `${galaxy.color}20` }}
                        >
                          {getGalaxyIcon(galaxy.type)}
                        </div>

                        {/* Name */}
                        <h3 className="text-white font-bold text-xl text-center mb-2">
                          {language === 'ar' ? galaxy.nameAr : galaxy.name}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-400 text-sm text-center mb-4 flex-1">
                          {language === 'ar' ? galaxy.descriptionAr : galaxy.description}
                        </p>

                        {/* Stats */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">
                              {language === 'ar' ? 'النجوم' : 'Stars'}
                            </span>
                            <span className="text-white font-bold">
                              {galaxy.stars.length}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-400">
                              {language === 'ar' ? 'التقدم' : 'Progress'}
                            </span>
                            <span className="text-white font-bold">
                              {Math.round(galaxy.progress)}%
                            </span>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full"
                              style={{ backgroundColor: galaxy.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${galaxy.progress}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                            />
                          </div>
                        </div>

                        {/* Lock Overlay */}
                        {!galaxy.unlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-3xl">
                            <div className="text-center">
                              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-white font-semibold">
                                {language === 'ar' ? 'مقفل' : 'Locked'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Galaxy Detail View */
            selectedGalaxy && (
              <motion.div
                key="galaxy"
                className="h-full relative"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
              >
                {/* Galaxy Info Header */}
                <div className="absolute top-0 left-0 right-0 z-20 p-6 bg-gradient-to-b from-[#0A0A1B] to-transparent">
                  <div className="flex items-center gap-4 mb-4">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                      style={{ backgroundColor: `${selectedGalaxy.color}20` }}
                    >
                      {getGalaxyIcon(selectedGalaxy.type)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {language === 'ar' ? selectedGalaxy.nameAr : selectedGalaxy.name}
                      </h2>
                      <p className="text-gray-400">
                        {selectedGalaxy.stars.filter(s => s.completed).length} / {selectedGalaxy.stars.length} {language === 'ar' ? 'مكتمل' : 'completed'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Star Map */}
                <div className="h-full pt-32 overflow-hidden relative">
                  <svg 
                    viewBox="0 0 1200 800" 
                    className="w-full h-full"
                    style={{ minHeight: '600px' }}
                  >
                    {/* Connection Lines between stars */}
                    {selectedGalaxy.stars.map((star) =>
                      star.prerequisiteStars.map((prereqId) => {
                        const prereqStar = selectedGalaxy.stars.find(s => s.id === prereqId);
                        if (!prereqStar) return null;
                        
                        return (
                          <motion.line
                            key={`${prereqId}-${star.id}`}
                            x1={prereqStar.position.x}
                            y1={prereqStar.position.y}
                            x2={star.position.x}
                            y2={star.position.y}
                            stroke={star.unlocked ? selectedGalaxy.color : '#ffffff20'}
                            strokeWidth="2"
                            strokeDasharray={star.unlocked ? '0' : '5,5'}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.5 }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        );
                      })
                    )}

                    {/* Stars */}
                    {selectedGalaxy.stars.map((star, index) => {
                      const size = getStarSize(star);
                      
                      return (
                        <motion.g
                          key={star.id}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.05, type: 'spring' }}
                          onHoverStart={() => setHoveredStar(star.id)}
                          onHoverEnd={() => setHoveredStar(null)}
                          onClick={() => star.unlocked && onStarClick(star.id)}
                          style={{ cursor: star.unlocked ? 'pointer' : 'not-allowed' }}
                        >
                          {/* Glow Effect */}
                          {star.unlocked && (
                            <motion.circle
                              cx={star.position.x}
                              cy={star.position.y}
                              r={size / 2 + 10}
                              fill={selectedGalaxy.color}
                              opacity="0.3"
                              animate={{
                                scale: hoveredStar === star.id ? [1, 1.3, 1] : 1,
                                opacity: hoveredStar === star.id ? [0.3, 0.6, 0.3] : 0.3,
                              }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}

                          {/* Star Circle */}
                          <motion.circle
                            cx={star.position.x}
                            cy={star.position.y}
                            r={size / 2}
                            fill={star.completed ? '#4ECDC4' : (star.unlocked ? selectedGalaxy.color : '#ffffff20')}
                            stroke={hoveredStar === star.id ? '#ffffff' : (star.unlocked ? '#ffffff60' : '#ffffff20')}
                            strokeWidth="2"
                            animate={{
                              scale: hoveredStar === star.id ? 1.2 : 1,
                            }}
                          />

                          {/* Completed Check Mark */}
                          {star.completed && (
                            <text
                              x={star.position.x}
                              y={star.position.y + 5}
                              textAnchor="middle"
                              fontSize="20"
                              fill="white"
                            >
                              ✓
                            </text>
                          )}

                          {/* Lock Icon */}
                          {!star.unlocked && (
                            <text
                              x={star.position.x}
                              y={star.position.y + 5}
                              textAnchor="middle"
                              fontSize="16"
                              fill="#888888"
                            >
                              🔒
                            </text>
                          )}

                          {/* Star Name */}
                          <text
                            x={star.position.x}
                            y={star.position.y + size / 2 + 20}
                            textAnchor="middle"
                            fill="white"
                            fontSize="14"
                            fontWeight="bold"
                          >
                            {language === 'ar' ? star.nameAr : star.name}
                          </text>

                          {/* Hover Tooltip */}
                          <AnimatePresence>
                            {hoveredStar === star.id && (
                              <motion.g
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                              >
                                <rect
                                  x={star.position.x - 100}
                                  y={star.position.y - size / 2 - 60}
                                  width="200"
                                  height="50"
                                  rx="10"
                                  fill="#1A1A2E"
                                  stroke={selectedGalaxy.color}
                                  strokeWidth="2"
                                />
                                <text
                                  x={star.position.x}
                                  y={star.position.y - size / 2 - 35}
                                  textAnchor="middle"
                                  fill="white"
                                  fontSize="12"
                                  fontWeight="bold"
                                >
                                  {star.modules.length} {language === 'ar' ? 'وحدات' : 'modules'}
                                </text>
                                <text
                                  x={star.position.x}
                                  y={star.position.y - size / 2 - 20}
                                  textAnchor="middle"
                                  fill="#aaaaaa"
                                  fontSize="10"
                                >
                                  Level {star.level}
                                </text>
                              </motion.g>
                            )}
                          </AnimatePresence>
                        </motion.g>
                      );
                    })}

                    {/* Wormholes */}
                    {selectedGalaxy.wormholes?.map((wormhole, index) => {
                      const fromStar = selectedGalaxy.stars.find(s => s.id === wormhole.fromStar);
                      const toStar = selectedGalaxy.stars.find(s => s.id === wormhole.toStar);
                      
                      if (!fromStar || !toStar) return null;

                      return (
                        <motion.g
                          key={wormhole.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: wormhole.unlocked ? 1 : 0.3 }}
                          onClick={() => wormhole.unlocked && onWormholeClick(wormhole.id)}
                          style={{ cursor: wormhole.unlocked ? 'pointer' : 'not-allowed' }}
                        >
                          <motion.path
                            d={`M ${fromStar.position.x} ${fromStar.position.y} Q ${(fromStar.position.x + toStar.position.x) / 2} ${(fromStar.position.y + toStar.position.y) / 2 - 100} ${toStar.position.x} ${toStar.position.y}`}
                            stroke="#7F5AF0"
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray="10,5"
                            animate={{
                              strokeDashoffset: [0, -100],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />
                          <text
                            x={(fromStar.position.x + toStar.position.x) / 2}
                            y={(fromStar.position.y + toStar.position.y) / 2 - 100}
                            textAnchor="middle"
                            fill="#7F5AF0"
                            fontSize="12"
                            fontWeight="bold"
                          >
                            🌀 {wormhole.accelerationFactor}x
                          </text>
                        </motion.g>
                      );
                    })}
                  </svg>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}