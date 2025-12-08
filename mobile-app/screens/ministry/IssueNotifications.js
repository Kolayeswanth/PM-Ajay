import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';

const AUDIENCES = ['All States', 'Maharashtra', 'Karnataka', 'Gujarat', 'Tamil Nadu', 'Uttar Pradesh'];
const PRIORITIES = ['High', 'Medium', 'Low'];

const IssueNotifications = () => {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'Annual Plan Submission Deadline Extended',
            date: '2025-11-20',
            audience: 'All States',
            status: 'Sent',
            message: 'The deadline for Annual Plan submission has been extended to December 15, 2025.',
            priority: 'High'
        },
        {
            id: 2,
            title: 'New Guidelines for Fund Utilization',
            date: '2025-11-15',
            audience: 'All States',
            status: 'Sent',
            message: 'Updated guidelines for fund utilization under PM-AJAY scheme have been issued.',
            priority: 'Medium'
        },
        {
            id: 3,
            title: 'Meeting with Maharashtra State Admin',
            date: '2025-11-28',
            audience: 'Maharashtra',
            status: 'Scheduled',
            message: 'A review meeting is scheduled with Maharashtra State Admin on November 28, 2025.',
            priority: 'High'
        },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAudiencePickerOpen, setIsAudiencePickerOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        audience: 'All States',
        priority: 'Medium',
        scheduleDate: ''
    });

    const handleCreate = () => {
        if (!formData.title || !formData.message) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        const newNotification = {
            id: Date.now(),
            title: formData.title,
            message: formData.message,
            date: formData.scheduleDate || new Date().toISOString().split('T')[0],
            audience: formData.audience,
            priority: formData.priority,
            status: formData.scheduleDate ? 'Scheduled' : 'Sent'
        };

        setNotifications([newNotification, ...notifications]);
        Alert.alert('Success', `Notification "${formData.title}" ${formData.scheduleDate ? 'scheduled' : 'sent'} successfully`);
        setIsModalOpen(false);
        setFormData({ title: '', message: '', audience: 'All States', priority: 'Medium', scheduleDate: '' });
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return '#EF4444';
            case 'Medium': return '#F59E0B';
            case 'Low': return '#10B981';
            default: return '#6B7280';
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.createButton} onPress={() => setIsModalOpen(true)}>
                    <Text style={styles.createButtonText}>+ Create Notification</Text>
                </TouchableOpacity>
            </View>

            {/* Notifications List */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {notifications.map((notification) => (
                    <View key={notification.id} style={styles.notificationCard}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(notification.priority) + '20' }]}>
                                <Text style={[styles.priorityText, { color: getPriorityColor(notification.priority) }]}>
                                    {notification.priority}
                                </Text>
                            </View>
                            <View style={[
                                styles.statusBadge,
                                notification.status === 'Sent' ? styles.statusSent : styles.statusScheduled
                            ]}>
                                <Text style={styles.statusText}>{notification.status}</Text>
                            </View>
                        </View>

                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        <Text style={styles.notificationMessage} numberOfLines={2}>
                            {notification.message}
                        </Text>

                        <View style={styles.notificationFooter}>
                            <Text style={styles.footerText}>📅 {notification.date}</Text>
                            <Text style={styles.footerText}>👥 {notification.audience}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Create Notification Modal */}
            <Modal visible={isModalOpen} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Create Notification</Text>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TextInput
                                style={styles.input}
                                placeholder="Notification Title *"
                                value={formData.title}
                                onChangeText={(text) => setFormData({ ...formData, title: text })}
                                placeholderTextColor="#9CA3AF"
                            />

                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Notification Message *"
                                value={formData.message}
                                onChangeText={(text) => setFormData({ ...formData, message: text })}
                                multiline
                                numberOfLines={4}
                                placeholderTextColor="#9CA3AF"
                            />

                            <TouchableOpacity 
                                style={styles.input}
                                onPress={() => setIsAudiencePickerOpen(true)}
                            >
                                <Text style={styles.inputText}>👥 {formData.audience}</Text>
                            </TouchableOpacity>

                            <View style={styles.prioritySelector}>
                                <Text style={styles.label}>Priority:</Text>
                                <View style={styles.priorityButtons}>
                                    {PRIORITIES.map((priority) => (
                                        <TouchableOpacity
                                            key={priority}
                                            style={[
                                                styles.priorityButton,
                                                formData.priority === priority && { 
                                                    backgroundColor: getPriorityColor(priority) + '20',
                                                    borderColor: getPriorityColor(priority)
                                                }
                                            ]}
                                            onPress={() => setFormData({ ...formData, priority })}
                                        >
                                            <Text style={[
                                                styles.priorityButtonText,
                                                formData.priority === priority && { color: getPriorityColor(priority) }
                                            ]}>
                                                {priority}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <TextInput
                                style={styles.input}
                                placeholder="Schedule Date (Optional)"
                                value={formData.scheduleDate}
                                onChangeText={(text) => setFormData({ ...formData, scheduleDate: text })}
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
                                    onPress={handleCreate}
                                >
                                    <Text style={[styles.modalButtonText, styles.modalButtonTextSave]}>
                                        {formData.scheduleDate ? 'Schedule' : 'Send Now'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Audience Picker Modal */}
            <Modal visible={isAudiencePickerOpen} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Audience</Text>
                        <ScrollView>
                            {AUDIENCES.map((audience) => (
                                <TouchableOpacity
                                    key={audience}
                                    style={styles.audienceItem}
                                    onPress={() => {
                                        setFormData({ ...formData, audience });
                                        setIsAudiencePickerOpen(false);
                                    }}
                                >
                                    <Text style={styles.audienceItemText}>{audience}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity 
                            style={styles.modalButton}
                            onPress={() => setIsAudiencePickerOpen(false)}
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
    createButton: {
        backgroundColor: '#FF9933',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 15,
    },
    notificationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    priorityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    priorityText: {
        fontSize: 11,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusSent: {
        backgroundColor: '#D1FAE5',
    },
    statusScheduled: {
        backgroundColor: '#DBEAFE',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#10B981',
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 12,
    },
    notificationFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    footerText: {
        fontSize: 12,
        color: '#9CA3AF',
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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    prioritySelector: {
        marginBottom: 15,
    },
    priorityButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    priorityButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    priorityButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
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
    audienceItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    audienceItemText: {
        fontSize: 14,
        color: '#374151',
    },
});

export default IssueNotifications;
