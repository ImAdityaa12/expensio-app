import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#42224A',
          tabBarInactiveTintColor: '#9CA3AF',
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 25,
            left: 20,
            right: 20,
            elevation: 0,
            backgroundColor: '#ffffff',
            borderRadius: 30,
            height: 70,
            paddingBottom: Platform.OS === 'ios' ? 20 : 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
          },
          tabBarLabelStyle: {
            fontFamily: 'Poppins_400Regular',
            fontSize: 10,
            marginBottom: 10,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Discover',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={24} name={focused ? "home" : "home-outline"} color={color} style={{ marginTop: 10 }} />
            ),
          }}
        />
        <Tabs.Screen
          name="receipts"
          options={{
            title: 'Receipts',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={24} name={focused ? "receipt" : "receipt-outline"} color={color} style={{ marginTop: 10 }} />
            ),
          }}
        />
        
        {/* Placeholder for the FAB */}
        <Tabs.Screen
          name="add-placeholder"
          options={{
            title: '',
            tabBarButton: () => (
              <TouchableOpacity
                onPress={() => router.push('/modal')}
                style={{
                  top: -30,
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#EF8767',
                  shadowColor: '#EF8767',
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 5,
                }}
              >
                <Ionicons name="add" size={32} color="white" />
              </TouchableOpacity>
            ),
          }}
        />

        <Tabs.Screen
          name="explore"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={24} name={focused ? "bar-chart" : "bar-chart-outline"} color={color} style={{ marginTop: 10 }} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={24} name={focused ? "person" : "person-outline"} color={color} style={{ marginTop: 10 }} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
