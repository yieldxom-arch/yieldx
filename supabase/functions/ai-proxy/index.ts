import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// ─────────────────────────────────────────────────────────────────────────────
// Supabase Edge Function: ai-proxy
// ─────────────────────────────────────────────────────────────────────────────
// Server-side gateway for every AI call made by the web app: level feedback,
// the final report, and the YieldX Advisor (review + chat).
// 1. Only signed-in YieldX users can call it (Supabase JWT verified).
// 2. API keys live only here, as edge-function secrets.
// 3. Prompt size and output length are capped to limit abuse and cost.
// 4. Claude is the main model. If Claude fails (no key, outage, rate limit,
//    timeout) and a Gemini key is set, the same request goes to Gemini.
//
// Body: { system?, maxTokens?, prompt }            single question
//    or { system?, maxTokens?, messages: [{role, content}] }   conversation
// Reply: { text, provider: "claude" | "gemini" }  or  { error }
//
// Deploy:  supabase functions deploy ai-proxy --no-verify-jwt
// Secrets: supabase secrets set ANTHROPIC_API_KEY=<key>      main
//          supabase secrets set GEMINI_API_KEY=<key>         backup (optional)
//          supabase secrets set ANTHROPIC_MODEL=<model id>   (optional)
//          supabase secrets set GEMINI_MODEL=<model id>      (optional)
// ─────────────────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-6";
// Tried in order: the stronger model first, then the lighter one, which has
// the larger free-tier quota. A retired or quota-less model is skipped.
const GEMINI_MODELS = Deno.env.get("GEMINI_MODEL")
  ? [Deno.env.get("GEMINI_MODEL") as string]
  : ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
const MAX_INPUT_CHARS = 60_000;
const MAX_OUTPUT_TOKENS = 3000;
// Edge functions stop at 150 s, so both attempts together must fit inside it.
const CLAUDE_TIMEOUT_MS = 50_000;
const GEMINI_TIMEOUT_MS = 45_000;

type Turn = { role: "user" | "assistant"; content: string };
type Result = { ok: true; text: string } | { ok: false; status: number; reason: string };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

async function getUserId(authHeader: string | null): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return null;
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase.auth.getUser(authHeader.slice(7));
    if (error || !data.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

async function postJson(url: string, headers: Record<string, string>, body: unknown, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
  } finally {
    clearTimeout(timer);
  }
}

async function callClaude(apiKey: string, system: string, messages: Turn[], maxTokens: number): Promise<Result> {
  try {
    const res = await postJson(
      "https://api.anthropic.com/v1/messages",
      { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      { model: ANTHROPIC_MODEL, max_tokens: maxTokens, system, messages },
      CLAUDE_TIMEOUT_MS,
    );
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, status: res.status, reason: `claude ${res.status} ${detail.slice(0, 300)}` };
    }
    const data = await res.json();
    const text = Array.isArray(data?.content)
      ? data.content.filter((b: any) => b?.type === "text").map((b: any) => b.text).join("")
      : "";
    if (!text.trim()) return { ok: false, status: 502, reason: "claude returned no text" };
    return { ok: true, text };
  } catch (err) {
    return { ok: false, status: 504, reason: `claude ${(err as Error)?.name}: ${(err as Error)?.message}` };
  }
}

async function callGemini(apiKey: string, system: string, messages: Turn[], maxTokens: number): Promise<Result> {
  const body: Record<string, unknown> = {
    contents: messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    // Gemini 3 models think before answering and that counts toward the
    // output limit, so leave room on top of what the app asked for.
    generationConfig: { maxOutputTokens: Math.min(8192, maxTokens + 2048) },
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };

  let last: Result = { ok: false, status: 502, reason: "gemini not tried" };
  for (const model of GEMINI_MODELS) {
    try {
      const res = await postJson(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        { "x-goog-api-key": apiKey },
        body,
        GEMINI_TIMEOUT_MS,
      );
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        last = { ok: false, status: res.status, reason: `gemini ${model} ${res.status} ${detail.slice(0, 300)}` };
        // Retired model, no quota for this model on the key's plan, or a busy
        // model: each model has its own quota, so try the next one.
        if ([403, 404, 429, 500, 503].includes(res.status)) continue;
        return last;
      }
      const data = await res.json();
      const parts = data?.candidates?.[0]?.content?.parts;
      const text = Array.isArray(parts)
        ? parts.filter((p: any) => typeof p?.text === "string" && !p?.thought).map((p: any) => p.text).join("")
        : "";
      if (!text.trim()) {
        const why = data?.candidates?.[0]?.finishReason ?? data?.promptFeedback?.blockReason ?? "empty";
        last = { ok: false, status: 502, reason: `gemini ${model} returned no text (${why})` };
        continue;
      }
      return { ok: true, text };
    } catch (err) {
      return { ok: false, status: 504, reason: `gemini ${model} ${(err as Error)?.name}: ${(err as Error)?.message}` };
    }
  }
  return last;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const userId = await getUserId(req.headers.get("Authorization"));
  if (!userId) return json({ error: "Unauthorized. Please log in." }, 401);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const system = typeof body?.system === "string" ? body.system : "";
  let messages: Turn[] = [];
  if (Array.isArray(body?.messages)) {
    messages = body.messages
      .filter((m: any) => (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string" && m.content.trim())
      .slice(-12)
      .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));
    while (messages.length && messages[0].role !== "user") messages.shift();
    // merge consecutive turns from the same side
    messages = messages.reduce((acc, m) => {
      const last = acc[acc.length - 1];
      if (last && last.role === m.role) last.content += "\n\n" + m.content;
      else acc.push({ ...m });
      return acc;
    }, [] as Turn[]);
    if (!messages.length || messages[messages.length - 1].role !== "user") {
      return json({ error: "The conversation must end with a user message" }, 400);
    }
  } else if (typeof body?.prompt === "string" && body.prompt) {
    messages = [{ role: "user", content: body.prompt }];
  }
  const inputChars = system.length + messages.reduce((n, m) => n + m.content.length, 0);
  if (!messages.length || inputChars > MAX_INPUT_CHARS) {
    return json({ error: "Prompt missing or too long" }, 400);
  }
  const maxTokens = Math.min(MAX_OUTPUT_TOKENS, Math.max(64, Number(body?.maxTokens) || 1024));

  const claudeKey = Deno.env.get("ANTHROPIC_API_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (!claudeKey && !geminiKey) {
    console.error("Neither ANTHROPIC_API_KEY nor GEMINI_API_KEY is set");
    return json({ error: "The AI service is temporarily unavailable." }, 500);
  }

  let failure: Result | null = null;

  if (claudeKey) {
    const r = await callClaude(claudeKey, system, messages, maxTokens);
    if (r.ok) return json({ text: r.text, provider: "claude" });
    failure = r;
    console.error("Claude failed:", r.reason);
  } else {
    console.warn("ANTHROPIC_API_KEY is not set, using Gemini");
  }

  if (geminiKey) {
    const r = await callGemini(geminiKey, system, messages, maxTokens);
    if (r.ok) {
      if (failure) console.warn("Answered by Gemini backup");
      return json({ text: r.text, provider: "gemini" });
    }
    console.error("Gemini failed:", r.reason);
    failure = r;
  }

  const status = failure && !failure.ok ? failure.status : 502;
  return json(
    { error: status === 429 ? "Too many requests. Please try again shortly." : "The AI service could not be reached." },
    status === 429 ? 429 : 502,
  );
});
