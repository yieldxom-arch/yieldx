# 🚀 YieldX Supabase Backend Setup Guide

## **Complete Cloud Integration for Your Platform**

This guide will help you set up the full Supabase backend for YieldX, enabling cloud storage, real-time updates, and multi-device synchronization.

---

## **📋 Prerequisites**

- ✅ Supabase account (free tier available)
- ✅ Supabase project already created (ID: `hwbpgmbcasgdvhbofauc`)
- ✅ YieldX platform code (already configured)

---

## **🔧 Step 1: Set Up Database Schema**

### **1.1 Access Supabase Dashboard**

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `hwbpgmbcasgdvhbofauc`
3. Click on **"SQL Editor"** in the left sidebar

### **1.2 Execute Schema**

1. Click **"New Query"**
2. Copy the entire contents of `/supabase/schema.sql`
3. Paste into the SQL editor
4. Click **"Run"** (or press Ctrl/Cmd + Enter)

**Expected Output:**
```
✅ YieldX Database Schema Created Successfully!
📊 Tables: users, projects, submissions, cohorts, cohort_members, announcements, messages
🔒 Row Level Security (RLS) enabled on all tables
📁 Storage bucket "attachments" created
```

### **1.3 Verify Tables Created**

1. Click **"Table Editor"** in the left sidebar
2. You should see these tables:
   - `users` - User profiles and authentication data
   - `projects` - Student workspaces and business plans
   - `submissions` - Level submissions and grades
   - `cohorts` - Study groups/classes
   - `cohort_members` - Student enrollment
   - `announcements` - Teacher announcements
   - `messages` - Internal messaging system

---

## **🔐 Step 2: Configure Authentication**

### **2.1 Enable Email Authentication**

1. Go to **"Authentication"** → **"Providers"** in Supabase dashboard
2. Enable **Email** provider (should be enabled by default)
3. Configure email settings:
   - ✅ **Confirm email**: OFF (for demo purposes)
   - ✅ **Secure email change**: ON
   - ✅ **Secure password change**: ON

### **2.2 Create Demo Accounts**

You need to create the demo accounts manually in Supabase Auth:

1. Go to **"Authentication"** → **"Users"**
2. Click **"Add user"** → **"Create new user"**

**Create these 3 demo accounts:**

#### **Demo Student Account:**
- **Email:** `demo.student@yieldx.com`
- **Password:** `demo123`
- **Confirm Password:** `demo123`
- **Auto Confirm User:** ✅ YES
- Click "Create user"

#### **Demo Teacher Account:**
- **Email:** `demo.teacher@yieldx.com`
- **Password:** `demo123`
- **Confirm Password:** `demo123`
- **Auto Confirm User:** ✅ YES
- Click "Create user"

#### **Admin Account:**
- **Email:** `admin@yieldx.com`
- **Password:** `admin123`
- **Confirm Password:** `admin123`
- **Auto Confirm User:** ✅ YES
- Click "Create user"

### **2.3 Link Auth Users to Database**

After creating auth users, you need to insert their profiles:

1. Go to **"SQL Editor"**
2. Run this query to get the user IDs:

```sql
-- Get the user IDs from Auth
SELECT id, email FROM auth.users;
```

3. Copy the IDs and update the users table:

```sql
-- Update users table with correct IDs from Auth
-- Replace 'STUDENT_ID', 'TEACHER_ID', 'ADMIN_ID' with actual UUIDs from above query

INSERT INTO users (id, email, name, role, total_xp, current_level) VALUES
  ('STUDENT_ID', 'demo.student@yieldx.com', 'Demo Student', 'student', 2450, 3),
  ('TEACHER_ID', 'demo.teacher@yieldx.com', 'Demo Teacher', 'lecturer', 0, 0),
  ('ADMIN_ID', 'admin@yieldx.com', 'System Admin', 'admin', 0, 0)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role;
```

---

## **📁 Step 3: Configure Storage**

### **3.1 Create Storage Bucket**

The schema should have already created the `attachments` bucket, but verify:

1. Go to **"Storage"** in Supabase dashboard
2. You should see a bucket named **"attachments"**
3. If not, create it:
   - Click **"New bucket"**
   - **Name:** `attachments`
   - **Public:** OFF (private)
   - Click "Create bucket"

### **3.2 Verify Storage Policies**

1. Click on **"attachments"** bucket
2. Go to **"Policies"** tab
3. You should see these policies:
   - ✅ Users can upload own attachments
   - ✅ Users can read own attachments
   - ✅ Users can delete own attachments

---

## **🎯 Step 4: Test the Integration**

### **4.1 Test Authentication**

1. Open your YieldX platform
2. Try logging in with: `demo.student@yieldx.com` / `demo123`
3. Check browser console for Supabase connection logs
4. You should see: ✅ "Supabase client initialized"

### **4.2 Test Database Connection**

Open browser console and run:

```javascript
// Check if user is authenticated
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);

// Try fetching projects
const { data: projects } = await supabase.from('projects').select('*');
console.log('User projects:', projects);
```

### **4.3 Create Test Project**

1. Login as `demo.student@yieldx.com`
2. Create a new project in YieldX
3. Go to Supabase **"Table Editor"** → **"projects"**
4. You should see the new project appear in real-time

---

## **🔒 Step 5: Verify Row Level Security (RLS)**

### **5.1 Test User Isolation**

1. Login as Student A and create a project
2. Logout and login as Student B
3. Student B should NOT see Student A's projects
4. This confirms RLS is working correctly

### **5.2 Test Teacher Access**

