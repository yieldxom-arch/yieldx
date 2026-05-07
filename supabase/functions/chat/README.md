# YieldX Chat / Claude AI Assistant — Supabase Edge Function

## Overview

This Supabase Edge Function provides a secure, server-side endpoint for the YieldX AI chatbot integration. It:

1. **Validates Authentication** — Verifies the user's Supabase JWT token
2. **Checks Subscription Tier** — Ensures only Pro and Organization users can access the feature
3. **Calls Anthropic API** — Makes the Claude request server-side using a secure API key
4. **Returns Safe Responses** — Never exposes API keys or internal errors to the client

The Anthropic API key is stored **only** as a Supabase secret and never reaches the browser.

---

## Deployment

### 1. Ensure Supabase CLI is Installed

```bash
npm install -g supabase
# or
brew install supabase/tap/supabase  # macOS
```

### 2. Deploy the Edge Function

From the project root, run:

```bash
supabase functions deploy chat
```

This will:
- Upload the function to your Supabase project
- Make it available at: `https://<YOUR_PROJECT_ID>.supabase.co/functions/v1/chat`
- In local dev (supabase start): `http://localhost:54321/functions/v1/chat`

### 3. Set the Anthropic API Key Secret

#### Option A: Via CLI (Recommended)

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
```

To set it for a specific environment:

```bash
supabase secrets set --env production ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
```

#### Option B: Via Supabase Dashboard

1. Go to **Project Settings** → **Edge Functions** → **Secrets**
2. Click **New Secret**
3. Set:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** Your Anthropic API key (starts with `sk-ant-`)
4. Click **Add Secret**

### 4. Verify Deployment

```bash
curl -H "Authorization: Bearer your_jwt_token" \
  https://<YOUR_PROJECT_ID>.supabase.co/functions/v1/chat/health
```

Expected response:
```json
{"status": "ok"}
```

---

## API Request / Response

### Request (POST)

**URL:** `https://<YOUR_PROJECT_ID>.supabase.co/functions/v1/chat`

**Headers:**
```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "userMessage": "What is Level 0?",
  "history": [
    {"role": "assistant", "content": "Hello!"},
    {"role": "user", "content": "Hi"}
  ],
  "language": "en",
  "userName": "Ahmed",
  "userRole": "student"
}
```

### Response (Success)

**Status:** 200

```json
{
  "text": "Level 0 is where you select your project type..."
}
```

### Response (Authentication Failed)

**Status:** 401

```json
{
  "error": "Unauthorized. Please log in."
}
```

### Response (Subscription Restricted)

**Status:** 403

```json
{
  "error": "AI Assistant is only available on Pro and Organization plans. Please upgrade to use this feature."
}
```

### Response (Too Many Requests)

**Status:** 429

```json
{
  "error": "Too many requests. Please slow down and try again in a moment."
}
```

### Response (Server Error)

**Status:** 500

```json
{
  "error": "Sorry, the AI Assistant is temporarily unavailable. Please try again later."
}
```

---

## Testing with Curl

### Local Development

1. Start Supabase:
   ```bash
   supabase start
   ```

2. Create a test user in Supabase Auth or use an existing JWT token

3. Call the function:
   ```bash
   curl -X POST http://localhost:54321/functions/v1/chat \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{
       "userMessage": "Hello",
       "history": [],
       "language": "en"
     }'
   ```

### Production

```bash
curl -X POST https://<YOUR_PROJECT_ID>.supabase.co/functions/v1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userMessage": "What is SWOT analysis?",
    "history": [],
    "language": "ar",
    "userName": "محمد",
    "userRole": "student"
  }'
```

---

## Environment Variables & Secrets

### Required Secrets (Set via CLI or Dashboard)

