import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// Edge Function: reject-upgrade
// Admin-only. Marks an upgrade_request as rejected with an optional reason.
// Deploy: supabase functions deploy reject-upgrade
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (set automatically by Supabase)

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "OPTIONS"],
    maxAge: 600,
  })
);

app.post("/", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Missing Authorization header" }, 401);
  }
  const jwt = authHeader.slice(7);

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Verify calling user is authenticated and is an admin
  const { data: { user: caller }, error: authErr } = await adminClient.auth.getUser(jwt);
  if (authErr || !caller) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { data: callerProfile, error: profileErr } = await adminClient
    .from("users")
    .select("role")
    .eq("id", caller.id)
    .single();

  if (profileErr || callerProfile?.role !== "admin") {
    return c.json({ error: "Forbidden: admin only" }, 403);
  }

  // Parse body
  let body: { request_id: string; admin_note?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { request_id, admin_note } = body;
  if (!request_id) {
    return c.json({ error: "request_id is required" }, 400);
  }

  // Fetch the request
  const { data: req, error: fetchErr } = await adminClient
    .from("upgrade_requests")
    .select("id, status")
    .eq("id", request_id)
    .single();

  if (fetchErr || !req) {
    return c.json({ error: "Request not found" }, 404);
  }
  if (req.status !== "pending") {
    return c.json({ error: `Request is already ${req.status}` }, 409);
  }

  // Mark request rejected
  const { error: updateErr } = await adminClient
    .from("upgrade_requests")
    .update({
      status: "rejected",
      admin_note: admin_note ?? null,
      reviewed_by: caller.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", request_id);

  if (updateErr) {
    return c.json({ error: "Failed to update request status", detail: updateErr.message }, 500);
  }

  return c.json({ success: true, request_id });
});

Deno.serve(app.fetch);
