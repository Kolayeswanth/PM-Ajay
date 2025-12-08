import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Send a local notification
 */
export const sendLocalNotification = async ({ title, body, data = {} }) => {
  try {
    const hasPermission = await requestNotificationPermissions();
    
    if (!hasPermission) {
      console.log('No notification permission, skipping notification');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        badge: 1,
      },
      trigger: null, // null means show immediately
    });

    console.log('📬 Local notification sent:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error sending local notification:', error);
    return null;
  }
};

/**
 * Send notification for pending approvals
 */
export const notifyPendingApprovals = async (count) => {
  if (count === 0) {
    console.log('ℹ️ No pending approvals to notify');
    return;
  }

  console.log(`🔔 Preparing to send notification for ${count} pending approvals`);
  
  const title = '⚠️ Pending Approvals';
  const body = count === 1 
    ? 'There is 1 pending proposal that requires your approval. Please verify and take action.'
    : `There are ${count} pending proposals that require your approval. Please verify and take action.`;

  const notificationId = await sendLocalNotification({
    title,
    body,
    data: { type: 'pending_approvals', count },
  });

  if (notificationId) {
    console.log('✅ Notification sent successfully with ID:', notificationId);
  } else {
    console.log('❌ Failed to send notification');
  }
  
  return notificationId;
};

/**
 * Send notification for new fund allocation
 */
export const notifyNewFunds = async (amount, component) => {
  const title = '💰 New Fund Allocation';
  const body = `New fund of ${amount} has been allocated for ${component}. Check the dashboard for details.`;

  await sendLocalNotification({
    title,
    body,
    data: { type: 'fund_allocation', amount, component },
  });
};

/**
 * Send notification for new proposal
 */
export const notifyNewProposal = async (district, projectName) => {
  const title = '📋 New Proposal Received';
  const body = `New proposal "${projectName}" submitted by ${district}. Review required.`;

  await sendLocalNotification({
    title,
    body,
    data: { type: 'new_proposal', district, projectName },
  });
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async () => {
  try {
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
};

/**
 * Set up notification listeners
 */
export const setupNotificationListeners = (onNotificationReceived, onNotificationTapped) => {
  // Listener for when a notification is received while app is foregrounded
  const receivedListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('📬 Notification received:', notification);
    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }
  });

  // Listener for when a user taps on a notification
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('👆 Notification tapped:', response);
    if (onNotificationTapped) {
      onNotificationTapped(response);
    }
  });

  // Return cleanup function
  return () => {
    if (receivedListener && receivedListener.remove) {
      receivedListener.remove();
    }
    if (responseListener && responseListener.remove) {
      responseListener.remove();
    }
  };
};
