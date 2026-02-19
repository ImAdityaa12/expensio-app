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
    case 'food': return 'restaurant-outline';
    case 'transport': return 'car-outline';
    case 'shopping': return 'cart-outline';
    case 'bills': return 'receipt-outline';
    case 'entertainment': return 'play-outline';
    default: return 'apps-outline';
  }
};

export const ExpenseItem = ({ item, onDelete }: ExpenseItemProps) => {
  return (
    <View 
      className="bg-white p-4 rounded-2xl mb-3 flex-row items-center shadow-sm"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      <View className="w-10 h-10 rounded-full bg-background items-center justify-center">
        <Ionicons name={getCategoryIcon(item.category)} size={20} color="#42224A" />
      </View>

      <View className="flex-1 ml-4">
        <Text className="font-poppins-medium text-base text-dark">{item.merchant}</Text>
        <Text className="font-poppins text-xs text-gray-400 capitalize">{item.category}</Text>
      </View>

      <View className="items-end">
        <Text className="font-poppins-semibold text-base text-dark">
          - ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
        <Text className="font-poppins-light text-[10px] text-gray-400">incl. tax</Text>
      </View>
      
      <TouchableOpacity onPress={() => onDelete(item.id)} className="ml-3 p-1">
        <Ionicons name="trash-outline" size={18} color="#EF8767" />
      </TouchableOpacity>
    </View>
  );
};
