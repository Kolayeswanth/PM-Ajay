import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MinistryDashboard from './ministry/MinistryDashboard';

export default function DashboardScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                setUser(JSON.parse(userData));
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF9933" />
                <Text style={styles.loadingText}>Loading Dashboard...</Text>
            </View>
        );
    }

    // Route to appropriate dashboard based on user role
    const role = user?.role?.toLowerCase();

    if (role === 'ministry' || role === 'ministry_admin') {
        return <MinistryDashboard navigation={navigation} />;
    }

    // Default fallback dashboard for other roles
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Dashboard</Text>
                <Text style={styles.headerSubtitle}>Role: {user?.role || 'N/A'}</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.welcomeText}>Welcome, {user?.full_name || 'User'}</Text>
                <Text style={styles.infoText}>
                    Dashboard for {user?.role} role is under development.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#6B7280',
    },
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
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
