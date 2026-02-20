import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useExpenses } from '../../hooks/use-expenses';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ExpenseItem } from '../../components/ExpenseItem';
import { BalanceCard } from '../../components/BalanceCard';
import { supabase } from '../../lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function HomeScreen() {
  const { expenses, loading, deleteExpense, fetchExpenses } = useExpenses();
  const [userName, setUserName] = useState('Priscilla');
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserName(user.email.split('@')[0]);
      }
    });
  }, []);

  const income = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const outcome = expenses.filter(e => e.type !== 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalBalance = 25000 + income - outcome; // Mock starting balance + net

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F6FA', paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-lg py-md flex-row justify-between items-center">
        <View>
          <Text className="text-text-grey text-[14px]">Hello,</Text>
          <Text className="text-text-dark font-bold text-[22px] capitalize">{userName}</Text>
        </View>
        <TouchableOpacity 
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
          style={{ elevation: 2 }}
        >
          <Ionicons name="search" size={20} color="#1E1E1E" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Balance Card */}
        <Animated.View entering={FadeInDown.delay(100)} className="mt-sm">
          <BalanceCard amount={totalBalance} />
        </Animated.View>

        {/* Transaction List */}
        <View className="px-lg mt-xl">
          <Text className="text-text-dark font-semibold text-[16px] mb-md">Recent Activity</Text>
          
          <View className="bg-white rounded-3xl px-md py-sm shadow-sm" style={{ elevation: 1 }}>
            {loading ? (
              <ActivityIndicator size="small" color="#4B2E83" className="py-xl" />
            ) : expenses.length === 0 ? (
              <View className="py-xl items-center">
                <Text className="text-text-grey">No transactions yet.</Text>
              </View>
            ) : (
              expenses.slice(0, 10).map((item, index) => (
                <ExpenseItem 
                  key={item.id} 
                  item={item} 
                  onDelete={deleteExpense} 
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
