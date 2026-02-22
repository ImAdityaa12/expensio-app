import { GoogleGenerativeAI } from '@google/generative-ai';
import Constants from 'expo-constants';

export interface ParsedSmsData {
  amount: number;
  merchant: string;
  date: string;
  transactionType: 'DEBIT' | 'CREDIT';
  category?: string;
  isTransaction: boolean;
}

const genAI = new GoogleGenerativeAI(
  Constants.expoConfig?.extra?.geminiApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY || ''
);

export async function parseSmsWithGemini(smsMessage: string): Promise<ParsedSmsData | null> {
  try {
    console.log('🤖 Using Gemini 2.5 Flash to parse SMS...');
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash'
    });

    const prompt = `You are an expert at parsing bank transaction SMS messages. Analyze the following SMS and extract transaction details.

SMS Message: "${smsMessage}"

Extract the following information and respond ONLY with valid JSON (no markdown, no explanation):
{
  "isTransaction": true/false,
  "amount": number (just the number, no currency symbol),
  "merchant": "merchant or payee name",
  "transactionType": "DEBIT" or "CREDIT",
  "category": "suggested category like Food, Transport, Shopping, Bills, Entertainment, Healthcare, Travel, Others"
}

Rules:
- If this is NOT a transaction SMS (like OTP, promotional, etc), set isTransaction to false
- For amount, extract only the numeric value
- For merchant, extract the business/person name (not account numbers)
- transactionType should be DEBIT for payments/debits, CREDIT for deposits/credits
- Suggest the most appropriate category based on merchant name
- Return valid JSON only, no additional text`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();
    
    console.log('🤖 Gemini raw response:', text);

    // Parse JSON response
    const parsed = JSON.parse(text);

    if (!parsed.isTransaction) {
      console.log('🤖 Not a transaction SMS');
      return null;
    }

    return {
      amount: parsed.amount,
      merchant: parsed.merchant,
      date: new Date().toISOString(),
      transactionType: parsed.transactionType,
      category: parsed.category,
      isTransaction: parsed.isTransaction,
    };
  } catch (error) {
    console.error('🤖 Gemini parsing error:', error);
    return null;
  }
}
