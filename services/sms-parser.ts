export interface ParsedSms {
  amount: number;
  merchant: string;
  date: string;
}

export function parseSms(message: string): ParsedSms | null {
  // Example: Rs. 500 debited from A/C XXXX at Swiggy on 18 Feb.
  // Example: Debited Rs. 200.00 from A/C XX1234 on 19-02-2026 for Swiggy.
  
  const amountRegex = /(?:Rs\.?|INR)\s?(\d+(?:\.\d{1,2})?)/i;
  const merchantRegex = /at\s+([^.]+)\s+on/i;
  const alternativeMerchantRegex = /for\s+([^.]+)/i;
  
  const amountMatch = message.match(amountRegex);
  if (!amountMatch) return null;
  
  const amount = parseFloat(amountMatch[1]);
  
  let merchant = 'Unknown Merchant';
  const merchantMatch = message.match(merchantRegex) || message.match(alternativeMerchantRegex);
  if (merchantMatch) {
    merchant = merchantMatch[1].trim();
  }
  
  // Basic check if it's a debit message
  const isDebit = /debited|spent|payment|paid/i.test(message);
  if (!isDebit) return null;

  return {
    amount,
    merchant,
    date: new Date().toISOString(),
  };
}
