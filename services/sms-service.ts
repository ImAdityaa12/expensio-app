import { PermissionsAndroid, Platform } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';
import { parseSms } from './sms-parser';
import { supabase } from '../lib/supabase';
import { NewExpense } from '../types/expense';

export async function requestSmsPermission() {
  if (Platform.OS !== 'android') return false;
  
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'Sms Permission',
        message: 'Expensio needs access to your SMS to automatically track expenses.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
}

export async function syncSmsExpenses() {
  if (Platform.OS !== 'android') return;

  const hasPermission = await requestSmsPermission();
  if (!hasPermission) return;

  const filter = {
    box: 'inbox',
    // Only look at last 24 hours to avoid massive duplicates
    minDate: Date.now() - 24 * 60 * 60 * 1000, 
  };

  return new Promise((resolve, reject) => {
    SmsAndroid.list(
      JSON.stringify(filter),
      (fail: string) => {
        console.log('Failed with error: ' + fail);
        reject(fail);
      },
      async (count: number, smsList: string) => {
        const messages = JSON.parse(smsList);
        const expensesToAdd: NewExpense[] = [];

        for (const msg of messages) {
          const parsed = parseSms(msg.body);
          if (parsed) {
            expensesToAdd.push({
              ...parsed,
              source: 'sms',
              note: `Auto-detected from SMS: ${msg.address}`,
              category: 'Others', // Default category for auto-detected
            });
          }
        }

        if (expensesToAdd.length > 0) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase
              .from('expenses')
              .insert(expensesToAdd.map(e => ({ ...e, user_id: user.id })));
            
            if (error) console.error('Error saving SMS expenses:', error);
          }
        }
        resolve(expensesToAdd.length);
      },
    );
  });
}
