import React from 'react';
import { motion } from 'motion/react';
import {
  Users,
  TrendingUp,
  Package,
  UserPlus,
  Settings,
  BarChart3,
  DollarSign,
  FileText,
  Lock,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { useYieldX } from '@/app/contexts/YieldXContext';
import { Card } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { CompletionReport } from '@/app/components/reports/CompletionReport';

const levelIcons = [
  Users,
  TrendingUp,
  Package,
  UserPlus,
  Settings,
  BarChart3,
  DollarSign,
  FileText,
];

const levelColors = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-green-500 to-emerald-500',
  'from-yellow-500 to-orange-500',
  'from-red-500 to-pink-500',
  'from-indigo-500 to-purple-500',
  'from-teal-500 to-green-500',
  'from-fuchsia-500 to-purple-500',
];

export function SpaceMap() {
  const { levels, setCurrentView } = useYieldX();

  const handleLevelClick = (levelId: number, unlocked: boolean) => {
    if (unlocked) {
      setCurrentView(`module-${levelId}`);
    }
  };

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Card className="bg-white/5 backdrop-blur-md border-white/10 p-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-2">خريطة رحلتك الفضائية</h2>
            <p className="text-purple-300">
              اكمل جميع المستويات لتصل إلى النجاح الريادي الكامل
            </p>
          </div>

          {/* Levels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {levels.map((level, index) => {
              const Icon = levelIcons[index];
              const colorClass = levelColors[index];
              const progress = (level.xp / level.maxXp) * 100;

              return (
                <motion.div
                  key={level.levelId}
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="relative"
                >
                  {/* Connection Line */}
                  {index < levels.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 left-full w-6 h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent -translate-y-1/2 z-0" />
                  )}

                  <motion.div
                    whileHover={level.unlocked ? { scale: 1.05 } : {}}
                    className={`relative ${
                      level.unlocked ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                    onClick={() => handleLevelClick(level.levelId, level.unlocked)}
                  >
                    <Card
                      className={`relative overflow-hidden border-2 transition-all ${
                        level.completed
                          ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-green-500/50'
                          : level.unlocked
                          ? `bg-gradient-to-br ${colorClass}/20 border-purple-500/50`
                          : 'bg-black/40 border-gray-700/50'
                      }`}
                    >
                      {/* Animated Background */}
                      {level.unlocked && !level.completed && (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent animate-pulse" />
                      )}

                      <div className="p-6 relative z-10">
                        {/* Level Number Badge */}
                        <div className="absolute top-2 right-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              level.completed
                                ? 'bg-green-500 text-white'
                                : level.unlocked
                                ? `bg-gradient-to-br ${colorClass} text-white`
                                : 'bg-gray-700 text-gray-400'
                            }`}
                          >
                            {level.levelId}
                          </div>
                        </div>

                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                          <div
                            className={`w-20 h-20 rounded-full flex items-center justify-center ${
                              level.completed
                                ? 'bg-green-500/20'
                                : level.unlocked
                                ? `bg-gradient-to-br ${colorClass}/20`
                                : 'bg-gray-700/20'
                            }`}
                          >
                            {level.unlocked ? (
                              level.completed ? (
                                <CheckCircle className="w-10 h-10 text-green-400" />
                              ) : (
                                <Icon
                                  className={`w-10 h-10 ${
                                    level.unlocked ? 'text-white' : 'text-gray-500'
                                  }`}
                                />
                              )
                            ) : (
                              <Lock className="w-10 h-10 text-gray-500" />
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h3
                          className={`text-center text-lg font-bold mb-3 ${
                            level.unlocked ? 'text-white' : 'text-gray-500'
                          }`}
                        >
                          {level.title}
                        </h3>

                        {/* Progress */}
                        {level.unlocked && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-purple-300">XP</span>
                              <span className="text-white font-bold">
                                {level.xp} / {level.maxXp}
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}

                        {/* Status */}
                        <div className="mt-4 text-center">
                          {level.completed ? (
                            <span className="text-green-400 text-sm font-semibold">
                              ✓ مكتمل
                            </span>
                          ) : level.unlocked ? (
                            <Button
                              size="sm"
                              className={`bg-gradient-to-r ${colorClass} hover:opacity-90 w-full text-white font-semibold`}
                            >
                              ابدأ المهمة
                            </Button>
                          ) : (
                            <span className="text-gray-500 text-sm">🔒 مقفل</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Completion Message */}
          {levels.every((l) => l.completed) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-12 text-center"
            >
              <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 p-8">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-3xl font-bold text-white mb-2">
                  مبروك! أنجزت كل المستويات
                </h3>
                <p className="text-yellow-300">
                  لقد أكملت دراسة الجدوى الكاملة لمشروعك
                </p>
                <Button
                  className="mt-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  size="lg"
                >
                  تنزيل دراسة الجدوى PDF
                </Button>
              </Card>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}