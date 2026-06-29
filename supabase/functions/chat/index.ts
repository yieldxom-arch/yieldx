import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// ─────────────────────────────────────────────────────────────────────────────
// Supabase Edge Function: YieldX Chat / Claude AI Assistant
// ────────────────────────────────────────────────────────────────────────────
// This function:
// 1. Validates user authentication via Supabase JWT
// 2. Checks user's subscription tier (free users are rejected)
// 3. Calls Anthropic's Claude API with the user's message
// 4. Returns the assistant's response
// 5. DOES NOT expose the Anthropic API key to the browser
//
// Deploy: supabase functions deploy chat
// Set secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// ─────────────────────────────────────────────────────────────────────────────

interface ChatRequestBody {
  userMessage: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  language: "en" | "ar";
  userName?: string;
  userRole?: "student" | "teacher" | "organization";
}

interface ChatResponseBody {
  text: string;
}

interface ErrorResponseBody {
  error: string;
}

const app = new Hono();

// ─── CORS Configuration ───────────────────────────────────────────────────
// Match the pattern from existing server functions
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

// ─── Health Check ─────────────────────────────────────────────────────────
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// ─── Helper: Generate System Prompt ───────────────────────────────────────
function systemPromptBase({
  userName,
  userRole,
  language,
}: {
  userName?: string;
  userRole?: string;
  language: "en" | "ar";
}): string {
  const personalizedGreeting = userName
    ? `Use the user's name occasionally: ${userName}.`
    : "Use the user name occasionally when possible.";
  const roleGuidance =
    userRole === "teacher"
      ? "Tailor advice for teachers: focus on teaching tips, class support, and helping students learn business planning clearly."
      : userRole === "organization"
        ? "Tailor advice for organization admins: focus on admin controls, scaling, and school or company adoption of YieldX."
        : "Tailor advice for students: focus on learning guidance, simple explanations, and encouragement.";

  return `You are the YieldX AI Assistant, a helpful guide for students learning business planning on the YieldX platform.

YieldX is a bilingual (Arabic/English) Omani educational platform that teaches business planning through a structured 8-level curriculum (Levels 0–7):
Level 0: Project Type Selection (Agricultural, Industrial, Commercial, Service sectors)
Level 1: Identity & Ownership
Level 2: Legal Framework
Level 3: Physical Resources
Level 4: Human Resources
Level 5: Market Strategy
Level 6: Financing & KPIs
Level 7: Business Model Canvas & Oman Vision 2040 alignment

You speak to students (mostly), teachers, and organization admins. Most users are beginners — explain things simply and avoid jargon.

Do:
- Answer questions about YieldX features and how to use the platform.
- Explain business and startup concepts at a beginner level.
- Provide context-aware guidance about Oman and Gulf region business environment when relevant (Commercial Registration, Invest Oman, MOCIIP, Oman Vision 2040, common sectors, typical costs in OMR).
- Recommend which level/module the student should focus on based on their question.
- Be encouraging and supportive — these are students, many feeling lost.

Do not:
- Give specific legal, financial, or tax advice — always say "verify with a licensed advisor or official source." 
- Make up specific numbers (fees, exact regulations, prices). If unsure, say so and suggest the user check Invest Oman or MOCIIP directly.
- Pretend to know real-time information (current exchange rates, today's news, etc.).

Language behavior: Respond in the same language the user wrote in. If the user wrote in Arabic, respond in Gulf-friendly Modern Standard Arabic. If English, respond in clear simple English. If they mix, match the dominant language.
Tone: Warm, encouraging, concise. Default to short answers (2–4 sentences) unless the user asks for detail. Use examples relevant to Oman (a coffee shop in Muscat, a date farm in Nizwa, a tech startup in Knowledge Oasis).
Personalization: ${personalizedGreeting} ${roleGuidance}

When you cannot answer or are unsure, be honest and suggest the user verify with official sources.`;
}

