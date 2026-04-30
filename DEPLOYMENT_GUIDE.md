# 🚀 YieldX Complete Deployment Guide

## **Your Supabase Project**
- **URL:** `https://hwbpgmbcasgdvhbofauc.supabase.co`
- **Project ID:** `hwbpgmbcasgdvhbofauc`

---

## **📋 Complete Setup (15 minutes)**

### **STEP 1: Create Database Schema** ⏱️ 2 minutes

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/hwbpgmbcasgdvhbofauc
2. Click **"SQL Editor"** in left sidebar
3. Click **"New query"**
4. Open `/DEPLOY_SCHEMA.sql` file in your project
5. **Copy the ENTIRE file** (all ~800 lines)
6. **Paste into SQL Editor**
7. Click **"Run"** (or press Ctrl/Cmd + Enter)

**✅ Expected Result:**
```
✅ ============================================
✅ YieldX Database Schema Created Successfully!
✅ ============================================

📊 Tables Created:
   - profiles (user accounts)
   - levels (0-7 learning levels)
   - user_progress (student progress tracking)
   - projects (student workspaces)
   - badges (achievements)
   - cohorts (classes)
   - cohort_members
   - announcements
   - messages
   - chat_messages
   - file_uploads

🔒 Row Level Security: ENABLED
📁 Storage Bucket: project-files
🎯 Levels: 0-7 initialized
```

---

### **STEP 2: Create Demo User Accounts** ⏱️ 5 minutes

#### **2A: Create Auth Users**

1. Click **"Authentication"** in left sidebar
2. Click **"Users"** tab
3. Click **"Add user"** → **"Create new user"**

**Create Account #1 - Teacher:**
- **Email:** `demo.teacher@yieldx.com`
- **Password:** `demo123`
- **Confirm Password:** `demo123`
- **✅ IMPORTANT: Check "Auto Confirm User"**
- Click **"Create user"**

**Create Account #2 - Student:**
- **Email:** `demo.student@yieldx.com`
- **Password:** `demo123`
- **Confirm Password:** `demo123`
- **✅ IMPORTANT: Check "Auto Confirm User"**
- Click **"Create user"**

**Create Account #3 - Admin:**
- **Email:** `admin@yieldx.com`
- **Password:** `admin123`
- **Confirm Password:** `admin123`
- **✅ IMPORTANT: Check "Auto Confirm User"**
- Click **"Create user"**

You should now see 3 users in the list.

#### **2B: Create Profiles for Auth Users**

1. Go back to **"SQL Editor"**
2. Click **"New query"**
3. Open `/CREATE_DEMO_ACCOUNTS.sql` file
4. **Copy the ENTIRE file**
5. **Paste into SQL Editor**
6. Click **"Run"**

**✅ Expected Result:**
```
✅ =========================================
✅ Demo Accounts Setup Complete!
✅ =========================================

📊 Total Profiles: 3

🔑 Login Credentials:

   Teacher Account:
   - Email: demo.teacher@yieldx.com
   - Password: demo123
   - Role: lecturer

   Student Account:
   - Email: demo.student@yieldx.com
   - Password: demo123
   - Role: student

   Admin Account:
   - Email: admin@yieldx.com
   - Password: admin123
   - Role: admin

🎉 You are ready to use YieldX!
```

---

### **STEP 3: Verify Database Setup** ⏱️ 2 minutes

Run these verification queries in SQL Editor:

**Check profiles table:**
```sql
SELECT email, full_name, role, subscription_tier 
FROM profiles 
ORDER BY created_at DESC;
```

**Expected output:**
```
| email                     | full_name    | role     | subscription_tier |
|---------------------------|--------------|----------|-------------------|
| admin@yieldx.com          | System Admin | admin    | enterprise        |
| demo.student@yieldx.com   | Demo Student | student  | free              |
| demo.teacher@yieldx.com   | Demo Teacher | lecturer | premium           |
```

**Check levels table:**
```sql
SELECT level_number, title_en, title_ar, max_xp 
FROM levels 
ORDER BY level_number;
```

**Expected output:**
```
| level_number | title_en             | title_ar          | max_xp |
|--------------|----------------------|-------------------|--------|
| 0            | Project Foundation   | أساسيات المشروع  | 500    |
| 1            | Market Analysis      | تحليل السوق       | 750    |
| 2            | Technical Study      | الدراسة الفنية   | 800    |
| 3            | Financial Planning   | التخطيط المالي    | 1000   |
| 4            | Risk Assessment      | تقييم المخاطر     | 900    |
| 5            | Business Model       | نموذج العمل       | 850    |
| 6            | Implementation Plan  | خطة التنفيذ       | 1100   |
| 7            | Final Presentation   | العرض النهائي     | 1200   |
```

**Check storage bucket:**
```sql
SELECT id, name, public 
FROM storage.buckets;
```

**Expected output:**
```
| id            | name          | public |
|---------------|---------------|--------|
| project-files | project-files | false  |
```

✅ **If all 3 queries return data, your database is ready!**

---

### **STEP 4: Test Login** ⏱️ 3 minutes

1. Go to your YieldX app (deployed on Vercel)
2. **Refresh the page** (Ctrl/Cmd + R)

#### **Test Teacher Login:**
1. Click **"Lecturer Login"**
2. Enter:
   - Email: `demo.teacher@yieldx.com`
   - Password: `demo123`
3. Click **"Login"**
4. ✅ You should see the **Teacher Dashboard**

#### **Test Student Login:**
1. Logout (if logged in)
2. Click **"Student Login"**
3. Enter:
   - Email: `demo.student@yieldx.com`
   - Password: `demo123`
