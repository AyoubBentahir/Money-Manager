import React, { useState } from 'react';
import { RecurringTransaction, TransactionType, ExpenseCategory, IncomeCategory, Currency, Budget, Frequency } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { TrashIcon } from './icons';
import { useTranslations } from '../contexts/TranslationContext';

interface AddRecurringModalProps {
  onClose: () => void;
  onAdd: (transaction: Omit<RecurringTransaction, 'id' | 'nextDueDate'>) => void;
  budgets: Budget[];
}

const AddRecurringModal: React.FC<AddRecurringModalProps> = ({ onClose, onAdd, budgets }) => {
  const { t } = useTranslations();
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>(ExpenseCategory[0]);
  const [budgetId, setBudgetId] = useState(budgets[0]?.id || '');
  const [frequency, setFrequency] = useState<Frequency>('monthly');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description && amount) {
      const newRecTransaction: Omit<RecurringTransaction, 'id' | 'nextDueDate'> = {
        description,
        amount: parseFloat(amount),
        startDate,
        type,
        category: category as any,
        frequency,
      };
      if (type === 'expense' && budgetId) {
        newRecTransaction.budgetId = budgetId;
      }
      onAdd(newRecTransaction);
      onClose();
    }
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === 'expense' ? ExpenseCategory[0] : IncomeCategory[0]);
  };

  const categories = type === 'expense' ? ExpenseCategory : IncomeCategory;

  return (
    <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm flex justify-center items-center z-40" onClick={onClose}>
      <div className="bg-secondary/80 backdrop-blur-md shadow-glass rounded-xl border border-gray-800/50 transition-all duration-300 hover:shadow-glow hover:border-gray-700/50 p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6 text-light">{t('add_recurring_transaction')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-medium text-sm font-bold mb-2">{t('type')}</label>
            <div className="flex rounded-md shadow-sm">
              <button type="button" onClick={() => handleTypeChange('expense')} className={`px-4 py-2 rounded-l-md w-1/2 ${type === 'expense' ? 'bg-accent text-primary font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-[#0f172a]/80 text-medium hover:bg-[#0f172a]'} transition-all`}>{t('expense')}</button>
              <button type="button" onClick={() => handleTypeChange('income')} className={`px-4 py-2 rounded-r-md w-1/2 ${type === 'income' ? 'bg-accent text-primary font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-[#0f172a]/80 text-medium hover:bg-[#0f172a]'} transition-all`}>{t('income')}</button>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-medium text-sm font-bold mb-2">{t('description')}</label>
            <input id="description" type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-[#0f172a]/50 backdrop-blur-md p-3 rounded-xl border border-gray-700/50 focus:bg-[#0f172a]/80 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200" required />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="amount" className="block text-medium text-sm font-bold mb-2">{t('amount')}</label>
              <input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-[#0f172a]/50 backdrop-blur-md p-3 rounded-xl border border-gray-700/50 focus:bg-[#0f172a]/80 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200" required />
            </div>
            <div>
              <label htmlFor="frequency" className="block text-medium text-sm font-bold mb-2">{t('frequency')}</label>
              <select id="frequency" value={frequency} onChange={e => setFrequency(e.target.value as Frequency)} className="w-full bg-[#0f172a]/50 backdrop-blur-md p-3 rounded-xl border border-gray-700/50 focus:bg-[#0f172a]/80 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200">
                <option value="daily">{t('daily')}</option>
                <option value="weekly">{t('weekly')}</option>
                <option value="monthly">{t('monthly')}</option>
                <option value="yearly">{t('yearly')}</option>
              </select>
            </div>
          </div>
          {budgets.length > 0 && (
            <div className="mb-4">
              <label htmlFor="budget" className="block text-medium text-sm font-bold mb-2">{t('budget')}</label>
              <select id="budget" value={budgetId} onChange={e => setBudgetId(e.target.value)} className="w-full bg-[#0f172a]/50 backdrop-blur-md p-3 rounded-xl border border-gray-700/50 focus:bg-[#0f172a]/80 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200">
                {budgets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="category" className="block text-medium text-sm font-bold mb-2">{t('category')}</label>
              <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#0f172a]/50 backdrop-blur-md p-3 rounded-xl border border-gray-700/50 focus:bg-[#0f172a]/80 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="startDate" className="block text-medium text-sm font-bold mb-2">{t('start_date_label')}</label>
              <input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-[#0f172a]/50 backdrop-blur-md p-3 rounded-xl border border-gray-700/50 focus:bg-[#0f172a]/80 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200" required />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-light font-bold py-2 px-4 rounded-md">{t('cancel')}</button>
            <button type="submit" className="bg-accent hover:bg-accent-hover text-primary font-bold py-2 px-4 rounded-md">{t('add')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


export const Recurring: React.FC<{
  recurringTransactions: RecurringTransaction[],
  addRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id' | 'nextDueDate'>) => void,
  deleteRecurringTransaction: (id: string) => void,
  currency: Currency,
  budgets: Budget[],
}> = ({ recurringTransactions, addRecurringTransaction, deleteRecurringTransaction, currency, budgets }) => {
  const { t } = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);


  return (
    <div className="p-6 bg-transparent min-h-full">
      {isModalOpen && <AddRecurringModal onClose={() => setIsModalOpen(false)} onAdd={addRecurringTransaction} budgets={budgets} />}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-light">{t('recurring_transactions')}</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-accent hover:bg-accent-hover text-primary font-bold py-2 px-4 rounded-lg shadow-glow">
          {t('add_recurring_transaction')}
        </button>
      </div>
      <div className="bg-secondary/80 backdrop-blur-md shadow-glass rounded-xl border border-gray-800/50 transition-all duration-300 hover:shadow-glow hover:border-gray-700/50 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-[#0f172a]/80 backdrop-blur-sm text-medium/80 border-b border-gray-700/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium uppercase tracking-wider">{t('description')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium uppercase tracking-wider">{t('category')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium uppercase tracking-wider">{t('frequency')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium uppercase tracking-wider">{t('next_due_date')}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-medium uppercase tracking-wider">{t('amount')}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-medium uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {recurringTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-medium">
                  {t('no_recurring_transactions_prompt')}
                </td>
              </tr>
            ) : (
              recurringTransactions.map((rt) => (
                <tr key={rt.id} className="hover:bg-white/5 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light">{rt.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-medium">{rt.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-medium capitalize">{t(rt.frequency)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-medium">
                    {(() => {
                      const today = new Date(); today.setHours(0, 0, 0, 0);
                      const due = new Date(rt.nextDueDate + 'T00:00:00');
                      const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
                      const color = diffDays < 0 ? 'bg-red-900 text-red-300' : diffDays <= 3 ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300';
                      const label = diffDays < 0 ? `${Math.abs(diffDays)}d overdue` : diffDays === 0 ? 'Due today' : `in ${diffDays}d`;
                      return (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
                          <span>{formatDate(rt.nextDueDate)}</span>
                          <span className="opacity-80">·</span>
                          <span>{label}</span>
                        </span>
                      );
                    })()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold font-mono ${rt.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {rt.type === 'income' ? '+' : '-'} {formatCurrency(rt.amount, currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => deleteRecurringTransaction(rt.id)} className="text-medium hover:text-red-500">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Recurring;
