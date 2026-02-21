import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Pressable, ScrollView } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types/schema';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TransactionDetailSheetProps {
  isVisible: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  currencySymbol?: string;
}

export const TransactionDetailSheet = ({ isVisible, onClose, transaction, currencySymbol = '$' }: TransactionDetailSheetProps) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const [localTransaction, setLocalTransaction] = useState<Transaction | null>(transaction);
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setLocalTransaction(transaction);
      setShouldRender(true);
      translateY.value = withTiming(SCREEN_HEIGHT * 0.15, { duration: 300 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, (finished) => {
        if (finished) {
          runOnJS(setShouldRender)(false);
        }
      });
    }
  }, [isVisible, transaction]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [SCREEN_HEIGHT, SCREEN_HEIGHT * 0.15], [0, 0.5]),
  }));

  if (!shouldRender || !localTransaction) return null;

  const isCredit = localTransaction.type === 'CREDIT';
  const categoryName = localTransaction.categories?.name || 'Uncategorized';
  const accountName = localTransaction.accounts?.account_name || 'Unknown Account';
  const iconName = localTransaction.categories?.icon || 'pricetag';

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
      <Animated.View 
        style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'black' }, backdropStyle]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      <Animated.View 
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] overflow-hidden shadow-2xl"
        style={[{ height: SCREEN_HEIGHT * 0.85 }, animatedStyle]}
      >
        <View className="w-12 h-1 bg-gray-300 rounded-full self-center mt-3 mb-6" />
        
        <ScrollView className="flex-1 px-lg" showsVerticalScrollIndicator={false}>
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-bg-light items-center justify-center mb-4 border border-gray-100">
              <Ionicons name={iconName as any} size={40} color="#5B2EFF" />
            </View>
            <Text className="text-text-dark font-bold text-[24px] text-center">{localTransaction.merchant_name || localTransaction.description || 'Unknown'}</Text>
            <Text className="text-text-grey text-[14px] mt-1">{new Date(localTransaction.transaction_date).toLocaleDateString()}</Text>
          </View>

          <View className="items-center mb-8">
            <Text className={`font-bold text-[36px] ${isCredit ? 'text-success' : 'text-text-dark'}`}>
              {isCredit ? '+' : '-'}{currencySymbol}{localTransaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
            <Text className="text-text-grey text-[12px] uppercase tracking-widest mt-1">{localTransaction.type}</Text>
          </View>

          <View className="bg-bg-light rounded-[24px] p-5 mb-6">
            <View className="flex-row justify-between mb-4 border-b border-gray-200 pb-4">
              <Text className="text-text-grey font-medium">Category</Text>
              <View className="flex-row items-center">
                 <Ionicons name="pricetag-outline" size={16} color="#5B2EFF" className="mr-1" />
                 <Text className="text-text-dark font-bold ml-2 capitalize">{categoryName}</Text>
              </View>
            </View>
            
            <View className="flex-row justify-between mb-4 border-b border-gray-200 pb-4">
              <Text className="text-text-grey font-medium">Payment Method</Text>
              <Text className="text-text-dark font-bold capitalize">{accountName}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-text-grey font-medium">Status</Text>
              <View className="bg-success/10 px-2 py-1 rounded-lg">
                <Text className="text-success font-bold text-[12px]">Completed</Text>
              </View>
            </View>
          </View>

          {localTransaction.description && (
            <View className="mb-8">
              <Text className="text-text-dark font-bold text-[16px] mb-2">Notes</Text>
              <Text className="text-text-grey leading-5">{localTransaction.description}</Text>
            </View>
          )}

          <View className="flex-row gap-4 mb-10">
            <TouchableOpacity className="flex-1 bg-bg-light py-4 rounded-xl items-center">
              <Text className="text-text-dark font-bold">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-primary/10 py-4 rounded-xl items-center">
              <Text className="text-primary font-bold">Share Receipt</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};
