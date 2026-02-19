import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withSpring, withTiming, useSharedValue } from 'react-native-reanimated';

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F4F7' }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#42224A',
          tabBarInactiveTintColor: '#9CA3AF',
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: insets.bottom > 0 ? insets.bottom : 20,
            left: 20,
            right: 20,
            elevation: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 30,
            height: 64,
            borderTopWidth: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 15,
          },
          tabBarLabelStyle: {
            fontFamily: 'Poppins_500Medium',
            fontSize: 10,
            marginBottom: 8,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={22} name={focused ? "home" : "home-outline"} color={color} style={{ marginTop: 8 }} />
            ),
          }}
        />
        <Tabs.Screen
          name="receipts"
          options={{
            title: 'Receipts',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={22} name={focused ? "receipt" : "receipt-outline"} color={color} style={{ marginTop: 8 }} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="add-placeholder"
          options={{
            title: '',
            tabBarButton: () => (
              <AddButton onPress={() => router.push('/modal')} />
            ),
          }}
        />

        <Tabs.Screen
          name="explore"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={22} name={focused ? "bar-chart" : "bar-chart-outline"} color={color} style={{ marginTop: 8 }} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={22} name={focused ? "person" : "person-outline"} color={color} style={{ marginTop: 8 }} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

function AddButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={{
        top: -24,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Animated.View
        style={[
          {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#EF8767',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#EF8767',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          },
          animatedStyle,
        ]}
      >
        <Ionicons name="add" size={32} color="white" />
      </Animated.View>
    </TouchableOpacity>
  );
}
