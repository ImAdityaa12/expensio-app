import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Transaction } from '../types/schema';
import { Ionicons } from '@expo/vector-icons';

interface ExpenseItemProps {
  item: Transaction;
  onDelete: (id: string) => void;
  onPress?: () => void;
  currencySymbol?: string;
}

export const ExpenseItem = ({ item, onPress, currencySymbol = '$' }: ExpenseItemProps) => {
  const isIncome = item.type === 'CREDIT';
  const categoryName = item.categories?.name || 'Uncategorized';
  const iconName = item.categories?.icon || 'pricetag';
  const merchantName = item.merchant_name || item.description || 'Unknown Transaction';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="flex-row items-center py-3.5 border-b border-gray-100">
      <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
        <Ionicons name={iconName as any} size={20} color="#5B2EFF" />
      </View>

      <View className="flex-1 ml-3">
        <Text className="font-semibold text-text-dark text-[15px]">{merchantName}</Text>
        <Text className="text-[12px] text-text-grey font-medium uppercase tracking-wider mt-0.5">
          {categoryName}
        </Text>
      </View>

      <View className="items-end">
        <Text className={`font-bold text-[15px] ${isIncome ? 'text-success' : 'text-text-dark'}`}>
          {isIncome ? '+' : '-'}{currencySymbol}{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
        <Text className="text-[12px] text-text-grey mt-0.5">
          {new Date(item.transaction_date).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
