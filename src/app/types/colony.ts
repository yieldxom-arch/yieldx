// Space Colony Simulation Types

export interface ColonyResources {
  energy: number;
  credits: number;
  population: number;
}

export interface ColonyModule {
  id: string;
  name: string;
  nameAr: string;
  type: 'finance' | 'marketing' | 'operations' | 'research' | 'production' | 'logistics';
  level: number;
  unlocked: boolean;
  active: boolean;
  resourceProduction: ColonyResources; // Resources generated per hour
  resourceCost: ColonyResources; // Cost to build/upgrade
  completionPercentage: number; // Based on business plan section completion
  icon: string;
  position: { x: number; y: number }; // Position on colony map
  dependencies: string[]; // Module IDs that must be built first
}

export interface CosmicEvent {
  id: string;
  type: 'asteroid' | 'solar-flare' | 'meteor-shower' | 'nebula' | 'supernova' | 'wormhole';
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  duration: number; // in hours
  startTime: number; // timestamp
  endTime: number; // timestamp
  active: boolean;
  effects: {
    resourceMultiplier?: Partial<ColonyResources>; // e.g., { credits: 0.7 } = 30% decrease
    moduleEfficiency?: number; // 0.5 = 50% efficiency
    globalBonus?: Partial<ColonyResources>;
  };
  icon: string;
  color: string;
}

export interface Colony {
  id: string;
  name: string;
  nameAr: string;
  userId: string;
  level: number;
  modules: ColonyModule[];
  resources: ColonyResources;
  resourceCapacity: ColonyResources; // Maximum storage
  totalProduction: ColonyResources; // Per hour
  activeEvents: string[]; // CosmicEvent IDs
  visualState: {
    size: number; // 0-100, grows with completion
    buildings: number;
    population: number;
    happiness: number; // 0-100
  };
  lastUpdated: number; // timestamp
  createdAt: number;
}

export interface MarketCondition {
  id: string;
  sector: 'technology' | 'retail' | 'service' | 'manufacturing' | 'finance';
  trend: 'bearish' | 'neutral' | 'bullish';
  volatility: number; // 0-1
  sentiment: number; // -1 to 1
  lastUpdated: number;
}

// Market Reality Engine Types
export interface MarketSnapshot {
  timestamp: number;
  conditions: MarketCondition[];
  globalEvents: CosmicEvent[];
  economicIndex: number; // 0-200, 100 = normal
  competitionLevel: number; // 0-100
}

export interface CompetitorAI {
  id: string;
  name: string;
  sector: string;
  strategy: 'aggressive' | 'conservative' | 'adaptive';
  strength: number; // 0-100
  marketShare: number; // 0-100
  actions: CompetitorAction[];
}

export interface CompetitorAction {
  type: 'price-cut' | 'marketing-campaign' | 'product-launch' | 'expansion';
  impact: number;
  timestamp: number;
}
