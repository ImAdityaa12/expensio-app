import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useExpenses } from '../hooks/use-expenses';
import { NewExpense } from '../types/expense';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight, useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const CATEGORIES = [
  { name: 'Food', icon: 'restaurant', color: '#FF6B6B', light: '#FFF0F0' },
  { name: 'Transport', icon: 'car', color: '#4D96FF', light: '#F0F5FF' },
  { name: 'Shopping', icon: 'cart', color: '#FFD93D', light: '#FFFBEB' },
  { name: 'Bills', icon: 'receipt', color: '#6BCB77', light: '#F0FFF4' },
  { name: 'Entertainment', icon: 'play', color: '#9D65C9', light: '#F5F0FF' },
  { name: 'Others', icon: 'apps', color: '#9CA3AF', light: '#F9FAFB' },
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Missing Info', 'Please provide an amount and merchant name.');
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    }
  };

  const selectCategory = (name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCategory(name);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
    >
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {/* Modern Header */}
        <View className="px-6 py-2 flex-row justify-between items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center border border-gray-100"
          >
            <Ionicons name="close" size={24} color="#42224A" />
          </TouchableOpacity>
          <Text className="text-lg font-poppins-semibold text-dark">New Transaction</Text>
          <View className="w-10" />
        </View>

        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 120 }}
        >
          {/* Amount Display Section */}
          <Animated.View 
            entering={FadeInDown.delay(100).duration(600)}
            className="items-center py-6 mb-2"
          >
            <Text className="text-gray-400 font-poppins-medium text-xs uppercase tracking-[3px] mb-2">How much?</Text>
            <View className="flex-row items-center">
              <Text className="text-4xl font-poppins-bold text-primary mr-1">$</Text>
              <TextInput
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#E5E7EB"
                style={{ fontSize: 52, fontFamily: 'Poppins_700Bold' }}
                className="text-dark min-w-[150px] text-center"
                autoFocus
              />
            </View>
          </Animated.View>

          {/* Form Fields */}
          <View className="space-y-6">
            {/* Merchant Field */}
            <Animated.View entering={FadeInDown.delay(200).duration(600)}>
              <Text className="text-dark font-poppins-semibold text-sm mb-3">Where did you spend it?</Text>
              <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-0.5 border border-gray-100">
                <View className="w-8 h-8 rounded-lg bg-white items-center justify-center shadow-sm">
                  <Ionicons name="business" size={18} color="#42224A" />
                </View>
                <TextInput
                  value={merchant}
                  onChangeText={setMerchant}
                  placeholder="e.g. Starbucks Coffee"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 py-4 px-3 font-poppins text-dark"
                />
              </View>
            </Animated.View>

            {/* Category Section */}
            <Animated.View entering={FadeInDown.delay(300).duration(600)}>
              <Text className="text-dark font-poppins-semibold text-sm mb-4">Choose Category</Text>
              <View className="flex-row flex-wrap justify-between">
                {CATEGORIES.map((cat, idx) => (
                  <TouchableOpacity
                    key={cat.name}
                    onPress={() => selectCategory(cat.name)}
                    activeOpacity={0.7}
                    style={{ width: '31%', marginBottom: 12 }}
                  >
                    <View 
                      className={`items-center py-4 rounded-2xl border ${
                        category === cat.name ? 'border-primary' : 'border-gray-100 bg-white'
                      }`}
                      style={category === cat.name ? { backgroundColor: cat.light } : {}}
                    >
                      <Ionicons 
                        name={cat.icon as any} 
                        size={22} 
                        color={cat.color} 
                      />
                      <Text 
                        className={`font-poppins-medium text-[11px] mt-2 ${
                          category === cat.name ? 'text-primary' : 'text-gray-500'
                        }`}
                      >
                        {cat.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* Note Field */}
            <Animated.View entering={FadeInDown.delay(400).duration(600)}>
              <Text className="text-dark font-poppins-semibold text-sm mb-3">Add a note (optional)</Text>
              <View className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="What was this purchase for?"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={2}
                  className="font-poppins text-dark text-sm min-h-[60px]"
                  textAlignVertical="top"
                />
              </View>
            </Animated.View>
          </View>
        </ScrollView>

        {/* Sticky Action Button */}
        <View 
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-50 px-6"
          style={{ 
            paddingBottom: insets.bottom > 0 ? insets.bottom : 20, 
            paddingTop: 16,
          }}
        >
          <Animated.View entering={FadeInDown.delay(500).duration(600)}>
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.9}
              className="bg-primary p-5 rounded-2xl items-center shadow-xl"
              style={{
                shadowColor: "#42224A",
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 10,
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center">
                  <Text className="text-white font-poppins-bold text-lg mr-2">Create Record</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
