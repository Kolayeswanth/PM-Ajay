import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen({ navigation }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        };
        loadUser();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        navigation.replace('Login');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Dashboard</Text>
                <TouchableOpacity onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.welcomeText}>Welcome, {user?.full_name || 'User'}</Text>
                    <Text style={styles.roleText}>Role: {user?.role || 'N/A'}</Text>
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Notifications Active</Text>
                    <Text style={styles.infoText}>
                        You will receive push notifications for fund allocations and releases alongside WhatsApp messages.
                    </Text>
                </View>

                {/* Add more dashboard features here mirroring the web app */}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    logoutText: {
        color: 'red',
        fontSize: 16,
    },
    content: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        elevation: 2,
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    roleText: {
        fontSize: 16,
        color: '#666',
    },
    infoCard: {
        backgroundColor: '#e3f2fd',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1565c0',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#0d47a1',
        lineHeight: 20,
    },
});
