import React, { useMemo } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { useExpenses } from '../../hooks/use-expenses';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const { expenses } = useExpenses();

  const categoryTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    expenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="mt-8 mb-6">
        <Text className="text-3xl font-bold text-gray-800">Analytics</Text>
        <Text className="text-gray-500">Your spending patterns</Text>
      </View>

      <View className="bg-blue-600 p-6 rounded-3xl mb-6 shadow-md">
        <Text className="text-blue-100 text-lg">Total Spent</Text>
        <Text className="text-white text-4xl font-bold mt-1">₹{totalSpent.toFixed(2)}</Text>
      </View>

      <Text className="text-xl font-bold text-gray-800 mb-4">By Category</Text>
      
      {categoryTotals.length > 0 ? (
        categoryTotals.map(([category, amount]) => {
          const percentage = (amount / totalSpent) * 100;
          return (
            <View key={category} className="mb-4 bg-white p-4 rounded-2xl shadow-sm">
              <View className="flex-row justify-between mb-2">
                <Text className="font-semibold text-gray-700">{category}</Text>
                <Text className="font-bold text-gray-900">₹{amount.toFixed(2)}</Text>
              </View>
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View 
                  className="h-full bg-blue-500" 
                  style={{ width: `${percentage}%` }} 
                />
              </View>
              <Text className="text-xs text-gray-400 mt-1">{percentage.toFixed(1)}% of total</Text>
            </View>
          );
        })
      ) : (
        <View className="mt-10 items-center">
          <Text className="text-gray-400">Add expenses to see analytics</Text>
        </View>
      )}

      <View className="h-10" />
    </ScrollView>
  );
}
