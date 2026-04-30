import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase as sbClient } from '/utils/supabase/client';
import type { Language, Translations } from './translations';
import { translations } from './translations';

// ═══════════════════════════════════════════════════════════════════════════════
// HYBRID MODE — Uses Supabase when online, localStorage when offline.
// Automatically syncs pending changes when reconnecting.
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// PROJECT PERSISTENCE ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════════
// Projects are persisted using a dual-layer approach for reliability:
// 
// 1. PRIMARY: Supabase KV Store (Server-side)
//    - Projects are saved to server via POST /projects
//    - Projects are loaded from server on login via GET /projects?userId=...
//    - Auto-save syncs changes every 3 seconds to server
// 
// 2. FALLBACK: localStorage (Client-side)
//    - Projects are also saved to localStorage for offline access
//    - If server fetch fails, projects load from localStorage
//    - Key format: `yieldx_saved_projects_{userId}`
// 
// FLOW:
// - Save: syncProjectToServer() → Supabase KV + localStorage
// - Load: useEffect watches user.id → fetchProjectsFromServer() → fallback to localStorage
// - Delete: deleteProjectFromServer() → Supabase KV + remove from state
// ═══════════════════════════════════════════════════════════════════════════════

// Import revolutionary features types
import type { Colony, ColonyModule, ColonyResources, CosmicEvent, MarketSnapshot, CompetitorAI } from '@/app/types/colony';
import type { AICopilotRole, AICopilotMessage, CFOAnalysis, CMOAnalysis, CEOAnalysis } from '@/app/types/ai-copilot';
import type { Galaxy, LearningPath } from '@/app/types/learning-paths';
import type { NFTCertificate } from '@/app/types/nft-certificates';
// Import demo student data
import { getDemoStudentData, isDemoStudent, DEMO_STUDENT_PROGRESS } from '@/app/data/demoStudentData';

// ─── Hybrid server helpers ────────────────────────────────────────────────────
const SERVER_BASE = `https://hwbpgmbcasgdvhbofauc.supabase.co/functions/v1/make-server-a05faef1`;
const ANON_KEY = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3YnBnbWJjYXNnZHZoYm9mYXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDk4MjYsImV4cCI6MjA4NTAyNTgyNn0.TWCsZW9kLAJ01tIxsMKayKElWennorfBz-u_lQfH6gg`;
const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ANON_KEY}`,
};

function queuePendingSync(op: any) {
  try {
    const pending = JSON.parse(localStorage.getItem('yieldx_pending_sync') || '[]');
    pending.push({ ...op, queuedAt: Date.now() });
    localStorage.setItem('yieldx_pending_sync', JSON.stringify(pending));
  } catch (e) {}
}

async function syncProjectToServer(project: any): Promise<void> {
  if (!navigator.onLine) {
    queuePendingSync({ type: 'save_project', project });
    return;
  }
  try {
    await fetch(`${SERVER_BASE}/projects`, {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ project }),
    });
    console.log('☁️ Project synced to server:', project.id);
  } catch (e) {
    console.warn('⚠️ Server sync failed, queuing:', e);
    queuePendingSync({ type: 'save_project', project });
  }
}

async function deleteProjectFromServer(userId: string, projectId_: string): Promise<void> {
  if (!navigator.onLine) {
    queuePendingSync({ type: 'delete_project', userId, projectId: projectId_ });
    return;
  }
  try {
    await fetch(`${SERVER_BASE}/projects/${projectId_}?userId=${userId}`, {
      method: 'DELETE',
      headers: AUTH_HEADERS,
    });
    console.log('☁️ Project deleted from server:', projectId_);
  } catch (e) {
    console.warn('⚠️ Server delete failed, queuing:', e);
    queuePendingSync({ type: 'delete_project', userId, projectId: projectId_ });
  }
}

async function fetchProjectsFromServer(userId: string): Promise<any[]> {
  if (!navigator.onLine) return [];
  try {
    const res = await fetch(`${SERVER_BASE}/projects?userId=${userId}`, {
      headers: AUTH_HEADERS,
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.projects || [];
  } catch (e) {
    console.warn('⚠️ Could not fetch projects from server:', e);
    return [];
  }
}

async function flushPendingSync(): Promise<void> {
  if (!navigator.onLine) return;
  try {
    const pending = JSON.parse(localStorage.getItem('yieldx_pending_sync') || '[]');
    if (pending.length === 0) return;
    console.log(`🔄 Syncing ${pending.length} pending operation(s) to server...`);
    const remaining: any[] = [];
    for (const op of pending) {
      try {
        if (op.type === 'save_project') {
          await fetch(`${SERVER_BASE}/projects`, {
            method: 'POST',
            headers: AUTH_HEADERS,
            body: JSON.stringify({ project: op.project }),
          });
        } else if (op.type === 'delete_project') {
          await fetch(`${SERVER_BASE}/projects/${op.projectId}?userId=${op.userId}`, {
            method: 'DELETE',
            headers: AUTH_HEADERS,
          });
        }
      } catch (e) {
        remaining.push(op);
      }
    }
    localStorage.setItem('yieldx_pending_sync', JSON.stringify(remaining));
    if (remaining.length === 0) console.log('✅ All pending operations synced to Supabase!');
  } catch (e) {}
}

export type UserRole = 'lecturer' | 'student' | 'admin' | 'organization';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accessCode?: string;
  lastLoginDate?: string; // Track for streaks
  totalLoginDays?: number;
  // Extended profile fields
  displayName?: string; // Public name
  phoneNumber?: string;
  studentId?: string;
  organization?: string;
  major?: string;
  bio?: string;
  profileVisibility?: 'public' | 'private';
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  profileLastUpdated?: string;
  // Subscription
  subscriptionTier?: SubscriptionTier;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  maxProjects?: number;
  // Organization-specific fields
  organizationName?: string;
  organizationType?: string; // university | company | institute | school
  linkedTeacherIds?: string[];
  organizationLogoUrl?: string;
  // Communication Hierarchy
  universityId?: string;
  classId?: string;
  projectIds?: string[];
}

// Announcement System — unified interface covering both structured comms and simple announcements
export interface Announcement {
  id: string;
  title: string;
  timestamp: string;
  // Structured communication fields (createAnnouncement / StudentAnnouncementsViewer)
  message?: string;
  scope?: 'university' | 'class' | 'project';
  targetId?: string;
  priority?: 'normal' | 'important' | 'urgent';
  authorId?: string;
  authorName?: string;
  readBy?: string[];
  // Simple announcement fields (addAnnouncement / student list)
  content?: string;
  type?: 'info' | 'important' | 'urgent' | 'success';
  from?: string;
  fromRole?: 'teacher' | 'admin';
  read?: boolean;
  targetAudience?: 'all' | 'class' | 'individual';
  attachments?: { name: string; url: string }[];
}

// Project Chat System
export interface ChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
  isAnnouncement?: boolean; // Teacher can post announcements in chat
  deleted?: boolean;
}

export interface ProjectChat {
  projectId: string;
  messages: ChatMessage[];
  mutedStudents: string[]; // Student IDs who are muted
  lastReadAt: { [userId: string]: string }; // Track when each user last read the chat
  universityId?: string; // For scoping
  classId?: string; // For scoping
}

export interface LevelProgress {
  levelId: number;
  title: string;
  completed: boolean;
  xp: number;
  maxXp: number;
  unlocked: boolean;
  objective?: string; // What students will learn
  deliverable?: string; // What students must submit
  deadline?: string; // Deadline date/time
  submissionStatus?: 'not-started' | 'in-progress' | 'submitted' | 'graded' | 'late';
  submittedAt?: string;
  grade?: number;
  feedback?: string;
  submissionType?: 'form' | 'file' | 'link' | 'text';
  maxAttempts?: number;
  currentAttempts?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  levelsIncluded: number[]; // Which levels are part of this project
  assignedTo: string[]; // Student IDs or 'all'
  createdBy: string;
  status: 'scheduled' | 'active' | 'completed';
  unlockRule: 'sequential' | 'time-based' | 'manual';
}

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  levelId: number;
  projectId?: string;
  content: string;
  fileUrl?: string;
  submittedAt: string;
  status: 'early' | 'on-time' | 'late';
  grade?: number;
  feedback?: string;
  xpEarned?: number;
}

export type WorkspaceMode = 'individual' | 'team';

export interface Workspace {
  id: string;
  name: string;
  description: string;
  mode: WorkspaceMode;
  createdBy: string;
  createdByName: string;
  classCode: string;
  qrCode: string;
  templateData: Record<string, any>;
  teams?: Team[];
  forkedFrom?: string; // ID of original workspace
  isTemplate: boolean; // true if this is the lecturer's original
  createdAt: string;
  status: 'draft' | 'active' | 'completed';
}

export interface Team {
  id: string;
  name: string;
  members: string[]; // user IDs
  workspaceId: string;
}

export interface Cohort {
  id: string;
  name: string;
  code: string;
  qrCode: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  studentIds: string[]; // Manually assigned students
  description?: string;
  status: 'active' | 'archived';
}

export type MessageType = 'guidance' | 'team' | 'note';

export interface Message {
  id: string;
  workspaceId: string;
  teamId?: string; // for team messages
  sender: {
    id: string;
    name: string;
    role: UserRole;
  };
  content: string;
  timestamp: string;
  type: MessageType;
  pinned: boolean;
  helpTag: boolean;
  attachments?: Attachment[];
  isRubric?: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'table' | 'other';
  url: string;
}

// ========== NEW FEATURES ==========

// 0. SUBSCRIPTION SYSTEM
export type SubscriptionTier = 'free' | 'premium' | 'enterprise';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  nameAr: string;
  price: number;
  currency: string;
  currencyAr: string;
  billingPeriod: 'monthly' | 'annual';
  billingPeriodAr: string;
  features: string[];
  featuresAr: string[];
  maxProjects: number;
  maxTeamMembers?: number;
  hasPrioritySupport: boolean;
  hasAdvancedAnalytics: boolean;
  hasExportFeatures: boolean;
  hasAIAssistant: boolean;
  hasVideoLibrary: boolean;
  hasCustomBranding?: boolean;
  popular?: boolean;
}

export interface VideoCategory {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  description: string;
  descriptionAr: string;
  color: string;
}

