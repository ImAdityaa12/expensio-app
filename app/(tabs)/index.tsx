import { UserProfileSheet } from '@/components/UserProfileSheet';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnalyticsChart } from '../../components/AnalyticsChart';
import { BalanceCard } from '../../components/BalanceCard';
import { ExpenseItem } from '../../components/ExpenseItem';
import { TransactionDetailSheet } from '../../components/TransactionDetailSheet';
import { useExpenses } from '../../hooks/use-expenses';
import { supabase } from '../../lib/supabase';
import { Transaction } from '../../types/schema';

export default function HomeScreen() {
  const { transactions, loading, deleteTransaction, totalBalance, currencySymbol } = useExpenses();
  const [userName, setUserName] = useState('User');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        const emailName = user.email.split('@')[0];
        setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
      }
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F6FA', paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-5 h-[60px] flex-row justify-between items-center">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full bg-primary items-center justify-center shadow-sm"
          onPress={() => setShowUserProfile(true)}
          activeOpacity={0.7}
        >
          <Text className="text-white font-bold text-[16px]">
            {userName.charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
        
        <View className="flex-1 items-center">
          <Text className="text-text-dark font-bold text-[18px]">Home</Text>
          <Text className="text-text-grey text-[11px]">Welcome, {userName}</Text>
        </View>
        
        <TouchableOpacity 
          className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm"
        >
          <Ionicons name="notifications-outline" size={20} color="#1E1E1E" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Balance Card */}
        <Animated.View entering={FadeInDown.delay(100)} className="mt-6 px-5">
          <BalanceCard amount={totalBalance} currencySymbol={currencySymbol} />
        </Animated.View>

        {/* Analytics Section */}
        <Animated.View entering={FadeInDown.delay(200)} className="px-5 mt-6">
           <AnalyticsChart currencySymbol={currencySymbol} />
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
                  currencySymbol={currencySymbol}
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
        currencySymbol={currencySymbol}
      />

      <UserProfileSheet 
        isVisible={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />
    </View>
  );
}
