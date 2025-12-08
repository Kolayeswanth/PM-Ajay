# Implementing Agency Login Credentials

## Summary
- **Total Agencies:** 102
- **Default Password:** PMajay@2024#Demo

---

## Login Credentials

All implementing agencies use the same default password: **PMajay@2024#Demo**

Users can change their password after first login.

---

## Sample Agencies (showing pattern):

### 1. GOV - Madhya Pradesh
- **Email:** GOV-MadhyaPradesh86@pmajay.in
- **Password:** PMajay@2024#Demo
- **Location:** Bengaluru Urban, Karnataka

### 2. GOV - Tamil Nadu
- **Email:** GOV-TamilNadu69@pmajay.in
- **Password:** PMajay@2024#Demo
- **Location:** Bengaluru Urban, Karnataka

### 3. GOV - Andhra Pradesh Urban Development Authority
- **Email:** ia.andhra-pradesh.6906@pmajay.gov.in
- **Password:** PMajay@2024#Demo

### 4. GOV - Andhra Pradesh Rural Development Agency
- **Email:** ia.andhra-pradesh.3753@pmajay.gov.in
- **Password:** PMajay@2024#Demo

### 5. GOV - Assam (Nodal Agency)
- **Email:** nodal.assam@pmajay.gov.in
- **Password:** PMajay@2024#Demo

---

## Email Pattern

Implementing agencies follow these email patterns:

1. **State-specific agencies:**
   - `ia.{state-name}.{random-number}@pmajay.gov.in`
   - Example: `ia.andhra-pradesh.6906@pmajay.gov.in`

2. **Nodal agencies:**
   - `nodal.{state-name}@pmajay.gov.in`
   - Example: `nodal.assam@pmajay.gov.in`

3. **Legacy format:**
   - `GOV-{StateName}{number}@pmajay.in`
   - Example: `GOV-TamilNadu69@pmajay.in`

---

## Full List Available

To see the complete list of all 102 implementing agencies with their login credentials, run:

```bash
cd backend
node scripts/getImplementingAgencyLogins.js
```

This will display:
- Agency name
- Email address
- Password
- Location (District, State)
- Agency ID
- Creation date

---

## CSV Export

The script also outputs a CSV format that can be copied into Excel or Google Sheets:

```csv
Agency Name,Email,Password,District,State,ID
"GOV - Madhya Pradesh","GOV-MadhyaPradesh86@pmajay.in","PMajay@2024#Demo","Bengaluru Urban","Karnataka","025a3433-1cf1-4b12-bd64-067c63392f9a"
...
```

---

## Important Notes

1. **Default Password:** All agencies use `PMajay@2024#Demo`
2. **Total Count:** 102 implementing agencies in database
3. **Location:** Most agencies show "N/A" for district/state (may need data update)
4. **Active Status:** All agencies are accessible for login

---

## Login Instructions for Agencies

1. Go to the PM-AJAY Portal login page
2. Select **"Implementing Agency"** as user role
3. Enter your email address (from the list above)
4. Enter password: **PMajay@2024#Demo**
5. Click "Login"
6. (Optional) Change your password after first login

---

## Script Location

**File:** `backend/scripts/getImplementingAgencyLogins.js`

**Usage:**
```bash
cd backend
node scripts/getImplementingAgencyLogins.js
```

This will display all 102 agencies with their complete login information.
