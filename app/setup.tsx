import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useExpenses } from '../hooks/use-expenses';

export default function SetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { fetchData, accounts, categories } = useExpenses();
  
  const [loading, setLoading] = useState(false);
  
  // Profile State
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');

  // Account State
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [balance, setBalance] = useState('');

  // Category State
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('pricetag'); // Default icon

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setName(data.name || '');
        setCurrency(data.currency || 'USD');
      }
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name,
      currency,
      updated_at: new Date().toISOString(),
    });

    setLoading(false);
    if (error) Alert.alert('Error', error.message);
    else Alert.alert('Success', 'Profile updated!');
  };

  const handleAddAccount = async () => {
    if (!bankName || !accountName || !balance) {
      Alert.alert('Error', 'Please fill all account fields');
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('accounts').insert({
      user_id: user.id,
      bank_name: bankName,
      account_name: accountName,
      balance: parseFloat(balance),
    });

    if (error) Alert.alert('Error', error.message);
    else {
      setBankName('');
      setAccountName('');
      setBalance('');
      fetchData(); // Refresh data
      Alert.alert('Success', 'Account added!');
    }
    setLoading(false);
  };

  const handleAddCategory = async () => {
    if (!categoryName) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('categories').insert({
      user_id: user.id,
      name: categoryName,
      icon: categoryIcon,
      is_default: false,
    });

    if (error) Alert.alert('Error', error.message);
    else {
      setCategoryName('');
      fetchData(); // Refresh data
      Alert.alert('Success', 'Category added!');
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F6FA', paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1E1E1E" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-dark">Setup Data</Text>
      </View>

      <ScrollView className="flex-1 px-5 py-6" showsVerticalScrollIndicator={false}>
        
        {/* Profile Section */}
        <View className="bg-white p-5 rounded-2xl mb-6 shadow-sm">
          <Text className="text-lg font-bold text-text-dark mb-4">Profile Information</Text>
          <Text className="text-xs text-text-grey mb-1 uppercase">Full Name</Text>
          <TextInput 
            value={name}
            onChangeText={setName}
            className="bg-gray-50 p-3 rounded-xl mb-3 text-text-dark border border-gray-100"
            placeholder="John Doe"
          />
          <Text className="text-xs text-text-grey mb-1 uppercase">Currency</Text>
          <TextInput 
            value={currency}
            onChangeText={setCurrency}
            className="bg-gray-50 p-3 rounded-xl mb-4 text-text-dark border border-gray-100"
            placeholder="USD, INR, EUR..."
          />
          <TouchableOpacity onPress={handleSaveProfile} className="bg-primary py-3 rounded-xl items-center">
            <Text className="text-white font-bold">Save Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Accounts Section */}
        <View className="bg-white p-5 rounded-2xl mb-6 shadow-sm">
          <Text className="text-lg font-bold text-text-dark mb-4">Add Account</Text>
          
          <Text className="text-xs text-text-grey mb-1 uppercase">Bank Name</Text>
          <TextInput 
            value={bankName}
            onChangeText={setBankName}
            className="bg-gray-50 p-3 rounded-xl mb-3 text-text-dark border border-gray-100"
            placeholder="e.g. Chase, HDFC"
          />
          <Text className="text-xs text-text-grey mb-1 uppercase">Account Name</Text>
          <TextInput 
            value={accountName}
            onChangeText={setAccountName}
            className="bg-gray-50 p-3 rounded-xl mb-3 text-text-dark border border-gray-100"
            placeholder="e.g. Salary, Savings"
          />
          <Text className="text-xs text-text-grey mb-1 uppercase">Initial Balance</Text>
          <TextInput 
            value={balance}
            onChangeText={setBalance}
            keyboardType="numeric"
            className="bg-gray-50 p-3 rounded-xl mb-4 text-text-dark border border-gray-100"
            placeholder="0.00"
          />
          <TouchableOpacity onPress={handleAddAccount} className="bg-primary py-3 rounded-xl items-center">
            <Text className="text-white font-bold">Add Account</Text>
          </TouchableOpacity>

          {/* List Existing Accounts */}
          {accounts.length > 0 && (
            <View className="mt-4 border-t border-gray-100 pt-4">
              <Text className="text-sm font-semibold text-text-grey mb-2">Existing Accounts:</Text>
              {accounts.map(acc => (
                <View key={acc.id} className="flex-row justify-between py-2 border-b border-gray-50">
                  <Text className="text-text-dark">{acc.account_name} ({acc.bank_name})</Text>
                  <Text className="font-bold text-primary">${acc.balance}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Categories Section */}
        <View className="bg-white p-5 rounded-2xl mb-6 shadow-sm">
          <Text className="text-lg font-bold text-text-dark mb-4">Add Category</Text>
          
          <Text className="text-xs text-text-grey mb-1 uppercase">Category Name</Text>
          <TextInput 
            value={categoryName}
            onChangeText={setCategoryName}
            className="bg-gray-50 p-3 rounded-xl mb-3 text-text-dark border border-gray-100"
            placeholder="e.g. Groceries, Rent"
          />
          
          {/* Simple Icon Selection */}
          <Text className="text-xs text-text-grey mb-2 uppercase">Select Icon</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {['pricetag', 'restaurant', 'car', 'cart', 'receipt', 'home', 'play', 'medical', 'school', 'airplane'].map(icon => (
              <TouchableOpacity 
                key={icon} 
                onPress={() => setCategoryIcon(icon)}
                className={`w-10 h-10 rounded-full items-center justify-center border ${categoryIcon === icon ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
              >
                <Ionicons name={icon as any} size={18} color={categoryIcon === icon ? 'white' : '#8A8A8A'} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={handleAddCategory} className="bg-primary py-3 rounded-xl items-center">
            <Text className="text-white font-bold">Add Category</Text>
          </TouchableOpacity>

          {/* List Existing Categories */}
          {categories.length > 0 && (
            <View className="mt-4 border-t border-gray-100 pt-4">
              <Text className="text-sm font-semibold text-text-grey mb-2">Existing Categories:</Text>
              <View className="flex-row flex-wrap gap-2">
                {categories.map(cat => (
                  <View key={cat.id} className="bg-gray-50 px-3 py-1.5 rounded-full flex-row items-center border border-gray-200">
                    <Ionicons name={cat.icon as any || 'pricetag'} size={12} color="#5B2EFF" className="mr-1" />
                    <Text className="text-xs text-text-dark">{cat.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
