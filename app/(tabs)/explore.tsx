import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useExpenses } from '../../hooks/use-expenses';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CategoryBottomSheet } from '../../components/CategoryBottomSheet';
import { TransactionDetailSheet } from '../../components/TransactionDetailSheet';
import { Expense } from '../../types/expense';

const CATEGORIES = [
  { name: 'Food', icon: 'restaurant', budget: 1200 },
  { name: 'Transport', icon: 'car', budget: 500 },
  { name: 'Shopping', icon: 'cart', budget: 1500 },
  { name: 'Bills', icon: 'receipt', budget: 2000 },
  { name: 'Electronics', icon: 'laptop', budget: 3000 },
];

const getWeekDays = () => {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push({
      name: day.toLocaleDateString('en-US', { weekday: 'short' }),
      date: day.getDate(),
      fullDate: day.toISOString().split('T')[0]
    });
  }
  return days;
};

export default function ExpensesScreen() {
  const { expenses } = useExpenses();
  const insets = useSafeAreaInsets();
  const weekDays = useMemo(() => getWeekDays(), []);
  const todayDate = new Date().toISOString().split('T')[0];
  
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Expense | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => e.date.split('T')[0] === selectedDate);
  }, [expenses, selectedDate]);

  const categoryData = useMemo(() => {
    return CATEGORIES.map(cat => {
      // Calculate total for this category on the selected date
      const total = filteredExpenses
        .filter(e => e.category.toLowerCase() === cat.name.toLowerCase())
        .reduce((sum, e) => sum + e.amount, 0);
      return { ...cat, total };
    });
  }, [filteredExpenses]);

  const totalExpenseOnDate = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSalary = 15000; // Mock salary

  const handleCategoryPress = (cat: any) => {
    setSelectedCategory(cat);
    setIsDrawerVisible(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F6FA', paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-5 py-md">
        <Text className="text-text-dark font-bold text-[22px]">Expenses</Text>
      </View>

      {/* Calendar Strip */}
      <View className="px-5 pb-md">
        <View className="flex-row justify-between">
          {weekDays.map((day) => (
            <TouchableOpacity 
              key={day.fullDate} 
              onPress={() => setSelectedDate(day.fullDate)}
              className={`items-center py-3 px-3 rounded-2xl flex-1 mx-1 ${selectedDate === day.fullDate ? 'bg-primary-accent' : 'bg-white'}`}
              style={{ elevation: selectedDate === day.fullDate ? 4 : 1 }}
            >
              <Text className={`text-[10px] font-medium ${selectedDate === day.fullDate ? 'text-white' : 'text-text-grey'}`}>{day.name}</Text>
              <Text className={`text-[15px] font-bold mt-1 ${selectedDate === day.fullDate ? 'text-white' : 'text-text-dark'}`}>{day.date}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

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
        {categoryData.map((cat, index) => (
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
                  <Ionicons name={getCategoryIcon(cat.name) as any} size={20} color="#5B2EFF" />
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
                className={`h-full rounded-full ${cat.total > (cat.budget/30) ? 'bg-danger' : 'bg-primary'}`} 
              />
            </View>
            <Text className="text-right text-text-grey text-[10px] mt-1">
              Limit: ${cat.budget}
            </Text>
          </TouchableOpacity>
        ))}
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
