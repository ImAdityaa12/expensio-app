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
    <View style={{ flex: 1, backgroundColor: '#101F22' }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#13C8EC',
          tabBarInactiveTintColor: '#64748B',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#101F22',
            height: 64 + (insets.bottom > 0 ? insets.bottom - 10 : 0),
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.05)',
            elevation: 0,
          },
          tabBarLabelStyle: {
            fontFamily: 'Poppins_500Medium',
            fontSize: 10,
            marginTop: 2,
            textTransform: 'uppercase',
            letterSpacing: 1,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={22} name={focused ? "grid" : "grid-outline"} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="receipts"
          options={{
            title: 'Logs',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={22} name={focused ? "list" : "list-outline"} color={color} />
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
              <Ionicons size={22} name={focused ? "pie-chart" : "pie-chart-outline"} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Account',
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
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#13C8EC',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#13C8EC',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 10,
          },
          animatedStyle,
        ]}
      >
        <Ionicons name="add" size={32} color="#101F22" />
      </Animated.View>
    </TouchableOpacity>
  );
}
