import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useExpenses } from '../../hooks/use-expenses';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn, Layout } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

export default function StatsScreen() {
  const { expenses, loading } = useExpenses();
  const [activeTab, setActiveTab] = useState('Weekly');
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter(e => {
      const d = new Date(e.date);
      if (activeTab === 'Daily') {
        return d.toDateString() === now.toDateString();
      }
      if (activeTab === 'Weekly') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return d >= weekAgo;
      }
      if (activeTab === 'Monthly') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [expenses, activeTab]);

  const categoryTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    filteredExpenses.forEach((e) => {
      const cat = e.category || 'Others';
      totals[cat] = (totals[cat] || 0) + e.amount;
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [filteredExpenses]);

  const totalSpent = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

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
          <View>
            <Text className="text-3xl font-poppins-bold text-dark">Statistics</Text>
            <Text className="text-gray-400 font-poppins text-sm">Your spending habits</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/modal')}
            className="w-12 h-12 rounded-2xl bg-primary items-center justify-center shadow-lg"
            style={{ elevation: 4 }}
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Big Amount Card */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(600)}
          className="bg-white p-6 rounded-[32px] items-center mb-8 shadow-sm border border-white"
          style={{ elevation: 2 }}
        >
          <Text className="font-poppins-medium text-gray-400 mb-1 uppercase tracking-widest text-[10px]">Total Spent ({activeTab})</Text>
          <Animated.Text 
            layout={Layout.springify()}
            className="font-poppins-bold text-4xl text-dark"
          >
            ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Animated.Text>
          <View className="flex-row items-center mt-3 px-3 py-1 bg-primary/5 rounded-full">
            <Ionicons name="calendar-outline" size={12} color="#42224A" style={{ marginRight: 4 }} />
            <Text className="font-poppins-semibold text-[10px] text-primary uppercase tracking-wider">
              {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </Text>
          </View>
        </Animated.View>

        {/* Category Tabs */}
        <Animated.View 
          entering={FadeInDown.delay(300).duration(600)}
          className="flex-row bg-white rounded-2xl p-1 mb-8 shadow-sm border border-gray-50"
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl ${activeTab === tab ? 'bg-primary shadow-sm' : ''}`}
            >
              <Text className={`text-center font-poppins-semibold text-xs ${activeTab === tab ? 'text-white' : 'text-gray-400'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Breakdown */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-poppins-bold text-dark">Category Breakdown</Text>
            <Text className="text-xs font-poppins-medium text-gray-400">{filteredExpenses.length} transactions</Text>
          </View>
          
          {categoryTotals.length > 0 ? (
            categoryTotals.map(([category, amount], index) => {
              const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
              const icon = getCategoryIcon(category);
              return (
                <Animated.View 
                  key={category} 
                  entering={FadeInDown.delay(500 + index * 100).duration(500)}
                  layout={Layout.springify()}
                  className="mb-4 bg-white p-4 rounded-[24px] shadow-sm border border-gray-50"
                  style={{ elevation: 1 }}
                >
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <View 
                        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: icon.color + '15' }}
                      >
                         <Ionicons name={icon.name as any} size={20} color={icon.color} />
                      </View>
                      <View>
                        <Text className="font-poppins-semibold text-dark capitalize text-sm">{category}</Text>
                        <Text className="text-[10px] font-poppins text-gray-400">{percentage.toFixed(0)}% of total</Text>
                      </View>
                    </View>
                    <Text className="font-poppins-bold text-dark">
                      ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View className="h-2 bg-gray-50 rounded-full overflow-hidden">
                    <View 
                      className="h-full" 
                      style={{ width: `${percentage}%`, backgroundColor: icon.color }} 
                    />
                  </View>
                </Animated.View>
              );
            })
          ) : (
            <Animated.View entering={FadeIn.delay(200)} className="mt-10 items-center bg-white p-10 rounded-[32px] border border-dashed border-gray-200">
              <Ionicons name="pie-chart-outline" size={48} color="#D1D5DB" />
              <Text className="font-poppins-medium text-gray-400 mt-4">No spending data for this period</Text>
              <TouchableOpacity 
                onPress={() => router.push('/modal')}
                className="mt-4"
              >
                <Text className="text-primary font-poppins-bold">Add your first expense</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>

        <View className="h-32" />
      </ScrollView>
    </View>
  );
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'food': return { name: 'restaurant', color: '#FF6B6B' };
    case 'transport': return { name: 'car', color: '#4D96FF' };
    case 'shopping': return { name: 'cart', color: '#FFD93D' };
    case 'bills': return { name: 'receipt', color: '#6BCB77' };
    case 'entertainment': return { name: 'play', color: '#9D65C9' };
    default: return { name: 'apps', color: '#9CA3AF' };
  }
};
