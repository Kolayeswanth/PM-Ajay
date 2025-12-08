import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const MinistryDashboard = () => {
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.content}>
        <View style={styles.dashboardCard}>
          <Text style={styles.title}>Ministry Dashboard</Text>
          <Text style={styles.subtitle}>Centre Admin Portal</Text>
          <Text style={styles.description}>
            Welcome to the PM-AJAY Ministry Dashboard. Manage national-level operations, fund allocations, and monitor state performance.
          </Text>
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dashboardCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001f3f',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
});

export default MinistryDashboard;
