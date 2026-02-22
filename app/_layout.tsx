import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    useFonts
} from '@expo-google-fonts/poppins';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Session } from '@supabase/supabase-js';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import 'react-native-reanimated';
import "../global.css";
import { supabase } from '../lib/supabase';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { registerBackgroundSyncTask, unregisterBackgroundSyncTask } from '@/services/background-sms-sync';
import { startSmsListener, stopSmsListener } from '@/services/sms-listener';
import { registerSmsHeadlessTask } from '../services/sms-headless-task';

// Register headless task for background SMS processing
if (Platform.OS === 'android') {
  registerSmsHeadlessTask();
}

export const unstable_settings = {
  anchor: '(tabs)',
};

const CustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#101F22',
    card: '#101F22',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  let [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // Start SMS listener when user is logged in
  useEffect(() => {
    if (session) {
      console.log('🚀🚀🚀 ========================================');
      console.log('🚀 APP INITIALIZED WITH USER SESSION');
      console.log('🚀 Platform:', Platform.OS);
      console.log('🚀 Starting SMS listener initialization...');
      console.log('🚀🚀🚀 ========================================');
      
      // Start real-time SMS listener
      startSmsListener().then((started) => {
        if (started) {
          console.log('🚀 ✅✅✅ SMS LISTENER IS NOW ACTIVE!');
          console.log('🚀 Waiting for incoming SMS messages...');
        } else {
          console.log('🚀 ❌❌❌ SMS LISTENER FAILED TO START');
          console.log('🚀 This usually means:');
          console.log('🚀 1. Running in Expo Go (native modules not supported)');
          console.log('🚀 2. Permission was denied');
          console.log('🚀 3. Not running on Android');
        }
      }).catch((error) => {
        console.error('🚀 ❌ SMS listener error:', error);
        console.log('🚀 If you see "null is not an object", you are likely in Expo Go');
        console.log('🚀 You need to build a development build:');
        console.log('🚀 Run: npx expo prebuild --clean && npx expo run:android');
      });

      // Register background sync task
      registerBackgroundSyncTask().then((registered) => {
        if (registered) {
          console.log('🚀 ✅ Background sync task registered');
        } else {
          console.log('🚀 ⚠️ Background sync task registration failed');
        }
      });

      return () => {
        console.log('🚀 Cleaning up SMS listener and background tasks...');
        stopSmsListener();
        unregisterBackgroundSyncTask();
      };
    } else {
      console.log('🚀 No user session - SMS listener not started');
    }
  }, [session]);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#101F22' }}>
        <ActivityIndicator size="large" color="#13C8EC" />
      </View>
    );
  }

  return (
    <ThemeProvider value={CustomTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {!session ? (
          <Stack.Screen name="auth" options={{ animation: 'fade' }} />
        ) : (
          <>
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen name="modal" options={{ presentation: 'fullScreenModal', headerShown: false }} />
          </>
        )}
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
