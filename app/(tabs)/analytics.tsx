import { CategoryBottomSheet } from '@/components/CategoryBottomSheet';
import { TransactionDetailSheet } from '@/components/TransactionDetailSheet';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DonutChart } from '../../components/DonutChart';
import { useExpenses } from '../../hooks/use-expenses';
import { Transaction } from '../../types/schema';

export default function AnalyticsScreen() {
  const { transactions, currencySymbol, fetchData } = useExpenses();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<{ name: string; total: number; budget: number } | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(12000);

  // Get current month transactions
  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions.filter(t => {
      const transactionDate = new Date(t.transaction_date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });
  }, [transactions]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
      loadMonthlyBudget();
    }, [fetchData])
  );

  const loadMonthlyBudget = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Try to get budget from profile or use default
    await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // You can add a budget field to profiles table, for now using default
    setMonthlyBudget(12000);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    await loadMonthlyBudget();
    setRefreshing(false);
  }, [fetchData]);

  const totalSpent = useMemo(() => 
    currentMonthTransactions.filter(e => e.type === 'DEBIT').reduce((sum, e) => sum + e.amount, 0), 
  [currentMonthTransactions]);

  const totalIncome = useMemo(() => 
    currentMonthTransactions.filter(e => e.type === 'CREDIT').reduce((sum, e) => sum + e.amount, 0), 
  [currentMonthTransactions]);

  const netBalance = useMemo(() => totalIncome - totalSpent, [totalIncome, totalSpent]);

  const remainingBudget = useMemo(() => monthlyBudget - totalSpent, [monthlyBudget, totalSpent]);
  const progress = Math.min(totalSpent / monthlyBudget, 1);

  const categoryTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    currentMonthTransactions.filter(e => e.type === 'DEBIT').forEach((e) => {
      const cat = e.categories?.name || 'Others';
      totals[cat] = (totals[cat] || 0) + e.amount;
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [currentMonthTransactions]);

  const chartData = useMemo(() => {
    const colors = ['#4B2E83', '#6C4AB6', '#F48C57', '#10B981', '#EF4444', '#8A8A8A'];
    if (totalSpent === 0) return [];
    
    return categoryTotals.slice(0, 5).map(([name, value], index) => ({
      name,
      value: (value / totalSpent) * 100,
      color: colors[index % colors.length],
      amount: value
    }));
  }, [categoryTotals, totalSpent]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F6FA', paddingTop: insets.top }}>
      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5B2EFF" />
        }
      >
        <View className="py-md">
          <Text className="text-text-dark font-bold text-[22px]">Analytics</Text>
          <Text className="text-text-grey text-[12px] mt-1">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* Income & Expense Cards */}
        <Animated.View entering={FadeInDown.delay(50)} className="flex-row mb-4" style={{ gap: 12 }}>
          {/* Total Income Card */}
          <View className="flex-1 p-4 rounded-2xl shadow-sm" style={{ backgroundColor: '#10B981' }}>
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full items-center justify-center mr-2" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <Ionicons name="arrow-down" size={16} color="white" />
              </View>
              <Text className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Total Income</Text>
            </View>
            <Text className="text-white font-bold text-[20px]">
              {currencySymbol}{totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Text>
            <Text className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {totalIncome === 0 ? 'No income added yet' : 'This month'}
            </Text>
          </View>

          {/* Total Expenses Card */}
          <View className="flex-1 p-4 rounded-2xl shadow-sm" style={{ backgroundColor: '#EF4444' }}>
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full items-center justify-center mr-2" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <Ionicons name="arrow-up" size={16} color="white" />
              </View>
              <Text className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Total Expenses</Text>
            </View>
            <Text className="text-white font-bold text-[20px]">
              {currencySymbol}{totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Text>
            <Text className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {totalSpent === 0 ? 'No expenses yet' : 'This month'}
            </Text>
          </View>
        </Animated.View>

        {/* Net Balance Card */}
        <Animated.View entering={FadeInDown.delay(100)} className="bg-white rounded-3xl shadow-sm mb-4" style={{ padding: 20 }}>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-text-grey text-[14px]">Net Balance</Text>
            <View className="px-3 py-1 rounded-full" style={{ backgroundColor: netBalance >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
              <Text className="text-[11px] font-semibold" style={{ color: netBalance >= 0 ? '#10B981' : '#EF4444' }}>
                {netBalance >= 0 ? 'Surplus' : 'Deficit'}
              </Text>
            </View>
          </View>
          <Text className="font-bold text-[28px] mt-1" style={{ color: netBalance >= 0 ? '#10B981' : '#EF4444' }}>
            {netBalance >= 0 ? '+' : ''}{currencySymbol}{Math.abs(netBalance).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </Text>
          <Text className="text-text-grey text-[12px] mt-1">
            Income: {currencySymbol}{totalIncome.toLocaleString()} • Expenses: {currencySymbol}{totalSpent.toLocaleString()}
          </Text>
        </Animated.View>

        {/* Monthly Summary */}
        <Animated.View entering={FadeInDown.delay(150)} className="bg-white rounded-3xl shadow-sm mb-4" style={{ padding: 20 }}>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-text-grey text-[14px]">Monthly Budget</Text>
            <TouchableOpacity className="px-3 py-1 bg-primary/10 rounded-full">
              <Text className="text-primary text-[11px] font-semibold">Edit Budget</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row items-end justify-between mb-4">
            <View>
              <Text className="text-text-grey text-[11px] mb-1">Spent</Text>
              <Text className="text-text-dark font-bold text-[24px]">
                {currencySymbol}{totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-text-grey text-[11px] mb-1">Budget</Text>
              <Text className="text-text-dark font-semibold text-[18px]">
                {currencySymbol}{monthlyBudget.toLocaleString()}
              </Text>
            </View>
          </View>
          
          <View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-text-dark font-semibold text-[12px]">Budget Progress</Text>
              <Text className="text-[12px] font-semibold" style={{ color: progress > 0.9 ? '#EF4444' : progress > 0.7 ? '#F97316' : '#10B981' }}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
            <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <View 
                style={{ 
                  width: `${Math.min(progress * 100, 100)}%`,
                  backgroundColor: progress > 0.9 ? '#EF4444' : progress > 0.7 ? '#F97316' : '#10B981'
                }} 
                className="h-full rounded-full"
              />
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-text-grey text-[11px]">
                {remainingBudget > 0 
                  ? `${currencySymbol}${remainingBudget.toLocaleString()} remaining` 
                  : `${currencySymbol}${Math.abs(remainingBudget).toLocaleString()} over budget`}
              </Text>
              <Text className="text-text-grey text-[11px]">
                {Math.round((new Date().getDate() / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()) * 100)}% of month
              </Text>
            </View>
          </View>

          {/* Daily Average */}
          <View className="mt-4 pt-4 border-t border-gray-100 flex-row justify-between">
            <View>
              <Text className="text-text-grey text-[11px]">Daily Average</Text>
              <Text className="text-text-dark font-semibold text-[14px] mt-1">
                {currencySymbol}{(totalSpent / new Date().getDate()).toLocaleString(undefined, { maximumFractionDigits: 0 })}/day
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-text-grey text-[11px]">Suggested Daily</Text>
              <Text className="text-text-dark font-semibold text-[14px] mt-1">
                {currencySymbol}{(monthlyBudget / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()).toLocaleString(undefined, { maximumFractionDigits: 0 })}/day
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Category Pie Chart */}
        <Animated.View entering={FadeInDown.delay(250)} className="items-center py-4 mb-4">
          <DonutChart 
            size={240} 
            strokeWidth={14} 
            data={chartData} 
            totalAmount={totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            trend="12% less"
            currencySymbol={currencySymbol}
          />
        </Animated.View>

        {/* Distribution List */}
        <Animated.View entering={FadeInDown.delay(350)}>
          <Text className="text-text-dark font-bold text-base mb-3">Category Distribution</Text>
          {chartData.length === 0 ? (
            <View className="bg-white p-6 rounded-2xl shadow-sm items-center">
              <Ionicons name="pie-chart-outline" size={48} color="#CCC" />
              <Text className="text-text-grey text-[14px] mt-3">No expenses to show</Text>
              <Text className="text-text-grey text-[12px] mt-1">Add some expenses to see distribution</Text>
            </View>
          ) : (
            chartData.map((item) => (
              <TouchableOpacity 
                key={item.name} 
                className="bg-white rounded-2xl shadow-sm mb-3 flex-row items-center justify-between" 
                style={{ padding: 16 }}
                onPress={() => setSelectedCategory({ name: item.name, total: item.amount, budget: monthlyBudget / chartData.length })}
                activeOpacity={0.7}
              >
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
                <View className="flex-row items-center">
                  <Text className="text-text-dark font-bold mr-2">{currencySymbol}{item.amount.toLocaleString()}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#999" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </Animated.View>

        <View className="h-32" />
      </ScrollView>

      <CategoryBottomSheet 
        isVisible={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        onTransactionPress={(transaction) => {
          setSelectedCategory(null);
          setSelectedTransaction(transaction);
        }}
        category={selectedCategory}
        expenses={currentMonthTransactions}
        currencySymbol={currencySymbol}
      />

      <TransactionDetailSheet 
        isVisible={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
        currencySymbol={currencySymbol}
      />
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
