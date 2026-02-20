export type ExpenseSource = 'sms' | 'manual';

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  merchant: string;
  category: string;
  date: string;
  source: ExpenseSource;
  type?: 'income' | 'expense';
  payment_method?: string;
  note: string | null;
  created_at: string;
}

export type NewExpense = Omit<Expense, 'id' | 'created_at' | 'user_id'>;
