import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useExpenses } from '../../hooks/use-expenses';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { DonutChart } from '../../components/DonutChart';

export default function AnalyticsScreen() {
  const { expenses, loading } = useExpenses();
  const insets = useSafeAreaInsets();

  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const budget = 12000; // Monthly budget
  const progress = Math.min(totalSpent / budget, 1);

  const categoryTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    expenses.forEach((e) => {
      const cat = e.category || 'Others';
      totals[cat] = (totals[cat] || 0) + e.amount;
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const chartData = useMemo(() => {
    const colors = ['#4B2E83', '#6C4AB6', '#F48C57', '#10B981', '#EF4444', '#8A8A8A'];
    return categoryTotals.slice(0, 5).map(([name, value], index) => ({
      name,
      value: (value / totalSpent) * 100,
      color: colors[index % colors.length],
      amount: value
    }));
  }, [categoryTotals, totalSpent]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F6FA', paddingTop: insets.top }}>
      <ScrollView className="flex-1 px-lg" showsVerticalScrollIndicator={false}>
        <View className="py-md">
          <Text className="text-text-dark font-bold text-[22px]">Analytics</Text>
        </View>

        {/* Monthly Summary */}
        <Animated.View entering={FadeInDown.delay(100)} className="bg-white p-lg rounded-3xl shadow-sm mb-lg">
          <Text className="text-text-grey text-[14px]">You have spent</Text>
          <Text className="text-text-dark font-bold text-[28px] mt-1">
            ${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </Text>
          <Text className="text-text-grey text-[14px] mt-1">this month</Text>
          
          <View className="mt-lg">
            <View className="flex-row justify-between mb-2">
              <Text className="text-text-dark font-semibold text-[12px]">Monthly Progress</Text>
              <Text className="text-text-grey text-[12px]">{Math.round(progress * 100)}%</Text>
            </View>
            <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <View 
                style={{ width: `${progress * 100}%` }} 
                className={`h-full rounded-full ${progress > 0.9 ? 'bg-danger' : 'bg-primary-accent'}`} 
              />
            </View>
          </View>
        </Animated.View>

        {/* Category Pie Chart */}
        <Animated.View entering={FadeInDown.delay(200)} className="items-center py-4 mb-lg">
          <DonutChart 
            size={240} 
            strokeWidth={14} 
            data={chartData} 
            totalAmount={totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            trend="12% less"
          />
        </Animated.View>

        {/* Distribution List */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text className="text-text-dark font-bold text-base mb-md">Category Distribution</Text>
          {chartData.map((item, index) => (
            <View key={item.name} className="bg-white p-md rounded-2xl shadow-sm mb-md flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: item.color + '15' }}
                >
                  <Ionicons name={getCategoryIcon(item.name) as any} size={18} color={item.color} />
                </View>
                <View>
                  <Text className="text-text-dark font-semibold capitalize">{item.name}</Text>
                  <Text className="text-text-grey text-[11px]">{item.value.toFixed(1)}% of total</Text>
                </View>
              </View>
              <Text className="text-text-dark font-bold">${item.amount.toLocaleString()}</Text>
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
    case 'electronics': return 'laptop';
    case 'clothing': return 'shirt';
    default: return 'apps';
  }
};
