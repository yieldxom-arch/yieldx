// ═══════════════════════════════════════════════════════════════════════════════
// LIVE WORLD EVENTS — Core type definitions
// ═══════════════════════════════════════════════════════════════════════════════

export type EventCategory =
  | 'war'
  | 'economic_recession'
  | 'inflation'
  | 'oil_shock'
  | 'climate_disaster'
  | 'cyberattack'
  | 'tech_breakthrough'
  | 'government_regulation'
  | 'supply_chain'
  | 'energy_crisis';

export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';

export type EventStatus = 'upcoming' | 'active' | 'escalating' | 'de-escalating' | 'resolved';

export type AffectedSector =
  | 'technology'
  | 'energy'
  | 'finance'
  | 'agriculture'
  | 'manufacturing'
  | 'healthcare'
  | 'retail'
  | 'real_estate'
  | 'logistics'
  | 'sustainability';

export interface ImpactModifiers {
  rewardMultiplier: number;       // 0.5 = half rewards, 1.5 = 50% bonus
  challengeDifficulty: number;    // 1.0 = normal, 1.3 = 30% harder
  xpModifier: number;             // bonus or penalty XP
  costInflation: number;          // 1.0 = normal, 1.2 = 20% cost increase
  marketVolatility: number;       // 0..1 volatility index
  rankingMomentum: number;        // multiplier on ranking changes
}

export interface WorldEvent {
  id: string;
  title: { ar: string; en: string };
  category: EventCategory;
  severity: EventSeverity;
  description: { ar: string; en: string };
  shortDescription: { ar: string; en: string };
  startDate: string;            // ISO date string
  endDate?: string;             // undefined = ongoing
  affectedSectors: AffectedSector[];
  impactModifiers: ImpactModifiers;
  status: EventStatus;
  chainedEventIds?: string[];   // IDs of events this can trigger
  triggerCondition?: string;    // human-readable trigger description
  resolutionNote?: { ar: string; en: string };
  iconEmoji: string;
  badgeIds?: string[];          // event-specific badge IDs unlocked by this event
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;           // admin user ID
  isPaused?: boolean;
}

// ─── User's relationship to events ───────────────────────────────────────────

export interface UserEventScore {
  userId: string;
  totalImpactScore: number;       // 0–1000 overall Real-World Impact Score
  adaptabilityScore: number;      // how well they adapt to events
  riskManagementScore: number;
  sustainabilityScore: number;
  innovationScore: number;
  crisisPerformanceScore: number;
  eventsParticipated: string[];   // event IDs
  lastUpdated: string;
}

export interface UserEventReward {
  id: string;
  userId: string;
  eventId: string;
  xpEarned: number;
  bonusMultiplier: number;
  awardedAt: string;
  reason: { ar: string; en: string };
}

export interface EventBadge {
  id: string;
  eventId?: string;               // undefined = generic cross-event badge
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  iconEmoji: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlockCondition: string;        // human-readable condition
  isSecret: boolean;
  earnedByUserIds?: string[];
}

export interface EventNotification {
  id: string;
  eventId: string;
  type: 'new_event' | 'escalation' | 'reward' | 'badge' | 'market_shift' | 'resolution' | 'warning';
  title: { ar: string; en: string };
  body: { ar: string; en: string };
  severity: EventSeverity;
  createdAt: string;
  readByUserIds: string[];
}

// ─── Sector effect summary (for UI display) ──────────────────────────────────

export interface SectorEffect {
  sector: AffectedSector;
  label: { ar: string; en: string };
  rewardDelta: number;    // e.g. +0.3 = +30%
  riskDelta: number;      // e.g. +0.2 = +20% more risky
  trend: 'up' | 'down' | 'volatile';
}

// ─── Engine state ─────────────────────────────────────────────────────────────

export interface WorldEventsState {
  events: WorldEvent[];
  userScores: Record<string, UserEventScore>;   // keyed by userId
  userRewards: UserEventReward[];
  badges: EventBadge[];
  notifications: EventNotification[];
  activeEventIds: string[];
  lastRecalculated: string;
}

// ─── Admin operations ─────────────────────────────────────────────────────────

export interface CreateEventPayload {
  title: { ar: string; en: string };
  category: EventCategory;
  severity: EventSeverity;
  description: { ar: string; en: string };
  shortDescription: { ar: string; en: string };
  startDate: string;
  endDate?: string;
  affectedSectors: AffectedSector[];
  impactModifiers: ImpactModifiers;
  iconEmoji: string;
  adminNote?: string;
}
