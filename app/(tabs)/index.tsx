import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useExpenses } from '../../hooks/use-expenses';
import { Expense } from '../../types/expense';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { syncSmsExpenses } from '../../services/sms-service';

export default function HomeScreen() {
  const { expenses, loading, deleteExpense, fetchExpenses } = useExpenses();
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();

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

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View className="bg-white p-4 rounded-xl mb-3 flex-row justify-between items-center shadow-sm">
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text className="text-lg font-bold text-gray-800">{item.merchant}</Text>
          <View className={`ml-2 px-2 py-0.5 rounded-full ${item.source === 'sms' ? 'bg-blue-100' : 'bg-green-100'}`}>
            <Text className={`text-xs ${item.source === 'sms' ? 'text-blue-600' : 'text-green-600'}`}>
              {item.source.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text className="text-gray-500 text-sm">{item.category} • {new Date(item.date).toLocaleDateString()}</Text>
        {item.note && <Text className="text-gray-400 text-xs mt-1 italic">"{item.note}"</Text>}
      </View>
      <View className="items-end">
        <Text className="text-lg font-bold text-red-600">₹{item.amount}</Text>
        <TouchableOpacity onPress={() => deleteExpense(item.id)} className="mt-2">
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="flex-row justify-between items-center mb-6 mt-8">
        <View className="flex-row items-center">
          <View>
            <Text className="text-3xl font-bold text-gray-800">Expenses</Text>
            <Text className="text-gray-500">Track your spending</Text>
          </View>
          <TouchableOpacity 
            onPress={handleLogout}
            className="ml-4 p-2"
          >
            <Ionicons name="log-out-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <View className="flex-row">
          <TouchableOpacity 
            onPress={handleSync}
            disabled={syncing}
            className="bg-gray-200 p-3 rounded-full mr-2"
          >
            {syncing ? (
              <ActivityIndicator size="small" color="#4B5563" />
            ) : (
              <Ionicons name="sync" size={24} color="#4B5563" />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push('/modal')}
            className="bg-blue-600 p-3 rounded-full shadow-lg"
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" className="mt-10" />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={renderExpenseItem}
          ListEmptyComponent={
            <View className="mt-20 items-center">
              <Text className="text-gray-400 text-lg">No expenses yet</Text>
              <Text className="text-gray-400">Tap the + button to add one</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
