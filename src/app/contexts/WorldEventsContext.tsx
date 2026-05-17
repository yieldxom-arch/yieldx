import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type {
  WorldEvent,
  WorldEventsState,
  UserEventScore,
  UserEventReward,
  EventBadge,
  EventNotification,
  ImpactModifiers,
  AffectedSector,
  CreateEventPayload,
} from '@/app/types/worldEvents';
import {
  loadEventsState,
  saveEventsState,
  getActiveEvents,
  getUpcomingEvents,
  getResolvedEvents,
  computeAggregateImpact,
  computeSectorImpact,
  computeEventXP,
  initUserScore,
  recordEventParticipation,
  checkBadgeEligibility,
  createEvent,
  updateEvent,
  resolveEvent,
  togglePauseEvent,
  deleteEvent,
  markNotificationsRead,
  createEventNotification,
} from '@/app/utils/worldEventsEngine';

// ═══════════════════════════════════════════════════════════════════════════════
// WORLD EVENTS CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════

interface WorldEventsContextValue {
  // State
  events: WorldEvent[];
  activeEvents: WorldEvent[];
  upcomingEvents: WorldEvent[];
  resolvedEvents: WorldEvent[];
  badges: EventBadge[];
  notifications: EventNotification[];

  // Computed
  aggregateImpact: ImpactModifiers;
  unreadCount: number;

  // User scores
  getUserScore: (userId: string) => UserEventScore;
  getUserBadges: (userId: string) => EventBadge[];

  // Participation
  participateInEvent: (userId: string, eventId: string, performanceRatio: number) => void;

  // XP
  computeXP: (baseXP: number) => number;
  getSectorImpact: (sector: AffectedSector) => ReturnType<typeof computeSectorImpact>;

  // Notifications
  markAllRead: (userId: string) => void;
  markRead: (userId: string, notifId: string) => void;

  // Admin operations
  adminCreateEvent: (payload: CreateEventPayload, adminId: string) => void;
  adminUpdateEvent: (eventId: string, updates: Partial<WorldEvent>) => void;
  adminResolveEvent: (eventId: string, note: { ar: string; en: string }) => void;
  adminTogglePause: (eventId: string) => void;
  adminDeleteEvent: (eventId: string) => void;
  adminTriggerEmergencyEvent: (eventId: string) => void;
}

const WorldEventsContext = createContext<WorldEventsContextValue | null>(null);

