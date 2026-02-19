import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import { useExpenses } from '../../hooks/use-expenses';
import { Ionicons } from '@expo/vector-icons';

export default function StatsScreen() {
  const { expenses } = useExpenses();
  const [activeTab, setActiveTab] = useState('Weekly');

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

  const TABS = ['Daily', 'Weekly', 'Monthly'];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5 pt-4">
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-2xl font-poppins-bold text-dark">Statistics</Text>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm">
            <Ionicons name="ellipsis-horizontal" size={20} color="#42224A" />
          </TouchableOpacity>
        </View>

        {/* Big Amount */}
        <View className="items-center mb-8">
          <Text className="font-poppins text-gray-400 mb-1">Total Balance</Text>
          <Text className="font-poppins-bold text-4xl text-dark">
            ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
          <Text className="font-poppins-light text-xs text-gray-400 mt-2">
            Tax included • Feb 2026
          </Text>
        </View>

        {/* Category Tabs */}
        <View className="flex-row bg-gray-200/50 rounded-3xl p-1.5 mb-8">
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-2xl ${activeTab === tab ? 'bg-primary shadow-sm' : ''}`}
            >
              <Text className={`text-center font-poppins-medium text-sm ${activeTab === tab ? 'text-white' : 'text-gray-500'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Legend / Breakdown */}
        <Text className="text-lg font-poppins-semibold text-dark mb-4">By Category</Text>
        
        {categoryTotals.length > 0 ? (
          categoryTotals.map(([category, amount]) => {
            const percentage = (amount / totalSpent) * 100;
            return (
              <View key={category} className="mb-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-50">
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-accent mr-2" />
                    <Text className="font-poppins-medium text-dark">{category}</Text>
                  </View>
                  <Text className="font-poppins-bold text-dark">
                    ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                <View className="h-1.5 bg-background rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-primary" 
                    style={{ width: `${percentage}%` }} 
                  />
                </View>
                <View className="flex-row justify-between mt-1.5">
                  <Text className="text-[10px] font-poppins text-gray-400">Spending share</Text>
                  <Text className="text-[10px] font-poppins-medium text-primary">{percentage.toFixed(1)}%</Text>
                </View>
              </View>
            );
          })
        ) : (
          <View className="mt-10 items-center">
            <Text className="font-poppins text-gray-400">No data available for this period</Text>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
