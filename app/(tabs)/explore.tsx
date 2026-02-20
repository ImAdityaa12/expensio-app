import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useExpenses } from '../../hooks/use-expenses';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { DonutChart } from '../../components/DonutChart';

export default function StatsScreen() {
  const { expenses, loading } = useExpenses();
  const [activeTab, setActiveTab] = useState('Weekly');
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const TABS = ['Daily', 'Weekly', 'Monthly'];

  const categoryTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    expenses.forEach((e) => {
      const cat = e.category || 'Others';
      totals[cat] = (totals[cat] || 0) + e.amount;
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const chartData = useMemo(() => {
    const colors = ['#13C8EC', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#64748B'];
    return categoryTotals.slice(0, 5).map(([name, value], index) => ({
      name,
      value: (value / totalSpent) * 100,
      color: colors[index % colors.length],
      amount: value
    }));
  }, [categoryTotals, totalSpent]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-dark">
        <ActivityIndicator size="large" color="#13C8EC" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#101F22', paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center bg-dark-card border border-white/5"
        >
          <Ionicons name="chevron-back" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Spending Insights</Text>
        <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center bg-dark-card border border-white/5">
          <Ionicons name="settings-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Segmented Control */}
        <Animated.View 
          entering={FadeInDown.delay(100)}
          className="flex-row bg-dark-card rounded-xl p-1 mb-8 mt-4 border border-white/5"
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg ${activeTab === tab ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`text-center font-semibold text-xs ${activeTab === tab ? 'text-dark' : 'text-muted'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Donut Chart Section */}
        <Animated.View 
          entering={FadeInDown.delay(200)}
          className="items-center py-4 mb-8"
        >
          <DonutChart 
            size={240} 
            strokeWidth={14} 
            data={chartData} 
            totalAmount={totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            trend="+12.5%"
          />
        </Animated.View>

        {/* Top Categories List */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text className="text-white font-bold text-base mb-4">Top Categories</Text>
          {chartData.map((item, index) => (
            <View key={item.name} className="bg-dark-card p-4 rounded-xl border border-white/5 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View 
                    className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                    style={{ backgroundColor: item.color + '15' }}
                  >
                    <Ionicons name={getCategoryIcon(item.name)} size={18} color={item.color} />
                  </View>
                  <View>
                    <Text className="text-white font-semibold capitalize">{item.name}</Text>
                    <Text className="text-muted text-[10px] uppercase tracking-widest">{item.value.toFixed(1)}% share</Text>
                  </View>
                </View>
                <Text className="text-white font-bold">${item.amount.toLocaleString()}</Text>
              </View>
              {/* Custom Progress Bar */}
              <View className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <View 
                  className="h-full rounded-full" 
                  style={{ width: `${item.value}%`, backgroundColor: item.color }} 
                />
              </View>
            </View>
          ))}
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
