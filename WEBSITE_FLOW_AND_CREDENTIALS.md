# PM-AJAY Website - Complete Flow & Login Credentials

## 🔐 Login Credentials

### 1. Ministry Admin
| Field | Value |
|-------|-------|
| Email | `ministry@pmajay.gov.in` |
| Password | `Ministry@123` |
| Dashboard | Ministry Dashboard |

### 2. State Admin (Andhra Pradesh)
| Field | Value |
|-------|-------|
| Email | `ap.state@pmajay.gov.in` |
| Password | `State@123` |
| Dashboard | State Dashboard |

### 3. Implementing Agency (East Godavari, AP)
| Field | Value |
|-------|-------|
| Email | `ap-eg.district@pmajay.gov.in` |
| Password | Check Supabase Auth or use activation password |
| Dashboard | Implementing Agency Dashboard |
| Role | `implementing_agency` |

> **Note:** The email contains "district" but this is an **Implementing Agency** account. When you login, the role is `implementing_agency` and you will see the Implementing Agency Dashboard (not District Dashboard).

### 4. Executing Agency
| Field | Value |
|-------|-------|
| Email | Check `executing_agencies` table in Supabase |
| Password | Set via `DEFAULT_AGENCY_PASSWORD` env variable |
| Dashboard | Executing Agency Dashboard |

### 5. Contractor
| Field | Value |
|-------|-------|
| Email | Check `contractors` table in Supabase |
| Password | Set during creation |
| Dashboard | Contractor Dashboard |


---

## 📋 Complete Proposal Flow

### Step 1: Implementing Agency Creates Proposal
**Login:** Implementing Agency  
**Location:** Implementing Agency Dashboard → "Submit Proposals"

1. Fill in project details:
   - Project Name
   - Component (Road Construction, Bridge, etc.)
   - Estimated Cost
   - Location/Village
   - Description
2. Click "Submit Proposal"
3. **Status:** `SUBMITTED`

---

### Step 2: State Admin Reviews & Approves
**Login:** State Admin  
**Location:** State Dashboard → "Approve Implementing Agency Proposals"

1. View list of submitted proposals from Implementing Agencies
2. Review proposal details
3. Click "Approve" or "Reject"
4. **Status Changes:** `SUBMITTED` → `APPROVED_BY_STATE`

---

### Step 3: Ministry Admin Reviews & Approves
**Login:** Ministry Admin  
**Location:** Ministry Dashboard → "Project Approval" / "Annual Plans Approval"

1. View list of state-approved proposals
2. Review proposal details
3. Click "Approve" or "Reject"
4. Optionally allocate funds
5. **Status Changes:** `APPROVED_BY_STATE` → `APPROVED_BY_MINISTRY`

---

### Step 4: Ministry Allocates Funds to State
**Login:** Ministry Admin  
**Location:** Ministry Dashboard → "Fund Allocation"

1. Select State (e.g., Andhra Pradesh)
2. Enter amount to allocate
3. Click "Allocate"
4. Funds are recorded in `fund_allocations` table
5. WhatsApp notification sent to State Admin

---

### Step 5: Ministry Releases Funds to State
**Login:** Ministry Admin  
**Location:** Ministry Dashboard → "Fund Release" 

1. View allocated funds
2. Click "Release" to transfer funds to state
3. **Status:** Funds marked as released

---

### Step 6: State Admin Manages Implementing Agencies
**Login:** State Admin  
**Location:** State Dashboard → "Manage Implementing Agencies"

1. Add new Implementing Agency for a district
2. Fill in:
   - Select District
   - Agency Name
   - Email
   - Phone
3. Click "Save"
4. Click "Activate" to create login credentials
5. Implementing Agency can now login

---

### Step 7: Implementing Agency Adds Executing Agencies
**Login:** Implementing Agency  
**Location:** Implementing Agency Dashboard → "Manage Executing Agency"

1. Click "+ Add Executing Agency"
2. Fill in:
   - Select Agency Name (from dropdown)
   - Agency Officer Name
   - Phone
   - Email
3. Click "Submit"
4. Agency is added to `agency_assignments` table

---

### Step 8: Implementing Agency Assigns Projects
**Login:** Implementing Agency  
**Location:** Implementing Agency Dashboard → "Assign Projects"

1. **Select Project:** Dropdown shows all `APPROVED_BY_MINISTRY` proposals
2. **Select Executing Agency:** Dropdown shows agencies from "Manage Executing Agency"
3. Click "Assign Project"
4. **Status Changes:** `APPROVED_BY_MINISTRY` → `ASSIGNED_TO_EA`
5. Project appears in "Assigned Projects History" table

---

### Step 9: Executing Agency Receives Work
**Login:** Executing Agency  
**Location:** Executing Agency Dashboard → "Assigned Works"

1. View list of assigned projects
2. See project details, deadlines, amounts
3. Assign work to contractors

---

### Step 10: Contractor Works on Project
**Login:** Contractor  
**Location:** Contractor Dashboard

1. **Dashboard:** View assigned works
2. **Update Progress:** Upload photos, update completion %
3. **Payment Status:** Track payments
4. **Help:** Submit support tickets

---

## 🔄 Status Flow Summary

```
SUBMITTED (Implementing Agency creates)
    ↓
APPROVED_BY_STATE (State approves)
    ↓
APPROVED_BY_MINISTRY (Ministry approves)
    ↓
ASSIGNED_TO_EA (Implementing Agency assigns to Executing Agency)
    ↓
IN_PROGRESS (Work started)
    ↓
COMPLETED (Work finished)
```

---

## 🗂️ Database Tables Involved

| Table | Purpose |
|-------|---------|
| `district_proposals` | Stores all proposals with status |
| `fund_allocations` | Ministry → State fund allocations |
| `implementing_agencies` | List of implementing agencies |
| `executing_agencies` | Master list of executing agencies |
| `agency_assignments` | Executing agencies added by Implementing Agency |
| `work_orders` | Work orders/projects |
| `contractors` | Contractor records |
| `states` | All Indian states |
| `districts` | All districts |
| `profiles` | User profiles with roles |

---

## 🔧 Role Hierarchy

```
Ministry Admin
    │
    ├── Allocates funds to States
    ├── Approves State-approved proposals
    └── Manages State Admins
    
State Admin
    │
    ├── Receives funds from Ministry
    ├── Approves District proposals
    ├── Manages Implementing Agencies
    └── Releases funds to Implementing Agencies
    
Implementing Agency (per District)
    │
    ├── Manages Executing Agencies
    ├── Assigns approved projects to Executing Agencies
    └── Monitors project progress
    
Executing Agency
    │
    ├── Receives assigned projects
    ├── Manages Contractors
    └── Monitors contractor work
    
Contractor
    │
    ├── Works on assigned projects
    ├── Updates progress with photos
    └── Tracks payments
```

---

## 🚀 Quick Test Flow

1. **Login as Ministry** → Approve a proposal → Allocate funds
2. **Login as State** → Activate an Implementing Agency
3. **Login as Implementing Agency** → Add Executing Agency → Assign project
4. **Login as Executing Agency** → View assigned work
5. **Login as Contractor** → Update progress

---

## 📱 Website URL

```
http://localhost:5173
```

Backend API:
```
http://localhost:5000
```
