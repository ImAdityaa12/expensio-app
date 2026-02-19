import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import "../global.css";
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import Auth from '../components/Auth';
import { View, ActivityIndicator } from 'react-native';
import { 
  useFonts, 
  Poppins_300Light, 
  Poppins_400Regular, 
  Poppins_500Medium, 
  Poppins_600SemiBold, 
  Poppins_700Bold 
} from '@expo-google-fonts/poppins';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const CustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F7F4F7',
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

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F4F7' }}>
        <ActivityIndicator size="large" color="#42224A" />
      </View>
    );
  }

  if (!session) {
    return (
      <ThemeProvider value={CustomTheme}>
        <Auth />
        <StatusBar style="dark" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={CustomTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Add Expense' }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
