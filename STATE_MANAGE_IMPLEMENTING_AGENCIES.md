# State Dashboard - Manage Implementing Agencies

## Overview
The State Dashboard now manages Implementing Agencies (instead of District Admins), following the same pattern as the District Dashboard.

---

## What Changed

### **State Dashboard Menu:**
1. ✅ "Manage District Admins" → **"Manage Implementing Agencies"**
2. ✅ "Fund Release to Districts" → **"Fund Release to Implementing Agencies"**
3. ✅ "Approve District Proposals" → **"Approve Implementing Agency Proposals"**

---

## Hierarchy

```
Ministry
  ↓
State Admin
  ↓
Implementing Agency (per district)
  ↓
Executing Agency
  ↓
Contractor
```

**State Admin manages Implementing Agencies**
**District Admin is separate** (not part of this flow)

---

## Features

### 1. **Manage Implementing Agencies**
State admins can:
- ✅ View all implementing agencies in their state
- ✅ Filter by district
- ✅ Add new implementing agencies
- ✅ Edit existing agencies
- ✅ Activate agencies (creates login credentials)

### 2. **Create Implementing Agency**
When creating an agency:
- Select district (from state's districts)
- Enter agency name
- Enter email
- Enter phone (optional)
- Click "Save"

### 3. **Activate Implementing Agency**
When activating:
- Creates Supabase auth user
- Sets role as `implementing_agency`
- Creates profile
- Links `user_id` to agency record
- Default password: `[Generated Securely - Check Email]`

---

## Files Created/Modified

### **Frontend:**

1. **`src/pages/dashboards/state/ManageImplementingAgencies.jsx`** (NEW)
   - Component for managing implementing agencies
   - CRUD operations
   - Activation functionality

2. **`src/pages/dashboards/StateDashboard.jsx`** (MODIFIED)
   - Import changed from `ManageDistrictAdmins` to `ManageImplementingAgencies`
   - Menu labels updated
   - Breadcrumb updated

### **Backend:**

1. **`backend/controllers/implementingAgencyController.js`** (NEW)
   - `getImplementingAgencies` - Get all agencies for a state
   - `createImplementingAgency` - Create new agency
   - `updateImplementingAgency` - Update existing agency
   - `activateImplementingAgency` - Activate and create login

2. **`backend/routes/implementingAgencyRoutes.js`** (NEW)
   - `GET /api/implementing-agencies` - List agencies
   - `POST /api/implementing-agencies` - Create agency
   - `PUT /api/implementing-agencies/:id` - Update agency
   - `PATCH /api/implementing-agencies/:id/activate` - Activate agency

3. **`backend/server.js`** (ALREADY REGISTERED)
   - Routes already registered at `/api/implementing-agencies`

---

## API Endpoints

### **GET /api/implementing-agencies**
Get all implementing agencies for a state.

**Query Parameters:**
- `stateName` - State name (required)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "agency_name": "Public Works Department",
      "email": "ap-eg.district@pmajay.gov.in",
      "district_name": "East Godavari",
      "district_id": "uuid",
      "user_id": "uuid",
      "status": "Activated"
    }
  ]
}
```

### **POST /api/implementing-agencies**
Create new implementing agency.

**Body:**
```json
{
  "agencyName": "Public Works Department",
  "district": "East Godavari",
  "email": "ap-eg.district@pmajay.gov.in",
  "phone": "9876543210",
  "stateName": "Andhra Pradesh"
}
```

### **PUT /api/implementing-agencies/:id**
Update implementing agency.

**Body:**
```json
{
  "agencyName": "Updated Name",
  "district": "New District",
  "email": "new@email.com"
}
```

### **PATCH /api/implementing-agencies/:id/activate**
Activate implementing agency (creates login).

**Response:**
```json
{
  "success": true,
  "message": "Implementing agency activated successfully",
  "credentials": {
    "email": "ap-eg.district@pmajay.gov.in",
    "password": "[REDACTED - Sent via secure channel]"
  }
}
```

---

## Database Structure

### **implementing_agencies Table**
```sql
- id (uuid)
- agency_name (text)
- email (text)
- user_id (uuid) → links to auth.users
- district_id (uuid) → links to districts
```

### **Relationships:**
```
states
  ↓ (has many)
districts
  ↓ (has many)
implementing_agencies
  ↓ (has one)
auth.users (via user_id)
```

---

## Workflow

### **State Admin Creates Agency:**

1. **Login** as State Admin
2. **Navigate** to "Manage Implementing Agencies"
3. **Click** "+ Add New Agency"
4. **Fill form:**
   - Select District
   - Enter Agency Name
   - Enter Email
   - Enter Phone (optional)
5. **Click** "Save"
6. **Agency created** with status "Active"

### **State Admin Activates Agency:**

1. **Find agency** in list (status shows "Active")
2. **Click** "Active" button
3. **System creates:**
   - Supabase auth user
   - Profile with role `implementing_agency`
   - Links `user_id` to agency
4. **Status changes** to "Activated"
5. **Agency can now login** with:
   - Email: `ap-eg.district@pmajay.gov.in`
   - Password: `[Sent via secure channel]`

---

## Testing

### **Test as State Admin:**

1. Login as State Admin (e.g., Andhra Pradesh)
2. Go to "Manage Implementing Agencies"
3. Should see list of agencies for Andhra Pradesh districts
4. Create new agency for a district
5. Activate the agency
6. Logout

### **Test as Implementing Agency:**

1. Login with agency email (e.g., `ap-eg.district@pmajay.gov.in`)
2. Password: `[Use the password sent during activation]`
3. Should see: **"Implementing Agency - East Godavari"**
4. Should be on Implementing Agency Dashboard (DepartmentDashboard)

---

## Status

✅ **Frontend Component:** Created
✅ **Backend API:** Created
✅ **Routes:** Registered
✅ **Menu Labels:** Updated
✅ **Activation Flow:** Implemented

**Ready to use!** 🎉

---

## Next Steps (Optional)

1. **Email Notifications:** Send email when agency is activated
2. **WhatsApp Integration:** Send WhatsApp message with credentials
3. **Bulk Upload:** Upload multiple agencies via CSV
4. **Password Reset:** Allow agencies to reset their password
5. **Deactivation:** Add ability to deactivate agencies
