import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SummaryCardProps {
  amount: number;
}

export const SummaryCard = ({ amount }: SummaryCardProps) => {
  // Mock data for mini bar chart
  const bars = [40, 60, 30, 80, 50, 70, 45];
  const activeIndex = 3;

  return (
    <LinearGradient
      colors={['#42224A', '#8F659A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-3xl p-5 h-44 shadow-lg mb-6"
    >
      <View>
        <Text className="text-primary-soft font-poppins text-sm">Outcome</Text>
        <Text className="text-white font-poppins-bold text-3xl mt-1">
          ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>

      <View className="flex-row items-end justify-between mt-auto h-12 px-2">
        {bars.map((h, i) => (
          <View
            key={i}
            style={{ height: h + '%' }}
            className={`w-2 rounded-full ${i === activeIndex ? 'bg-accent' : 'bg-primary-soft/40'}`}
          />
        ))}
      </View>
    </LinearGradient>
  );
};
