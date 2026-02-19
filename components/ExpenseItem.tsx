import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Expense } from '../types/expense';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface ExpenseItemProps {
  item: Expense;
  onDelete: (id: string) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'food': return { name: 'restaurant', color: '#FF6B6B' };
    case 'transport': return { name: 'car', color: '#4D96FF' };
    case 'shopping': return { name: 'cart', color: '#FFD93D' };
    case 'bills': return { name: 'receipt', color: '#6BCB77' };
    case 'entertainment': return { name: 'play', color: '#9D65C9' };
    default: return { name: 'apps', color: '#9CA3AF' };
  }
};

export const ExpenseItem = ({ item, onDelete }: ExpenseItemProps) => {
  const icon = getCategoryIcon(item.category);

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      className="bg-white p-4 rounded-[24px] mb-4 flex-row items-center shadow-sm border border-gray-50"
      style={{
        elevation: 2,
      }}
    >
      <View 
        className="w-12 h-12 rounded-2xl items-center justify-center"
        style={{ backgroundColor: icon.color + '15' }}
      >
        <Ionicons name={icon.name as any} size={24} color={icon.color} />
      </View>

      <View className="flex-1 ml-4">
        <Text className="font-poppins-semibold text-base text-dark" numberOfLines={1}>{item.merchant}</Text>
        <Text className="font-poppins text-xs text-gray-400 capitalize">{item.category} • {new Date(item.date).toLocaleDateString()}</Text>
      </View>

      <View className="items-end">
        <Text className="font-poppins-bold text-base text-dark">
          -${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
        <TouchableOpacity 
          onPress={() => onDelete(item.id)} 
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="mt-1"
        >
          <Ionicons name="trash-outline" size={16} color="#EF8767" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};