// ─── Helper: Extract text from Anthropic message ───────────────────────────
function extractTextFromMessage(message: any): string {
  if (!message || !message.content) return "";
  const contentBlocks = Array.isArray(message.content)
    ? message.content
    : [message.content];
  return contentBlocks
    .map((block: any) => {
      if (!block) return "";
      if (typeof block === "string") return block;
      if (typeof block.text === "string") return block.text;
      if (typeof block.content === "string") return block.content;
      return "";
    })
    .join("")
    .trim();
}

// ─── Helper: Verify JWT and get user ─────────────────────────────────────
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
    // Create admin client to verify JWT
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify the token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error("Auth verification failed:", error?.message);
      return null;
    }

    return {
      userId: user.id,
      email: user.email || "",
    };
  } catch (err: any) {
    console.error("Token verification error:", err.message);
    return null;
  }
}

// ─── Helper: Check subscription tier ──────────────────────────────────────
async function checkUserSubscription(userId: string): Promise<string | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase env vars");
    return null;
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Query users table for subscription_tier
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

// ─── POST /chat – Main endpoint ────────────────────────────────────────────
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
            "AI Assistant is only available on Pro and Organization plans. Please upgrade to use this feature.",
        } as ErrorResponseBody,
        { status: 403 }
      );
    }

    // ─ Step 3: Parse request body ─
    const body = (await c.req.json()) as ChatRequestBody;
    const { userMessage, history, language, userName, userRole } = body;

    if (!userMessage || !Array.isArray(history)) {
      return c.json(
        { error: "Invalid request body" } as ErrorResponseBody,
        { status: 400 }
      );
    }

    // ─ Step 4: Get Anthropic API key ─
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      console.error("ANTHROPIC_API_KEY not set in edge function secrets");
      return c.json(
        {
          error:
            "Sorry, the AI Assistant is temporarily unavailable. Please try again later.",
        } as ErrorResponseBody,
        { status: 500 }
      );
    }

    // ─ Step 5: Build messages for Claude ─
    const messages = history.map((item) => ({
      role: item.role,
      content: item.content,
    }));
    messages.push({ role: "user", content: userMessage });

    // ─ Step 6: Call Anthropic API ─
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    let response: Response;
    try {
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: systemPromptBase({
            userName,
            userRole,
            language,
          }),
          messages,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        return c.json(
          {
            error:
              language === "ar"
                ? "استغرق المساعد الذكي وقتاً طويلاً للرد. حاول مرة أخرى."
                : "AI assistant took too long to respond. Please try again.",
          } as ErrorResponseBody,
          { status: 504 }
        );
      }
      throw err;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Anthropic API error:",
        response.status,
        response.statusText,
        errorText
      );

      if (response.status === 429) {
        return c.json(
          {
            error:
              "Too many requests. Please slow down and try again in a moment.",
          } as ErrorResponseBody,
          { status: 429 }
        );
      }

      return c.json(
        {
          error:
            language === "ar"
              ? "عذراً، لم أتمكن من الوصول إلى المساعد الذكي الآن. حاول مرة أخرى لاحقاً."
              : "Sorry, I could not reach the AI assistant right now. Please try again later.",
        } as ErrorResponseBody,
        { status: 500 }
      );
    }

    const data = await response.json();
    const text = extractTextFromMessage(data);

    if (!text) {
      const fallback =
        language === "ar"
          ? "تلقيت استجابة فارغة من المساعد. حاول إعادة إرسال سؤالك مرة أخرى."
          : "The assistant returned an empty response. Please try sending your question again.";
      return c.json({ text: fallback } as ChatResponseBody, { status: 200 });
    }

    return c.json({ text } as ChatResponseBody, { status: 200 });
  } catch (err: any) {
    console.error("Chat endpoint error:", err.message);
    return c.json(
      {
        error:
          "An unexpected error occurred. Please try again later.",
      } as ErrorResponseBody,
      { status: 500 }
    );
  }
});

export default app.fetch;
