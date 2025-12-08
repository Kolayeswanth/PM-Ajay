import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';

const DashboardPanel = () => {
    const nationalStats = {
        totalStates: 36,
        totalDistricts: 766,
        totalProjects: 1248,
        totalFundAllocated: 125000000000,
        projectsCompleted: 456,
        projectsOngoing: 612,
        projectsApproved: 180,
        projectsProposed: 0
    };

    const formatCurrency = (amount) => {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
    };

    const StatCard = ({ icon, value, label, color, trend, trendValue }) => (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <Text style={styles.statIcon}>{icon}</Text>
            <View style={styles.statContent}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
                {trend && (
                    <Text style={[styles.statTrend, trend === 'positive' ? styles.trendPositive : styles.trendNegative]}>
                        {trendValue}
                    </Text>
                )}
            </View>
        </View>
    );

    const handleExportData = () => {
        Alert.alert(
            'Export Data',
            'Export functionality will download state-wise project data as CSV file.',
            [{ text: 'OK' }]
        );
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* National Statistics */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>National Statistics</Text>
                <View style={styles.statsGrid}>
                    <StatCard
                        icon="🏛️"
                        value={nationalStats.totalStates}
                        label="States/UTs"
                        color="#FF9933"
                    />
                    <StatCard
                        icon="🏘️"
                        value={nationalStats.totalDistricts}
                        label="Districts"
                        color="#138808"
                    />
                    <StatCard
                        icon="📊"
                        value={nationalStats.totalProjects}
                        label="Total Projects"
                        color="#000080"
                        trend="positive"
                        trendValue="+12% this year"
                    />
                    <StatCard
                        icon="💰"
                        value={formatCurrency(nationalStats.totalFundAllocated)}
                        label="Fund Allocated"
                        color="#10B981"
                    />
                </View>
            </View>

            {/* Project Status */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Project Status Overview</Text>
                <View style={styles.statsGrid}>
                    <StatCard
                        icon="✔️"
                        value={nationalStats.projectsCompleted}
                        label="Completed"
                        color="#10B981"
                        trend="positive"
                        trendValue="+8% this month"
                    />
                    <StatCard
                        icon="🚧"
                        value={nationalStats.projectsOngoing}
                        label="Ongoing"
                        color="#F59E0B"
                    />
                    <StatCard
                        icon="✅"
                        value={nationalStats.projectsApproved}
                        label="Approved"
                        color="#3B82F6"
                    />
                    <StatCard
                        icon="📝"
                        value={nationalStats.projectsProposed}
                        label="Pending"
                        color="#EF4444"
                    />
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <TouchableOpacity style={styles.actionCard}>
                        <Text style={styles.actionIcon}>💰</Text>
                        <Text style={styles.actionLabel}>Allocate Funds</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard}>
                        <Text style={styles.actionIcon}>👥</Text>
                        <Text style={styles.actionLabel}>Add Admin</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard}>
                        <Text style={styles.actionIcon}>📢</Text>
                        <Text style={styles.actionLabel}>Send Notice</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} onPress={handleExportData}>
                        <Text style={styles.actionIcon}>📥</Text>
                        <Text style={styles.actionLabel}>Export Data</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Recent Activities */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activities</Text>
                <View style={styles.activityList}>
                    {[
                        { icon: '💰', text: 'Fund allocated to Maharashtra - ₹500 Cr', time: '2 hours ago' },
                        { icon: '✅', text: 'Annual plan approved for Karnataka', time: '5 hours ago' },
                        { icon: '👥', text: 'New admin added for Gujarat', time: '1 day ago' },
                        { icon: '📢', text: 'Notification sent to all states', time: '2 days ago' }
                    ].map((activity, index) => (
                        <View key={index} style={styles.activityItem}>
                            <Text style={styles.activityIcon}>{activity.icon}</Text>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityText}>{activity.text}</Text>
                                <Text style={styles.activityTime}>{activity.time}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* State Performance Summary */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Performing States</Text>
                <View style={styles.performanceList}>
                    {[
                        { state: 'Maharashtra', progress: 85, projects: 156 },
                        { state: 'Karnataka', progress: 78, projects: 142 },
                        { state: 'Tamil Nadu', progress: 76, projects: 138 },
                        { state: 'Gujarat', progress: 72, projects: 125 },
                        { state: 'Uttar Pradesh', progress: 68, projects: 118 }
                    ].map((item, index) => (
                        <View key={index} style={styles.performanceItem}>
                            <View style={styles.performanceHeader}>
                                <Text style={styles.performanceState}>{item.state}</Text>
                                <Text style={styles.performanceProgress}>{item.progress}%</Text>
                            </View>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
                            </View>
                            <Text style={styles.performanceProjects}>{item.projects} projects</Text>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    section: {
        padding: 15,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 15,
    },
    statsGrid: {
        gap: 10,
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    statIcon: {
        fontSize: 32,
        marginRight: 15,
    },
    statContent: {
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },
    statLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    statTrend: {
        fontSize: 12,
        marginTop: 4,
    },
    trendPositive: {
        color: '#10B981',
    },
    trendNegative: {
        color: '#EF4444',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    actionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        width: '48%',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    actionIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 12,
        color: '#374151',
        textAlign: 'center',
        fontWeight: '500',
    },
    activityList: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    activityIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityText: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 4,
    },
    activityTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    performanceList: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
    },
    performanceItem: {
        marginBottom: 20,
    },
    performanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    performanceState: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    performanceProgress: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FF9933',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FF9933',
        borderRadius: 4,
    },
    performanceProjects: {
        fontSize: 12,
        color: '#6B7280',
    },
});

export default DashboardPanel;
