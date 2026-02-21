import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface BalanceCardProps {
  amount: number;
  currencySymbol?: string;
}

export const BalanceCard = ({ amount, currencySymbol = '$' }: BalanceCardProps) => {
  return (
    <LinearGradient
      colors={['#2D2D5F', '#1F1F3A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="p-6 rounded-[24px] shadow-xl relative overflow-hidden h-[140px] justify-between"
    >
      {/* Wave texture placeholder could go here if needed */}
      
      <View>
        <Text className="text-white/60 text-sm font-medium">Total Balance</Text>
        <Text className="text-white text-[28px] font-bold mt-1">
          {currencySymbol}{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>

      <View className="flex-row justify-between items-end">
        <Text className="text-white/40 text-[12px] font-mono tracking-widest">
          **** **** **** 4252
        </Text>
        <View className="flex-row">
          <View className="w-6 h-6 rounded-full bg-red-500/80" />
          <View className="w-6 h-6 rounded-full bg-orange-500/80 -ml-3" />
        </View>
      </View>
    </LinearGradient>
  );
};
