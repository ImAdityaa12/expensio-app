import React, { useState } from 'react';
import { Alert, StyleSheet, View, AppState, TextInput, TouchableOpacity, Text } from 'react-native';
import { supabase } from '../lib/supabase';

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_IN` event
// if the refresh token is successfully exchanged for a new access token.
AppState.addEventListener('change', (nextAppState) => {
  if (nextAppState === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    if (!session && !error) Alert.alert('Please check your inbox for email verification!');
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center p-5 bg-white">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-gray-800">Expensio</Text>
        <Text className="text-gray-500 mt-2">Smart Auto Expense Tracker</Text>
      </View>
      
      <View className="space-y-4">
        <View>
          <Text className="text-gray-700 mb-2 font-medium">Email</Text>
          <TextInput
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="email@address.com"
            autoCapitalize={'none'}
            className="border border-gray-300 rounded-lg p-3 text-gray-800"
          />
        </View>
        <View className="mt-4">
          <Text className="text-gray-700 mb-2 font-medium">Password</Text>
          <TextInput
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize={'none'}
            className="border border-gray-300 rounded-lg p-3 text-gray-800"
          />
        </View>
      </View>

      <View className="mt-8 space-y-3">
        <TouchableOpacity 
          disabled={loading} 
          onPress={() => signInWithEmail()}
          className="bg-blue-600 p-4 rounded-lg items-center"
        >
          <Text className="text-white font-bold text-lg">{loading ? 'Loading...' : 'Sign in'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          disabled={loading} 
          onPress={() => signUpWithEmail()}
          className="mt-4 border border-blue-600 p-4 rounded-lg items-center"
        >
          <Text className="text-blue-600 font-bold text-lg">Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
