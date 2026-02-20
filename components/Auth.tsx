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
      style={{ flex: 1, backgroundColor: '#101F22' }}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} 
        className="px-8"
        style={{ paddingTop: insets.top + 60 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(800)} className="items-center mb-16">
          <View className="w-20 h-20 bg-primary rounded-3xl items-center justify-center shadow-2xl mb-6 shadow-primary/40">
            <Ionicons name="wallet" size={40} color="#101F22" />
          </View>
          <Text className="text-4xl font-bold text-white text-center">Expensio</Text>
          <Text className="text-muted text-center mt-3 px-6 leading-relaxed">
            Your premium gateway to smart financial management.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(800).delay(200)} className="space-y-6">
          <View>
            <Text className="text-muted mb-2 font-medium text-[10px] uppercase tracking-[3px] ml-1">Account Email</Text>
            <View className="bg-dark-card rounded-2xl flex-row items-center px-5 py-4 border border-white/5">
              <Ionicons name="mail-outline" size={18} color="#13C8EC" style={{ marginRight: 15 }} />
              <TextInput
                onChangeText={(text) => setEmail(text)}
                value={email}
                placeholder="email@example.com"
                placeholderTextColor="rgba(255,255,255,0.2)"
                autoCapitalize={'none'}
                keyboardType="email-address"
                className="flex-1 font-medium text-white text-base"
              />
            </View>
          </View>

          <View className="mt-6">
            <Text className="text-muted mb-2 font-medium text-[10px] uppercase tracking-[3px] ml-1">Secret Password</Text>
            <View className="bg-dark-card rounded-2xl flex-row items-center px-5 py-4 border border-white/5">
              <Ionicons name="lock-closed-outline" size={18} color="#13C8EC" style={{ marginRight: 15 }} />
              <TextInput
                onChangeText={(text) => setPassword(text)}
                value={password}
                secureTextEntry={true}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.2)"
                autoCapitalize={'none'}
                className="flex-1 font-medium text-white text-base"
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(800).delay(400)}>
          <TouchableOpacity 
            activeOpacity={0.8}
            disabled={loading} 
            onPress={handleAuth}
            className="bg-primary p-5 rounded-2xl items-center shadow-xl mt-12 shadow-primary/30"
          >
            {loading ? (
              <ActivityIndicator color="#101F22" />
            ) : (
              <Text className="text-dark font-bold text-lg">
                {isLogin ? 'Sign In Now' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setIsLogin(!isLogin)}
            className="mt-8 items-center"
            activeOpacity={0.7}
          >
            <Text className="text-muted font-medium text-sm">
              {isLogin ? "New to the platform? " : "Already have an account? "}
              <Text className="text-primary font-bold">{isLogin ? 'Sign Up' : 'Sign In'}</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View 
          entering={FadeInDown.duration(800).delay(600)}
          className="mt-auto pt-10 items-center"
        >
          <View className="bg-white/5 px-4 py-2 rounded-full border border-white/5">
            <Text className="font-bold text-[9px] text-muted uppercase tracking-[2px]">
              Cloud Secure Infrastructure
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
