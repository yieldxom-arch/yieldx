import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// ─── Auto-Migration: Fix Organization Role Constraint ─────────────────────────
// NOTE: This migration runs automatically on server startup
(async () => {
  try {
    const dbUrl = Deno.env.get("SUPABASE_DB_URL");
    if (!dbUrl) {
      console.log("⚠️ Migration skipped: SUPABASE_DB_URL not configured");
      return;
    }
    
    console.log("🔧 Running auto-migration: Updating profiles role constraint...");
    
    // Use postgres client to execute raw SQL
    const { Client } = await import("https://deno.land/x/postgres@v0.17.0/mod.ts");
    const client = new Client(dbUrl);
    await client.connect();
    
    try {
      // Check if constraint already includes 'organization'
      const checkResult = await client.queryObject(`
        SELECT pg_get_constraintdef(oid) as definition
        FROM pg_constraint
        WHERE conname = 'profiles_role_check'
        AND conrelid = 'profiles'::regclass;
      `);
      
      const currentDef = checkResult.rows[0]?.definition as string;
      
      if (currentDef && currentDef.includes("'organization'")) {
        console.log("✅ Constraint already includes 'organization' - skipping migration");
        await client.end();
        return;
      }
      
      // Update constraint using transaction
      await client.queryArray(`BEGIN;`);
      
      await client.queryArray(`
        ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
      `);
      
      await client.queryArray(`
        ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('student', 'lecturer', 'admin', 'organization'));
      `);
      
      await client.queryArray(`COMMIT;`);
      
      console.log("✅ Migration completed: organization role constraint updated");
    } catch (sqlErr: any) {
      console.log("⚠️ Migration SQL error:", sqlErr.message);
      try {
        await client.queryArray(`ROLLBACK;`);
      } catch (rollbackErr) {
        // Ignore rollback errors
      }
    } finally {
      await client.end();
    }
  } catch (err: any) {
    console.log("⚠️ Migration error (constraint may already exist):", err.message);
  }
})();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-a05faef1/health", (c) => {
  return c.json({ status: "ok" });
});

// Manual migration endpoint - call this to update the role constraint
app.post("/make-server-a05faef1/run-migration", async (c) => {
  try {
    const dbUrl = Deno.env.get("SUPABASE_DB_URL");
    if (!dbUrl) {
      return c.json({ error: "SUPABASE_DB_URL not configured" }, 500);
    }
    
    console.log("🔧 Manual migration triggered: Updating profiles role constraint...");
    
    const { Client } = await import("https://deno.land/x/postgres@v0.17.0/mod.ts");
    const client = new Client(dbUrl);
    await client.connect();
    
    try {
      // Check current constraint definition
      const checkResult = await client.queryObject(`
        SELECT pg_get_constraintdef(oid) as definition
        FROM pg_constraint
        WHERE conname = 'profiles_role_check'
        AND conrelid = 'profiles'::regclass;
      `);
      
      const currentDef = checkResult.rows[0]?.definition as string;
      
      // Check if 'organization' is already in the constraint
      if (currentDef && currentDef.includes("'organization'")) {
        await client.end();
        console.log("✅ Constraint already includes 'organization' role - no update needed");
        return c.json({ 
          success: true, 
          message: "Constraint already up to date! Organization role already allowed." 
        });
      }
      
      // Need to update - use transaction for safety
      await client.queryArray(`BEGIN;`);
      
      try {
        // Drop old constraint
        await client.queryArray(`
          ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
        `);
        
        // Add new constraint with organization role
        await client.queryArray(`
          ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
          CHECK (role IN ('student', 'lecturer', 'admin', 'organization'));
        `);
        
        await client.queryArray(`COMMIT;`);
        
        console.log("✅ Migration completed successfully - organization role added");
        await client.end();
        
        return c.json({ 
          success: true, 
          message: "Role constraint updated to include 'organization'" 
        });
      } catch (innerErr: any) {
        await client.queryArray(`ROLLBACK;`);
        throw innerErr;
      }
    } catch (sqlErr: any) {
      await client.end();
      console.error("❌ Migration SQL error:", sqlErr.message);
      return c.json({ error: `SQL error: ${sqlErr.message}` }, 500);
    }
  } catch (err: any) {
    console.error("❌ Migration error:", err.message);
    return c.json({ error: `Migration failed: ${err.message}` }, 500);
  }
});

