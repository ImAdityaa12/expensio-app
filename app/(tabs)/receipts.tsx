import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ReceiptsScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ flex: 1, backgroundColor: '#F7F4F7', paddingTop: insets.top + 20 }} className="px-6">
      <Animated.View entering={FadeInDown.delay(100).duration(600)} className="mb-8">
        <Text className="text-3xl font-poppins-bold text-dark">Receipts</Text>
        <Text className="text-gray-400 font-poppins text-sm">Scan and manage your receipts</Text>
      </Animated.View>

      <View className="flex-1 justify-center items-center">
        <Animated.View entering={FadeInDown.delay(200).duration(600)} className="items-center">
          <View className="w-24 h-24 rounded-full bg-white items-center justify-center shadow-sm mb-6">
            <Ionicons name="receipt-outline" size={40} color="#EF8767" />
          </View>
          <Text className="font-poppins-bold text-xl text-dark">Coming Soon</Text>
          <Text className="font-poppins text-gray-400 text-center mt-2 px-10">
            We're working on a feature that lets you scan receipts with AI.
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}