1. Login as `demo.teacher@yieldx.com`
2. Create a cohort and get the join code
3. Login as student and join the cohort
4. Teacher should now see student's submissions
5. Student should only see their own data

---

## **📊 Step 6: Migrate Existing Data (Optional)**

If you have data in localStorage, migrate it to Supabase:

### **6.1 Export localStorage Data**

Open browser console and run:

```javascript
// Export all YieldX data
const yieldxData = {
  projects: JSON.parse(localStorage.getItem('yieldx_projects') || '[]'),
  submissions: JSON.parse(localStorage.getItem('yieldx_submissions') || '[]'),
  cohorts: JSON.parse(localStorage.getItem('yieldx_cohorts') || '[]'),
};
console.log('YieldX Data:', yieldxData);
copy(JSON.stringify(yieldxData, null, 2)); // Copies to clipboard
```

### **6.2 Import to Supabase**

1. Go to **"SQL Editor"**
2. Use this template to import data:

```sql
-- Import projects (replace with your actual data)
INSERT INTO projects (user_id, name, description, project_type, level_0_data)
VALUES 
  ('USER_ID', 'My First Project', 'Description here', 'commercial', '{}'::jsonb);

-- Import submissions
INSERT INTO submissions (project_id, user_id, level, status, xp_earned)
VALUES
  ('PROJECT_ID', 'USER_ID', 1, 'completed', 300);
```

---

## **🚀 Step 7: Enable Real-Time Features**

### **7.1 Verify Real-Time is Enabled**

1. Go to **"Database"** → **"Replication"**
2. Make sure these tables have replication enabled:
   - ✅ `projects`
   - ✅ `submissions`
   - ✅ `announcements`
   - ✅ `messages`

### **7.2 Test Real-Time Updates**

1. Open YieldX in two browser windows
2. Login as teacher in one, student in another
3. Teacher posts an announcement
4. Student should see it appear instantly (no refresh needed)

---

## **🌍 Step 8: Deploy to Production**

### **8.1 Environment Variables**

Your Supabase credentials are already configured in:
- `/utils/supabase/info.tsx`

**Current Configuration:**
```javascript
export const projectId = "hwbpgmbcasgdvhbofauc"
export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### **8.2 Vercel Deployment**

When deploying to Vercel, add these environment variables:

1. Go to Vercel project settings
2. Add environment variables:
   - `VITE_SUPABASE_PROJECT_ID` = `hwbpgmbcasgdvhbofauc`
   - `VITE_SUPABASE_ANON_KEY` = `[your anon key]`

### **8.3 Production Checklist**

Before going live:

- [ ] Enable email confirmation for new users
- [ ] Review and test all RLS policies
- [ ] Set up database backups (automatic in Supabase)
- [ ] Configure custom SMTP for emails (optional)
- [ ] Enable 2FA for admin accounts
- [ ] Set up monitoring and alerts
- [ ] Review storage bucket size limits

---

## **🔧 Troubleshooting**

### **Issue: "Failed to connect to Supabase"**

**Solution:**
1. Check if `projectId` and `publicAnonKey` are correct
2. Verify your Supabase project is active
3. Check browser console for specific errors
4. Ensure you're not being blocked by ad blockers

### **Issue: "Row Level Security policy violation"**

**Solution:**
1. Verify user is authenticated: `await supabase.auth.getUser()`
2. Check if RLS policies are correctly set up
3. Ensure user ID matches the data they're trying to access
4. Review policies in Supabase dashboard

### **Issue: "Storage upload failed"**

**Solution:**
1. Verify `attachments` bucket exists
2. Check storage policies allow user uploads
3. Ensure file size is within limits (50MB default)
4. Check user is authenticated before uploading

### **Issue: "Auth user created but profile missing"**

**Solution:**
Run this SQL to sync auth users with profiles:

```sql
-- Sync auth users to profiles table
INSERT INTO users (id, email, name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', 'User'),
  COALESCE(au.raw_user_meta_data->>'role', 'student')
FROM auth.users au
LEFT JOIN users u ON u.id = au.id
WHERE u.id IS NULL;
```

---

## **📚 Additional Resources**

- **Supabase Docs:** https://supabase.com/docs
- **Row Level Security Guide:** https://supabase.com/docs/guides/auth/row-level-security
- **Real-time Subscriptions:** https://supabase.com/docs/guides/realtime
- **Storage Guide:** https://supabase.com/docs/guides/storage

---

## **✅ Verification Checklist**

After setup, verify these work:

- [ ] User registration and login
- [ ] Create, read, update, delete projects
- [ ] Submit assignments and upload files
- [ ] Teacher can view student submissions
- [ ] Cohort creation and student enrollment
- [ ] Announcements appear in real-time
- [ ] Data persists across browser sessions
- [ ] RLS prevents unauthorized access
- [ ] File uploads work correctly
- [ ] Real-time updates propagate instantly

---

## **🎉 Success!**

If all checks pass, your YieldX platform is now fully cloud-enabled with:

- ✅ **Secure Authentication** - Email/password with Supabase Auth
- ✅ **Cloud Database** - PostgreSQL with automatic backups
- ✅ **Real-Time Updates** - Instant synchronization across devices
- ✅ **File Storage** - Secure document uploads
- ✅ **Row Level Security** - Data protection at database level
- ✅ **Scalable Architecture** - Ready for thousands of users

---

**Need Help?**

- Check the troubleshooting section above
- Review Supabase dashboard logs
- Test with demo accounts first
- Verify RLS policies are correct

**Your YieldX platform is now production-ready!** 🚀