// Check migration status endpoint
app.get("/make-server-a05faef1/check-migration", async (c) => {
  try {
    const dbUrl = Deno.env.get("SUPABASE_DB_URL");
    if (!dbUrl) {
      return c.json({ error: "SUPABASE_DB_URL not configured" }, 500);
    }
    
    const { Client } = await import("https://deno.land/x/postgres@v0.17.0/mod.ts");
    const client = new Client(dbUrl);
    await client.connect();
    
    try {
      // Get current constraint definition
      const result = await client.queryObject(`
        SELECT 
          conname as name,
          pg_get_constraintdef(oid) as definition
        FROM pg_constraint
        WHERE conname = 'profiles_role_check'
        AND conrelid = 'profiles'::regclass;
      `);
      
      await client.end();
      
      if (result.rows.length === 0) {
        return c.json({
          exists: false,
          hasOrganization: false,
          message: "Constraint does not exist - migration needed!",
          status: "needs_migration"
        });
      }
      
      const definition = result.rows[0].definition as string;
      const hasOrganization = definition.includes("'organization'");
      
      return c.json({
        exists: true,
        hasOrganization,
        definition,
        message: hasOrganization 
          ? "✅ Constraint is correct - organization role allowed!" 
          : "⚠️ Constraint exists but missing organization role - migration needed!",
        status: hasOrganization ? "ok" : "needs_migration"
      });
    } catch (queryErr: any) {
      await client.end();
      return c.json({ error: `Query error: ${queryErr.message}` }, 500);
    }
  } catch (err: any) {
    return c.json({ error: `Check failed: ${err.message}` }, 500);
  }
});

