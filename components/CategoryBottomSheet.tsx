import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { Transaction } from '../types/schema';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CategoryBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onTransactionPress: (transaction: Transaction) => void;
  category: {
    name: string;
    total: number;
    budget: number;
  } | null;
  expenses: Transaction[];
  currencySymbol?: string;
}

export const CategoryBottomSheet = ({ isVisible, onClose, onTransactionPress, category, expenses, currencySymbol = '$' }: CategoryBottomSheetProps) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const [localCategory, setLocalCategory] = useState(category);
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setLocalCategory(category);
      setShouldRender(true);
      translateY.value = withTiming(SCREEN_HEIGHT * 0.15, { duration: 300 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, (finished) => {
        if (finished) {
          runOnJS(setShouldRender)(false);
        }
      });
    }
  }, [isVisible, category, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [SCREEN_HEIGHT, SCREEN_HEIGHT * 0.15], [0, 0.5]),
  }));

  if (!shouldRender || !localCategory) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 900 }}>
      <Animated.View 
        style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'black' }, backdropStyle]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      <Animated.View 
        className="absolute bottom-0 left-0 right-0 bg-primary-dark rounded-t-[32px] overflow-hidden shadow-2xl"
        style={[{ height: SCREEN_HEIGHT * 0.85 }, animatedStyle]}
      >
        <View className="w-12 h-1 bg-white/20 rounded-full self-center mt-3 mb-6" />
        
        <View className="px-lg pb-lg">
          <View className="items-center mb-6">
            <View className="w-16 h-16 rounded-full bg-white/10 items-center justify-center mb-3">
              <Ionicons name="pricetag" size={32} color="white" />
            </View>
            <Text className="text-white font-bold text-[24px]">{localCategory.name}</Text>
          </View>

          <View className="bg-white/10 p-5 rounded-2xl mb-4">
            <View className="flex-row justify-between items-end mb-2">
              <Text className="text-white/80 text-[14px]">Total Spent</Text>
              <Text className="text-white font-bold text-[20px]">
                {currencySymbol}{localCategory.total.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </Text>
            </View>

            <View className="h-2 bg-black/20 rounded-full overflow-hidden mb-2">
               <View 
                 style={{ width: `${Math.min((localCategory.total / localCategory.budget) * 100, 100)}%` }} 
                 className={`h-full rounded-full ${
                   localCategory.total > localCategory.budget ? 'bg-red-400' : 
                   localCategory.total > localCategory.budget * 0.8 ? 'bg-orange-400' : 'bg-green-400'
                 }`} 
               />
            </View>

            <View className="flex-row justify-between">
              <Text className="text-white/60 text-[12px]">
                {Math.round((localCategory.total / localCategory.budget) * 100)}% of limit
              </Text>
              <Text className="text-white/80 text-[12px]">Limit: {currencySymbol}{localCategory.budget.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1 px-lg mt-md" showsVerticalScrollIndicator={false}>
          {expenses.filter(e => e.categories?.name === localCategory.name).map((item) => (
            <TouchableOpacity 
              key={item.id} 
              onPress={() => onTransactionPress(item)}
              activeOpacity={0.7}
              className="flex-row items-center py-[14px] border-b border-white/10"
            >
              <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                <Ionicons name={item.categories?.icon as any || "receipt"} size={20} color="white" />
              </View>

              <View className="flex-1 ml-3">
                <Text className="font-semibold text-white text-[15px]">{item.merchant_name || item.description}</Text>
                <Text className="text-[13px] text-white/60">{new Date(item.transaction_date).toLocaleDateString()}</Text>
              </View>

              <View className="items-end">
                <Text className="font-bold text-white text-[15px]">{item.type === 'CREDIT' ? '+' : '-'}{currencySymbol}{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View className="h-20" />
        </ScrollView>
      </Animated.View>
    </View>
  );
};
