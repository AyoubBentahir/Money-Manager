import { useState, useCallback, useEffect } from 'react';
import { Transaction, Budget, Currency, CURRENCIES, RecurringTransaction, Frequency, Goal, FullAppState } from '../types';
import { v4 as uuidv4 } from 'uuid';

const APP_STORAGE_KEY = 'jarvisai_data';

const VALID_FREQUENCIES: Frequency[] = ['daily', 'weekly', 'monthly', 'yearly'];

// Centralized state sanitization function to ensure data integrity
const sanitizeState = (data: any) => {
    if (!data || typeof data !== 'object') {
        return {
            transactions: [],
            budgets: [],
            activeBudgetId: null,
            currency: CURRENCIES[0],
            recurringTransactions: [],
            goals: [],
        };
    }

    const sanitizedTransactions = (Array.isArray(data.transactions) ? data.transactions : [])
        .filter(t => t && typeof t === 'object' && typeof t.amount === 'number' && typeof t.date === 'string' && t.type && t.category);

    const sanitizedBudgets = (Array.isArray(data.budgets) ? data.budgets : [])
        .filter((b: any) => b && typeof b === 'object' && typeof b.name === 'string' && typeof b.limits === 'object')
        .map((b: any) => ({ ...b, totalAmount: typeof b.totalAmount === 'number' ? b.totalAmount : 0 }));

    const sanitizedRecurring = (Array.isArray(data.recurringTransactions) ? data.recurringTransactions : [])
        .filter(rt =>
            rt && typeof rt === 'object' &&
            typeof rt.amount === 'number' &&
            typeof rt.nextDueDate === 'string' &&
            rt.type && rt.category &&
            typeof rt.frequency === 'string' &&
            VALID_FREQUENCIES.includes(rt.frequency)
        );

    const sanitizedGoals = (Array.isArray(data.goals) ? data.goals : [])
        .filter(g => g && typeof g === 'object' && typeof g.name === 'string' && typeof g.targetAmount === 'number' && typeof g.currentAmount === 'number');

    return {
        transactions: sanitizedTransactions,
        budgets: sanitizedBudgets,
        activeBudgetId: data.activeBudgetId || null,
        currency: CURRENCIES.includes(data.currency) ? data.currency : CURRENCIES[0],
        recurringTransactions: sanitizedRecurring,
        goals: sanitizedGoals,
    };
};


const getInitialState = () => {
    try {
        const storedData = localStorage.getItem(APP_STORAGE_KEY);
        if (storedData) {
            const data = JSON.parse(storedData);
            return sanitizeState(data);
        }
    } catch (error) {
        console.error("Failed to load or sanitize data from localStorage:", error);
    }
    // Default initial state
    return sanitizeState(null);
};

const calculateNextDueDate = (startDate: string, frequency: Frequency): string => {
    // startDate is "YYYY-MM-DD"
    const [year, month, day] = startDate.split('-').map(Number);
    // Use UTC to prevent timezone shifts. Note: month is 0-indexed in Date constructor.
    const date = new Date(Date.UTC(year, month - 1, day));

    switch (frequency) {
        case 'daily': date.setUTCDate(date.getUTCDate() + 1); break;
        case 'weekly': date.setUTCDate(date.getUTCDate() + 7); break;
        case 'monthly': date.setUTCMonth(date.getUTCMonth() + 1); break;
        case 'yearly': date.setUTCFullYear(date.getUTCFullYear() + 1); break;
    }
    // Return in "YYYY-MM-DD" format
    return date.toISOString().split('T')[0];
};

