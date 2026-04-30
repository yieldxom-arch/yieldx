// Warp Drive Learning Paths Types

export type GalaxyType = 'technology' | 'retail' | 'service' | 'manufacturing' | 'finance' | 'healthcare' | 'education';

export interface Galaxy {
  id: string;
  type: GalaxyType;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  color: string;
  unlocked: boolean;
  progress: number; // 0-100
  stars: Star[];
  wormholes: Wormhole[];
  asteroidBelts: AsteroidBelt[];
  blackHoles: BlackHole[];
  position: { x: number; y: number; z: number };
}

export interface Star {
  id: string;
  galaxyId: string;
  name: string;
  nameAr: string;
  type: 'main-course' | 'elective' | 'challenge' | 'milestone';
  level: number;
  unlocked: boolean;
  completed: boolean;
  prerequisiteStars: string[]; // Star IDs
  modules: LearningModule[];
  rewards: Reward[];
  position: { x: number; y: number };
  brightness: number; // 0-100, based on importance
}

export interface LearningModule {
  id: string;
  starId: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  type: 'video' | 'reading' | 'quiz' | 'project' | 'simulation' | 'discussion';
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  completed: boolean;
  score?: number;
  content: any; // Module-specific content
}

export interface Wormhole {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  fromGalaxy: string;
  toGalaxy: string;
  fromStar: string;
  toStar: string;
  unlockRequirement: {
    type: 'experience' | 'achievement' | 'score' | 'time-spent';
    value: number;
  };
  unlocked: boolean;
  accelerationFactor: number; // How much faster the path is
  icon: string;
}

export interface AsteroidBelt {
  id: string;
  galaxyId: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  specialty: 'crisis-management' | 'pitch-training' | 'negotiation' | 'leadership' | 'innovation' | 'scaling';
  microCourses: MicroCourse[];
  unlocked: boolean;
  position: { x: number; y: number };
}

export interface MicroCourse {
  id: string;
  title: string;
  titleAr: string;
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  certification: boolean;
  content: {
    lessons: number;
    quizzes: number;
    projects: number;
  };
}

export interface BlackHole {
  id: string;
  galaxyId: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  challengeType: 'market-crash' | 'competitor-attack' | 'funding-crisis' | 'scaling-challenge' | 'pivot-scenario';
  difficulty: 'extreme' | 'nightmare' | 'impossible';
  unlockRequirement: {
    minLevel: number;
    achievements: string[];
    score: number;
  };
  unlocked: boolean;
  attempts: number;
  bestScore?: number;
  rewards: Reward[];
  leaderboard: BlackHoleScore[];
  position: { x: number; y: number };
}

export interface BlackHoleScore {
  userId: string;
  userName: string;
  score: number;
  time: number; // seconds
  strategy: string;
  timestamp: number;
}

export interface Reward {
  id: string;
  type: 'xp' | 'credits' | 'badge' | 'certificate' | 'nft' | 'unlock' | 'cosmetic';
  value: number | string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'cosmic';
  icon: string;
  name: string;
  nameAr: string;
  claimed: boolean;
}

export interface LearningPath {
  id: string;
  userId: string;
  currentGalaxy: string;
  currentStar: string;
  visitedGalaxies: string[];
  completedStars: string[];
  unlockedWormholes: string[];
  totalXP: number;
  achievements: Achievement[];
  preferredLearningStyle: 'visual' | 'reading' | 'interactive' | 'mixed';
  recommendedPath: string[]; // Recommended sequence of stars
}

export interface Achievement {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'cosmic';
  unlockedAt?: number;
  progress: number; // 0-100
  requirements: string;
}
