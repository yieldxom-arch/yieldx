import { supabase } from '/utils/supabase/client';
import { projectId } from '/utils/supabase/info';

/**
 * Get the Supabase auth token for API requests
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch {
    return null;
  }
}

/**
 * Map HTTP error codes to user-friendly messages
 */
const mapHttpError = (status: number, language: 'en' | 'ar'): string => {
  if (status === 401) {
    return language === 'ar'
      ? 'يرجى تسجيل الدخول مرة أخرى'
      : 'Please log in again.';
  }
  if (status === 403) {
    return language === 'ar'
      ? 'المساعد الذكي متاح فقط في خطط Pro والمؤسسات. يرجى الترقية.'
      : 'AI Assistant is only available on Pro and Organization plans. Please upgrade.';
  }
  if (status === 429) {
    return language === 'ar'
      ? 'عدد كبير جداً من الطلبات. يرجى المحاولة لاحقاً.'
      : 'Too many requests. Please slow down and try again.';
  }
  return language === 'ar'
    ? 'عذراً، لم أتمكن من الوصول إلى المساعد الذكي الآن. حاول مرة أخرى لاحقاً.'
    : 'Sorry, I could not reach the AI assistant right now. Please try again later.';
};

export type ChatHistoryItem = {
  role: 'user' | 'assistant';
  content: string;
};

/**
 * Send a chat message to the YieldX AI Assistant via Supabase Edge Function
 * The edge function handles:
 * - Authentication validation
 * - Subscription tier checking
 * - Anthropic API call (server-side, API key never exposed to browser)
 */
export async function sendChatMessage(params: {
  userMessage: string;
  history: ChatHistoryItem[];
  language: 'en' | 'ar';
  userName?: string;
  userRole?: 'student' | 'teacher' | 'organization';
}): Promise<{ text: string; error?: string }> {
  try {
    // Get auth token
    const token = await getAuthToken();
    if (!token) {
      const text = params.language === 'ar'
        ? 'يرجى تسجيل الدخول للوصول إلى المساعد الذكي'
        : 'Please log in to access the AI Assistant.';
      return { text, error: 'Not authenticated' };
    }

    // Build edge function URL
    // In development, this will be http://localhost:54321/functions/v1/chat
    // In production, this will be https://your-project.supabase.co/functions/v1/chat
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      const text = params.language === 'ar'
        ? 'خطأ في التكوين. يرجى التواصل مع الدعم.'
        : 'Configuration error. Please contact support.';
      return { text, error: 'Missing Supabase URL' };
    }

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/chat`;

    // Call edge function
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userMessage: params.userMessage,
        history: params.history,
        language: params.language,
        userName: params.userName,
        userRole: params.userRole,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = errorData.error || mapHttpError(response.status, params.language);
      return { text: errorMessage, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    const text = data.text || '';

    if (!text) {
      const fallback = params.language === 'ar'
        ? 'تلقيت استجابة فارغة من المساعد. حاول إعادة إرسال سؤالك مرة أخرى.'
        : 'The assistant returned an empty response. Please try sending your question again.';
      return { text: fallback, error: 'Empty response' };
    }

    return { text };
  } catch (error) {
    console.error('sendChatMessage error:', error);
    const text = params.language === 'ar'
      ? 'عذراً، لم أتمكن من الوصول إلى المساعد الذكي الآن. حاول مرة أخرى لاحقاً.'
      : 'Sorry, I could not reach the AI assistant right now. Please try again later.';
    return { text, error: String(error) };
  }
}
