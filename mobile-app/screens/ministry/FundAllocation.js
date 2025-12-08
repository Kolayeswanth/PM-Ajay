import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';

const INDIA_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const COMPONENTS = ['Adarsh Gram', 'GIA', 'Hostel', 'Other'];

const FundAllocation = () => {
    const [allocations, setAllocations] = useState([
        { id: 1, state: 'Maharashtra', amount: 500, component: ['Adarsh Gram', 'GIA'], date: '2025-11-15', officer: 'OFF001', status: 'Allocated' },
        { id: 2, state: 'Karnataka', amount: 350, component: ['Hostel'], date: '2025-11-10', officer: 'OFF002', status: 'Allocated' },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStatePickerOpen, setIsStatePickerOpen] = useState(false);
    const [formData, setFormData] = useState({
        state: '',
        component: [],
        amount: '',
        date: new Date().toISOString().split('T')[0],
        officer: '',
        allocatorName: '',
        allocatorRole: 'Ministry Admin',
        allocatorPhone: ''
    });

    const handleAdd = () => {
        setFormData({
            state: '',
            component: [],
            amount: '',
            date: new Date().toISOString().split('T')[0],
            officer: '',
            allocatorName: '',
            allocatorRole: 'Ministry Admin',
            allocatorPhone: ''
        });
        setIsModalOpen(true);
    };

    const toggleComponent = (comp) => {
        setFormData(prev => ({
            ...prev,
            component: prev.component.includes(comp)
                ? prev.component.filter(c => c !== comp)
                : [...prev.component, comp]
        }));
    };

    const handleAllocate = () => {
        if (!formData.state || !formData.amount || !formData.officer || !formData.allocatorName || !formData.allocatorPhone) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        const amountCr = parseFloat(formData.amount);
        if (isNaN(amountCr) || amountCr <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        const newAllocation = {
            id: Date.now(),
            state: formData.state,
            amount: amountCr,
            component: formData.component,
            date: formData.date,
            officer: formData.officer,
            status: 'Allocated'
        };

        setAllocations([newAllocation, ...allocations]);

        Alert.alert(
            'Success',
            `✅ FUND ALLOCATION SUCCESSFUL!\n\n` +
            `📊 Details:\n` +
            `• State: ${formData.state}\n` +
            `• Amount: ₹${amountCr} Cr\n` +
            `• Component: ${formData.component.join(', ') || 'N/A'}\n` +
            `• Date: ${formData.date}\n` +
            `• Officer ID: ${formData.officer}\n\n` +
            `📱 WhatsApp notification sent to ${formData.allocatorName} (+91${formData.allocatorPhone})`
        );

        setIsModalOpen(false);
    };

    const formatCurrency = (amount) => `₹${amount} Cr`;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                    <Text style={styles.addButtonText}>+ Allocate Fund</Text>
                </TouchableOpacity>
            </View>

            {/* Summary Stats */}
            <View style={styles.summary}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>₹{allocations.reduce((sum, a) => sum + a.amount, 0)} Cr</Text>
                    <Text style={styles.summaryLabel}>Total Allocated</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{allocations.length}</Text>
                    <Text style={styles.summaryLabel}>Allocations</Text>
                </View>
            </View>

            {/* Allocations List */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {allocations.map((allocation) => (
                    <View key={allocation.id} style={styles.allocationCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.stateName}>🏛️ {allocation.state}</Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>{allocation.status}</Text>
                            </View>
                        </View>

                        <View style={styles.cardDetails}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Amount:</Text>
                                <Text style={styles.detailValue}>{formatCurrency(allocation.amount)}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Component:</Text>
                                <Text style={styles.detailValue}>{allocation.component.join(', ') || 'N/A'}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Date:</Text>
                                <Text style={styles.detailValue}>{allocation.date}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Officer ID:</Text>
                                <Text style={styles.detailValue}>{allocation.officer}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Allocation Modal */}
            <Modal visible={isModalOpen} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Allocate Fund</Text>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TouchableOpacity 
                                style={styles.input}
                                onPress={() => setIsStatePickerOpen(true)}
                            >
                                <Text style={formData.state ? styles.inputText : styles.inputPlaceholder}>
                                    {formData.state || 'Select State/UT *'}
                                </Text>
                            </TouchableOpacity>

                            <Text style={styles.label}>Select Components:</Text>
                            <View style={styles.componentList}>
                                {COMPONENTS.map(comp => (
                                    <TouchableOpacity
                                        key={comp}
                                        style={[
                                            styles.componentItem,
                                            formData.component.includes(comp) && styles.componentItemSelected
                                        ]}
                                        onPress={() => toggleComponent(comp)}
                                    >
                                        <Text style={[
                                            styles.componentText,
                                            formData.component.includes(comp) && styles.componentTextSelected
                                        ]}>
                                            {formData.component.includes(comp) ? '✓ ' : ''}{comp}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TextInput
                                style={styles.input}
                                placeholder="Amount (in Crores) *"
                                value={formData.amount}
                                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                                keyboardType="numeric"
                                placeholderTextColor="#9CA3AF"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Officer ID *"
                                value={formData.officer}
                                onChangeText={(text) => setFormData({ ...formData, officer: text })}
                                placeholderTextColor="#9CA3AF"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Allocator Name *"
                                value={formData.allocatorName}
                                onChangeText={(text) => setFormData({ ...formData, allocatorName: text })}
                                placeholderTextColor="#9CA3AF"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Allocator Phone (10 digits) *"
                                value={formData.allocatorPhone}
                                onChangeText={(text) => setFormData({ ...formData, allocatorPhone: text })}
                                keyboardType="phone-pad"
                                maxLength={10}
                                placeholderTextColor="#9CA3AF"
                            />

                            <View style={styles.modalActions}>
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.modalButtonCancel]}
                                    onPress={() => setIsModalOpen(false)}
                                >
                                    <Text style={styles.modalButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.modalButtonSave]}
                                    onPress={handleAllocate}
                                >
                                    <Text style={[styles.modalButtonText, styles.modalButtonTextSave]}>
                                        Allocate & Notify
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* State Picker Modal */}
            <Modal visible={isStatePickerOpen} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select State/UT</Text>
                        <ScrollView>
                            {INDIA_STATES.map((state) => (
                                <TouchableOpacity
                                    key={state}
                                    style={styles.stateItem}
                                    onPress={() => {
                                        setFormData({ ...formData, state });
                                        setIsStatePickerOpen(false);
                                    }}
                                >
                                    <Text style={styles.stateItemText}>{state}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity 
                            style={styles.modalButton}
                            onPress={() => setIsStatePickerOpen(false)}
                        >
                            <Text style={styles.modalButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    addButton: {
        backgroundColor: '#FF9933',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
        color: '#FF9933',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    content: {
        flex: 1,
        padding: 15,
    },
    allocationCard: {
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
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
        fontSize: 14,
        marginBottom: 15,
    },
    inputText: {
        color: '#111827',
    },
    inputPlaceholder: {
        color: '#9CA3AF',
    },
    componentList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 15,
    },
    componentItem: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    componentItemSelected: {
        backgroundColor: '#FFF3E0',
        borderColor: '#FF9933',
    },
    componentText: {
        fontSize: 13,
        color: '#374151',
    },
    componentTextSelected: {
        color: '#FF9933',
        fontWeight: '600',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
    },
    modalButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#E5E7EB',
    },
    modalButtonCancel: {
        backgroundColor: '#E5E7EB',
    },
    modalButtonSave: {
        backgroundColor: '#FF9933',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    modalButtonTextSave: {
        color: '#fff',
    },
    stateItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    stateItemText: {
        fontSize: 14,
        color: '#374151',
    },
});

export default FundAllocation;