// AI Chatbot endpoint
app.post("/make-server-a05faef1/chat", async (c) => {
  try {
    const { messages, userContext, apiKey: clientApiKey } = await c.req.json();

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: "Messages array is required" }, 400);
    }

    // Try to get API key from client request first, then fall back to environment variable
    // Trim and check for empty strings
    const trimmedClientKey = clientApiKey?.trim();
    const envKey = Deno.env.get("OPENAI_API_KEY")?.trim();
    const apiKey = (trimmedClientKey && trimmedClientKey.length > 0) ? trimmedClientKey : envKey;
    
    console.log("🔑 API Key Debug:", {
      hasClientKey: !!trimmedClientKey,
      clientKeyLength: trimmedClientKey?.length || 0,
      clientKeyPrefix: trimmedClientKey ? trimmedClientKey.substring(0, 7) : 'none',
      hasEnvKey: !!envKey,
      envKeyLength: envKey?.length || 0,
      envKeyPrefix: envKey ? envKey.substring(0, 7) : 'none',
      usingClientKey: !!(trimmedClientKey && trimmedClientKey.length > 0),
      finalKeyPrefix: apiKey ? apiKey.substring(0, 7) : 'none'
    });
    
    // Check if we have any API key at all
    if (!apiKey || apiKey.length === 0) {
      console.error("❌ OpenAI API key not configured");
      return c.json({ 
        error: "AI service not configured. Please add your OpenAI API key in settings.",
        needsApiKey: true
      }, 400);
    }

    // Validate API key format
    if (!apiKey.startsWith('sk-') && !apiKey.startsWith('sk_')) {
      console.error(`❌ Invalid OpenAI API key format - should start with 'sk-' or 'sk_', got: ${apiKey.substring(0, 7)}...`);
      
      // Check if this is from environment variable (system config issue)
      const isFromEnv = !trimmedClientKey || trimmedClientKey.length === 0;
      
      // If the env key is invalid but client hasn't provided one, prompt user to add their own
      if (isFromEnv) {
        console.error("⚠️ Environment OPENAI_API_KEY is not valid. User should provide their own key.");
      }
      
      return c.json({ 
        error: isFromEnv 
          ? "System API key is invalid or not configured. Please add your OpenAI API key in Settings to use the AI assistant."
          : "Invalid API key format. OpenAI keys must start with 'sk-' or 'sk_'. Please check your key in Settings.",
        needsApiKey: true,
        isSystemKeyInvalid: isFromEnv
      }, 400);
    }

    // Build comprehensive system prompt with platform context
    const systemPrompt = `أنت مساعد YieldX الذكي - مساعد افتراضي متخصص في منصة YieldX التعليمية لدراسة جدوى الأعمال.

## عن منصة YieldX
YieldX هي منصة تعليمية gamified متقدمة لدراسة جدوى الأعمال بثيم فضائي رائع. المنصة تتضمن:
- نظام 8 مستويات (0-7) وفق معايير دراسة الجدوى العُمانية مع خريطة فضائية تفاعلية
- نظام نقاط الخبرة (XP) ومكافآت وإنجازات
- نظام تسليم المهام وتتبع التقدم
- لوحة تحكم للمدرسين لإدارة المجموعات والتصحيح
- دعم كامل للغة العربية مع RTL
- نظام سمات فاتح/مظلم
- حفظ ومزامنة المشاريع مع Supabase

## المستويات الثمانية (0-7) وفق معايير الجدوى العُمانية:
0. 🎯 اختيار نوع المشروع - تحديد نوع المشروع (زراعي/صناعي/تجاري/خدمي) وأسلوب الدراسة
1. 🏛️ الهوية والملكية - معلومات المشروع والملاك والشركاء والهيكل القانوني
2. ⚖️ الإطار القانوني والتنظيمي - التراخيص والتشريعات والمتطلبات الحكومية
3. 🏗️ الموارد المادية والفنية - الموقع والمعدات والبنية التحتية التقنية
4. 👥 الموارد البشرية والتنظيمية - الهيكل الوظيفي والتوظيف ومتطلبات التعمين
5. 📊 السوق والاستراتيجية - تحليل السوق والمنافسين وتحليل SWOT المعزز
6. 💰 التمويل والمؤشرات المالية - الخطة المالية والتمويل ومؤشرات KPI الشاملة
7. 🚀 النموذج الشامل والتنفيذ - Business Model Canvas وخطة التنفيذ وإسهامات رؤية عُمان 2040

## الميزات الخاصة بكل مستوى:
- المستوى 0: يحدد نوع المشروع الذي يؤثر على جميع المستويات اللاحقة (حقول شرطية حسب القطاع)
- المستوى 4: يتضمن حسابات التعمين والحد الأدنى للأجور العُمانية
- المستوى 5: يتضمن تحليل SWOT معزز مع سيناريوهات متعددة
- المستوى 6: يتضمن مؤشرات KPI مالية شاملة وتحليل نقطة التعادل
- المستوى 7: يتضمن Business Model Canvas و9 مكونات رئيسية وربط بأهداف رؤية 2040

## أنواع المشاريع المدعومة:
- 🌿 زراعي: حقول خاصة بالمحاصيل والري والأراضي الزراعية
- 🏭 صناعي: متطلبات التصنيع والمعدات الصناعية والمواصفات
- 🛍️ تجاري: متطلبات التجزئة والمخزون ونقاط البيع
- 🛎️ خدمي: مقاييس الخدمة وتقييمات الجودة وتجربة العميل

## حالات التسليم:
- "غير مُبدأ": لم يبدأ الطالب العمل
- "قيد العمل": بدأ لكن لم يسلم
- "مُسلّم": تم التسليم وينتظر التصحيح
- "تم التصحيح": تم التقييم من المدرس
- "متأخر": تسليم بعد الموعد المحدد

## الميزات الرئيسية:
- 🏆 نظام الشارات والإنجازات: يكسب الطلاب شارات عند إتمام المستويات
- 📊 لوحة المتصدرين: تعرض أفضل الطلاب مع منصة تتويج
- 🔥 سلسلة الأيام المتتالية: تتبع الأيام المتتالية للنشاط
- 🔔 مركز الإشعارات: إشعارات ذكية للتسليمات والتصحيحات
- 💾 الحفظ التلقائي: يحفظ العمل تلقائياً مع مزامنة Supabase
- 📈 تتبع التقدم: متابعة شاملة للإنجازات
- 👨‍🏫 لوحة المدرس: أدوات متقدمة لإدارة المجموعات
- 📤 تصدير PDF: تقارير دراسة الجدوى الكاملة
- 🔄 أوضاع الدراسة: فردي أو جماعي أو متسارع
- 🗺️ خريطة فضائية: تصور تفاعلي للمستويات الثمانية

## معلومات المستخدم الحالي:
${userContext ? JSON.stringify(userContext, null, 2) : "لا توجد معلومات"}

## أسلوبك في الرد:
- تحدث بطريقة ودية ومشجعة ومهنية
- استخدم الإيموجي بشكل مناسب لجعل الردود أكثر حيوية
- أجب باللغة العربية عندما يسأل المستخدم بالعربية وبالإنجليزية عندما يسأل بالإنجليزية
- قدم إجابات مفصلة وواضحة مع أمثلة عملية عند الحاجة
- استخدم معلومات المستخدم المتوفرة لتخصيص الإجابات
- شجع المستخدم وحفزه على إكمال المستويات
- قدم نصائح عملية وخطوات واضحة
- إذا لم تعرف الإجابة، اعترف بذلك واقترح بدائل مفيدة

## المهام التي يمكنك القيام بها:
- الإجابة عن جميع الأسئلة المتعلقة بالمنصة والمستويات (0-7)
- شرح كيفية استخدام الميزات المختلفة
- مساعدة الطلاب في فهم المستويات والأهداف
- شرح متطلبات الجدوى العُمانية لكل مستوى
- تقديم نصائح لتحسين الأداء
- شرح نظام النقاط والمكافآت
- مساعدة المدرسين في إدارة المجموعات

تذكر: أنت هنا لمساعدة المستخدمين على النجاح في رحلتهم التعليمية في YieldX! 🚀✨`;

    console.log("🤖 Calling OpenAI API with", messages.length, "messages");

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      
      let errorMessage = "AI service error";
      let errorDetails = "";
      
      // Try to parse error response for more details
      try {
        const errorData = JSON.parse(errorText);
        const apiError = errorData.error;
        
        // Handle quota exceeded silently (common issue, not worth logging as error)
        if (openaiResponse.status === 429 && apiError?.code === 'insufficient_quota') {
          console.log("ℹ️ OpenAI quota exceeded, returning graceful fallback signal");
          return c.json({ 
            error: "quota_exceeded",
            needsApiKey: true
          }, 429);
        }
        
        // Only log other errors
        console.error("❌ OpenAI API error response:", {
          status: openaiResponse.status,
          statusText: openaiResponse.statusText,
          errorType: apiError?.type || 'unknown'
        });
        
        // Parse specific error messages
        if (openaiResponse.status === 401) {
          errorMessage = "Incorrect API key provided. Please check your API key in Settings.";
          errorDetails = "The API key is invalid or has been revoked.";
        } else if (openaiResponse.status === 429) {
          if (apiError?.code === 'insufficient_quota') {
            errorMessage = "OpenAI API quota exceeded. Your API key has run out of credits.";
            errorDetails = "Please check your OpenAI billing at platform.openai.com/account/billing or use a different API key.";
          } else {
            errorMessage = "OpenAI rate limit exceeded. Please try again later.";
            errorDetails = "Too many requests sent in a short time.";
          }
        } else if (openaiResponse.status === 500) {
          errorMessage = "OpenAI service error. Please try again.";
          errorDetails = "The OpenAI service is experiencing issues.";
        } else if (apiError?.message) {
          errorMessage = apiError.message;
        }
      } catch (parseError) {
        // If parsing fails, log and use default messages
        console.error("❌ Failed to parse OpenAI error response");
        
        if (openaiResponse.status === 401) {
          errorMessage = "Incorrect API key provided. Please check your API key.";
        } else if (openaiResponse.status === 429) {
          errorMessage = "OpenAI rate limit exceeded. Please try again later.";
        } else if (openaiResponse.status === 500) {
          errorMessage = "OpenAI service error. Please try again.";
        }
      }
      
      return c.json({ 
        error: errorMessage,
        details: errorDetails || errorText.substring(0, 200),
        needsApiKey: openaiResponse.status === 401 || openaiResponse.status === 429
      }, openaiResponse.status);
    }

    const data = await openaiResponse.json();
    const aiMessage = data.choices[0]?.message?.content;

    if (!aiMessage) {
      console.error("❌ No message in OpenAI response:", data);
      return c.json({ error: "No response from AI service" }, 500);
    }

    console.log("✅ AI response generated successfully");
    return c.json({ message: aiMessage });

  } catch (error) {
    console.error("❌ Error in chat endpoint:", error);
    return c.json({ 
      error: `Server error: ${error.message}` 
    }, 500);
  }
});

