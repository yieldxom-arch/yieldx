// ─────────────────────────────────────────────────────────────────────────────
// YieldX Advisor — one AI advisor for the whole study.
//
// Replaces the three separate personas (Atlas/CFO, Nova/CMO, Orion/CEO) and the
// separate chatbot. Everything goes through the `ai-proxy` edge function with a
// single Anthropic key. Personal details are removed before anything is sent,
// and the advisor is told never to invent numbers.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from '@/lib/supabase';
import { redactPersonalData } from '@/lib/ai';

export type AdvisorArea = 'finance' | 'market' | 'legal' | 'operations' | 'people' | 'strategy';
export type AdvisorType = 'warning' | 'suggestion' | 'insight' | 'celebration';

export interface AdvisorInsight {
  id: string;
  area: AdvisorArea;
  type: AdvisorType;
  priority: 'high' | 'medium' | 'low';
  title: string;
  content: string;
}

export interface AdvisorChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export class AdvisorError extends Error {
  constructor(public kind: 'auth' | 'unavailable' | 'rate' | 'network', message: string) {
    super(message);
  }
}

const AREAS: AdvisorArea[] = ['finance', 'market', 'legal', 'operations', 'people', 'strategy'];
const TYPES: AdvisorType[] = ['warning', 'suggestion', 'insight', 'celebration'];
const MAX_STUDY_CHARS = 38_000;

async function token(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const t = data.session?.access_token;
  if (!t) throw new AdvisorError('auth', 'Not signed in');
  return t;
}

async function proxy(body: Record<string, unknown>): Promise<string> {
  const url = (import.meta as any).env?.VITE_SUPABASE_URL;
  if (!url) throw new AdvisorError('unavailable', 'Missing VITE_SUPABASE_URL');
  let res: Response;
  try {
    res = await fetch(`${url}/functions/v1/ai-proxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await token()}` },
      body: JSON.stringify(body),
    });
  } catch (e) {
    if (e instanceof AdvisorError) throw e;
    throw new AdvisorError('network', 'Network error');
  }
  if (res.status === 401) throw new AdvisorError('auth', 'Not signed in');
  if (res.status === 429) throw new AdvisorError('rate', 'Too many requests');
  if (!res.ok) throw new AdvisorError('unavailable', `AI service error ${res.status}`);
  const json = await res.json().catch(() => ({}));
  return String(json.text ?? '').trim();
}

/** A compact, privacy-safe copy of the study for the advisor. */
export function studyContext(data: {
  projectTypeData?: any;
  moduleData?: Record<string, any>;
  financialKPIs?: any;
}): string {
  const { projectTypeData, moduleData = {}, financialKPIs } = data;
  const levels: Record<string, any> = {};
  for (const [k, v] of Object.entries(moduleData)) {
    if (!/^level[0-7]$/.test(k) || !v) continue;
    const { aiFeedback: _fb, ...rest } = v as any;
    levels[k] = rest;
  }
  const payload = redactPersonalData({ projectType: projectTypeData?.type ?? null, levels, financialKPIs: financialKPIs ?? null });
  let text = JSON.stringify(payload);
  if (text.length > MAX_STUDY_CHARS) text = text.slice(0, MAX_STUDY_CHARS) + '…(truncated)';
  return text;
}

function systemPrompt(language: 'ar' | 'en', study: string) {
  return language === 'ar'
    ? `أنت "مستشار YieldX"، مستشار أعمال خبير في دراسات الجدوى للمشاريع الصغيرة والمتوسطة في سلطنة عُمان، تغطي المالية والسوق والجوانب القانونية والتشغيل والموارد البشرية والاستراتيجية.
- استخدم فقط الأرقام الموجودة في بيانات الدراسة أدناه. لا تخترع أرقاماً أبداً. إذا كان رقم ناقصاً فقل ذلك واطلب من المستخدم إضافته في المستوى المناسب.
- عند الحديث عن القوانين أو الرسوم في عُمان، اذكر أنها تحتاج إلى تأكيد من الجهة الرسمية (مثل استثمر بسهولة، جهاز الضرائب، صندوق الحماية الاجتماعية).
- كن عملياً ومختصراً وواضحاً. أجب بالعربية.
- إذا سُئلت عن شيء خارج دراسات الجدوى وريادة الأعمال فأعد المحادثة بلطف إلى المشروع.

بيانات الدراسة (JSON):
${study}`
    : `You are "YieldX Advisor", an expert business advisor for feasibility studies of small and medium businesses in Oman, covering finance, market, legal, operations, people and strategy.
- Use only figures that appear in the study data below. Never invent numbers. If a figure is missing, say so and point to the level where the user should add it.
- When you mention Omani rules or fees, say they should be confirmed with the official source (e.g. Invest Easy, the Tax Authority, the Social Protection Fund).
- Be practical, brief and clear. Answer in English.
- If asked about something unrelated to feasibility studies or entrepreneurship, gently bring the conversation back to the project.

Study data (JSON):
${study}`;
}

/** A short review of the whole study: 4–6 points across finance, market, legal, operations, people and strategy. */
export async function getAdvisorInsights(context: Parameters<typeof studyContext>[0], language: 'ar' | 'en'): Promise<AdvisorInsight[]> {
  const study = studyContext(context);
  const prompt =
    language === 'ar'
      ? `راجع دراسة الجدوى كاملة وأعطِ من 4 إلى 6 ملاحظات مهمة تغطي مجالات مختلفة (المالية، السوق، القانونية، التشغيل، الموارد البشرية، الاستراتيجية). ابدأ بالأهم.
أرجع JSON فقط بهذا الشكل:
{"insights":[{"area":"finance|market|legal|operations|people|strategy","type":"warning|suggestion|insight|celebration","priority":"high|medium|low","title":"عنوان قصير","content":"جملتان أو ثلاث، مع ذكر الرقم من البيانات إن وُجد"}]}`
      : `Review the whole feasibility study and give 4 to 6 important points across different areas (finance, market, legal, operations, people, strategy). Most important first.
Return JSON only, in this shape:
{"insights":[{"area":"finance|market|legal|operations|people|strategy","type":"warning|suggestion|insight|celebration","priority":"high|medium|low","title":"short title","content":"two or three sentences, quoting the figure from the data when there is one"}]}`;
  const raw = await proxy({ prompt, system: systemPrompt(language, study), maxTokens: 1400 });
  let parsed: any;
  try {
    const m = raw.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(m ? m[0] : raw);
  } catch {
    parsed = { insights: [] };
  }
  const list: any[] = Array.isArray(parsed?.insights) ? parsed.insights : [];
  return list.slice(0, 6).map((x, i) => ({
    id: `adv-${Date.now()}-${i}`,
    area: AREAS.includes(x?.area) ? x.area : 'strategy',
    type: TYPES.includes(x?.type) ? x.type : 'insight',
    priority: x?.priority === 'high' || x?.priority === 'low' ? x.priority : 'medium',
    title: String(x?.title || '').slice(0, 140) || (language === 'ar' ? 'ملاحظة' : 'Note'),
    content: String(x?.content || '').slice(0, 900),
  }));
}

/** Chat with the advisor about the study. */
export async function askAdvisor(
  history: AdvisorChatTurn[],
  question: string,
  context: Parameters<typeof studyContext>[0],
  language: 'ar' | 'en'
): Promise<string> {
  const turns = [...history, { role: 'user' as const, content: question.slice(0, 2000) }].slice(-12);
  // the conversation must start with the user
  while (turns.length && turns[0].role !== 'user') turns.shift();
  return proxy({ messages: turns, system: systemPrompt(language, studyContext(context)), maxTokens: 900 });
}
