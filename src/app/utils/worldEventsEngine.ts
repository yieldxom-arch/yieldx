import type {
  WorldEvent,
  UserEventScore,
  UserEventReward,
  EventBadge,
  EventNotification,
  WorldEventsState,
  ImpactModifiers,
  AffectedSector,
} from '@/app/types/worldEvents';
import { SEED_WORLD_EVENTS, SEED_EVENT_BADGES } from '@/app/data/worldEventsData';

// ═══════════════════════════════════════════════════════════════════════════════
// WORLD EVENTS ENGINE — Core processing logic
// ═══════════════════════════════════════════════════════════════════════════════

const LS_KEY = 'yieldx_world_events_state';
const LS_USER_SCORES_KEY = 'yieldx_world_events_user_scores';

// ─── Persistence ──────────────────────────────────────────────────────────────

export function loadEventsState(): WorldEventsState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WorldEventsState;
      // Merge any new seed events not yet in state
      const existingIds = new Set(parsed.events.map((e) => e.id));
      const newEvents = SEED_WORLD_EVENTS.filter((e) => !existingIds.has(e.id));
      if (newEvents.length > 0) {
        parsed.events = [...parsed.events, ...newEvents];
      }
      return parsed;
    }
  } catch {}
  return buildInitialState();
}

export function saveEventsState(state: WorldEventsState): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {}
}

function buildInitialState(): WorldEventsState {
  const now = new Date().toISOString();
  return {
    events: SEED_WORLD_EVENTS,
    userScores: {},
    userRewards: [],
    badges: SEED_EVENT_BADGES,
    notifications: buildInitialNotifications(SEED_WORLD_EVENTS),
    activeEventIds: SEED_WORLD_EVENTS
      .filter((e) => e.status === 'active' || e.status === 'escalating')
      .map((e) => e.id),
    lastRecalculated: now,
  };
}

function buildInitialNotifications(events: WorldEvent[]): EventNotification[] {
  return events
    .filter((e) => e.status === 'active' || e.status === 'escalating' || e.status === 'upcoming')
    .map((e) => ({
      id: `notif-init-${e.id}`,
      eventId: e.id,
      type: e.status === 'upcoming' ? 'new_event' : e.status === 'escalating' ? 'escalation' : 'new_event',
      title: {
        ar: e.status === 'upcoming' ? `حدث قادم: ${e.title.ar}` : `حدث نشط: ${e.title.ar}`,
        en: e.status === 'upcoming' ? `Upcoming Event: ${e.title.en}` : `Active Event: ${e.title.en}`,
      },
      body: e.shortDescription,
      severity: e.severity,
      createdAt: e.startDate,
      readByUserIds: [],
    } as EventNotification));
}

// ─── Active event computation ─────────────────────────────────────────────────

export function getActiveEvents(events: WorldEvent[]): WorldEvent[] {
  const now = new Date();
  return events.filter((e) => {
    if (e.isPaused) return false;
    if (e.status === 'resolved') return false;
    const start = new Date(e.startDate);
    if (start > now) return false; // upcoming
    if (e.endDate) {
      const end = new Date(e.endDate);
      if (end < now) return false;
    }
    return true;
  });
}