export interface EducationalVideo {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: string; // VideoCategory id
  levelId?: number; // Related to which level
  duration: number; // in minutes
  thumbnailUrl: string;
  videoUrl: string;
  instructor: string;
  instructorAr: string;
  requiredTier: SubscriptionTier;
  views: number;
  rating: number;
  isNew?: boolean;
  transcript?: string;
  transcriptAr?: string;
  relatedVideos?: string[]; // video IDs
  completedBy?: string[]; // user IDs who completed
}

// 1. BADGES & ACHIEVEMENTS
export type BadgeType = 'bronze' | 'silver' | 'gold' | 'platinum' | 'special';
export type AchievementCategory = 'completion' | 'speed' | 'quality' | 'streak' | 'social' | 'special';

export interface Badge {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string; // emoji or icon name
  type: BadgeType;
  earnedAt?: string;
  progress?: number; // 0-100 for progress badges
  maxProgress?: number;
}

export interface Achievement {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: AchievementCategory;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  condition: (context: any) => boolean; // Function to check if unlocked
  hidden?: boolean; // Secret achievements
}

// 2. DAILY STREAKS
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string;
  totalLoginDays: number;
  streakRewards: StreakReward[];
}

export interface StreakReward {
  days: number;
  xpBonus: number;
  claimed: boolean;
}

// 3. LEADERBOARD
export interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalXP: number;
  completedLevels: number;
  badgeCount: number;
  rank: number;
  cohortId?: string;
}

// 4. NOTIFICATIONS
export type NotificationType = 'achievement' | 'badge' | 'deadline' | 'feedback' | 'peer-review' | 'system' | 'streak' | 'announcement';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  icon?: string;
  data?: any;
}

// 4B. ANNOUNCEMENTS — see unified Announcement interface defined above

// 5. PEER REVIEWS
export interface PeerReview {
  id: string;
  submissionId: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  revieweeName: string;
  levelId: number;
  rating: number; // 1-5
  strengths: string;
  improvements: string;
  createdAt: string;
  xpEarned: number;
  anonymous: boolean;
}

// 6. ANALYTICS
export interface AnalyticsData {
  timeSpentPerLevel: Record<number, number>; // levelId -> minutes
  averageScore: number;
  completionRate: number;
  strongestAreas: number[]; // levelIds
  weakestAreas: number[]; // levelIds
  predictedCompletionDate?: string;
  totalTimeSpent: number;
  submissionTimeline: Array<{ date: string; levelId: number }>;
}

export interface TeacherAnalytics {
  cohortId: string;
  averageCompletionRate: number;
  averageTimePerLevel: Record<number, number>;
  strugglingStudents: Array<{ userId: string; userName: string; reason: string }>;
  topPerformers: Array<{ userId: string; userName: string; xp: number }>;
  levelDifficultyScore: Record<number, number>; // Based on time spent
}

// 7. TEMPLATES
export interface BusinessPlanTemplate {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  industry: string;
  industryAr: string;
  icon: string;
  prefilledData: Record<string, any>;
  createdBy: string;
  isOfficial: boolean;
  usageCount: number;
}

// 8. AUTO-SAVE & VERSION HISTORY
export interface AutoSaveState {
  lastSaved: string;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

export interface VersionHistory {
  id: string;
  userId: string;
  workspaceId: string;
  timestamp: string;
  data: Record<string, any>;
  label?: string;
}

// 9. TEAM PROJECTS (Enhanced)
export interface TeamProject {
  id: string;
  teamId: string;
  workspaceId: string;
  name: string;
  nameAr: string;
  roles: Record<string, string>; // userId -> role (CEO, CFO, etc.)
  permissions: Record<string, string[]>; // userId -> allowed sections
  progress: number;
  completedBy: string[]; // userIds who completed their parts
}

// ========== END NEW FEATURES ==========

// ========== NEW 7-LEVEL SYSTEM TYPES ==========

export type ProjectType = 'agricultural' | 'industrial' | 'commercial' | 'service';
export type StudyMode = 'quick' | 'detailed' | 'advanced';

export interface ProjectTypeData {
  type: ProjectType;
  customName?: string;
  selectedAt?: string;
}

export interface StudyModeData {
  mode: StudyMode;
  selectedAt?: string;
  yearsProjection?: number; // 5 for detailed, 10 for advanced
}

export interface SWOTPoint {
  id: string;
  text: string;
  category: 'strength' | 'weakness' | 'opportunity' | 'threat';
  order: number;
}

export interface EnhancedSWOT {
  strengths: SWOTPoint[];
  weaknesses: SWOTPoint[];
  opportunities: SWOTPoint[];
  threats: SWOTPoint[];
}

export interface FinancialKPIs {
  roi: number; // Return on Investment
  irr: number; // Internal Rate of Return
  npv: number; // Net Present Value
  paybackPeriod: number; // in years
  breakEvenPoint: number; // units/month
  roe?: number; // Return on Equity (advanced mode)
  currentRatio?: number; // Liquidity ratio (advanced mode)
  debtToEquity?: number; // (advanced mode)
}

export interface BMCData {
  keyPartners: string[];
  keyActivities: string[];
  keyResources: string[];
  valueProposition: string[];
  customerRelationships: string[];
  channels: string[];
  customerSegments: string[];
  costStructure: string[];
  revenueStreams: string[];
}

export interface Oman2040Contribution {
  directJobs: number;
  indirectJobs: number;
  economicDiversification: string;
  skillsDevelopment: string;
}

// ========== END NEW 7-LEVEL SYSTEM TYPES ==========

// ========== SAVED PROJECTS SYSTEM ==========
export type SavedProjectSource = 'manual' | 'qr' | 'code';
export type SavedProjectStatus = 'in-progress' | 'completed';

export interface SavedProject {
  id: string;
  name: string;
  userId: string;
  currentLevel: number; // 0-7, highest level started
  status: SavedProjectStatus;
  lastEditedDate: string;
  createdAt: string;
  source: SavedProjectSource;
  projectType?: ProjectType;
  studyModeData?: StudyModeData | null;
  enhancedSWOT?: EnhancedSWOT | null;
  financialKPIs?: FinancialKPIs | null;
  bmcData?: BMCData | null;
  oman2040?: Oman2040Contribution | null;
  levelsSnapshot?: LevelProgress[];
  moduleDataSnapshot?: Record<string, any>;
}
// ========== END SAVED PROJECTS SYSTEM ==========

export interface YieldXContextType {
  user: User | null;
  isOnline: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  loginWithQR: (code: string) => void;
  generateQRCode: () => string;
  updateUser: (updates: Partial<User>) => void;
  levels: LevelProgress[];
  updateLevelProgress: (levelId: number, xp: number, completed?: boolean) => void;
  totalXP: number;
  currentView: string;
  setCurrentView: (view: string) => void;
  moduleData: Record<string, any>;
  updateModuleData: (moduleId: string, data: any) => void;
  
  // Language & Theme
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  translations: Translations;
  
  // Workspace functions
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  createWorkspace: (name: string, description: string, mode: WorkspaceMode) => Workspace;
  forkWorkspace: (workspaceId: string) => Workspace | null;
  updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (workspaceId: string) => void;
  getWorkspaceByCode: (code: string) => Workspace | null;

  // ========== SAVED PROJECTS ==========
  savedProjects: SavedProject[];
  activeSavedProjectId: string | null;
  saveProject: (name: string, source?: SavedProjectSource) => SavedProject;
  updateSavedProject: (id: string, updates: Partial<SavedProject>) => void;
  deleteSavedProject: (id: string) => void;
  loadSavedProject: (id: string) => void;
  markProjectEdited: (id: string) => void;
  // =====================================
  
  // Chat functions
  messages: Message[];
  sendMessage: (workspaceId: string, content: string, type: MessageType, teamId?: string) => void;
  pinMessage: (messageId: string) => void;
  toggleHelpTag: (messageId: string) => void;
  addAttachment: (messageId: string, attachment: Attachment) => void;
  getWorkspaceMessages: (workspaceId: string, teamId?: string) => Message[];
  
  // Cohort functions
  cohorts: Cohort[];
  createCohort: (name: string, description?: string) => Cohort;
  updateCohort: (cohortId: string, updates: Partial<Cohort>) => void;
  deleteCohort: (cohortId: string) => void;
  assignStudentToCohort: (cohortId: string, studentId: string) => void;
  removeStudentFromCohort: (cohortId: string, studentId: string) => void;
  getCohortByCode: (code: string) => Cohort | null;

  // NEW: Badges & Achievements
  badges: Badge[];
  achievements: Achievement[];
  awardBadge: (badgeId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  checkAchievements: () => void;

  // NEW: Streaks
  streak: StreakData;
  updateStreak: () => void;
  claimStreakReward: (days: number) => void;

  // NEW: Leaderboard
  leaderboard: LeaderboardEntry[];
  updateLeaderboard: () => void;
  getMyRank: () => number;

  // NEW: Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (notificationId: string) => void;
  clearAllNotifications: () => void;
  unreadCount: number;

  // NEW: Announcements
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'timestamp' | 'read'>) => void;
  getStudentAnnouncements: () => Announcement[];
  unreadAnnouncementsCount: number;

  // NEW: Structured Communication System
  createAnnouncement: (params: { title: string; message: string; scope: 'university' | 'class' | 'project'; targetId: string; priority: 'normal' | 'important' | 'urgent' }) => void;
  markAnnouncementRead: (announcementId: string, userId: string) => void;
  getVisibleAnnouncements: (userId: string) => Announcement[];
  
  // NEW: Project Chat System
  projectChats: ProjectChat[];
  sendChatMessage: (projectId: string, message: string, isAnnouncement?: boolean) => void;
  deleteChatMessage: (projectId: string, messageId: string) => void;
  muteStudent: (projectId: string, studentId: string) => void;
  unmuteStudent: (projectId: string, studentId: string) => void;
  getProjectChat: (projectId: string) => ProjectChat | null;
  markChatAsRead: (projectId: string, userId: string) => void;
  getUnreadMessageCount: (projectId: string, userId: string) => number;

  // NEW: Peer Reviews
  peerReviews: PeerReview[];
  createPeerReview: (review: Omit<PeerReview, 'id' | 'createdAt' | 'xpEarned'>) => void;
  getPeerReviewsForSubmission: (submissionId: string) => PeerReview[];
  getMyPeerReviews: () => PeerReview[];

  // NEW: Analytics
  analytics: AnalyticsData;
  updateAnalytics: (levelId: number, timeSpent: number) => void;
  getTeacherAnalytics: (cohortId: string) => TeacherAnalytics;

