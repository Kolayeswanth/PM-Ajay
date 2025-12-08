import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import ministry screens
import DashboardPanel from './DashboardPanel';
import ManageStateAdmins from './ManageStateAdmins';
import FundAllocation from './FundAllocation';
import FundReleased from './FundReleased';
import MonitorProgress from './MonitorProgress';
import IssueNotifications from './IssueNotifications';
import ReportsAnalytics from './ReportsAnalytics';

export default function MinistryDashboard({ navigation }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [user, setUser] = useState(null);
    const [sidebarVisible, setSidebarVisible] = useState(false);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        navigation.replace('Login');
    };

    const menuItems = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'admins', icon: '👥', label: 'Manage State Admins' },
        { id: 'funds', icon: '💰', label: 'Fund Allocation' },
        { id: 'released', icon: '💸', label: 'Fund Released' },
        { id: 'monitor', icon: '📈', label: 'Monitor Progress' },
        { id: 'notifications', icon: '📢', label: 'Notifications' },
        { id: 'reports', icon: '📑', label: 'Reports & Analytics' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardPanel />;
            case 'admins':
                return <ManageStateAdmins />;
            case 'funds':
                return <FundAllocation />;
            case 'released':
                return <FundReleased />;
            case 'monitor':
                return <MonitorProgress />;
            case 'notifications':
                return <IssueNotifications />;
            case 'reports':
                return <ReportsAnalytics />;
            default:
                return <DashboardPanel />;
        }
    };

    const getTabTitle = () => {
        const labels = {
            dashboard: 'Dashboard',
            admins: 'Manage State Admins',
            funds: 'Fund Allocation',
            released: 'Fund Released',
            monitor: 'Monitor Progress',
            notifications: 'Notifications',
            reports: 'Reports & Analytics'
        };
        return labels[activeTab] || 'Dashboard';
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#FF9933', '#138808']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => setSidebarVisible(!sidebarVisible)}>
                        <Text style={styles.menuIcon}>☰</Text>
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Ministry Dashboard</Text>
                        <Text style={styles.headerSubtitle}>{getTabTitle()}</Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout}>
                        <Text style={styles.logoutIcon}>🚪</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <View style={styles.mainContent}>
                {/* Sidebar */}
                {sidebarVisible && (
                    <View style={styles.sidebar}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.sidebarHeader}>
                                <Image
                                    source={require('../../assets/images/pmajay.png')}
                                    style={styles.sidebarLogo}
                                    resizeMode="contain"
                                />
                                <Text style={styles.sidebarTitle}>PM-AJAY</Text>
                                <Text style={styles.sidebarUser}>{user?.full_name || 'Admin'}</Text>
                            </View>
                            {menuItems.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.menuItem,
                                        activeTab === item.id && styles.menuItemActive
                                    ]}
                                    onPress={() => {
                                        setActiveTab(item.id);
                                        setSidebarVisible(false);
                                    }}
                                >
                                    <Text style={styles.menuIcon}>{item.icon}</Text>
                                    <Text style={[
                                        styles.menuLabel,
                                        activeTab === item.id && styles.menuLabelActive
                                    ]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Content Area */}
                <View style={styles.content}>
                    {renderContent()}
                </View>
            </View>

            {/* Bottom Navigation for quick access */}
            <View style={styles.bottomNav}>
                {menuItems.slice(0, 5).map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.bottomNavItem}
                        onPress={() => setActiveTab(item.id)}
                    >
                        <Text style={[
                            styles.bottomNavIcon,
                            activeTab === item.id && styles.bottomNavIconActive
                        ]}>
                            {item.icon}
                        </Text>
                        <Text style={[
                            styles.bottomNavLabel,
                            activeTab === item.id && styles.bottomNavLabelActive
                        ]}>
                            {item.label.split(' ')[0]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 15,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.9,
        marginTop: 2,
    },
    menuIcon: {
        fontSize: 24,
        color: '#fff',
    },
    logoutIcon: {
        fontSize: 22,
        color: '#fff',
    },
    mainContent: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebar: {
        width: 250,
        backgroundColor: '#fff',
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    sidebarHeader: {
        padding: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    sidebarLogo: {
        width: 60,
        height: 60,
        marginBottom: 10,
    },
    sidebarTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000080',
        marginBottom: 5,
    },
    sidebarUser: {
        fontSize: 14,
        color: '#6B7280',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    menuItemActive: {
        backgroundColor: '#FFF3E0',
        borderLeftWidth: 4,
        borderLeftColor: '#FF9933',
    },
    menuLabel: {
        fontSize: 14,
        color: '#374151',
        marginLeft: 10,
    },
    menuLabelActive: {
        fontWeight: '600',
        color: '#FF9933',
    },
    content: {
        flex: 1,
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingVertical: 8,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    bottomNavItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 5,
    },
    bottomNavIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    bottomNavIconActive: {
        transform: [{ scale: 1.2 }],
    },
    bottomNavLabel: {
        fontSize: 10,
        color: '#6B7280',
    },
    bottomNavLabelActive: {
        color: '#FF9933',
        fontWeight: '600',
    },
});
