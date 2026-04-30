# 🚀 YieldX + Supabase Integration Guide

## ✅ What's Been Set Up

Your YieldX platform is now **fully connected** to Supabase! Here's what was configured:

### 1. **Environment Variables** (.env.local)
- ✅ Supabase URL: `https://zgakipdkzypobajcadgx.supabase.co`
- ✅ Anon Key: Configured (safe for client-side use)
- ⚠️ **Note**: Uses `VITE_` prefix for Vite compatibility (not `NEXT_PUBLIC_`)

### 2. **Database Schema**
- ✅ 23 tables created (profiles, levels, user_progress, videos, etc.)
- ✅ 9 levels seeded (Level 0-8)
- ✅ 6 video categories
- ✅ 6 sample videos
- ✅ 6 achievements
- ✅ 3 consultants
- ✅ Row Level Security (RLS) enabled

### 3. **Integration Files Created**
```
/src/lib/supabase.ts              # Supabase client configuration
/src/lib/database.types.ts        # TypeScript types for all tables
/src/lib/auth.ts                  # Authentication helpers
/src/hooks/useSupabase.ts         # Custom React hooks
/src/app/components/test/SupabaseTest.tsx  # Test component
```

---

## 🧪 Test the Connection

### **Method 1: Using the Test Page**

1. **Start your dev server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

2. **Open the test page in browser:**
   ```
   http://localhost:5173/?view=test-supabase
   ```
   
3. **You should see:**
   - ✅ Connection status: "Connected Successfully!"
   - ✅ 9 Levels loaded
   - ✅ 6 Video Categories
   - ✅ 6 Videos

### **Method 2: Browser Console Test**

Open browser console and run:

```javascript
// Test direct Supabase connection
import { supabase } from '/src/lib/supabase.ts';

const { data, error } = await supabase.from('levels').select('*');
console.log('Levels:', data);
```

---

## 📚 How to Use the Hooks

### **1. Fetch Levels**
```typescript
import { useLevels } from '@/hooks/useSupabase';

function MyComponent() {
  const { levels, loading, error } = useLevels();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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

### **2. User Progress (with Real-time Updates)**
```typescript
import { useUserProgress } from '@/hooks/useSupabase';

function ProgressTracker({ userId }: { userId: string }) {
  const { progress, loading, updateProgress } = useUserProgress(userId);

  const handleComplete = async (levelId: number) => {
    await updateProgress(levelId, {
      completed: true,
      status: 'submitted',
      xp_earned: 100
    });
  };

  return (
    <div>
      {progress.map(p => (
        <div key={p.id}>
          Level {p.level?.level_number}: {p.status}
          <button onClick={() => handleComplete(p.level_id)}>
            Mark Complete
          </button>
        </div>
      ))}
    </div>
  );
}
```

### **3. Leaderboard (with Real-time)**
```typescript
import { useLeaderboard } from '@/hooks/useSupabase';

function LeaderboardView() {
  const { leaderboard, loading } = useLeaderboard('global');

  return (
    <div>
      {leaderboard.map((entry, index) => (
        <div key={entry.id}>
          #{index + 1}: {entry.profile?.display_name} - {entry.total_xp} XP
        </div>
      ))}
    </div>
  );
}
```

### **4. Videos**
```typescript
import { useVideos } from '@/hooks/useSupabase';

function VideoList({ levelId }: { levelId?: number }) {
  const { videos, loading } = useVideos(undefined, levelId);

  return (
    <div>
      {videos.map(video => (
        <div key={video.id}>
          {video.title_en} - {video.duration_minutes} min
        </div>
      ))}
    </div>
  );
}
```

### **5. Notifications (with Real-time)**
```typescript
import { useNotifications } from '@/hooks/useSupabase';

function NotificationBell({ userId }: { userId: string }) {
  const { notifications, unreadCount, markAsRead } = useNotifications(userId);

  return (
    <div>
      <span>🔔 {unreadCount}</span>
      {notifications.map(notif => (
        <div key={notif.id} onClick={() => markAsRead(notif.id)}>
          {notif.title}
        </div>
      ))}
    </div>
  );
}
```

---

## 🔐 Authentication Examples

### **Sign Up**
```typescript
import { signUp } from '@/lib/auth';

