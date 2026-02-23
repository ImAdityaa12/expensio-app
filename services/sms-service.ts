import { PermissionsAndroid, Platform } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';
import { parseSms } from './sms-parser';
import { supabase } from '../lib/supabase';
import { sendLocalNotification } from './notification-service';

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

async function checkAndNotifyCategoryLimit(userId: string, categoryId: string) {
  try {
    const { data: limit } = await supabase
      .from('category_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .single();

    if (!limit) return;

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

    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .eq('type', 'DEBIT')
      .gte('transaction_date', startDate.toISOString());

    const currentTotal = (transactions || []).reduce((sum, t) => sum + Number(t.amount), 0);
    
    if (currentTotal > limit.limit_amount) {
      const { data: category } = await supabase
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single();
      
      const categoryName = category?.name || 'a category';
      await sendLocalNotification(
        'Limit Reached! 🚨',
        `Your ${limit.period_type.toLowerCase()} limit for ${categoryName} has been exceeded. Total: ${currentTotal.toFixed(2)}`
      );
    }
  } catch (error) {
    console.error('Error checking category limit:', error);
  }
}

export async function syncSmsExpenses() {
  if (Platform.OS !== 'android') return;

  const hasPermission = await requestSmsPermission();
  if (!hasPermission) return;

  const filter = {
    box: 'inbox',
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
        let syncCount = 0;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          resolve(0);
          return;
        }

        // Get default category
        const { data: defaultCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', 'Others')
          .single();

        for (const msg of messages) {
          const parsed = parseSms(msg.body);
          if (parsed) {
            // Check if already exists
            const { data: existing } = await supabase
              .from('transactions')
              .select('id')
              .eq('user_id', user.id)
              .eq('amount', parsed.amount)
              .eq('transaction_date', parsed.date)
              .limit(1);

            if (existing && existing.length > 0) continue;

            const { data: newTx, error } = await supabase
              .from('transactions')
              .insert([{
                user_id: user.id,
                amount: parsed.amount,
                type: 'DEBIT',
                merchant_name: parsed.merchant,
                transaction_date: parsed.date,
                source: 'SMS',
                category_id: defaultCategory?.id,
                description: `Synced from SMS: ${msg.address}`
              }])
              .select()
              .single();
            
            if (!error && newTx) {
              syncCount++;
              if (newTx.category_id) {
                await checkAndNotifyCategoryLimit(user.id, newTx.category_id);
              }
            }
          }
        }
        resolve(syncCount);
      },
    );
  });
}
