import * as XLSX from 'xlsx';
import { Transaction, Budget, FullAppState, RecurringTransaction, Goal } from '../types';

// Type guards for robust import
const isObject = (value: any): value is object => value !== null && typeof value === 'object' && !Array.isArray(value);

const importStateFromExcel = async (file: File): Promise<FullAppState> => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);

    // Read each sheet
    const transactions = XLSX.utils.sheet_to_json<Transaction>(workbook.Sheets['Transactions'] || []);
    const budgetsRaw = XLSX.utils.sheet_to_json<Budget>(workbook.Sheets['Budgets'] || []);
    const budgetLimits = XLSX.utils.sheet_to_json<{ budgetId: string, category: any, limit: number }>(workbook.Sheets['BudgetLimits'] || []);
    const recurringTransactions = XLSX.utils.sheet_to_json<RecurringTransaction>(workbook.Sheets['RecurringTransactions'] || []);
    const goals = XLSX.utils.sheet_to_json<Goal>(workbook.Sheets['Goals'] || []);
    const settingsRaw = XLSX.utils.sheet_to_json<{ key: string, value: any }>(workbook.Sheets['Settings'] || []);

    // Reconstruct budgets with limits
    const budgetMap = new Map<string, Budget>();
    budgetsRaw.forEach(b => budgetMap.set(b.id, { ...b, limits: {} }));
    budgetLimits.forEach(limit => {
        const budget = budgetMap.get(limit.budgetId);
        if (budget) {
            budget.limits[limit.category] = limit.limit;
        }
    });

    const budgets = Array.from(budgetMap.values());

    // Reconstruct settings
    const settings = settingsRaw.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
    }, {} as any);

    const importedState: FullAppState = {
        transactions: transactions.map(t => ({
            ...t,
            date: new Date(Math.round((t.date as any - 25569) * 86400 * 1000)).toISOString().split('T')[0]
        })),
        budgets,
        recurringTransactions: recurringTransactions.map(rt => ({
            ...rt,
            startDate: new Date(Math.round((rt.startDate as any - 25569) * 86400 * 1000)).toISOString().split('T')[0],
            nextDueDate: new Date(Math.round((rt.nextDueDate as any - 25569) * 86400 * 1000)).toISOString().split('T')[0],
        })),
        goals: goals.map(g => ({
            ...g,
            targetDate: new Date(Math.round((g.targetDate as any - 25569) * 86400 * 1000)).toISOString().split('T')[0]
        })),
        settings: {
            activeBudgetId: settings.activeBudgetId || null,
            currency: settings.currency || 'USD',
            language: settings.language || 'en',
        }
    };

    return importedState;
};

const exportStateToExcel = (state: FullAppState): Promise<void> => {
  return new Promise((resolve) => {
    const { transactions, budgets, recurringTransactions, goals, settings } = state;

    // Prepare data for sheets
    const budgetLimits = budgets.flatMap(b =>
        Object.entries(b.limits).map(([category, limit]) => ({
            budgetId: b.id,
            category,
            limit
        }))
    );
    const budgetsForSheet = budgets.map(({ id, name }) => ({ id, name }));
    const settingsForSheet = Object.entries(settings).map(([key, value]) => ({ key, value }));

    // Create worksheets
    const transactionsWs = XLSX.utils.json_to_sheet(transactions);
    const budgetsWs = XLSX.utils.json_to_sheet(budgetsForSheet);
    const budgetLimitsWs = XLSX.utils.json_to_sheet(budgetLimits);
    const recurringWs = XLSX.utils.json_to_sheet(recurringTransactions);
    const goalsWs = XLSX.utils.json_to_sheet(goals);
    const settingsWs = XLSX.utils.json_to_sheet(settingsForSheet);

    // Create workbook and append sheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, transactionsWs, 'Transactions');
    XLSX.utils.book_append_sheet(workbook, budgetsWs, 'Budgets');
    XLSX.utils.book_append_sheet(workbook, budgetLimitsWs, 'BudgetLimits');
    XLSX.utils.book_append_sheet(workbook, recurringWs, 'RecurringTransactions');
    XLSX.utils.book_append_sheet(workbook, goalsWs, 'Goals');
    XLSX.utils.book_append_sheet(workbook, settingsWs, 'Settings');

    XLSX.writeFile(workbook, 'jarvisai_backup.xlsx');
    resolve();
  });
};


export const excelService = {
  importStateFromExcel,
  exportStateToExcel,
};
