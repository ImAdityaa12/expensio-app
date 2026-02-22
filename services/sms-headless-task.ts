import { AppRegistry } from 'react-native';
import { supabase } from '../lib/supabase';
import { parseSmsWithGemini } from './gemini-sms-parser';

// Headless task for processing SMS in the background (Android only)
// This runs even when the app is completely closed
const SmsHeadlessTask = async (message: any) => {
  try {
    console.log('📱 Headless SMS task triggered');
    console.log('📱 Message:', message);

    if (!message || !message.body) {
      console.log('📱 Invalid message format');
      return;
    }

    const { body, originatingAddress, timestamp } = message;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('📱 No user logged in, skipping');
      return;
    }

    // Check for duplicate SMS
    const fiveMinutesAgo = new Date(timestamp - 5 * 60 * 1000).toISOString();
    const { data: existingSms } = await supabase
      .from('sms_logs')
      .select('id')
      .eq('user_id', user.id)
      .eq('sender', originatingAddress)
      .eq('message', body)
      .gte('received_at', fiveMinutesAgo)
      .limit(1);

    if (existingSms && existingSms.length > 0) {
      console.log('📱 Duplicate SMS detected, skipping');
      return;
    }

    // Parse SMS with Gemini AI
    console.log('📱 Parsing SMS with Gemini AI...');
    const parsed = await parseSmsWithGemini(body);

    if (!parsed || !parsed.isTransaction) {
      console.log('📱 Not a transaction SMS');
      
      // Log non-transaction SMS
      await supabase
        .from('sms_logs')
        .insert({
          user_id: user.id,
          sender: originatingAddress,
          message: body,
          received_at: new Date(timestamp).toISOString(),
          parsed: false,
          confidence_score: 0,
        });
      
      return;
    }

    console.log('📱 Transaction detected:', parsed);

    // Save SMS log
    const { data: smsLog, error: smsLogError } = await supabase
      .from('sms_logs')
      .insert({
        user_id: user.id,
        sender: originatingAddress,
        message: body,
        received_at: new Date(timestamp).toISOString(),
        parsed: true,
        confidence_score: 0.95,
      })
      .select()
      .single();

    if (smsLogError || !smsLog) {
      console.log('📱 Failed to save SMS log:', smsLogError);
      return;
    }

    // Get category ID
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

    // Default to "Others" if no category
    if (!categoryId) {
      const { data: defaultCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'Others')
        .limit(1)
        .single();
      
      categoryId = defaultCategory?.id;
    }

    // Check for duplicate transaction
    const { data: existingTransaction } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('amount', parsed.amount)
      .eq('merchant_name', parsed.merchant)
      .eq('transaction_date', parsed.date)
      .limit(1);

    if (existingTransaction && existingTransaction.length > 0) {
      console.log('📱 Duplicate transaction detected, skipping');
      return;
    }

    // Create transaction
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: parsed.amount,
        type: parsed.transactionType,
        merchant_name: parsed.merchant,
        description: `Auto-synced from ${originatingAddress}`,
        transaction_date: parsed.date,
        source: 'SMS',
        sms_id: smsLog.id,
        category_id: categoryId,
      });

    if (error) {
      console.error('📱 Error creating transaction:', error);
      return;
    }

    console.log('📱 ✅ Transaction created successfully in background!');
  } catch (error) {
    console.error('📱 Headless task error:', error);
  }
};

// Register the headless task
export function registerSmsHeadlessTask() {
  AppRegistry.registerHeadlessTask('SmsReceived', () => SmsHeadlessTask);
  console.log('📱 SMS headless task registered');
}
