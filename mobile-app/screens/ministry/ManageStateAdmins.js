import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';

const INDIA_STATES_AND_UT = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const ManageStateAdmins = () => {
    const [admins, setAdmins] = useState([
        { id: 1, state: 'Maharashtra', name: 'Rajesh Kumar', email: 'rajesh.k@mah.gov.in', phone: '9876543210', status: 'Active', username: 'rajesh.mah', password: 'Mah@2024' },
        { id: 2, state: 'Karnataka', name: 'Suresh Patil', email: 'suresh.p@kar.gov.in', phone: '9876543211', status: 'Active', username: 'suresh.kar', password: 'Kar@2024' },
        { id: 3, state: 'Gujarat', name: 'Amit Shah', email: 'amit.s@guj.gov.in', phone: '9876543212', status: 'Inactive', username: 'amit.guj', password: 'Guj@2024' },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStatePickerOpen, setIsStatePickerOpen] = useState(false);
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [formData, setFormData] = useState({ 
        state: '', name: '', email: '', phone: '', status: true, username: '', password: '' 
    });
    const [searchQuery, setSearchQuery] = useState('');

    const generateCredentials = (name, state) => {
        const firstName = name.split(' ')[0].toLowerCase();
        const stateCode = state.substring(0, 3).toLowerCase();
        return {
            username: `${firstName}.${stateCode}`,
            password: `${state.substring(0, 3)}@2024`
        };
    };

    const handleAdd = () => {
        setCurrentAdmin(null);
        setFormData({ state: '', name: '', email: '', phone: '', status: true, username: '', password: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (admin) => {
        setCurrentAdmin(admin);
        setFormData({ ...admin, status: admin.status === 'Active' });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.email || !formData.phone || !formData.state) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        if (currentAdmin) {
            setAdmins(admins.map(a => 
                a.id === currentAdmin.id 
                    ? { ...formData, id: a.id, status: formData.status ? 'Active' : 'Inactive' } 
                    : a
            ));
            Alert.alert('Success', `Admin "${formData.name}" updated successfully`);
        } else {
            const creds = generateCredentials(formData.name, formData.state);
            setAdmins([...admins, { 
                ...formData, 
                ...creds,
                id: Date.now(), 
                status: formData.status ? 'Active' : 'Inactive' 
            }]);
            Alert.alert('Success', `Admin "${formData.name}" added successfully\nUsername: ${creds.username}\nPassword: ${creds.password}`);
        }
        setIsModalOpen(false);
    };

    const handleToggleStatus = (admin) => {
        const newStatus = admin.status === 'Active' ? 'Inactive' : 'Active';
        setAdmins(admins.map(a => a.id === admin.id ? { ...a, status: newStatus } : a));
        Alert.alert('Success', `Admin ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`);
    };

    const filteredAdmins = admins.filter(admin =>
        admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.state.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            {/* Header Actions */}
            <View style={styles.header}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search admins..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                    <Text style={styles.addButtonText}>+ Add Admin</Text>
                </TouchableOpacity>
            </View>

            {/* Admins List */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {filteredAdmins.map((admin) => (
                    <View key={admin.id} style={styles.adminCard}>
                        <View style={styles.adminHeader}>
                            <View style={styles.adminInfo}>
                                <Text style={styles.adminName}>{admin.name}</Text>
                                <Text style={styles.adminState}>🏛️ {admin.state}</Text>
                            </View>
                            <View style={[
                                styles.statusBadge,
                                admin.status === 'Active' ? styles.statusActive : styles.statusInactive
                            ]}>
                                <Text style={styles.statusText}>{admin.status}</Text>
                            </View>
                        </View>

                        <View style={styles.adminDetails}>
                            <Text style={styles.detailText}>📧 {admin.email}</Text>
                            <Text style={styles.detailText}>📱 {admin.phone}</Text>
                            <Text style={styles.detailText}>👤 {admin.username}</Text>
                        </View>

                        <View style={styles.adminActions}>
                            <TouchableOpacity 
                                style={styles.actionButton} 
                                onPress={() => handleEdit(admin)}
                            >
                                <Text style={styles.actionButtonText}>✏️ Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.actionButtonToggle]}
                                onPress={() => handleToggleStatus(admin)}
                            >
                                <Text style={styles.actionButtonText}>
                                    {admin.status === 'Active' ? '🚫 Deactivate' : '✅ Activate'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Add/Edit Modal */}
            <Modal visible={isModalOpen} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {currentAdmin ? 'Edit Admin' : 'Add New Admin'}
                        </Text>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TouchableOpacity 
                                style={styles.input}
                                onPress={() => setIsStatePickerOpen(true)}
                            >
                                <Text style={formData.state ? styles.inputText : styles.inputPlaceholder}>
                                    {formData.state || 'Select State/UT'}
                                </Text>
                            </TouchableOpacity>

                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholderTextColor="#9CA3AF"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor="#9CA3AF"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Phone"
                                value={formData.phone}
                                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                keyboardType="phone-pad"
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
                                    onPress={handleSave}
                                >
                                    <Text style={[styles.modalButtonText, styles.modalButtonTextSave]}>
                                        Save
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
                            {INDIA_STATES_AND_UT.map((state) => (
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
        gap: 10,
    },
    searchInput: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
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
    content: {
        flex: 1,
        padding: 15,
    },
    adminCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    adminHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    adminInfo: {
        flex: 1,
    },
    adminName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    adminState: {
        fontSize: 14,
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusActive: {
        backgroundColor: '#D1FAE5',
    },
    statusInactive: {
        backgroundColor: '#FEE2E2',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    adminDetails: {
        marginBottom: 12,
        gap: 6,
    },
    detailText: {
        fontSize: 13,
        color: '#4B5563',
    },
    adminActions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionButtonToggle: {
        backgroundColor: '#FEF3C7',
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#374151',
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

export default ManageStateAdmins;
