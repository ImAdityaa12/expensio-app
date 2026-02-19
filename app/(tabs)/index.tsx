import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, TextInput } from 'react-native';
import { useExpenses } from '../../hooks/use-expenses';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { syncSmsExpenses } from '../../services/sms-service';
import { SummaryCard } from '../../components/SummaryCard';
import { ExpenseItem } from '../../components/ExpenseItem';
import { supabase } from '../../lib/supabase';

export default function HomeScreen() {
  const { expenses, loading, deleteExpense, fetchExpenses } = useExpenses();
  const [syncing, setSyncing] = useState(false);
  const [userName, setUserName] = useState('User');
  const router = useRouter();

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
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="font-poppins text-gray-500 text-lg">Hello,</Text>
            <Text className="font-poppins-bold text-2xl text-dark">{userName}</Text>
          </View>
          <View className="flex-row items-center">
             <TouchableOpacity 
              onPress={handleSync}
              className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3 shadow-sm"
            >
              <Ionicons name="sync" size={20} color="#42224A" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm">
              <Ionicons name="search" size={20} color="#42224A" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} className="ml-3">
               <Ionicons name="log-out-outline" size={24} color="#EF8767" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Card */}
        <SummaryCard amount={totalSpent} />

        {/* Section Title */}
        <View className="flex-row justify-between items-center mb-4 mt-2">
          <Text className="font-poppins-semibold text-lg text-dark">Today</Text>
          <TouchableOpacity>
            <Text className="font-poppins text-xs text-primary-soft">View All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#42224A" className="mt-10" />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExpenseItem item={item} onDelete={deleteExpense} />
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="mt-20 items-center">
              <Text className="font-poppins text-gray-400 text-lg">No expenses yet</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
