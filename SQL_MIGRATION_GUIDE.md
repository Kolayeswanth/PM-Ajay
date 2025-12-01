# 🔧 Quick Fix - Run This SQL in Supabase

## The Problem
The original SQL had inline CHECK constraints that Supabase didn't like.

## ✅ The Solution
I've fixed the SQL file. Now follow these steps:

---

## 📋 Step-by-Step Instructions

### 1. Open the Fixed SQL File
- File location: `backend/migrations/create_notifications_table.sql`
- The file has been updated and fixed

### 2. Copy the Entire SQL Script
- Select ALL the text in the file (Ctrl+A)
- Copy it (Ctrl+C)

### 3. Go to Supabase Dashboard
1. Open your browser
2. Go to https://supabase.com
3. Login to your project
4. Click on **SQL Editor** in the left sidebar

### 4. Run the SQL
1. Click **"New Query"** button
2. Paste the SQL script (Ctrl+V)
3. Click **"Run"** button (or press Ctrl+Enter)

### 5. Expected Output
You should see:
```
status: "Notifications table created successfully!"
```

### 6. Verify Table Creation
1. Go to **Database** → **Tables** in left sidebar
2. You should see `notifications` table listed
3. Click on it to see the structure

---

## 🎯 What This SQL Does

1. ✅ Drops existing table (if any) for clean install
2. ✅ Creates `notifications` table with all columns
3. ✅ Adds CHECK constraints (ministry/state/district/gp roles)
4. ✅ Creates 6 indexes for performance
5. ✅ Enables Row Level Security (RLS)
6. ✅ Creates 3 security policies
7. ✅ Creates auto-update trigger for `updated_at`
8. ✅ Inserts 1 test notification (for Maharashtra)

---

## ✅ After Running SQL - Test It

### Test 1: Check the table exists
```sql
SELECT * FROM notifications;
```
Should return 1 test notification.

### Test 2: Create a proposal
1. Login as District Admin (Pune)
2. Create a new proposal
3. Check backend console - should see: `✅ Notification created for state: Maharashtra`

### Test 3: Check notification in database
```sql
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;
```
Should show your newly created notification.

### Test 4: Check the bell icon
1. Login as State Admin (Maharashtra)
2. Look at bell icon - should show badge count
3. Click bell - should see notifications

---

## ⚠️ If You Still Get Errors

### Error: "permission denied for schema public"
**Solution:** Make sure you're using the service role key, not anon key. Or run in Supabase SQL Editor (already has permissions).

### Error: "relation already exists"
**Solution:** The script now includes `DROP TABLE IF EXISTS` at the top, so this shouldn't happen. But if it does, run:
```sql
DROP TABLE IF EXISTS public.notifications CASCADE;
```
Then run the full script again.

### Error: "function already exists"
**Solution:** The script handles this with `CREATE OR REPLACE FUNCTION`.

---

## 🎉 Success!

Once you see "Notifications table created successfully!", you're ready to test the notification system!

Go ahead and:
1. Create a proposal as District Admin
2. Login as State Admin
3. See the notification badge! 🔔 (1)

---

**File Updated:** `backend/migrations/create_notifications_table.sql`
**Status:** ✅ READY TO RUN
