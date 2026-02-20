import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MiniBarChart } from './MiniBarChart';

interface BalanceCardProps {
  amount: number;
}

export const BalanceCard = ({ amount }: BalanceCardProps) => {
  return (
    <LinearGradient
      colors={['#4B2E83', '#6C4AB6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="p-lg rounded-2xl mx-lg shadow-lg"
    >
      <Text className="text-white text-sm font-medium opacity-80">Account Balance</Text>
      <Text className="text-white text-[26px] font-bold mt-1">
        ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Text>
      
      <MiniBarChart />
    </LinearGradient>
  );
};
