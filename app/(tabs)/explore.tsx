import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useExpenses } from '../../hooks/use-expenses';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryBottomSheet } from '../../components/CategoryBottomSheet';
import { TransactionDetailSheet } from '../../components/TransactionDetailSheet';
import { Transaction } from '../../types/schema';
import { CalendarStrip } from '../../components/CalendarStrip';

export default function ExpensesScreen() {
  const { transactions, categories } = useExpenses();
  const insets = useSafeAreaInsets();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const filteredExpenses = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return transactions.filter(e => e.transaction_date.split('T')[0] === dateStr);
  }, [transactions, selectedDate]);

  const categoryData = useMemo(() => {
    // Start with all categories from DB
    return categories.map(cat => {
      // Calculate total for this category on the selected date
      const total = filteredExpenses
        .filter(e => e.categories?.name === cat.name) // Match by name or ID if possible
        .reduce((sum, e) => sum + e.amount, 0);
      
      return { 
        name: cat.name, 
        icon: cat.icon || 'apps', 
        budget: 2000, // Mock budget for now as per instructions
        total 
      };
    }).filter(c => c.total > 0 || true); // Show all or only active? Show all for now.
  }, [filteredExpenses, categories]);

  const totalExpenseOnDate = filteredExpenses.filter(e => e.type === 'DEBIT').reduce((sum, e) => sum + e.amount, 0);
  const totalSalary = 15000; // Mock salary

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
      <View className="px-5 py-md">
        <Text className="text-text-dark font-bold text-[22px]">Expenses</Text>
      </View>

      {/* Calendar Strip */}
      <CalendarStrip 
        selectedDate={selectedDate} 
        onDateSelect={setSelectedDate} 
      />

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Summary Cards Row */}
        <View className="flex-row gap-4 mb-lg">
          <View className="flex-1 bg-white p-lg rounded-[24px] shadow-sm" style={{ elevation: 2 }}>
            <View className="w-8 h-8 rounded-full bg-success/10 items-center justify-center mb-2">
              <Ionicons name="arrow-down" size={16} color="#22C55E" />
            </View>
            <Text className="text-text-grey text-[12px] font-medium">Total Salary</Text>
            <Text className="text-text-dark font-bold text-[18px] mt-1">${(totalSalary/30).toLocaleString(undefined, {maximumFractionDigits: 0})}</Text>
          </View>
          <View className="flex-1 bg-white p-lg rounded-[24px] shadow-sm" style={{ elevation: 2 }}>
            <View className="w-8 h-8 rounded-full bg-danger/10 items-center justify-center mb-2">
              <Ionicons name="arrow-up" size={16} color="#EF4444" />
            </View>
            <Text className="text-text-grey text-[12px] font-medium">Total Expense</Text>
            <Text className="text-danger font-bold text-[18px] mt-1">-${totalExpenseOnDate.toLocaleString()}</Text>
          </View>
        </View>

        {/* Category Expense Cards */}
        <Text className="text-text-dark font-bold text-base mb-md">Category Wise</Text>
        {categoryData.length === 0 ? (
           <Text className="text-text-grey text-center mt-4">No categories found.</Text>
        ) : (
          categoryData.map((cat, index) => (
            <TouchableOpacity 
              key={cat.name} 
              activeOpacity={0.7}
              onPress={() => handleCategoryPress(cat)}
              className="bg-white p-md rounded-[24px] shadow-sm mb-md"
              style={{ elevation: 1 }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-bg-light items-center justify-center mr-3">
                    <Ionicons name={getCategoryIcon(cat.icon) as any} size={20} color="#5B2EFF" />
                  </View>
                  <View>
                    <Text className="text-text-dark font-semibold">{cat.name}</Text>
                    <Text className="text-text-grey text-[12px]">Budget: ${cat.budget}</Text>
                  </View>
                </View>
                <Text className="text-text-dark font-bold">${cat.total.toLocaleString()}</Text>
              </View>
              
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View 
                  style={{ width: `${Math.min((cat.total / cat.budget) * 100, 100)}%` }} 
                  className={`h-full rounded-full ${cat.total > (cat.budget) ? 'bg-danger' : 'bg-primary'}`} 
                />
              </View>
              <Text className="text-right text-text-grey text-[10px] mt-1">
                Limit: ${cat.budget}
              </Text>
            </TouchableOpacity>
          ))
        )}
        <View className="h-20" />
      </ScrollView>

      <CategoryBottomSheet 
        isVisible={isDrawerVisible} 
        onClose={() => setIsDrawerVisible(false)} 
        onTransactionPress={(transaction) => setSelectedTransaction(transaction)}
        category={selectedCategory}
        expenses={filteredExpenses} // Only show expenses for the selected date
      />

      <TransactionDetailSheet 
        isVisible={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />
    </View>
  );
}
