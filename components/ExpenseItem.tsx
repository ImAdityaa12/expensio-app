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
    case 'food': return { name: 'restaurant', color: '#13C8EC' };
    case 'transport': return { name: 'car', color: '#10B981' };
    case 'shopping': return { name: 'cart', color: '#F59E0B' };
    case 'bills': return { name: 'receipt', color: '#EF4444' };
    case 'entertainment': return { name: 'play', color: '#8B5CF6' };
    default: return { name: 'apps', color: '#64748B' };
  }
};

export const ExpenseItem = ({ item, onDelete }: ExpenseItemProps) => {
  const icon = getCategoryIcon(item.category);

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      className="bg-dark-card p-4 rounded-xl mb-3 flex-row items-center border border-white/5"
    >
      <View 
        className="w-12 h-12 rounded-xl items-center justify-center bg-white/5"
      >
        <Ionicons name={icon.name as any} size={22} color={icon.color} />
      </View>

      <View className="flex-1 ml-4">
        <Text className="font-semibold text-white text-sm" numberOfLines={1}>{item.merchant}</Text>
        <Text className="text-[10px] text-muted uppercase tracking-wider mt-0.5">{item.category} • {new Date(item.date).toLocaleDateString()}</Text>
      </View>

      <View className="items-end mr-3">
        <Text className="font-bold text-white text-sm">
          -${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
      </View>
      
      <TouchableOpacity 
        onPress={() => onDelete(item.id)} 
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="w-8 h-8 rounded-full items-center justify-center bg-white/5"
      >
        <Ionicons name="trash-outline" size={14} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};
