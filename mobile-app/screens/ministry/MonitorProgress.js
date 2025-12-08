import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const MonitorProgress = () => {
    const regions = [
        { name: 'North', progress: 72, states: 8 },
        { name: 'South', progress: 85, states: 6 },
        { name: 'East', progress: 68, states: 7 },
        { name: 'West', progress: 78, states: 5 },
        { name: 'North-East', progress: 65, states: 8 }
    ];

    const topStates = [
        { state: 'Maharashtra', progress: 85, projects: 156, funds: 78 },
        { state: 'Karnataka', progress: 82, projects: 142, funds: 75 },
        { state: 'Tamil Nadu', progress: 80, projects: 138, funds: 72 },
        { state: 'Gujarat', progress: 76, projects: 125, funds: 68 },
        { state: 'Uttar Pradesh', progress: 72, projects: 118, funds: 65 }
    ];

    const StatCard = ({ icon, value, label, color }) => (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <Text style={styles.statIcon}>{icon}</Text>
            <View style={styles.statContent}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Key Metrics */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
                <View style={styles.statsGrid}>
                    <StatCard
                        icon="📈"
                        value="78%"
                        label="Fund Utilization"
                        color="#FF9933"
                    />
                    <StatCard
                        icon="🏗️"
                        value="65%"
                        label="Project Completion"
                        color="#138808"
                    />
                    <StatCard
                        icon="👥"
                        value="1.2M"
                        label="Beneficiaries"
                        color="#000080"
                    />
                </View>
            </View>

            {/* Region-wise Performance */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Region-wise Performance</Text>
                <View style={styles.regionList}>
                    {regions.map((region, index) => (
                        <View key={index} style={styles.regionItem}>
                            <View style={styles.regionHeader}>
                                <Text style={styles.regionName}>{region.name}</Text>
                                <Text style={styles.regionProgress}>{region.progress}%</Text>
                            </View>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${region.progress}%` }]} />
                            </View>
                            <Text style={styles.regionStates}>{region.states} states</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Top Performing States */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Performing States</Text>
                <View style={styles.stateList}>
                    {topStates.map((item, index) => (
                        <View key={index} style={styles.stateCard}>
                            <View style={styles.stateRank}>
                                <Text style={styles.rankNumber}>{index + 1}</Text>
                            </View>
                            <View style={styles.stateContent}>
                                <Text style={styles.stateName}>{item.state}</Text>
                                <View style={styles.stateMetrics}>
                                    <View style={styles.metricItem}>
                                        <Text style={styles.metricLabel}>Progress</Text>
                                        <Text style={styles.metricValue}>{item.progress}%</Text>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Text style={styles.metricLabel}>Projects</Text>
                                        <Text style={styles.metricValue}>{item.projects}</Text>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Text style={styles.metricLabel}>Fund Used</Text>
                                        <Text style={styles.metricValue}>{item.funds}%</Text>
                                    </View>
                                </View>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
                                </View>
                            </View>
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
    regionList: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
    },
    regionItem: {
        marginBottom: 20,
    },
    regionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    regionName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    regionProgress: {
        fontSize: 15,
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
    regionStates: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    stateList: {
        gap: 12,
    },
    stateCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        elevation: 2,
    },
    stateRank: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF3E0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    rankNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FF9933',
    },
    stateContent: {
        flex: 1,
    },
    stateName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    stateMetrics: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 15,
    },
    metricItem: {
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 11,
        color: '#6B7280',
        marginBottom: 2,
    },
    metricValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
});

export default MonitorProgress;
