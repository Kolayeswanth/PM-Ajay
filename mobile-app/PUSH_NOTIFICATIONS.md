# Push Notifications Setup

## Installation

Run the following command to install the required package:

```bash
cd mobile-app
npm install expo-notifications@~0.30.2
```

or

```bash
npx expo install expo-notifications
```

## Rebuild the App

After installing expo-notifications, you need to rebuild your app:

### For Android:
```bash
npx expo run:android
```

### For Development:
```bash
npx expo start --clear
```

Then press `a` for Android or `i` for iOS.

## Features Implemented

### 1. Push Notification Service
- **Location**: `src/services/notificationService.js`
- Handles notification permissions
- Sends local push notifications
- Supports different notification types

### 2. Pending Approvals Notification
When a state admin logs in, the app:
- ✅ Fetches pending approval count from dashboard stats
- ✅ Sends a push notification if there are pending approvals
- ✅ Shows notification count in the message
- ✅ Only sends notification once per session

**Notification Message Examples:**
- 1 pending: "There is 1 pending proposal that requires your approval. Please verify and take action."
- Multiple: "There are N pending proposals that require your approval. Please verify and take action."

### 3. Notification Actions
- Tapping on the notification navigates to the "Approve Proposals" tab
- Notification appears immediately after login with dashboard data
- Shows alert banner and plays sound

### 4. Notification Types Supported
- ⚠️ Pending Approvals
- 💰 Fund Allocation
- 📋 New Proposals
- (Extensible for more types)

## How It Works

1. **On App Launch**: Requests notification permissions from user
2. **After Login**: Dashboard fetches stats including `pendingApprovals` count
3. **If Pending > 0**: Sends local push notification
4. **User Taps Notification**: Opens app and navigates to Proposals tab
5. **Once per Session**: Notification only sent once until app restart

## Testing

1. Login with a state admin account
2. Ensure there are pending proposals in the database
3. You should see a push notification immediately after login
4. Tap the notification to navigate to the Approve Proposals screen

## Configuration

Notification settings are in `app.json`:
- Icon: Orange color (#FF9933)
- Sound: Default system sound
- Badge: Shows unread count
- Priority: HIGH (shows as heads-up notification)

## Troubleshooting

If notifications don't appear:
1. Check device notification settings (ensure app has permission)
2. Verify pending approvals count in dashboard stats
3. Check console logs for notification permission status
4. On Android, ensure notification channels are enabled
5. Try restarting the app to reset notification check flag
