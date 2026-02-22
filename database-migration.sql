-- ============================================
-- SMS INTEGRATION MIGRATION
-- ============================================
-- Run this AFTER your existing supabase_schema.sql
-- This adds only the missing pieces needed for SMS integration

-- ============================================
-- 1. Check if sms_logs table needs any updates
-- ============================================
-- Your existing sms_logs table is perfect! No changes needed.
-- It already has: id, user_id, sender, message, received_at, parsed, confidence_score, created_at

-- ============================================
-- 2. Check if transactions table needs any updates
-- ============================================
-- Your existing transactions table is perfect! No changes needed.
-- It already has: id, user_id, account_id, category_id, amount, type, description, 
-- merchant_name, transaction_date, source, sms_id, created_at

-- ============================================
-- 3. Verify RLS policies exist (they should from your schema)
-- ============================================
-- All RLS policies are already in place from supabase_schema.sql

-- ============================================
-- 4. Add missing indexes (if not already present)
-- ============================================

-- These indexes improve SMS query performance
CREATE INDEX IF NOT EXISTS idx_sms_logs_received_at ON public.sms_logs(received_at);
CREATE INDEX IF NOT EXISTS idx_sms_logs_parsed ON public.sms_logs(parsed);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON public.transactions(source);
CREATE INDEX IF NOT EXISTS idx_transactions_sms_id ON public.transactions(sms_id);

-- ============================================
-- 5. Optional: Insert default categories if not exists
-- ============================================
-- Run this for each user who needs default categories
-- Replace 'USER_ID_HERE' with actual user ID

/*
INSERT INTO public.categories (user_id, name, icon, color, is_default) 
VALUES 
  ('USER_ID_HERE', 'Food', '🍔', '#FF6B6B', true),
  ('USER_ID_HERE', 'Transport', '🚗', '#4ECDC4', true),
  ('USER_ID_HERE', 'Shopping', '🛍️', '#95E1D3', true),
  ('USER_ID_HERE', 'Bills', '💡', '#F38181', true),
  ('USER_ID_HERE', 'Entertainment', '🎬', '#AA96DA', true),
  ('USER_ID_HERE', 'Healthcare', '🏥', '#FCBAD3', true),
  ('USER_ID_HERE', 'Travel', '✈️', '#FFFFD2', true),
  ('USER_ID_HERE', 'Others', '📦', '#A8D8EA', true)
ON CONFLICT (user_id, name) DO NOTHING;
*/

-- ============================================
-- 6. Verify foreign key constraint exists
-- ============================================
-- This should already exist from your schema, but let's make sure

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_transactions_sms_logs'
  ) THEN
    ALTER TABLE public.transactions 
      ADD CONSTRAINT fk_transactions_sms_logs 
      FOREIGN KEY (sms_id) REFERENCES public.sms_logs(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify everything is set up correctly

-- Check if all required tables exist
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sms_logs') 
    THEN '✅ sms_logs exists'
    ELSE '❌ sms_logs missing'
  END as sms_logs_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') 
    THEN '✅ transactions exists'
    ELSE '❌ transactions missing'
  END as transactions_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') 
    THEN '✅ categories exists'
    ELSE '❌ categories missing'
  END as categories_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'merchant_category_map') 
    THEN '✅ merchant_category_map exists'
    ELSE '❌ merchant_category_map missing'
  END as merchant_map_status;

-- Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('sms_logs', 'transactions', 'categories', 'merchant_category_map')
ORDER BY tablename;

-- Check indexes
SELECT 
  tablename,
  indexname
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('sms_logs', 'transactions', 'categories', 'merchant_category_map')
ORDER BY tablename, indexname;

-- ============================================
-- SUMMARY
-- ============================================
-- Your existing supabase_schema.sql already has:
-- ✅ sms_logs table with all required fields
-- ✅ transactions table with sms_id foreign key
-- ✅ categories table
-- ✅ merchant_category_map table
-- ✅ All RLS policies
-- ✅ All necessary indexes
-- ✅ Triggers for auto-profile creation
--
-- This migration only adds:
-- ✅ A few additional indexes for better performance
-- ✅ Verification that foreign key constraint exists
--
-- NO BREAKING CHANGES - Your existing data is safe!
