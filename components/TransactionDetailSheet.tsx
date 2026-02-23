import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Account, Category, Transaction, TransactionUpdateInput } from '../types/schema';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TransactionDetailSheetProps {
  isVisible: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  currencySymbol?: string;
  categories?: Category[];
  accounts?: Account[];
  onUpdateTransaction?: (id: string, updates: TransactionUpdateInput) => Promise<Transaction | null>;
  onTransactionUpdated?: (transaction: Transaction) => void;
}

const toDateInput = (dateValue: string) => {
  const datePart = dateValue?.split('T')[0];
  if (datePart && /^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return datePart;
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const TransactionDetailSheet = ({
  isVisible,
  onClose,
  transaction,
  currencySymbol = '$',
  categories = [],
  accounts = [],
  onUpdateTransaction,
  onTransactionUpdated
}: TransactionDetailSheetProps) => {
  const insets = useSafeAreaInsets();
  const footerBottomInset = Math.max(insets.bottom, 12);
  const actionFooterHeight = 92;
  const bottomContentSpacing = actionFooterHeight + footerBottomInset + 20;
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const [localTransaction, setLocalTransaction] = useState<Transaction | null>(transaction);
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');
  const [editMerchantName, setEditMerchantName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editAccountId, setEditAccountId] = useState<string | null>(null);
  const [editSource, setEditSource] = useState<'SMS' | 'MANUAL' | 'API'>('MANUAL');

  const hydrateForm = (nextTransaction: Transaction | null) => {
    if (!nextTransaction) return;

    setEditAmount(nextTransaction.amount.toString());
    setEditType(nextTransaction.type);
    setEditMerchantName(nextTransaction.merchant_name || '');
    setEditDescription(nextTransaction.description || '');
    setEditDate(toDateInput(nextTransaction.transaction_date));
    setEditCategoryId(nextTransaction.category_id);
    setEditAccountId(nextTransaction.account_id);
    setEditSource(nextTransaction.source);
  };

  useEffect(() => {
    if (isVisible) {
      setLocalTransaction(transaction);
      hydrateForm(transaction);
      setShouldRender(true);
      setIsEditing(false);
      translateY.value = withTiming(SCREEN_HEIGHT * 0.15, { duration: 300 });
    } else {
      setIsEditing(false);
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, (finished) => {
        if (finished) {
          runOnJS(setShouldRender)(false);
        }
      });
    }
  }, [isVisible, transaction, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [SCREEN_HEIGHT, SCREEN_HEIGHT * 0.15], [0, 0.5]),
  }));

  const resolvedCategory = useMemo(() => {
    if (!localTransaction) {
      return null;
    }

    if (localTransaction.categories) {
      return localTransaction.categories;
    }

    if (!localTransaction.category_id) {
      return null;
    }

    return categories.find(c => c.id === localTransaction.category_id) || null;
  }, [categories, localTransaction]);

  const resolvedAccount = useMemo(() => {
    if (!localTransaction) {
      return null;
    }

    if (localTransaction.accounts) {
      return localTransaction.accounts;
    }

    if (!localTransaction.account_id) {
      return null;
    }

    return accounts.find(a => a.id === localTransaction.account_id) || null;
  }, [accounts, localTransaction]);

  if (!shouldRender || !localTransaction) return null;

  const isCredit = localTransaction.type === 'CREDIT';
  const categoryName = resolvedCategory?.name || 'Uncategorized';
  const accountName = resolvedAccount?.account_name || 'No Account';
  const iconName = resolvedCategory?.icon || 'pricetag';

  const handleClose = () => {
    if (!isEditing) {
      onClose();
      return;
    }

    Alert.alert(
      'Discard changes?',
      'You have unsaved edits for this transaction.',
      [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            hydrateForm(localTransaction);
            setIsEditing(false);
            onClose();
          }
        }
      ]
    );
  };

  const handleAmountInput = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const dotCount = cleaned.split('.').length - 1;
    if (dotCount > 1) return;

    const [, decimal = ''] = cleaned.split('.');
    if (decimal.length > 2) return;

    setEditAmount(cleaned);
  };

  const handleStartEdit = () => {
    hydrateForm(localTransaction);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    hydrateForm(localTransaction);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!localTransaction || !onUpdateTransaction || isSaving) return;

    const parsedAmount = Number.parseFloat(editAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(editDate)) {
      Alert.alert('Invalid date', 'Please use date format YYYY-MM-DD.');
      return;
    }

    const [year, month, day] = editDate.split('-').map(Number);
    const existingDate = new Date(localTransaction.transaction_date);
    const hasExistingTime = !Number.isNaN(existingDate.getTime());
    const editDateWithTime = new Date(Date.UTC(
      year,
      month - 1,
      day,
      hasExistingTime ? existingDate.getUTCHours() : 12,
      hasExistingTime ? existingDate.getUTCMinutes() : 0,
      hasExistingTime ? existingDate.getUTCSeconds() : 0,
      hasExistingTime ? existingDate.getUTCMilliseconds() : 0
    ));

    if (
      Number.isNaN(editDateWithTime.getTime()) ||
      editDateWithTime.getUTCFullYear() !== year ||
      editDateWithTime.getUTCMonth() !== month - 1 ||
      editDateWithTime.getUTCDate() !== day
    ) {
      Alert.alert('Invalid date', 'Please enter a valid transaction date.');
      return;
    }

    const updates: TransactionUpdateInput = {
      amount: parsedAmount,
      type: editType,
      merchant_name: editMerchantName.trim() || null,
      description: editDescription.trim() || null,
      transaction_date: editDateWithTime.toISOString(),
      category_id: editCategoryId,
      account_id: editAccountId,
      source: editSource
    };

    setIsSaving(true);
    const updatedTransaction = await onUpdateTransaction(localTransaction.id, updates);
    setIsSaving(false);

    if (!updatedTransaction) return;

    setLocalTransaction(updatedTransaction);
    hydrateForm(updatedTransaction);
    setIsEditing(false);
    onTransactionUpdated?.(updatedTransaction);
  };

  return (
    <Modal
      visible={shouldRender}
      transparent
      animationType="none"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={handleClose}
    >
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100000, elevation: 100000 }}>
        <Animated.View
          style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'black' }, backdropStyle]}
        >
          <Pressable style={{ flex: 1 }} onPress={handleClose} />
        </Animated.View>

        <Animated.View
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] overflow-hidden shadow-2xl"
          style={[{ height: SCREEN_HEIGHT * 0.85, zIndex: 100001, elevation: 100001 }, animatedStyle]}
        >
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mt-3 mb-6" />

          <View className="px-lg pb-2 flex-row justify-end">
            {!isEditing ? (
              <TouchableOpacity
                className="bg-primary/10 px-4 py-2 rounded-lg"
                onPress={handleStartEdit}
                activeOpacity={0.8}
              >
                <Text className="text-primary font-semibold">Edit</Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="bg-bg-light px-4 py-2 rounded-lg"
                  onPress={handleCancelEdit}
                  activeOpacity={0.8}
                  disabled={isSaving}
                >
                  <Text className="text-text-dark font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`px-4 py-2 rounded-lg ${isSaving ? 'bg-primary/40' : 'bg-primary'}`}
                  onPress={handleSaveEdit}
                  activeOpacity={0.8}
                  disabled={isSaving || !onUpdateTransaction}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-semibold">Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <ScrollView
            className="flex-1 px-lg"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: bottomContentSpacing }}
          >
          {!isEditing ? (
            <>
              <View className="items-center mb-6">
                <View className="w-20 h-20 rounded-full bg-bg-light items-center justify-center mb-4 border border-gray-100">
                  <Ionicons name={iconName as any} size={40} color="#5B2EFF" />
                </View>
                <Text className="text-text-dark font-bold text-[24px] text-center">
                  {localTransaction.merchant_name || localTransaction.description || 'Unknown'}
                </Text>
                <Text className="text-text-grey text-[14px] mt-1">
                  {new Date(localTransaction.transaction_date).toLocaleDateString()}
                </Text>
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
                    <Ionicons name="pricetag-outline" size={16} color="#5B2EFF" />
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
            </>
          ) : (
            <View className="mb-8">
              <Text className="text-text-dark font-bold text-[24px] mb-1">Edit Transaction</Text>
              <Text className="text-text-grey text-[13px] mb-6">Update any transaction details below.</Text>

              <View className="mb-4">
                <Text className="text-text-grey font-medium mb-2">Amount</Text>
                <TextInput
                  value={editAmount}
                  onChangeText={handleAmountInput}
                  keyboardType="decimal-pad"
                  className="bg-bg-light rounded-xl px-4 py-3 text-text-dark font-bold text-[18px]"
                  placeholder="0.00"
                />
              </View>

              <View className="mb-4">
                <Text className="text-text-grey font-medium mb-2">Type</Text>
                <View className="flex-row bg-bg-light rounded-xl p-1">
                  <TouchableOpacity
                    className={`flex-1 py-2 rounded-lg ${editType === 'DEBIT' ? 'bg-white' : ''}`}
                    onPress={() => setEditType('DEBIT')}
                    activeOpacity={0.8}
                  >
                    <Text className={`text-center font-semibold ${editType === 'DEBIT' ? 'text-primary' : 'text-text-grey'}`}>Expense</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 py-2 rounded-lg ${editType === 'CREDIT' ? 'bg-white' : ''}`}
                    onPress={() => setEditType('CREDIT')}
                    activeOpacity={0.8}
                  >
                    <Text className={`text-center font-semibold ${editType === 'CREDIT' ? 'text-primary' : 'text-text-grey'}`}>Income</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-text-grey font-medium mb-2">Title / Merchant</Text>
                <TextInput
                  value={editMerchantName}
                  onChangeText={setEditMerchantName}
                  className="bg-bg-light rounded-xl px-4 py-3 text-text-dark"
                  placeholder="Merchant name"
                />
              </View>

              <View className="mb-4">
                <Text className="text-text-grey font-medium mb-2">Date</Text>
                <TextInput
                  value={editDate}
                  onChangeText={setEditDate}
                  className="bg-bg-light rounded-xl px-4 py-3 text-text-dark"
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View className="mb-4">
                <Text className="text-text-grey font-medium mb-2">Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    onPress={() => setEditCategoryId(null)}
                    className={`mr-2 px-4 py-2 rounded-xl ${editCategoryId === null ? 'bg-primary' : 'bg-bg-light'}`}
                    activeOpacity={0.8}
                  >
                    <Text className={`font-semibold ${editCategoryId === null ? 'text-white' : 'text-text-dark'}`}>None</Text>
                  </TouchableOpacity>
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setEditCategoryId(cat.id)}
                      className={`mr-2 px-4 py-2 rounded-xl ${editCategoryId === cat.id ? 'bg-primary' : 'bg-bg-light'}`}
                      activeOpacity={0.8}
                    >
                      <Text className={`font-semibold capitalize ${editCategoryId === cat.id ? 'text-white' : 'text-text-dark'}`}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="mb-4">
                <Text className="text-text-grey font-medium mb-2">Account</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    onPress={() => setEditAccountId(null)}
                    className={`mr-2 px-4 py-2 rounded-xl ${editAccountId === null ? 'bg-primary' : 'bg-bg-light'}`}
                    activeOpacity={0.8}
                  >
                    <Text className={`font-semibold ${editAccountId === null ? 'text-white' : 'text-text-dark'}`}>No Account</Text>
                  </TouchableOpacity>
                  {accounts.map(acc => (
                    <TouchableOpacity
                      key={acc.id}
                      onPress={() => setEditAccountId(acc.id)}
                      className={`mr-2 px-4 py-2 rounded-xl ${editAccountId === acc.id ? 'bg-primary' : 'bg-bg-light'}`}
                      activeOpacity={0.8}
                    >
                      <Text className={`font-semibold ${editAccountId === acc.id ? 'text-white' : 'text-text-dark'}`}>
                        {acc.account_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="mb-2">
                <Text className="text-text-grey font-medium mb-2">Source</Text>
                <View className="flex-row bg-bg-light rounded-xl p-1 mb-4">
                  {(['MANUAL', 'SMS', 'API'] as const).map(source => (
                    <TouchableOpacity
                      key={source}
                      className={`flex-1 py-2 rounded-lg ${editSource === source ? 'bg-white' : ''}`}
                      onPress={() => setEditSource(source)}
                      activeOpacity={0.8}
                    >
                      <Text className={`text-center font-semibold ${editSource === source ? 'text-primary' : 'text-text-grey'}`}>
                        {source}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text className="text-text-grey font-medium mb-2">Notes</Text>
                <TextInput
                  value={editDescription}
                  onChangeText={setEditDescription}
                  multiline
                  textAlignVertical="top"
                  className="bg-bg-light rounded-xl px-4 py-3 text-text-dark"
                  style={{ minHeight: 100 }}
                  placeholder="Optional notes"
                />
              </View>
            </View>
          )}

          </ScrollView>

          <View
            className="absolute left-0 right-0 bottom-0 bg-white border-t border-gray-100 px-lg pt-3"
            style={{ paddingBottom: footerBottomInset, zIndex: 100002, elevation: 100002 }}
          >
            <View className="flex-row gap-4">
              {!isEditing ? (
                <>
                  <TouchableOpacity
                    className="flex-1 bg-bg-light py-4 rounded-xl items-center"
                    onPress={handleStartEdit}
                    activeOpacity={0.8}
                  >
                    <Text className="text-text-dark font-bold">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-primary/10 py-4 rounded-xl items-center"
                    onPress={handleClose}
                    activeOpacity={0.8}
                  >
                    <Text className="text-primary font-bold">Close</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    className="flex-1 bg-bg-light py-4 rounded-xl items-center"
                    onPress={handleCancelEdit}
                    activeOpacity={0.8}
                    disabled={isSaving}
                  >
                    <Text className="text-text-dark font-bold">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 py-4 rounded-xl items-center ${isSaving ? 'bg-primary/40' : 'bg-primary'}`}
                    onPress={handleSaveEdit}
                    activeOpacity={0.8}
                    disabled={isSaving || !onUpdateTransaction}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text className="text-white font-bold">Save Changes</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
