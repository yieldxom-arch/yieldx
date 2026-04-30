// AI Co-Pilot Types

export type AICopilotRole = 'CFO' | 'CMO' | 'CEO';

export interface AICopilotPersonality {
  role: AICopilotRole;
  name: string;
  nameAr: string;
  avatar: string; // Avatar image or component
  color: string; // Primary color theme
  personality: {
    tone: 'analytical' | 'creative' | 'strategic' | 'cautious' | 'bold';
    traits: string[]; // e.g., ['detail-oriented', 'risk-averse', 'data-driven']
  };
  specialization: string[];
  catchphrases: {
    greeting: { en: string; ar: string };
    success: { en: string; ar: string };
    warning: { en: string; ar: string };
    thinking: { en: string; ar: string };
  };
}

export interface AICopilotMessage {
  id: string;
  copilotRole: AICopilotRole;
  type: 'analysis' | 'suggestion' | 'warning' | 'insight' | 'question' | 'celebration';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  timestamp: number;
  read: boolean;
  actionable: boolean;
  actions?: AICopilotAction[];
  relatedData?: any; // Context-specific data
}

export interface AICopilotAction {
  id: string;
  label: string;
  labelAr: string;
  type: 'accept' | 'decline' | 'view-details' | 'implement';
  callback: () => void;
}

export interface AICopilotInsight {
  copilotRole: AICopilotRole;
  category: 'financial' | 'marketing' | 'strategic' | 'operational';
  severity: 'info' | 'warning' | 'critical';
  metric: string;
  currentValue: number;
  expectedValue: number;
  deviation: number; // percentage
  recommendation: string;
  recommendationAr: string;
}

export interface CFOAnalysis {
  cashFlowHealth: 'healthy' | 'warning' | 'critical';
  burnRate: number; // monthly
  runway: number; // months
  profitMargin: number;
  recommendations: string[];
  redFlags: string[];
  opportunities: string[];
}

export interface CMOAnalysis {
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
  campaignEffectiveness: number; // 0-100
  competitiveAdvantage: string[];
  marketGaps: string[];
  recommendations: string[];
}

export interface CEOAnalysis {
  overallHealth: number; // 0-100
  strategicAlignment: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  priorityFocus: string[];
  keyDecisions: CEODecision[];
}

export interface CEODecision {
  id: string;
  question: string;
  questionAr: string;
  options: {
    label: string;
    labelAr: string;
    impact: {
      financial: number;
      market: number;
      operations: number;
    };
    risks: string[];
    benefits: string[];
  }[];
  deadline?: number;
  importance: 'low' | 'medium' | 'high' | 'critical';
}
