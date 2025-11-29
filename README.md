# 🏛️ PM-AJAY Portal - Hierarchical Authentication System

## 📋 Project Overview

Complete **Centre → State → District** hierarchical authentication system for PM-AJAY government portal with **769 pre-configured user accounts** across India.

### System Architecture

```
Centre Admin (1)
    └── Controls entire country
        ├── State Admins (36)
        │   └── Each controls one state/UT
        │       └── District Admins (732)
        │           └── Each controls one district
```

---

## 🎯 What's Included

### ✅ Database Schema
- Complete Supabase schema with Row Level Security (RLS)
- 6 tables: `profiles`, `centre_admin`, `states`, `districts`, `state_admins`, `district_admins`
- Proper foreign key relationships and indexes

### ✅ Pre-configured Data
- **1 Centre Admin** account
- **36 State/UT Admin** accounts (all Indian states and UTs)
- **732 District Admin** accounts (all districts across India)
- **36 States/UTs** with codes
- **732 Districts** with state mapping

### ✅ Import Tools
- SQL schema files
- CSV data files
- Automated bulk import script (Node.js)
- Setup validation script

### ✅ Documentation
- Step-by-step import guide
- Complete credentials reference
- Security best practices
- Troubleshooting guide

---

## 🚀 Quick Start

### Prerequisites
- Supabase account (free tier works)
- Node.js 16+ installed
- Git (optional)

### Step 1: Setup Database (5 minutes)

1. **Create Supabase Project**
   - Go to https://app.supabase.com
   - Create new project
   - Wait for database to initialize

2. **Run Schema Setup**
   - Open Supabase Dashboard → SQL Editor
   - Copy contents of `02_CENTRE_STATE_DISTRICT_SCHEMA.sql`
   - Paste and click **Run**

3. **Import States**
   - In SQL Editor, run `03_INSERT_STATES_DISTRICTS.sql`
   - Verifies: 36 states imported

4. **Import Districts**
   - Go to Table Editor → `districts` table
   - Click Insert → Import CSV
   - Upload `CSV_IMPORTS/04_districts.csv`
   - Verifies: 732 districts imported

### Step 2: Configure Environment (2 minutes)

1. **Install Dependencies**
   ```powershell
   npm install
   ```

2. **Setup Environment Variables**
   ```powershell
   copy .env.example .env
   ```

3. **Edit `.env` file** with your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   Get these from: Supabase Dashboard → Project Settings → API

### Step 3: Import Users (3-5 minutes)

1. **Validate Setup**
   ```powershell
   npm run setup-check
   ```

2. **Run Bulk Import**
   ```powershell
   npm run create-users
   ```

   This creates all 769 user accounts automatically!

### Step 4: Test Login

Test with these credentials:

**Centre Admin:**
```
Email: centre@pmajay.gov.in
Password: [REDACTED]
```

**State Admin (Maharashtra):**
```
Email: mh.admin@pmajay.gov.in
Password: [REDACTED]
```

**District Admin (Mumbai):**
```
Email: mh-mc.district@pmajay.gov.in
Password: [REDACTED]
```

---

## 📁 File Structure

```
PM-Ajay/
├── 📄 SQL Schema Files
│   ├── 02_CENTRE_STATE_DISTRICT_SCHEMA.sql    # Database schema
│   └── 03_INSERT_STATES_DISTRICTS.sql         # States data
│
├── 📊 CSV Data Files
│   └── CSV_IMPORTS/
│       ├── 01_centre_admin.csv                # 1 centre admin
│       ├── 02_states.csv                      # 36 states/UTs
│       ├── 03_state_admins.csv                # 36 state admins
│       ├── 04_districts.csv                   # 732 districts
│       ├── 05_district_admins.csv             # 732 district admins
│       └── generate_district_admins.py        # CSV generator
│
├── 🔧 Import Scripts
│   ├── bulk_create_users.js                   # Automated user creation
│   ├── setup-check.js                         # Validation script
│   ├── package.json                           # Node.js config
│   └── .env.example                           # Environment template
│
├── 📚 Documentation
│   ├── README.md                              # This file
│   ├── SUPABASE_IMPORT_GUIDE.md              # Detailed import guide
│   ├── README_SETUP.md                        # Setup instructions
│   └── CREDENTIALS_REFERENCE.md               # All login credentials
│
└── 🔒 Security
    └── .gitignore                             # Protect sensitive files
```

---

## 🔐 Login Credentials Pattern

### Centre Admin
- **Email:** `centre@pmajay.gov.in`
- **Password:** `[REDACTED]`

### State Admins
- **Email:** `{state_code}.admin@pmajay.gov.in`
- **Password:** `[REDACTED]`
- **Example:** `mh.admin@pmajay.gov.in` / `[REDACTED]`

