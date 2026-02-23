# 📊 Expense Tracker -- Database Working Documentation

## 🎯 Overview

This Expense Tracker application:

-   Reads SMS transactions
-   Extracts transaction amount and merchant
-   Automatically assigns category
-   Tracks category-based limits
-   Displays:
    -   Today's Expense
    -   Weekly Expense
    -   Category-wise Expense
-   Triggers alerts when limits are exceeded

------------------------------------------------------------------------

# 🗂 Database Architecture

## Core Tables

-   `users`
-   `accounts`
-   `categories`
-   `category_limits`
-   `transactions`
-   `sms_logs`
-   `merchant_category_map`
-   `budget_alerts`

------------------------------------------------------------------------

# 🔄 Complete Working Flow

## 1️⃣ User Setup Flow

### Step 1: User Registration

-   Create record in `users`
-   Create default categories (Food, Travel, Shopping, Bills, etc.)

### Step 2: User Adds Account

-   Insert record into `accounts`
-   Example:
    -   HDFC Salary Account
    -   SBI Savings Account

------------------------------------------------------------------------

## 2️⃣ SMS Processing Flow

### Step 1: SMS Received

Example SMS: Rs. 450 spent on SWIGGY via HDFC Card

------------------------------------------------------------------------

### Step 2: Store Raw SMS

Insert into `sms_logs`:

-   sender\
-   message\
-   received_at\
-   parsed = false

------------------------------------------------------------------------

### Step 3: Parse SMS

Backend extracts:

-   amount = 450\
-   merchant = SWIGGY\
-   type = DEBIT\
-   transaction_date

------------------------------------------------------------------------

### Step 4: Detect Category

#### Case A: Merchant Found in Mapping

Check `merchant_category_map`

Example: SWIGGY → Food

Assign category automatically.

#### Case B: Merchant Not Found

-   Use AI classification
-   Predict category
-   Save mapping for future use

------------------------------------------------------------------------

### Step 5: Insert Transaction

Insert into `transactions`:

-   user_id\
-   account_id\
-   category_id\
-   amount\
-   type\
-   merchant_name\
-   source = SMS

------------------------------------------------------------------------

### Step 6: Mark SMS as Parsed

Update `sms_logs.parsed = true`

------------------------------------------------------------------------

# 💰 Expense Calculation Logic

## 🟢 Today Expense

Calculate:

Sum of all DEBIT transactions where transaction_date = today

Used for Home Screen summary.

------------------------------------------------------------------------

## 🟡 Weekly Expense

Calculate:

Sum of all DEBIT transactions where\
transaction_date \>= last 7 days

Used for weekly analytics.

------------------------------------------------------------------------

## 🔵 Category-wise Expense

Group transactions by category and calculate total spend.

Used for:

-   Pie charts
-   Category breakdown
-   Budget tracking

------------------------------------------------------------------------

# 🚨 Limit Checking Logic

## Step 1: Fetch Category Limit

From `category_limits`

Example: Food → ₹2000 per week

------------------------------------------------------------------------

## Step 2: Calculate Current Period Spend

If WEEKLY: Sum of category transactions for current week.

------------------------------------------------------------------------

## Step 3: Compare

If: - Spend ≥ 80% → Trigger warning - Spend ≥ 100% → Trigger alert

------------------------------------------------------------------------

## Step 4: Store Alert

Insert record into `budget_alerts`

Used for:

-   Push notifications
-   Warning banners
-   Alerts section

------------------------------------------------------------------------

# 📊 Dashboard Working

## Home Screen Displays:

-   Today Expense
-   Weekly Expense
-   Remaining Budget
-   Category Progress Bars

All values calculated from:

transactions + category_limits

------------------------------------------------------------------------

## Category Drawer (Bottom Sheet)

When user clicks on a category:

Fetch all transactions where category_id = selected category\
Order by transaction_date DESC

Display:

-   All transactions
-   Remaining limit
-   Percentage used

------------------------------------------------------------------------

# 🔁 Smart Learning Behavior

If new merchant appears:

1.  AI classifies category
2.  Save mapping in `merchant_category_map`
3.  Next time → No AI call required

System becomes smarter over time.

------------------------------------------------------------------------

# 🔐 Security Considerations

-   Encrypt sensitive SMS data
-   Store only required SMS
-   Mask account details
-   Use background job for SMS parsing
-   Avoid blocking UI

------------------------------------------------------------------------

# 🚀 Future Enhancements

-   Subscription detection
-   Recurring expense tracking
-   UPI transaction tracking
-   Multi-currency support
-   Shared expenses
-   Advanced analytics
-   Saving goals
