import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useExpenses } from '../../hooks/use-expenses';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

export default function StatsScreen() {
  const { expenses, loading } = useExpenses();
  const [activeTab, setActiveTab] = useState('Weekly');
  const insets = useSafeAreaInsets();

  const categoryTotals = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];
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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#42224A" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F4F7', paddingTop: insets.top }}>
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        <Animated.View 
          entering={FadeInDown.delay(100).duration(600)}
          className="flex-row justify-between items-center mb-8"
        >
          <Text className="text-2xl font-poppins-bold text-dark">Statistics</Text>
          <TouchableOpacity className="w-11 h-11 rounded-full bg-white items-center justify-center shadow-sm" style={{ elevation: 2 }}>
            <Ionicons name="ellipsis-horizontal" size={22} color="#42224A" />
          </TouchableOpacity>
        </Animated.View>

        {/* Big Amount */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(600)}
          className="items-center mb-8"
        >
          <Text className="font-poppins text-gray-400 mb-1">Total Spent</Text>
          <Text className="font-poppins-bold text-4xl text-dark">
            ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
          <View className="flex-row items-center mt-2 px-3 py-1 bg-white rounded-full shadow-sm">
            <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
            <Text className="font-poppins-medium text-[10px] text-gray-500 uppercase tracking-wider">
              Feb 2026 • Period: {activeTab}
            </Text>
          </View>
        </Animated.View>

        {/* Category Tabs */}
        <Animated.View 
          entering={FadeInDown.delay(300).duration(600)}
          className="flex-row bg-white/50 rounded-3xl p-1.5 mb-8 border border-white"
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-2xl ${activeTab === tab ? 'bg-primary shadow-md' : ''}`}
            >
              <Text className={`text-center font-poppins-semibold text-sm ${activeTab === tab ? 'text-white' : 'text-gray-500'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Breakdown */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <Text className="text-lg font-poppins-semibold text-dark mb-4">By Category</Text>
          
          {categoryTotals.length > 0 ? (
            categoryTotals.map(([category, amount], index) => {
              const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
              return (
                <Animated.View 
                  key={category} 
                  entering={FadeInDown.delay(500 + index * 100).duration(500)}
                  className="mb-4 bg-white p-5 rounded-3xl shadow-sm border border-gray-50"
                  style={{ elevation: 1 }}
                >
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <View className={`w-10 h-10 rounded-2xl bg-primary/5 items-center justify-center mr-3`}>
                         <Ionicons name={getCategoryIcon(category)} size={20} color="#42224A" />
                      </View>
                      <View>
                        <Text className="font-poppins-semibold text-dark capitalize">{category}</Text>
                        <Text className="text-[10px] font-poppins text-gray-400">Spending share</Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="font-poppins-bold text-dark">
                        ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </Text>
                      <Text className="text-[10px] font-poppins-medium text-primary">{percentage.toFixed(1)}%</Text>
                    </View>
                  </View>
                  <View className="h-2 bg-background rounded-full overflow-hidden">
                    <Animated.View 
                      entering={FadeIn.delay(800 + index * 100).duration(1000)}
                      className="h-full bg-primary" 
                      style={{ width: `${percentage}%` }} 
                    />
                  </View>
                </Animated.View>
              );
            })
          ) : (
            <View className="mt-10 items-center">
              <Ionicons name="pie-chart-outline" size={48} color="#D1D5DB" />
              <Text className="font-poppins text-gray-400 mt-4">No data available for this period</Text>
            </View>
          )}
        </Animated.View>

        <View className="h-32" />
      </ScrollView>
    </View>
  );
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'food': return 'restaurant';
    case 'transport': return 'car';
    case 'shopping': return 'cart';
    case 'bills': return 'receipt';
    case 'entertainment': return 'play';
    default: return 'apps';
  }
};
