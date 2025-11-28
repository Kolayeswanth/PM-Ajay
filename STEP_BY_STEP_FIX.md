# Step-by-Step Guide to Fix Fund Allocations Error

## 🎯 Goal
Fix the "new row violates row-level security policy" error

---

## 📋 Step 1: Open Supabase Dashboard

1. Open your web browser (Chrome, Firefox, etc.)
2. Go to: **https://supabase.com/dashboard**
3. **Sign in** to your account if not already logged in

---

## 📋 Step 2: Navigate to Your Project

1. You should see a list of your projects
2. Click on your project: **gwfeaubvzjepmmhxgdvc** (Morning Organization)
   - Or the project you're currently using for PM-AJAY

---

## 📋 Step 3: Open SQL Editor

1. On the left sidebar, look for **"SQL Editor"**
2. Click on **SQL Editor**
3. Click the **"New Query"** button (usually a "+" icon or button at the top)

---

## 📋 Step 4: Copy the Fix SQL Script

1. Go back to VS Code
2. Open the file: `FIX_RLS_POLICIES.sql` (you already have it open!)
3. **Select ALL content** in the file:
   - Press `Ctrl + A` (Windows) or `Cmd + A` (Mac)
4. **Copy it**:
   - Press `Ctrl + C` (Windows) or `Cmd + C` (Mac)

---

## 📋 Step 5: Paste and Run the Script

1. Go back to your **Supabase SQL Editor** browser tab
2. **Paste** the copied SQL script:
   - Press `Ctrl + V` (Windows) or `Cmd + V` (Mac)
3. Review the script (optional - it just updates security policies)
4. Click the **"Run"** button (usually bottom-right corner)
5. Wait for execution to complete (should take 1-2 seconds)

---

## 📋 Step 6: Verify the Fix

1. Look for a **success message** in Supabase SQL Editor:
   - Should say something like "Success. No rows returned"
   - Or show green checkmarks for each policy created

---

## 📋 Step 7: Test Your Application

1. Go back to your application browser tab
2. Go to: **http://localhost:5173/dashboard**
3. Navigate to **Fund Allocation** page
4. Click **"+ Add Allocation"** button
5. Fill in the form:
   - **Allocation Officer ID**: OFF1G
   - **Allocator Name**: Deepika (or any name)
   - **Allocator Role**: State Finance
   - **WhatsApp Number**: 7671918617 (or any 10-digit number)
6. Click **"Sending..."** button
7. **Check for success!** ✅
   - You should see a success notification
   - The allocation should appear in the table

---

## 📋 Step 8: Verify Data in Supabase

1. Go back to **Supabase Dashboard**
2. Click **"Table Editor"** on the left sidebar
3. Click on **"fund_allocations"** table
4. You should see your new fund allocation record!

---

## ✅ Expected Result

After following these steps:
- ✅ No more RLS policy errors
- ✅ Fund allocations can be created successfully
- ✅ Data appears in the dashboard table
- ✅ Data is saved in Supabase database

---

## ❌ If Still Getting Errors

### Check 1: Servers Running?
- Backend server should be running on port **5174**
- Frontend should be running on port **5173**
- You can see both are running in your VS Code terminal

### Check 2: Correct Supabase Project?
- Make sure you're using project: **gwfeaubvzjepmmhxgdvc**
- Check in `src/lib/supabaseClient.js` - line 4 should have this URL

### Check 3: Table Exists?
- Go to Supabase Table Editor
- Verify `fund_allocations` table exists
- If not, run `RECREATE_FUND_ALLOCATIONS.sql` first

---

## 📞 Quick Help

If you see these specific errors:

| Error Message | Solution |
|---------------|----------|
| "Could not find the 'state_code' column" | Run `RECREATE_FUND_ALLOCATIONS.sql` first |
| "new row violates row-level security" | Run `FIX_RLS_POLICIES.sql` (this guide!) |
| "relation fund_allocations does not exist" | Run `RECREATE_FUND_ALLOCATIONS.sql` first |
| "Cannot reach backend" | Check backend server is running |

---

## 🎉 Success!

Once you see the allocation appear in your dashboard, you're all set!
