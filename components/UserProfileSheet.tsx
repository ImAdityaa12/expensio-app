import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { supabase } from '../lib/supabase';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface UserProfileSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

export const UserProfileSheet = ({ isVisible, onClose }: UserProfileSheetProps) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || '');
      setUserName(user.email?.split('@')[0] || 'User');
      
      // Load profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setCurrency(profile.currency || 'INR');
        if (profile.name) setUserName(profile.name);
      }
    }
  };

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      translateY.value = withTiming(SCREEN_HEIGHT * 0.2, { duration: 300 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, (finished) => {
        if (finished) {
          runOnJS(setShouldRender)(false);
        }
      });
    }
  }, [isVisible, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [SCREEN_HEIGHT, SCREEN_HEIGHT * 0.2], [0, 0.5]),
  }));

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            onClose();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  if (!shouldRender) return null;

  const getCurrencySymbol = (code: string) => {
    switch (code?.toUpperCase()) {
      case 'INR': return '₹';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '₹';
    }
  };

  return (
    <Modal
      visible={shouldRender}
      transparent
      animationType="none"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100000, elevation: 100000 }}>
        <Animated.View
          style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'black' }, backdropStyle]}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>

        <Animated.View
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-2xl"
          style={[{ height: SCREEN_HEIGHT * 0.8, zIndex: 100001, elevation: 100001 }, animatedStyle]}
        >
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mt-3 mb-4" />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 180 }}
          >
          {/* Profile Header */}
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-3">
              <Text className="text-white font-bold text-[32px]">
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="text-text-dark font-bold text-[22px]">{userName}</Text>
            <Text className="text-text-grey text-[14px] mt-1">{userEmail}</Text>
          </View>

          {/* Profile Info Cards */}
          <View className="px-5">
            <View className="bg-bg-light rounded-2xl p-4 mb-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                  <Ionicons name="cash-outline" size={20} color="#5B2EFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-text-grey text-[12px]">Currency</Text>
                  <Text className="text-text-dark font-semibold text-[16px]">
                    {currency} ({getCurrencySymbol(currency)})
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-bg-light rounded-2xl p-4 mb-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                  <Ionicons name="mail-outline" size={20} color="#5B2EFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-text-grey text-[12px]">Email</Text>
                  <Text className="text-text-dark font-semibold text-[14px]" numberOfLines={1}>
                    {userEmail}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity 
              className="bg-bg-light rounded-2xl p-4 mb-3 flex-row items-center justify-between"
              onPress={() => {
                onClose();
                router.push('/profile');
              }}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                  <Ionicons name="settings-outline" size={20} color="#5B2EFF" />
                </View>
                <Text className="text-text-dark font-semibold text-[16px]">Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-danger/10 rounded-2xl p-4 flex-row items-center justify-center"
              onPress={handleSignOut}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text className="text-danger font-bold text-[16px] ml-2">Sign Out</Text>
            </TouchableOpacity>
          </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};
