# 🐛 Notification Troubleshooting Checklist

## Issue: No notifications showing when creating proposals

### ✅ Step 1: Verify SQL Migration Was Run

**Check in Supabase:**
1. Go to Supabase Dashboard → **Database** → **Tables**
2. Look for **`notifications`** table
3. If you DON'T see it, the SQL migration wasn't run

**Action:** Run the SQL migration now!
- File: `backend/migrations/create_notifications_table.sql`
- Copy ALL content → Paste in Supabase SQL Editor → Click "Run"

---

### ✅ Step 2: Test if Notifications Table Works

**Run this in Supabase SQL Editor:**
```sql
-- Check if table exists and has data
SELECT * FROM notifications;

-- Insert a test notification for Andhra Pradesh
INSERT INTO notifications (user_role, state_name, title, message, type)
VALUES ('state', 'Andhra Pradesh', 'Test Notification', 'This is a test', 'info');

-- Verify it was inserted
SELECT * FROM notifications WHERE state_name = 'Andhra Pradesh';
```

**Expected Result:** Should see your test notification

---

### ✅ Step 3: Create a Test Proposal

**Do this:**
1. **Login as District Admin** 
   - Email: `westgodavari@andhra.gov.in` (or any Andhra Pradesh district)
   - Password: `district123`

2. **Go to "Create Proposal"**

3. **Fill in:**
   - Project Name: `Test Notification System`
   - Component: `Adarsh Gram`
   - Estimated Cost: `50`
   - Description: `Testing notification system`
   - Upload any file

4. **Click "Submit Proposal to State"**

5. **Check Backend Console** (look at the terminal running backend)
   - Should see: `✅ Notification created for state: Andhra Pradesh`
   - If you DON'T see this, backend code isn't working

---

### ✅ Step 4: Check Notification in Database

**Run in Supabase SQL Editor:**
```sql
SELECT * FROM notifications 
WHERE state_name = 'Andhra Pradesh' 
ORDER BY created_at DESC 
LIMIT 5;
```

**Expected:** Should see notification created just now with:
- `title`: "New Proposal Received"
- `message`: Contains "Test Notification System"
- `user_role`: "state"
- `state_name`: "Andhra Pradesh"
- `read`: false

---

### ✅ Step 5: Check Frontend Notification Bell

**Do this:**
1. **Login as State Admin (Andhra Pradesh)**
   - Email: `andhra.pradesh@state.gov.in`
   - Password: `state123`

2. **Look at bell icon** in top-right
   - Should show: 🔔 (1)

3. **Click bell icon**
   - Should see notification

4. **Open Browser Console** (F12)
   - Look for errors
   - Check Network tab for `/notifications` API call

---

## 🔍 Common Issues & Solutions

### Issue 1: "No notifications" but table has data
**Problem:** Frontend filtering issue
**Solution:**
1. Check browser console for errors
2. Verify state name matches exactly:
   ```sql
   SELECT DISTINCT state_name FROM notifications;
   ```
3. Check if `stateName` prop is being passed correctly in `StateDashboard.jsx`

### Issue 2: Backend not creating notifications
**Problem:** Proposal controller not triggering
**Solution:**
1. Check backend console when submitting proposal
2. Verify backend is running: `http://localhost:5001`
3. Check if proposal was saved:
   ```sql
   SELECT * FROM district_proposals ORDER BY created_at DESC LIMIT 3;
   ```

### Issue 3: State name mismatch
**Problem:** "Andhra Pradesh" in notification but "Andhra" in profile
**Solution:**
Run this to check state names:
```sql
-- Check state names in states table
SELECT * FROM states;

-- Check what districts belong to Andhra Pradesh
SELECT d.name as district_name, s.name as state_name 
FROM districts d 
JOIN states s ON d.state_id = s.id 
WHERE s.name ILIKE '%andhra%';
```

### Issue 4: RLS Policy blocking reads
**Problem:** Row Level Security preventing reads
**Solution:**
```sql
-- Temporarily disable RLS for testing
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Test again, then re-enable
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

---

## 📝 Quick Debug Script

**Run this in Supabase SQL Editor to see everything:**

```sql
-- 1. Check notifications table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications';

-- 2. Count notifications by state
SELECT state_name, COUNT(*) as count 
FROM notifications 
GROUP BY state_name;

-- 3. Show recent notifications
SELECT 
    id,
    user_role,
    state_name,
    title,
    created_at,
    read
FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Check proposals with district and state info
SELECT 
    dp.project_name,
    dp.created_at,
    d.name as district_name,
    s.name as state_name
FROM district_proposals dp
JOIN districts d ON dp.district_id = d.id
JOIN states s ON d.state_id = s.id
ORDER BY dp.created_at DESC
LIMIT 5;
```

---

## 🎯 Expected Backend Console Output

When you create a proposal, you should see:
```
✅ Notification created for state: Andhra Pradesh
```

If you DON'T see this, the notification logic isn't running!

---

## ✅ Final Verification Checklist

- [ ] Notifications table exists in Supabase
- [ ] Can manually insert notification via SQL
- [ ] Backend shows "Notification created" message
- [ ] Notification appears in database after proposal creation
- [ ] State name in notification matches state admin's state
- [ ] Bell icon shows badge count
- [ ] Clicking bell displays notification
- [ ] No errors in browser console

---

## 🆘 If Still Not Working

1. **Restart backend server:**
   ```bash
   # Stop and restart
   npm run dev
   ```

2. **Clear browser cache**
   - Press Ctrl + Shift + Delete
   - Clear cache and reload

3. **Check Supabase connection:**
   - Verify `.env` file has correct Supabase URL and keys
   - Check if other Supabase features work (proposals, etc.)

4. **Enable debug mode:**
   Add console.logs to NotificationBell.jsx:
   ```javascript
   useEffect(() => {
       console.log('Fetching notifications for:', userRole, stateName);
       fetchNotifications();
   }, [userRole, stateName]);
   ```

---

**Status:** Waiting for you to run through this checklist!
