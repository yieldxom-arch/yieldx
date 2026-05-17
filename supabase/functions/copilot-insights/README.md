# YieldX Copilot Insights / Gemini AI — Supabase Edge Function

## Overview

This Supabase Edge Function provides a secure, server-side endpoint for the YieldX AI Copilot feature. It powers three personas — Atlas (CFO), Nova (CMO), and Orion (CEO) — by:

1. **Validating Authentication** — Verifies the user's Supabase JWT token
2. **Checking Subscription Tier** — Ensures only Pro and Organization users can access the feature
3. **Building a Persona Prompt** — Constructs a role-specific bilingual prompt server-side (the prompt never reaches the browser)
4. **Calling Google Gemini REST API** — Makes the Gemini request server-side using a secure API key
5. **Returning Structured Insights** — Returns up to 3 bilingual (EN/AR) insight messages in a consistent shape

The Gemini API key is stored **only** as a Supabase secret and never reaches the browser.

---

## Deployment

### 1. Deploy the Edge Function

From the project root, run:

```bash
supabase functions deploy copilot-insights
```

This makes the function available at:
- **Production:** `https://<YOUR_PROJECT_ID>.supabase.co/functions/v1/copilot-insights`
- **Local dev:** `http://localhost:54321/functions/v1/copilot-insights`

### 2. Set the Gemini API Key Secret

```bash
supabase secrets set GEMINI_API_KEY=AIza...your-real-key
```

Get a free key (no credit card needed) from:
**https://aistudio.google.com/app/apikey**

To verify the secret was set:
```bash
supabase secrets list
```

### 3. Verify Deployment

```bash
curl https://<YOUR_PROJECT_ID>.supabase.co/functions/v1/copilot-insights/health
```

Expected response:
```json
{"status": "ok"}
```

---

## API Request / Response

### Request (POST)

**URL:** `https://<YOUR_PROJECT_ID>.supabase.co/functions/v1/copilot-insights`

**Headers:**
```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "role": "CFO",
  "projectData": {
    "projectTypeData": {},
    "moduleData": {},
    "financialKPIs": {}
  },
  "language": "en"
}
```

- `role`: one of `"CFO"`, `"CMO"`, `"CEO"`
- `projectData`: arbitrary JSON from the user's YieldX project state
- `language`: `"en"` or `"ar"`

### Response (Success — 200)

```json
{
  "messages": [
    {
      "title": "Strong cash flow runway",
      "titleAr": "مدرج تدفق نقدي قوي",
      "content": "Your projected runway of 14 months is above the Oman SME average...",
      "contentAr": "مدة التشغيل المتوقعة وهي 14 شهرًا تفوق متوسط الشركات الصغيرة والمتوسطة في عُمان...",
      "type": "analysis",
      "priority": "high"
    }
  ]
}
```

### Response (Unauthenticated — 401)

```json
{"error": "Unauthorized. Please log in."}
```

### Response (Free Tier — 403)

```json
{"error": "AI Copilot is only available on Pro and Organization plans. Please upgrade to use this feature."}
```

### Response (Rate Limited — 429)

```json
{"error": "Too many requests. Please slow down and try again in a moment."}
```

### Response (Server Error — 500)

```json
{"error": "Sorry, the AI Copilot could not be reached right now. Please try again later."}
```

---

## Testing with curl

### Test unauthenticated (expect 401)

```bash
curl -X POST https://<YOUR_PROJECT_ID>.supabase.co/functions/v1/copilot-insights \
  -H "Content-Type: application/json" \
  -d '{"role":"CFO","projectData":{},"language":"en"}'
```

### Test authenticated (replace YOUR_JWT_TOKEN)

```bash
curl -X POST https://<YOUR_PROJECT_ID>.supabase.co/functions/v1/copilot-insights \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "role": "CFO",
    "projectData": {"projectTypeData": {"type": "commercial"}},
    "language": "en"
  }'
```

---

## Environment Variables & Secrets

### Required Secret (Set via CLI)

- **`GEMINI_API_KEY`** — Your Google Gemini API key (starts with `AIza`)
  - Get it free from [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### Automatically Available (Supabase-injected)

- **`SUPABASE_URL`** — Your Supabase project URL
- **`SUPABASE_SERVICE_ROLE_KEY`** — Service role key for database queries

---

## Deployment Commands (in order)

```bash
# 1. Set the secret
supabase secrets set GEMINI_API_KEY=AIza...

# 2. Deploy the function
supabase functions deploy copilot-insights

# 3. Verify health endpoint
curl https://<YOUR_PROJECT_ID>.supabase.co/functions/v1/copilot-insights/health
```

---

## Security Notes

- The Gemini API key is **never** sent to the browser — it lives only in Supabase secrets
- Every request requires a valid Supabase JWT token (401 if missing or invalid)
- Subscription tier is validated **server-side** — the frontend gate is not trusted
- Full error details are logged with `console.error` server-side; safe messages are returned to clients
- No API keys, stack traces, or internal details ever appear in the response body

---

## Frontend Integration

The frontend calls this function via `src/lib/copilot-ai.ts`. The public API is unchanged:

```typescript
import { generateCFOInsights, generateCMOInsights, generateCEOInsights } from '@/lib/copilot-ai';

const messages = await generateCFOInsights(projectData, 'en');
```

No changes are needed in `CopilotBridge.tsx`, `Level5MarketStrategy.tsx`, `Level6FinancingKPIs.tsx`, or `Level7BMCImplementation.tsx`.
