# RLS Policy Fix - No Recursion Issue

## 🔴 The Problem

The previous RLS policy had a **recursive dependency**:
- RLS policy calls `is_platform_admin()` function
- That function queries `user_to_role_assignment` table
- But that table has RLS enabled
- Which calls `is_platform_admin()` again... 
- **= Infinite loop / No data returned**

## ✅ The Solution

Use a **whitelist approach** that doesn't query the same table.

### Two SQL Scripts Available:

---

## 📄 Option 1: Quick Fix (Recommended for now)
**File:** `scripts/fix-rls-no-recursion.sql`

**What it does:**
- Temporarily allows ALL authenticated users to SELECT all role assignments
- Restricts INSERT/UPDATE/DELETE to specific admin user_platform_ids only
- Simple, no recursion, works immediately

**Pros:**
- ✅ Works immediately
- ✅ No recursion issues
- ✅ Easy to understand

**Cons:**
- ⚠️ All logged-in users can see all role assignments (not ideal for production)
- Need to manually add admin user_platform_ids to the policy

---

## 📄 Option 2: Best Practice (Recommended for production)
**File:** `scripts/fix-rls-best-practice.sql`

**What it does:**
- Uses a whitelist function that checks `profiles` table only
- Admins (in whitelist) see all assignments
- Regular users see only their own assignments
- No recursion because it doesn't query `user_to_role_assignment`

**Pros:**
- ✅ Proper security (users only see their own data)
- ✅ No recursion
- ✅ Scalable (maintain admin list in one place)

**Cons:**
- Need to maintain the admin whitelist in the function

---

## 🚀 Quick Start - Apply Option 2

1. **Open** `scripts/fix-rls-best-practice.sql`

2. **Update the admin whitelist** around line 40:
   ```sql
   AND p.user_platform_id IN (
     'H00000001',  -- Tony
     'H003mw6l9',  -- Test Manager
     -- Add more admin user_platform_ids here
   )
   ```

3. **Copy the entire file** and run in Supabase SQL Editor

4. **Refresh your app** - you should now see all 73 role assignments!

---

## 🧪 Verify It Works

After applying, check the console. You should see:

```
✅ Found 73 role assignments
📋 Sample assignments: [...]
```

---

## 📝 Notes

**Current admin users in whitelist:**
- `H00000001` - Tony (you)
- `H003mw6l9` - Test Manager

**To add more admins later:**
Just update the `is_admin_user()` function in Supabase SQL Editor.

**Alternative approach for later:**
Create a separate `admin_users` table to manage the whitelist dynamically instead of hardcoding in the function.
