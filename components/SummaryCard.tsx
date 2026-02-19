import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface SummaryCardProps {
  amount: number;
}

export const SummaryCard = ({ amount }: SummaryCardProps) => {
  // Mock data for mini bar chart
  const bars = [40, 60, 30, 80, 50, 70, 45, 60, 40, 85, 55];
  const activeIndex = 9;

  return (
    <LinearGradient
      colors={['#42224A', '#2D1732']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-[32px] p-6 h-52 shadow-xl mb-6 overflow-hidden"
      style={{ elevation: 10 }}
    >
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-white/60 font-poppins-medium text-xs uppercase tracking-widest">Total Spent</Text>
          <Text className="text-white font-poppins-bold text-4xl mt-1">
            ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
        <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
          <Ionicons name="card" size={20} color="white" />
        </View>
      </View>

      <View className="flex-row items-end justify-between mt-auto h-16">
        {bars.map((h, i) => (
          <View
            key={i}
            style={{ 
              height: h + '%',
              backgroundColor: i === activeIndex ? '#EF8767' : 'rgba(255, 255, 255, 0.2)'
            }}
            className="w-1.5 rounded-full"
          />
        ))}
      </View>
      
      {/* Decorative circles */}
      <View className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white/5" />
      <View className="absolute -left-5 -bottom-5 w-20 h-20 rounded-full bg-white/5" />
    </LinearGradient>
  );
};