4. Click **"Login"**
5. ✅ You should see the **Student Dashboard** with space map

---

## **🔧 Troubleshooting**

### **Problem: "relation profiles does not exist"**

**Cause:** Schema not created  
**Solution:** Run `/DEPLOY_SCHEMA.sql` in Supabase SQL Editor

---

### **Problem: Blank/white screen after login**

**Cause:** Auth user exists but no profile in `profiles` table  
**Solution:** Run `/CREATE_DEMO_ACCOUNTS.sql` to create profiles

**Check if profile exists:**
```sql
SELECT * FROM profiles WHERE email = 'demo.teacher@yieldx.com';
```

If returns 0 rows, run the CREATE_DEMO_ACCOUNTS.sql script.

---

### **Problem: "Invalid login credentials"**

**Cause 1:** Auth user doesn't exist  
**Solution:** Create auth user in Authentication > Users (Step 2A)

**Cause 2:** Password is wrong  
**Solution:** Use `demo123` for teacher/student, `admin123` for admin

**Cause 3:** Email not confirmed  
**Solution:** When creating auth user, make sure "Auto Confirm User" is checked

**Check if auth user exists:**
```sql
SELECT id, email, confirmed_at 
FROM auth.users 
WHERE email = 'demo.teacher@yieldx.com';
```

If `confirmed_at` is NULL, the email isn't confirmed.

---

### **Problem: Console shows errors**

**Open browser console (F12)** and look for error messages:

**Error: "Failed to fetch"**
- Supabase URL or API key is wrong
- Check `/src/lib/supabase-config.ts`

**Error: "JWT expired"**
- Old session cached
- Solution: Logout and login again

**Error: "Row Level Security policy violation"**
- RLS policies not set correctly
- Solution: Re-run `/DEPLOY_SCHEMA.sql` (it includes all RLS policies)

---

### **Problem: Teacher dashboard shows no data**

This is normal on first login! Teachers need to:
1. Create a cohort (class)
2. Invite students
3. Students join and submit work

---

### **Problem: Student Level 0 is locked**

**Check student progress:**
```sql
SELECT * FROM user_progress 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'demo.student@yieldx.com');
```

**Unlock Level 0:**
```sql
INSERT INTO user_progress (
  user_id,
  level_id,
  status,
  unlocked,
  completed
) VALUES (
  (SELECT id FROM profiles WHERE email = 'demo.student@yieldx.com'),
  (SELECT id FROM levels WHERE level_number = 0),
  'not-started',
  true,
  false
)
ON CONFLICT (user_id, level_id) DO UPDATE SET
  unlocked = true;
```

---

## **📊 Database Quick Reference**

### **Key Tables:**

1. **`profiles`** - User accounts (linked to auth.users)
2. **`levels`** - 8 levels (0-7) with titles and XP
3. **`user_progress`** - Track which levels students unlocked/completed
4. **`projects`** - Student workspaces with all level data (JSONB)
5. **`cohorts`** - Classes created by teachers
6. **`cohort_members`** - Students in each class

### **Common Queries:**

**List all users:**
```sql
SELECT email, full_name, role FROM profiles;
```

**List all students:**
```sql
SELECT email, full_name, total_xp, current_streak 
FROM profiles 
WHERE role = 'student';
```

**List all teachers:**
```sql
SELECT email, full_name, organization 
FROM profiles 
WHERE role = 'lecturer';
```

**Check student's progress:**
```sql
SELECT 
  p.email,
  l.level_number,
  l.title_en,
  up.status,
  up.unlocked,
  up.completed,
  up.xp_earned
FROM user_progress up
JOIN profiles p ON up.user_id = p.id
JOIN levels l ON up.level_id = l.id
WHERE p.email = 'demo.student@yieldx.com'
ORDER BY l.level_number;
```

**Check student's projects:**
```sql
SELECT 
  name,
  project_type,
  status,
  progress,
  total_xp,
  created_at
FROM projects
WHERE user_id = (SELECT id FROM profiles WHERE email = 'demo.student@yieldx.com')
ORDER BY created_at DESC;
```

---

## **✅ Success Checklist**

- [ ] Ran `/DEPLOY_SCHEMA.sql` successfully
- [ ] Created 3 auth users (teacher, student, admin)
- [ ] Ran `/CREATE_DEMO_ACCOUNTS.sql` successfully
- [ ] Verified `profiles` table has 3 rows
- [ ] Verified `levels` table has 8 rows (0-7)
- [ ] Teacher can login successfully
- [ ] Student can login successfully
- [ ] No errors in browser console
- [ ] Storage bucket `project-files` exists

---

## **🎉 You're Done!**

Your YieldX platform is now fully deployed with:
- ✅ Complete database schema
- ✅ Row Level Security enabled
- ✅ Demo accounts ready to use
- ✅ File storage configured
- ✅ All 8 levels (0-7) initialized

**Next steps:**
1. Share login credentials with users
2. Create real teacher/student accounts
3. Start creating cohorts and projects
4. Explore the 8-level gamified system

---

## **Need Help?**

If you encounter any issues:

1. **Check browser console (F12)** for error messages
2. **Run verification queries** from Step 3
3. **Check Supabase logs:**
   - Go to: https://supabase.com/dashboard/project/hwbpgmbcasgdvhbofauc/logs
   - Look for recent errors
4. **Verify environment variables** in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

**Common fixes:**
- Clear browser cache
- Re-run SQL scripts
- Logout and login again
- Check RLS policies are enabled

---

**Happy teaching and learning with YieldX! 🚀🌟**
