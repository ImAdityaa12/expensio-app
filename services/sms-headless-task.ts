import { AppRegistry } from 'react-native';
import { supabase } from '../lib/supabase';
import { parseSmsWithGemini } from './gemini-sms-parser';

// Helper function for category matching
async function findBestCategoryMatch(userId: string, suggestedCategory: string): Promise<string | null> {
  try {
    // First, try exact match (case-insensitive)
    const { data: exactMatch } = await supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', userId)
      .ilike('name', suggestedCategory)
      .limit(1)
      .single();
    
    if (exactMatch) {
      console.log('📱 ✅ Exact category match found:', exactMatch.name);
      return exactMatch.id;
    }

    // If no exact match, try fuzzy matching with common variations
    const categoryMappings: { [key: string]: string[] } = {
      'food': ['food', 'restaurant', 'dining', 'cafe', 'eatery', 'meal', 'grocery', 'groceries'],
      'transport': ['transport', 'transportation', 'travel', 'taxi', 'uber', 'ola', 'fuel', 'petrol', 'gas'],
      'shopping': ['shopping', 'shop', 'store', 'retail', 'purchase', 'buy'],
      'bills': ['bills', 'bill', 'utility', 'utilities', 'electricity', 'water', 'internet', 'phone', 'mobile'],
      'entertainment': ['entertainment', 'movie', 'cinema', 'game', 'gaming', 'music', 'streaming'],
      'healthcare': ['healthcare', 'health', 'medical', 'hospital', 'doctor', 'pharmacy', 'medicine'],
      'travel': ['travel', 'trip', 'vacation', 'hotel', 'flight', 'booking', 'airline'],
      'others': ['others', 'other', 'miscellaneous', 'misc', 'general']
    };

    // Get all user categories
    const { data: allCategories } = await supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', userId);

    if (!allCategories || allCategories.length === 0) {
      return null;
    }

    console.log('📱 Available categories:', allCategories.map(c => c.name).join(', '));

    // Try to find a match using the mappings
    const lowerSuggested = suggestedCategory.toLowerCase().trim();
    
    for (const category of allCategories) {
      const categoryNameLower = category.name.toLowerCase().trim();
      
      // Direct match on lowercase names
      if (categoryNameLower === lowerSuggested) {
        console.log('📱 ✅ Direct lowercase match found:', category.name);
        return category.id;
      }
      
      // Check against keyword mappings
      const keywords = categoryMappings[categoryNameLower] || [categoryNameLower];
      
      // Check if suggested category matches any keyword
      if (keywords.some(keyword => 
        lowerSuggested.includes(keyword) || 
        keyword.includes(lowerSuggested) ||
        lowerSuggested === keyword
      )) {
        console.log('📱 ✅ Fuzzy category match found:', category.name, 'for suggestion:', suggestedCategory);
        return category.id;
      }
    }

    console.log('📱 ⚠️ No category match found for:', suggestedCategory);
    return null;
  } catch (error) {
    console.error('📱 Error finding category match:', error);
    return null;
  }
}

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

    // Get category ID with improved matching
    let categoryId = null;
    if (parsed.category) {
      console.log('📱 Trying to match category:', parsed.category);
      categoryId = await findBestCategoryMatch(user.id, parsed.category);
    }

    // If no category found, try merchant mapping
    if (!categoryId) {
      console.log('📱 Trying merchant mapping for:', parsed.merchant);
      categoryId = await getCategoryForMerchant(user.id, parsed.merchant);
    }

    // Default to "Others" if still no category
    if (!categoryId) {
      console.log('📱 Using default "Others" category');
      categoryId = await getDefaultCategory(user.id);
    }

    console.log('📱 Final category ID:', categoryId);

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