### District Admins
- **Email:** `{district_code}.district@pmajay.gov.in`
- **Password:** `[REDACTED]`
- **Example:** `mh-mc.district@pmajay.gov.in` / `[REDACTED]`

📖 **See `CREDENTIALS_REFERENCE.md` for complete list**

---

## 📊 Database Schema

### Tables

1. **`profiles`** - Core user profiles
   - Links to Supabase Auth
   - Stores role and basic info

2. **`centre_admin`** - Centre administrator (1 record)
   - Full access to entire system

3. **`states`** - All states and UTs (36 records)
   - State name and code

4. **`districts`** - All districts (732 records)
   - District name, code, state mapping

5. **`state_admins`** - State administrators (36 records)
   - One admin per state
   - Links to state

6. **`district_admins`** - District administrators (732 records)
   - One admin per district
   - Links to district and state

### Relationships

```
auth.users (Supabase Auth)
    ↓
profiles (role, email)
    ↓
    ├── centre_admin (1)
    ├── state_admins (36) → states (36)
    └── district_admins (732) → districts (732) → states (36)
```

---

## 🛠️ Available Commands

```powershell
# Validate setup before import
npm run setup-check

# Create all 769 user accounts
npm run create-users

# Test Supabase connection
npm run test-connection
```

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| `README.md` | This file - Quick overview |
| `SUPABASE_IMPORT_GUIDE.md` | **Detailed step-by-step import instructions** |
| `README_SETUP.md` | Setup guide and architecture |
| `CREDENTIALS_REFERENCE.md` | All 769 login credentials |

---

## ✅ Verification Checklist

After import, verify:

- [ ] 6 tables created in Supabase
- [ ] 36 states in `states` table
- [ ] 732 districts in `districts` table
- [ ] 769 users in Authentication
- [ ] Can login as centre admin
- [ ] Can login as state admin
- [ ] Can login as district admin
- [ ] Each user has correct role
- [ ] State admins linked to states
- [ ] District admins linked to districts

---

## 🔒 Security Features

✅ **Row Level Security (RLS)** enabled on all tables  
✅ **Strong passwords** (12+ chars, mixed case, numbers, symbols)  
✅ **Email verification** ready (configure in Supabase)  
✅ **Service role key** required for bulk operations  
✅ **Secure credential storage** (`.env` not committed)  
✅ **Role-based access control** built-in  

---

## 🎯 Next Steps

After completing the import:

1. **Implement Frontend Login**
   - Use Supabase Auth in your React/Next.js app
   - Add role-based routing

2. **Create Dashboards**
   - Centre Dashboard (all states overview)
   - State Dashboard (districts in state)
   - District Dashboard (district data)

3. **Add Features**
   - Password reset flow
   - Change password on first login
   - Email verification
   - Multi-factor authentication (MFA)

4. **Security Enhancements**
   - Force password change on first login
   - Implement session timeout
   - Add activity logging
   - Enable MFA for admins

---

## 🐛 Troubleshooting

### "Cannot connect to Supabase"
- Check your `.env` file has correct credentials
- Ensure you're using `service_role` key, not `anon` key
- Verify Supabase project is active

### "Duplicate key error"
- Users already exist
- Either skip duplicates or delete existing users first

### "Permission denied"
- Using wrong API key (use `service_role` for bulk operations)
- RLS policies may be blocking access

### "CSV import fails"
- Check file encoding (should be UTF-8)
- Verify column names match exactly
- Try SQL import method instead

📖 **See `SUPABASE_IMPORT_GUIDE.md` for detailed troubleshooting**

---

## 📞 Support

For issues:
1. Check Supabase Dashboard → Logs
2. Run `npm run setup-check` to validate setup
3. Review `SUPABASE_IMPORT_GUIDE.md`
4. Check `.env` configuration

---

## 📊 Statistics

- **Total Users:** 769
  - 1 Centre Admin
  - 36 State Admins
  - 732 District Admins
- **Total States/UTs:** 36
- **Total Districts:** 732
- **Total Database Records:** 1,537+
- **Import Time:** ~5 minutes (automated)

---

## 🎉 Success Criteria

Your setup is complete when:

✅ All 769 users can login  
✅ Centre admin sees all states  
✅ State admins see only their state  
✅ District admins see only their district  
✅ Roles are correctly assigned  
✅ Data relationships are intact  

---

## 📝 License

This is a government project setup for PM-AJAY scheme.

---

## 🙏 Credits

**Generated for:** PM-AJAY Portal  
**Date:** November 27, 2024  
**Version:** 1.0  

---

**🚀 Ready to import? Start with `SUPABASE_IMPORT_GUIDE.md`**
