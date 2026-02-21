import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

const DATA_2026 = [
  { month: 'Jan', value: 40 },
  { month: 'Feb', value: 65 },
  { month: 'Mar', value: 35 },
  { month: 'Apr', value: 85 },
  { month: 'May', value: 50 },
  { month: 'Jun', value: 60 },
  { month: 'Jul', value: 45 },
];

const DATA_2025 = [
  { month: 'Jan', value: 55 },
  { month: 'Feb', value: 45 },
  { month: 'Mar', value: 60 },
  { month: 'Apr', value: 30 },
  { month: 'May', value: 75 },
  { month: 'Jun', value: 50 },
  { month: 'Jul', value: 65 },
];

const YEARS = ['2026', '2025', '2024'];

export const AnalyticsChart = ({ currencySymbol = '$' }: { currencySymbol?: string }) => {
  const [year, setYear] = useState('2026');
  const [modalVisible, setModalVisible] = useState(false);

  const data = year === '2026' ? DATA_2026 : DATA_2025;
  const activeIndex = year === '2026' ? 3 : -1; // Apr is active only in 2026 for demo

  return (
    <View className="bg-white rounded-[24px] p-5 shadow-sm mt-6">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-text-dark font-bold text-[16px]">Analytics</Text>
        
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          className="flex-row items-center bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm"
        >
          <Text className="text-text-dark text-[14px] font-medium mr-2">Year - <Text className="text-primary font-bold">{year}</Text></Text>
          <Ionicons name="chevron-down" size={14} color="#5B2EFF" />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-end h-[120px] gap-2">
        {data.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <View key={item.month} className="items-center flex-1">
              {isActive && (
                <Text className="text-text-dark font-bold text-[10px] mb-1">
                  {currencySymbol}{item.value}k
                </Text>
              )}
              <View
                style={{ height: `${item.value}%` }}
                className={`w-full rounded-md ${
                  isActive ? 'bg-primary' : 'bg-gray-100'
                }`}
              />
              <Text className="text-text-grey text-[10px] mt-2 font-medium">
                {item.month}
              </Text>
            </View>
          );
        })}
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-white rounded-2xl p-4 w-40 shadow-xl">
            {YEARS.map((y) => (
              <TouchableOpacity 
                key={y} 
                onPress={() => {
                  setYear(y);
                  setModalVisible(false);
                }}
                className="py-3 border-b border-gray-100 last:border-0"
              >
                <Text className={`text-center font-bold ${year === y ? 'text-primary' : 'text-text-dark'}`}>
                  {y}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
