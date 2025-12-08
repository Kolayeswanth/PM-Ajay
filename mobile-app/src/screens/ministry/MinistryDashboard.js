import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const MinistryDashboard = ({ navigation }) => {
    const { logout } = useAuth();

    const menuItems = [
        { title: 'Monitor Progress', screen: 'MonitorProgress', icon: 'stats-chart', color: 'bg-purple-500' },
        // Add other screens here as they are implemented
    ];

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-6 py-4 bg-white shadow-sm flex-row items-center justify-between">
                <Text className="text-xl font-bold text-gray-800">Ministry Dashboard</Text>
                <TouchableOpacity onPress={logout}>
                    <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                </TouchableOpacity>
            </View>
            <ScrollView className="p-4">
                <Text className="text-gray-500 mb-4 font-semibold uppercase text-xs tracking-wider">Overview</Text>
                <View className="flex-row flex-wrap justify-between">
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => navigation.navigate(item.screen)}
                            className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 aspect-square justify-center items-center"
                        >
                            <View className={`w-12 h-12 ${item.color} rounded-full justify-center items-center mb-3`}>
                                <Ionicons name={item.icon} size={24} color="white" />
                            </View>
                            <Text className="text-gray-800 font-bold text-center">{item.title}</Text>
                        </TouchableOpacity>
                    ))}

                    {/* Placeholder for future buttons */}
                    <TouchableOpacity
                        className="w-[48%] bg-gray-100 p-4 rounded-xl mb-4 aspect-square justify-center items-center border-dashed border-2 border-gray-300"
                    >
                        <Ionicons name="add" size={32} color="#9CA3AF" />
                        <Text className="text-gray-400 font-bold text-center mt-2">More Coming</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default MinistryDashboard;
