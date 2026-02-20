import React from 'react';
import { View, Text } from 'react-native';

const MONTHS = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
const DATA = [0.4, 0.6, 0.3, 0.8, 0.5, 0.4, 0.9, 0.4, 0.5];
const ACTIVE_INDEX = 6; // Feb in the list above? Wait, Feb is index 6 if Aug is 0.

export const MiniBarChart = () => {
  return (
    <View className="mt-lg">
      <View className="flex-row items-end justify-between h-20">
        {DATA.map((value, index) => (
          <View key={index} className="items-center">
            <View 
              style={{ height: value * 60 }} 
              className={`w-2 rounded-full ${index === ACTIVE_INDEX ? 'bg-primary-accent' : 'bg-white/40'}`}
            />
            <Text className={`text-[10px] mt-xs ${index === ACTIVE_INDEX ? 'text-white font-bold' : 'text-white/60'}`}>
              {MONTHS[index]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
