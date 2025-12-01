# 🐛 District Not Getting Notifications - Debug Steps

## Step 1: Check Database for District Notifications

**Run this in Supabase SQL Editor:**

```sql
-- Check ALL notifications for districts
SELECT 
    id,
    user_role,
    district_name,
    state_name,
    title,
    message,
    type,
    created_at
FROM notifications 
WHERE user_role = 'district'
ORDER BY created_at DESC;
```

**Expected:** Should see notifications with `user_role = 'district'`

**If NO rows:** Notifications weren't created. Go to Step 2.
**If rows exist:** District name might not match. Go to Step 3.

---

## Step 2: Test Approval Flow

1. **Login as State Admin** (Andhra Pradesh)
2. **Go to "Approve District Proposals"**
3. **Find a PENDING proposal** 
4. **Click "Approve"** button
5. **Confirm approval**

**Watch Backend Terminal for this message:**
```
✅ Notification created for district: West Godavari (Approved)
```

**If you DON'T see this:**
- Backend code isn't running the new code
- Try restarting backend server

**Then run Step 1 SQL again to verify**

---

## Step 3: Check District Name Match

**Run this in Supabase:**

```sql
-- See what district names exist in notifications
SELECT DISTINCT district_name 
FROM notifications 
WHERE user_role = 'district';

-- See what districts exist in database
SELECT name FROM districts WHERE name ILIKE '%godavari%';
```

**Common Issues:**
- Database has: "West Godavari" 
- But notification has: "WestGodavari" (no space)
- Or: "west godavari" (lowercase)

---

## Step 4: Check What DistrictName is Being Passed

**Add console.log to DistrictDashboard.jsx:**

Open: `src/pages/dashboards/DistrictDashboard.jsx`

Find line 39 (where it sets districtName), add this:

```javascript
const name = data[0].full_name.replace(' District Admin', '').replace(' Admin', '').trim();
console.log('🔍 District Name extracted:', name);  // ADD THIS LINE
setDistrictName(name);
```

**Then:**
1. Refresh the page
2. Press F12 → Console tab
3. Look for: `🔍 District Name extracted: West Godavari`

---

## Step 5: Force a Test Notification

**Run this in Supabase SQL Editor:**

```sql
-- Insert test notification for West Godavari
INSERT INTO notifications (
    user_role,
    district_name,
    title,
    message,
    type
) VALUES (
    'district',
    'West Godavari',
    'Test Notification',
    'This is a manual test notification',
    'info'
);

-- Verify it was created
SELECT * FROM notifications 
WHERE district_name = 'West Godavari' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Then:**
1. Go to District Dashboard (West Godavari)
2. Wait 30 seconds OR refresh page
3. Check bell icon

**If you SEE the test notification:**
- Frontend is working!
- Problem is backend not creating notifications

**If you DON'T see test notification:**
- Frontend filtering issue
- Check browser console (F12) for errors

---

## Step 6: Check Browser Console for Errors

1. **Open District Dashboard**
2. **Press F12** → Console tab
3. **Look for errors** related to:
   - Supabase
   - Notifications
   - Fetching data

**Common errors:**
- "districtName is undefined"
- "Failed to fetch notifications"
- Supabase connection error

---

## Quick Fix Checklist:

- [ ] Backend restarted after code changes
- [ ] Approved a proposal as State Admin
- [ ] Backend console shows "✅ Notification created for district"
- [ ] Database has notification with `user_role='district'`
- [ ] District name matches exactly (check case and spaces)
- [ ] Browser console has no errors
- [ ] Waited 30 seconds for auto-refresh

---

## Most Likely Issues:

### 1. Backend Not Restarted
**Fix:** 
```bash
# Stop backend (Ctrl+C)
# Restart
npm run dev
```

### 2. District Name Mismatch
**Check:**
```sql
-- What's in notification
SELECT district_name FROM notifications WHERE user_role='district';

-- What's in districts table  
SELECT name FROM districts WHERE name ILIKE '%godavari%';
```

**They must match EXACTLY!**

### 3. DistrictName Not Passed to NotificationBell
**Check:** Open browser console, look for:
```
Fetching notifications for: district West Godavari
```

---

## Start Here:

**RUN THIS SQL FIRST:**
```sql
SELECT 
    user_role,
    district_name,
    title,
    created_at
FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;
```

This will show if ANY notifications exist and what they look like!

Let me know what you see! 🔍
