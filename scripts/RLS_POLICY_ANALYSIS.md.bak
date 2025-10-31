# RLS Policy Analysis - user_to_role_assignment

## 🔍 Current Issues

### ❌ Issue 1: SELECT Policy Applied to "public"
**Current:** `Allow platform admins to view all role assignments - SELECT - public`

**Problem:** 
- The policy is applied to the `public` role
- This means **unauthenticated users** could potentially query this table
- **Security Risk:** Exposes role assignments to anyone

**Should be:** 
- Applied to `authenticated` role only
- Only logged-in users should access this data

---

### ⚠️ Issue 2: Missing DELETE Policy
**Current Policies:**
- ✅ SELECT (but wrong role)
- ✅ INSERT  
- ✅ UPDATE
- ❌ **DELETE is missing**

**Problem:**
- Platform admins cannot delete role assignments
- Cannot remove users from roles via the admin portal

**Should have:**
- DELETE policy for platform admins

---

### ⚠️ Issue 3: Unclear Policy Logic
**Need to verify:**
- Do the INSERT/UPDATE policies check `is_platform_admin()`?
- Or do they allow any authenticated user to modify?

Without seeing the actual `qual` and `with_check` conditions, we can't be sure the logic is correct.

---

## ✅ Recommended Fix

Run the corrected SQL script: `scripts/fix-rls-policies-corrected.sql`

### What the Fix Does:

1. **Drops all existing policies** (clean slate)

2. **Recreates the helper function** with `STABLE` flag for better performance

3. **Creates 4 comprehensive policies:**

   **SELECT Policy:**
   ```sql
   - Platform admins → See ALL role assignments
   - Regular users → See only THEIR OWN assignments
   - Applied to: authenticated (not public!)
   ```

   **INSERT Policy:**
   ```sql
   - Only platform admins can insert
   - Applied to: authenticated
   ```

   **UPDATE Policy:**
   ```sql
   - Only platform admins can update
   - Applied to: authenticated
   ```

   **DELETE Policy:**
   ```sql
   - Only platform admins can delete
   - Applied to: authenticated
   ```

4. **Grants proper permissions** to authenticated role

5. **Includes verification query** to check the policies

---

## 🎯 Expected Result After Fix

| Policy Name | Command | Applied To | Logic |
|------------|---------|------------|-------|
| Allow platform admins and users to view role assignments | SELECT | authenticated | Admin: all, User: own |
| Platform admins can insert role assignments | INSERT | authenticated | Admin only |
| Platform admins can update role assignments | UPDATE | authenticated | Admin only |
| Platform admins can delete role assignments | DELETE | authenticated | Admin only |

---

## 🚀 How to Apply

1. **Open Supabase Dashboard** → SQL Editor
2. **Copy** the contents of `scripts/fix-rls-policies-corrected.sql`
3. **Paste** and click **Run**
4. **Refresh** your application

---

## ✅ How to Verify

After applying, run this query:

```sql
SELECT COUNT(*) FROM public.user_to_role_assignment;
```

**As Platform Admin:** Should return **73**  
**As Regular User:** Should return **2** (or however many roles they have)

---

## 🔒 Security Benefits

- ✅ No public access to role assignments
- ✅ Authenticated users only
- ✅ Platform admins have full CRUD access
- ✅ Regular users can only view their own roles
- ✅ Follows principle of least privilege
- ✅ No service role key bypass needed
