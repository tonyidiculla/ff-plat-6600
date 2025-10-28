# Pet Ownership Model - Clarification

## 🐾 Ownership Structure

**IMPORTANT**: Pets are linked to **USERS**, not organizations!

```
User (profiles.platform_id: "H00000001")
  └── Pet (pets.user_platform_id: "H00000001")
```

## 🔗 Database Relationships

### Pets Table
- `pets.user_platform_id` = `profiles.user_platform_id`
- This establishes direct pet ownership by the user
- Users can have multiple pets
- Pets belong to individual users, not organizations

### Example Pet Record
```
Name: Giorno
Pet Platform ID: A01X308UV
User Platform ID: H00000001 ← Matches owner's user_platform_id in profiles
Species: Canine
Breed: Golden Retriever
```

## 🔒 Updated RLS Policies

### ✅ CORRECT Approach (User-based)
```sql
CREATE POLICY "Users can view their own pets"
  ON public.pets
  FOR SELECT
  TO authenticated
  USING (
    user_platform_id IN (
      SELECT user_platform_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );
```

### ❌ INCORRECT Approach (Organization-based)
```sql
-- DON'T USE THIS!
CREATE POLICY "Users can view pets in their organization"
  ON public.pets
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (...)  -- Wrong! Pets don't have organization_id
  );
```

## 📋 Policy Summary

### 1. Service Role
- Full access to all pets (bypasses RLS)

### 2. Pet Owners (Regular Users)
- Can SELECT their own pets (user_platform_id match)
- Can INSERT pets for themselves
- Can UPDATE their own pets
- Can DELETE their own pets

### 3. Platform Admins
- Can view all pets from all users
- Can manage pets for any user
- Cross-user access for support/admin purposes

## 💡 Implementation Notes

### Frontend: Creating a Pet
```typescript
// Step 1: Get user's user_platform_id
const { data: profile } = await supabase
  .from('profiles')
  .select('user_platform_id')
  .eq('id', user.id)
  .single();

// Step 2: Create pet with user's user_platform_id
const { data: newPet, error } = await supabase
  .from('pets')
  .insert({
    name: 'Max',
    species: 'canine',
    breed: 'Golden Retriever',
    user_platform_id: profile.user_platform_id, // Critical!
    age: 5,
    weight: 32,
    // ... other fields
  })
  .select()
  .single();
```

### Frontend: Fetching User's Pets
```typescript
// RLS automatically filters to user's pets
const { data: myPets, error } = await supabase
  .from('pets')
  .select('*')
  .order('created_at', { ascending: false });

// Returns only pets where user_platform_id matches authenticated user
```

## 🏥 Organization Context

While pets are owned by **users**, those users may be associated with organizations (hospitals, clinics, etc.) through the profiles table:

```
Organization (e.g., "Happy Paws Hospital")
  └── User (Veterinarian/Staff)
      └── Patient Pets
```

But the **direct ownership** is at the user level, not organization level.

## ⚙️ RLS Dependencies

Required table structure:
- `public.profiles.user_platform_id` - User's unique platform ID
- `public.pets.user_platform_id` - Pet owner's platform ID (matches profiles)
- `public.user_to_role_assignment` - For admin role checks
- `public.platform_roles` - Role definitions

## 🔧 Migration Files

Updated files with correct ownership model:
1. `/supabase/migrations/pets_rls_policies.sql` - RLS policies
2. `/docs/PETS_TABLE_RLS_SETUP.md` - Setup documentation

---

**Key Takeaway**: Always use `user_platform_id` for pet ownership, NOT `organization_id`!