export const useTransactions = () => {
    const [initialState] = useState(getInitialState);
    const [transactions, setTransactions] = useState<Transaction[]>(initialState.transactions);
    const [budgets, setBudgets] = useState<Budget[]>(initialState.budgets);
    const [activeBudgetId, setActiveBudgetId] = useState<string | null>(initialState.activeBudgetId);
    const [currency, setCurrency] = useState<Currency>(initialState.currency);
    const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>(initialState.recurringTransactions);
    const [goals, setGoals] = useState<Goal[]>(initialState.goals);

    // --- Automatic Data Persistence ---
    useEffect(() => {
        try {
            const appState = {
                transactions,
                budgets,
                activeBudgetId,
                currency,
                recurringTransactions,
                goals
            };
            localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appState));
        } catch (error) {
            console.error("Failed to save data to localStorage:", error);
        }
    }, [transactions, budgets, activeBudgetId, currency, recurringTransactions, goals]);

    const checkAndProcessRecurring = useCallback(() => {
        const now = new Date();
        // Get today's date at midnight UTC to prevent timezone issues
        const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        const updatedRecurring = [...recurringTransactions];
        const newTransactions: Transaction[] = [];
        let needsUpdate = false;

        updatedRecurring.forEach((rec, index) => {
            // Use regex for more reliable date format validation
            if (!rec || typeof rec.nextDueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(rec.nextDueDate)) {
                console.warn('Skipping recurring transaction with invalid date format:', rec);
                return;
            }

            let currentNextDueDate = rec.nextDueDate; // This is a "YYYY-MM-DD" string

            // Loop to catch up on any missed transactions.
            // Date.parse('YYYY-MM-DD') treats the date as UTC, which is what we need for a reliable comparison.
            while (Date.parse(currentNextDueDate) <= todayUTC.getTime()) {
                needsUpdate = true;
                // Add a transaction for this due date
                newTransactions.push({
                    id: uuidv4(),
                    date: currentNextDueDate,
                    description: rec.description,
                    amount: rec.amount,
                    type: rec.type,
                    category: rec.category,
                    budgetId: rec.budgetId
                });

                // Calculate the next due date based on the current one using our timezone-safe function
                currentNextDueDate = calculateNextDueDate(currentNextDueDate, rec.frequency);
            }

            // After catching up, if the date has changed, update the recurring transaction's nextDueDate
            if (currentNextDueDate !== rec.nextDueDate) {
                const originalRec = updatedRecurring[index];
                updatedRecurring[index] = { ...originalRec, nextDueDate: currentNextDueDate };
            }
        });

        if (needsUpdate) {
            setTransactions(prev => [...newTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), ...prev]);
            setRecurringTransactions(updatedRecurring);
        }
    }, [recurringTransactions, setTransactions, setRecurringTransactions]);

    const setAppState = useCallback((state: FullAppState) => {
        // Sanitize the imported state to prevent corruption and potential infinite loops.
        const sanitized = sanitizeState({
            ...state,
            ...state.settings, // Flatten settings into the main object for the sanitizer
        });
        setTransactions(sanitized.transactions);
        setBudgets(sanitized.budgets);
        setRecurringTransactions(sanitized.recurringTransactions);
        setGoals(sanitized.goals);
        setActiveBudgetId(sanitized.activeBudgetId);
        setCurrency(sanitized.currency);
        // Note: language is handled in App.tsx directly
    }, []);

    // --- Transaction Handlers ---
    const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
        setTransactions(prev => [{ ...transaction, id: uuidv4() }, ...prev]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }, []);

    const deleteTransaction = useCallback((id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    }, []);

    // --- Recurring Transaction Handlers ---
    const addRecurringTransaction = useCallback((recTransaction: Omit<RecurringTransaction, 'id' | 'nextDueDate'>) => {
        const newRec: RecurringTransaction = {
            ...recTransaction,
            id: `rec-${uuidv4()}`,
            nextDueDate: recTransaction.startDate
        };
        setRecurringTransactions(prev => [...prev, newRec]);
    }, []);

    const deleteRecurringTransaction = useCallback((id: string) => {
        setRecurringTransactions(prev => prev.filter(rt => rt.id !== id));
    }, []);

    // --- Budget Handlers ---
    const addBudget = useCallback((name: string, totalAmount: number) => {
        const newBudget: Budget = { id: `budget-${uuidv4()}`, name, totalAmount, limits: {} };
        setBudgets(prev => [...prev, newBudget]);
        if (!activeBudgetId) {
            setActiveBudgetId(newBudget.id);
        }
    }, [activeBudgetId]);

    const deleteBudget = useCallback((id: string) => {
        const remainingBudgets = budgets.filter(b => b.id !== id);
        setBudgets(remainingBudgets);
        if (activeBudgetId === id) {
            setActiveBudgetId(remainingBudgets[0]?.id || null);
        }
    }, [activeBudgetId, budgets]);

    const updateBudget = useCallback((updatedBudget: Budget) => {
        setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? updatedBudget : b));
    }, []);

    // --- Goal Handlers ---
    const addGoal = useCallback((goal: Omit<Goal, 'id' | 'currentAmount'>) => {
        const newGoal: Goal = { ...goal, id: `goal-${uuidv4()}`, currentAmount: 0 };
        setGoals(prev => [...prev, newGoal]);
    }, []);

    const updateGoal = useCallback((updatedGoal: Goal) => {
        setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    }, []);

    const deleteGoal = useCallback((id: string) => {
        setGoals(prev => prev.filter(g => g.id !== id));
    }, []);

    const addContributionToGoal = useCallback((id: string, amount: number) => {
        setGoals(prev => prev.map(g => {
            if (g.id === id) {
                return { ...g, currentAmount: g.currentAmount + amount };
            }
            return g;
        }));
    }, []);

    return {
        transactions,
        addTransaction,
        deleteTransaction,
        budgets,
        activeBudgetId,
        setActiveBudgetId,
        addBudget,
        deleteBudget,
        updateBudget,
        currency,
        setCurrency,
        recurringTransactions,
        addRecurringTransaction,
        deleteRecurringTransaction,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        addContributionToGoal,
        setAppState,
        checkAndProcessRecurring,
    };
};