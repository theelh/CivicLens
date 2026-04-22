import { Stack, Tabs, Redirect, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';

  const { user, isLoading } = useAuth();
  const router = useRouter();


  if (!user) {
    return <Redirect href="/dashboard" />;
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={dark ? '#fff' : '#0a7ea4'} />
      </View>
    );
  }


  return (
    <Tabs
      screenOptions={{                        
        tabBarActiveTintColor: "#2369A4",
        headerShown: false,
        headerTitle: 'Home',
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name='index'
        options={{
          headerBackground: () => (
            <LinearGradient
              colors={[dark ? '#080c14' : '#dbeafe', '#2369A4']} // Light gradient colors
              start={{ x: 0, y: 1 }}   // top
              end={{ x: 0, y: 0 }}     // bottom
              style={{ flex: 1 }}
            />

          ),
          headerShown: true,
          title: 'Welcome',
          headerTitle: 'Welcome', // Ensure headerTitle is explicitly set for consistency
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          headerBackground: () => (
            <LinearGradient
              colors={[dark ? '#080c14' : '#f8fafc', '#2369A4']} // Light gradient colors
              start={{ x: 0, y: 1 }}   // top
              end={{ x: 0, y: 0 }}     // bottom
              style={{ flex: 1 }}
            />

          ),
          title: 'Dashboard',
          headerShown: true,
          headerTitle: 'Dashboard', // Ensure headerTitle is explicitly set for consistency
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="dashboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          headerBackground: () => (
            <LinearGradient
              colors={[dark ? '#080c14' : '#f8fafc', '#2369A4']} // Light gradient colors
              start={{ x: 0, y: 1 }}   // top
              end={{ x: 0, y: 0 }}     // bottom
              style={{ flex: 1 }}
            />

          ),
          title: 'Reports',
          headerShown: true,
          headerTitle: 'Reports', // Ensure headerTitle is explicitly set for consistency
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="report-gmailerrorred" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mapView"
        options={{
          headerBackground: () => (
            <LinearGradient
              colors={[dark ? '#080c14' : '#f8fafc', '#2369A4']} // Light gradient colors
              start={{ x: 0, y: 1 }}   // top
              end={{ x: 0, y: 0 }}     // bottom
              style={{ flex: 1 }}
            />

          ),
          title: 'Map view',
          headerShown: false,
          headerTitle: 'Map view', // Ensure headerTitle is explicitly set for consistency
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="map-search-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerBackground: () => (
            <LinearGradient
              colors={[dark ? '#080c14' : '#f8fafc', '#2369A4']} // Light gradient colors
              start={{ x: 0, y: 1 }}   // top
              end={{ x: 0, y: 0 }}     // bottom
              style={{ flex: 1 }}
            />

          ),
          title: 'Profile',
          headerShown: false,
          headerTitle: 'Profile', // Ensure headerTitle is explicitly set for consistency
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="manage-accounts" color={color} />,
        }}
      />
    </Tabs>
  );
}
