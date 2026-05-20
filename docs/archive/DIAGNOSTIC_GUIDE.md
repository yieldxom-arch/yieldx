# 🔍 Migration Error Diagnostic Guide

## Understanding the Errors

### Error 1: "constraint already exists"
```
❌ Migration failed: SQL error: constraint "profiles_role_check" for relation "profiles" already exists
```

**What this means:** The constraint exists but the migration tried to add it again.

**Why it happens:** The DROP CONSTRAINT didn't execute properly before ADD CONSTRAINT.

**Status:** ✅ FIXED - Migration now checks if constraint exists and has 'organization' before trying to modify.

---

### Error 2: "constraint does not exist, skipping"
```
NOTICE: constraint "profiles_role_check" of relation "profiles" does not exist, skipping
```

**What this means:** When trying to DROP the constraint, it wasn't found.

**Why it happens:** Constraint may have already been dropped or never existed.

**Status:** ✅ This is just a NOTICE, not an error - it's expected behavior for IF EXISTS.

---

## ✅ New Migration Logic (FIXED)

The migration now follows this improved flow:

1. **CHECK** - Query current constraint definition
2. **VERIFY** - Check if it already includes 'organization'
3. **SKIP** - If already correct, return success without changes
4. **UPDATE** - If needs update, use transaction:
   - BEGIN TRANSACTION
   - DROP old constraint
   - ADD new constraint with 'organization'
   - COMMIT TRANSACTION
5. **ROLLBACK** - If any error, rollback changes

---

## 🧪 How to Verify Current State

### Method 1: Use the Check Endpoint

Open browser console (F12) and run:
```javascript
async function checkStatus() {
  const { projectId, publicAnonKey } = await import('/utils/supabase/info');
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-a05faef1/check-migration`,
    { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
  );
  const result = await response.json();
  console.log('Migration Status:', result);
  return result;
}

checkStatus();
```

**Expected response if already fixed:**
```json
{
  "exists": true,
  "hasOrganization": true,
  "definition": "CHECK (role IN ('student', 'lecturer', 'admin', 'organization'))",
  "message": "✅ Constraint is correct - organization role allowed!",
  "status": "ok"
}
```

**Expected response if needs migration:**
```json
{
  "exists": true,
  "hasOrganization": false,
  "definition": "CHECK (role IN ('student', 'lecturer', 'admin'))",
  "message": "⚠️ Constraint exists but missing organization role - migration needed!",
  "status": "needs_migration"
}
```

---

### Method 2: Query Directly in SQL Editor

Go to Supabase SQL Editor and run:
```sql
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'profiles_role_check'
AND conrelid = 'profiles'::regclass;
```

**If migration is needed, you'll see:**
```
profiles_role_check | CHECK ((role = ANY (ARRAY['student'::text, 'lecturer'::text, 'admin'::text])))
```
❌ Missing 'organization'

**If migration succeeded, you'll see:**
```
profiles_role_check | CHECK ((role = ANY (ARRAY['student'::text, 'lecturer'::text, 'admin'::text, 'organization'::text])))
```
✅ Includes 'organization'

---

## 🔧 How to Fix Now

### Option 1: Improved Migration Button
The button now:
- ✅ Checks status before showing
- ✅ Only shows if migration needed
- ✅ Hides automatically if already correct
- ✅ Uses transaction-safe migration

Just click it if it appears!

---

### Option 2: Run Improved SQL Script
The SQL file (`/FIX_ORGANIZATION_ROLE.sql`) now:
- ✅ Checks if update is needed first
- ✅ Only modifies if necessary
- ✅ Shows friendly NOTICE messages
- ✅ Safe to run multiple times

---

### Option 3: Console Command
```javascript
runOrganizationRoleMigration()
```

This now:
- ✅ Checks status first
- ✅ Skips if already correct
- ✅ Shows helpful messages
- ✅ Handles "already exists" gracefully

---

## 🐛 Troubleshooting Specific Issues

### Issue: "Transaction is already in progress"
**Cause:** Previous transaction didn't close properly  
**Fix:** The new code uses explicit BEGIN/COMMIT and ROLLBACK on errors

---

### Issue: Migration says "success" but org registration still fails
**Steps:**
1. Check actual constraint with SQL query above
2. Verify it includes 'organization'
3. Check server logs for registration error details
4. Try re-running migration with new logic

---

### Issue: Can't connect to database
**Cause:** SUPABASE_DB_URL not configured  
**Fix:** Use the SQL Editor method instead (most reliable)

---

## ✅ Test After Migration

### Quick Test:
1. Try registering an organization account
2. Should complete without "profiles_role_check" error

### Full Test:
1. Register organization account
2. Verify email (if configured)
3. Log in with organization credentials
4. Confirm OrganizationDashboard loads
5. Check all 4 tabs work

---

## 📊 Migration Status Workflow

```
START
  ↓
Check Migration Status (/check-migration endpoint)
  ↓
┌─────────────────────┬────────────────────┐
│ hasOrganization:    │ hasOrganization:   │
│ true                │ false              │
├─────────────────────┼────────────────────┤
│ ✅ Already Fixed    │ ⚠️ Needs Migration │
│ Do Nothing          │ Run Migration      │
│ Hide Button         │ Show Button        │
└─────────────────────┴────────────────────┘
  ↓
Run Migration (/run-migration endpoint)
  ↓
Check if already correct
  ↓
┌─────────────────────┬────────────────────┐
│ Already includes    │ Needs update       │
│ 'organization'      │                    │
├─────────────────────┼────────────────────┤
│ Return success      │ BEGIN TRANSACTION  │
│ No changes made     │ DROP old           │
│                     │ ADD new            │
│                     │ COMMIT             │
└─────────────────────┴────────────────────┘
  ↓
SUCCESS
```

---

## 🎯 Expected Behavior Now

1. **Yellow button appears** → Migration needed
2. **Click button** → Checks status first
3. **If already correct** → Shows success, hides button
4. **If needs update** → Runs transaction-safe migration
5. **Success** → Button hides, org registration works

---

## 🔍 Debug Commands

Add these to browser console for debugging:

```javascript
// Check migration status
checkMigrationStatus()

// Run migration
runOrganizationRoleMigration()

// Full diagnostic
async function diagnose() {
  console.log('=== MIGRATION DIAGNOSTIC ===');
  const status = await checkMigrationStatus();
  console.log('Status:', status);
  if (!status.hasOrganization) {
    console.log('⚠️ Migration needed!');
    const result = await runOrganizationRoleMigration();
    console.log('Migration result:', result);
  } else {
    console.log('✅ Already fixed!');
  }
}

diagnose()
```

---

**Status:** ✅ All migration logic improved and made idempotent!
