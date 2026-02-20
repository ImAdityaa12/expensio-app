import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useExpenses } from '../../hooks/use-expenses';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { syncSmsExpenses } from '../../services/sms-service';
import { ExpenseItem } from '../../components/ExpenseItem';
import { CircularProgress } from '../../components/CircularProgress';
import { supabase } from '../../lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function HomeScreen() {
  const { expenses, loading, deleteExpense, fetchExpenses } = useExpenses();
  const [syncing, setSyncing] = useState(false);
  const [userName, setUserName] = useState('User');
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserName(user.email.split('@')[0]);
      }
    });
  }, []);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const monthlyBudget = 4000;
  const budgetProgress = Math.min(totalSpent / monthlyBudget, 1);

  return (
    <View style={{ flex: 1, backgroundColor: '#101F22', paddingTop: insets.top }}>
      {/* 2.0 Dashboard Header */}
      <View className="px-lg py-md flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3 border border-primary/20">
            <Ionicons name="person" size={20} color="#13C8EC" />
          </View>
          <View>
            <Text className="text-muted text-[10px] uppercase font-medium tracking-[2px]">Welcome back,</Text>
            <Text className="text-white font-bold text-[18px] capitalize">{userName}</Text>
          </View>
        </View>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-dark-card items-center justify-center border border-white/5 shadow-sm">
          <Ionicons name="notifications-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Monthly Budget Card (Glass Effect) */}
        <Animated.View entering={FadeInDown.delay(100)} className="px-lg py-md">
          <View className="bg-dark-card p-lg rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
             {/* Subtle Decorative Elements */}
            <View className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-primary/5" />
            
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-muted text-[10px] uppercase font-medium tracking-[2px] mb-xs">Monthly Budget</Text>
                <Text className="text-white font-bold text-[32px] tracking-tight">${monthlyBudget.toLocaleString()}</Text>
                
                <View className="mt-lg">
                   <View className="bg-success/10 px-sm py-xs rounded-full flex-row items-center self-start">
                    <Ionicons name="trending-down" size={12} color="#10B981" />
                    <Text className="text-success text-[10px] font-bold ml-xs">12% decrease</Text>
                  </View>
                </View>
              </View>
              
              <CircularProgress 
                size={120} 
                strokeWidth={10} 
                progress={budgetProgress} 
                amount={totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                label="Spent"
              />
            </View>
          </View>
        </Animated.View>

        {/* Quick Stats Grid (8pt gap) */}
        <Animated.View entering={FadeInDown.delay(200)} className="px-lg flex-row gap-4 mt-sm">
          <View className="flex-1 bg-dark-card p-md rounded-lg border border-white/5">
            <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center mb-md">
              <Ionicons name="arrow-up" size={16} color="#13C8EC" />
            </View>
            <Text className="text-muted text-[10px] uppercase font-medium tracking-wider mb-xs">Inflow</Text>
            <Text className="text-white font-bold text-[18px]">$8,420</Text>
          </View>
          <View className="flex-1 bg-dark-card p-md rounded-lg border border-white/5">
            <View className="w-8 h-8 rounded-lg bg-danger/10 items-center justify-center mb-md">
              <Ionicons name="arrow-down" size={16} color="#EF4444" />
            </View>
            <Text className="text-muted text-[10px] uppercase font-medium tracking-wider mb-xs">Outflow</Text>
            <Text className="text-white font-bold text-[18px]">${totalSpent.toLocaleString()}</Text>
          </View>
        </Animated.View>

        {/* Transaction List Header */}
        <View className="px-lg mt-xl mb-md flex-row justify-between items-center">
          <Text className="text-white font-bold text-[16px]">Recent Activity</Text>
          <TouchableOpacity onPress={() => fetchExpenses()}>
            <Text className="text-primary text-[12px] font-semibold">View All</Text>
          </TouchableOpacity>
        </View>

        {/* List Content with Icon Boxes */}
        <View className="px-lg">
          {loading ? (
            <ActivityIndicator size="small" color="#13C8EC" className="mt-md" />
          ) : (
            expenses.slice(0, 10).map((item, index) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(300 + index * 50)}>
                <ExpenseItem item={item} onDelete={deleteExpense} />
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB - Glow Effect */}
      <TouchableOpacity
        onPress={() => router.push('/modal')}
        activeOpacity={0.8}
        className="absolute bottom-10 right-lg w-16 h-16 rounded-full bg-primary items-center justify-center shadow-xl"
        style={{ 
          shadowColor: '#13C8EC', 
          shadowOpacity: 0.6, 
          shadowRadius: 15, 
          elevation: 12,
        }}
      >
        <Ionicons name="add" size={32} color="#101F22" />
      </TouchableOpacity>
    </View>
  );
}
