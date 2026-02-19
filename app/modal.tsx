import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useExpenses } from '../hooks/use-expenses';
import { NewExpense } from '../types/expense';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Others'];

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
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold text-gray-800 mb-6">Add Expense</Text>

      <View className="space-y-4">
        <View>
          <Text className="text-gray-700 mb-2 font-medium">Amount (₹)</Text>
          <TextInput
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            className="border border-gray-300 rounded-lg p-4 text-xl font-bold text-gray-800"
          />
        </View>

        <View className="mt-4">
          <Text className="text-gray-700 mb-2 font-medium">Merchant / Description</Text>
          <TextInput
            value={merchant}
            onChangeText={setMerchant}
            placeholder="Where did you spend?"
            className="border border-gray-300 rounded-lg p-4 text-gray-800"
          />
        </View>

        <View className="mt-4">
          <Text className="text-gray-700 mb-2 font-medium">Category</Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full border ${
                  category === cat ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
                }`}
              >
                <Text className={category === cat ? 'text-white' : 'text-gray-600'}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mt-4">
          <Text className="text-gray-700 mb-2 font-medium">Note (Optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add a note..."
            multiline
            numberOfLines={3}
            className="border border-gray-300 rounded-lg p-4 text-gray-800 h-24"
            textAlignVertical="top"
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSave}
        disabled={loading}
        className="bg-blue-600 p-4 rounded-xl items-center mt-10 mb-10 shadow-lg"
      >
        <Text className="text-white font-bold text-lg">{loading ? 'Saving...' : 'Save Expense'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
