import { PermissionsAndroid, Platform } from 'react-native';
import SmsListener from 'react-native-android-sms-listener';
import { supabase } from '../lib/supabase';
import { parseSmsWithGemini } from './gemini-sms-parser';

let smsSubscription: any = null;

async function getCategoryForMerchant(userId: string, merchantName: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('merchant_category_map')
      .select('category_id')
      .eq('user_id', userId)
      .ilike('merchant_keyword', `%${merchantName}%`)
      .limit(1)
      .single();
    
    return data?.category_id || null;
  } catch {
    return null;
  }
}

async function getDefaultCategory(userId: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .eq('name', 'Others')
      .limit(1)
      .single();
    
    return data?.id || null;
  } catch {
    return null;
  }
}

async function processSmsMessage(message: string, sender: string, timestamp: number) {
  try {
    console.log('📨 Processing new SMS...');
    console.log('📨 From:', sender);
    console.log('📨 Message:', message.substring(0, 100));
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('📨 No user logged in, skipping');
      return;
    }

    // Parse SMS with Gemini AI
    console.log('📨 Parsing SMS with Gemini AI...');
    const parsed = await parseSmsWithGemini(message);
    
    if (!parsed || !parsed.isTransaction) {
      console.log('📨 Not a transaction SMS, skipping');
      return;
    }

    console.log('📨 ✅ Gemini parsed:', {
      amount: parsed.amount,
      merchant: parsed.merchant,
      type: parsed.transactionType,
      category: parsed.category,
      date: parsed.date
    });

    // Save SMS log
    const { data: smsLog } = await supabase
      .from('sms_logs')
      .insert({
        user_id: user.id,
        sender: sender,
        message: message,
        received_at: new Date(timestamp).toISOString(),
        parsed: true,
        confidence_score: 0.95, // Gemini AI confidence
      })
      .select()
      .single();

    if (!smsLog) {
      console.log('📨 Failed to save SMS log');
      return;
    }

    // Get category ID from suggested category name
    let categoryId = null;
    if (parsed.category) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .ilike('name', parsed.category)
        .limit(1)
        .single();
      
      categoryId = categoryData?.id;
    }

    // If no category found, try merchant mapping
    if (!categoryId) {
      categoryId = await getCategoryForMerchant(user.id, parsed.merchant);
    }

    // Default to "Others" if still no category
    if (!categoryId) {
      categoryId = await getDefaultCategory(user.id);
    }

    // Create transaction
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: parsed.amount,
        type: parsed.transactionType,
        merchant_name: parsed.merchant,
        description: `Auto-synced from ${sender}`,
        transaction_date: parsed.date,
        source: 'SMS',
        sms_id: smsLog.id,
        category_id: categoryId,
      });

    if (error) {
      console.error('📨 Error creating transaction:', error);
      return;
    }

    console.log('📨 ✅✅✅ Transaction created successfully!');
    console.log('📨 Amount:', parsed.amount);
    console.log('📨 Merchant:', parsed.merchant);
    console.log('📨 Type:', parsed.transactionType);
    console.log('📨 Category:', parsed.category);
    
  } catch (error) {
    console.error('📨 Error processing SMS:', error);
  }
}

export async function startSmsListener() {
  if (Platform.OS !== 'android') {
    console.log('📨 SMS listener only available on Android');
    return false;
  }

  try {
    // Check if the native module is available (won't be in Expo Go)
    console.log('📨 Checking if SmsListener module is available...');
    console.log('📨 SmsListener exists:', !!SmsListener);
    console.log('📨 SmsListener.addListener exists:', !!(SmsListener && SmsListener.addListener));
    
    if (!SmsListener || typeof SmsListener.addListener !== 'function') {
      console.log('📨 ❌❌❌ CRITICAL: SMS Listener native module not found!');
      console.log('📨 You are likely running in Expo Go.');
      console.log('📨 SMS listening requires a development build.');
      console.log('📨 ');
      console.log('📨 TO FIX THIS:');
      console.log('📨 1. Stop the current app');
      console.log('📨 2. Run: npx expo prebuild --clean');
      console.log('📨 3. Run: npx expo run:android');
      console.log('📨 ');
      console.log('📨 This will create a development build with native modules.');
      return false;
    }

    // Check permission with timeout
    console.log('📨 Checking RECEIVE_SMS permission...');
    const hasPermission = await Promise.race([
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS),
      new Promise<boolean>((resolve) => setTimeout(() => {
        console.log('📨 ⚠️ Permission check timed out (likely Expo Go)');
        resolve(false);
      }, 3000))
    ]);

    console.log('📨 Permission check result:', hasPermission);

    if (!hasPermission) {
      console.log('📨 Requesting RECEIVE_SMS permission with 5 second timeout...');
      
      const granted = await Promise.race([
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
          {
            title: 'SMS Receive Permission',
            message: 'Expensio needs permission to receive SMS for real-time expense tracking.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        ),
        new Promise<string>((resolve) => setTimeout(() => {
          console.log('📨 ⚠️⚠️⚠️ Permission request timed out!');
          console.log('📨 This means you are running in EXPO GO.');
          console.log('📨 Expo Go cannot handle native SMS permissions.');
          resolve('timeout');
        }, 5000))
      ]);

      if (granted === 'timeout' || granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('📨 ❌ RECEIVE_SMS permission denied or timed out');
        console.log('📨 ');
        console.log('📨 🔴🔴🔴 YOU MUST BUILD A DEVELOPMENT BUILD 🔴🔴🔴');
        console.log('📨 ');
        console.log('📨 Run these commands in your terminal:');
        console.log('📨 1. npx expo prebuild --clean');
        console.log('📨 2. npx expo run:android');
        console.log('📨 ');
        console.log('📨 After building, the SMS listener will work automatically.');
        return false;
      }
    }

    console.log('📨 Starting SMS listener...');
    
    // Start listening for SMS
    smsSubscription = SmsListener.addListener((message: any) => {
      console.log('📨 📩📩📩 NEW SMS RECEIVED! 📩📩📩');
      console.log('📨 From:', message.originatingAddress);
      console.log('📨 Body:', message.body);
      
      processSmsMessage(
        message.body,
        message.originatingAddress,
        message.timestamp || Date.now()
      );
    });

    console.log('📨 ✅✅✅ SMS listener started successfully!');
    console.log('📨 Waiting for incoming SMS...');
    return true;
  } catch (error) {
    console.error('📨 ❌❌❌ Error starting SMS listener:', error);
    console.log('📨 Error details:', JSON.stringify(error, null, 2));
    
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('null is not an object') || errorMessage.includes('undefined')) {
        console.log('📨 ');
        console.log('📨 ⚠️  EXPO GO DETECTED ⚠️');
        console.log('📨 Native modules are not available in Expo Go.');
        console.log('📨 You must create a development build to use SMS listening.');
        console.log('📨 ');
        console.log('📨 Run these commands:');
        console.log('📨 1. npx expo prebuild --clean');
        console.log('📨 2. npx expo run:android');
      }
    }
    
    return false;
  }
}

export function stopSmsListener() {
  if (smsSubscription) {
    try {
      smsSubscription.remove();
      smsSubscription = null;
      console.log('📨 SMS listener stopped');
    } catch (error) {
      console.error('📨 Error stopping SMS listener:', error);
    }
  }
}
