import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Platform, Alert, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import { getNotifications } from './services/api';

const Stack = createStackNavigator();

// Configure notification handler
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (error) {
  console.log('Notification handler failed (expected in Expo Go):', error.message);
}

// Ignore specific logs for demo
LogBox.ignoreLogs([
  'Error getting token',
  'expo-notifications', // Generic match for the warning
  'functionality provided by expo-notifications was removed',
  'is not fully supported in Expo Go' 
]);

export default function App() {
  useEffect(() => {
    // Start polling when app starts
    const interval = setInterval(checkForNotifications, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const checkForNotifications = async () => {
    try {
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) return;
        
        const user = JSON.parse(userData);
        const result = await getNotifications(user.id);
        
        if (result && result.success && result.data && result.data.length > 0) {
            // Get latest notification
            const latest = result.data[0];
            
            // Check if we already showed this one
            const lastShownId = await AsyncStorage.getItem('lastNotificationId');
            if (lastShownId !== latest.id) {
                // Show local notification
                try {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: latest.title,
                            body: latest.body,
                            data: latest,
                        },
                        trigger: null, // Show immediately
                    });
                } catch (error) {
                    console.log('Skipping notification (not supported in Expo Go):', error.message);
                }
                
                // Save as shown
                await AsyncStorage.setItem('lastNotificationId', latest.id);
                console.log('New notification shown:', latest.title);
            }
        }
    } catch (error) {
        console.log('Polling error:', error.message);
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
