import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, registerPushToken } from '../services/api';

export default function LoginScreen({ navigation, route }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('ministry');
    const [loading, setLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('checking');
    const [error, setError] = useState('');
    const { pushToken } = route.params || {};

    const roles = [
        { id: 'ministry', label: 'Ministry Admin (Centre)' },
        { id: 'state', label: 'State Admin' },
        { id: 'district', label: 'District Admin' },
        { id: 'gram_panchayat', label: 'Gram Panchayat' },
        { id: 'implementing_agency', label: 'Implementing Agency' },
        { id: 'executing_agency', label: 'Executing Agency' }
    ];

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            const response = await fetch('https://gwfeaubvzjepmmhxgdvc.supabase.co/rest/v1/', {
                method: 'GET',
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZmVhdWJ2emplcG1taHhnZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjY1MDEsImV4cCI6MjA3OTc0MjUwMX0.uelA90LXrAcLazZi_LkdisGqft-dtvj0wgOQweMEUGE'
                }
            });
            if (response.ok || response.status === 200 || response.status === 404) {
                setConnectionStatus('connected');
            } else {
                setConnectionStatus('error');
            }
        } catch (err) {
            setConnectionStatus('error');
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }

        setError('');
        setLoading(true);

        try {
            console.log('=== LOGIN ATTEMPT ===');
            console.log('Email:', email);

            // Step 1: Authenticate
            const response = await fetch('https://gwfeaubvzjepmmhxgdvc.supabase.co/auth/v1/token?grant_type=password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZmVhdWJ2emplcG1taHhnZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjY1MDEsImV4cCI6MjA3OTc0MjUwMX0.uelA90LXrAcLazZi_LkdisGqft-dtvj0wgOQweMEUGE'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error_description || 'Invalid credentials');
            }

            console.log('✅ Login successful! Fetching profile...');

            // Step 2: Fetch user profile to get role
            let userRole = null;

            try {
                const profileResponse = await fetch(`https://gwfeaubvzjepmmhxgdvc.supabase.co/rest/v1/profiles?id=eq.${data.user.id}&select=*`, {
                    method: 'GET',
                    headers: {
                        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZmVhdWJ2emplcG1taHhnZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjY1MDEsImV4cCI6MjA3OTc0MjUwMX0.uelA90LXrAcLazZi_LkdisGqft-dtvj0wgOQweMEUGE',
                        'Authorization': `Bearer ${data.access_token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (profileResponse.ok) {
                    const profiles = await profileResponse.json();
                    console.log('Profile data:', profiles);
                    if (profiles && profiles.length > 0) {
                        userRole = profiles[0].role;
                    } else {
                        console.warn('No profile found for this user');
                    }
                } else {
                    console.warn('Profile fetch failed:', profileResponse.status);
                }
            } catch (profileError) {
                console.warn('Profile fetch error:', profileError);
            }

            if (!userRole) {
                throw new Error('Could not retrieve user role. Please contact support.');
            }

            console.log('✅ User role:', userRole);

            // Step 3: Store session with role
            await AsyncStorage.setItem('userToken', data.access_token);
            await AsyncStorage.setItem('userData', JSON.stringify({
                ...data.user,
                role: userRole
            }));

            // Register push token if available
            if (pushToken) {
                try {
                    await registerPushToken(data.user.id, pushToken);
                    console.log('Push token registered');
                } catch (tokenError) {
                    console.error('Failed to register push token:', tokenError);
                }
            }

            console.log('✅ Navigating to dashboard...');
            navigation.replace('Dashboard');

        } catch (err) {
            console.error('❌ LOGIN ERROR:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
        >
            <LinearGradient
                colors={['#FF9933', '#138808']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.card}>
                        <View style={styles.header}>
                            <Image
                                source={require('../assets/images/pmajay.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                            <Text style={styles.title}>PM-AJAY Portal</Text>
                            <Text style={styles.subtitle}>Ministry of Social Justice & Empowerment</Text>
                        </View>

                        {error ? (
                            <View style={styles.alertError}>
                                <Text style={styles.alertErrorText}>{error}</Text>
                            </View>
                        ) : null}

                        {connectionStatus === 'checking' && (
                            <View style={styles.alertInfo}>
                                <Text style={styles.alertInfoText}>📡 Checking connection...</Text>
                            </View>
                        )}
                        {connectionStatus === 'error' && (
                            <View style={styles.alertError}>
                                <Text style={styles.alertErrorText}>❌ Server Unreachable</Text>
                            </View>
                        )}
                        {connectionStatus === 'connected' && (
                            <View style={styles.alertSuccess}>
                                <Text style={styles.alertSuccessText}>✅ Server Connected</Text>
                            </View>
                        )}

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Select User Role</Text>
                            <TouchableOpacity 
                                style={styles.pickerContainer}
                                onPress={() => {
                                    Alert.alert(
                                        'Select User Role',
                                        '',
                                        roles.map(r => ({
                                            text: r.label,
                                            onPress: () => setRole(r.id)
                                        }))
                                    );
                                }}
                            >
                                <Text style={styles.pickerText}>
                                    {roles.find(r => r.id === role)?.label}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <TouchableOpacity 
                            style={[styles.button, loading && styles.buttonDisabled]} 
                            onPress={handleLogin} 
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Login to Dashboard</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <TouchableOpacity>
                                <Text style={styles.link}>Forgot Password?</Text>
                            </TouchableOpacity>
                            <Text style={styles.footerText}>
                                Don't have an account?{' '}
                                <Text style={styles.link}>Contact Admin</Text>
                            </Text>
                        </View>

                        <View style={styles.securityNotice}>
                            <Text style={styles.securityText}>
                                <Text style={styles.securityBold}>🔒 Security Notice:</Text> This portal uses government-grade encryption and authentication. All activities are logged for audit purposes.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        paddingVertical: 40,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 16,
    },
    title: {
        fontSize: 30,
        fontWeight: '700',
        color: '#000080',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#4B5563',
        textAlign: 'center',
    },
    alertError: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444',
        padding: 12,
        borderRadius: 6,
        marginBottom: 16,
    },
    alertErrorText: {
        color: '#EF4444',
        fontSize: 12,
        textAlign: 'center',
    },
    alertInfo: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
        padding: 12,
        borderRadius: 6,
        marginBottom: 16,
    },
    alertInfoText: {
        color: '#3B82F6',
        fontSize: 12,
        textAlign: 'center',
    },
    alertSuccess: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderLeftWidth: 4,
        borderLeftColor: '#10B981',
        padding: 12,
        borderRadius: 6,
        marginBottom: 16,
    },
    alertSuccessText: {
        color: '#10B981',
        fontSize: 12,
        textAlign: 'center',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        color: '#111827',
    },
    pickerContainer: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 14,
    },
    pickerText: {
        fontSize: 16,
        color: '#111827',
    },
    button: {
        backgroundColor: '#FF9933',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        marginTop: 24,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
    },
    link: {
        color: '#FF9933',
        fontSize: 14,
    },
    securityNotice: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
        padding: 16,
        borderRadius: 6,
        marginTop: 24,
    },
    securityText: {
        fontSize: 12,
        color: '#3B82F6',
        lineHeight: 18,
    },
    securityBold: {
        fontWeight: '700',
    },
});
