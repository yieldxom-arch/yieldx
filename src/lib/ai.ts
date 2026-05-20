// ─────────────────────────────────────────────────────────────────────────────
// YieldX AI Integration — Anthropic Claude
//
// SECURITY NOTE: This uses VITE_ANTHROPIC_API_KEY (client-side).
// The key is exposed in the browser bundle. For production, move this call
// to a Supabase Edge Function (see supabase/functions/chat/index.ts for the
// pattern) and set ANTHROPIC_API_KEY as an edge-function secret instead.
// ─────────────────────────────────────────────────────────────────────────────

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

export interface AiFeedback {
  score: number;           // 0-100
  strengths: string[];     // 3 specific strengths
  risks: string[];         // 3 specific risks / weaknesses
  suggestions: string[];   // 2 concrete improvements
  financialProjection?: FinancialProjectionRow[]; // Level 6 only
}

export interface FinancialProjectionRow {
  year: string;
  revenue: string;
  expenses: string;
  netProfit: string;
  cumulativeCashFlow: string;
}

const LEVEL_NAMES: Record<number, { ar: string; en: string }> = {
  0: { ar: 'اختيار نوع المشروع', en: 'Project Type Selection' },
  1: { ar: 'تحليل السوق', en: 'Market Analysis' },
  2: { ar: 'المتطلبات القانونية والتراخيص', en: 'Legal Requirements & Licenses' },
  3: { ar: 'المتطلبات التشغيلية', en: 'Operational Requirements' },
  4: { ar: 'إدارة الأصول', en: 'Asset Management' },
  5: { ar: 'تخطيط الموظفين', en: 'Staff Planning' },
  6: { ar: 'التخطيط المالي', en: 'Financial Planning' },
  7: { ar: 'معلومات المساهمين وهيكل الملكية', en: 'Shareholder Information & Ownership Structure' },
};

function getApiKey(): string | null {
  return (import.meta as any).env?.VITE_ANTHROPIC_API_KEY ?? null;
}

export async function callClaude(
  prompt: string,
  systemPrompt: string,
  maxTokens = 1024,
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('VITE_ANTHROPIC_API_KEY is not set. Add it to your .env file.');
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => response.statusText);
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const block = Array.isArray(data.content) ? data.content[0] : data.content;
  return (block?.text ?? '').trim();
}

// ─── Level-specific feedback ─────────────────────────────────────────────────

function buildSystemPrompt(language: 'ar' | 'en'): string {
  if (language === 'ar') {
    return `أنت مستشار أعمال خبير متخصص في دراسات الجدوى للمشاريع الصغيرة والمتوسطة في سلطنة عُمان.
تقوم بتقييم إجابات الطلاب في منصة YieldX التعليمية وتقديم تغذية راجعة بناءة وواقعية.
يجب أن يكون ردك دائماً بتنسيق JSON صحيح فقط. لا تضف أي نص خارج كتلة JSON.`;
  }
  return `You are an expert business consultant specializing in feasibility studies for SMEs in Oman.
You evaluate student answers on the YieldX educational platform and provide constructive, realistic feedback.
Your response must always be valid JSON only. Do not add any text outside the JSON block.`;
}

function buildFeedbackPrompt(
  levelId: number,
  levelName: string,
  formData: Record<string, any>,
  language: 'ar' | 'en',
): string {
  const dataStr = JSON.stringify(formData, null, 2);
  if (language === 'ar') {
    return `قيّم إجابة الطالب التالية لمستوى "${levelName}" (المستوى ${levelId}) في دراسة الجدوى.

بيانات الطالب:
${dataStr}

أرجع كائن JSON بهذا الشكل بالضبط (لا شيء آخر):
{
  "score": <رقم من 0 إلى 100>,
  "strengths": ["نقطة قوة 1", "نقطة قوة 2", "نقطة قوة 3"],
  "risks": ["مخاطرة أو ضعف 1", "مخاطرة أو ضعف 2", "مخاطرة أو ضعف 3"],
  "suggestions": ["اقتراح تحسين 1", "اقتراح تحسين 2"]
}`;
  }
  return `Evaluate the following student answer for the "${levelName}" (Level ${levelId}) section of their feasibility study.

Student data:
${dataStr}

Return exactly this JSON object (nothing else):
{
  "score": <number 0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "risks": ["risk or weakness 1", "risk or weakness 2", "risk or weakness 3"],
  "suggestions": ["improvement suggestion 1", "improvement suggestion 2"]
}`;
}

