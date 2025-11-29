# Manage State Admins - Setup Guide

## Overview
This feature allows the Centre Dashboard to manage state admins with the following capabilities:
- Add new state admins
- Edit existing state admins
- Activate/Deactivate state admins
- View all state admins in a table
- Search and filter state admins

## Database Setup

### Step 1: Create the Supabase Table

1. **Login to your Supabase Dashboard**
   - Go to https://supabase.com
   - Navigate to your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the SQL Script**
   - Copy the entire contents of `backend/database/state_assignment_table.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the script

4. **Verify Table Creation**
   - Go to "Table Editor" in the left sidebar
   - You should see a new table called `state_assignment`
   - The table should have the following columns:
     - `id` (bigint, primary key)
     - `name` (varchar)
     - `phone_no` (varchar)
     - `email` (varchar, unique)
     - `bank_account_number` (varchar)
     - `status` (varchar, default: 'Active')
     - `created_at` (timestamp)
     - `updated_at` (timestamp)

### Step 2: Configure Row Level Security (RLS) - Optional

If you have RLS enabled on your Supabase project, you may need to add policies:

```sql
-- Enable RLS
ALTER TABLE state_assignment ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust based on your needs)
CREATE POLICY "Enable all for authenticated users" ON state_assignment
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Or allow all operations for service role (for backend API)
CREATE POLICY "Enable all for service role" ON state_assignment
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

## Backend Setup

### Files Created/Modified:

1. **Controller**: `backend/controllers/stateAdminController.js`
   - Handles all CRUD operations for state admins
   - Includes activate/deactivate functionality

2. **Routes**: `backend/routes/stateAdminRoutes.js`
   - Defines API endpoints for state admin management

3. **Server**: `backend/server.js` (modified)
   - Added state admin routes to Express server

### API Endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/state-admins` | Get all state admins |
| POST | `/api/state-admins` | Add new state admin |
| PUT | `/api/state-admins/:id` | Update state admin |
| PATCH | `/api/state-admins/:id/activate` | Activate state admin |
| PATCH | `/api/state-admins/:id/deactivate` | Deactivate state admin |
| DELETE | `/api/state-admins/:id` | Delete state admin (hard delete) |

### Request/Response Examples:

#### Add New State Admin
```json
POST /api/state-admins
Content-Type: application/json

{
  "name": "Rajesh Kumar",
  "phone_no": "9876543210",
  "email": "rajesh.k@mah.gov.in",
  "bank_account_number": "1234567890123456"
}

Response:
{
  "success": true,
  "message": "State admin added successfully",
  "data": {
    "id": 1,
    "name": "Rajesh Kumar",
    "phone_no": "9876543210",
    "email": "rajesh.k@mah.gov.in",
    "bank_account_number": "1234567890123456",
    "status": "Active",
    "created_at": "2025-11-29T09:30:00.000Z",
    "updated_at": "2025-11-29T09:30:00.000Z"
  }
}
```

#### Activate State Admin
```json
PATCH /api/state-admins/1/activate

Response:
{
  "success": true,
  "message": "State admin activated successfully",
  "data": {
    "id": 1,
    "name": "Rajesh Kumar",
    "status": "Active",
    ...
  }
}
```

#### Deactivate State Admin
```json
PATCH /api/state-admins/1/deactivate

Response:
{
  "success": true,
  "message": "State admin deactivated successfully",
  "data": {
    "id": 1,
    "name": "Rajesh Kumar",
    "status": "Inactive",
    ...
  }
}
```

## Frontend Setup

### File Modified:
- `src/pages/dashboards/ministry/ManageStateAdmins.jsx`

### Features:

1. **Table View**
   - Displays all state admins with columns:
     - Name
     - Phone No
     - Email
     - Bank Account Number
     - Status (Active/Inactive badge)
     - Actions (Edit, Activate/Deactivate buttons)

2. **Add State Admin**
   - Click "+ Add State Admin" button
   - Fill in the form:
     - Name
     - Email
     - Phone No
     - Bank Account Number
   - Click "Confirm Release" to save

3. **Edit State Admin**
   - Click "Edit" button on any row
   - Modify the details
   - Click "Confirm Release" to update

4. **Activate/Deactivate**
   - Click "Deactivate" to set status to Inactive (removes from database logically)
   - Click "Activate" to set status to Active (adds back to active list)

5. **Search**
   - Use the search box to filter by name, email, phone, or account number

## Testing the Feature

### 1. Start the Backend Server
```bash
cd backend
npm run dev
```

The server should show:
```
Server is running on port 5001
- Auth Routes loaded at /api/auth
- Notification Routes loaded at /api/notifications
- Fund Routes loaded at /api/funds
- State Admin Routes loaded at /api/state-admins
- Health check at /api/health
```

### 2. Start the Frontend
```bash
cd ..
npm run dev
```

### 3. Test the Feature

1. **Login to the application**
2. **Navigate to Ministry Dashboard**
3. **Click on "Manage State Admins" in the sidebar**
4. **Test Add:**
   - Click "+ Add State Admin"
   - Fill in all fields
   - Click "Confirm Release"
   - Verify the admin appears in the table

5. **Test Edit:**
   - Click "Edit" on any admin
   - Modify some fields
   - Click "Confirm Release"
   - Verify changes are saved

6. **Test Deactivate:**
   - Click "Deactivate" on an active admin
   - Confirm the action
   - Verify status changes to "Inactive"
   - Verify the button changes to "Activate"

7. **Test Activate:**
   - Click "Activate" on an inactive admin
   - Verify status changes to "Active"
   - Verify the button changes to "Deactivate"

8. **Test Search:**
   - Type in the search box
   - Verify the table filters correctly

## Database Behavior

### When you click "Activate":
- SQL Query: `UPDATE state_assignment SET status = 'Active' WHERE id = ?`
- The record remains in the database
- Status is set to 'Active'

### When you click "Deactivate":
- SQL Query: `UPDATE state_assignment SET status = 'Inactive' WHERE id = ?`
- The record remains in the database
- Status is set to 'Inactive'

**Note:** This is a "soft delete" approach. The data is not removed from the database, only the status is changed. This allows you to maintain historical records and reactivate admins if needed.

## Troubleshooting

### Issue: "Failed to load state admins"
- **Check:** Is the backend server running?
- **Check:** Is Supabase configured correctly in `.env`?
- **Check:** Does the `state_assignment` table exist in Supabase?

### Issue: "Email already exists"
- **Solution:** Each email must be unique. Use a different email address.

### Issue: "Phone number must be 10 digits"
- **Solution:** Enter exactly 10 digits without spaces or special characters.

### Issue: Backend returns 500 error
- **Check:** Backend console for detailed error messages
- **Check:** Supabase credentials in `.env` file
- **Check:** Table permissions in Supabase (RLS policies)

## Environment Variables Required

Make sure your `backend/.env` file contains:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Next Steps

1. ✅ Create the database table in Supabase
2. ✅ Verify backend server is running
3. ✅ Test the feature in the frontend
4. 📝 Optionally add more features:
   - Export to PDF/Excel
   - Bulk upload
   - Email notifications
   - Audit logs

## Summary

You now have a fully functional "Manage State Admins" feature with:
- ✅ Database table (`state_assignment`)
- ✅ Backend API endpoints
- ✅ Frontend UI with table and form
- ✅ Activate/Deactivate functionality
- ✅ Search and filter
- ✅ Full CRUD operations

The activate/deactivate buttons update the database status field, keeping all data intact for historical purposes.
