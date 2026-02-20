import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const MENU_ITEMS = [
    { icon: 'person-outline', label: 'Personal Info' },
    { icon: 'notifications-outline', label: 'Notifications' },
    { icon: 'shield-checkmark-outline', label: 'Security' },
    { icon: 'help-circle-outline', label: 'Help Center' },
  ];
  
  return (
    <View style={{ flex: 1, backgroundColor: '#F5F6FA', paddingTop: insets.top + 20 }}>
      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).duration(600)} className="mb-8">
          <Text className="text-3xl font-bold text-text-dark">Profile</Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(200).duration(600)}
          className="bg-white p-6 rounded-[32px] items-center shadow-sm mb-8"
        >
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
            <Ionicons name="person" size={40} color="#5B2EFF" />
          </View>
          <Text className="font-bold text-xl text-text-dark">User Account</Text>
          <Text className="text-text-grey">Manage your preferences</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity 
              key={index}
              className="flex-row items-center bg-white p-4 rounded-[20px] mb-4 shadow-sm"
              style={{ elevation: 1 }}
            >
              <View className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center mr-4">
                <Ionicons name={item.icon as any} size={20} color="#5B2EFF" />
              </View>
              <Text className="flex-1 font-semibold text-text-dark">{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity 
            onPress={handleLogout}
            className="flex-row items-center bg-white p-4 rounded-[20px] mb-10 shadow-sm"
            style={{ elevation: 1 }}
          >
            <View className="w-10 h-10 rounded-xl bg-red-50 items-center justify-center mr-4">
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <Text className="flex-1 font-semibold text-red-500">Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
