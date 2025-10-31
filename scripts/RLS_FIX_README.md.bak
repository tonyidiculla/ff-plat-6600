# Fix RLS Policies for Role Assignments

## Problem
The `user_to_role_assignment` table has RLS policies that prevent platform admins from viewing all role assignments.

## Solution
Apply proper RLS policies that allow:
1. **Platform Admins** - Can view ALL role assignments
2. **Regular Users** - Can only view their own role assignments

## How to Apply the Fix

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `scripts/fix-rls-policies.sql`
4. Click **Run** to execute

### Option 2: Using the Script (if RPC is available)

```bash
node scripts/apply-rls-fix.js
```

## What the Fix Does

1. **Drops old restrictive policies** that only allowed users to see their own assignments
2. **Creates a helper function** `is_platform_admin()` to check if a user has admin privileges
3. **Creates a new RLS policy** that allows:
   - Platform admins to see ALL role assignments
   - Regular users to see only their own assignments
4. **Enables RLS** on the table
5. **Grants proper permissions** to authenticated users

## The New Policy Logic

```sql
-- Platform admins can see everything
public.is_platform_admin(auth.uid())
OR
-- Regular users see only their own assignments
user_platform_id = (SELECT user_platform_id FROM public.profiles WHERE user_id = auth.uid())
```

## Admin Roles Detected

The following roles are considered "Platform Admin":
- Platform Admin
- Super Admin
- System Admin

## After Applying

1. Refresh your application
2. You should now see all 73 role assignments
3. The direct Supabase query will work without needing the service role key

## Verification

Run this query to verify the policy is working:

```sql
SELECT COUNT(*) FROM public.user_to_role_assignment;
```

If you're a platform admin, you should see 73 records.