// ─── Projects API ─────────────────────────────────────────────────────────────

// GET /projects — list all projects for a user
app.get("/make-server-a05faef1/projects", async (c) => {
  try {
    const userId = c.req.query("userId");
    if (!userId) return c.json({ error: "userId is required" }, 400);

    const entries = await kv.getByPrefix(`project_${userId}_`);
    const projects = entries
      .map((entry: any) => {
        try { return JSON.parse(entry.value); } catch { return null; }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b.lastEditedDate).getTime() - new Date(a.lastEditedDate).getTime());

    return c.json({ projects });
  } catch (error: any) {
    console.error("❌ Error fetching projects:", error);
    return c.json({ error: `Failed to fetch projects: ${error.message}` }, 500);
  }
});

// POST /projects — save or create a project
app.post("/make-server-a05faef1/projects", async (c) => {
  try {
    const body = await c.req.json();
    const { project } = body;
    if (!project || !project.id || !project.userId) {
      return c.json({ error: "project with id and userId required" }, 400);
    }
    await kv.set(`project_${project.userId}_${project.id}`, JSON.stringify(project));
    console.log(`✅ Project saved: ${project.id} for user ${project.userId}`);
    return c.json({ success: true, project });
  } catch (error: any) {
    console.error("❌ Error saving project:", error);
    return c.json({ error: `Failed to save project: ${error.message}` }, 500);
  }
});