  // NEW: Templates
  templates: BusinessPlanTemplate[];
  createTemplate: (template: Omit<BusinessPlanTemplate, 'id' | 'usageCount'>) => void;
  useTemplate: (templateId: string) => void;

  // NEW: Auto-save & Version History
  autoSaveState: AutoSaveState;
  versionHistory: VersionHistory[];
  autoSave: (workspaceId: string, data: Record<string, any>) => void;
  createVersion: (workspaceId: string, label?: string) => void;
  restoreVersion: () => void;

  // NEW: 7-Level System Data
  projectTypeData: ProjectTypeData | null;
  studyModeData: StudyModeData | null;
  enhancedSWOT: EnhancedSWOT | null;
  financialKPIs: FinancialKPIs | null;
  bmcData: BMCData | null;
  oman2040: Oman2040Contribution | null;
  setProjectType: (type: ProjectType, customName?: string) => void;
  setStudyMode: (mode: StudyMode) => void;
  updateEnhancedSWOT: (swot: Partial<EnhancedSWOT>) => void;
  updateFinancialKPIs: (kpis: Partial<FinancialKPIs>) => void;
  updateBMC: (bmc: Partial<BMCData>) => void;
  updateOman2040: (contribution: Partial<Oman2040Contribution>) => void;
  resetFeasibilityStudy: () => void;
}

// Create a default context value to prevent undefined errors
const defaultContextValue: YieldXContextType = {
  user: null,
  isOnline: navigator.onLine,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  loginWithQR: () => {},
  generateQRCode: () => '',
  updateUser: () => {},
  levels: [],
  updateLevelProgress: () => {},
  totalXP: 0,
  currentView: 'auth',
  setCurrentView: () => {},
  moduleData: {},
  updateModuleData: () => {},
  language: 'ar',
  setLanguage: () => {},
  theme: 'dark',
  setTheme: () => {},
  translations: {},
  workspaces: [],
  currentWorkspace: null,
  setCurrentWorkspace: () => {},
  createWorkspace: () => ({ id: '', name: '', description: '', mode: 'individual', createdBy: '', createdByName: '', classCode: '', qrCode: '', templateData: {}, teams: [], forkedFrom: '', isTemplate: false, createdAt: '', status: 'draft' }),
  forkWorkspace: () => null,
  updateWorkspace: () => {},
  deleteWorkspace: () => {},
  getWorkspaceByCode: () => null,
  savedProjects: [],
  activeSavedProjectId: null,
  saveProject: () => ({ id: '', name: '', userId: '', currentLevel: 0, status: 'in-progress', lastEditedDate: '', createdAt: '', source: 'manual' }),
  updateSavedProject: () => {},
  deleteSavedProject: () => {},
  loadSavedProject: () => {},
  markProjectEdited: () => {},
  messages: [],
  sendMessage: () => {},
  pinMessage: () => {},
  toggleHelpTag: () => {},
  addAttachment: () => {},
  getWorkspaceMessages: () => [],
  cohorts: [],
  createCohort: () => ({ id: '', name: '', code: '', qrCode: '', createdBy: '', createdByName: '', createdAt: '', studentIds: [], status: 'active' }),
  updateCohort: () => {},
  deleteCohort: () => {},
  assignStudentToCohort: () => {},
  removeStudentFromCohort: () => {},
  getCohortByCode: () => null,
  badges: [],
  achievements: [],
  awardBadge: () => {},
  unlockAchievement: () => {},
  checkAchievements: () => {},
  streak: { currentStreak: 0, longestStreak: 0, lastLoginDate: '', totalLoginDays: 0, streakRewards: [] },
  updateStreak: () => {},
  claimStreakReward: () => {},
  leaderboard: [],
  updateLeaderboard: () => {},
  getMyRank: () => 0,
  notifications: [],
  addNotification: () => {},
  markNotificationRead: () => {},
  clearAllNotifications: () => {},
  unreadCount: 0,
  announcements: [],
  addAnnouncement: () => {},
  getStudentAnnouncements: () => [],
  unreadAnnouncementsCount: 0,
  createAnnouncement: () => {},
  markAnnouncementRead: () => {},
  getVisibleAnnouncements: () => [],
  projectChats: [],
  sendChatMessage: () => {},
  deleteChatMessage: () => {},
  muteStudent: () => {},
  unmuteStudent: () => {},
  getProjectChat: () => null,
  markChatAsRead: () => {},
  getUnreadMessageCount: () => 0,
  peerReviews: [],
  createPeerReview: () => {},
  getPeerReviewsForSubmission: () => [],
  getMyPeerReviews: () => [],
  analytics: { timeSpentPerLevel: {}, averageScore: 0, completionRate: 0, strongestAreas: [], weakestAreas: [], totalTimeSpent: 0, submissionTimeline: [] },
  updateAnalytics: () => {},
  getTeacherAnalytics: () => ({ cohortId: '', averageCompletionRate: 0, averageTimePerLevel: {}, strugglingStudents: [], topPerformers: [], levelDifficultyScore: {} }),
  templates: [],
  createTemplate: () => {},
  useTemplate: () => {},
  autoSaveState: { lastSaved: '', isSaving: false, hasUnsavedChanges: false },
  versionHistory: [],
  autoSave: () => {},
  createVersion: () => {},
  restoreVersion: () => {},
  // NEW: 7-Level System defaults
  projectTypeData: null,
  studyModeData: null,
  enhancedSWOT: null,
  financialKPIs: null,
  bmcData: null,
  oman2040: null,
  setProjectType: () => {},
  setStudyMode: () => {},
  updateEnhancedSWOT: () => {},
  updateFinancialKPIs: () => {},
  updateBMC: () => {},
  updateOman2040: () => {},
  resetFeasibilityStudy: () => {},
};

const YieldXContext = createContext<YieldXContextType>(defaultContextValue);

// NEW 7-LEVEL SYSTEM (0-7 + Pre-Start)
const INITIAL_LEVELS: LevelProgress[] = [
  { 
    levelId: 0, 
    title: 'اختيار نوع المشروع', 
    objective: 'تحديد نوع المشروع (زراعي، صناعي، تجاري، خدمي)',
    deliverable: 'اختيار نوع المشروع وفهم متطلباته',
    submissionType: 'form',
    submissionStatus: 'not-started',
    maxAttempts: 1,
    currentAttempts: 0,
    completed: false, 
    xp: 0, 
    maxXp: 50, 
    unlocked: true 
  },
  { 
    levelId: 1, 
    title: 'الهوية والملكية', 
    objective: 'تحديد تفاصيل المشروع الأساسية وهيكل الملكية',
    deliverable: 'معلومات المشروع والملاك مع توزيع النسب',
    submissionType: 'form',
    submissionStatus: 'not-started',
    maxAttempts: 3,
    currentAttempts: 0,
    completed: false, 
    xp: 0, 
    maxXp: 100, 
    unlocked: true 
  },
  { 
    levelId: 2, 
    title: 'الإطار القانوني والتنظيمي', 
    objective: 'استكمال المتطلبات القانونية والتراخيص اللازمة',
    deliverable: 'قائمة التراخيص والتأمينات وعقود الإيجار',
    submissionType: 'form',
    submissionStatus: 'not-started',
    maxAttempts: 3,
    currentAttempts: 0,
    completed: false, 
    xp: 0, 
    maxXp: 150, 
    unlocked: true 
  },
  { 
    levelId: 3, 
    title: 'الموارد المادية والفنية', 
    objective: 'حساب الأصول الثابتة والمواد الخام والإهلاك',
    deliverable: 'جدول الأصول والمواد مع التكاليف والإهلاك',
    submissionType: 'form',
    submissionStatus: 'not-started',
    maxAttempts: 3,
    currentAttempts: 0,
    completed: false, 
    xp: 0, 
    maxXp: 150, 
    unlocked: true 
  },
  { 
    levelId: 4, 
    title: 'الموارد البشرية والتنظيمية', 
    objective: 'بناء الهيكل الوظيفي وحساب تكاليف الموارد البشرية',
    deliverable: 'الهيكل الوظيفي والرواتب والتأمينات',
    submissionType: 'form',
    submissionStatus: 'not-started',
    maxAttempts: 3,
    currentAttempts: 0,
    completed: false, 
    xp: 0, 
    maxXp: 200, 
    unlocked: true 
  },
  { 
    levelId: 5, 
    title: 'السوق والاستراتيجية', 
    objective: 'تحليل المنافسين وتحديد المنتجات وإجراء تحليل SWOT متطور',
    deliverable: 'تحليل المنافسين + المنتجات + تحليل SWOT (حتى 9 نقاط لكل قسم)',
    submissionType: 'form',
    submissionStatus: 'not-started',
    maxAttempts: 3,
    currentAttempts: 0,
    completed: false, 
    xp: 0, 
    maxXp: 200, 
    unlocked: true 
  },
  { 
    levelId: 6, 
    title: 'التمويل والمؤشرات المالية', 
    objective: 'إعداد الخطة المالية والمؤشرات المالية الرئيسية (5-10 سنوات)',
    deliverable: 'قائمة الدخل والمؤشرات المالية (IRR, NPV, ROI, نقطة التعادل)',
    submissionType: 'form',
    submissionStatus: 'not-started',
    maxAttempts: 3,
    currentAttempts: 0,
    completed: false, 
    xp: 0, 
    maxXp: 300, 
    unlocked: true 
  },
  { 
    levelId: 7, 
    title: 'النموذج الشامل والتنفيذ', 
    objective: 'إكمال Business Model Canvas والجدول الزمني والمساهمة في رؤية عُمان 2040',
    deliverable: 'BMC + الجدول الزمني + المرفقات + تقرير المساهمة في رؤية عُمان',
    submissionType: 'form',
    submissionStatus: 'not-started',
    maxAttempts: 2,
    currentAttempts: 0,
    completed: false, 
    xp: 0, 
    maxXp: 250, 
    unlocked: true 
  },
];

export function YieldXProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [levels, setLevels] = useState<LevelProgress[]>(INITIAL_LEVELS);
  const [currentView, setCurrentView] = useState('home');
  const [moduleData, setModuleData] = useState<Record<string, any>>({});
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);

  // User Registration System - Load from localStorage
  const getRegisteredUsers = (): Array<{email: string; password: string; role: UserRole; name: string}> => {
    const stored = localStorage.getItem('yieldx_registered_users');
    const users = stored ? JSON.parse(stored) : [];
    
    // ALWAYS ensure demo accounts exist as fallback
    const defaultAccounts = [
      { email: 'demo.student@yieldx.com', password: 'demo123', role: 'student' as UserRole, name: 'Demo Student' },
      { email: 'demo.teacher@yieldx.com', password: 'demo123', role: 'lecturer' as UserRole, name: 'Demo Teacher' },
      { email: 'admin@yieldx.com', password: 'admin123', role: 'admin' as UserRole, name: 'System Admin' },
      // Custom accounts
      { email: 'alhashmisaid23@gmail.com', password: 'password123', role: 'student' as UserRole, name: 'Said Al Hashmi' },
      { email: 'alhashmisaid21@gmail.com', password: 'password123', role: 'student' as UserRole, name: 'Said Al Hashmi 21' },
    ];
    
    // Merge demo accounts with stored users (avoid duplicates)
    const allUsers = [...defaultAccounts];
    users.forEach((user: any) => {
      if (!allUsers.find(u => u.email.toLowerCase() === user.email.toLowerCase())) {
        allUsers.push(user);
      }
    });
    
    return allUsers;
  };

  // Get ONLY stored users (no demo accounts) - used for saving
  const getStoredUsersOnly = (): Array<{email: string; password: string; role: UserRole; name: string}> => {
    const stored = localStorage.getItem('yieldx_registered_users');
    return stored ? JSON.parse(stored) : [];
  };

  const saveRegisteredUsers = (users: Array<{email: string; password: string; role: UserRole; name: string}>) => {
    // Filter out demo accounts before saving (they should never be in localStorage)
    const demoEmails = [
      'demo.student@yieldx.com', 
      'demo.teacher@yieldx.com', 
      'admin@yieldx.com',
      'alhashmisaid23@gmail.com',
      'alhashmisaid21@gmail.com'
    ];
    const filteredUsers = users.filter(u => !demoEmails.includes(u.email.toLowerCase()));
    localStorage.setItem('yieldx_registered_users', JSON.stringify(filteredUsers));
    console.log(`💾 Saved ${filteredUsers.length} user account(s) to database`);
  };

  const normalizeUserRole = (incomingRole: string): UserRole => {
    if (incomingRole === 'teacher') return 'lecturer';
    const normalized = incomingRole?.toLowerCase();
    if (normalized === 'student' || normalized === 'lecturer' || normalized === 'admin' || normalized === 'organization') {
      return normalized as UserRole;
    }
    return 'student';
  };

  const isNetworkError = (error: unknown): boolean => {
    if (!navigator.onLine) return true;
    if (!error) return false;
    const message = typeof error === 'string' ? error : (error as { message?: string }).message;
    return typeof message === 'string' && /network|failed to fetch|offline|timeout/i.test(message);
  };

  // NEW FEATURES STATE
  const [badges, setBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastLoginDate: '',
    totalLoginDays: 0,
    streakRewards: [
      { days: 3, xpBonus: 50, claimed: false },
      { days: 7, xpBonus: 100, claimed: false },
      { days: 14, xpBonus: 200, claimed: false },
      { days: 30, xpBonus: 500, claimed: false },
    ],
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [projectChats, setProjectChats] = useState<ProjectChat[]>([]);
  const [peerReviews, setPeerReviews] = useState<PeerReview[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    timeSpentPerLevel: {},
    averageScore: 0,
    completionRate: 0,
    strongestAreas: [],
    weakestAreas: [],
    totalTimeSpent: 0,
    submissionTimeline: [],
  });
  const [templates, setTemplates] = useState<BusinessPlanTemplate[]>([]);
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    lastSaved: '',
    isSaving: false,
    hasUnsavedChanges: false,
  });
  const [versionHistory, setVersionHistory] = useState<VersionHistory[]>([]);

  // NEW: 7-Level System State
  const [projectTypeData, setProjectTypeData] = useState<ProjectTypeData | null>(null);
  const [studyModeData, setStudyModeData] = useState<StudyModeData | null>(null);
  const [enhancedSWOT, setEnhancedSWOT] = useState<EnhancedSWOT | null>(null);
  const [financialKPIs, setFinancialKPIs] = useState<FinancialKPIs | null>(null);
  const [bmcData, setBmcData] = useState<BMCData | null>(null);
  const [oman2040, setOman2040] = useState<Oman2040Contribution | null>(null);

  // Saved Projects State
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [activeSavedProjectId, setActiveSavedProjectId] = useState<string | null>(null);

  // Language and Theme State
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('yieldx_language');
    return (saved === 'en' || saved === 'ar' ? saved : 'ar') as Language;
  });
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('yieldx_theme');
    return (saved === 'light' || saved === 'dark' ? saved : 'dark') as 'light' | 'dark';
  });

  // Update HTML attributes whenever language or theme changes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [language, theme]); // ✅ FIXED: Now updates whenever language or theme changes!

  // ✅ NEW: Localize levels data whenever language changes
  useEffect(() => {
    const t = translations[language].levels;
    setLevels((prevLevels) =>
      prevLevels.map((level) => ({
        ...level,
        title: t[`level${level.levelId}Title` as keyof typeof t] as string || level.title,
        objective: t[`level${level.levelId}Objective` as keyof typeof t] as string || level.objective,
        deliverable: t[`level${level.levelId}Deliverable` as keyof typeof t] as string || level.deliverable,
      }))
    );
  }, [language]);

  // ── Online / Offline detection ──────────────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Back online — flushing pending sync...');
      flushPendingSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 Gone offline — switching to localStorage mode');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  // ────────────────────────────────────────────────────────────────────────────

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('yieldx_user');
    const savedLevels = localStorage.getItem('yieldx_levels');
    const savedModuleData = localStorage.getItem('yieldx_module_data');
    const savedWorkspaces = localStorage.getItem('yieldx_workspaces');
    const savedMessages = localStorage.getItem('yieldx_messages');
    const savedCohorts = localStorage.getItem('yieldx_cohorts');
    const savedAnnouncements = localStorage.getItem('yieldx_announcements');

    // Initialize authentication system
    const storedUsers = getStoredUsersOnly();
    const allUsers = getRegisteredUsers();
    
    console.log('✅ YieldX Authentication System Ready');
    console.log(`📊 Total accounts available: ${allUsers.length} (5 demo + ${storedUsers.length} registered)`);
    console.log('📧 Demo accounts:');
    console.log('   • demo.student@yieldx.com / demo123 (Student)');
    console.log('   • demo.teacher@yieldx.com / demo123 (Teacher)');
    console.log('   • admin@yieldx.com / admin123 (Admin)');
    console.log('   • alhashmisaid23@gmail.com / password123 (Student)');
    console.log('   • alhashmisaid21@gmail.com / password123 (Student)');
    if (storedUsers.length > 0) {
      console.log(`📧 Registered accounts: ${storedUsers.length}`);
      storedUsers.forEach(u => console.log(`   • ${u.email} (${u.role})`));
    }

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Migrate old 'entrepreneur' role to 'student'
        if (parsedUser.role === 'entrepreneur') {
          parsedUser.role = 'student';
        }
        // Validate role is one of the allowed values
        const validRoles: UserRole[] = ['lecturer', 'student', 'admin', 'organization'];
        if (validRoles.includes(parsedUser.role)) {
          setUser(parsedUser);
          setCurrentView('dashboard');
          // If the user has a Supabase UUID (not local_...) and is online, try to sync pending
          if (!parsedUser.id.startsWith('local_') && navigator.onLine) {
            setTimeout(() => flushPendingSync(), 2000);
          }
        } else {
          // Invalid role, clear localStorage
          localStorage.removeItem('yieldx_user');
        }
      } catch (e) {
        // Invalid JSON, clear localStorage
        localStorage.removeItem('yieldx_user');
      }
    }
    if (savedLevels) setLevels(JSON.parse(savedLevels));
    if (savedModuleData) setModuleData(JSON.parse(savedModuleData));

    // Load new 7-level system data
    const savedProjectType = localStorage.getItem('yieldx_project_type');
    const savedStudyMode = localStorage.getItem('yieldx_study_mode');
    const savedSWOT = localStorage.getItem('yieldx_enhanced_swot');
    const savedKPIs = localStorage.getItem('yieldx_financial_kpis');
    const savedBMC = localStorage.getItem('yieldx_bmc_data');
    const savedOman2040 = localStorage.getItem('yieldx_oman2040');

    if (savedProjectType) setProjectTypeData(JSON.parse(savedProjectType));
    if (savedStudyMode) setStudyModeData(JSON.parse(savedStudyMode));
    if (savedSWOT) setEnhancedSWOT(JSON.parse(savedSWOT));
    if (savedKPIs) setFinancialKPIs(JSON.parse(savedKPIs));
    if (savedBMC) setBmcData(JSON.parse(savedBMC));
    if (savedOman2040) setOman2040(JSON.parse(savedOman2040));

    // Load saved projects (after user is set via savedUser)
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        const userId = parsedUser.id;
        const savedProjectsData = localStorage.getItem(`yieldx_saved_projects_${userId}`);
        if (savedProjectsData) setSavedProjects(JSON.parse(savedProjectsData));
        const savedActiveProjectId = localStorage.getItem(`yieldx_active_project_${userId}`);
        if (savedActiveProjectId) setActiveSavedProjectId(savedActiveProjectId);
      } catch (e) {}
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('yieldx_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('yieldx_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('yieldx_levels', JSON.stringify(levels));
  }, [levels]);

  useEffect(() => {
    localStorage.setItem('yieldx_module_data', JSON.stringify(moduleData));
  }, [moduleData]);

  // ── Debounced Auto-Save to localStorage ────────────────────────────────────
  // OFFLINE MODE: saves directly to localStorage only (no server calls).
  useEffect(() => {
    if (!activeSavedProjectId || !user) return;

    setAutoSaveState(prev => ({ ...prev, hasUnsavedChanges: true }));

    const timer = setTimeout(() => {
      setSavedProjects(prev => {
        const project = prev.find(p => p.id === activeSavedProjectId);
        if (!project) return prev;

        const currentLevel = levels.filter(l => l.completed).length;
        const allCompleted = levels.every(l => l.completed);
        const updatedProject: SavedProject = {
          ...project,
          currentLevel,
          status: allCompleted ? 'completed' : 'in-progress',
          lastEditedDate: new Date().toISOString(),
          projectType: projectTypeData?.type,
          studyModeData: studyModeData ? JSON.parse(JSON.stringify(studyModeData)) : null,
          enhancedSWOT: enhancedSWOT ? JSON.parse(JSON.stringify(enhancedSWOT)) : null,
          financialKPIs: financialKPIs ? JSON.parse(JSON.stringify(financialKPIs)) : null,
          bmcData: bmcData ? JSON.parse(JSON.stringify(bmcData)) : null,
          oman2040: oman2040 ? JSON.parse(JSON.stringify(oman2040)) : null,
          levelsSnapshot: JSON.parse(JSON.stringify(levels)),
          moduleDataSnapshot: JSON.parse(JSON.stringify(moduleData)),
        };

        // Save to localStorage immediately
        setAutoSaveState({ lastSaved: new Date().toISOString(), isSaving: false, hasUnsavedChanges: false });
        console.log('💾 Auto-saved to localStorage:', updatedProject.id);

        // Also sync to server (handles offline queuing internally)
        syncProjectToServer(updatedProject);

        return prev.map(p => p.id === activeSavedProjectId ? updatedProject : p);
      });
    }, 2000); // 2-second debounce

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levels, moduleData, enhancedSWOT, financialKPIs, bmcData, oman2040, studyModeData, projectTypeData]);
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    localStorage.setItem('yieldx_workspaces', JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    localStorage.setItem('yieldx_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('yieldx_cohorts', JSON.stringify(cohorts));
  }, [cohorts]);

  useEffect(() => {
    localStorage.setItem('yieldx_announcements', JSON.stringify(announcements));
  }, [announcements]);

  // Persist saved projects per user
  useEffect(() => {
    if (user) {
      localStorage.setItem(`yieldx_saved_projects_${user.id}`, JSON.stringify(savedProjects));
    }
  }, [savedProjects, user]);

  useEffect(() => {
    if (user && activeSavedProjectId) {
      localStorage.setItem(`yieldx_active_project_${user.id}`, activeSavedProjectId);
    } else if (user && !activeSavedProjectId) {
      localStorage.removeItem(`yieldx_active_project_${user.id}`);
    }
  }, [activeSavedProjectId, user]);

  // ── Load projects from localStorage when user logs in (OFFLINE MODE) ─────────
  useEffect(() => {
    if (!user?.id) return;
    if (savedProjects.length > 0) return; // already loaded by login()
    const localStr = localStorage.getItem(`yieldx_saved_projects_${user.id}`);
    if (localStr) {
      try {
        const localProjects = JSON.parse(localStr);
        console.log(`📁 Loaded ${localProjects.length} project(s) from localStorage`);
        setSavedProjects(localProjects);
        const savedActiveId = localStorage.getItem(`yieldx_active_project_${user.id}`);
        if (savedActiveId) setActiveSavedProjectId(savedActiveId);
      } catch(e) {}
    }
  }, [user?.id]);
  // ─────────────────────────────────────────────────────────────────────────────

  // Save language and theme to localStorage
  useEffect(() => {
    localStorage.setItem('yieldx_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('yieldx_theme', theme);
  }, [theme]);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Basic validation
    if (!email || !email.includes('@')) {
      console.error('❌ LOGIN FAILED: Invalid email format');
      return false;
    }
    if (!password || password.length < 3) {
      console.error('❌ LOGIN FAILED: Password too short');
      return false;
    }

    // ── HYBRID: Try Supabase first if online ─────────────────────────────────
    if (navigator.onLine) {
      console.log('🌐 ONLINE login attempt via Supabase:', email);
      try {
        const { data, error } = await sbClient.auth.signInWithPassword({ email, password });
        if (error) {
          const message = error.message || String(error);
          const networkError = isNetworkError(error);
          if (networkError) {
            console.warn('⚠️ Supabase login network error, trying local fallback:', message);
          } else {
            console.error('❌ ERROR: Supabase login failed:', message);
            return false;
          }
        } else if (!data?.user) {
          console.error('❌ ERROR: Supabase login returned no user for', email);
          return false;
        }

        if (data?.user) {
          const supabaseId = data.user.id;
          const userMeta = data.user.user_metadata || {};
          const effectiveRole: UserRole = (userMeta.role as UserRole) || role;
          const name = userMeta.full_name || email.split('@')[0];

          const newUser: User = {
            id: supabaseId,
            name,
            email,
            role: effectiveRole,
            subscriptionTier: 'free',
            maxProjects: 1,
          };

          setUser(newUser);
          setCurrentView('dashboard');

          // Merge server projects with localStorage projects
          const [serverProjects, localStr] = await Promise.all([
            fetchProjectsFromServer(supabaseId),
            Promise.resolve(localStorage.getItem(`yieldx_saved_projects_${supabaseId}`)),
          ]);
          const localProjects: any[] = localStr ? JSON.parse(localStr) : [];
          // Merge: server is source of truth, add any local-only ones
          const merged = [...serverProjects];
          localProjects.forEach(lp => {
            if (!merged.find((sp: any) => sp.id === lp.id)) merged.push(lp);
          });
          if (merged.length > 0) setSavedProjects(merged);

          // Restore active project ID
          const savedActiveId = localStorage.getItem(`yieldx_active_project_${supabaseId}`);
          if (savedActiveId) setActiveSavedProjectId(savedActiveId);

          // Flush any pending sync
          flushPendingSync();

          console.log('✅ USER LOGGED IN (ONLINE/Supabase):', newUser);
          return true;
        }
      } catch (e) {
        if (isNetworkError(e)) {
          console.warn('⚠️ Supabase login network error, trying local fallback:', e);
        } else {
          console.error('❌ ERROR: Supabase login exception:', e);
          return false;
        }
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    // OFFLINE FALLBACK: authenticate using localStorage user database
    console.log('📴 OFFLINE login attempt:', { email, role });
    const allUsers = getRegisteredUsers();
    const registeredUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!registeredUser || registeredUser.password !== password) {
      console.error('❌ LOGIN FAILED: Invalid credentials');
      return false;
    }

    // Use the stored role (ignore login-screen selector for role mismatches)
    const effectiveRole = registeredUser.role;

    const newUser: User = {
      id: `local_${btoa(email).replace(/=/g, '').slice(0, 12)}`,
      name: registeredUser.name,
      email: registeredUser.email,
      role: effectiveRole,
      subscriptionTier: 'free',
      maxProjects: 1,
    };

    setUser(newUser);
    setCurrentView('dashboard');

    // Load saved projects from localStorage
    const localStr = localStorage.getItem(`yieldx_saved_projects_${newUser.id}`);
    if (localStr) {
      try { setSavedProjects(JSON.parse(localStr)); } catch(e) {}
    }
    const userActiveProject = localStorage.getItem(`yieldx_active_project_${newUser.id}`);
    if (userActiveProject) setActiveSavedProjectId(userActiveProject);

    // Load demo student data if applicable
    if (isDemoStudent(email)) {
      const demoData = getDemoStudentData(email);
      if (demoData) {
        console.log('🎭 Loading demo student sample data...');
        const demoWorkspaces = demoData.projects.map(project => ({
          id: project.id,
          name: project.name,
          description: project.level0.description,
          mode: 'individual' as WorkspaceMode,
          createdBy: newUser.id,
          createdByName: newUser.name,
          classCode: '',
          qrCode: '',
          templateData: {},
          isTemplate: false,
          createdAt: project.createdAt,
            status: project.status === 'completed' ? 'completed' : project.status === 'in_progress' ? 'active' : 'draft',
          })) as Workspace[];
          setWorkspaces(demoWorkspaces);
          
          // Set active workspace to the in-progress project
          const activeWorkspace = demoWorkspaces.find(w => w.isActive) || demoWorkspaces[0];
          setCurrentWorkspace(activeWorkspace);
          
          // Load demo progress data
          setLevels(demoData.progress.levels);
          
          // Load demo module data for all projects
          const demoModuleData: Record<string, any> = {};
          demoData.projects.forEach(project => {
            // Store each level's data
            for (let i = 0; i <= 7; i++) {
              const levelKey = `level${i}`;
              if (project[levelKey as keyof typeof project]) {
                demoModuleData[`${project.id}_${levelKey}`] = project[levelKey as keyof typeof project];
              }
            }
          });
          setModuleData(demoModuleData);
          
          console.log('✅ Demo student data loaded:', {
            projects: demoData.projects.length,
            totalXP: demoData.progress.totalXP,
            badges: demoData.progress.badges.length,
          });
        }
      }
      
    console.log('✅ USER LOGGED IN (OFFLINE):', newUser);
    return true;
  };

  const register = async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
    // Basic validation
    if (!email || !email.includes('@')) {
      console.error('❌ REGISTRATION FAILED: Invalid email format');
      return false;
    }
    if (!password || password.length < 6) {
      console.error('❌ REGISTRATION FAILED: Password must be at least 6 characters');
      return false;
    }

    // ── HYBRID: Try Supabase server signup when online ────────────────────────
    if (navigator.onLine) {
      const normalizedRole = normalizeUserRole(role);
      console.log('🌐 Calling supabase.auth.signUp...', { email, name, role: normalizedRole });
      try {
        const { data: authData, error: authError } = await sbClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: normalizedRole,
            },
          },
        });

        if (authError) {
          const message = authError.message || String(authError);
          const networkError = isNetworkError(authError);
          console.error('❌ ERROR: supabase.auth.signUp failed for', email, message);
          if (!networkError) return false;
          console.warn('⚠️ Supabase signup network error, trying local fallback:', message);
        } else if (!authData?.user) {
          console.error('❌ ERROR: supabase.auth.signUp returned no user for', email);
          return false;
        } else {
          console.log('✅ Auth user created:', email);
          console.log('📝 Inserting profile into public.users...');

          const normalizedRoleInsert = normalizeUserRole(role);
          const { data: profileData, error: profileError } = await sbClient
            .from('users')
            .insert({ id: authData.user.id, email, name, role: normalizedRoleInsert })
            .select()
            .single();

          if (profileError) {
            console.error(`❌ ERROR: Failed to insert public.users profile for ${email}:`, profileError.message || profileError);
            return false;
          }

          console.log('✅ Profile created successfully');
          const newUserContext: User = {
            id: authData.user.id,
            name,
            email,
            role: normalizedRoleInsert,
            subscriptionTier: 'free',
            maxProjects: 1,
          };

          // Also store locally for offline fallback
          const newUserRecord = { email, password, role: normalizedRoleInsert, name };
          const storedUsers = getStoredUsersOnly();
          if (!storedUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
            saveRegisteredUsers([...storedUsers, newUserRecord]);
          }

          setUser(newUserContext);
          setCurrentView('dashboard');
          console.log('✅ USER REGISTERED (ONLINE/Supabase):', newUserContext);
          return true;
        }
      } catch (e) {
        if (isNetworkError(e)) {
          console.warn('⚠️ Supabase signup network error, trying local fallback:', e);
        } else {
          console.error('❌ ERROR: Supabase signup exception for', email, e);
          return false;
        }
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    // OFFLINE FALLBACK: register directly in localStorage user database
    console.log('📴 OFFLINE registration:', { email, name, role });

    const allUsers = getRegisteredUsers();
    const existingUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      console.error('❌ Email already exists');
      return false;
    }

    // Save new user to localStorage
    const newUserRecord = { email, password, role, name };
    const storedUsers = getStoredUsersOnly();
    saveRegisteredUsers([...storedUsers, newUserRecord]);

    const userId = `local_${btoa(email).replace(/=/g, '').slice(0, 12)}`;
    const newUserContext: User = {
      id: userId,
      name,
      email,
      role,
      subscriptionTier: 'free',
      maxProjects: 1,
    };
    setUser(newUserContext);
    setCurrentView('dashboard');
    console.log('✅ USER REGISTERED (OFFLINE):', newUserContext);
    return true;
  };

  const logout = () => {
    // Sign out from Supabase if online
    if (navigator.onLine) {
      sbClient.auth.signOut().catch(() => {});
    }
    // ⚠️ IMPORTANT: Preserve registered users database and settings when logging out
    const registeredUsers = localStorage.getItem('yieldx_registered_users');
    const savedLanguage = localStorage.getItem('yieldx_language');
    const savedTheme = localStorage.getItem('yieldx_theme');
    // Preserve saved projects for each user (keyed by userId)
    const savedProjectsKeys = Object.keys(localStorage).filter(k => k.startsWith('yieldx_saved_projects_'));
    const savedProjectsData: Record<string, string> = {};
    savedProjectsKeys.forEach(k => { savedProjectsData[k] = localStorage.getItem(k) || ''; });
    // Preserve active project IDs for each user
    const activeProjectKeys = Object.keys(localStorage).filter(k => k.startsWith('yieldx_active_project_'));
    const activeProjectData: Record<string, string> = {};
    activeProjectKeys.forEach(k => { activeProjectData[k] = localStorage.getItem(k) || ''; });
    
    setUser(null);
    setCurrentView('auth');
    setLevels(INITIAL_LEVELS);
    setModuleData({});
    setSavedProjects([]);
    setActiveSavedProjectId(null);
    
    // Clear all localStorage data
    localStorage.clear();
    
    // ✅ Restore registered users database and user preferences
    if (registeredUsers) {
      localStorage.setItem('yieldx_registered_users', registeredUsers);
      const users = JSON.parse(registeredUsers);
      console.log(`✅ Logged out successfully. ${users.length} user account(s) preserved.`);
    } else {
      console.log('✅ Logged out successfully. Demo accounts available.');
    }
    
    // Restore language and theme preferences
    if (savedLanguage) localStorage.setItem('yieldx_language', savedLanguage);
    if (savedTheme) localStorage.setItem('yieldx_theme', savedTheme);
    // Restore saved projects per user
    Object.entries(savedProjectsData).forEach(([k, v]) => { if (v) localStorage.setItem(k, v); });
    // Restore active project IDs per user
    Object.entries(activeProjectData).forEach(([k, v]) => { if (v) localStorage.setItem(k, v); });
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { 
        ...user, 
        ...updates,
        profileLastUpdated: new Date().toISOString()
      };
      setUser(updatedUser);
    }
  };

  const loginWithQR = (code: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Student-${code.slice(0, 4)}`,
      email: `student-${code}@yieldx.om`,
      role: 'student',
      accessCode: code,
    };
    setUser(newUser);
    setCurrentView('dashboard');
  };

  const generateQRCode = (): string => {
    const code = Math.random().toString(36).substr(2, 12).toUpperCase();
    return code;
  };

  const updateLevelProgress = (levelId: number, xp: number, completed?: boolean) => {
    setLevels((prev) =>
      prev.map((level, index) => {
        if (level.levelId === levelId) {
          const newXP = Math.min(level.maxXp, xp);
          const isCompleted = completed !== undefined ? completed : newXP >= level.maxXp;
          
          // Unlock next level if this one is completed
          if (isCompleted && index < prev.length - 1) {
            prev[index + 1].unlocked = true;
          }
          
          return { ...level, xp: newXP, completed: isCompleted };
        }
        return level;
      })
    );
  };

  const totalXP = levels.reduce((sum, level) => sum + level.xp, 0);

  const updateModuleData = (moduleId: string, data: any) => {
    setModuleData((prev) => ({
      ...prev,
      [moduleId]: { ...(prev[moduleId] || {}), ...data },
    }));
  };

  // NEW: 7-Level System Functions
  const setProjectType = (type: ProjectType, customName?: string) => {
    const data = { type, customName, selectedAt: new Date().toISOString() };
    setProjectTypeData(data);
    localStorage.setItem('yieldx_project_type', JSON.stringify(data));
  };

  const setStudyMode = (mode: StudyMode) => {
    const yearsProjection = mode === 'advanced' ? 10 : 5;
    setStudyModeData({ mode, selectedAt: new Date().toISOString(), yearsProjection });
    localStorage.setItem('yieldx_study_mode', JSON.stringify({ mode, selectedAt: new Date().toISOString(), yearsProjection }));
  };

  const updateEnhancedSWOT = (swot: Partial<EnhancedSWOT>) => {
    setEnhancedSWOT((prev) => ({ ...prev, ...swot } as EnhancedSWOT));
    localStorage.setItem('yieldx_enhanced_swot', JSON.stringify({ ...enhancedSWOT, ...swot }));
  };

  const updateFinancialKPIs = (kpis: Partial<FinancialKPIs>) => {
    setFinancialKPIs((prev) => ({ ...prev, ...kpis } as FinancialKPIs));
    localStorage.setItem('yieldx_financial_kpis', JSON.stringify({ ...financialKPIs, ...kpis }));
  };

  const updateBMC = (bmc: Partial<BMCData>) => {
    setBmcData((prev) => ({ ...prev, ...bmc } as BMCData));
    localStorage.setItem('yieldx_bmc_data', JSON.stringify({ ...bmcData, ...bmc }));
  };

  const updateOman2040 = (contribution: Partial<Oman2040Contribution>) => {
    setOman2040((prev) => ({ ...prev, ...contribution } as Oman2040Contribution));
    localStorage.setItem('yieldx_oman2040', JSON.stringify({ ...oman2040, ...contribution }));
  };

  // ========== SAVED PROJECTS FUNCTIONS ==========
  const getCurrentLevel = (lvls: LevelProgress[]): number => {
    // Find highest started/completed level
    for (let i = lvls.length - 1; i >= 0; i--) {
      if (lvls[i].completed || (lvls[i].submissionStatus && lvls[i].submissionStatus !== 'not-started')) {
        return lvls[i].levelId;
      }
    }
    return 0;
  };

  const saveProject = (name: string, source: SavedProjectSource = 'manual'): SavedProject => {
    const now = new Date().toISOString();
    const currentLevel = getCurrentLevel(levels);
    const allCompleted = levels.every(l => l.completed);
    
    // Check if we already have an active project to update
    if (activeSavedProjectId) {
      const existing = savedProjects.find(p => p.id === activeSavedProjectId);
      if (existing) {
        const updated: SavedProject = {
          ...existing,
          name,
          currentLevel,
          status: allCompleted ? 'completed' : 'in-progress',
          lastEditedDate: now,
          projectType: projectTypeData?.type,
          studyModeData: studyModeData ? JSON.parse(JSON.stringify(studyModeData)) : null,
          enhancedSWOT: enhancedSWOT ? JSON.parse(JSON.stringify(enhancedSWOT)) : null,
          financialKPIs: financialKPIs ? JSON.parse(JSON.stringify(financialKPIs)) : null,
          bmcData: bmcData ? JSON.parse(JSON.stringify(bmcData)) : null,
          oman2040: oman2040 ? JSON.parse(JSON.stringify(oman2040)) : null,
          levelsSnapshot: JSON.parse(JSON.stringify(levels)),
          moduleDataSnapshot: JSON.parse(JSON.stringify(moduleData)),
        };
        setSavedProjects(prev => prev.map(p => p.id === activeSavedProjectId ? updated : p));
        // Sync to Supabase asynchronously
        syncProjectToServer(updated).then(() => console.log('✅ Project synced to server'));
        return updated;
      }
    }

    const newProject: SavedProject = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      userId: user?.id || '',
      currentLevel,
      status: allCompleted ? 'completed' : 'in-progress',
      lastEditedDate: now,
      createdAt: now,
      source,
      projectType: projectTypeData?.type,
      studyModeData: studyModeData ? JSON.parse(JSON.stringify(studyModeData)) : null,
      enhancedSWOT: enhancedSWOT ? JSON.parse(JSON.stringify(enhancedSWOT)) : null,
      financialKPIs: financialKPIs ? JSON.parse(JSON.stringify(financialKPIs)) : null,
      bmcData: bmcData ? JSON.parse(JSON.stringify(bmcData)) : null,
      oman2040: oman2040 ? JSON.parse(JSON.stringify(oman2040)) : null,
      levelsSnapshot: JSON.parse(JSON.stringify(levels)),
      moduleDataSnapshot: JSON.parse(JSON.stringify(moduleData)),
    };
    setSavedProjects(prev => [newProject, ...prev]);
    setActiveSavedProjectId(newProject.id);
    // Sync to Supabase asynchronously
    syncProjectToServer(newProject).then(() => console.log('✅ New project synced to server'));
    return newProject;
  };

  const updateSavedProject = (id: string, updates: Partial<SavedProject>) => {
    setSavedProjects(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates, lastEditedDate: new Date().toISOString() } : p);
      // Sync the updated project to server
      const updatedProject = updated.find(p => p.id === id);
      if (updatedProject) {
        syncProjectToServer(updatedProject).then(() => console.log('✅ Project update synced to server'));
      }
      return updated;
    });
  };

  const deleteSavedProject = (id: string) => {
    if (user?.id) deleteProjectFromServer(user.id, id);
    setSavedProjects(prev => prev.filter(p => p.id !== id));
    if (activeSavedProjectId === id) setActiveSavedProjectId(null);
  };

  const loadSavedProject = (id: string) => {
    const project = savedProjects.find(p => p.id === id);
    if (!project) return;
    if (project.levelsSnapshot) setLevels(project.levelsSnapshot);
    if (project.moduleDataSnapshot) setModuleData(project.moduleDataSnapshot);
    if (project.projectType) {
      setProjectTypeData({ type: project.projectType });
      localStorage.setItem('yieldx_project_type', JSON.stringify({ type: project.projectType }));
    }
    if (project.studyModeData !== undefined) {
      setStudyModeData(project.studyModeData || null);
      if (project.studyModeData) localStorage.setItem('yieldx_study_mode', JSON.stringify(project.studyModeData));
      else localStorage.removeItem('yieldx_study_mode');
    }
    if (project.enhancedSWOT !== undefined) {
      setEnhancedSWOT(project.enhancedSWOT || null);
      if (project.enhancedSWOT) localStorage.setItem('yieldx_enhanced_swot', JSON.stringify(project.enhancedSWOT));
      else localStorage.removeItem('yieldx_enhanced_swot');
    }
    if (project.financialKPIs !== undefined) {
      setFinancialKPIs(project.financialKPIs || null);
      if (project.financialKPIs) localStorage.setItem('yieldx_financial_kpis', JSON.stringify(project.financialKPIs));
      else localStorage.removeItem('yieldx_financial_kpis');
    }
    if (project.bmcData !== undefined) {
      setBmcData(project.bmcData || null);
      if (project.bmcData) localStorage.setItem('yieldx_bmc_data', JSON.stringify(project.bmcData));
      else localStorage.removeItem('yieldx_bmc_data');
    }
    if (project.oman2040 !== undefined) {
      setOman2040(project.oman2040 || null);
      if (project.oman2040) localStorage.setItem('yieldx_oman2040', JSON.stringify(project.oman2040));
      else localStorage.removeItem('yieldx_oman2040');
    }
    setActiveSavedProjectId(id);
  };

  const markProjectEdited = (id: string) => {
    setSavedProjects(prev => {
      const updated = prev.map(p => {
        if (p.id !== id) return p;
        const currentLevel = getCurrentLevel(levels);
        const allCompleted = levels.every(l => l.completed);
        return {
          ...p,
          currentLevel,
          status: allCompleted ? 'completed' : 'in-progress',
          lastEditedDate: new Date().toISOString(),
          projectType: projectTypeData?.type,
          studyModeData: studyModeData ? JSON.parse(JSON.stringify(studyModeData)) : null,
          enhancedSWOT: enhancedSWOT ? JSON.parse(JSON.stringify(enhancedSWOT)) : null,
          financialKPIs: financialKPIs ? JSON.parse(JSON.stringify(financialKPIs)) : null,
          bmcData: bmcData ? JSON.parse(JSON.stringify(bmcData)) : null,
          oman2040: oman2040 ? JSON.parse(JSON.stringify(oman2040)) : null,
          levelsSnapshot: JSON.parse(JSON.stringify(levels)),
          moduleDataSnapshot: JSON.parse(JSON.stringify(moduleData)),
        };
      });
      // Sync the updated project to server
      const updatedProject = updated.find(p => p.id === id);
      if (updatedProject) {
        syncProjectToServer(updatedProject).then(() => console.log('✅ Project edit synced to server'));
      }
      return updated;
    });
  };
  // ========== END SAVED PROJECTS FUNCTIONS ==========

  const resetFeasibilityStudy = () => {
    setProjectTypeData(null);
    setStudyModeData(null);
    setEnhancedSWOT(null);
    setFinancialKPIs(null);
    setBmcData(null);
    setOman2040(null);
    setLevels(INITIAL_LEVELS);
    setModuleData({});
    // ── Clear active project so next Save creates a NEW project, not overwrites ──
    setActiveSavedProjectId(null);
    localStorage.removeItem('yieldx_project_type');
    localStorage.removeItem('yieldx_study_mode');
    localStorage.removeItem('yieldx_enhanced_swot');
    localStorage.removeItem('yieldx_financial_kpis');
    localStorage.removeItem('yieldx_bmc_data');
    localStorage.removeItem('yieldx_oman2040');
  };

  return (
    <YieldXContext.Provider
      value={{
        user,
        isOnline,
        login,
        register,
        logout,
        loginWithQR,
        generateQRCode,
        updateUser,
        levels,
        updateLevelProgress,
        totalXP,
        currentView,
        setCurrentView,
        moduleData,
        updateModuleData,
        
        // Language & Theme
        language,
        setLanguage: setLanguageState,
        theme,
        setTheme: setThemeState,
        translations: translations[language],
        
        // Workspace functions
        workspaces,
        currentWorkspace,
        setCurrentWorkspace,
        createWorkspace: (name: string, description: string, mode: WorkspaceMode) => {
          const newWorkspace: Workspace = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            description,
            mode,
            createdBy: user?.id || '',
            createdByName: user?.name || '',
            classCode: '',
            qrCode: '',
            templateData: {},
            teams: [],
            forkedFrom: '',
            isTemplate: false,
            createdAt: new Date().toISOString(),
            status: 'draft',
          };
          setWorkspaces([...workspaces, newWorkspace]);
          return newWorkspace;
        },
        forkWorkspace: (workspaceId: string) => {
          const originalWorkspace = workspaces.find((w) => w.id === workspaceId);
          if (!originalWorkspace) return null;
          const newWorkspace: Workspace = {
            id: Math.random().toString(36).substr(2, 9),
            name: `${originalWorkspace.name} (نسخة)`,
            description: originalWorkspace.description,
            mode: originalWorkspace.mode,
            createdBy: user?.id || '',
            createdByName: user?.name || '',
            classCode: '',
            qrCode: '',
            templateData: originalWorkspace.templateData,
            teams: [],
            forkedFrom: originalWorkspace.id,
            isTemplate: false,
            createdAt: new Date().toISOString(),
            status: 'draft',
          };
          setWorkspaces([...workspaces, newWorkspace]);
          return newWorkspace;
        },
        updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => {
          setWorkspaces((prev) =>
            prev.map((workspace) => {
              if (workspace.id === workspaceId) {
                return { ...workspace, ...updates };
              }
              return workspace;
            })
          );
        },
        deleteWorkspace: (workspaceId: string) => {
          setWorkspaces((prev) => prev.filter((w) => w.id !== workspaceId));
        },
        getWorkspaceByCode: (code: string) => {
          return workspaces.find((w) => w.classCode === code) || null;
        },

        // ========== SAVED PROJECTS ==========
        savedProjects,
        activeSavedProjectId,
        saveProject,
        updateSavedProject,
        deleteSavedProject,
        loadSavedProject,
        markProjectEdited,
        // =====================================
        
        // Chat functions
        messages,
        sendMessage: (workspaceId: string, content: string, type: MessageType, teamId?: string) => {
          const newMessage: Message = {
            id: Math.random().toString(36).substr(2, 9),
            workspaceId,
            teamId,
            sender: {
              id: user?.id || '',
              name: user?.name || '',
              role: user?.role || 'student',
            },
            content,
            timestamp: new Date().toISOString(),
            type,
            pinned: false,
            helpTag: false,
            attachments: [],
            isRubric: false,
          };
          setMessages([...messages, newMessage]);
        },
        pinMessage: (messageId: string) => {
          setMessages((prev) =>
            prev.map((message) => {
              if (message.id === messageId) {
                return { ...message, pinned: !message.pinned };
              }
              return message;
            })
          );
        },
        toggleHelpTag: (messageId: string) => {
          setMessages((prev) =>
            prev.map((message) => {
              if (message.id === messageId) {
                return { ...message, helpTag: !message.helpTag };
              }
              return message;
            })
          );
        },
        addAttachment: (messageId: string, attachment: Attachment) => {
          setMessages((prev) =>
            prev.map((message) => {
              if (message.id === messageId) {
                return { ...message, attachments: [...(message.attachments || []), attachment] };
              }
              return message;
            })
          );
        },
        getWorkspaceMessages: (workspaceId: string, teamId?: string) => {
          return messages.filter((m) => m.workspaceId === workspaceId && m.teamId === teamId);
        },
        
        // Cohort functions
        cohorts,
        createCohort: (name: string, description?: string) => {
          const newCohort: Cohort = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            code: Math.random().toString(36).substr(2, 12).toUpperCase(),
            qrCode: '',
            createdBy: user?.id || '',
            createdByName: user?.name || '',
            createdAt: new Date().toISOString(),
            studentIds: [],
            description,
            status: 'active',
          };
          setCohorts([...cohorts, newCohort]);
          return newCohort;
        },
        updateCohort: (cohortId: string, updates: Partial<Cohort>) => {
          setCohorts((prev) =>
            prev.map((cohort) => {
              if (cohort.id === cohortId) {
                return { ...cohort, ...updates };
              }
              return cohort;
            })
          );
        },
        deleteCohort: (cohortId: string) => {
          setCohorts((prev) => prev.filter((c) => c.id !== cohortId));
        },
        assignStudentToCohort: (cohortId: string, studentId: string) => {
          setCohorts((prev) =>
            prev.map((cohort) => {
              if (cohort.id === cohortId) {
                return { ...cohort, studentIds: [...cohort.studentIds, studentId] };
              }
              return cohort;
            })
          );
        },
        removeStudentFromCohort: (cohortId: string, studentId: string) => {
          setCohorts((prev) =>
            prev.map((cohort) => {
              if (cohort.id === cohortId) {
                return { ...cohort, studentIds: cohort.studentIds.filter((id) => id !== studentId) };
              }
              return cohort;
            })
          );
        },
        getCohortByCode: (code: string) => {
          return cohorts.find((c) => c.code === code) || null;
        },

        // NEW: Badges & Achievements
        badges,
        achievements,
        awardBadge: (badgeId: string) => {
          setBadges((prev) =>
            prev.map((badge) => {
              if (badge.id === badgeId) {
                return { ...badge, earnedAt: new Date().toISOString() };
              }
              return badge;
            })
          );
        },
        unlockAchievement: (achievementId: string) => {
          setAchievements((prev) =>
            prev.map((achievement) => {
              if (achievement.id === achievementId) {
                return { ...achievement, unlocked: true, unlockedAt: new Date().toISOString() };
              }
              return achievement;
            })
          );
        },
        checkAchievements: () => {
          // Implement logic to check and unlock achievements
        },

        // NEW: Streaks
        streak,
        updateStreak: () => {
          const today = new Date().toISOString().split('T')[0];
          if (user && user.lastLoginDate && user.totalLoginDays) {
            const lastLoginDate = new Date(user.lastLoginDate).toISOString().split('T')[0];
            if (lastLoginDate === today) {
              setStreak((prev) => ({
                ...prev,
                currentStreak: prev.currentStreak + 1,
                longestStreak: Math.max(prev.longestStreak, prev.currentStreak + 1),
                totalLoginDays: user.totalLoginDays + 1,
              }));
            } else {
              setStreak((prev) => ({
                ...prev,
                currentStreak: 1,
                longestStreak: Math.max(prev.longestStreak, 1),
                totalLoginDays: user.totalLoginDays + 1,
              }));
            }
          }
        },
        claimStreakReward: (days: number) => {
          setStreak((prev) => ({
            ...prev,
            streakRewards: prev.streakRewards.map((reward) => {
              if (reward.days === days) {
                return { ...reward, claimed: true };
              }
              return reward;
            }),
          }));
        },

        // NEW: Leaderboard
        leaderboard,
        updateLeaderboard: () => {
          // Implement logic to update leaderboard
        },
        getMyRank: () => {
          // Implement logic to get user's rank
          return 0;
        },

        // NEW: Notifications
        notifications,
        addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
          const newNotification: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            ...notification,
            timestamp: new Date().toISOString(),
            read: false,
          };
          setNotifications([...notifications, newNotification]);
        },
        markNotificationRead: (notificationId: string) => {
          setNotifications((prev) =>
            prev.map((notification) => {
              if (notification.id === notificationId) {
                return { ...notification, read: true };
              }
              return notification;
            })
          );
        },
        clearAllNotifications: () => {
          setNotifications([]);
        },
        unreadCount: notifications.filter((n) => !n.read).length,

        // NEW: Announcements
        announcements,
        addAnnouncement: (announcement: Omit<Announcement, 'id' | 'timestamp' | 'read'>) => {
          const newAnnouncement: Announcement = {
            id: Math.random().toString(36).substr(2, 9),
            ...announcement,
            timestamp: new Date().toISOString(),
            read: false,
          };
          setAnnouncements([...announcements, newAnnouncement]);
        },
        getStudentAnnouncements: () => {
          return announcements.filter((a) => a.targetAudience === 'all' || a.targetAudience === 'class' || a.targetAudience === 'individual');
        },
        unreadAnnouncementsCount: announcements.filter((a) => !a.read).length,

        // NEW: Structured Communication System
        createAnnouncement: (params: { title: string; message: string; scope: 'university' | 'class' | 'project'; targetId: string; priority: 'normal' | 'important' | 'urgent' }) => {
          const newAnnouncement: Announcement = {
            id: Math.random().toString(36).substr(2, 9),
            title: params.title,
            message: params.message,
            scope: params.scope,
            targetId: params.targetId,
            priority: params.priority,
            authorId: user?.id || '',
            authorName: user?.name || '',
            timestamp: new Date().toISOString(),
            readBy: [],
          };
          setAnnouncements([...announcements, newAnnouncement]);
        },
        markAnnouncementRead: (announcementId: string, userId: string) => {
          setAnnouncements((prev) =>
            prev.map((announcement) => {
              if (announcement.id === announcementId) {
                return {
                  ...announcement,
                  read: true,
                  readBy: [...(announcement.readBy ?? []), userId],
                };
              }
              return announcement;
            })
          );
        },
        getVisibleAnnouncements: (userId: string) => {
          return announcements.filter((a) => !(a.readBy ?? []).includes(userId));
        },
        
        // NEW: Project Chat System
        projectChats,
        sendChatMessage: (projectId: string, message: string, isAnnouncement?: boolean) => {
          const newMessage: ChatMessage = {
            id: Math.random().toString(36).substr(2, 9),
            projectId,
            senderId: user?.id || '',
            senderName: user?.name || '',
            senderRole: user?.role || 'student',
            message,
            timestamp: new Date().toISOString(),
            isAnnouncement,
            deleted: false,
          };
          setProjectChats((prev) => {
            const chatIndex = prev.findIndex((chat) => chat.projectId === projectId);
            if (chatIndex !== -1) {
              const updatedChats = [...prev];
              updatedChats[chatIndex].messages.push(newMessage);
              return updatedChats;
            } else {
              return [...prev, { projectId, messages: [newMessage], mutedStudents: [], lastReadAt: {} }];
            }
          });
        },
        deleteChatMessage: (projectId: string, messageId: string) => {
          setProjectChats((prev) => {
            const chatIndex = prev.findIndex((chat) => chat.projectId === projectId);
            if (chatIndex !== -1) {
              const updatedChats = [...prev];
              updatedChats[chatIndex].messages = updatedChats[chatIndex].messages.filter((msg) => msg.id !== messageId);
              return updatedChats;
            } else {
              return prev;
            }
          });
        },
        muteStudent: (projectId: string, studentId: string) => {
          setProjectChats((prev) => {
            const chatIndex = prev.findIndex((chat) => chat.projectId === projectId);
            if (chatIndex !== -1) {
              const updatedChats = [...prev];
              updatedChats[chatIndex].mutedStudents.push(studentId);
              return updatedChats;
            } else {
              return prev;
            }
          });
        },
        unmuteStudent: (projectId: string, studentId: string) => {
          setProjectChats((prev) => {
            const chatIndex = prev.findIndex((chat) => chat.projectId === projectId);
            if (chatIndex !== -1) {
              const updatedChats = [...prev];
              updatedChats[chatIndex].mutedStudents = updatedChats[chatIndex].mutedStudents.filter((id) => id !== studentId);
              return updatedChats;
            } else {
              return prev;
            }
          });
        },
        getProjectChat: (projectId: string) => {
          return projectChats.find((chat) => chat.projectId === projectId) || null;
        },
        markChatAsRead: (projectId: string, userId: string) => {
          setProjectChats((prev) => {
            const chatIndex = prev.findIndex((chat) => chat.projectId === projectId);
            if (chatIndex !== -1) {
              const updatedChats = [...prev];
              updatedChats[chatIndex].lastReadAt[userId] = new Date().toISOString();
              return updatedChats;
            } else {
              return prev;
            }
          });
        },
        getUnreadMessageCount: (projectId: string, userId: string) => {
          const chat = projectChats.find((chat) => chat.projectId === projectId);
          if (chat) {
            const lastReadAt = chat.lastReadAt[userId] || '';
            return chat.messages.filter((msg) => msg.timestamp > lastReadAt).length;
          }
          return 0;
        },

        // NEW: Peer Reviews
        peerReviews,
        createPeerReview: (review: Omit<PeerReview, 'id' | 'createdAt' | 'xpEarned'>) => {
          const newReview: PeerReview = {
            id: Math.random().toString(36).substr(2, 9),
            ...review,
            createdAt: new Date().toISOString(),
            xpEarned: 0,
          };
          setPeerReviews([...peerReviews, newReview]);
        },
        getPeerReviewsForSubmission: (submissionId: string) => {
          return peerReviews.filter((r) => r.submissionId === submissionId);
        },
        getMyPeerReviews: () => {
          return peerReviews.filter((r) => r.reviewerId === user?.id);
        },

        // NEW: Analytics
        analytics,
        updateAnalytics: (levelId: number, timeSpent: number) => {
          setAnalytics((prev) => ({
            ...prev,
            timeSpentPerLevel: {
              ...prev.timeSpentPerLevel,
              [levelId]: (prev.timeSpentPerLevel[levelId] || 0) + timeSpent,
            },
            totalTimeSpent: prev.totalTimeSpent + timeSpent,
            submissionTimeline: [
              ...prev.submissionTimeline,
              { date: new Date().toISOString().split('T')[0], levelId },
            ],
          }));
        },
        getTeacherAnalytics: (cohortId: string) => ({
          cohortId,
          averageCompletionRate: 0,
          averageTimePerLevel: {},
          strugglingStudents: [],
          topPerformers: [],
          levelDifficultyScore: {},
        }),

        // NEW: Templates
        templates,
        createTemplate: (template: Omit<BusinessPlanTemplate, 'id' | 'usageCount'>) => {
          const newTemplate: BusinessPlanTemplate = {
            id: Math.random().toString(36).substr(2, 9),
            ...template,
            usageCount: 0,
          };
          setTemplates([...templates, newTemplate]);
        },
        useTemplate: (templateId: string) => {
          // Implement logic to use template
        },

        // NEW: Auto-save & Version History
        autoSaveState,
        versionHistory,
        autoSave: (workspaceId: string, data: Record<string, any>) => {
          setAutoSaveState((prev) => ({
            ...prev,
            isSaving: true,
          }));
          setTimeout(() => {
            setAutoSaveState((prev) => ({
              ...prev,
              isSaving: false,
              lastSaved: new Date().toISOString(),
              hasUnsavedChanges: false,
            }));
            setVersionHistory((prev) => [
              ...prev,
              {
                id: Math.random().toString(36).substr(2, 9),
                userId: user?.id || '',
                workspaceId,
                timestamp: new Date().toISOString(),
                data,
              },
            ]);
          }, 1000);
        },
        createVersion: (workspaceId: string, label?: string) => {
          setVersionHistory((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substr(2, 9),
              userId: user?.id || '',
              workspaceId,
              timestamp: new Date().toISOString(),
              data: {},
              label,
            },
          ]);
        },
        restoreVersion: () => {},

        // NEW: 7-Level System
        projectTypeData,
        studyModeData,
        enhancedSWOT,
        financialKPIs,
        bmcData,
        oman2040,
        setProjectType,
        setStudyMode,
        updateEnhancedSWOT,
        updateFinancialKPIs,
        updateBMC,
        updateOman2040,
        resetFeasibilityStudy,
      }}
    >
      {children}
    </YieldXContext.Provider>
  );
}

export function useYieldX() {
  const context = useContext(YieldXContext);
  if (!context) {
    throw new Error('useYieldX must be used within YieldXProvider');
  }
  return context;
}