function buildFinancialProjectionPrompt(
  formData: Record<string, any>,
  language: 'ar' | 'en',
): string {
  const dataStr = JSON.stringify(formData, null, 2);
  if (language === 'ar') {
    return `بناءً على البيانات المالية التالية لمشروع الطالب، أنشئ جدول توقعات مالية لمدة 3 سنوات.

البيانات المالية:
${dataStr}

أرجع كائن JSON بهذا الشكل بالضبط:
{
  "financialProjection": [
    { "year": "السنة 1", "revenue": "<مبلغ>", "expenses": "<مبلغ>", "netProfit": "<مبلغ>", "cumulativeCashFlow": "<مبلغ>" },
    { "year": "السنة 2", "revenue": "<مبلغ>", "expenses": "<مبلغ>", "netProfit": "<مبلغ>", "cumulativeCashFlow": "<مبلغ>" },
    { "year": "السنة 3", "revenue": "<مبلغ>", "expenses": "<مبلغ>", "netProfit": "<مبلغ>", "cumulativeCashFlow": "<مبلغ>" }
  ]
}`;
  }
  return `Based on the following financial data for a student's project, generate a 3-year financial projection table.

Financial data:
${dataStr}

Return exactly this JSON object:
{
  "financialProjection": [
    { "year": "Year 1", "revenue": "<amount>", "expenses": "<amount>", "netProfit": "<amount>", "cumulativeCashFlow": "<amount>" },
    { "year": "Year 2", "revenue": "<amount>", "expenses": "<amount>", "netProfit": "<amount>", "cumulativeCashFlow": "<amount>" },
    { "year": "Year 3", "revenue": "<amount>", "expenses": "<amount>", "netProfit": "<amount>", "cumulativeCashFlow": "<amount>" }
  ]
}`;
}

export async function getLevelAiFeedback(
  levelId: number,
  formData: Record<string, any>,
  language: 'ar' | 'en' = 'ar',
): Promise<AiFeedback> {
  const levelName = LEVEL_NAMES[levelId]?.[language] ?? `Level ${levelId}`;
  const systemPrompt = buildSystemPrompt(language);
  const prompt = buildFeedbackPrompt(levelId, levelName, formData, language);

  const raw = await callClaude(prompt, systemPrompt, 1024);

  let feedback: AiFeedback;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    feedback = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    // Fallback if JSON parse fails
    feedback = {
      score: 70,
      strengths: [language === 'ar' ? 'تم تقديم البيانات' : 'Data was provided'],
      risks: [language === 'ar' ? 'يرجى مراجعة الإجابات' : 'Please review your answers'],
      suggestions: [language === 'ar' ? 'أضف المزيد من التفاصيل' : 'Add more details'],
    };
  }

  // For Level 6, also fetch a financial projection
  if (levelId === 6) {
    try {
      const projPrompt = buildFinancialProjectionPrompt(formData, language);
      const projRaw = await callClaude(projPrompt, systemPrompt, 800);
      const projMatch = projRaw.match(/\{[\s\S]*\}/);
      const projData = JSON.parse(projMatch ? projMatch[0] : projRaw);
      feedback.financialProjection = projData.financialProjection;
    } catch {
      // Financial projection is optional
    }
  }

  return feedback;
}

// ─── Final feasibility study report ──────────────────────────────────────────

export async function generateFeasibilityReport(
  allModuleData: Record<string, any>,
  language: 'ar' | 'en' = 'ar',
): Promise<string> {
  const systemPrompt = language === 'ar'
    ? `أنت خبير في كتابة دراسات الجدوى الاحترافية للمشاريع الصغيرة والمتوسطة في سلطنة عُمان.
اكتب دراسة الجدوى بشكل منظم وواضح ومحترف باللغة العربية فقط.`
    : `You are an expert in writing professional feasibility studies for SMEs in Oman.
Write a clear, structured, and professional feasibility study in English.`;

  const dataStr = JSON.stringify(allModuleData, null, 2);
  const prompt = language === 'ar'
    ? `بناءً على البيانات التالية، اكتب دراسة جدوى كاملة ومحترفة تشمل:
1. ملخص تنفيذي
2. وصف المشروع
3. تحليل السوق
4. المتطلبات القانونية والتشغيلية
5. الخطة المالية
6. هيكل الملكية والإدارة
7. تقييم المخاطر
8. الخلاصة والتوصيات

البيانات:
${dataStr}`
    : `Based on the following data, write a complete professional feasibility study including:
1. Executive Summary
2. Project Description
3. Market Analysis
4. Legal & Operational Requirements
5. Financial Plan
6. Ownership & Management Structure
7. Risk Assessment
8. Conclusion & Recommendations

Data:
${dataStr}`;

  return callClaude(prompt, systemPrompt, 3000);
}
