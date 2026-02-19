import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useExpenses } from '../../hooks/use-expenses';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { syncSmsExpenses } from '../../services/sms-service';
import { SummaryCard } from '../../components/SummaryCard';
import { ExpenseItem } from '../../components/ExpenseItem';
import { supabase } from '../../lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

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

  const handleSync = async () => {
    setSyncing(true);
    try {
      const count = await syncSmsExpenses();
      if (typeof count === 'number' && count > 0) {
        Alert.alert('Sync Complete', `Added ${count} new expenses from SMS.`);
        fetchExpenses();
      } else {
        Alert.alert('Sync Complete', 'No new transaction SMS found.');
      }
    } catch (error) {
      Alert.alert('Sync Failed', 'Could not read SMS. Make sure you are on Android.');
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Error', error.message);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F4F7', paddingTop: insets.top }}>
      <View className="px-5 pt-4">
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(600)}
          className="flex-row justify-between items-center mb-6"
        >
          <View>
            <Text className="font-poppins text-gray-500 text-base">Welcome back,</Text>
            <Text className="font-poppins-bold text-2xl text-dark capitalize">{userName}</Text>
          </View>
          <View className="flex-row items-center">
             <TouchableOpacity 
              onPress={handleSync}
              className="w-11 h-11 rounded-full bg-white items-center justify-center mr-3 shadow-sm"
              style={{ elevation: 2 }}
            >
              {syncing ? (
                <ActivityIndicator size="small" color="#42224A" />
              ) : (
                <Ionicons name="sync" size={22} color="#42224A" />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} className="w-11 h-11 rounded-full bg-white items-center justify-center shadow-sm" style={{ elevation: 2 }}>
               <Ionicons name="log-out-outline" size={24} color="#EF8767" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Summary Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <SummaryCard amount={totalSpent} />
        </Animated.View>

        {/* Section Title */}
        <Animated.View 
          entering={FadeInDown.delay(300).duration(600)}
          className="flex-row justify-between items-center mb-4 mt-2"
        >
          <Text className="font-poppins-semibold text-lg text-dark">Recent Activity</Text>
          <TouchableOpacity>
            <Text className="font-poppins-medium text-xs text-primary-soft">See all</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#42224A" className="mt-10" />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(400 + index * 100).duration(500)}>
              <ExpenseItem item={item} onDelete={deleteExpense} />
            </Animated.View>
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          ListEmptyComponent={
            <Animated.View entering={FadeInDown.delay(500)} className="mt-20 items-center">
              <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
              <Text className="font-poppins text-gray-400 text-lg mt-4">No expenses yet</Text>
            </Animated.View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
