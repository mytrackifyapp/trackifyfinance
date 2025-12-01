# Accounting System Upgrade: Personal & Company Accounts

## Overview
The accounting system has been upgraded to support both **Personal** and **Company/Business** accounts. Users can now create separate accounts for personal finances and business operations, with appropriate categories and features for each.

## Key Features

### 1. Account Context Selection
- When creating an account, users can choose between **Personal** or **Company** context
- Company accounts require:
  - Company Name (optional but recommended)
  - Tax ID / EIN (optional)

### 2. Company-Specific Categories
- **Income Categories:**
  - Sales Revenue
  - Service Revenue
  - Product Sales
  - Subscription Revenue
  - Consulting Fees
  - Other Revenue

- **Expense Categories:**
  - Office Rent
  - Salaries & Wages
  - Marketing & Advertising
  - Software & Subscriptions
  - Equipment & Supplies
  - Business Travel
  - Professional Services
  - Business Insurance
  - Utilities
  - Taxes & Fees
  - Shipping & Delivery
  - Maintenance & Repairs
  - Training & Development
  - Bank & Finance Fees
  - Other Business Expenses

### 3. Separate Dashboards
- **Personal Tab:** Shows personal accounts, transactions, and budgets
- **Company Tab:** Shows business accounts with:
  - Total Revenue
  - Total Expenses
  - Net Profit
  - Monthly metrics
  - Business-specific overview

### 4. Smart Category Selection
- Transaction forms automatically show appropriate categories based on the selected account's context
- Personal accounts show personal categories
- Company accounts show business categories

### 5. Account Display
- Account cards show a "Business" badge for company accounts
- Company name is displayed on account cards when available

## Database Changes

### New Fields in `Account` Model
- `context`: `AccountContext` enum (PERSONAL | COMPANY) - defaults to PERSONAL
- `companyName`: Optional string for company name
- `taxId`: Optional string for tax ID/EIN
- New index on `(userId, context)` for efficient filtering

### Migration
- Migration file: `20251201091305_add_account_context`
- All existing accounts default to `PERSONAL` context

## Files Modified/Created

### Database Schema
- `prisma/schema.prisma` - Added AccountContext enum and fields to Account model

### Category Data
- `data/company-categories.js` - New file with company-specific categories

### Components
- `components/create-account-drawer.jsx` - Added context selection and company fields
- `app/(main)/dashboard/_components/account-card.jsx` - Shows context badge and company name
- `app/(main)/transaction/_components/transaction-form.jsx` - Dynamic category selection based on account context
- `app/(main)/transaction/create/page.jsx` - Context-aware category loading

### Pages
- `app/(main)/dashboard/accounting/page.jsx` - Now uses tabs for Personal/Company views
- `app/(main)/dashboard/accounting/_components/accounting-tabs.jsx` - New tab component
- `app/(main)/dashboard/accounting/_components/personal-accounting-view.jsx` - Personal accounts view
- `app/(main)/dashboard/accounting/_components/company-accounting-view.jsx` - Company accounts view
- `app/(main)/dashboard/accounting/_components/company-dashboard-overview.jsx` - Business metrics dashboard

### Actions
- `actions/dashboard.js` - Updated `createAccount` to handle new fields
- `app/lib/schema.js` - Updated `accountSchema` validation

## Usage

### Creating a Personal Account
1. Go to Accounting page
2. Click "Add New Account"
3. Select "Personal" as Account Context
4. Fill in account details
5. Save

### Creating a Company Account
1. Go to Accounting page
2. Click "Add New Account"
3. Select "Company/Business" as Account Context
4. Enter Company Name (optional)
5. Enter Tax ID/EIN (optional)
6. Fill in account details
7. Save

### Adding Transactions
- When creating a transaction, select an account
- The category dropdown will automatically show:
  - Personal categories for personal accounts
  - Business categories for company accounts

### Viewing Accounts
- Use the tabs on the Accounting page to switch between:
  - **Personal:** All personal accounts and transactions
  - **Company:** All business accounts with revenue/expense metrics

## Business Metrics (Company Tab)
- **Total Revenue:** Sum of all income transactions
- **Total Expenses:** Sum of all expense transactions
- **Net Profit:** Revenue minus expenses
- **Monthly Metrics:** Current month revenue, expenses, and profit
- **Total Balance:** Combined balance across all business accounts

## Next Steps (Future Enhancements)
- Invoice management for company accounts
- Tax reporting and categorization
- Multi-currency support for international businesses
- Expense approval workflows
- Integration with accounting software (QuickBooks, Xero)
- Receipt OCR for business expenses
- Profit & Loss statements
- Balance sheets

