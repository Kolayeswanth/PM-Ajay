# Fix for Fund Allocations Error

## Problem
The error "Could not find the 'state_code' column of 'fund_allocations' in the schema cache" occurred because:

1. The `fund_allocations` table in your Supabase database doesn't have the correct schema
2. The backend code was using column names that don't match the database

## What Was Fixed

### 1. Backend Controller Updates (`backend/controllers/fundController.js`)
- Changed `component` → `scheme_components` (to match database schema)
- Changed `amount` → `amount_allocated` (to match database schema)
- Ensured `state_code` is properly used

### 2. Database Schema
Created a new SQL script to recreate the table with the correct schema.

## Steps to Fix

### Step 1: Run the SQL Script in Supabase

1. Open your Supabase Dashboard
2. Go to the **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the contents of `RECREATE_FUND_ALLOCATIONS.sql`
5. Click **Run** to execute the script

This will:
- Drop the existing `fund_allocations` table (it's empty anyway)
- Create a new table with the correct columns:
  - `id` (UUID, primary key)
  - `state_name` (text)
  - `state_code` (text) ← **This was missing!**
  - `scheme_components` (text array) ← **Was incorrectly named**
  - `amount_allocated` (bigint) ← **Column name fixed**
  - `amount_released` (bigint)
  - `allocation_date` (date)
  - `officer_id` (text)
  - `allocator_name` (text)
  - `allocator_role` (text)
  - `allocator_phone` (text)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

### Step 2: Restart Your Backend Server

1. Stop your backend server (Ctrl+C in the terminal where it's running)
2. Start it again:
   ```bash
   cd backend
   node server.js
   ```

### Step 3: Test the Application

1. Open your application at `localhost:5174/dashboard`
2. Try creating a new fund allocation
3. The error should be gone!

## Column Name Mapping

| Frontend/API | Database Column      |
|--------------|---------------------|
| stateName    | state_name          |
| -            | state_code          |
| component    | scheme_components   |
| amount       | amount_allocated    |
| -            | amount_released     |
| date         | allocation_date     |
| officerId    | officer_id          |
| allocatorName| allocator_name      |
| allocatorRole| allocator_role      |
| allocatorPhone| allocator_phone    |

## Verification

After running the SQL script, you can verify in Supabase:
1. Go to **Table Editor**
2. Select `fund_allocations` table
3. Click on the table settings/structure view
4. Confirm all columns listed above are present
