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

    const prompt = `You are an expert at parsing bank transaction SMS messages from Indian banks. Analyze the following SMS and extract transaction details.

SMS Message: "${smsMessage}"

Extract the following information and respond ONLY with valid JSON (no markdown, no explanation):
{
  "isTransaction": true/false,
  "amount": number (just the number, no currency symbol),
  "merchant": "merchant or payee name",
  "transactionType": "DEBIT" or "CREDIT",
  "category": "one of: Food, Transport, Shopping, Bills, Entertainment, Healthcare, Travel, Others"
}

Category Guidelines:
- Food: Restaurants, cafes, food delivery (Swiggy, Zomato, McDonald's, KFC, Dominos, etc.)
- Transport: Uber, Ola, fuel stations, parking, metro, bus, auto
- Shopping: Amazon, Flipkart, retail stores, clothing, electronics, online shopping
- Bills: Electricity, water, internet, mobile recharge, DTH, gas cylinder
- Entertainment: Netflix, Prime Video, Hotstar, movie tickets, gaming, music
- Healthcare: Hospitals, pharmacies, medical stores, doctor fees, health insurance
- Travel: Hotels, flights, train tickets, travel bookings, vacation expenses
- Others: ATM withdrawals, bank charges, or anything that doesn't fit above categories

Merchant Name Rules:
- Extract the actual business name (e.g., "Swiggy", "Amazon", "Uber")
- Remove generic terms like "at", "from", "to"
- Don't include account numbers or transaction IDs
- Keep it short and recognizable

Transaction Type Rules:
- DEBIT: Money going out (debited, spent, paid, withdrawn, used for)
- CREDIT: Money coming in (credited, received, deposited, refund, cashback)

Important:
- If this is NOT a transaction SMS (OTP, promotional, alerts), set isTransaction to false
- Return ONLY valid JSON, no markdown formatting, no code blocks
- Amount should be a number without currency symbols`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text().trim();
    
    console.log('🤖 Gemini raw response:', text);

    // Remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

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
