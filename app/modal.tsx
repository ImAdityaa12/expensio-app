import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useExpenses } from '../hooks/use-expenses';
import { NewExpense } from '../types/expense';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { NumericKeypad } from '../components/NumericKeypad';

const CATEGORIES = [
  { name: 'Food', icon: 'restaurant' },
  { name: 'Transport', icon: 'car' },
  { name: 'Shopping', icon: 'cart' },
  { name: 'Bills', icon: 'receipt' },
  { name: 'Entertainment', icon: 'play' },
  { name: 'Others', icon: 'apps' },
];

export default function ModalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addExpense } = useExpenses();
  const [amount, setAmount] = useState('0');
  const [category, setCategory] = useState('Others');
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    const newExpense: NewExpense = {
      amount: numAmount,
      merchant: 'Quick Entry',
      category,
      note: '',
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

  return (
    <View style={{ flex: 1, backgroundColor: '#101F22' }}>
      {/* Compact Header */}
      <View 
        style={{ paddingTop: insets.top, height: insets.top + 56 }} 
        className="px-lg flex-row justify-between items-center bg-dark"
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full items-center justify-center bg-dark-surface border border-dark-border"
        >
          <Ionicons name="close" size={18} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-[16px]">New Expense</Text>
        <View className="w-9" />
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {/* Compact Amount Section */}
        <View className="items-center justify-center pt-md pb-xs">
          <Text className="text-muted font-medium text-[10px] uppercase tracking-[3px] mb-xs">Amount</Text>
          <View className="flex-row items-center">
            <Text className="text-primary font-bold text-[28px] mt-1 mr-xs">$</Text>
            <Text style={{ fontSize: 60 }} className="text-white font-bold tracking-tighter">
              {amount}
            </Text>
            <Animated.View entering={FadeInDown} className="w-[3px] h-10 bg-primary ml-1 rounded-full" />
          </View>
        </View>

        {/* Category Grid - 3 Balanced Columns, Full Width */}
        <View className="px-lg mb-md">
          <Text className="text-muted font-semibold text-[11px] uppercase tracking-widest mb-sm">Category</Text>
          <View className="flex-row flex-wrap justify-between">
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.name;
              return (
                <TouchableOpacity
                  key={cat.name}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setCategory(cat.name);
                  }}
                  style={{ width: '31.5%', marginBottom: 10 }}
                  className={`aspect-[1.1] rounded-xl items-center justify-center border transition-all duration-200 ${
                    isActive ? 'border-primary bg-primary/10' : 'border-dark-border bg-dark-card'
                  }`}
                >
                  <Ionicons name={cat.icon as any} size={26} color={isActive ? '#13C8EC' : '#64748B'} />
                  <Text className={`text-[10px] uppercase font-bold mt-1.5 ${isActive ? 'text-primary' : 'text-muted'}`}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Action Row - Simplified */}
        <View className="px-lg flex-row items-center justify-between py-md border-t border-white/5">
           <View className="flex-row items-center">
             <View className="w-8 h-8 rounded-lg bg-dark-card items-center justify-center border border-dark-border mr-sm">
               <Ionicons name="calendar-outline" size={14} color="#13C8EC" />
             </View>
             <Text className="text-white text-[12px] font-medium">Today</Text>
           </View>
           
           <TouchableOpacity className="flex-row items-center">
             <Text className="text-muted text-[12px] font-medium mr-sm">Add Note</Text>
             <View className="w-8 h-8 rounded-lg bg-dark-card items-center justify-center border border-dark-border">
               <Ionicons name="create-outline" size={14} color="#64748B" />
             </View>
           </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Docked Keypad & Save */}
      <View className="bg-dark-card border-t border-dark-border rounded-t-3xl">
        <NumericKeypad onPress={handleKeyPress} onDelete={handleDelete} />
        
        <View 
          className="px-lg pb-sm pt-xs flex-row justify-end"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
            className="bg-primary px-8 py-4 rounded-2xl shadow-lg shadow-primary/20"
          >
            {loading ? (
              <ActivityIndicator color="#101F22" />
            ) : (
              <Text className="text-dark font-bold text-[16px]">Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