export function useWorldEvents(): WorldEventsContextValue {
  const ctx = useContext(WorldEventsContext);
  if (!ctx) throw new Error('useWorldEvents must be used inside WorldEventsProvider');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WorldEventsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorldEventsState>(() => loadEventsState());

  // Persist on every change
  useEffect(() => {
    saveEventsState(state);
  }, [state]);

  // ── Bridge 1: write aggregate impact to localStorage so YieldXContext can read it
  useEffect(() => {
    const active = getActiveEvents(state.events);
    const impact = computeAggregateImpact(active);
    try {
      localStorage.setItem('yieldx_events_impact', JSON.stringify({
        rewardMultiplier: impact.rewardMultiplier,
        xpModifier: impact.xpModifier,
        rankingMomentum: impact.rankingMomentum,
        activeEventIds: active.map((e) => e.id),
      }));
    } catch {}
  }, [state.events]);

  // ── Bridge 2: listen for level-complete DOM events and record participation
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { userId: string; levelId: number };
      if (!detail?.userId) return;
      const active = getActiveEvents(state.events);
      // Record participation for every active event at 0.75 performance ratio
      active.forEach((event) => {
        setState((prev) => {
          const existing = prev.userScores[detail.userId] ?? initUserScore(detail.userId);
          const updated = recordEventParticipation(existing, event, 0.75);
          return { ...prev, userScores: { ...prev.userScores, [detail.userId]: updated } };
        });
      });
    };
    window.addEventListener('yieldx:level-complete', handler);
    return () => window.removeEventListener('yieldx:level-complete', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.events]);

  // Recalculate active IDs every minute (events may cross their start date)
  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => {
        const active = getActiveEvents(prev.events);
        const activeIds = active.map((e) => e.id);
        if (JSON.stringify(activeIds) === JSON.stringify(prev.activeEventIds)) return prev;
        return { ...prev, activeEventIds: activeIds, lastRecalculated: new Date().toISOString() };
      });
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────

  const activeEvents = React.useMemo(() => getActiveEvents(state.events), [state.events]);
  const upcomingEvents = React.useMemo(() => getUpcomingEvents(state.events), [state.events]);
  const resolvedEvents = React.useMemo(() => getResolvedEvents(state.events), [state.events]);
  const aggregateImpact = React.useMemo(() => computeAggregateImpact(activeEvents), [activeEvents]);

  // ── User helpers ──────────────────────────────────────────────────────────

  const getUserScore = useCallback(
    (userId: string): UserEventScore =>
      state.userScores[userId] ?? initUserScore(userId),
    [state.userScores],
  );

  const getUserBadges = useCallback(
    (userId: string): EventBadge[] => {
      const score = state.userScores[userId] ?? initUserScore(userId);
      const earnedIds = checkBadgeEligibility(state.badges, score, state.events);
      return state.badges.filter((b) => earnedIds.includes(b.id));
    },
    [state.badges, state.userScores, state.events],
  );

  const participateInEvent = useCallback(
    (userId: string, eventId: string, performanceRatio: number) => {
      const event = state.events.find((e) => e.id === eventId);
      if (!event) return;
      const existing = state.userScores[userId] ?? initUserScore(userId);
      const updated = recordEventParticipation(existing, event, performanceRatio);

      // XP reward entry
      const reward: UserEventReward = {
        id: `reward-${userId}-${eventId}-${Date.now()}`,
        userId,
        eventId,
        xpEarned: computeEventXP(100, activeEvents),
        bonusMultiplier: aggregateImpact.rewardMultiplier,
        awardedAt: new Date().toISOString(),
        reason: { ar: 'المشاركة في الحدث', en: 'Event participation' },
      };

      // Badge check
      const earnedBadgeIds = checkBadgeEligibility(state.badges, updated, state.events);
      const badgeNotifs: EventNotification[] = earnedBadgeIds.map((badgeId) => {
        const badge = state.badges.find((b) => b.id === badgeId);
        return {
          id: `notif-badge-${badgeId}-${Date.now()}`,
          eventId,
          type: 'badge',
          title: {
            ar: `شارة جديدة: ${badge?.title.ar ?? badgeId}`,
            en: `New Badge: ${badge?.title.en ?? badgeId}`,
          },
          body: badge?.description ?? { ar: '', en: '' },
          severity: 'low',
          createdAt: new Date().toISOString(),
          readByUserIds: [],
        } as EventNotification;
      });

      setState((prev) => ({
        ...prev,
        userScores: { ...prev.userScores, [userId]: updated },
        userRewards: [...prev.userRewards, reward],
        notifications: [...prev.notifications, ...badgeNotifs],
      }));
    },
    [state, activeEvents, aggregateImpact],
  );

  // ── XP & sector ───────────────────────────────────────────────────────────

  const computeXP = useCallback(
    (baseXP: number) => computeEventXP(baseXP, activeEvents),
    [activeEvents],
  );

  const getSectorImpact = useCallback(
    (sector: AffectedSector) => computeSectorImpact(activeEvents, sector),
    [activeEvents],
  );

  // ── Notifications ─────────────────────────────────────────────────────────

  const unreadCount = React.useMemo(
    () => state.notifications.filter((n) => n.readByUserIds.length === 0).length,
    [state.notifications],
  );

  const markAllRead = useCallback((userId: string) => {
    setState((prev) => ({
      ...prev,
      notifications: markNotificationsRead(prev.notifications, userId),
    }));
  }, []);

  const markRead = useCallback((userId: string, notifId: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === notifId && !n.readByUserIds.includes(userId)
          ? { ...n, readByUserIds: [...n.readByUserIds, userId] }
          : n,
      ),
    }));
  }, []);

  // ── Admin operations ──────────────────────────────────────────────────────

  const adminCreateEvent = useCallback((payload: CreateEventPayload, adminId: string) => {
    setState((prev) => createEvent(prev, payload, adminId));
  }, []);

  const adminUpdateEvent = useCallback((eventId: string, updates: Partial<WorldEvent>) => {
    setState((prev) => updateEvent(prev, eventId, updates));
  }, []);

  const adminResolveEvent = useCallback((eventId: string, note: { ar: string; en: string }) => {
    setState((prev) => resolveEvent(prev, eventId, note));
  }, []);

  const adminTogglePause = useCallback((eventId: string) => {
    setState((prev) => togglePauseEvent(prev, eventId));
  }, []);

  const adminDeleteEvent = useCallback((eventId: string) => {
    setState((prev) => deleteEvent(prev, eventId));
  }, []);

  const adminTriggerEmergencyEvent = useCallback((eventId: string) => {
    setState((prev) => {
      const event = prev.events.find((e) => e.id === eventId);
      if (!event) return prev;
      const notif = createEventNotification({ ...event, severity: 'critical' }, 'warning');
      return {
        ...updateEvent(prev, eventId, { status: 'escalating', severity: 'critical' }),
        notifications: [...prev.notifications, notif],
      };
    });
  }, []);

  const value: WorldEventsContextValue = {
    events: state.events,
    activeEvents,
    upcomingEvents,
    resolvedEvents,
    badges: state.badges,
    notifications: state.notifications,
    aggregateImpact,
    unreadCount,
    getUserScore,
    getUserBadges,
    participateInEvent,
    computeXP,
    getSectorImpact,
    markAllRead,
    markRead,
    adminCreateEvent,
    adminUpdateEvent,
    adminResolveEvent,
    adminTogglePause,
    adminDeleteEvent,
    adminTriggerEmergencyEvent,
  };

  return (
    <WorldEventsContext.Provider value={value}>
      {children}
    </WorldEventsContext.Provider>
  );
}
