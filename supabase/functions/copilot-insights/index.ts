import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// ─────────────────────────────────────────────────────────────────────────────
// Supabase Edge Function: YieldX Copilot Insights / Gemini AI
// ─────────────────────────────────────────────────────────────────────────────
// This function:
// 1. Validates user authentication via Supabase JWT
// 2. Checks user's subscription tier (free users are rejected)
// 3. Builds a persona-specific prompt for Atlas (CFO), Nova (CMO), or Orion (CEO)
// 4. Calls Google Gemini REST API server-side — key never reaches the browser
// 5. Returns structured bilingual (EN/AR) insight messages
//
// Deploy: supabase functions deploy copilot-insights
// Set secret: supabase secrets set GEMINI_API_KEY=AIza...
// ─────────────────────────────────────────────────────────────────────────────

// ─── Oman Business Context (inlined from src/app/data/oman-business-knowledge.ts) ───
const OMAN_BUSINESS_CONTEXT = `Oman business context for AI Copilot analysis:

1. Registration and Licensing
- The Ministry of Commerce, Industry and Investment Promotion (MOCI) governs company registration and licensing.
- Common Oman commercial license types include:
  * Sole proprietorship (for individuals)
  * Limited liability company (LLC) for small and medium enterprises
  * Branch of foreign company (for international investment)
- Typical MOCI registration and licensing costs range from approximately 150 OMR to 500 OMR for basic registration fees, plus additional fees for special approvals, partner documents, and notarization.
- Companies often need an Oman Chamber of Commerce membership certificate. Fees start around 90 OMR.

2. Sector-Specific Startup and Operating Costs
- Agricultural projects: initial greenhouse/farm setup and irrigation can start around 5,000-20,000 OMR depending on scale. Access to water permits and land lease terms are critical.
- Industrial projects: machinery, utilities, and factory fit-out can range from 15,000 OMR for small workshops to 100,000+ OMR for medium manufacturing units.
- Commercial ventures: retail storefronts, trade offices, and logistics operations often begin at 8,000-30,000 OMR, depending on location and inventory requirements.
- Service businesses: digital agencies, consulting firms, and education/training centers often launch with 3,000-15,000 OMR in initial costs, especially if operations are largely remote or office-based.

3. Permits and Approvals
- Basic commercial license is required for all projects; specialized activities require additional approvals from bodies such as:
  * Ministry of Agriculture, Fisheries and Water Resources for agricultural businesses.
  * Public Authority for Special Economic Zones and Free Zones (OPAZ) for free zone activities.
  * Ministry of Heritage and Tourism for hospitality and tourism-related services.
  * Ministry of Health for medical or health-related services.
- Industrial projects usually need environmental clearance and utility approvals.
- Commercial/retail projects may require municipality permits and fire safety approvals.

4. Rent and Location Guidance
- Muscat rent ranges:
  * Small commercial offices: 250-600 OMR per month.
  * Retail shops: 400-1,200 OMR per month depending on footfall and mall location.
- Salalah rent ranges:
  * Small retail or office spaces: 150-450 OMR per month.
  * Light industrial units: 200-800 OMR per month.
- Sohar rent ranges:
  * Industrial warehouses and light factories: 300-900 OMR per month.
  * Commercial office spaces: 180-500 OMR per month.
- Free zones such as Sohar Free Zone, Salalah Free Zone, and Duqm Special Economic Zone offer lower customs duties, streamlined import/export processes, and special lease incentives.

5. Salaries and Payroll
- Average monthly salaries in Oman by role category:
  * Entry-level administrative or service staff: 250-400 OMR.
  * Skilled technicians, sales, or marketing roles: 400-650 OMR.
  * Mid-level managers and specialists: 650-1,200 OMR.
  * Senior managers and specialists: 1,200+ OMR.
- Omani companies are expected to maintain reasonable salaries consistent with sector norms and to account for social insurance and benefits.

6. VAT and Tax Rules
- Oman applies a standard 5% Value Added Tax (VAT) on most goods and services.
- Small businesses should include VAT in pricing and accounting projections if revenue is expected to exceed registration thresholds.
- Export-oriented companies and free zone operations may have special customs and VAT rules; the AI should mention this when relevant.

7. Free Zones and Investment Incentives
- Sohar Free Zone: strong logistics, manufacturing, and metal-processing ecosystem.
- Salalah Free Zone: gateway to southern Oman, suitable for trading, warehousing, and export-driven services.
- Duqm Special Economic Zone: attractive for large industrial, logistics, and tourism infrastructure projects.
- Free zone incentives often include reduced customs duties, simplified registration, and flexible foreign ownership rules.

8. Oman Vision 2040 Priority Sectors
- Oman Vision 2040 prioritizes diversification into sectors such as:
  * Renewable energy and green technologies
  * Logistics and transport
  * Manufacturing and industrial exports
  * Tourism and hospitality
  * Education, technology, and digital services
  * Food security and agricultural modernization
- Copilot insights should connect strong proposals to Vision 2040 themes when possible.

Disclaimer: All figures are approximate and should be treated as guidance, not exact quotes. Mention that actual costs and permits may vary by location, project scale, and regulator updates.`;

