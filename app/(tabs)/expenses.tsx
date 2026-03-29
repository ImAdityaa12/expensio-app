import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarStrip } from '../../components/CalendarStrip';
import { CategoryBottomSheet } from '../../components/CategoryBottomSheet';
import { TransactionDetailSheet } from '../../components/TransactionDetailSheet';
import { useExpenses } from '../../hooks/use-expenses';
import { Transaction } from '../../types/schema';

export default function ExpensesScreen() {
  const { transactions, categories, accounts, categoryLimits, currencySymbol, fetchData, updateTransaction, setCategoryLimit } = useExpenses();
  const insets = useSafeAreaInsets();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    console.log('🔄 Refreshing transactions...');
    setRefreshing(true);
    await fetchData();
    console.log('🔄 Refresh complete');
    setRefreshing(false);
  };

  // Log when transactions change
  useEffect(() => {
    console.log('📱 Transactions updated, count:', transactions.length);
  }, [transactions]);

  const filteredExpenses = useMemo(() => {
    // Get date in local timezone
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const filtered = transactions.filter(e => {
      // Extract date part from transaction_date (handles both ISO and timezone formats)
      const transactionDateStr = e.transaction_date.split('T')[0];
      return transactionDateStr === dateStr;
    });
    
    console.log('📅 Selected date:', dateStr);
    console.log('📅 Filtered transactions:', filtered.length);
    filtered.forEach(t => {
      console.log('📅 Transaction:', {
        merchant: t.merchant_name,
        amount: t.amount,
        category_id: t.category_id,
        date: t.transaction_date.split('T')[0]
      });
    });
    return filtered;
  }, [transactions, selectedDate]);

  // Calculate daily income and expenses for selected date
  const dailyIncome = useMemo(() => 
    filteredExpenses.filter(e => e.type === 'CREDIT').reduce((sum, e) => sum + e.amount, 0),
  [filteredExpenses]);

  const dailyExpense = useMemo(() => 
    filteredExpenses.filter(e => e.type === 'DEBIT').reduce((sum, e) => sum + e.amount, 0),
  [filteredExpenses]);

  const dailyBalance = useMemo(() => dailyIncome - dailyExpense, [dailyIncome, dailyExpense]);

  const categoryData = useMemo(() => {
    console.log('📊 Calculating category data for date:', selectedDate.toISOString().split('T')[0]);
    console.log('📊 Filtered expenses count:', filteredExpenses.length);
    console.log('📊 Available categories:', categories.map(c => `${c.name}(${c.id})`).join(', '));
    
    if (filteredExpenses.length > 0) {
      console.log('📊 Sample transaction:', {
        id: filteredExpenses[0].id,
        merchant: filteredExpenses[0].merchant_name,
        category_id: filteredExpenses[0].category_id,
        categories: filteredExpenses[0].categories
      });
    }
    
    // Only show categories that have transactions on the selected date
    const categoriesWithData = categories.map(cat => {
      const categoryExpenses = filteredExpenses.filter(e => {
        // Check both category_id and joined categories object
        const matchesById = e.category_id === cat.id;
        const matchesByJoin = e.categories?.id === cat.id;
        const matches = e.type === 'DEBIT' && (matchesById || matchesByJoin);
        
        if (matches) {
          console.log('📊 Match found:', {
            category: cat.name,
            merchant: e.merchant_name,
            amount: e.amount,
            matchType: matchesById ? 'by_id' : 'by_join'
          });
        }
        
        return matches;
      });
      
      const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      if (total > 0) {
        console.log('📊 Category with data:', cat.name, 'ID:', cat.id, 'Total:', total, 'Transactions:', categoryExpenses.length);
      }

      // Calculate dynamic budget based on actual limits
      const limit = categoryLimits.find(l => l.category_id === cat.id);
      let budget = 500; // Default daily fallback

      if (limit) {
        if (limit.period_type === 'DAILY') {
          budget = limit.limit_amount;
        } else if (limit.period_type === 'WEEKLY') {
          budget = limit.limit_amount / 7;
        } else if (limit.period_type === 'MONTHLY') {
          // Get days in current month
          const date = new Date();
          const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
          budget = limit.limit_amount / daysInMonth;
        }
      }
      
      return { 
        id: cat.id,
        name: cat.name, 
        icon: cat.icon || 'apps',
        color: cat.color || '#5B2EFF',
        budget, 
        total 
      };
    }).filter(c => c.total > 0); // Only show categories with expenses
    
    console.log('📊 Final categories with data:', categoriesWithData.map(c => `${c.name}(${c.total})`).join(', '));
    return categoriesWithData;
  }, [filteredExpenses, categories, categoryLimits, selectedDate]);

  const handleCategoryPress = (cat: any) => {
    setSelectedCategory(cat);
    setIsDrawerVisible(true);
  };

  const getCategoryIcon = (iconName: string) => {
    // Simple fallback if icon name isn't valid in Ionicons, but DB should have valid ones
    return iconName;
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F6FA', paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-text-dark font-bold text-[22px]">Expenses</Text>
          <Text className="text-text-grey text-[12px] mt-1">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={refreshing}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: refreshing ? '#E5E7EB' : '#F3F4F6' }}
        >
          <Ionicons 
            name="refresh" 
            size={20} 
            color={refreshing ? '#9CA3AF' : '#374151'} 
            style={{ transform: [{ rotate: refreshing ? '360deg' : '0deg' }] }}
          />
        </TouchableOpacity>
      </View>

      {/* Calendar Strip */}
      <CalendarStrip 
        selectedDate={selectedDate} 
        onDateSelect={setSelectedDate} 
      />

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Summary Cards Row */}
        <View className="flex-row mb-4" style={{ gap: 12 }}>
          {/* Daily Income Card */}
          <View className="flex-1 p-4 rounded-2xl shadow-sm" style={{ backgroundColor: '#10B981' }}>
            <View className="w-8 h-8 rounded-full items-center justify-center mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <Ionicons name="arrow-down" size={16} color="white" />
            </View>
            <Text className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Daily Income</Text>
            <Text className="text-white font-bold text-[18px] mt-1">
              {currencySymbol}{dailyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Text>
            <Text className="text-[9px] mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {dailyIncome === 0 ? 'No income' : 'Today'}
            </Text>
          </View>

          {/* Daily Expense Card */}
          <View className="flex-1 p-4 rounded-2xl shadow-sm" style={{ backgroundColor: '#EF4444' }}>
            <View className="w-8 h-8 rounded-full items-center justify-center mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <Ionicons name="arrow-up" size={16} color="white" />
            </View>
            <Text className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Daily Expense</Text>
            <Text className="text-white font-bold text-[18px] mt-1">
              {currencySymbol}{dailyExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Text>
            <Text className="text-[9px] mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {dailyExpense === 0 ? 'No expenses' : 'Today'}
            </Text>
          </View>
        </View>

        {/* Daily Balance Card */}
        {(dailyIncome > 0 || dailyExpense > 0) && (
          <View className="bg-white rounded-2xl shadow-sm mb-4" style={{ padding: 16 }}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-text-grey text-[12px]">Daily Balance</Text>
                <Text className="font-bold text-[20px] mt-1" style={{ color: dailyBalance >= 0 ? '#10B981' : '#EF4444' }}>
                  {dailyBalance >= 0 ? '+' : ''}{currencySymbol}{Math.abs(dailyBalance).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </Text>
              </View>
              <View className="px-3 py-1 rounded-full" style={{ backgroundColor: dailyBalance >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                <Text className="text-[10px] font-semibold" style={{ color: dailyBalance >= 0 ? '#10B981' : '#EF4444' }}>
                  {dailyBalance >= 0 ? 'Surplus' : 'Deficit'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Category Expense Cards */}
        <Text className="text-text-dark font-bold text-base mb-3">Category Wise</Text>
        {categoryData.length === 0 ? (
          <View className="bg-white p-6 rounded-2xl shadow-sm items-center">
            <Ionicons name="calendar-outline" size={48} color="#CCC" />
            <Text className="text-text-grey text-[14px] mt-3">No expenses for this day</Text>
            <Text className="text-text-grey text-[12px] mt-1">Select another date or add expenses</Text>
          </View>
        ) : (
          categoryData.map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              activeOpacity={0.7}
              onPress={() => {
                // Get original monthly budget for the bottom sheet
                const limit = categoryLimits.find(l => l.category_id === cat.id);
                const fullBudget = limit?.limit_amount || 5000; // Default monthly fallback
                setSelectedCategory({ ...cat, budget: fullBudget });
                setIsDrawerVisible(true);
              }}
              className="bg-white rounded-2xl shadow-sm mb-3"
              style={{ padding: 16 }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: cat.color + '15' }}>
                    <Ionicons name={getCategoryIcon(cat.icon) as any} size={20} color={cat.color} />
                  </View>
                  <View>
                    <Text className="text-text-dark font-semibold capitalize">{cat.name}</Text>
                    <Text className="text-text-grey text-[11px]">
                      {((cat.total / dailyExpense) * 100).toFixed(1)}% of daily expenses
                    </Text>
                  </View>
                </View>
                <Text className="text-text-dark font-bold">{currencySymbol}{cat.total.toLocaleString()}</Text>
              </View>
              
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View 
                  style={{ 
                    width: `${Math.min((cat.total / cat.budget) * 100, 100)}%`,
                    backgroundColor: cat.total > cat.budget ? '#EF4444' : cat.color
                  }} 
                  className="h-full rounded-full"
                />
              </View>
              <View className="flex-row justify-between mt-1">
                <Text className="text-text-grey text-[10px]">
                  Daily limit: {currencySymbol}{Math.round(cat.budget)}
                </Text>
                <Text className="text-text-grey text-[10px]">
                  {cat.total > cat.budget ? 'Over limit' : `${currencySymbol}${Math.max(0, Math.round(cat.budget - cat.total)).toLocaleString()} left`}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View className="h-20" />
      </ScrollView>

      <CategoryBottomSheet 
        isVisible={isDrawerVisible} 
        onClose={() => setIsDrawerVisible(false)} 
        onTransactionPress={(transaction) => {
          setIsDrawerVisible(false);
          setSelectedTransaction(transaction);
        }}
        category={selectedCategory}
        expenses={filteredExpenses} // Only show expenses for the selected date
        currencySymbol={currencySymbol}
        onSetLimit={async (limit) => {
          if (selectedCategory?.id) {
            await setCategoryLimit(selectedCategory.id, limit);
            fetchData();
          }
        }}
      />

      <TransactionDetailSheet 
        isVisible={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
        currencySymbol={currencySymbol}
        categories={categories}
        accounts={accounts}
        onUpdateTransaction={updateTransaction}
        onTransactionUpdated={(updated) => setSelectedTransaction(updated)}
      />
    </View>
  );
}
