import React, { useState } from 'react';
import { Alert, View, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  async function handleAuth() {
    setLoading(true);
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) Alert.alert('Error', error.message);
    } else {
      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) Alert.alert('Error', error.message);
      if (!session && !error) Alert.alert('Check your inbox for email verification!');
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pt-20">
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-primary rounded-3xl items-center justify-center shadow-xl mb-6">
            <Ionicons name="wallet" size={40} color="white" />
          </View>
          <Text className="text-3xl font-poppins-bold text-dark text-center">Expensio</Text>
          <Text className="font-poppins text-gray-400 text-center mt-2">
            Premium Auto Expense Tracking
          </Text>
        </View>

        <View className="space-y-5">
          <View>
            <Text className="text-gray-400 mb-2 font-poppins-medium text-xs uppercase tracking-widest ml-1">Email Address</Text>
            <View className="bg-white rounded-2xl flex-row items-center px-4 py-4 shadow-sm border border-gray-50">
              <Ionicons name="mail-outline" size={20} color="#42224A" style={{ marginRight: 12 }} />
              <TextInput
                onChangeText={(text) => setEmail(text)}
                value={email}
                placeholder="you@example.com"
                autoCapitalize={'none'}
                className="flex-1 font-poppins text-dark"
              />
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-gray-400 mb-2 font-poppins-medium text-xs uppercase tracking-widest ml-1">Password</Text>
            <View className="bg-white rounded-2xl flex-row items-center px-4 py-4 shadow-sm border border-gray-50">
              <Ionicons name="lock-closed-outline" size={20} color="#42224A" style={{ marginRight: 12 }} />
              <TextInput
                onChangeText={(text) => setPassword(text)}
                value={password}
                secureTextEntry={true}
                placeholder="Minimum 6 characters"
                autoCapitalize={'none'}
                className="flex-1 font-poppins text-dark"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          disabled={loading} 
          onPress={handleAuth}
          className="bg-primary p-5 rounded-3xl items-center shadow-lg mt-10"
          style={{
            shadowColor: "#42224A",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 8,
          }}
        >
          <Text className="text-white font-poppins-bold text-lg">
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setIsLogin(!isLogin)}
          className="mt-6 items-center"
        >
          <Text className="font-poppins text-gray-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Text className="text-accent font-poppins-semibold">{isLogin ? 'Sign Up' : 'Sign In'}</Text>
          </Text>
        </TouchableOpacity>
        
        <View className="mt-auto mb-10 items-center">
          <Text className="font-poppins-light text-[10px] text-gray-400 uppercase tracking-[2px]">
            Securely powered by Supabase
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