// ─── Persona Definitions ─────────────────────────────────────────────────────
const personalityPromptData: Record<string, {
  title: string;
  tone: string;
  introEn: string;
  introAr: string;
  focusEn: string;
  focusAr: string;
}> = {
  CFO: {
    title: "Atlas",
    tone: "analytical and data-driven",
    introEn:
      "You are Atlas, the CFO copilot. You analyze numbers, cash flow, legal risks, and financing strategy with precision.",
    introAr:
      "أنت أطلس، الطيار الآلي المالي. تحلل الأرقام والتدفقات النقدية والمخاطر القانونية واستراتيجية التمويل بدقة.",
    focusEn:
      "Focus on financial health, burn rate, runway, financing mix, legal and licensing costs, and Oman-specific financial context.",
    focusAr:
      "ركز على الصحة المالية، معدل الحرق، فترة التشغيل، مزيج التمويل، تكاليف الترخيص والقضايا المالية الخاصة بعُمان.",
  },
  CMO: {
    title: "Nova",
    tone: "creative and bold",
    introEn:
      "You are Nova, the CMO copilot. You scout positioning, market demand, customer segments, competition, and growth opportunities.",
    introAr:
      "أنت نوفا، الطيار الآلي التسويقي. تستكشف الموضع والسوق، وشرائح العملاء، والمنافسة، وفرص النمو.",
    focusEn:
      "Focus on market strategy, target segments, competitor gaps, acquisition channels, and Oman-specific positioning.",
    focusAr:
      "ركز على استراتيجية السوق، الشرائح المستهدفة، الفجوات لدى المنافسين، قنوات الاستحواذ، والموقع الخاص بعُمان.",
  },
  CEO: {
    title: "Orion",
    tone: "strategic and visionary",
    introEn:
      "You are Orion, the CEO copilot. You evaluate overall strategy, growth direction, risk, and alignment with Vision 2040.",
    introAr:
      "أنت أوريون، الطيار الآلي التنفيذي. تقيم الاستراتيجية العامة، واتجاه النمو، والمخاطر، والتوافق مع رؤية 2040.",
    focusEn:
      "Focus on strategic alignment across all levels, risk trade-offs, strengths, and Oman Vision 2040 relevance.",
    focusAr:
      "ركز على التوافق الاستراتيجي عبر جميع المستويات، المقايضات المتعلقة بالمخاطر، نقاط القوة، وملاءمة رؤية 2040.",
  },
};

// ─── Interfaces ──────────────────────────────────────────────────────────────
interface CopilotRequestBody {
  role: "CFO" | "CMO" | "CEO";
  projectData: object;
  language: "en" | "ar";
}

interface CopilotInsightMessage {
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  type: string;
  priority: string;
}

interface CopilotResponseBody {
  messages: CopilotInsightMessage[];
}

interface ErrorResponseBody {
  error: string;
}

const app = new Hono();

// ─── CORS Configuration ───────────────────────────────────────────────────
// Match the pattern from chat/index.ts (which works correctly)
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

app.use("*", logger(console.log));


// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (c: any) => {
  return c.json({ status: "ok" });
});


// ─── Helper: Build Gemini prompt ──────────────────────────────────────────────
function buildPrompt(
  role: "CFO" | "CMO" | "CEO",
  projectData: object,
  language: "en" | "ar"
): string {
  const persona = personalityPromptData[role];
  const projectJson = JSON.stringify(projectData, null, 2);

  return `${persona.introEn}
${persona.introAr}

Personality and tone:
- Tone: ${persona.tone}
- Role: ${role}
- Keep the response in character.
- Return bilingual content in English and Arabic.

Oman business context:
${OMAN_BUSINESS_CONTEXT}

Project data:
${projectJson}

Instructions:
1. Produce between 1 and 3 messages.
2. Return valid JSON only, with no markdown fences.
3. The output must be an array of objects matching this shape:
   [{"title": "...", "titleAr": "...", "content": "...", "contentAr": "...", "type": "...", "priority": "..."}]
4. type must be one of 'analysis', 'suggestion', 'warning', 'insight', 'question', or 'celebration'.
5. priority must be one of 'low', 'medium', 'high', or 'critical'.
6. Use Oman-specific figures when appropriate, including approximate OMR values, permits, free zones, rent ranges, or Vision 2040 priorities.
7. If project data is missing or incomplete, return a single friendly message telling the user what level to complete next.

Return JSON array only.`;
}

