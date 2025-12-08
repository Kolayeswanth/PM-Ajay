import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';

const ReportsAnalytics = () => {
    const reports = [
        {
            id: 1,
            title: 'Fund Utilization Report',
            description: 'Comprehensive report of fund allocation and utilization across all states',
            icon: '💰',
            type: 'Financial',
            lastUpdated: '2025-12-08'
        },
        {
            id: 2,
            title: 'Project Progress Report',
            description: 'State-wise project status and completion metrics',
            icon: '📊',
            type: 'Progress',
            lastUpdated: '2025-12-07'
        },
        {
            id: 3,
            title: 'State Admin Activity Report',
            description: 'Activity log and performance of state administrators',
            icon: '👥',
            type: 'Administrative',
            lastUpdated: '2025-12-06'
        },
        {
            id: 4,
            title: 'Beneficiary Impact Report',
            description: 'Analysis of beneficiaries reached and impact assessment',
            icon: '🎯',
            type: 'Impact',
            lastUpdated: '2025-12-05'
        },
        {
            id: 5,
            title: 'Component-wise Analysis',
            description: 'Detailed breakdown of Adarsh Gram, GIA, and Hostel components',
            icon: '📈',
            type: 'Analytics',
            lastUpdated: '2025-12-04'
        },
        {
            id: 6,
            title: 'Annual Performance Dashboard',
            description: 'Year-over-year comparison and annual performance metrics',
            icon: '📅',
            type: 'Annual',
            lastUpdated: '2025-12-01'
        }
    ];

    const stats = [
        { label: 'Total Reports', value: '24', icon: '📑', color: '#FF9933' },
        { label: 'This Month', value: '8', icon: '📊', color: '#138808' },
        { label: 'Scheduled', value: '5', icon: '⏰', color: '#3B82F6' }
    ];

    const handleDownload = (report) => {
        Alert.alert(
            'Download Report',
            `Downloading ${report.title}...\n\nThis will generate and download the report as PDF.`,
            [{ text: 'OK' }]
        );
    };

    const handleGenerateCustom = () => {
        Alert.alert(
            'Generate Custom Report',
            'Custom report generation feature will allow you to select specific parameters and date ranges.',
            [{ text: 'OK' }]
        );
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Stats Overview */}
            <View style={styles.statsSection}>
                {stats.map((stat, index) => (
                    <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
                        <Text style={styles.statIcon}>{stat.icon}</Text>
                        <View style={styles.statContent}>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <TouchableOpacity style={styles.actionCard} onPress={handleGenerateCustom}>
                        <Text style={styles.actionIcon}>🔧</Text>
                        <Text style={styles.actionLabel}>Custom Report</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard}>
                        <Text style={styles.actionIcon}>📤</Text>
                        <Text style={styles.actionLabel}>Export All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard}>
                        <Text style={styles.actionIcon}>⏰</Text>
                        <Text style={styles.actionLabel}>Schedule Report</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard}>
                        <Text style={styles.actionIcon}>📧</Text>
                        <Text style={styles.actionLabel}>Email Reports</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Available Reports */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Available Reports</Text>
                <View style={styles.reportsList}>
                    {reports.map((report) => (
                        <View key={report.id} style={styles.reportCard}>
                            <View style={styles.reportHeader}>
                                <View style={styles.reportIconContainer}>
                                    <Text style={styles.reportIcon}>{report.icon}</Text>
                                </View>
                                <View style={styles.reportInfo}>
                                    <Text style={styles.reportTitle}>{report.title}</Text>
                                    <Text style={styles.reportDescription}>{report.description}</Text>
                                    <View style={styles.reportMeta}>
                                        <View style={styles.typeBadge}>
                                            <Text style={styles.typeText}>{report.type}</Text>
                                        </View>
                                        <Text style={styles.reportDate}>Updated: {report.lastUpdated}</Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity 
                                style={styles.downloadButton}
                                onPress={() => handleDownload(report)}
                            >
                                <Text style={styles.downloadButtonText}>📥 Download</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>

            {/* Analytics Insights */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Key Insights</Text>
                <View style={styles.insightsList}>
                    <View style={styles.insightCard}>
                        <Text style={styles.insightIcon}>📈</Text>
                        <Text style={styles.insightText}>
                            Fund utilization increased by 12% this quarter
                        </Text>
                    </View>
                    <View style={styles.insightCard}>
                        <Text style={styles.insightIcon}>🏆</Text>
                        <Text style={styles.insightText}>
                            5 states achieved 80%+ project completion rate
                        </Text>
                    </View>
                    <View style={styles.insightCard}>
                        <Text style={styles.insightIcon}>👥</Text>
                        <Text style={styles.insightText}>
                            1.2M beneficiaries reached across all components
                        </Text>
                    </View>
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
    statsSection: {
        padding: 15,
        gap: 10,
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: 4,
        elevation: 2,
    },
    statIcon: {
        fontSize: 28,
        marginRight: 15,
    },
    statContent: {
        flex: 1,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
    },
    statLabel: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
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
    },
    actionIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 12,
        color: '#374151',
        textAlign: 'center',
        fontWeight: '500',
    },
    reportsList: {
        gap: 12,
    },
    reportCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        elevation: 2,
    },
    reportHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    reportIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#FFF3E0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    reportIcon: {
        fontSize: 24,
    },
    reportInfo: {
        flex: 1,
    },
    reportTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    reportDescription: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
        marginBottom: 8,
    },
    reportMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    typeBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    typeText: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '500',
    },
    reportDate: {
        fontSize: 11,
        color: '#9CA3AF',
    },
    downloadButton: {
        backgroundColor: '#FF9933',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    downloadButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    insightsList: {
        gap: 10,
    },
    insightCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
    },
    insightIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    insightText: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
});

export default ReportsAnalytics;
