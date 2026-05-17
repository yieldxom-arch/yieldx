import { supabase } from '/utils/supabase/client';
import type { AICopilotMessage, AICopilotRole } from '@/app/types/ai-copilot';

export const AI_COPILOT_INSIGHTS_GENERATED = 'yieldx:copilot-insights-generated';
export const AI_COPILOT_INSIGHTS_ERROR = 'yieldx:copilot-insights-error';

export type CopilotProjectData = {
  projectTypeData: any;
  studyModeData: any;
  moduleData: Record<string, any>;
  enhancedSWOT: any;
  financialKPIs: any;
  bmcData: any;
  oman2040: any;
};

const normalizeMessage = (message: any, role: AICopilotRole): AICopilotMessage => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  copilotRole: role,
  type: message.type || 'insight',
  priority: message.priority || 'medium',
  title: message.title || message.heading || 'Insight',
  titleAr: message.titleAr || message.headingAr || message.title || 'رؤية',
  content: message.content || message.body || 'The AI evaluated your data and returned a recommendation.',
  contentAr: message.contentAr || message.bodyAr || message.content || 'قيم الذكاء الاصطناعي بياناتك وقدّم توصية.',
  timestamp: Date.now(),
  read: false,
  actionable: false,
});

const createFallbackMessage = (role: AICopilotRole): AICopilotMessage[] => {
  const fallbackMap: Record<AICopilotRole, { title: string; titleAr: string; content: string; contentAr: string }> = {
    CFO: {
      title: 'Complete Level 0 first',
      titleAr: 'أكمل المستوى 0 أولاً',
      content: 'Please finish the project type selection in Level 0 so I can analyze your financials and licensing needs accurately.',
      contentAr: 'يرجى إنهاء اختيار نوع المشروع في المستوى 0 حتى أتمكن من تحليل احتياجاتك المالية والترخيص بدقة.',
    },
    CMO: {
      title: 'Choose your project type first',
      titleAr: 'اختر نوع المشروع أولاً',
      content: 'Complete Level 0 so I can provide market positioning, competitor insight, and customer strategy for your project.',
      contentAr: 'أكمل المستوى 0 حتى أتمكن من تقديم تحديد موضع السوق، ورؤية المنافسين، واستراتيجية العملاء لمشروعك.',
    },
    CEO: {
      title: 'Start with Level 0',
      titleAr: 'ابدأ بالمستوى 0',
      content: 'Finish the initial project setup in Level 0 before I can give you a strategic overview for your business model.',
      contentAr: 'أكمل الإعداد الأولي للمشروع في المستوى 0 قبل أن أتمكن من تقديم نظرة استراتيجية لنموذج عملك.',
    },
  };

  const message = fallbackMap[role];
  return [
    {
      id: `${role}-empty-${Date.now()}`,
      copilotRole: role,
      type: 'question',
      priority: 'low',
      title: message.title,
      titleAr: message.titleAr,
      content: message.content,
      contentAr: message.contentAr,
      timestamp: Date.now(),
      read: false,
      actionable: false,
    },
  ];
};

async function getAuthToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch {
    return null;
  }
}

async function callCopilotEdgeFunction(
  role: AICopilotRole,
  projectData: CopilotProjectData,
  language: 'en' | 'ar'
): Promise<AICopilotMessage[]> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Missing VITE_SUPABASE_URL');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/copilot-insights`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ role, projectData, language }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const raw: any[] = Array.isArray(data.messages) ? data.messages : [];

  return raw.slice(0, 3).map((item) => normalizeMessage(item, role));
}

const generateInsights = async (
  role: AICopilotRole,
  projectData: CopilotProjectData,
  language: 'en' | 'ar'
): Promise<AICopilotMessage[]> => {
  try {
    const messages = await callCopilotEdgeFunction(role, projectData, language);
    if (messages.length === 0) {
      return createFallbackMessage(role);
    }
    return messages;
  } catch (error) {
    console.error(`Copilot ${role} insights error:`, error);
    return createFallbackMessage(role);
  }
};

export async function generateCFOInsights(projectData: CopilotProjectData, language: 'en' | 'ar'): Promise<AICopilotMessage[]> {
  return generateInsights('CFO', projectData, language);
}

export async function generateCMOInsights(projectData: CopilotProjectData, language: 'en' | 'ar'): Promise<AICopilotMessage[]> {
  return generateInsights('CMO', projectData, language);
}

export async function generateCEOInsights(projectData: CopilotProjectData, language: 'en' | 'ar'): Promise<AICopilotMessage[]> {
  return generateInsights('CEO', projectData, language);
}
