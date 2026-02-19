import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useExpenses } from '../hooks/use-expenses';
import { NewExpense } from '../types/expense';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = [
  { name: 'Food', icon: 'restaurant-outline' },
  { name: 'Transport', icon: 'car-outline' },
  { name: 'Shopping', icon: 'cart-outline' },
  { name: 'Bills', icon: 'receipt-outline' },
  { name: 'Entertainment', icon: 'play-outline' },
  { name: 'Others', icon: 'apps-outline' },
];

export default function ModalScreen() {
  const router = useRouter();
  const { addExpense } = useExpenses();
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('Others');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!amount || !merchant) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    const newExpense: NewExpense = {
      amount: parseFloat(amount),
      merchant,
      category,
      note,
      date: new Date().toISOString(),
      source: 'manual',
    };

    const result = await addExpense(newExpense);
    setLoading(false);

    if (result) {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1 px-6 pt-6">
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-2xl font-poppins-bold text-dark">Add Expense</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#42224A" />
          </TouchableOpacity>
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-gray-400 mb-2 font-poppins-medium text-xs uppercase tracking-widest">Amount</Text>
            <View className="flex-row items-center border-b border-gray-100 pb-2">
              <Text className="text-3xl font-poppins-bold text-dark mr-2">$</Text>
              <TextInput
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#D1D5DB"
                className="flex-1 text-4xl font-poppins-bold text-dark"
                autoFocus
              />
            </View>
          </View>

          <View className="mt-8">
            <Text className="text-gray-400 mb-4 font-poppins-medium text-xs uppercase tracking-widest">Category</Text>
            <View className="flex-row flex-wrap gap-3">
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.name}
                  onPress={() => setCategory(cat.name)}
                  className={`flex-row items-center px-4 py-2 rounded-2xl border ${
                    category === cat.name ? 'bg-primary border-primary' : 'bg-white border-gray-100'
                  }`}
                >
                  <Ionicons 
                    name={cat.icon as any} 
                    size={16} 
                    color={category === cat.name ? 'white' : '#42224A'} 
                    style={{ marginRight: 6 }}
                  />
                  <Text className={`font-poppins-medium text-sm ${category === cat.name ? 'text-white' : 'text-gray-600'}`}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mt-8">
            <Text className="text-gray-400 mb-2 font-poppins-medium text-xs uppercase tracking-widest">Merchant</Text>
            <TextInput
              value={merchant}
              onChangeText={setMerchant}
              placeholder="e.g. Starbucks, Amazon"
              placeholderTextColor="#D1D5DB"
              className="bg-background rounded-2xl p-4 font-poppins text-dark"
            />
          </View>

          <View className="mt-6 mb-10">
            <Text className="text-gray-400 mb-2 font-poppins-medium text-xs uppercase tracking-widest">Note (Optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="What was this for?"
              placeholderTextColor="#D1D5DB"
              multiline
              numberOfLines={3}
              className="bg-background rounded-2xl p-4 font-poppins text-dark h-24"
              textAlignVertical="top"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="bg-primary p-5 rounded-3xl items-center shadow-lg mb-10"
          style={{
            shadowColor: "#42224A",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 8,
          }}
        >
          <Text className="text-white font-poppins-bold text-lg">{loading ? 'Saving...' : 'Save Expense'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
