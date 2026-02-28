import React from 'react';

export enum View {
    Dashboard = 'dashboard',
    Transactions = 'transactions',
    Analysis = 'analysis',
    Budgets = 'budgets',
    FinancialAdvice = 'advice',
    Recurring = 'recurring',
    Goals = 'goals',
}

export type TransactionType = 'income' | 'expense';

export const ExpenseCategory = [
    'Food',
    'Bills/Utilities',
    'Transport (Daily)',
    'Public Transport Pass',
    'Tuition/Fees',
    'Books/Supplies',
    'Software/Services',
    'Electronics/Gear',
    'Gym Membership',
    'Supplements',
    'Fitness Gear',
    'Health/Wellness',
    'Miscellaneous',
] as const;

export const IncomeCategory = [
    'Salary',
    'Scholarships',
    'Freelance/Gigs',
    'Allowance/Gifts',
] as const;

export type ExpenseCategoryType = typeof ExpenseCategory[number];
export type IncomeCategoryType = typeof IncomeCategory[number];
export type TransactionCategory = ExpenseCategoryType | IncomeCategoryType;

export interface Transaction {
    id: string;
    date: string; // ISO 8601 format: "YYYY-MM-DD"
    description: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    budgetId?: string;
}

export type SpendingLimit = {
    [key in ExpenseCategoryType]?: number;
};

export interface Budget {
    id: string;
    name: string;
    totalAmount: number;
    limits: SpendingLimit;
}

export const CURRENCIES = ['USD', 'EUR', 'JPY', 'GBP', 'CAD', 'AUD', 'MAD'] as const;
export type Currency = typeof CURRENCIES[number];

// --- I18n Types ---
export type Language = 'en' | 'fr' | 'es' | 'ar';

export const LANGUAGES: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'ar', name: 'العربية' },
];

export type Translations = { [key: string]: string };

// --- New Features ---

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
    id: string;
    description: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    budgetId?: string;
    frequency: Frequency;
    startDate: string; // "YYYY-MM-DD"
    nextDueDate: string; // "YYYY-MM-DD"
}

export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string; // "YYYY-MM-DD"
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}


export type BudgetAlert = {
    category: ExpenseCategoryType;
    spent: number;
    limit: number;
    percentage: number;
};

// --- Component Prop Types ---

export type NavItem = {
    name: string;
    view: View;
    icon: (props: React.ComponentProps<'svg'>) => React.ReactElement;
};

// --- App State for Backup/Restore ---
export interface AppSettings {
    activeBudgetId: string | null;
    currency: Currency;
    language: Language;
}

export interface FullAppState {
    transactions: Transaction[];
    budgets: Budget[];
    recurringTransactions: RecurringTransaction[];
    goals: Goal[];
    settings: AppSettings;
}
