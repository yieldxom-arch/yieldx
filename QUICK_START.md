# 🚀 YieldX + Supabase - Quick Start

## ⚡ Testing the Connection (3 Steps)

### 1️⃣ **Restart Your Dev Server**
```bash
# Press Ctrl+C to stop
# Then restart:
npm run dev
# or
pnpm dev
```

### 2️⃣ **Visit Test Page**
Open in browser:
```
http://localhost:5173/?view=test-supabase
```

### 3️⃣ **Check for Success**
You should see:
- ✅ Green checkmarks next to environment variables
- ✅ "Connected Successfully!" message
- ✅ 9 Levels loaded
- ✅ 6 Video Categories
- ✅ 6 Videos

---

## 🎯 Quick Integration Example

### **Use in Any Component:**

```typescript
import { useLevels } from '@/hooks/useSupabase';

function MyComponent() {
  const { levels, loading } = useLevels();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {levels.map(level => (
        <div key={level.id}>
          Level {level.level_number}: {level.title_en}
        </div>
      ))}
    </div>
  );
}
```

---

## 📊 Available Hooks

| Hook | Purpose | Real-time |
|------|---------|-----------|
| `useLevels()` | Get all 9 levels | ❌ |
| `useUserProgress(userId)` | Track student progress | ✅ |
| `useVideos(categoryId?, levelId?)` | Get videos | ❌ |
| `useVideoCategories()` | Get video categories | ❌ |
| `useLeaderboard(scope)` | Get rankings | ✅ |
| `useUserAchievements(userId)` | Get badges | ✅ |
| `useNotifications(userId)` | Get notifications | ✅ |
| `useProfile(userId)` | Get user profile | ✅ |

---

## 🔐 Quick Auth Example

### **Sign Up:**
```typescript
import { signUp } from '@/lib/auth';

await signUp({
  email: 'student@example.com',
  password: 'SecurePass123',
  fullName: 'Ahmed Al-Balushi',
  role: 'student'
});
```

### **Sign In:**
```typescript
import { signIn } from '@/lib/auth';

await signIn({
  email: 'student@example.com',
  password: 'SecurePass123'
});
```

### **Get Current User:**
```typescript
import { getCurrentUser } from '@/lib/auth';

const user = await getCurrentUser();
console.log(user);
```

---

## 🛠️ Troubleshooting

### ❌ "Missing environment variables"
1. Check `.env.local` exists in **root** directory
2. Contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. **Restart dev server** after creating .env.local

### ❌ "Failed to fetch"
1. Verify Supabase project is active
2. Check credentials in `.env.local`
3. Hard refresh browser (Ctrl+Shift+R)

### ❌ "Not seeing data"
1. Visit test page: `?view=test-supabase`
2. Check browser console for errors
3. Verify SQL schema was executed in Supabase

---

## 📖 Full Documentation

- **Setup Guide:** `/SUPABASE_SETUP.md`
- **Fix Summary:** `/SUPABASE_FIX_SUMMARY.md`
- **Supabase Dashboard:** https://supabase.com/dashboard/project/zgakipdkzypobajcadgx

---

## ✅ Success Checklist

- [ ] Restarted dev server
- [ ] Visited `?view=test-supabase`
- [ ] See green checkmarks
- [ ] See "Connected Successfully!"
- [ ] See 9 levels, 6 categories, 6 videos
- [ ] No errors in console
- [ ] Ready to integrate! 🎉

---

**Your YieldX platform is now cloud-powered!** 🚀☁️