export function getUpcomingEvents(events: WorldEvent[]): WorldEvent[] {
  const now = new Date();
  return events.filter((e) => {
    const start = new Date(e.startDate);
    return start > now && !e.isPaused;
  }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

export function getResolvedEvents(events: WorldEvent[]): WorldEvent[] {
  return events.filter((e) => e.status === 'resolved');
}

// ─── Aggregate impact calculation ─────────────────────────────────────────────

export function computeAggregateImpact(activeEvents: WorldEvent[]): ImpactModifiers {
  if (activeEvents.length === 0) {
    return {
      rewardMultiplier: 1,
      challengeDifficulty: 1,
      xpModifier: 0,
      costInflation: 1,
      marketVolatility: 0,
      rankingMomentum: 1,
    };
  }

  // Stack modifiers multiplicatively for multipliers, additively for flat values
  return activeEvents.reduce(
    (acc, ev) => ({
      rewardMultiplier: acc.rewardMultiplier * ev.impactModifiers.rewardMultiplier,
      challengeDifficulty: acc.challengeDifficulty * ev.impactModifiers.challengeDifficulty,
      xpModifier: acc.xpModifier + ev.impactModifiers.xpModifier,
      costInflation: acc.costInflation * ev.impactModifiers.costInflation,
      marketVolatility: Math.min(1, acc.marketVolatility + ev.impactModifiers.marketVolatility * 0.5),
      rankingMomentum: acc.rankingMomentum * ev.impactModifiers.rankingMomentum,
    }),
    {
      rewardMultiplier: 1,
      challengeDifficulty: 1,
      xpModifier: 0,
      costInflation: 1,
      marketVolatility: 0,
      rankingMomentum: 1,
    } as ImpactModifiers,
  );
}

// ─── Sector-specific impact ───────────────────────────────────────────────────

export function computeSectorImpact(
  activeEvents: WorldEvent[],
  sector: AffectedSector,
): { rewardDelta: number; riskDelta: number; trend: 'up' | 'down' | 'volatile' } {
  const affecting = activeEvents.filter((e) => e.affectedSectors.includes(sector));
  if (affecting.length === 0) return { rewardDelta: 0, riskDelta: 0, trend: 'up' };

  let rewardDelta = 0;
  let riskDelta = 0;

  for (const e of affecting) {
    rewardDelta += e.impactModifiers.rewardMultiplier - 1;
    riskDelta += e.impactModifiers.marketVolatility * 0.5;
  }

  const trend =
    rewardDelta > 0.15
      ? 'up'
      : rewardDelta < -0.1
      ? 'down'
      : 'volatile';

  return { rewardDelta, riskDelta, trend };
}

// ─── XP calculation with event modifiers ─────────────────────────────────────

export function computeEventXP(baseXP: number, activeEvents: WorldEvent[]): number {
  const impact = computeAggregateImpact(activeEvents);
  return Math.round(baseXP * impact.rewardMultiplier + impact.xpModifier);
}

// ─── User Impact Score ────────────────────────────────────────────────────────

export function initUserScore(userId: string): UserEventScore {
  return {
    userId,
    totalImpactScore: 0,
    adaptabilityScore: 0,
    riskManagementScore: 0,
    sustainabilityScore: 0,
    innovationScore: 0,
    crisisPerformanceScore: 0,
    eventsParticipated: [],
    lastUpdated: new Date().toISOString(),
  };
}

export function recordEventParticipation(
  score: UserEventScore,
  event: WorldEvent,
  performanceRatio: number, // 0..1 how well user performed
): UserEventScore {
  const alreadyParticipated = score.eventsParticipated.includes(event.id);
  const delta = Math.round(performanceRatio * 50); // up to 50 points per event

  const severityBonus = { low: 1, medium: 1.2, high: 1.5, critical: 2 }[event.severity] ?? 1;

  const updates: Partial<UserEventScore> = {
    eventsParticipated: alreadyParticipated
      ? score.eventsParticipated
      : [...score.eventsParticipated, event.id],
    totalImpactScore: Math.min(1000, score.totalImpactScore + Math.round(delta * severityBonus)),
    lastUpdated: new Date().toISOString(),
  };

  // Category-specific score updates
  switch (event.category) {
    case 'climate_disaster':
    case 'government_regulation':
      updates.sustainabilityScore = Math.min(100, score.sustainabilityScore + Math.round(delta * 0.8));
      break;
    case 'tech_breakthrough':
      updates.innovationScore = Math.min(100, score.innovationScore + Math.round(delta * 0.8));
      break;
    case 'war':
    case 'cyberattack':
      updates.crisisPerformanceScore = Math.min(100, score.crisisPerformanceScore + Math.round(delta * 0.8));
      updates.riskManagementScore = Math.min(100, score.riskManagementScore + Math.round(delta * 0.5));
      break;
    case 'economic_recession':
    case 'inflation':
    case 'oil_shock':
      updates.adaptabilityScore = Math.min(100, score.adaptabilityScore + Math.round(delta * 0.8));
      updates.riskManagementScore = Math.min(100, score.riskManagementScore + Math.round(delta * 0.5));
      break;
    case 'supply_chain':
    case 'energy_crisis':
      updates.adaptabilityScore = Math.min(100, score.adaptabilityScore + Math.round(delta * 0.6));
      break;
  }

  return { ...score, ...updates };
}

// ─── Badge eligibility check ─────────────────────────────────────────────────

export function checkBadgeEligibility(
  badges: EventBadge[],
  userScore: UserEventScore,
  events: WorldEvent[],
): string[] {
  const earned: string[] = [];

  for (const badge of badges) {
    switch (badge.id) {
      case 'badge-energy-survivor':
        if (userScore.eventsParticipated.some((id) => {
          const ev = events.find((e) => e.id === id);
          return ev?.category === 'energy_crisis';
        })) earned.push(badge.id);
        break;
      case 'badge-sustainability-defender':
        if (userScore.sustainabilityScore >= 30) earned.push(badge.id);
        break;
      case 'badge-resilient-investor':
        {
          const categories = new Set(
            userScore.eventsParticipated
              .map((id) => events.find((e) => e.id === id)?.category)
              .filter(Boolean),
          );
          if (categories.size >= 3) earned.push(badge.id);
        }
        break;
      case 'badge-crisis-strategist':
        if (userScore.crisisPerformanceScore >= 40) earned.push(badge.id);
        break;
      case 'badge-market-survivor':
        if (userScore.adaptabilityScore >= 50) earned.push(badge.id);
        break;
      case 'badge-innovation-leader':
        if (userScore.innovationScore >= 60) earned.push(badge.id);
        break;
      case 'badge-ai-hunter':
        if (
          userScore.innovationScore >= 40 &&
          userScore.eventsParticipated.some((id) => {
            const ev = events.find((e) => e.id === id);
            return ev?.category === 'tech_breakthrough';
          })
        ) earned.push(badge.id);
        break;
    }
  }

  return earned;
}

// ─── Notification helpers ─────────────────────────────────────────────────────

export function createEventNotification(
  event: WorldEvent,
  type: EventNotification['type'],
): EventNotification {
  const titles: Record<EventNotification['type'], { ar: string; en: string }> = {
    new_event:    { ar: `حدث عالمي جديد: ${event.title.ar}`, en: `New World Event: ${event.title.en}` },
    escalation:   { ar: `تصاعد: ${event.title.ar}`, en: `Escalating: ${event.title.en}` },
    reward:       { ar: `مكافأة من الحدث: ${event.title.ar}`, en: `Event Reward: ${event.title.en}` },
    badge:        { ar: `شارة جديدة مرتبطة بـ: ${event.title.ar}`, en: `New Badge from: ${event.title.en}` },
    market_shift: { ar: `تحول في السوق: ${event.title.ar}`, en: `Market Shift: ${event.title.en}` },
    resolution:   { ar: `انتهى الحدث: ${event.title.ar}`, en: `Event Resolved: ${event.title.en}` },
    warning:      { ar: `تحذير: ${event.title.ar}`, en: `Warning: ${event.title.en}` },
  };

  return {
    id: `notif-${event.id}-${type}-${Date.now()}`,
    eventId: event.id,
    type,
    title: titles[type],
    body: event.shortDescription,
    severity: event.severity,
    createdAt: new Date().toISOString(),
    readByUserIds: [],
  };
}

export function markNotificationsRead(
  notifications: EventNotification[],
  userId: string,
): EventNotification[] {
  return notifications.map((n) => ({
    ...n,
    readByUserIds: n.readByUserIds.includes(userId)
      ? n.readByUserIds
      : [...n.readByUserIds, userId],
  }));
}

// ─── Admin operations ─────────────────────────────────────────────────────────

export function createEvent(
  state: WorldEventsState,
  payload: Partial<WorldEvent>,
  adminId: string,
): WorldEventsState {
  const now = new Date().toISOString();
  const newEvent: WorldEvent = {
    id: `evt-custom-${Date.now()}`,
    title: payload.title ?? { ar: 'حدث جديد', en: 'New Event' },
    category: payload.category ?? 'economic_recession',
    severity: payload.severity ?? 'medium',
    description: payload.description ?? { ar: '', en: '' },
    shortDescription: payload.shortDescription ?? { ar: '', en: '' },
    startDate: payload.startDate ?? now,
    affectedSectors: payload.affectedSectors ?? [],
    impactModifiers: payload.impactModifiers ?? {
      rewardMultiplier: 1,
      challengeDifficulty: 1,
      xpModifier: 0,
      costInflation: 1,
      marketVolatility: 0,
      rankingMomentum: 1,
    },
    status: payload.status ?? 'upcoming',
    iconEmoji: payload.iconEmoji ?? '🌐',
    createdAt: now,
    updatedAt: now,
    createdBy: adminId,
    adminNote: payload.adminNote,
  };

  const notification = createEventNotification(newEvent, 'new_event');
  return {
    ...state,
    events: [...state.events, newEvent],
    notifications: [...state.notifications, notification],
    lastRecalculated: now,
  };
}

export function updateEvent(
  state: WorldEventsState,
  eventId: string,
  updates: Partial<WorldEvent>,
): WorldEventsState {
  const now = new Date().toISOString();
  return {
    ...state,
    events: state.events.map((e) =>
      e.id === eventId ? { ...e, ...updates, updatedAt: now } : e,
    ),
    activeEventIds: computeActiveIds(state.events.map((e) =>
      e.id === eventId ? { ...e, ...updates } : e,
    )),
    lastRecalculated: now,
  };
}

export function resolveEvent(
  state: WorldEventsState,
  eventId: string,
  resolutionNote: { ar: string; en: string },
): WorldEventsState {
  const event = state.events.find((e) => e.id === eventId);
  if (!event) return state;
  const notification = createEventNotification({ ...event, status: 'resolved' }, 'resolution');
  return updateEvent(
    { ...state, notifications: [...state.notifications, notification] },
    eventId,
    { status: 'resolved', endDate: new Date().toISOString(), resolutionNote },
  );
}

export function togglePauseEvent(state: WorldEventsState, eventId: string): WorldEventsState {
  const event = state.events.find((e) => e.id === eventId);
  if (!event) return state;
  return updateEvent(state, eventId, { isPaused: !event.isPaused });
}

export function deleteEvent(state: WorldEventsState, eventId: string): WorldEventsState {
  return {
    ...state,
    events: state.events.filter((e) => e.id !== eventId),
    activeEventIds: state.activeEventIds.filter((id) => id !== eventId),
    lastRecalculated: new Date().toISOString(),
  };
}

function computeActiveIds(events: WorldEvent[]): string[] {
  return getActiveEvents(events).map((e) => e.id);
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

export function formatImpactMultiplier(value: number, language: 'ar' | 'en'): string {
  const pct = Math.round((value - 1) * 100);
  if (pct === 0) return language === 'ar' ? 'لا تغيير' : 'No change';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct}%`;
}

export function getDaysRemaining(event: WorldEvent): number | null {
  if (!event.endDate) return null;
  const diff = new Date(event.endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getDaysUntilStart(event: WorldEvent): number {
  const diff = new Date(event.startDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
