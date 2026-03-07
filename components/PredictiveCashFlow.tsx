import React, { useMemo } from 'react';
import { Transaction, RecurringTransaction, Currency } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useTranslations } from '../contexts/TranslationContext';

interface PredictiveCashFlowProps {
    transactions: Transaction[];
    recurringTransactions: RecurringTransaction[];
    currency: Currency;
}

const PredictiveCashFlow: React.FC<PredictiveCashFlowProps> = ({ transactions, recurringTransactions, currency }) => {
    const { t } = useTranslations();
    const width = 800;
    const height = 400;
    const padding = 60;

    const projectedData = useMemo(() => {
        // 1. Calculate Current Balance
        let currentBalance = transactions.reduce((sum, tx) => sum + (tx.type === 'income' ? tx.amount : -tx.amount), 0);

        // 2. Calculate Average Daily Organic Spend (Excluding recurring) for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentExpenses = transactions.filter(tx =>
            tx.type === 'expense' &&
            new Date(tx.date) >= thirtyDaysAgo &&
            !recurringTransactions.some(rt => tx.description.includes(rt.description)) // Rough heuristic to exclude recurring
        );

        const totalRecentOrganicSpend = recentExpenses.reduce((sum, tx) => sum + tx.amount, 0);
        const avgDailyOrganicSpend = totalRecentOrganicSpend / 30;

        // 3. Project 30 days forward
        const data = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i <= 30; i++) {
            const projectionDate = new Date(today);
            projectionDate.setDate(today.getDate() + i);
            const dateStr = projectionDate.toISOString().split('T')[0];

            if (i > 0) {
                // Apply daily organic spend
                currentBalance -= avgDailyOrganicSpend;

                // Apply expected recurring transactions on this precise day
                recurringTransactions.forEach(rt => {
                    const nextDate = new Date(rt.nextDueDate);
                    nextDate.setHours(0, 0, 0, 0);

                    // Simple logic: if the next due date matches the projection date exactly
                    if (nextDate.getTime() === projectionDate.getTime()) {
                        if (rt.type === 'income') currentBalance += rt.amount;
                        else currentBalance -= rt.amount;
                    }
                    // For a more robust system, we would extrapolate frequencies (monthly, weekly) past their *next* due date
                    // but for a 30-day window, handling just the immediately next due date is usually sufficient.
                });
            }

            data.push({
                date: dateStr,
                balance: currentBalance,
                isToday: i === 0
            });
        }
        return data;
    }, [transactions, recurringTransactions]);

    const maxBalance = Math.max(...projectedData.map(d => d.balance), 0);
    const minBalance = Math.min(...projectedData.map(d => d.balance), 0);
    const chartRange = Math.max(maxBalance - minBalance, 100);

    // Add headroom
    const chartMaxY = maxBalance + (chartRange * 0.1);
    const chartMinY = minBalance - (chartRange * 0.1);

    const xScale = (index: number) => padding + (index / 30) * (width - 2 * padding);
    const yScale = (amount: number) => height - padding - ((amount - chartMinY) / (chartMaxY - chartMinY)) * (height - 2 * padding);

    const linePoints = projectedData.map((d, i) => `${xScale(i)},${yScale(d.balance)}`).join(' ');

    const formatShortDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-us', { month: 'short', day: 'numeric' });
    };

    const zeroLineY = yScale(0);

    return (
        <div className="p-6 bg-secondary/80 backdrop-blur-md shadow-glass rounded-xl border border-gray-800/50 transition-all duration-300 hover:shadow-glow hover:border-gray-700/50 mt-6">
            <h3 className="text-xl font-semibold mb-4 text-light flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
                {t('predictive_cash_flow') || '30-Day Predictive Cash Flow'}
            </h3>
            <p className="text-sm text-medium mb-6">Based on your average daily spend and upcoming scheduled bills.</p>

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                {/* Zero line */}
                {zeroLineY > padding && zeroLineY < height - padding && (
                    <line x1={padding} y1={zeroLineY} x2={width - padding} y2={zeroLineY} stroke="#dc2626" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                )}

                {/* Y-Axis Labels */}
                {[chartMinY, chartMinY + chartRange * 0.25, chartMinY + chartRange * 0.5, chartMinY + chartRange * 0.75, chartMaxY].map((val, i) => (
                    <g key={i}>
                        <line x1={padding} y1={yScale(val)} x2={width - padding} y2={yScale(val)} stroke="#1e293b" />
                        <text x={padding - 10} y={yScale(val) + 4} fill="#64748b" textAnchor="end" fontSize="11">{formatCurrency(val, currency)}</text>
                    </g>
                ))}

                {/* The Projection Line (Dotted to indicate future) */}
                <polyline points={linePoints} fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 6" />

                {/* Gradient Fill under the line */}
                <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                </linearGradient>
                <polygon points={`${xScale(0)},${yScale(chartMinY)} ${linePoints} ${xScale(30)},${yScale(chartMinY)}`} fill="url(#glowGradient)" />


                {/* Nodes & Labels */}
                {projectedData.map((d, i) => {
                    const isEdge = i === 0 || i === 30;
                    const isWeekly = i > 0 && i % 7 === 0;

                    if (isEdge || isWeekly) {
                        return (
                            <g key={i}>
                                <circle cx={xScale(i)} cy={yScale(d.balance)} r={isEdge ? 5 : 3} fill="#0ea5e9" className="drop-shadow-[0_0_5px_rgba(14,165,233,0.8)]" />
                                <text x={xScale(i)} y={height - padding + 20} fill="#94a3b8" textAnchor="middle" fontSize="11">
                                    {isEdge && i === 0 ? 'Today' : formatShortDate(d.date)}
                                </text>
                            </g>
                        );
                    }
                    return null;
                })}
            </svg>
        </div>
    );
};

export default PredictiveCashFlow;
