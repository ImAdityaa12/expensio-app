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
            backgroundColor: '#ffffff',
            height: 64 + (insets.bottom > 0 ? insets.bottom - 10 : 0),
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: '#F3F4F6',
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
          },
          tabBarLabelStyle: {
            fontFamily: 'Poppins_500Medium',
            fontSize: 10,
            marginTop: 2,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={22} name={focused ? "home" : "home-outline"} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="receipts"
          options={{
            title: 'Receipts',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={22} name={focused ? "receipt" : "receipt-outline"} color={color} />
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
              <Ionicons size={22} name={focused ? "bar-chart" : "bar-chart-outline"} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={22} name={focused ? "person" : "person-outline"} color={color} />
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
        top: -15,
        justifyContent: 'center',
        alignItems: 'center',
        height: 60,
      }}
    >
      <Animated.View
        style={[
          {
            width: 54,
            height: 54,
            borderRadius: 18,
            backgroundColor: '#EF8767',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#EF8767',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 8,
          },
          animatedStyle,
        ]}
      >
        <Ionicons name="add" size={30} color="white" />
      </Animated.View>
    </TouchableOpacity>
  );
}
