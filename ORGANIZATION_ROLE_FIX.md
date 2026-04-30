# Organization Role Fix - Complete Solution ✅

## Problem
The database was rejecting user registration with the `organization` role because the `profiles` table check constraint only allowed 3 roles: `student`, `lecturer`, and `admin`.

### Error Message
```
❌ create-profile error: new row for relation "profiles" violates check constraint "profiles_role_check"
```

## Root Cause
**Mismatch between TypeScript and Database:**
- **TypeScript (YieldXContext.tsx):** `UserRole = 'lecturer' | 'student' | 'admin' | 'organization'` ✅ (4 roles)
- **Database (profiles table):** `CHECK (role IN ('student', 'lecturer', 'admin'))` ❌ (3 roles)

## Solution Applied

### 1. Fixed Code Files
Updated the database schema files to include the `organization` role:
- ✅ `/DEPLOY_SCHEMA.sql` - Updated profiles table constraint
- ✅ `/supabase/schema.sql` - Updated users table constraint

### 2. Database Migration Required
**YOU MUST RUN THIS SQL in your Supabase SQL Editor:**

```sql
-- Drop the old constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add the new constraint with 'organization' role
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('student', 'lecturer', 'admin', 'organization'));
```

📁 **Pre-made migration file:** `/FIX_ORGANIZATION_ROLE.sql`

## How to Apply the Fix

### Step 1: Open Supabase Dashboard
1. Go to: https://hwbpgmbcasgdvhbofauc.supabase.co
2. Navigate to **SQL Editor**

### Step 2: Run the Migration
Copy and paste the contents of `/FIX_ORGANIZATION_ROLE.sql` into the SQL Editor and execute it.

OR manually run:
```sql
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('student', 'lecturer', 'admin', 'organization'));
```

### Step 3: Verify
Run this query to verify the constraint was updated:
```sql
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'profiles_role_check';
```

You should see:
```
CHECK (role IN ('student', 'lecturer', 'admin', 'organization'))
```

### Step 4: Test
Try registering a new organization account. It should work now! 🎉

## Summary
✅ **Code Fixed** - Schema files updated
⏳ **Database Migration Required** - Run the SQL migration
✅ **Organization Registration** - Will work after migration

---

**Note:** This is a one-time migration. All future deployments will use the updated schema with 4 roles.
