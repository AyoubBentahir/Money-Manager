import React, { useState, useMemo } from 'react';
import { Transaction, Currency, TransactionType, Budget, RecurringTransaction } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useTranslations } from '../contexts/TranslationContext';
import PredictiveCashFlow from './PredictiveCashFlow';

type GroupByOption = 'day' | 'month' | 'year';

const TrendChart: React.FC<{
    data: { date: string, income: number, expense: number }[],
    currency: Currency,
    groupBy: GroupByOption,
    yAxisInterval?: number | null,
    onYAxisIntervalChange?: (newInterval: number) => void
}> = ({ data, currency, groupBy, yAxisInterval, onYAxisIntervalChange }) => {
    const { t } = useTranslations();
    const width = 800;
    const height = 400;
    const padding = 60; // Increased padding for labels

    const dataMaxAmount = useMemo(() => Math.max(...data.flatMap(d => [d.income, d.expense]), 0), [data]);

    const { chartMaxY, yAxisValues } = useMemo(() => {
        let maxVal: number;
        let axisVals: number[];

        if (yAxisInterval && yAxisInterval > 0) {
            maxVal = Math.ceil(dataMaxAmount / yAxisInterval) * yAxisInterval;
            if (maxVal === 0) {
                maxVal = yAxisInterval;
            }
            const numTicks = Math.round(maxVal / yAxisInterval);
            axisVals = Array.from({ length: numTicks + 1 }, (_, i) => maxVal - i * yAxisInterval);
        } else {
            // New improved auto-scaling logic
            const numTicksGoal = 4;
            if (dataMaxAmount === 0) {
                maxVal = 100;
                axisVals = [100, 75, 50, 25, 0];
            } else {
                const roughInterval = dataMaxAmount / numTicksGoal;
                const exponent = Math.pow(10, Math.floor(Math.log10(roughInterval)));
                const fraction = roughInterval / exponent;

                let niceInterval;
                if (fraction <= 1) niceInterval = 1 * exponent;
                else if (fraction <= 2) niceInterval = 2 * exponent;
                else if (fraction <= 5) niceInterval = 5 * exponent;
                else niceInterval = 10 * exponent;

                maxVal = Math.ceil(dataMaxAmount / niceInterval) * niceInterval;
                if (niceInterval > 0) {
                    const numTicks = Math.ceil(maxVal / niceInterval);
                    axisVals = Array.from({ length: numTicks + 1 }, (_, i) => maxVal - i * niceInterval);
                } else { // Fallback for very small numbers
                    maxVal = dataMaxAmount > 0 ? dataMaxAmount : 1;
                    axisVals = Array.from({ length: 5 }, (_, i) => maxVal * (1 - i / 4));
                }
            }
        }
        return { chartMaxY: maxVal, yAxisValues: axisVals.filter(v => v >= 0) };
    }, [dataMaxAmount, yAxisInterval]);


    const effectiveChartMaxY = chartMaxY === 0 ? 1 : chartMaxY;
    const xScale = (index: number) => padding + (data.length > 1 ? (index / (data.length - 1)) * (width - 2 * padding) : (width - 2 * padding) / 2);
    const yScale = (amount: number) => height - padding - (amount / effectiveChartMaxY) * (height - 2 * padding);

    const incomePoints = data.map((d, i) => `${xScale(i)},${yScale(d.income)}`).join(' ');
    const expensePoints = data.map((d, i) => `${xScale(i)},${yScale(d.expense)}`).join(' ');

    const formatXAxisLabel = (dateKey: string) => {
        if (groupBy === 'year') return dateKey;
        if (groupBy === 'month') {
            const [year, month] = dateKey.split('-');
            return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-us', { month: 'short', year: '2-digit' });
        }
        return new Date(dateKey + 'T00:00:00').toLocaleDateString('en-us', { month: 'short', day: 'numeric' });
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!onYAxisIntervalChange) return;
        e.preventDefault();

        let currentInterval = yAxisInterval;
        if (!currentInterval || currentInterval <= 0) {
            // Estimate a good starting interval if it's auto
            if (chartMaxY > 0 && yAxisValues.length > 1) {
                currentInterval = yAxisValues[0] - yAxisValues[1];
            } else {
                currentInterval = 100;
            }
        }

        const step = Math.max(1, Math.floor(currentInterval * 0.2)); // 20% step

        if (e.deltaY < 0) {
            // Zoom out (increase interval)
            onYAxisIntervalChange(currentInterval + step);
        } else {
            // Zoom in (decrease interval)
            const newInterval = currentInterval - step;
            onYAxisIntervalChange(Math.max(1, newInterval)); // Prevent <= 0
        }
    };

    return (
        <div className="p-6 bg-secondary/80 backdrop-blur-md shadow-glass rounded-xl border border-gray-800/50 transition-all duration-300 hover:shadow-glow hover:border-gray-700/50" onWheel={handleWheel}>
            <h3 className="text-xl font-semibold mb-4 text-light">{t('transaction_trends')}</h3>
            {onYAxisIntervalChange && <p className="text-xs text-medium italic mb-2">Scroll on the chart to adjust the Y-axis scale</p>}
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {/* Y-Axis lines and labels */}
                {yAxisValues.map((value, i) => (
                    <g key={i}>
                        <line x1={padding} y1={yScale(value)} x2={width - padding} y2={yScale(value)} stroke="#30363d" />
                        <text x={padding - 10} y={yScale(value) + 4} fill="#8B949E" textAnchor="end" fontSize="12">{formatCurrency(value, currency)}</text>
                    </g>
                ))}

                {data.length > 1 && <>
                    <polyline points={incomePoints} fill="none" stroke="#22c55e" strokeWidth="2" />
                    <polyline points={expensePoints} fill="none" stroke="#ef4444" strokeWidth="2" />
                </>
                }
                {(() => {
                    const maxLabels = 12;
                    const step = data.length <= maxLabels ? 1 : Math.ceil(data.length / maxLabels);
                    return data.map((d, i) => {
                        const showLabel = i === 0 || i === data.length - 1 || i % step === 0;
                        return (
                            <g key={d.date}>
                                <circle cx={xScale(i)} cy={yScale(d.income)} r="4" fill="#22c55e" />
                                <circle cx={xScale(i)} cy={yScale(d.expense)} r="4" fill="#ef4444" />
                                {showLabel && (
                                    <text
                                        x={xScale(i)}
                                        y={height - padding + 25}
                                        fill="#8B949E"
                                        textAnchor="middle"
                                        fontSize="11"
                                    >
                                        {formatXAxisLabel(d.date)}
                                    </text>
                                )}
                            </g>
                        );
                    });
                })()}
            </svg>
            <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center"><div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>{t('income')}</div>
                <div className="flex items-center"><div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>{t('expense')}</div>
            </div>
        </div>
    );
};


