import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useExpenses } from '../../hooks/use-expenses';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CategoryBottomSheet } from '../../components/CategoryBottomSheet';

const CATEGORIES = [
  { name: 'Food', icon: 'restaurant', budget: 1200 },
  { name: 'Transport', icon: 'car', budget: 500 },
  { name: 'Shopping', icon: 'cart', budget: 1500 },
  { name: 'Bills', icon: 'receipt', budget: 2000 },
  { name: 'Electronics', icon: 'laptop', budget: 3000 },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DATES = [16, 17, 18, 19, 20, 21, 22];

export default function ExpensesScreen() {
  const { expenses } = useExpenses();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(20);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const categoryData = useMemo(() => {
    return CATEGORIES.map(cat => {
      const total = expenses
        .filter(e => e.category.toLowerCase() === cat.name.toLowerCase())
        .reduce((sum, e) => sum + e.amount, 0);
      return { ...cat, total };
    });
  }, [expenses]);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSalary = 15000; // Mock salary

  const handleCategoryPress = (cat: any) => {
    setSelectedCategory(cat);
    setIsDrawerVisible(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F6FA', paddingTop: insets.top }}>
      {/* Calendar Strip */}
      <View className="px-lg py-md">
        <Text className="text-text-dark font-bold text-lg mb-md">February 2026</Text>
        <View className="flex-row justify-between">
          {DATES.map((date, i) => (
            <TouchableOpacity 
              key={date} 
              onPress={() => setSelectedDate(date)}
              className={`items-center py-2 px-3 rounded-2xl ${selectedDate === date ? 'bg-primary-accent' : ''}`}
            >
              <Text className={`text-[12px] ${selectedDate === date ? 'text-white' : 'text-text-grey'}`}>{DAYS[i]}</Text>
              <Text className={`text-[16px] font-bold mt-1 ${selectedDate === date ? 'text-white' : 'text-text-dark'}`}>{date}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 px-lg" showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View className="flex-row gap-4 mb-lg">
          <View className="flex-1 bg-white p-md rounded-2xl shadow-sm" style={{ elevation: 1 }}>
            <Text className="text-text-grey text-[12px] font-medium">Total Salary</Text>
            <Text className="text-success font-bold text-[20px] mt-1">${totalSalary.toLocaleString()}</Text>
          </View>
          <View className="flex-1 bg-white p-md rounded-2xl shadow-sm" style={{ elevation: 1 }}>
            <Text className="text-text-grey text-[12px] font-medium">Total Expense</Text>
            <Text className="text-danger font-bold text-[20px] mt-1">-${totalExpense.toLocaleString()}</Text>
          </View>
        </View>

        {/* Category Expense Cards */}
        <Text className="text-text-dark font-bold text-base mb-md">Categories</Text>
        {categoryData.map((cat, index) => (
          <TouchableOpacity 
            key={cat.name} 
            activeOpacity={0.7}
            onPress={() => handleCategoryPress(cat)}
            className="bg-white p-md rounded-2xl shadow-sm mb-md"
            style={{ elevation: 1 }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-bg-light items-center justify-center mr-3">
                  <Ionicons name={cat.icon as any} size={20} color="#4B2E83" />
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
                className={`h-full rounded-full ${cat.total > cat.budget ? 'bg-danger' : 'bg-primary'}`} 
              />
            </View>
            <Text className="text-right text-text-grey text-[10px] mt-1">
              {Math.round((cat.total / cat.budget) * 100)}% of budget
            </Text>
          </TouchableOpacity>
        ))}
        <View className="h-20" />
      </ScrollView>

      <CategoryBottomSheet 
        isVisible={isDrawerVisible} 
        onClose={() => setIsDrawerVisible(false)} 
        category={selectedCategory}
        expenses={expenses}
      />
    </View>
  );
}
