import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NumericKeypad } from '../../components/NumericKeypad';
import { supabase } from '../../lib/supabase';
import { Account, Category } from '../../types/schema';

const DEFAULT_CATEGORIES = [
  { name: 'Food', icon: 'restaurant', color: '#FF6B6B' },
  { name: 'Transport', icon: 'car', color: '#4ECDC4' },
  { name: 'Shopping', icon: 'cart', color: '#FFD93D' },
  { name: 'Bills', icon: 'receipt', color: '#6C5CE7' },
  { name: 'Entertainment', icon: 'game-controller', color: '#A8E6CF' },
  { name: 'Health', icon: 'fitness', color: '#FF8B94' },
  { name: 'Education', icon: 'school', color: '#95E1D3' },
  { name: 'Others', icon: 'apps', color: '#C7CEEA' },
];

export default function AddExpenseScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [amount, setAmount] = useState('0');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [description, setDescription] = useState('');
  const [transactionType, setTransactionType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load profile for currency
    const { data: profile } = await supabase
      .from('profiles')
      .select('currency')
      .eq('id', user.id)
      .single();
    
    if (profile?.currency) {
      setCurrencySymbol(profile.currency === 'USD' ? '$' : profile.currency === 'EUR' ? '€' : '₹');
    }

    // Load categories
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    
    if (cats && cats.length > 0) {
      setCategories(cats);
      setSelectedCategory(cats[0]);
    } else {
      // Create default categories if none exist
      const defaultCats = DEFAULT_CATEGORIES.map(cat => ({
        user_id: user.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        is_default: true,
      }));
      
      const { data: newCats } = await supabase
        .from('categories')
        .insert(defaultCats)
        .select();
      
      if (newCats) {
        setCategories(newCats);
        setSelectedCategory(newCats[0]);
      }
    }

    // Load accounts
    const { data: accs } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id);
    
    if (accs && accs.length > 0) {
      setAccounts(accs);
      setSelectedAccount(accs[0]);
    }
  };

  const handleNumberPress = (num: string) => {
    if (num === '.' && amount.includes('.')) return;
    if (amount === '0' && num !== '.') {
      setAmount(num);
    } else {
      const newAmount = amount + num;
      const parts = newAmount.split('.');
      if (parts[1] && parts[1].length > 2) return;
      setAmount(newAmount);
    }
  };

  const handleDelete = () => {
    if (amount.length === 1) {
      setAmount('0');
    } else {
      setAmount(amount.slice(0, -1));
    }
  };

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Select Category', 'Please select a category');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      account_id: selectedAccount?.id || null,
      category_id: selectedCategory.id,
      amount: numAmount,
      type: transactionType,
      description: description || null,
      merchant_name: null,
      transaction_date: new Date().toISOString(),
      source: 'MANUAL',
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to add transaction');
      console.error(error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', `${transactionType === 'CREDIT' ? 'Income' : 'Expense'} added successfully`);
      setAmount('0');
      setDescription('');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#5B2EFF', paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-5 py-4">
        <Text className="text-white font-bold text-[22px]">Add Transaction</Text>
      </View>

      {/* Amount Display */}
      <Animated.View entering={FadeInDown.delay(100)} className="items-center py-8">
        <Text className="text-white/60 text-[14px] mb-2">Amount</Text>
        <Text className="text-white font-bold text-[48px]">
          {currencySymbol}{parseFloat(amount || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </Animated.View>

      {/* Type Toggle */}
      <Animated.View entering={FadeInDown.delay(150)} className="flex-row mx-5 mb-4 bg-white/10 rounded-2xl p-1">
        <TouchableOpacity
          onPress={() => setTransactionType('DEBIT')}
          className={`flex-1 py-3 rounded-xl ${transactionType === 'DEBIT' ? 'bg-white' : ''}`}
          activeOpacity={0.7}
        >
          <Text className={`text-center font-semibold ${transactionType === 'DEBIT' ? 'text-primary' : 'text-white'}`}>
            Expense
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTransactionType('CREDIT')}
          className={`flex-1 py-3 rounded-xl ${transactionType === 'CREDIT' ? 'bg-white' : ''}`}
          activeOpacity={0.7}
        >
          <Text className={`text-center font-semibold ${transactionType === 'CREDIT' ? 'text-primary' : 'text-white'}`}>
            Income
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Category Selection */}
      <Animated.View entering={FadeInDown.delay(200)} className="px-5 mb-4">
        <Text className="text-white/80 text-[14px] mb-3">Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat)}
              className={`mr-3 items-center ${selectedCategory?.id === cat.id ? 'opacity-100' : 'opacity-60'}`}
              activeOpacity={0.7}
            >
              <View 
                className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                style={{ backgroundColor: selectedCategory?.id === cat.id ? 'white' : 'rgba(255,255,255,0.2)' }}
              >
                <Ionicons 
                  name={cat.icon as any || 'pricetag'} 
                  size={28} 
                  color={selectedCategory?.id === cat.id ? '#5B2EFF' : 'white'} 
                />
              </View>
              <Text className="text-white text-[12px] capitalize">{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Account Selection */}
      {accounts.length > 0 && (
        <Animated.View entering={FadeInDown.delay(250)} className="px-5 mb-4">
          <Text className="text-white/80 text-[14px] mb-3">Account</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {accounts.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                onPress={() => setSelectedAccount(acc)}
                className={`mr-3 px-4 py-3 rounded-xl ${selectedAccount?.id === acc.id ? 'bg-white' : 'bg-white/20'}`}
                activeOpacity={0.7}
              >
                <Text className={`font-semibold ${selectedAccount?.id === acc.id ? 'text-primary' : 'text-white'}`}>
                  {acc.account_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      <View className="flex-1" />

      {/* Keypad */}
      <Animated.View
        entering={FadeInDown.delay(300)}
        className="bg-white rounded-t-[32px] pt-4"
        style={{ paddingBottom: tabBarHeight + Math.max(insets.bottom, 12) }}
      >
        <NumericKeypad onPress={handleNumberPress} onDelete={handleDelete} />
        
        <View className="px-5 mt-4">
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            className="bg-primary py-4 rounded-2xl items-center shadow-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-[16px]">
              {loading ? 'Saving...' : 'Add Transaction'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
