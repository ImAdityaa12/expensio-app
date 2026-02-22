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
  "category": "one of: Food, Transport, Shopping, Bills, Entertainment, Healthcare, Travel, Others",
  "date": "YYYY-MM-DD format"
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

Date Extraction Rules:
- Extract the ACTUAL transaction date from the SMS
- Common formats: "22-Feb-26", "22/02/2026", "22-02-2026", "Feb 22, 2026"
- Convert to YYYY-MM-DD format (e.g., "2026-02-22")
- If year is 2-digit (like "26"), assume 20XX (2026)
- If no date found in SMS, use today's date

Important:
- If this is NOT a transaction SMS (OTP, promotional, alerts), set isTransaction to false
- Return ONLY valid JSON, no markdown formatting, no code blocks
- Amount should be a number without currency symbols
- Date must be in YYYY-MM-DD format`;

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

    // Validate and parse the date
    let transactionDate: string;
    if (parsed.date && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)) {
      // Date is already in correct format
      transactionDate = parsed.date;
    } else if (parsed.date) {
      // Try to parse the date
      try {
        const parsedDate = new Date(parsed.date);
        if (!isNaN(parsedDate.getTime())) {
          transactionDate = parsedDate.toISOString().split('T')[0];
        } else {
          console.log('🤖 ⚠️ Invalid date from Gemini, using current date');
          transactionDate = new Date().toISOString().split('T')[0];
        }
      } catch {
        console.log('🤖 ⚠️ Error parsing date, using current date');
        transactionDate = new Date().toISOString().split('T')[0];
      }
    } else {
      // No date provided, use current date
      transactionDate = new Date().toISOString().split('T')[0];
    }

    console.log('🤖 Extracted date:', transactionDate);

    return {
      amount: parsed.amount,
      merchant: parsed.merchant,
      date: transactionDate + 'T00:00:00.000Z', // Add time component for consistency
      transactionType: parsed.transactionType,
      category: parsed.category,
      isTransaction: parsed.isTransaction,
    };
  } catch (error) {
    console.error('🤖 Gemini parsing error:', error);
    return null;
  }
}
