# 🚀 Quick Start: Fix Organization Role Error

## 🎯 The Problem
```
❌ create-profile error: new row for relation "profiles" violates check constraint "profiles_role_check"
```

## ✅ The Solution (Pick ONE)

### Option 1: Click the Yellow Button (EASIEST) 👈 **RECOMMENDED**
1. Open your YieldX app
2. Look for the **yellow warning box** in bottom-right corner
3. Click **"Run Migration Now"**
4. Done! ✅

### Option 2: Browser Console
```javascript
runOrganizationRoleMigration()
```

### Option 3: Supabase SQL Editor
```sql
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('student', 'lecturer', 'admin', 'organization'));
```

---

## 🎉 After Migration
- Try registering an organization account
- Should work perfectly now!

---

## 📖 Full Documentation
See `/MIGRATION_INSTRUCTIONS.md` for complete details.

## ⚠️ Note
The migration only needs to run ONCE. After it succeeds, all organization registrations will work.
