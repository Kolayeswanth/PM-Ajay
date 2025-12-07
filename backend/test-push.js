const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
let expo = new Expo();

// REPLACE WITH YOUR EXPO PUSH TOKEN FROM THE MOBILE APP CONSOLE LOGS
const PUSH_TOKEN = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';

const sendTestNotification = async () => {
    if (!Expo.isExpoPushToken(PUSH_TOKEN)) {
        console.error(`Push token ${PUSH_TOKEN} is not a valid Expo push token`);
        return;
    }

    const messages = [{
        to: PUSH_TOKEN,
        sound: 'default',
        title: 'Test Notification',
        body: 'This is a test notification from the backend!',
        data: { someData: 'goes here' },
    }];

    try {
        const chunks = expo.chunkPushNotifications(messages);
        for (let chunk of chunks) {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log('Notification sent:', ticketChunk);
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

sendTestNotification();
