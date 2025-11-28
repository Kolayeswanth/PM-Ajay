# Fund Allocations Error Resolution Guide

## Error History & Solutions

### Error 1: "Could not find the 'state_code' column" ✅ FIXED
**Cause**: Database table schema didn't match backend expectations

**Solution**: Recreated table with correct schema using `RECREATE_FUND_ALLOCATIONS.sql`

---

### Error 2: "new row violates row-level security policy" 🔧 FIX NEEDED

**Cause**: RLS policies only allow authenticated users, but frontend uses anonymous (anon) key

**Solution**: Update RLS policies to allow anonymous users

#### Quick Fix Option 1: Run SQL Script (Recommended)

1. Open **Supabase Dashboard** → **SQL Editor**
2. Open the file `FIX_RLS_POLICIES.sql` 
3. Copy all contents
4. Paste in SQL Editor
5. Click **Run**

#### Quick Fix Option 2: Disable RLS (For Testing Only)

1. Go to **Supabase Dashboard** → **Table Editor**
2. Click on `fund_allocations` table
3. Find the RLS toggle (shield icon)
4. Turn **OFF** RLS

⚠️ **Note**: Option 2 is less secure and should only be used for testing.

---

## Verification Steps

After applying the fix:

1. ✅ Refresh your application page
2. ✅ Try creating a fund allocation again
3. ✅ Check Supabase Table Editor to verify the data was inserted

---

## Understanding the Issue

### Row Level Security (RLS)

Supabase uses RLS to control who can access data. There are two types of clients:

1. **Authenticated users**: Users who have logged in with email/password
2. **Anonymous (anon) users**: Users accessing via the public anon key

Your frontend uses the **anon key**, so the policies must allow anonymous access.

### Current Policy Issue

Old policies:
```sql
TO authenticated  ← Only logged-in users
```

New policies:
```sql
USING (true)  ← All users (authenticated + anon)
```

---

## Files Changed

1. ✅ `backend/controllers/fundController.js` - Fixed column name references
2. ✅ `RECREATE_FUND_ALLOCATIONS.sql` - Recreate table with correct schema
3. 🔧 `FIX_RLS_POLICIES.sql` - Fix RLS policies (NEEDS TO BE RUN)

---

## Next Steps

1. Run `FIX_RLS_POLICIES.sql` in Supabase
2. Test fund allocation creation
3. If still issues, check:
   - Backend server is running (`npm run dev` in backend folder)
   - Frontend is running (`npm run dev` in root folder)
   - Correct Supabase URL and anon key in `.env` files