export const Analysis: React.FC<{ transactions: Transaction[], recurringTransactions: RecurringTransaction[], currency: Currency, budgets: Budget[] }> = ({ transactions, recurringTransactions, currency, budgets }) => {
    const { t } = useTranslations();
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [filters, setFilters] = useState({
        startDate: thirtyDaysAgo,
        endDate: today,
        type: 'all' as TransactionType | 'all',
        budgetId: 'all',
        groupBy: 'day' as GroupByOption,
        yAxisInterval: '',
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = new Date(t.date);
            const start = new Date(filters.startDate);
            const end = new Date(filters.endDate);
            const typeMatch = filters.type === 'all' || t.type === filters.type;
            const budgetMatch = filters.budgetId === 'all' || t.budgetId === filters.budgetId;

            return date >= start && date <= end && typeMatch && budgetMatch;
        });
    }, [transactions, filters]);

    const chartData = useMemo(() => {
        const getGroupKey = (dateStr: string): string => {
            const date = new Date(dateStr + 'T00:00:00'); // Use T00:00:00 to treat as local
            if (filters.groupBy === 'month') {
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }
            if (filters.groupBy === 'year') {
                return `${date.getFullYear()}`;
            }
            return dateStr;
        };

        const grouped = filteredTransactions.reduce((acc, t) => {
            const key = getGroupKey(t.date);
            if (!acc[key]) acc[key] = { date: key, income: 0, expense: 0 };
            if (t.type === 'income') acc[key].income += t.amount;
            else acc[key].expense += t.amount;
            return acc;
        }, {} as Record<string, { date: string, income: number, expense: number }>);

        // Fill in missing days if grouping by day
        if (filters.groupBy === 'day') {
            const start = new Date(filters.startDate + 'T00:00:00');
            const end = new Date(filters.endDate + 'T00:00:00');

            // Prevent infinite loops on bad dates
            if (start <= end) {
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const dateStr = d.toISOString().split('T')[0];
                    if (!grouped[dateStr]) {
                        grouped[dateStr] = { date: dateStr, income: 0, expense: 0 };
                    }
                }
            }
        }

        // FIX: Explicitly type 'a' and 'b' to resolve 'unknown' type errors from Object.values().
        return Object.values(grouped).sort((a: { date: string }, b: { date: string }) => {
            if (filters.groupBy === 'year') return a.date.localeCompare(b.date);
            if (filters.groupBy === 'month') return a.date.localeCompare(b.date);
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
    }, [filteredTransactions, filters.groupBy]);

    const yInterval = filters.yAxisInterval ? parseFloat(filters.yAxisInterval) : null;

    return (
        <div className="p-6 bg-transparent min-h-full">
            <h1 className="text-4xl font-bold mb-8 text-light">{t('analysis')}</h1>

            <PredictiveCashFlow transactions={transactions} recurringTransactions={recurringTransactions} currency={currency} />
            <br />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 bg-secondary/80 backdrop-blur-md shadow-glass rounded-xl border border-gray-800/50 transition-all duration-300 hover:shadow-glow hover:border-gray-700/50 p-6 self-start space-y-4">
                    <h3 className="text-xl font-semibold text-light">{t('filters')}</h3>
                    <div>
                        <label htmlFor="startDate" className="block text-medium text-sm font-bold mb-2">{t('start_date')}</label>
                        <input id="startDate" name="startDate" type="date" value={filters.startDate} onChange={handleFilterChange} className="w-full bg-[#0f172a]/50 backdrop-blur-md p-3 rounded-xl border border-gray-700/50 focus:bg-[#0f172a]/80 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200" />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-medium text-sm font-bold mb-2">{t('end_date')}</label>
                        <input id="endDate" name="endDate" type="date" value={filters.endDate} onChange={handleFilterChange} className="w-full bg-[#0f172a]/50 backdrop-blur-md p-3 rounded-xl border border-gray-700/50 focus:bg-[#0f172a]/80 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200" />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-medium text-sm font-bold mb-2">{t('type')}</label>
                        <select id="type" name="type" value={filters.type} onChange={handleFilterChange} className="w-full bg-[#0f172a]/50 backdrop-blur-md p-3 rounded-xl border border-gray-700/50 focus:bg-[#0f172a]/80 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200">
                            <option value="all">{t('all')}</option>
                            <option value="income">{t('income')}</option>
                            <option value="expense">{t('expense')}</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="budgetId" className="block text-medium text-sm font-bold mb-2">{t('budget')}</label>
                        <select id="budgetId" name="budgetId" value={filters.budgetId} onChange={handleFilterChange} className="w-full bg-[#0f172a]/50 backdrop-blur-md p-3 rounded-xl border border-gray-700/50 focus:bg-[#0f172a]/80 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200">
                            <option value="all">{t('all_budgets')}</option>
                            {budgets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="groupBy" className="block text-medium text-sm font-bold mb-2">{t('group_by')}</label>
                        <select id="groupBy" name="groupBy" value={filters.groupBy} onChange={handleFilterChange} className="w-full bg-[#0f172a]/50 backdrop-blur-md p-3 rounded-xl border border-gray-700/50 focus:bg-[#0f172a]/80 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200">
                            <option value="day">{t('day')}</option>
                            <option value="month">{t('month')}</option>
                            <option value="year">{t('year')}</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="yAxisInterval" className="block text-medium text-sm font-bold mb-2">{t('y_axis_interval')}</label>
                        <input
                            id="yAxisInterval"
                            name="yAxisInterval"
                            type="number"
                            min="1"
                            placeholder={t('auto')}
                            value={filters.yAxisInterval}
                            onChange={handleFilterChange}
                            className="w-full bg-[#0f172a]/50 backdrop-blur-md p-3 rounded-xl border border-gray-700/50 focus:bg-[#0f172a]/80 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200"
                        />
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <TrendChart
                        data={chartData}
                        currency={currency}
                        groupBy={filters.groupBy}
                        yAxisInterval={yInterval}
                        onYAxisIntervalChange={(val) => setFilters(prev => ({ ...prev, yAxisInterval: val.toString() }))}
                    />
                </div>
            </div>

            <div className="mt-6 bg-secondary/80 backdrop-blur-md shadow-glass rounded-xl border border-gray-800/50 transition-all duration-300 hover:shadow-glow hover:border-gray-700/50 overflow-hidden">
                <h3 className="text-xl font-semibold p-6 text-light">{t('filtered_transactions')} ({filteredTransactions.length})</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-[#0f172a]/80 backdrop-blur-sm text-medium/80 border-b border-gray-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium uppercase tracking-wider">{t('date')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium uppercase tracking-wider">{t('description')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium uppercase tracking-wider">{t('category')}</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-medium uppercase tracking-wider">{t('amount')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filteredTransactions.map((t) => (
                                <tr key={t.id} className="hover:bg-white/5 transition-all duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium">{formatDate(t.date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light">{t.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium">{t.category}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold font-mono ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                        {formatCurrency(t.amount, currency)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Analysis;