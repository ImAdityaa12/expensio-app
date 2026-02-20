import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Expense } from '../types/expense';
import { Ionicons } from '@expo/vector-icons';

interface ExpenseItemProps {
  item: Expense;
  onDelete: (id: string) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'food': return { name: 'restaurant', color: '#4B2E83' };
    case 'transport': return { name: 'car', color: '#4B2E83' };
    case 'shopping': return { name: 'cart', color: '#4B2E83' };
    case 'bills': return { name: 'receipt', color: '#4B2E83' };
    case 'electronics': return { name: 'laptop', color: '#4B2E83' };
    case 'clothing': return { name: 'shirt', color: '#4B2E83' };
    default: return { name: 'apps', color: '#4B2E83' };
  }
};

export const ExpenseItem = ({ item, onDelete }: ExpenseItemProps) => {
  const icon = getCategoryIcon(item.category);
  const isIncome = item.type === 'income';

  return (
    <View className="flex-row items-center py-[14px] border-b border-gray-100">
      <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
        <Ionicons name={icon.name as any} size={20} color={icon.color} />
      </View>

      <View className="flex-1 ml-3">
        <Text className="font-semibold text-text-dark text-[15px]">{item.merchant}</Text>
        <Text className="text-[13px] text-text-grey">{item.category}</Text>
      </View>

      <View className="items-end">
        <Text className={`font-bold text-[15px] ${isIncome ? 'text-success' : 'text-text-dark'}`}>
          {isIncome ? '+' : '-'}${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
        <Text className="text-[12px] text-text-grey">Tax included</Text>
      </View>
    </View>
  );
};
