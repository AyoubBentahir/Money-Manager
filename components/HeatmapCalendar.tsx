import React, { useMemo } from 'react';
import { Transaction, Currency } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useTranslations } from '../contexts/TranslationContext';

interface HeatmapCalendarProps {
    transactions: Transaction[];
    currency: Currency;
}

const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ transactions, currency }) => {
    const { t } = useTranslations();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday

    const calendarGrid = useMemo(() => {
        const grid = [];
        // Add empty slots for days before the 1st
        for (let i = 0; i < firstDayOfMonth; i++) {
            grid.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTxs = transactions.filter(tx => tx.date === dateStr);
            const income = dayTxs.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
            const expenses = dayTxs.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
            const net = income - expenses;

            grid.push({
                day,
                dateStr,
                net,
                hasTransactions: dayTxs.length > 0
            });
        }
        return grid;
    }, [transactions, year, month, daysInMonth, firstDayOfMonth]);

    const getColorClass = (net: number, hasTransactions: boolean) => {
        if (!hasTransactions) return 'bg-[#0f172a]/40 border border-gray-800/50';
        if (net > 500) return 'bg-green-500/80 shadow-[0_0_15px_rgba(34,197,94,0.4)] border border-green-400 font-bold';
        if (net > 0) return 'bg-green-500/40 border border-green-500/50';
        if (net === 0) return 'bg-gray-600/40 border border-gray-500/50';
        if (net < -500) return 'bg-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.4)] border border-red-400 font-bold';
        if (net < 0) return 'bg-red-500/40 border border-red-500/50';
        return 'bg-[#0f172a]/40';
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="p-6 bg-secondary/80 backdrop-blur-md shadow-glass rounded-xl border border-gray-800/50 transition-all duration-300 hover:shadow-glow hover:border-gray-700/50">
            <h3 className="text-xl font-semibold mb-4 text-light flex items-center justify-between">
                <span>{t('spending_heatmap') || 'Spending Heatmap'}</span>
                <span className="text-sm font-normal text-medium">{now.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            </h3>

            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs text-medium font-semibold uppercase tracking-wider">
                {weekDays.map(day => <div key={day}>{day}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {calendarGrid.map((cell, idx) => (
                    <div
                        key={idx}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-300 relative group ${cell ? getColorClass(cell.net, cell.hasTransactions) : 'opacity-0'}`}
                    >
                        {cell && (
                            <>
                                <span className={`text-sm ${cell.net !== 0 ? 'text-white' : 'text-medium'}`}>{cell.day}</span>

                                {/* Tooltip */}
                                {cell.hasTransactions && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max px-3 py-2 bg-[#020617] border border-gray-700/80 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 flex border-glow flex-col items-center">
                                        <span className="text-xs text-medium">{cell.dateStr}</span>
                                        <span className={`text-sm font-bold font-mono ${cell.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            Net: {cell.net >= 0 ? '+' : ''}{formatCurrency(cell.net, currency)}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between mt-6 text-xs text-medium">
                <div className="flex items-center gap-2">
                    <span>High Spend</span>
                    <div className="w-4 h-4 rounded-sm bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.4)] border border-red-400"></div>
                    <div className="w-4 h-4 rounded-sm bg-red-500/40 border border-red-500/50"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm bg-green-500/40 border border-green-500/50"></div>
                    <div className="w-4 h-4 rounded-sm bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.4)] border border-green-400"></div>
                    <span>High Saving</span>
                </div>
            </div>
        </div>
    );
};

export default HeatmapCalendar;
