# ✅ Organization Role Migration - Testing Checklist

## 🎯 What to Test

### Pre-Migration Tests
- [ ] Open YieldX app in browser
- [ ] See yellow migration button in bottom-right corner
- [ ] Button shows "Database Migration Required" message
- [ ] X button visible to dismiss the notification

### Migration Test - Method 1 (UI Button)
- [ ] Click "🔧 Run Migration Now" button
- [ ] Button shows "⏳ Running Migration..." while processing
- [ ] Success message appears: "✅ Migration successful!"
- [ ] Button changes to green: "✅ Migration Complete!"
- [ ] Success message says: "🎉 You can now register organization accounts!"

### Migration Test - Method 2 (Console)
- [ ] Press F12 to open Developer Console
- [ ] Type: `runOrganizationRoleMigration()`
- [ ] Press Enter
- [ ] Console shows: "🔧 Running migration to fix organization role constraint..."
- [ ] Console shows: "✅ Migration successful: ..."
- [ ] Alert popup shows: "✅ Migration successful! You can now register organization accounts."

### Migration Test - Method 3 (SQL Editor)
- [ ] Open Supabase Dashboard: https://hwbpgmbcasgdvhbofauc.supabase.co
- [ ] Navigate to SQL Editor
- [ ] Copy SQL from `/FIX_ORGANIZATION_ROLE.sql`
- [ ] Paste into SQL Editor
- [ ] Click Run (or Ctrl+Enter)
- [ ] Result shows: "Success. No rows returned"

### Verification Test
- [ ] Run verification query in SQL Editor:
```sql
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'profiles_role_check';
```
- [ ] Result shows: `CHECK (role IN ('student', 'lecturer', 'admin', 'organization'))`
- [ ] Confirms 'organization' is now included

### Post-Migration Tests - Organization Registration
- [ ] Navigate to registration page
- [ ] Select "Organization" role
- [ ] Fill in registration form:
  - Full Name: "Test Organization"
  - Email: "test.org@example.com"
  - Password: (secure password)
- [ ] Click "Register" or "Sign Up"
- [ ] NO ERROR: ~~"profiles_role_check" violation~~
- [ ] Success: Email confirmation screen appears
- [ ] Check email for confirmation link (if email configured)

### Post-Migration Tests - Organization Login
- [ ] Go to login page
- [ ] Enter organization credentials
- [ ] Click "Sign In"
- [ ] Success: Redirected to OrganizationDashboard
- [ ] OrganizationDashboard loads correctly
- [ ] All 4 tabs visible: Members, Projects, Cohorts, Statistics
- [ ] No console errors

### Server Logs Check
- [ ] Open Supabase Dashboard
- [ ] Navigate to Edge Functions
- [ ] Select "make-server-a05faef1" function
- [ ] Check logs for:
  - [ ] "🔧 Running auto-migration: Updating profiles role constraint..."
  - [ ] "✅ Migration completed: organization role constraint updated"
  - [ ] NO ERROR: ~~"profiles_role_check" errors~~

### Clean Up (Optional)
- [ ] Migration successful and tested
- [ ] Remove MigrationButton from `/src/app/App.tsx` if desired
- [ ] Remove import of MigrationButton
- [ ] Keep documentation files for future reference

---

## 🐛 Error Scenarios to Test

### Test: Migration Already Run
- [ ] Run migration again after successful migration
- [ ] Should succeed with message like "constraint already exists" or similar
- [ ] Should not cause any errors

### Test: Network Failure
- [ ] Disconnect internet
- [ ] Try to run migration via button
- [ ] Should show error: "Migration request failed: ..."
- [ ] Reconnect and try again

### Test: Wrong Role Attempt (After Migration)
- [ ] Try to register with invalid role (if possible)
- [ ] Should be prevented by frontend validation
- [ ] If reaches backend, should be rejected properly

---

## ✅ Success Criteria Summary

**All these should be TRUE after migration:**

1. ✅ Yellow migration button visible in app
2. ✅ Migration can be triggered via button OR console OR SQL
3. ✅ Migration succeeds without errors
4. ✅ Database constraint includes 'organization' role
5. ✅ Organization accounts can be registered
6. ✅ Organization accounts can log in
7. ✅ OrganizationDashboard loads correctly
8. ✅ No "profiles_role_check" errors in logs
9. ✅ Server logs show migration success
10. ✅ Normal/Pro/Organization routing works

---

## 📊 Test Results Template

```
DATE: _______________
TESTER: _______________

Migration Method Used: [ ] UI Button  [ ] Console  [ ] SQL Editor

RESULTS:
✅ / ❌  Pre-migration checks
✅ / ❌  Migration executed successfully
✅ / ❌  Database constraint updated
✅ / ❌  Organization registration works
✅ / ❌  Organization login works
✅ / ❌  OrganizationDashboard loads
✅ / ❌  No errors in logs

NOTES:
_________________________________________________
_________________________________________________
_________________________________________________

OVERALL STATUS: [ ] PASS  [ ] FAIL
```

---

## 🚀 Quick Test (1 Minute)

If short on time, do this minimal test:

1. ✅ Click yellow migration button in app
2. ✅ Wait for success message
3. ✅ Try registering organization account
4. ✅ Confirm no "profiles_role_check" error

If all pass = Migration successful! 🎉
