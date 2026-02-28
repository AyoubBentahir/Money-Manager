import React, { useMemo } from 'react';
import { AlertIcon } from './icons';
import CategoryChart from './CategoryChart';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Transaction, Budget, Currency, BudgetAlert } from '../types';
import { useTranslations } from '../contexts/TranslationContext';

const RecentTransactions: React.FC<{ transactions: Transaction[], currency: Currency }> = ({ transactions, currency }) => {
    const { t } = useTranslations();
    const recent = transactions.slice(0, 5);
    return (
        <div className="p-6 bg-secondary rounded-lg border border-gray-800">
            <h3 className="text-xl font-semibold mb-4 text-light">{t('recent_transactions')}</h3>
            {recent.length === 0 ? (
                <p className="text-medium">{t('no_transactions_yet')}</p>
            ) : (
                <ul className="divide-y divide-gray-800">
                    {recent.map(t => (
                        <li key={t.id} className="py-3 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-light">{t.description}</p>
                                <p className="text-sm text-medium">{formatDate(t.date)}</p>
                            </div>
                            <p className={`font-mono font-semibold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                {formatCurrency(t.amount, currency)}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

const ActiveBudgetSummary: React.FC<{
    transactions: Transaction[],
    activeBudget: Budget | undefined,
    currency: Currency,
    budgets: Budget[],
    setActiveBudgetId: (id: string) => void
}> = ({ transactions, activeBudget, currency, budgets, setActiveBudgetId }) => {
    const { t } = useTranslations();
    if (!activeBudget) {
        return (
            <div className="p-6 bg-secondary rounded-lg border border-gray-800 text-center">
                <h4 className="text-xl font-semibold mb-2 text-light">{t('no_active_budget')}</h4>
                <p className="text-medium">{t('no_active_budget_prompt')}</p>
            </div>
        )
    }

    const totalBudgetLimit = activeBudget.totalAmount;
    const totalSpent = transactions
        .filter(t => t.type === 'expense' && t.budgetId === activeBudget.id)
        .reduce((sum, t) => sum + t.amount, 0);

    const percentage = totalBudgetLimit > 0 ? Math.min((totalSpent / totalBudgetLimit) * 100, 100) : 0;
    const remaining = totalBudgetLimit - totalSpent;

    return (
        <div className="p-6 bg-secondary rounded-lg border border-gray-800">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-light">{t('active_budget')}:</h3>
                <select
                    value={activeBudget.id}
                    onChange={(e) => setActiveBudgetId(e.target.value)}
                    className="bg-secondary text-accent border-0 focus:ring-0 font-semibold text-xl p-1 appearance-none"
                    aria-label={t('select_active_budget')}
                >
                    {budgets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
            </div>
            <div className="w-full bg-primary rounded-full h-4 border border-gray-800">
                <div
                    className="bg-accent h-4 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <div className="flex justify-between mt-2 font-mono text-sm">
                <span className="text-medium">{t('spent')}: {formatCurrency(totalSpent, currency)}</span>
                <span className={remaining >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {remaining >= 0 ? `${formatCurrency(remaining, currency)} ${t('remaining')}` : `${formatCurrency(Math.abs(remaining), currency)} ${t('over')}`}
                </span>
            </div>
        </div>
    );
};

const BudgetAlerts: React.FC<{ alerts: BudgetAlert[], currency: Currency }> = ({ alerts, currency }) => {
    const { t } = useTranslations();
    if (alerts.length === 0) return null;

    return (
        <div className="p-6 bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg mb-6">
            <h3 className="text-xl font-semibold mb-4 text-yellow-300 flex items-center">
                <AlertIcon className="h-6 w-6 mr-3" />
                {t('budget_alerts')}
            </h3>
            <ul className="space-y-3">
                {alerts.map(alert => (
                    <li key={alert.category}>
                        <p className="text-yellow-200">
                            {t('alert_message', {
                                percentage: Math.round(alert.percentage),
                                category: alert.category,
                            })}
                        </p>
                        <div className="text-sm font-mono text-yellow-400">
                            {formatCurrency(alert.spent, currency)} / {formatCurrency(alert.limit, currency)}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}


export const Dashboard: React.FC<{
    transactions: Transaction[],
    activeBudget: Budget | undefined,
    currency: Currency,
    budgets: Budget[],
    setActiveBudgetId: (id: string) => void
}> = ({ transactions, activeBudget, currency, budgets, setActiveBudgetId }) => {
    const { t } = useTranslations();
    const balance = transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const budgetAlerts = useMemo<BudgetAlert[]>(() => {
        if (!activeBudget || !activeBudget.limits) return [];

        const spendingByCategory = transactions
            .filter(t => t.type === 'expense' && t.budgetId === activeBudget.id)
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        const alerts: BudgetAlert[] = [];
        for (const [category, limit] of Object.entries(activeBudget.limits)) {
            // FIX: Add type guard for `limit` as Object.entries may return `unknown` values.
            if (typeof limit === 'number' && limit > 0) {
                const spent = spendingByCategory[category] || 0;
                const percentage = (spent / limit) * 100;
                if (percentage >= 90) {
                    alerts.push({ category: category as any, spent, limit, percentage });
                }
            }
        }
        return alerts;

    }, [transactions, activeBudget]);

    return (
        <div className="p-6 bg-primary min-h-full">
            <h1 className="text-4xl font-bold mb-8 text-light">{t('dashboard')}</h1>

            <BudgetAlerts alerts={budgetAlerts} currency={currency} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-6 bg-secondary rounded-lg border border-gray-800">
                    <h4 className="text-sm font-medium text-medium uppercase tracking-wider">{t('total_balance')}</h4>
                    <p className="text-3xl font-bold mt-1 font-mono">{formatCurrency(balance, currency)}</p>
                </div>
                <div className="p-6 bg-secondary rounded-lg border border-gray-800">
                    <h4 className="text-sm font-medium text-medium uppercase tracking-wider">{t('total_income')}</h4>
                    <p className="text-3xl font-bold mt-1 text-green-400 font-mono">{formatCurrency(totalIncome, currency)}</p>
                </div>
                <div className="p-6 bg-secondary rounded-lg border border-gray-800">
                    <h4 className="text-sm font-medium text-medium uppercase tracking-wider">{t('total_expenses')}</h4>
                    <p className="text-3xl font-bold mt-1 text-red-400 font-mono">{formatCurrency(totalExpenses, currency)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <ActiveBudgetSummary transactions={transactions} activeBudget={activeBudget} currency={currency} budgets={budgets} setActiveBudgetId={setActiveBudgetId} />
                    <RecentTransactions transactions={transactions} currency={currency} />
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <CategoryChart transactions={transactions} currency={currency} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;