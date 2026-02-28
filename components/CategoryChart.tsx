import React from 'react';
import { Transaction, Currency } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useTranslations } from '../contexts/TranslationContext';

const COLORS = ['#38BDF8', '#34D399', '#FBBF24', '#F87171', '#60A5FA', '#A78BFA', '#F472B6'];
const getCategoryColor = (category: string) => {
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % COLORS.length);
    return COLORS[index];
}

export const CategoryChart: React.FC<{ transactions: Transaction[], currency: Currency }> = ({ transactions, currency }) => {
  const { t } = useTranslations();
  const expenseByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // FIX: Cast the result of Object.entries to ensure correct types for sorting and mapping.
  const sortedCategories = (Object.entries(expenseByCategory) as [string, number][])
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Show top 5 categories

  const maxExpense = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;

  return (
    <div className="p-6 bg-secondary rounded-lg border border-gray-800">
      <h3 className="text-xl font-semibold mb-4 text-light">{t('top_5_spending_categories')}</h3>
      {sortedCategories.length === 0 ? (
        <p className="text-medium">{t('no_expense_data')}</p>
      ) : (
        <div className="space-y-4">
          {sortedCategories.map(([category, amount]) => (
            <div key={category}>
              <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-medium text-light">{category}</span>
                <span className="font-mono text-medium">{formatCurrency(amount, currency)}</span>
              </div>
              <div className="w-full bg-primary rounded-full h-2.5 border border-gray-700">
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: `${(amount / maxExpense) * 100}%`,
                    backgroundColor: getCategoryColor(category),
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryChart;