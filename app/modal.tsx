import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useExpenses } from '../hooks/use-expenses';
import { NewExpense } from '../types/expense';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

const CATEGORIES = [
  { name: 'Food', icon: 'restaurant', color: '#FF6B6B' },
  { name: 'Transport', icon: 'car', color: '#4D96FF' },
  { name: 'Shopping', icon: 'cart', color: '#FFD93D' },
  { name: 'Bills', icon: 'receipt', color: '#6BCB77' },
  { name: 'Entertainment', icon: 'play', color: '#9D65C9' },
  { name: 'Others', icon: 'apps', color: '#9CA3AF' },
];

export default function ModalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <ScrollView 
        className="flex-1 px-6" 
        style={{ paddingTop: insets.top + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(600)} className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-3xl font-poppins-bold text-dark">Add Expense</Text>
            <Text className="text-gray-400 font-poppins text-sm">Fill in the details below</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name="close" size={24} color="#42224A" />
          </TouchableOpacity>
        </Animated.View>

        <View className="space-y-8">
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <Text className="text-gray-400 mb-2 font-poppins-semibold text-[10px] uppercase tracking-[2px]">Amount</Text>
            <View className="flex-row items-center border-b-2 border-primary/10 pb-2">
              <Text className="text-4xl font-poppins-bold text-dark mr-2">$</Text>
              <TextInput
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#D1D5DB"
                className="flex-1 text-5xl font-poppins-bold text-dark"
                autoFocus
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(600)} className="mt-8">
            <Text className="text-gray-400 mb-4 font-poppins-semibold text-[10px] uppercase tracking-[2px]">Category</Text>
            <View className="flex-row flex-wrap gap-3">
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.name}
                  onPress={() => setCategory(cat.name)}
                  className={`flex-row items-center px-4 py-3 rounded-[20px] border ${
                    category === cat.name ? 'bg-primary border-primary' : 'bg-white border-gray-100'
                  }`}
                  style={category === cat.name ? { elevation: 4, shadowColor: '#42224A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 } : {}}
                >
                  <Ionicons 
                    name={cat.icon as any} 
                    size={18} 
                    color={category === cat.name ? 'white' : cat.color} 
                    style={{ marginRight: 8 }}
                  />
                  <Text className={`font-poppins-semibold text-sm ${category === cat.name ? 'text-white' : 'text-gray-600'}`}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600)} className="mt-8">
            <Text className="text-gray-400 mb-2 font-poppins-semibold text-[10px] uppercase tracking-[2px]">Merchant</Text>
            <View className="flex-row items-center bg-gray-50 rounded-[20px] px-4 border border-gray-100">
              <Ionicons name="business-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
              <TextInput
                value={merchant}
                onChangeText={setMerchant}
                placeholder="e.g. Starbucks, Amazon"
                placeholderTextColor="#D1D5DB"
                className="flex-1 py-4 font-poppins-medium text-dark"
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).duration(600)} className="mt-6 mb-10">
            <Text className="text-gray-400 mb-2 font-poppins-semibold text-[10px] uppercase tracking-[2px]">Note (Optional)</Text>
            <View className="bg-gray-50 rounded-[20px] px-4 border border-gray-100">
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="What was this for?"
                placeholderTextColor="#D1D5DB"
                multiline
                numberOfLines={3}
                className="py-4 font-poppins text-dark h-24"
                textAlignVertical="top"
              />
            </View>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(600).duration(600)}>
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
            className="bg-primary p-5 rounded-[24px] items-center shadow-xl mb-12"
            style={{
              shadowColor: "#42224A",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-poppins-bold text-lg">Create Expense</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
