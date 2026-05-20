# 🔧 Organization Role Migration - COMPLETE GUIDE

## 🚨 Problem
You're seeing this error when trying to register organization accounts:
```
❌ create-profile error: new row for relation "profiles" violates check constraint "profiles_role_check"
```

## 🎯 Solution Overview
The database constraint needs to be updated to allow the `organization` role. I've implemented **THREE** automatic solutions:

---

## ✅ SOLUTION 1: Auto-Migration on Server Startup (RECOMMENDED)

The server now automatically attempts to fix the constraint when it starts.

### How to trigger:
1. **Save any file** in the project (this will trigger a server restart)
2. Check the **server logs** in Supabase for:
   ```
   ✅ Migration completed: organization role constraint updated
   ```

If you see this message, the migration worked! Try registering an organization account.

---

## ✅ SOLUTION 2: Click the Migration Button (EASIEST)

A yellow migration button now appears in the **bottom-right corner** of your app.

### Steps:
1. Open your YieldX app in the browser
2. Look for the **yellow warning box** in the bottom-right corner
3. Click **"🔧 Run Migration Now"** button
4. Wait for the success message: **"✅ Migration successful!"**
5. Try registering an organization account

**Screenshot of what to look for:**
```
┌─────────────────────────────────────┐
│ ⚠️ Database Migration Required      │
│                                     │
│ Organization role constraint needs  │
│ to be updated. Click below to fix.  │
│                                     │
│ [ 🔧 Run Migration Now ]            │
└─────────────────────────────────────┘
```

---

## ✅ SOLUTION 3: Browser Console Command

Open your browser's **Developer Console** and run:

```javascript
runOrganizationRoleMigration()
```

This will execute the migration and show the result.

---

## ✅ SOLUTION 4: Manual SQL (For Advanced Users)

If all automatic methods fail, run this SQL in your **Supabase SQL Editor**:

```sql
-- Drop old constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint with organization role
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('student', 'lecturer', 'admin', 'organization'));
```

### How to run:
1. Go to: https://hwbpgmbcasgdvhbofauc.supabase.co
2. Navigate to **SQL Editor** (left sidebar)
3. Paste the SQL above
4. Click **Run** (or press Ctrl+Enter)
5. Verify you see: **Success. No rows returned**

---

## 🔍 How to Verify Migration Worked

Run this verification query in Supabase SQL Editor:

```sql
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'profiles_role_check';
```

**Expected result:**
```
profiles_role_check | CHECK (role IN ('student', 'lecturer', 'admin', 'organization'))
```

---

## ✨ What Each Solution Does

All solutions perform the same database update:
- **Remove** the old constraint that only allowed 3 roles
- **Add** a new constraint that allows 4 roles (including 'organization')

---

## 🎯 After Migration Success

1. **Test**: Try registering an organization account
2. **Clean Up**: Remove the MigrationButton component from App.tsx (optional)
3. **Confirm**: Check that organization accounts can log in and access OrganizationDashboard

---

## 🐛 Troubleshooting

### Migration button doesn't appear
- Check if MigrationButton is imported in `/src/app/App.tsx`
- Look at browser console for any errors

### "SUPABASE_DB_URL not configured" error
- This means automatic migration can't run
- Use **SOLUTION 4** (Manual SQL) instead

### "Migration error: constraint may already exist"
- This is OK! It means migration already ran successfully
- Try registering an organization account

### Still getting the same error after migration
- Verify the constraint was updated (see verification query above)
- Check server logs for migration success message
- Clear browser cache and try again

---

## 📁 Files Modified

- ✅ `/supabase/functions/server/index.tsx` - Added auto-migration and endpoint
- ✅ `/src/utils/runMigration.ts` - Migration utility function
- ✅ `/src/app/components/admin/MigrationButton.tsx` - UI component
- ✅ `/src/app/App.tsx` - Added MigrationButton
- ✅ `/DEPLOY_SCHEMA.sql` - Updated schema
- ✅ `/supabase/schema.sql` - Updated schema

---

## 🎉 Success Criteria

You'll know the migration worked when:
1. ✅ No more "violates check constraint" errors
2. ✅ Organization accounts can be created
3. ✅ Organization users can log in
4. ✅ OrganizationDashboard loads correctly

---

**Need Help?** Check the server logs in Supabase Edge Functions for detailed error messages.
