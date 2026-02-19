import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Expense, NewExpense } from '../types/expense';
import { Alert } from 'react-native';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error: any) {
      Alert.alert('Error fetching expenses', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function addExpense(expense: NewExpense) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('expenses')
        .insert([{ ...expense, user_id: user.id }])
        .select();

      if (error) throw error;
      setExpenses([data[0], ...expenses]);
      return data[0];
    } catch (error: any) {
      Alert.alert('Error adding expense', error.message);
      return null;
    }
  }

  async function deleteExpense(id: string) {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (error: any) {
      Alert.alert('Error deleting expense', error.message);
    }
  }

  return { expenses, loading, fetchExpenses, addExpense, deleteExpense };
}