- **`ANTHROPIC_API_KEY`** — Your Anthropic API key (required)
  - Get it from [console.anthropic.com](https://console.anthropic.com)
  - Starts with `sk-ant-`

### Automatically Available

- **`SUPABASE_URL`** — Your Supabase project URL
- **`SUPABASE_SERVICE_ROLE_KEY`** — Service role key for database queries
  - Set automatically by Supabase

---

## Security Notes

1. **API Key Protection**
   - The Anthropic API key is **never** sent to the browser
   - It's only used server-side in the edge function
   - The key is stored as a Supabase secret, not in `.env`

2. **Authentication**
   - Every request requires a valid Supabase JWT token
   - Invalid tokens are rejected with 401

3. **Authorization**
   - Server-side validation of subscription tier (defense in depth)
   - Free users are rejected with 403
   - The frontend gate is not trusted; it's enforced server-side

4. **Error Handling**
   - Full error details are logged server-side (console.error)
   - Safe, user-friendly messages are returned to the client
   - No stack traces or internal details leak to the browser

5. **Rate Limiting**
   - Anthropic API rate limits are handled and communicated (429)
   - Clients are instructed to retry

---

## Troubleshooting

### "ANTHROPIC_API_KEY not set"

**Problem:** Function returns 500 with "AI Assistant is temporarily unavailable"

**Solution:**
```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
```

Verify it was set:
```bash
supabase secrets list
```

### "Unauthorized" (401)

**Problem:** Authorization header is missing or invalid

**Solution:**
- Ensure the frontend includes the `Authorization: Bearer <token>` header
- Verify the token is a valid Supabase JWT (not expired)
- Check user is logged in before calling the endpoint

### "AI Assistant is only available on Pro plans" (403)

**Problem:** User is on free tier

**Solution:**
- This is expected behavior
- Upgrade user's subscription tier in `profiles` table to `premium` or `enterprise`

### "Can't find profiles table"

**Problem:** Database schema not initialized

**Solution:**
1. Run migrations:
   ```bash
   supabase db push
   ```
2. Ensure `supabase/schema.sql` includes the `profiles` table

---

## Frontend Integration

The frontend calls this edge function via `src/app/services/chatbotService.ts`:

```typescript
const response = await fetch(
  `${supabaseUrl}/functions/v1/chat`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      userMessage,
      history,
      language,
      userName,
      userRole,
    }),
  }
);
```

The service:
- Retrieves the auth token from `supabase.auth.getSession()`
- Handles HTTP errors and translates them to user-friendly messages
- Returns the same interface as before: `{ text: string; error?: string }`
- No changes needed to `ChatBot.tsx` or `App.tsx` — they use the same service

---

## Development / Local Testing

### Start Local Supabase

```bash
supabase start
```

This starts Supabase on:
- API: `http://localhost:54321`
- Studio (Admin): `http://localhost:54323`
- Functions: `http://localhost:54321/functions/v1`

### Set Local Secret

```bash
supabase secrets set --env local ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
```

### View Function Logs

```bash
supabase functions delete chat  # (or just view logs)
tail -f ~/.supabase/logs/functions.log
```

Or use the Supabase Studio → Functions tab.

---

## Model Information

- **Model:** `claude-sonnet-4-6`
- **Max Tokens:** 1024
- **System Prompt:** Customized per user language and role (built server-side)

See `supabase/functions/chat/index.ts` for the full system prompt.

---

## Next Steps

1. ✅ Deploy: `supabase functions deploy chat`
2. ✅ Set secret: `supabase secrets set ANTHROPIC_API_KEY=sk-ant-...`
3. ✅ Test with curl (above)
4. ✅ Verify frontend calls work (check browser DevTools Network tab)
5. ✅ Verify API key does NOT appear in browser bundle: `grep -r "sk-ant" dist/`

---

## Support

For issues:
1. Check Supabase Dashboard → Functions logs
2. Run `supabase functions delete chat` and redeploy
3. Verify `ANTHROPIC_API_KEY` secret is set: `supabase secrets list`
4. Check that `profiles` table has `subscription_tier` column