// PUT /projects/:id — update a project
app.put("/make-server-a05faef1/projects/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { userId, updates } = body;
    if (!userId) return c.json({ error: "userId required" }, 400);

    const existing = await kv.get(`project_${userId}_${id}`);
    if (!existing) return c.json({ error: "Project not found" }, 404);

    const existingProject = JSON.parse(existing);
    const updatedProject = { ...existingProject, ...updates, lastEditedDate: new Date().toISOString() };
    await kv.set(`project_${userId}_${id}`, JSON.stringify(updatedProject));

    return c.json({ success: true, project: updatedProject });
  } catch (error: any) {
    console.error("❌ Error updating project:", error);
    return c.json({ error: `Failed to update project: ${error.message}` }, 500);
  }
});

// DELETE /projects/:id — delete a project
app.delete("/make-server-a05faef1/projects/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const userId = c.req.query("userId");
    if (!userId) return c.json({ error: "userId required" }, 400);

    await kv.del(`project_${userId}_${id}`);
    console.log(`✅ Project deleted: ${id} for user ${userId}`);
    return c.json({ success: true });
  } catch (error: any) {
    console.error("❌ Error deleting project:", error);
    return c.json({ error: `Failed to delete project: ${error.message}` }, 500);
  }
});

// ─── Create-profile route (called after client-side signUp) ────────────────────
app.post("/make-server-a05faef1/create-profile", async (c) => {
  try {
    const { createClient } = await import("npm:@supabase/supabase-js");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { userId, name, email, role } = await c.req.json();
    if (!userId || !name || !email || !role) {
      return c.json({ error: "userId, name, email, and role are required" }, 400);
    }
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: name,
      email,
      role,
      subscription_tier: "free",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error(`❌ create-profile error for role '${role}':`, error.message);
      console.error("💡 If you see 'profiles_role_check' error, run the migration!");
      console.error("   Use the yellow migration button in the app, or run: runOrganizationRoleMigration() in console");
      return c.json({ error: error.message }, 400);
    }
    console.log(`✅ Profile created for: ${email} (${role})`);
    return c.json({ success: true });
  } catch (error: any) {
    console.error("❌ create-profile unexpected error:", error.message);
    return c.json({ error: `Profile creation failed: ${error.message}` }, 500);
  }
});

// ─── Sign-up route (legacy – kept for backward compatibility) ───────────────────
app.post("/make-server-a05faef1/signup", async (c) => {
  try {
    const { createClient } = await import("npm:@supabase/supabase-js");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { email, password, name, role } = await c.req.json();
    if (!email || !password || !name || !role) {
      return c.json({ error: "email, password, name, and role are required" }, 400);
    }
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: name, role },
      // Automatically confirm the user's email - no email confirmation required
      email_confirm: true,
    });
    if (error) {
      // Return 409 for duplicate email so the frontend can show a clear message
      if (
        error.code === 'email_exists' ||
        error.status === 422 ||
        (error.message && error.message.toLowerCase().includes('already been registered'))
      ) {
        console.log(`⚠️ Signup blocked – email already exists: ${email}`);
        return c.json({ error: "البريد الإلكتروني مستخدم بالفعل. الرجاء تسجيل الدخول أو استخدام بريد آخر. / This email is already registered. Please log in or use a different email.", code: "email_exists" }, 409);
      }
      console.error("❌ Signup error:", error.message);
      return c.json({ error: error.message }, 400);
    }
    // Upsert profile row
    await supabase.from("profiles").upsert({
      id: data.user.id,
      full_name: name,
      email,
      role,
      subscription_tier: "free",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    console.log(`✅ User created: ${email} (${role})`);
    return c.json({ success: true, userId: data.user.id });
  } catch (error: any) {
    // AuthApiError for duplicate email is sometimes thrown rather than returned
    if (
      error?.code === 'email_exists' ||
      (error?.message && error.message.toLowerCase().includes('already been registered'))
    ) {
      console.log(`⚠️ Signup blocked (thrown) – email already exists`);
      return c.json({ error: "البريد الإلكتروني مستخدم بالفعل. الرجاء تسجيل الدخول أو استخدام بريد آخر. / This email is already registered. Please log in or use a different email.", code: "email_exists" }, 409);
    }
    console.error("❌ Signup unexpected error:", error.message);
    return c.json({ error: `Signup failed: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);