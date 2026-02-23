import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction, Category, Account, TransactionUpdateInput, CategoryLimit } from '../types/schema';
import { Alert } from 'react-native';
import { sendLocalNotification } from '../services/notification-service';

export function useExpenses() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categoryLimits, setCategoryLimits] = useState<CategoryLimit[]>([]);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [loading, setLoading] = useState(true);

  const getCurrencySymbol = (code: string) => {
    switch (code?.toUpperCase()) {
      case 'INR': return '₹';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      default: return '$';
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [transactionsResult, categoriesResult, accountsResult, profileResult, limitsResult] = await Promise.all([
        supabase
          .from('transactions')
          .select(`
            *,
            categories (id, name, icon, color),
            accounts (id, bank_name, account_name)
          `)
          .order('transaction_date', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('accounts').select('*').order('account_name'),
        supabase.from('profiles').select('currency').eq('id', user.id).single(),
        supabase.from('category_limits').select('*')
      ]);

      if (transactionsResult.error) throw transactionsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      if (accountsResult.error) throw accountsResult.error;
      if (limitsResult.error) throw limitsResult.error;

      setTransactions(transactionsResult.data as unknown as Transaction[]); 
      setCategories(categoriesResult.data as Category[]);
      setAccounts(accountsResult.data as Account[]);
      setCategoryLimits(limitsResult.data as CategoryLimit[]);
      
      if (profileResult.data) {
        setCurrencySymbol(getCurrencySymbol(profileResult.data.currency));
      }
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const checkCategoryLimit = useCallback(async (categoryId: string, amount: number) => {
    try {
      const limit = categoryLimits.find(l => l.category_id === categoryId);
      if (!limit) return;

      const category = categories.find(c => c.id === categoryId);
      const categoryName = category?.name || 'this category';

      // Calculate current total for the period
      let startDate = new Date();
      if (limit.period_type === 'DAILY') {
        startDate.setHours(0, 0, 0, 0);
      } else if (limit.period_type === 'WEEKLY') {
        startDate.setDate(startDate.getDate() - startDate.getDay());
        startDate.setHours(0, 0, 0, 0);
      } else if (limit.period_type === 'MONTHLY') {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
      }

      const currentTotal = transactions
        .filter(t => t.category_id === categoryId && 
                    t.type === 'DEBIT' && 
                    new Date(t.transaction_date) >= startDate)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const newTotal = currentTotal + amount;

      if (newTotal > limit.limit_amount) {
        const title = 'Limit Reached!';
        const body = `You have exceeded your ${limit.period_type.toLowerCase()} limit for ${categoryName}. Current total: ${currencySymbol}${newTotal.toFixed(2)} (Limit: ${currencySymbol}${limit.limit_amount.toFixed(2)})`;
        
        // Show local notification (works in foreground and background)
        sendLocalNotification(title, body);
        
        // Also show alert if in foreground
        Alert.alert(title, body, [{ text: 'OK' }]);
      } else if (newTotal > limit.limit_amount * 0.9) {
        // Warning at 90%
        const title = 'Budget Warning';
        const body = `You have reached 90% of your ${limit.period_type.toLowerCase()} limit for ${categoryName}. Current total: ${currencySymbol}${newTotal.toFixed(2)} (Limit: ${currencySymbol}${limit.limit_amount.toFixed(2)})`;
        sendLocalNotification(title, body);
      }
    } catch (error) {
      console.error('Error checking category limit:', error);
    }
  }, [categoryLimits, transactions, categories, currencySymbol]);

  async function addTransaction(transaction: Partial<Transaction>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('transactions')
        .insert([{ 
          ...transaction, 
          user_id: user.id,
          source: transaction.source || 'MANUAL'
        }])
        .select(`
          *,
          categories (id, name, icon, color),
          accounts (id, bank_name, account_name)
        `)
        .single();

      if (error) throw error;
      
      const newTransaction = data as unknown as Transaction;
      setTransactions(prev => [newTransaction, ...prev]);

      // Check limit after adding transaction
      if (newTransaction.category_id && newTransaction.type === 'DEBIT') {
        checkCategoryLimit(newTransaction.category_id, Number(newTransaction.amount));
      }

      return data;
    } catch (error: any) {
      Alert.alert('Error adding transaction', error.message);
      return null;
    }
  }

  async function deleteTransaction(id: string) {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error: any) {
      Alert.alert('Error deleting transaction', error.message);
    }
  }

  async function updateTransaction(id: string, updates: TransactionUpdateInput) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          categories (id, name, icon, color),
          accounts (id, bank_name, account_name)
        `)
        .single();

      if (error) throw error;

      const updatedTransaction = data as unknown as Transaction;
      setTransactions(prev =>
        prev.map(t => (t.id === id ? updatedTransaction : t))
      );

      // Check limit after updating transaction
      if (updatedTransaction.category_id && updatedTransaction.type === 'DEBIT') {
        // We might want to re-calculate everything, but for simplicity let's just check
        checkCategoryLimit(updatedTransaction.category_id, 0); 
      }

      return updatedTransaction;
    } catch (error: any) {
      Alert.alert('Error updating transaction', error.message);
      return null;
    }
  }

  async function setCategoryLimit(categoryId: string, limitAmount: number, periodType: PeriodType = 'MONTHLY') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('category_limits')
        .upsert({
          user_id: user.id,
          category_id: categoryId,
          limit_amount: limitAmount,
          period_type: periodType,
          start_date: new Date().toISOString().split('T')[0]
        }, {
          onConflict: 'user_id,category_id'
        })
        .select()
        .single();

      if (error) throw error;

      const newLimit = data as CategoryLimit;
      setCategoryLimits(prev => {
        const index = prev.findIndex(l => l.category_id === categoryId);
        if (index >= 0) {
          return prev.map((l, i) => i === index ? newLimit : l);
        }
        return [...prev, newLimit];
      });

      return data;
    } catch (error: any) {
      console.error('Error setting limit:', error);
      Alert.alert('Error setting limit', error.message);
      return null;
    }
  }

  // Helper to get total balance (sum of accounts)
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  return { 
    expenses: transactions, 
    transactions,
    categories,
    accounts,
    categoryLimits,
    currencySymbol,
    loading, 
    fetchData, 
    addTransaction, 
    updateTransaction,
    deleteTransaction, 
    addExpense: addTransaction, 
    updateExpense: updateTransaction,
    deleteExpense: deleteTransaction, 
    totalBalance,
    setCategoryLimit
  };
}
