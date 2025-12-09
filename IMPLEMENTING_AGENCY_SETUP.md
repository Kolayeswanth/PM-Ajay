# Implementing Agency Login & Dashboard Setup

## Overview
Implementing agencies now login with district-based emails and see their district name in the dashboard.

---

## Email Format

### New Format:
```
{state-code}-{district-code}.district@pmajay.gov.in
```

### Examples:
- **Andhra Pradesh - West Godavari:** `ap-wg.district@pmajay.gov.in`
- **Karnataka - Bengaluru Urban:** `ka-bu.district@pmajay.gov.in`
- **Assam - Baksa:** `as-bak.district@pmajay.gov.in`

### Password:
All implementing agencies use: **PMajay@2024#Demo**

---

## Dashboard Display

### When Implementing Agency Logs In:

**Dashboard Title Shows:**
```
Implementing Agency - {District Name}
```

**Examples:**
- `Implementing Agency - West Godavari`
- `Implementing Agency - Bengaluru Urban`
- `Implementing Agency - Baksa`

---

## How It Works

### 1. Authentication
- User logs in with district-based email (e.g., `ap-wg.district@pmajay.gov.in`)
- System identifies user role as `implementing_agency`
- Routes to **DepartmentDashboard** (which is the Implementing Agency Dashboard)

### 2. District Name Fetching
- Dashboard fetches district name from `implementing_agencies` table
- Joins with `districts` table to get district name
- Displays: `Implementing Agency - {District Name}`

### 3. Dashboard Routing
```javascript
case ROLES.IMPLEMENTING_AGENCY:
    return <DepartmentDashboard />;  // Implementing Agency Dashboard
```

---

## Separation from District Dashboard

### District Dashboard
- **Used by:** District Admins
- **Role:** `district_admin`
- **Email Pattern:** `district.{district-name}@pmajay.gov.in`
- **Dashboard:** `DistrictDashboard.jsx`

### Implementing Agency Dashboard
- **Used by:** Implementing Agencies
- **Role:** `implementing_agency`
- **Email Pattern:** `{state-code}-{district-code}.district@pmajay.gov.in`
- **Dashboard:** `DepartmentDashboard.jsx`
- **Display:** `Implementing Agency - {District Name}`

**These are completely separate!**

---

## Files Modified

### 1. `DepartmentDashboard.jsx`
**Changes:**
- Added `districtName` state
- Added `useEffect` to fetch district name for implementing agencies
- Updated dashboard title to show `Implementing Agency - {District Name}`

**Code:**
```javascript
// Fetch district name
useEffect(() => {
    const fetchDistrictName = async () => {
        if (!user || user.role !== 'implementing_agency') return;
        
        const { data: agencies } = await supabase
            .from('implementing_agencies')
            .select(`
                district_id,
                districts (name)
            `)
            .eq('user_id', user.id);
            
        if (agencies && agencies[0]?.districts) {
            setDistrictName(agencies[0].districts.name);
        }
    };
    fetchDistrictName();
}, [user]);

// Display in header
{user?.role === 'implementing_agency' && districtName
    ? `Implementing Agency - ${districtName}`
    : 'Department Dashboard'}
```

---

## Database Structure

### implementing_agencies Table
```sql
- id (uuid)
- user_id (uuid) → links to auth.users
- agency_name (text)
- email (text) → new format: {state-code}-{district-code}.district@pmajay.gov.in
- district_id (uuid) → links to districts table
```

### districts Table
```sql
- id (uuid)
- name (text) → e.g., "West Godavari", "Bengaluru Urban"
- state_id (uuid)
```

---

## Update Script

### To Update All Emails:

1. **Review proposed changes:**
   ```bash
   cd backend
   node updateImplementingAgencyEmails.js
   ```

2. **Apply changes:**
   - Open `backend/updateImplementingAgencyEmails.js`
   - Uncomment the update code (around line 115)
   - Run: `node updateImplementingAgencyEmails.js`

---

## Testing

### Test Login:
1. Go to login page
2. Enter: `ap-wg.district@pmajay.gov.in`
3. Password: `PMajay@2024#Demo`
4. Should see: **"Implementing Agency - West Godavari"** in dashboard

### Verify Separation:
- **District Admin** login → Goes to `DistrictDashboard`
- **Implementing Agency** login → Goes to `DepartmentDashboard` (Implementing Agency Dashboard)
- Both are completely separate dashboards

---

## Status

✅ **Email Format:** Ready to update (script created)
✅ **Dashboard Display:** Configured to show district name
✅ **Role Separation:** Implementing Agency ≠ District Admin
✅ **Routing:** Implementing agencies route to DepartmentDashboard

**Next Step:** Run the email update script to apply new email format to all 420 agencies.
