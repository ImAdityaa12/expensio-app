import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  interpolate 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Expense } from '../types/expense';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CategoryBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  category: {
    name: string;
    total: number;
    budget: number;
  } | null;
  expenses: Expense[];
}

export const CategoryBottomSheet = ({ isVisible, onClose, category, expenses }: CategoryBottomSheetProps) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(SCREEN_HEIGHT * 0.15, { damping: 15 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT);
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [SCREEN_HEIGHT, SCREEN_HEIGHT * 0.15], [0, 0.5]),
  }));

  if (!category) return null;

  return (
    <>
      {isVisible && (
        <Pressable 
          className="absolute inset-0 bg-black" 
          style={[{ zIndex: 50 }, backdropStyle]} 
          onPress={onClose}
        />
      )}
      <Animated.View 
        className="absolute bottom-0 left-0 right-0 bg-primary-dark rounded-t-[32px] overflow-hidden"
        style={[{ height: SCREEN_HEIGHT * 0.85, zIndex: 100 }, animatedStyle]}
      >
        <View className="w-12 h-1 bg-white/20 rounded-full self-center mt-3 mb-6" />
        
        <View className="px-lg pb-lg items-center">
          <Text className="text-white font-bold text-[28px]">
            -${category.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
          <Text className="text-white font-semibold text-[16px] mt-1">{category.name}</Text>
          <Text className="text-white/40 text-[12px] mt-1">Tax included</Text>
          
          {/* Mini Chart placeholder or actual */}
          <View className="h-16 w-full mt-lg flex-row items-end justify-between px-md">
            {[40, 60, 30, 80, 50, 70, 45, 60, 40].map((h, i) => (
              <View key={i} style={{ height: h + '%' }} className="w-1.5 rounded-full bg-white/20" />
            ))}
          </View>
        </View>

        <ScrollView className="flex-1 px-lg mt-md" showsVerticalScrollIndicator={false}>
          {expenses.filter(e => e.category === category.name).map((item) => (
            <View key={item.id} className="flex-row items-center py-[14px] border-b border-white/10">
              <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                <Ionicons name="receipt" size={20} color="white" />
              </View>

              <View className="flex-1 ml-3">
                <Text className="font-semibold text-white text-[15px]">{item.merchant}</Text>
                <Text className="text-[13px] text-white/60">{new Date(item.date).toLocaleDateString()}</Text>
              </View>

              <View className="items-end">
                <Text className="font-bold text-white text-[15px]">
                  -${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
          ))}
          <View className="h-20" />
        </ScrollView>
      </Animated.View>
    </>
  );
};
