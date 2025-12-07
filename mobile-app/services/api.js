import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// REPLACE WITH YOUR COMPUTER'S LOCAL IP ADDRESS
// For Android Emulator use 'http://10.0.2.2:5000'
// Based on your Expo logs, your computer's IP on the network is likely 172.20.10.5
// And your backend is running on port 5000 (not 5173 which is the frontend)
const API_URL = 'http://172.20.10.5:5000/api'; 

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
        // config.headers.Authorization = `Bearer ${token}`; // If you have auth middleware
    }
    return config;
});

export const login = async (email, password) => {
    // This should match your backend auth route
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const registerPushToken = async (userId, pushToken) => {
    const response = await api.post('/push-token/register', { userId, pushToken });
    return response.data;
};

export const getNotifications = async (userId) => {
    const response = await api.get(`/notifications/poll?userId=${userId}`);
    return response.data;
};

export default api;
