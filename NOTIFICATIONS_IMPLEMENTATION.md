# Notifications System Implementation

## Overview
This implementation adds real-time notifications to the PM-AJAY system. When a district creates a proposal, the state admin receives a notification with a badge count in the notification bell icon.

## Database Setup

### 1. Create Notifications Table
Run the following SQL script in your Supabase SQL Editor:

```bash
File: backend/migrations/create_notifications_table.sql
```

**Steps:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire contents of `create_notifications_table.sql`
3. Paste and execute it
4. Verify the table was created under `Database → Tables → notifications`

### 2. Table Schema
```sql
notifications (
    id UUID PRIMARY KEY,
    user_role TEXT ('ministry', 'state', 'district', 'gp'),
    state_name TEXT (for state-specific notifications),
    district_name TEXT (for district-specific notifications),
    title TEXT (notification title),
    message TEXT (notification body),
    type TEXT ('info', 'success', 'warning', 'error'),
    read BOOLEAN (default: false),
    metadata JSONB (additional data like proposal_id, district_id, etc.),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
```

## Features

### 1. Proposal Creation Notification
**Flow:**
- District Admin creates a proposal
- Backend creates notification in `notifications` table
- Notification is assigned to `user_role='state'` and `state_name='[StateName]'`
- State Admin's notification bell shows badge count

**Backend Changes:**
- `proposalController.js` - Added notification creation logic after successful proposal submission

**Frontend Changes:**
- `NotificationBell.jsx` - Fetches notifications from Supabase filtered by role and state
- `StateDashboard.jsx` - Passes `userRole="state"` and `stateName` props to NotificationBell

### 2. Notification Bell Features
- **Badge Count:** Shows unread notification count (e.g., "1", "5")
- **Auto-Refresh:** Automatically refreshes every 30 seconds
- **Mark as Read:** Clicking a notification marks it as read
- **Relative Timestamps:** Shows "Just now", "5m ago", "2h ago", etc.
- **State-Specific:** State admins only see notifications for their state

## Testing

### 1. Test Proposal Notification
1. Login as **District Admin** (e.g., Pune district in Maharashtra state)
2. Go to **"Create Proposal"**
3. Fill in:
   - Project Name: "Test Proposal"
   - Component: "Adarsh Gram"
   - Estimated Cost: 50
   - Description: "Testing notification system"
4. Upload a file and submit
5. Check backend console - should see: `✅ Notification created for state: Maharashtra`

### 2. Verify State Admin Receives Notification
1. Login as **State Admin** (same state as district, e.g., Maharashtra)
2. Look at the **🔔 Bell icon** in the top-right header
3. Should show a **red badge** with count "1"
4. Click the bell icon to open notifications panel
5. Should see: "New Proposal Received" notification
6. Click on it to mark as read (badge count decreases)

### 3. Verify State-Specific Filtering
1. Create proposals from districts in different states
2. Each state admin should ONLY see notifications for their state
3. Maharashtra admin should NOT see Andhra Pradesh notifications

## API Endpoints

### Get Notifications
```javascript
// Frontend automatically calls:
supabase
    .from('notifications')
    .select('*')
    .eq('user_role', 'state')
    .eq('state_name', 'Maharashtra')
    .order('created_at', { ascending: false })
    .limit(20)
```

### Mark as Read
```javascript
supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
```

## Troubleshooting

### Issue: No notifications showing
**Solution:**
1. Check if notifications table exists in Supabase
2. Verify RLS policies are enabled
3. Check browser console for errors
4. Ensure `stateName` is correctly extracted in StateDashboard.jsx

### Issue: Badge count not updating
**Solution:**
1. Notifications auto-refresh every 30 seconds
2. Reload the page manually
3. Check if `read` field is properly updating in database

### Issue: State name not matching
**Solution:**
1. Ensure district's `state_id` references correct state in `states` table
2. Check state name matches exactly (case-sensitive)
3. Check console logs for state name extraction

## Future Enhancements

1. **Real-time Updates:** Use Supabase Realtime subscriptions for instant notifications
2. **Push Notifications:** Browser push notifications for critical alerts
3. **Notification Categories:** Filter by type (proposals, funds, UCs)
4. **Email Notifications:** Send email for important notifications
5. **Notification History:** Archive and search old notifications
6. **Sound Alerts:** Play sound when new notification arrives

## Code Files Modified

### Backend
- `backend/controllers/proposalController.js` - Added notification creation
- `backend/migrations/create_notifications_table.sql` - NEW

### Frontend
- `src/components/NotificationBell.jsx` - Complete rewrite for Supabase
- `src/pages/dashboards/StateDashboard.jsx` - Added props to NotificationBell

## Example Notification Data

```json
{
  "id": "uuid-here",
  "user_role": "state",
  "state_name": "Maharashtra",
  "title": "New Proposal Received",
  "message": "New proposal \"Road Construction\" submitted by Pune district for Adarsh Gram component (₹50 Lakhs)",
  "type": "info",
  "read": false,
  "metadata": {
    "proposal_id": "proposal-uuid",
    "district_id": "pune-uuid",
    "district_name": "Pune",
    "project_name": "Road Construction",
    "component": "Adarsh Gram",
    "estimated_cost": "50"
  },
  "created_at": "2025-12-01T09:00:00.000Z",
  "updated_at": "2025-12-01T09:00:00.000Z"
}
```

## Success Criteria

✅ District creates proposal → State receives notification
✅ Notification bell shows badge count
✅ Badge count updates when notification marked as read
✅ State admins only see notifications for their state
✅ Notifications auto-refresh every 30 seconds
✅ Clicking notification marks it as read
✅ Responsive design works on all screen sizes

---

**Last Updated:** December 1, 2025
**Author:** PM-AJAY Development Team
