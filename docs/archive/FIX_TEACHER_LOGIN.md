# 🔧 Fix Teacher Login - Step by Step

## **Problem:** Black screen when logging in as teacher

## **Root Cause:** 
The demo teacher account exists in Supabase Auth but doesn't have a profile in the `profiles` table.

---

## **Quick Fix (5 minutes)**

### **Step 1: Access Supabase Dashboard**

1. Go to https://supabase.com/dashboard
2. Select your project: `hwbpgmbcasgdvhbofauc`

### **Step 2: Check Auth Users**

1. Click **"Authentication"** in the left sidebar
2. Click **"Users"** tab
3. Do you see these emails?
   - `demo.teacher@yieldx.com`
   - `demo.student@yieldx.com`

**If YES → Go to Step 3**  
**If NO → Go to Step 2B**

### **Step 2B: Create Auth Users (If Missing)**

1. Click **"Add user"** → **"Create new user"**
2. Fill in:
   - **Email:** `demo.teacher@yieldx.com`
   - **Password:** `demo123`
   - **Confirm Password:** `demo123`
   - **Auto Confirm User:** ✅ **YES** (IMPORTANT!)
3. Click **"Create user"**
4. Repeat for `demo.student@yieldx.com` / `demo123`

### **Step 3: Get User IDs**

1. Click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Paste this SQL:

```sql
SELECT id, email FROM auth.users;
```

4. Click **"Run"** (or press Ctrl/Cmd + Enter)
5. **Copy the IDs** - you'll need them in the next step

Example result:
```
| id                                   | email                     |
|--------------------------------------|---------------------------|
| 12345678-abcd-1234-abcd-123456789012 | demo.teacher@yieldx.com   |
| 87654321-efgh-4321-efgh-210987654321 | demo.student@yieldx.com   |
```

### **Step 4: Create Profiles**

1. Still in **SQL Editor**, create a new query
2. **Copy the template below**
3. **Replace the UUIDs** with the actual IDs from Step 3
4. Paste and run:

```sql
-- Create profiles for demo accounts
-- IMPORTANT: Replace the UUIDs with actual ones from Step 3

INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  display_name,
  subscription_tier,
  total_xp,
  current_streak,
  total_login_days,
  language,
  theme,
  profile_visibility
) VALUES
  (
    'PASTE_TEACHER_UUID_HERE', -- Replace with teacher's UUID from Step 3
    'demo.teacher@yieldx.com',
    'Demo Teacher',
    'lecturer',
    'Demo Teacher',
    'premium',
    0,
    0,
    1,
    'ar',
    'dark',
    'public'
  ),
  (
    'PASTE_STUDENT_UUID_HERE', -- Replace with student's UUID from Step 3
    'demo.student@yieldx.com',
    'Demo Student',
    'student',
    'Demo Student',
    'free',
    2450,
    5,
    12,
    'ar',
    'dark',
    'public'
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;
```

**Example with real UUIDs:**
```sql
INSERT INTO profiles (id, email, full_name, role, display_name, subscription_tier, total_xp, current_streak, total_login_days, language, theme, profile_visibility)
VALUES
  ('12345678-abcd-1234-abcd-123456789012', 'demo.teacher@yieldx.com', 'Demo Teacher', 'lecturer', 'Demo Teacher', 'premium', 0, 0, 1, 'ar', 'dark', 'public'),
  ('87654321-efgh-4321-efgh-210987654321', 'demo.student@yieldx.com', 'Demo Student', 'student', 'Demo Student', 'free', 2450, 5, 12, 'ar', 'dark', 'public')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;
```

5. Click **"Run"**
6. You should see: `Success. No rows returned`

### **Step 5: Verify**

Run this query to verify profiles were created:

```sql
SELECT id, email, full_name, role FROM profiles;
```

You should see:
```
| id      | email                     | full_name    | role     |
|---------|---------------------------|--------------|----------|
| ...     | demo.teacher@yieldx.com   | Demo Teacher | lecturer |
| ...     | demo.student@yieldx.com   | Demo Student | student  |
```

### **Step 6: Test Login**

1. Go back to your YieldX app
2. Refresh the page (Ctrl/Cmd + R)
3. Select **"Lecturer Login"**
4. Enter:
   - **Email:** `demo.teacher@yieldx.com`
   - **Password:** `demo123`
5. Click **"Login"**

✅ **You should now see the teacher dashboard!**

---

## **Troubleshooting**

### **Still see black screen?**

Open browser console (F12) and check for errors. Look for messages like:

```
❌ SUPABASE LOGIN FAILED
⚠️ Profile fetch error
```

If you see `Profile fetch error: Row not found`, it means the profile wasn't created. Repeat Step 4.

### **"Invalid login credentials" error?**

The auth user doesn't exist or password is wrong:
- Make sure you created the auth user in Step 2B
- Make sure **Auto Confirm User** was checked
- Try password `demo123` (case sensitive)

### **"Role mismatch" warning?**

The profile has a different role than selected:
- Check the `role` column in profiles table
- Should be `'lecturer'` for teacher, `'student'` for student

### **Check if profile exists:**

```sql
SELECT * FROM profiles WHERE email = 'demo.teacher@yieldx.com';
```

If this returns no rows, the profile doesn't exist. Repeat Step 4.

### **Check if auth user exists:**

```sql
SELECT * FROM auth.users WHERE email = 'demo.teacher@yieldx.com';
```

If this returns no rows, the auth user doesn't exist. Repeat Step 2B.

---

## **Alternative: Quick Fix Script**

If you want to do everything in one go, run this complete script:

```sql
-- COMPLETE SETUP SCRIPT
-- Only run this AFTER creating auth users in Authentication > Users

-- Get auth user IDs
DO $$
DECLARE
  teacher_id uuid;
  student_id uuid;
BEGIN
  -- Get teacher ID
  SELECT id INTO teacher_id FROM auth.users WHERE email = 'demo.teacher@yieldx.com';
  
  -- Get student ID
  SELECT id INTO student_id FROM auth.users WHERE email = 'demo.student@yieldx.com';
  
  IF teacher_id IS NULL THEN
    RAISE EXCEPTION 'Teacher auth user not found. Create it in Authentication > Users first.';
  END IF;
  
  IF student_id IS NULL THEN
    RAISE EXCEPTION 'Student auth user not found. Create it in Authentication > Users first.';
  END IF;
  
  -- Create profiles
  INSERT INTO profiles (id, email, full_name, role, display_name, subscription_tier, total_xp, current_streak, total_login_days, language, theme, profile_visibility)
  VALUES
    (teacher_id, 'demo.teacher@yieldx.com', 'Demo Teacher', 'lecturer', 'Demo Teacher', 'premium', 0, 0, 1, 'ar', 'dark', 'public'),
    (student_id, 'demo.student@yieldx.com', 'Demo Student', 'student', 'Demo Student', 'free', 2450, 5, 12, 'ar', 'dark', 'public')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  
  RAISE NOTICE 'SUCCESS! Profiles created for both teacher and student.';
END $$;
```

---

## **Success Checklist**

- [ ] Auth user exists for `demo.teacher@yieldx.com`
- [ ] Profile exists in `profiles` table
- [ ] Profile role is `'lecturer'`
- [ ] Login no longer shows black screen
- [ ] Teacher dashboard loads correctly

---

**Once completed, you should be able to login as teacher successfully!** 🎉

**Need more help?** Check browser console (F12) for error messages and share them.
