import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction, Category, Account, TransactionUpdateInput } from '../types/schema';
import { Alert } from 'react-native';

export function useExpenses() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
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

      const [transactionsResult, categoriesResult, accountsResult, profileResult] = await Promise.all([
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
        supabase.from('profiles').select('currency').eq('id', user.id).single()
      ]);

      if (transactionsResult.error) throw transactionsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      if (accountsResult.error) throw accountsResult.error;

      setTransactions(transactionsResult.data as unknown as Transaction[]); 
      setCategories(categoriesResult.data as Category[]);
      setAccounts(accountsResult.data as Account[]);
      
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
      
      setTransactions(prev => [data as unknown as Transaction, ...prev]);
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

      setTransactions(prev =>
        prev.map(t => (t.id === id ? (data as unknown as Transaction) : t))
      );

      return data as unknown as Transaction;
    } catch (error: any) {
      Alert.alert('Error updating transaction', error.message);
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
    currencySymbol,
    loading, 
    fetchData, 
    addTransaction, 
    updateTransaction,
    deleteTransaction, 
    addExpense: addTransaction, 
    updateExpense: updateTransaction,
    deleteExpense: deleteTransaction, 
    totalBalance
  };
}
