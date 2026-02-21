export type TransactionType = 'DEBIT' | 'CREDIT';
export type TransactionSource = 'SMS' | 'MANUAL' | 'API';
export type PeriodType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface Profile {
  id: string;
  name: string | null;
  phone_number: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  bank_name: string;
  account_name: string;
  last4_digits: string | null;
  balance: number;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  created_at: string;
}

export interface CategoryLimit {
  id: string;
  user_id: string;
  category_id: string;
  limit_amount: number;
  period_type: PeriodType;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string | null;
  category_id: string | null;
  amount: number;
  type: TransactionType;
  description: string | null;
  merchant_name: string | null;
  transaction_date: string; // ISO string
  source: TransactionSource;
  sms_id: string | null;
  created_at: string;
  
  // Joins
  categories?: Category | null;
  accounts?: Account | null;
}

export interface SmsLog {
  id: string;
  user_id: string;
  sender: string;
  message: string;
  received_at: string;
  parsed: boolean;
  confidence_score: number | null;
  created_at: string;
}

export interface MerchantCategoryMap {
  id: string;
  user_id: string;
  merchant_keyword: string;
  category_id: string;
  created_at: string;
}

export interface BudgetAlert {
  id: string;
  user_id: string;
  category_id: string;
  alert_type: 'WARNING' | 'CRITICAL';
  message: string;
  created_at: string;
}
