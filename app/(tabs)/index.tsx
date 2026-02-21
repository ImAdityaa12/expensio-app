import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useExpenses } from '../../hooks/use-expenses';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ExpenseItem } from '../../components/ExpenseItem';
import { BalanceCard } from '../../components/BalanceCard';
import { AnalyticsChart } from '../../components/AnalyticsChart';
import { TransactionDetailSheet } from '../../components/TransactionDetailSheet';
import { supabase } from '../../lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Transaction } from '../../types/schema';

export default function HomeScreen() {
  const { transactions, loading, deleteTransaction, totalBalance } = useExpenses();
  const [userName, setUserName] = useState('Priscilla');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserName(user.email.split('@')[0]);
      }
    });
  }, []);

  // Calculate daily expense for summary if needed, but for now using total balance
  // The 'totalBalance' from hook is sum of accounts. If 0 (no accounts), maybe fallback?
  // Let's stick to what the hook provides. If accounts are empty, balance is 0.

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F6FA', paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-5 h-[60px] flex-row justify-between items-center">
        <View className="w-10 h-10 rounded-full bg-white items-center justify-center overflow-hidden shadow-sm">
           <Ionicons name="person" size={20} color="#5B2EFF" />
        </View>
        <Text className="text-text-dark font-bold text-[18px]">Home</Text>
        <TouchableOpacity 
          className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm"
        >
          <Ionicons name="notifications-outline" size={20} color="#1E1E1E" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Balance Card */}
        <Animated.View entering={FadeInDown.delay(100)} className="mt-6 px-5">
          <BalanceCard amount={totalBalance} />
        </Animated.View>

        {/* Analytics Section */}
        <Animated.View entering={FadeInDown.delay(200)} className="px-5 mt-6">
           <AnalyticsChart />
        </Animated.View>

        {/* Transaction List */}
        <Animated.View entering={FadeInDown.delay(300)} className="px-5 mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-text-dark font-bold text-[16px]">Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/expenses')}>
              <Text className="text-text-grey text-[14px]">View All</Text>
            </TouchableOpacity>
          </View>
          
          <View className="bg-white rounded-[24px] px-5 py-2 shadow-sm">
            {loading ? (
              <ActivityIndicator size="small" color="#5B2EFF" className="py-xl" />
            ) : transactions.length === 0 ? (
              <View className="py-xl items-center">
                <Text className="text-text-grey">No transactions yet.</Text>
              </View>
            ) : (
              transactions.slice(0, 5).map((item) => (
                <ExpenseItem 
                  key={item.id} 
                  item={item} 
                  onDelete={deleteTransaction}
                  onPress={() => setSelectedTransaction(item)}
                />
              ))
            )}
          </View>
        </Animated.View>
      </ScrollView>

      <TransactionDetailSheet 
        isVisible={!!selectedTransaction} 
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />
    </View>
  );
}
