import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const THEME = {
    primary: '#7C3AED',
    secondary: '#EC4899',
    accent: '#F59E0B',
    background: '#F5F3FF',
    text: '#4C1D95',
    textLight: '#6B7280',
    white: '#FFFFFF',
    grid: '#E5E7EB',
    completed: '#10B981',
    pending: '#F59E0B',
    notStarted: '#EF4444',
};

const generateStateData = (stateName) => {
    // Simplified specific generation logic for mobile demo
    return {
        name: stateName,
        fundUtilization: {
            utilized: Math.floor(Math.random() * 60) + 30,
            total: 100,
        },
        projectTrends: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    data: [20, 45, 28, 80, 99, 43],
                    color: (opacity = 1) => THEME.completed,
                    strokeWidth: 2
                }
            ]
        },
        components: {
            'Adarsh Gram': { progress: Math.floor(Math.random() * 30) + 70, color: '#7C3AED' },
            GIA: { progress: Math.floor(Math.random() * 40) + 40, color: '#EC4899' },
            Hostel: { progress: Math.floor(Math.random() * 30) + 20, color: '#F59E0B' },
        },
    };
};

const generateNationalOverview = (component) => {
    return {
        utilization: component === 'All Components' ? 78 : 65,
        completed: component === 'All Components' ? 65 : 55,
        beneficiaries: component === 'All Components' ? '1.2M' : '450K',
    };
};

const MonitorProgress = ({ navigation }) => {
    const [selectedComponent, setSelectedComponent] = useState('All Components');
    const [loading, setLoading] = useState(false);
    const [nationalOverview, setNationalOverview] = useState(generateNationalOverview('All Components'));

    // Handle Component Selection (Mock dropdown)
    const components = ['All Components', 'Adarsh Gram', 'GIA', 'Hostel'];

    useEffect(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setNationalOverview(generateNationalOverview(selectedComponent));
            setLoading(false);
        }, 500);
    }, [selectedComponent]);

    const chartConfig = {
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#ffffff",
        color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false
    };

    const pieData = [
        {
            name: "Utilized",
            population: nationalOverview.utilization,
            color: THEME.primary,
            legendFontColor: "#7F7F7F",
            legendFontSize: 12
        },
        {
            name: "Remaining",
            population: 100 - nationalOverview.utilization,
            color: "#E5E7EB",
            legendFontColor: "#7F7F7F",
            legendFontSize: 12
        }
    ];

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="px-6 py-4 bg-white shadow-sm flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={THEME.text} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Monitor Progress</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>

                {/* Component Filter */}
                <View className="mb-6">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        {components.map((comp) => (
                            <TouchableOpacity
                                key={comp}
                                onPress={() => setSelectedComponent(comp)}
                                className={`px-4 py-2 mr-3 rounded-full border ${selectedComponent === comp
                                        ? 'bg-purple-600 border-purple-600'
                                        : 'bg-white border-gray-300'
                                    }`}
                            >
                                <Text className={
                                    selectedComponent === comp ? 'text-white font-medium' : 'text-gray-600'
                                }>
                                    {comp}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {loading ? (
                    <View className="h-64 justify-center items-center">
                        <ActivityIndicator size="large" color={THEME.primary} />
                    </View>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <View className="flex-row flex-wrap justify-between mb-6">
                            <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4">
                                <View className="w-10 h-10 bg-purple-100 rounded-lg justify-center items-center mb-2">
                                    <Ionicons name="pie-chart" size={20} color={THEME.primary} />
                                </View>
                                <Text className="text-2xl font-bold text-gray-900">{nationalOverview.utilization}%</Text>
                                <Text className="text-xs text-gray-500 uppercase font-semibold">Utilization</Text>
                            </View>
                            <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4">
                                <View className="w-10 h-10 bg-green-100 rounded-lg justify-center items-center mb-2">
                                    <Ionicons name="checkmark-circle" size={20} color={THEME.completed} />
                                </View>
                                <Text className="text-2xl font-bold text-gray-900">{nationalOverview.completed}%</Text>
                                <Text className="text-xs text-gray-500 uppercase font-semibold">Completed</Text>
                            </View>
                            <View className="w-full bg-white p-4 rounded-xl shadow-sm mb-4 flex-row items-center justify-between">
                                <View>
                                    <Text className="text-2xl font-bold text-gray-900">{nationalOverview.beneficiaries}</Text>
                                    <Text className="text-xs text-gray-500 uppercase font-semibold">Beneficiaries Impacted</Text>
                                </View>
                                <View className="w-12 h-12 bg-orange-100 rounded-full justify-center items-center">
                                    <Ionicons name="people" size={24} color={THEME.accent} />
                                </View>
                            </View>
                        </View>

                        {/* Pie Chart Section */}
                        <View className="bg-white p-4 rounded-xl shadow-sm mb-6 items-center">
                            <Text className="text-lg font-bold text-gray-800 mb-4 self-start">Fund Utilization</Text>
                            <PieChart
                                data={pieData}
                                width={screenWidth - 60}
                                height={220}
                                chartConfig={chartConfig}
                                accessor={"population"}
                                backgroundColor={"transparent"}
                                paddingLeft={"15"}
                                center={[10, 0]}
                                absolute
                            />
                        </View>

                        {/* Line Chart Section */}
                        <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
                            <Text className="text-lg font-bold text-gray-800 mb-4">Project Trends</Text>
                            <LineChart
                                data={{
                                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                                    datasets: [
                                        {
                                            data: [
                                                Math.random() * 100,
                                                Math.random() * 100,
                                                Math.random() * 100,
                                                Math.random() * 100,
                                                Math.random() * 100,
                                                Math.random() * 100
                                            ]
                                        }
                                    ]
                                }}
                                width={screenWidth - 60} // from react-native
                                height={220}
                                yAxisLabel=""
                                yAxisSuffix="%"
                                yAxisInterval={1} // optional, defaults to 1
                                chartConfig={{
                                    backgroundColor: "#ffffff",
                                    backgroundGradientFrom: "#ffffff",
                                    backgroundGradientTo: "#ffffff",
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                                    style: {
                                        borderRadius: 16
                                    },
                                    propsForDots: {
                                        r: "6",
                                        strokeWidth: "2",
                                        stroke: "#7C3AED"
                                    }
                                }}
                                bezier
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16
                                }}
                            />
                        </View>

                        {/* Map Placeholder */}
                        <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
                            <Text className="text-lg font-bold text-gray-800 mb-2">Geographic Overview</Text>
                            <View className="h-48 bg-purple-50 rounded-lg justify-center items-center border border-dashed border-purple-200">
                                <Ionicons name="map" size={48} color={THEME.primary} />
                                <Text className="text-purple-600 mt-2 font-medium">Interactive Map Coming Soon</Text>
                            </View>
                        </View>

                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default MonitorProgress;
