import React from 'react';
import { Transaction, Currency } from '../types';
import { formatCurrency } from '../utils/formatters';

export const IncomeExpenseChart: React.FC<{ transactions: Transaction[], currency: Currency }> = ({ transactions, currency }) => {
  const { totalIncome, totalExpense } = transactions.reduce(
    (acc, t) => {
      if (t.type === 'income') {
        acc.totalIncome += t.amount;
      } else {
        acc.totalExpense += t.amount;
      }
      return acc;
    },
    { totalIncome: 0, totalExpense: 0 }
  );

  const max = Math.max(totalIncome, totalExpense, 1);
  const incomePercentage = (totalIncome / max) * 100;
  const expensePercentage = (totalExpense / max) * 100;

  return (
    <div className="p-6 bg-secondary/80 backdrop-blur-md shadow-glass rounded-xl border border-gray-800/50 transition-all duration-300 hover:shadow-glow hover:border-gray-700/50">
      <h3 className="text-xl font-semibold mb-6 text-light">Income vs. Expense</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-green-400">Income</span>
            <span className="text-sm font-medium font-mono text-green-400">{formatCurrency(totalIncome, currency)}</span>
          </div>
          <div className="w-full bg-[#0f172a]/50 rounded-full h-4 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
            <div
              className="bg-green-500 h-full rounded-full"
              style={{ width: `${incomePercentage}%` }}
            ></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-red-400">Expense</span>
            <span className="text-sm font-medium font-mono text-red-400">{formatCurrency(totalExpense, currency)}</span>
          </div>
          <div className="w-full bg-[#0f172a]/50 rounded-full h-4 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
            <div
              className="bg-red-500 h-full rounded-full"
              style={{ width: `${expensePercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeExpenseChart;
