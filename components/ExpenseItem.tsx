import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Expense } from '../types/expense';
import { Ionicons } from '@expo/vector-icons';

interface ExpenseItemProps {
  item: Expense;
  onDelete: (id: string) => void;
  onPress?: () => void;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'food': return { name: 'restaurant', color: '#5B2EFF' };
    case 'transport': return { name: 'car', color: '#5B2EFF' };
    case 'shopping': return { name: 'cart', color: '#5B2EFF' };
    case 'bills': return { name: 'receipt', color: '#5B2EFF' };
    case 'electronics': return { name: 'laptop', color: '#5B2EFF' };
    case 'clothing': return { name: 'shirt', color: '#5B2EFF' };
    default: return { name: 'apps', color: '#5B2EFF' };
  }
};

export const ExpenseItem = ({ item, onPress }: ExpenseItemProps) => {
  const icon = getCategoryIcon(item.category);
  const isIncome = item.type === 'income';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="flex-row items-center py-3.5 border-b border-gray-100">
      <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
        <Ionicons name={icon.name as any} size={20} color={icon.color} />
      </View>

      <View className="flex-1 ml-3">
        <Text className="font-semibold text-text-dark text-[15px]">{item.merchant}</Text>
        <Text className="text-[12px] text-text-grey font-medium uppercase tracking-wider mt-0.5">
          {item.category}
        </Text>
      </View>

      <View className="items-end">
        <Text className={`font-bold text-[15px] ${isIncome ? 'text-success' : 'text-text-dark'}`}>
          {isIncome ? '+' : '-'}${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
        <Text className="text-[12px] text-text-grey mt-0.5">
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
