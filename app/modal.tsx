import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NumericKeypad } from '../components/NumericKeypad';
import { useExpenses } from '../hooks/use-expenses';

export default function ModalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addExpense, categories, accounts, currencySymbol } = useExpenses();
  const [amount, setAmount] = useState('0');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Set defaults when data loads
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [categories, accounts]);

  const handleKeyPress = (val: string) => {
    setAmount(prev => {
      if (prev === '0' && val !== '.') return val;
      if (val === '.' && prev.includes('.')) return prev;
      if (prev.includes('.') && prev.split('.')[1].length >= 2) return prev;
      return prev + val;
    });
  };

  const handleDelete = () => {
    setAmount(prev => (prev.length === 1 ? '0' : prev.slice(0, -1)));
  };

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (!selectedCategoryId || !selectedAccountId) {
      Alert.alert('Missing Information', 'Please select a category and an account.');
      return;
    }

    setLoading(true);
    const result = await addExpense({
      amount: numAmount,
      merchant_name: 'Quick Entry',
      category_id: selectedCategoryId,
      account_id: selectedAccountId,
      description: 'Manual Entry',
      transaction_date: new Date().toISOString(),
      source: 'MANUAL',
      type: 'DEBIT',
    });
    setLoading(false);

    if (result) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F6FA' }}>
      {/* Compact Header */}
      <View 
        style={{ paddingTop: insets.top, height: insets.top + 56 }} 
        className="px-lg flex-row justify-between items-center"
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full items-center justify-center bg-white shadow-sm"
        >
          <Ionicons name="close" size={20} color="#1E1E1E" />
        </TouchableOpacity>
        <Text className="text-text-dark font-bold text-[16px]">New Expense</Text>
        <View className="w-9" />
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {/* Compact Amount Section */}
        <View className="items-center justify-center pt-md pb-xs">
          <Text className="text-text-grey font-medium text-[10px] uppercase tracking-[3px] mb-xs">Amount</Text>
          <View className="flex-row items-center">
            <Text className="text-primary font-bold text-[28px] mt-1 mr-xs">{currencySymbol}</Text>
            <Text style={{ fontSize: 60 }} className="text-text-dark font-bold tracking-tighter">
              {amount}
            </Text>
            <Animated.View entering={FadeInDown} className="w-[3px] h-10 bg-primary ml-1 rounded-full" />
          </View>
        </View>

        {/* Category Grid */}
        <View className="px-lg mb-md">
          <Text className="text-text-grey font-semibold text-[11px] uppercase tracking-widest mb-sm">Category</Text>
          {categories.length === 0 ? (
            <Text className="text-text-grey">No categories found. Please add categories in settings.</Text>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {categories.map((cat) => {
                const isActive = selectedCategoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedCategoryId(cat.id);
                    }}
                    style={{ width: '31.5%', marginBottom: 10 }}
                    className={`aspect-[1.1] rounded-xl items-center justify-center border ${
                      isActive ? 'border-primary bg-primary/10' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={cat.icon as any || 'pricetag'} size={24} color={isActive ? '#4B2E83' : '#8A8A8A'} />
                    </View>
                    <Text className={`text-[10px] uppercase font-bold mt-1.5 text-center ${isActive ? 'text-primary' : 'text-text-grey'}`}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Payment Method (Accounts) */}
        <View className="px-lg mb-md">
          <Text className="text-text-grey font-semibold text-[11px] uppercase tracking-widest mb-sm">Payment Account</Text>
          {accounts.length === 0 ? (
            <Text className="text-text-grey">No accounts found.</Text>
          ) : (
            <View className="flex-row gap-3 flex-wrap">
              {accounts.map((acc) => {
                const isActive = selectedAccountId === acc.id;
                return (
                  <TouchableOpacity
                    key={acc.id}
                    onPress={() => setSelectedAccountId(acc.id)}
                    className={`min-w-[100px] py-3 px-4 rounded-xl border items-center ${
                      isActive ? 'border-primary bg-primary/10' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Text className={`font-bold ${isActive ? 'text-primary' : 'text-text-grey'}`}>
                      {acc.account_name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Docked Keypad & Save */}
      <View className="bg-white border-t border-gray-100 rounded-t-3xl shadow-lg">
        <NumericKeypad onPress={handleKeyPress} onDelete={handleDelete} />
        
        <View 
          className="px-lg pb-sm pt-xs flex-row justify-end"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
            className="bg-primary px-8 py-4 rounded-2xl shadow-lg"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-[16px]">Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
