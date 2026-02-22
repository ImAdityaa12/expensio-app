export interface ParsedSms {
  amount: number;
  merchant: string;
  date: string;
}

export function parseSms(message: string): ParsedSms | null {
  // Check if it's a debit message
  const isDebit = /debited|spent|payment|paid/i.test(message);
  if (!isDebit) return null;

  // Extract amount
  const amountRegex = /(?:Rs\.?|INR)\s?(\d+(?:\.\d{1,2})?)/i;
  const amountMatch = message.match(amountRegex);
  if (!amountMatch) return null;
  
  const amount = parseFloat(amountMatch[1]);
  
  // Extract merchant - try multiple patterns
  let merchant = 'Unknown Merchant';
  
  // Pattern 1: "MERCHANT credited" (ICICI format)
  const creditedPattern = /;\s*([A-Z][A-Z\s]+)\s+credited/i;
  const creditedMatch = message.match(creditedPattern);
  if (creditedMatch) {
    merchant = creditedMatch[1].trim();
  } else {
    // Pattern 2: "at MERCHANT on"
    const atPattern = /at\s+([^.]+?)\s+on/i;
    const atMatch = message.match(atPattern);
    if (atMatch) {
      merchant = atMatch[1].trim();
    } else {
      // Pattern 3: "for MERCHANT"
      const forPattern = /for\s+([^.]+?)(?:\.|$|UPI)/i;
      const forMatch = message.match(forPattern);
      if (forMatch) {
        merchant = forMatch[1].trim();
      }
    }
  }

  return {
    amount,
    merchant,
    date: new Date().toISOString(),
  };
}
