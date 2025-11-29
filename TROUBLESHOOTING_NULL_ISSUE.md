# 🔧 TROUBLESHOOTING: Null Values Issue

## Problem
When adding data through the form, it's showing as NULL in the table.

## Root Cause
The Supabase table structure doesn't match the backend/frontend code.

**Backend/Frontend expects:**
- `admin_name` column
- `state_name` column

**Supabase table probably has:**
- `name` column (old structure)

---

## ✅ SOLUTION

### Step 1: Run SQL in Supabase

Go to Supabase → SQL Editor → New Query → Paste this:

```sql
-- Add new columns
ALTER TABLE state_assignment 
ADD COLUMN IF NOT EXISTS admin_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS state_name VARCHAR(255);

-- Drop old 'name' column
ALTER TABLE state_assignment DROP COLUMN IF EXISTS name;

-- Verify structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'state_assignment'
ORDER BY ordinal_position;
```

### Step 2: Check the Result

You should see these columns:
- ✅ id
- ✅ admin_name
- ✅ state_name
- ✅ phone_no
- ✅ email
- ✅ bank_account_number
- ✅ status
- ✅ created_at
- ✅ updated_at

### Step 3: Test Adding Data

Try adding a new state admin through the form:
- Name: "Rajesh Kumar"
- State Name: "Maharashtra"
- Email: "test@example.com"
- Phone: "9876543210"
- Bank Account: "1234567890"

---

## 🚨 Quick Fix (If Above Doesn't Work)

### Option: Recreate Table (DELETES ALL DATA)

```sql
DROP TABLE IF EXISTS state_assignment CASCADE;

CREATE TABLE state_assignment (
    id BIGSERIAL PRIMARY KEY,
    admin_name VARCHAR(255) NOT NULL,
    state_name VARCHAR(255) NOT NULL,
    phone_no VARCHAR(15) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    bank_account_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔍 How to Check Current Table Structure

Run this in Supabase SQL Editor:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'state_assignment'
ORDER BY ordinal_position;
```

This will show you exactly what columns exist in your table.

---

## 📝 What the Backend Sends

When you submit the form, the backend sends:

```json
{
  "admin_name": "Rajesh Kumar",
  "state_name": "Maharashtra",
  "phone_no": "9876543210",
  "email": "test@example.com",
  "bank_account_number": "1234567890"
}
```

If your table has `name` instead of `admin_name` and `state_name`, it will insert NULL values.

---

## ✅ After Running SQL

1. Refresh your dashboard
2. Try adding a new admin
3. It should work correctly!

---

## 🆘 Still Not Working?

Check the backend console for errors:
- Look at the terminal where `npm run dev` is running (backend)
- You should see any Supabase errors there

Or share the error message and I'll help fix it! 🚀
