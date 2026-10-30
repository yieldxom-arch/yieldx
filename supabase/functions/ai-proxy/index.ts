import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// ─────────────────────────────────────────────────────────────────────────────
// Supabase Edge Function: ai-proxy
// ─────────────────────────────────────────────────────────────────────────────
// Server-side gateway for every Claude call made by the web app.
// 1. Only signed-in YieldX users can call it (Supabase JWT verified).
// 2. The Anthropic API key lives only here, as an edge-function secret.
// 3. Prompt size and output length are capped to limit abuse and cost.
//
// Deploy:  supabase functions deploy ai-proxy
// Secrets: supabase secrets set ANTHROPIC_API_KEY=<key>
//          supabase secrets set ANTHROPIC_MODEL=<model id>   (optional)
// ─────────────────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-6";
const MAX_INPUT_CHARS = 60_000;
const MAX_OUTPUT_TOKENS = 3000;

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

  const prompt = typeof body?.prompt === "string" ? body.prompt : "";
  const system = typeof body?.system === "string" ? body.system : "";
  if (!prompt || prompt.length + system.length > MAX_INPUT_CHARS) {
    return json({ error: "Prompt missing or too long" }, 400);
  }
  const maxTokens = Math.min(MAX_OUTPUT_TOKENS, Math.max(64, Number(body?.maxTokens) || 1024));

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set");
    return json({ error: "The AI service is temporarily unavailable." }, 500);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      console.error("Anthropic API error", res.status, await res.text().catch(() => ""));
      return json(
        { error: res.status === 429 ? "Too many requests. Please try again shortly." : "The AI service could not be reached." },
        res.status === 429 ? 429 : 502,
      );
    }

    const data = await res.json();
    const text = Array.isArray(data?.content)
      ? data.content.filter((b: any) => b?.type === "text").map((b: any) => b.text).join("")
      : "";
    return json({ text });
  } catch (err) {
    console.error("ai-proxy error", (err as Error)?.message);
    return json({ error: "The AI service could not be reached." }, 502);
  } finally {
    clearTimeout(timeout);
  }
});
