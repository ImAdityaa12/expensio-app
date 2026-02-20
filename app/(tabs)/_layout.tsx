import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity, Platform, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withSpring, withTiming, useSharedValue } from 'react-native-reanimated';

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F6FA' }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FF6B2C',
          tabBarInactiveTintColor: '#8A8A8A',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            height: 70 + (insets.bottom > 0 ? insets.bottom - 10 : 0),
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
            paddingTop: 10,
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
          },
          tabBarLabelStyle: {
            fontFamily: 'Poppins_400Regular',
            fontSize: 12,
            marginTop: 2,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={24} name={focused ? "home" : "home-outline"} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={24} name={focused ? "pie-chart" : "pie-chart-outline"} color={color} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="add"
          options={{
            title: '',
            tabBarButton: () => (
              <AddButton onPress={() => router.push('/modal')} />
            ),
          }}
        />

        <Tabs.Screen
          name="expenses"
          options={{
            title: 'Transactions',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={24} name={focused ? "list" : "list-outline"} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={24} name={focused ? "settings" : "settings-outline"} color={color} />
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
    <View style={{ flex: 1, alignItems: 'center' }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={{
          top: -20,
          justifyContent: 'center',
          alignItems: 'center',
          width: 64,
          height: 64,
        }}
      >
        <Animated.View
          style={[
            {
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#FF6B2C',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#FF6B2C',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            },
            animatedStyle,
          ]}
        >
          <Ionicons name="add" size={32} color="white" />
        </Animated.View>
        <Text 
          numberOfLines={1}
          style={{ 
            fontSize: 10, 
            color: '#8A8A8A', 
            marginTop: 4, 
            fontFamily: 'Poppins_400Regular',
            position: 'absolute',
            bottom: -15
          }}
        >
          Add
        </Text>
      </TouchableOpacity>
    </View>
  );
}
