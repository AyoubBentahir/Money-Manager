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


const MonthlySummary: React.FC<{ transactions: Transaction[], currency: Currency }> = ({ transactions, currency }) => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const monthTx = transactions.filter(tx => {
        const d = new Date(tx.date + 'T00:00:00');
        return d.getMonth() === month && d.getFullYear() === year;
    });

    const income = monthTx.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
    const expenses = monthTx.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
    const net = income - expenses;
    const max = Math.max(income, expenses, 1);
    const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div className="p-6 bg-secondary rounded-lg border border-gray-800">
            <h3 className="text-xl font-semibold text-light mb-4">Monthly Summary <span className="text-accent text-base font-normal">({monthName})</span></h3>
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-medium">Income</span>
                        <span className="font-mono text-green-400">{formatCurrency(income, currency)}</span>
                    </div>
                    <div className="w-full bg-primary rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(income / max) * 100}%` }} />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-medium">Expenses</span>
                        <span className="font-mono text-red-400">{formatCurrency(expenses, currency)}</span>
                    </div>
                    <div className="w-full bg-primary rounded-full h-2.5">
                        <div className="bg-red-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(expenses / max) * 100}%` }} />
                    </div>
                </div>
                <div className="pt-2 border-t border-gray-700 flex justify-between items-center">
                    <span className="text-sm text-medium">Net</span>
                    <span className={`font-mono font-bold text-lg ${net >= 0 ? 'text-green-400' : 'text-red-400'}`}>{net >= 0 ? '+' : ''}{formatCurrency(net, currency)}</span>
                </div>
            </div>
        </div>
    );
};

// Donut chart colors
const DONUT_COLORS = ['#38BDF8', '#34D399', '#F87171', '#FBBF24', '#A78BFA', '#FB923C', '#60A5FA', '#F472B6', '#2DD4BF', '#818CF8'];

const SpendingDonut: React.FC<{ transactions: Transaction[], currency: Currency }> = ({ transactions, currency }) => {
    const expenses = transactions.filter(tx => tx.type === 'expense');
    const total = expenses.reduce((s, tx) => s + tx.amount, 0);

    const byCat = useMemo(() => {
        const map: Record<string, number> = {};
        expenses.forEach(tx => { map[tx.category] = (map[tx.category] || 0) + tx.amount; });
        return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
    }, [expenses]);

    if (total === 0) return (
        <div className="p-6 bg-secondary rounded-lg border border-gray-800">
            <h3 className="text-xl font-semibold text-light mb-4">Spending Breakdown</h3>
            <p className="text-medium text-center py-4">No expense data available.</p>
        </div>
    );

    // SVG donut
    const r = 60, cx = 80, cy = 80, strokeW = 22;
    const circ = 2 * Math.PI * r;
    let cumulative = 0;
    const slices = byCat.map(([cat, amount], i) => {
        const pct = amount / total;
        const dash = pct * circ;
        const gap = circ - dash;
        const offset = circ - cumulative * circ;
        cumulative += pct;
        return { cat, amount, pct, dash, gap, offset, color: DONUT_COLORS[i % DONUT_COLORS.length] };
    });

    return (
        <div className="p-6 bg-secondary rounded-lg border border-gray-800">
            <h3 className="text-xl font-semibold text-light mb-4">Spending Breakdown</h3>
            <div className="flex items-center gap-6">
                <svg width="160" height="160" viewBox="0 0 160 160" className="flex-shrink-0">
                    {slices.map(s => (
                        <circle
                            key={s.cat}
                            cx={cx} cy={cy} r={r}
                            fill="none"
                            stroke={s.color}
                            strokeWidth={strokeW}
                            strokeDasharray={`${s.dash} ${s.gap}`}
                            strokeDashoffset={s.offset}
                            style={{ transition: 'stroke-dasharray 0.5s ease' }}
                        />
                    ))}
                    <text x={cx} y={cy - 6} textAnchor="middle" className="fill-current" style={{ fill: '#E6EDF3', fontSize: '11px' }}>Total</text>
                    <text x={cx} y={cy + 12} textAnchor="middle" style={{ fill: '#38BDF8', fontSize: '10px', fontWeight: 'bold' }}>{formatCurrency(total, currency)}</text>
                </svg>
                <ul className="flex-1 space-y-2 text-sm">
                    {slices.map(s => (
                        <li key={s.cat} className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 text-medium truncate">
                                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                                {s.cat}
                            </span>
                            <span className="font-mono text-light text-xs">{Math.round(s.pct * 100)}%</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};


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

            {/* Top summary cards */}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <MonthlySummary transactions={transactions} currency={currency} />
                </div>
                <div className="lg:col-span-1">
                    <SpendingDonut transactions={transactions} currency={currency} />
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