// ─── Helper: Verify JWT ───────────────────────────────────────────────────────
async function verifyAuthToken(
  authHeader: string | null
): Promise<{ userId: string; email: string } | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase env vars");
    return null;
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error("Auth verification failed:", error?.message);
      return null;
    }

    return { userId: user.id, email: user.email || "" };
  } catch (err: any) {
    console.error("Token verification error:", err.message);
    return null;
  }
}

// ─── Helper: Check subscription tier ─────────────────────────────────────────
async function checkUserSubscription(userId: string): Promise<string | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase env vars");
    return null;
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase
      .from("users")
      .select("subscription_tier")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Subscription lookup error:", error.message);
      return null;
    }

    return data?.subscription_tier || "free";
  } catch (err: any) {
    console.error("Subscription check error:", err.message);
    return null;
  }
}

// ─── POST / – Main endpoint ───────────────────────────────────────────────────
app.post("/", async (c) => {
  try {
    // ─ Step 1: Validate authentication ─
    const authHeader = c.req.header("Authorization");
    const user = await verifyAuthToken(authHeader);

    if (!user) {
      return c.json(
        { error: "Unauthorized. Please log in." } as ErrorResponseBody,
        { status: 401 }
      );
    }

    // ─ Step 2: Check subscription tier ─
    const subscriptionTier = await checkUserSubscription(user.userId);
    const ALLOWED_TIERS = ["premium", "enterprise"];

    if (!subscriptionTier || !ALLOWED_TIERS.includes(subscriptionTier)) {
      return c.json(
        {
          error:
            "AI Copilot is only available on Pro and Organization plans. Please upgrade to use this feature.",
        } as ErrorResponseBody,
        { status: 403 }
      );
    }

    // ─ Step 3: Parse and validate request body ─
    const body = (await c.req.json()) as CopilotRequestBody;
    const { role, projectData, language } = body;

    if (!role || !["CFO", "CMO", "CEO"].includes(role)) {
      return c.json(
        { error: "Invalid role. Must be CFO, CMO, or CEO." } as ErrorResponseBody,
        { status: 400 }
      );
    }

    if (!projectData || typeof projectData !== "object") {
      return c.json(
        { error: "Invalid request body: projectData is required." } as ErrorResponseBody,
        { status: 400 }
      );
    }

    // ─ Step 4: Get Gemini API key ─
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      console.error("GEMINI_API_KEY not set in edge function secrets");
      return c.json(
        {
          error:
            "Sorry, the AI Copilot is temporarily unavailable. Please try again later.",
        } as ErrorResponseBody,
        { status: 500 }
      );
    }

    // ─ Step 5: Build prompt and call Gemini REST API ─
    const prompt = buildPrompt(role, projectData, language || "en");

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error(
        "Gemini API error:",
        geminiResponse.status,
        geminiResponse.statusText,
        errorText
      );

      if (geminiResponse.status === 429) {
        return c.json(
          { error: "Too many requests. Please slow down and try again in a moment." } as ErrorResponseBody,
          { status: 429 }
        );
      }

      return c.json(
        { error: "Sorry, the AI Copilot could not be reached right now. Please try again later." } as ErrorResponseBody,
        { status: 500 }
      );
    }

    // ─ Step 6: Extract and return messages ─
    const geminiData = await geminiResponse.json();
    const rawText: string =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    let messages: CopilotInsightMessage[] = [];
    try {
      const parsed = JSON.parse(rawText.trim());
      messages = Array.isArray(parsed) ? parsed.slice(0, 3) : [];
    } catch (parseErr) {
      console.error("Gemini response parse error:", parseErr, rawText);
      messages = [];
    }

    return c.json({ messages } as CopilotResponseBody, { status: 200 });
  } catch (err: any) {
    console.error("Copilot insights endpoint error:", err.message);
    return c.json(
      { error: "An unexpected error occurred. Please try again later." } as ErrorResponseBody,
      { status: 500 }
    );
  }
});

export default app.fetch;
