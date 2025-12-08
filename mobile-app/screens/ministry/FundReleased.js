import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const FundReleased = () => {
    const [releases, setReleases] = useState([
        { id: 1, state: 'Maharashtra', amount: 300, releaseDate: '2025-11-20', installment: '1st', component: 'Adarsh Gram', status: 'Released' },
        { id: 2, state: 'Karnataka', amount: 200, releaseDate: '2025-11-18', installment: '1st', component: 'Hostel', status: 'Released' },
        { id: 3, state: 'Gujarat', amount: 150, releaseDate: '2025-11-15', installment: '2nd', component: 'GIA', status: 'Released' },
        { id: 4, state: 'Tamil Nadu', amount: 250, releaseDate: '2025-11-10', installment: '1st', component: 'Adarsh Gram', status: 'Released' },
    ]);

    const [filter, setFilter] = useState('all');

    const formatCurrency = (amount) => `₹${amount} Cr`;

    const filteredReleases = filter === 'all' 
        ? releases 
        : releases.filter(r => r.component === filter);

    const totalReleased = releases.reduce((sum, r) => sum + r.amount, 0);

    return (
        <View style={styles.container}>
            {/* Summary */}
            <View style={styles.summary}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>₹{totalReleased} Cr</Text>
                    <Text style={styles.summaryLabel}>Total Released</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{releases.length}</Text>
                    <Text style={styles.summaryLabel}>Total Releases</Text>
                </View>
            </View>

            {/* Filters */}
            <View style={styles.filters}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['all', 'Adarsh Gram', 'GIA', 'Hostel'].map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterChip, filter === f && styles.filterChipActive]}
                            onPress={() => setFilter(f)}
                        >
                            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                                {f === 'all' ? 'All' : f}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Releases List */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {filteredReleases.map((release) => (
                    <View key={release.id} style={styles.releaseCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.stateName}>🏛️ {release.state}</Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>{release.status}</Text>
                            </View>
                        </View>

                        <View style={styles.amountSection}>
                            <Text style={styles.amountValue}>{formatCurrency(release.amount)}</Text>
                            <Text style={styles.installmentText}>{release.installment} Installment</Text>
                        </View>

                        <View style={styles.cardDetails}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Component:</Text>
                                <Text style={styles.detailValue}>{release.component}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Release Date:</Text>
                                <Text style={styles.detailValue}>{release.releaseDate}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    summary: {
        flexDirection: 'row',
        padding: 15,
        gap: 10,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#10B981',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    filters: {
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    filterChip: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: '#FF9933',
    },
    filterText: {
        fontSize: 14,
        color: '#6B7280',
    },
    filterTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 15,
    },
    releaseCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    stateName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    statusBadge: {
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#10B981',
    },
    amountSection: {
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
    },
    amountValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#10B981',
        marginBottom: 4,
    },
    installmentText: {
        fontSize: 13,
        color: '#6B7280',
    },
    cardDetails: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
});

export default FundReleased;
