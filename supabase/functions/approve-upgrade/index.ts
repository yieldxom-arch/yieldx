import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// Edge Function: approve-upgrade
// Admin-only. Marks an upgrade_request as approved and upgrades the user's tier.
// Deploy: supabase functions deploy approve-upgrade
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

  // Service-role client bypasses RLS for writes
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
    .select("id, user_id, requested_plan, status")
    .eq("id", request_id)
    .single();

  if (fetchErr || !req) {
    return c.json({ error: "Request not found" }, 404);
  }
  if (req.status !== "pending") {
    return c.json({ error: `Request is already ${req.status}` }, 409);
  }

  // Update subscription tier on the user
  const { error: tierErr } = await adminClient
    .from("users")
    .update({ subscription_tier: req.requested_plan })
    .eq("id", req.user_id);

  if (tierErr) {
    return c.json({ error: "Failed to update user tier", detail: tierErr.message }, 500);
  }

  // Mark request approved
  const { error: updateErr } = await adminClient
    .from("upgrade_requests")
    .update({
      status: "approved",
      admin_note: admin_note ?? null,
      reviewed_by: caller.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", request_id);

  if (updateErr) {
    return c.json({ error: "Failed to update request status", detail: updateErr.message }, 500);
  }

  return c.json({ success: true, request_id, new_tier: req.requested_plan });
});

Deno.serve(app.fetch);
