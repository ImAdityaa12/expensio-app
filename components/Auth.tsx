import React, { useState } from 'react';
import { Alert, View, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const insets = useSafeAreaInsets();

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
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
      style={{ flex: 1, backgroundColor: '#F7F4F7' }}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} 
        className="px-8"
        style={{ paddingTop: insets.top + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(800).delay(100)} className="items-center mb-12">
          <LinearGradient
            colors={['#42224A', '#8F659A']}
            className="w-24 h-24 rounded-[32px] items-center justify-center shadow-2xl mb-6"
            style={{ elevation: 12 }}
          >
            <Ionicons name="wallet" size={48} color="white" />
          </LinearGradient>
          <Text className="text-4xl font-poppins-bold text-dark text-center">Expensio</Text>
          <View className="h-1 w-12 bg-accent rounded-full mt-2" />
          <Text className="font-poppins text-gray-400 text-center mt-4 px-10">
            Smart & seamless expense tracking for your lifestyle
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(800).delay(300)} className="space-y-6">
          <View>
            <Text className="text-gray-400 mb-2 font-poppins-semibold text-[10px] uppercase tracking-[2px] ml-1">Email Address</Text>
            <View className="bg-white rounded-[24px] flex-row items-center px-5 py-5 shadow-sm border border-gray-50">
              <Ionicons name="mail-outline" size={20} color="#42224A" style={{ marginRight: 15 }} />
              <TextInput
                onChangeText={(text) => setEmail(text)}
                value={email}
                placeholder="you@example.com"
                placeholderTextColor="#D1D5DB"
                autoCapitalize={'none'}
                keyboardType="email-address"
                className="flex-1 font-poppins-medium text-dark text-base"
              />
            </View>
          </View>

          <View className="mt-6">
            <Text className="text-gray-400 mb-2 font-poppins-semibold text-[10px] uppercase tracking-[2px] ml-1">Password</Text>
            <View className="bg-white rounded-[24px] flex-row items-center px-5 py-5 shadow-sm border border-gray-50">
              <Ionicons name="lock-closed-outline" size={20} color="#42224A" style={{ marginRight: 15 }} />
              <TextInput
                onChangeText={(text) => setPassword(text)}
                value={password}
                secureTextEntry={true}
                placeholder="Minimum 6 characters"
                placeholderTextColor="#D1D5DB"
                autoCapitalize={'none'}
                className="flex-1 font-poppins-medium text-dark text-base"
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(800).delay(500)}>
          <TouchableOpacity 
            activeOpacity={0.8}
            disabled={loading} 
            onPress={handleAuth}
            className="bg-primary p-6 rounded-[28px] items-center shadow-xl mt-12"
            style={{
              shadowColor: "#42224A",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-poppins-bold text-lg">
                {isLogin ? 'Sign In to Account' : 'Create New Account'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setIsLogin(!isLogin)}
            className="mt-8 items-center"
            activeOpacity={0.7}
          >
            <Text className="font-poppins-medium text-gray-500 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Text className="text-accent font-poppins-bold">{isLogin ? 'Sign Up' : 'Sign In'}</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View 
          entering={FadeInDown.duration(800).delay(700)}
          className="mt-16 mb-6 items-center"
        >
          <View className="flex-row items-center bg-gray-100/50 px-4 py-2 rounded-full">
            <Ionicons name="shield-checkmark" size={12} color="#9CA3AF" style={{ marginRight: 6 }} />
            <Text className="font-poppins-bold text-[9px] text-gray-400 uppercase tracking-[2px]">
              Encrypted & Secure by Supabase
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
