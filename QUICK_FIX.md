# ⚡ QUICK FIX - Blank Screen Error

## **Problem:**
Blank/white screen after login with error: `relation "profiles" does not exist`

---

## **Solution (5 minutes):**

### **Step 1:** Create Database Tables

1. Go to: https://supabase.com/dashboard/project/hwbpgmbcasgdvhbofauc/sql
2. Click **"New query"**
3. Copy ALL of `/DEPLOY_SCHEMA.sql`
4. Paste and click **"Run"**
5. Wait for ✅ success message

---

### **Step 2:** Create Auth Users

1. Go to: https://supabase.com/dashboard/project/hwbpgmbcasgdvhbofauc/auth/users
2. Click **"Add user"** → **"Create new user"**

**Teacher Account:**
- Email: `demo.teacher@yieldx.com`
- Password: `demo123`
- **✅ CHECK "Auto Confirm User"**
- Click "Create user"

**Student Account:**
- Email: `demo.student@yieldx.com`
- Password: `demo123`
- **✅ CHECK "Auto Confirm User"**
- Click "Create user"

---

### **Step 3:** Create Profiles

1. Go back to SQL Editor
2. Click **"New query"**
3. Copy ALL of `/CREATE_DEMO_ACCOUNTS.sql`
4. Paste and click **"Run"**
5. Should see: `✅ Demo Accounts Setup Complete!`

---

### **Step 4:** Test Login

1. Go to your YieldX app
2. **Refresh page (Ctrl/Cmd + R)**
3. Login with:
   - Email: `demo.teacher@yieldx.com`
   - Password: `demo123`
4. ✅ **Should work now!**

---

## **Still Not Working?**

### **Quick Check:**

Run this in SQL Editor:
```sql
SELECT email, full_name, role FROM profiles;
```

**Should show:**
```
| email                     | full_name    | role     |
|---------------------------|--------------|----------|
| demo.teacher@yieldx.com   | Demo Teacher | lecturer |
| demo.student@yieldx.com   | Demo Student | student  |
| admin@yieldx.com          | System Admin | admin    |
```

**If shows 0 rows:**
- Auth users exist but profiles don't
- Re-run `/CREATE_DEMO_ACCOUNTS.sql`

**If shows error "relation profiles does not exist":**
- Database schema not created
- Re-run `/DEPLOY_SCHEMA.sql`

---

## **Files You Need:**

1. **`/DEPLOY_SCHEMA.sql`** - Creates all database tables
2. **`/CREATE_DEMO_ACCOUNTS.sql`** - Creates demo user profiles

Both files are in your project root folder.

---

## **Login Credentials:**

**Teacher:**
- Email: `demo.teacher@yieldx.com`
- Password: `demo123`

**Student:**
- Email: `demo.student@yieldx.com`
- Password: `demo123`

**Admin:**
- Email: `admin@yieldx.com`
- Password: `admin123`

---

## **That's It!** 🎉

Total time: **5 minutes**

Your YieldX platform should now work perfectly!