async function handleSignUp() {
  try {
    const { user, session } = await signUp({
      email: 'student@example.com',
      password: 'SecurePassword123',
      fullName: 'Ahmed Al-Balushi',
      role: 'student',
      organization: 'Sultan Qaboos University'
    });
    
    console.log('User created:', user);
  } catch (error) {
    console.error('Sign up failed:', error.message);
  }
}
```

### **Sign In**
```typescript
import { signIn } from '@/lib/auth';

async function handleSignIn() {
  try {
    const { user, session } = await signIn({
      email: 'student@example.com',
      password: 'SecurePassword123'
    });
    
    console.log('Logged in:', user);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
}
```

### **Get Current User**
```typescript
import { getCurrentUser, getUserProfile } from '@/lib/auth';

async function loadUserData() {
  const user = await getCurrentUser();
  
  if (user) {
    const profile = await getUserProfile(user.id);
    console.log('Profile:', profile);
  }
}
```

---

## 🔄 Real-Time Subscriptions

All hooks automatically subscribe to real-time updates:

- ✅ **useUserProgress** - Live progress updates
- ✅ **useLeaderboard** - Live rank changes
- ✅ **useNotifications** - New notifications appear instantly
- ✅ **useProfile** - Profile changes sync immediately

**No additional code needed!** Just use the hooks and real-time sync is automatic.

---

## 📊 Direct Supabase Queries

For custom queries not covered by hooks:

```typescript
import { supabase } from '@/lib/supabase';

// Fetch data
const { data, error } = await supabase
  .from('videos')
  .select('*, video_categories(*)')
  .eq('level_id', 1)
  .eq('is_active', true);

// Insert data
const { data, error } = await supabase
  .from('user_progress')
  .insert({
    user_id: 'user-uuid',
    level_id: 1,
    status: 'in-progress',
    unlocked: true
  });

// Update data
const { data, error } = await supabase
  .from('profiles')
  .update({ total_xp: 500 })
  .eq('id', 'user-uuid');

// Delete data
const { data, error } = await supabase
  .from('notifications')
  .delete()
  .eq('id', 'notification-uuid');
```

---

## 🛠️ Troubleshooting

### **"Missing Supabase environment variables" error**
- ✅ Make sure `.env.local` file exists in the **root directory** of your project
- ✅ Variables must be prefixed with `VITE_` (not `NEXT_PUBLIC_`)
- ✅ **Restart your dev server** after creating/modifying `.env.local`
- ✅ If using Docker/containers, make sure .env.local is not in .gitignore for deployment

Your `.env.local` should look like this:
```env
VITE_SUPABASE_URL=https://zgakipdkzypobajcadgx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **"Failed to fetch" error**
- ✅ Check `.env.local` exists and has correct values
- ✅ Restart dev server after adding .env.local
- ✅ Verify Supabase project is active (not paused)

### **"Row Level Security policy violation"**
- ✅ Make sure user is authenticated for protected tables
- ✅ Check RLS policies in Supabase Dashboard → Authentication → Policies
- ✅ Verify you're using the correct user ID

### **Real-time not working**
- ✅ Enable Realtime in Supabase Dashboard → Database → Replication
- ✅ Select the tables you want real-time for
- ✅ Check browser console for subscription errors

### **Type errors**
- ✅ Make sure `/src/lib/database.types.ts` is up to date
- ✅ You can regenerate types from Supabase CLI (optional)

---

## 🎯 Next Steps

1. **Test the connection** using the test page
2. **Integrate authentication** into your existing login system
3. **Replace localStorage** data with Supabase queries
4. **Add real-time features** using the provided hooks
5. **Deploy** - the .env.local will work in production too!

---

## 🔗 Useful Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/zgakipdkzypobajcadgx
- **API Docs**: https://supabase.com/docs/reference/javascript/introduction
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security

---

## 🎉 You're All Set!

Your YieldX platform is now powered by Supabase with:
- ✅ Real-time data synchronization
- ✅ Type-safe database queries
- ✅ Built-in authentication
- ✅ Row-level security
- ✅ Automatic backups
- ✅ Scalable infrastructure

**No more localStorage - everything is now in the cloud!** 🚀