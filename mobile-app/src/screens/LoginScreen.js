import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
      <View className="w-full max-w-sm">
        <Text className="text-3xl font-bold text-center text-blue-900 mb-8">
          PM Ajay Login
        </Text>

        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">Email Address</Text>
          <TextInput
            className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-base"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 mb-2 font-medium">Password</Text>
          <TextInput
            className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-base"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          className={`w-full bg-blue-600 p-4 rounded-lg shadow-sm ${loading ? 'opacity-70' : ''}`}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="text-white text-center font-bold text-lg">
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <View className="mt-6 flex-row justify-center">
            <Text className="text-gray-500">Don't have an account? </Text>
            <TouchableOpacity onPress={() => console.log('Navigate to Register')}>
                <Text className="text-blue-600 font-semibold">Contact Admin</Text>
            </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
