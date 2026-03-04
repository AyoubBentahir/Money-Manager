import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, ExpenseCategory, IncomeCategory, Currency, Budget } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { TrashIcon } from './icons';
import { useTranslations } from '../contexts/TranslationContext';

const ROWS_PER_PAGE = 10;

interface AddTransactionModalProps {
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  budgets: Budget[];
  activeBudgetId: string | null;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose, onAdd, budgets, activeBudgetId }) => {
  const { t } = useTranslations();
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>(ExpenseCategory[0]);
  const [budgetId, setBudgetId] = useState(activeBudgetId || (budgets[0]?.id || ''));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description && amount) {
      const newTransaction: Omit<Transaction, 'id'> = {
        description,
        amount: parseFloat(amount),
        date,
        type,
        category: category as any,
      };
      if (type === 'expense' && budgetId) {
        newTransaction.budgetId = budgetId;
      }
      onAdd(newTransaction);
      onClose();
    }
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === 'expense' ? ExpenseCategory[0] : IncomeCategory[0]);
  };

  const categories = type === 'expense' ? ExpenseCategory : IncomeCategory;

  return (
    <div className="fixed inset-0 bg-primary bg-opacity-75 flex justify-center items-center z-40" onClick={onClose}>
      <div className="bg-secondary rounded-lg shadow-glow border border-gray-800 p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6 text-light">{t('add_new_transaction')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-medium text-sm font-bold mb-2">{t('type')}</label>
            <div className="flex rounded-md shadow-sm">
              <button type="button" onClick={() => handleTypeChange('expense')} className={`px-4 py-2 rounded-l-md w-1/2 ${type === 'expense' ? 'bg-accent text-primary font-bold' : 'bg-primary'}`}>{t('expense')}</button>
              <button type="button" onClick={() => handleTypeChange('income')} className={`px-4 py-2 rounded-r-md w-1/2 ${type === 'income' ? 'bg-accent text-primary font-bold' : 'bg-primary'}`}>{t('income')}</button>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-medium text-sm font-bold mb-2">{t('description')}</label>
            <input id="description" type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-primary p-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent" required />
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-medium text-sm font-bold mb-2">{t('amount')}</label>
            <input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-primary p-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent" required />
          </div>
          {type === 'expense' && budgets.length > 0 && (
            <div className="mb-4">
              <label htmlFor="budget" className="block text-medium text-sm font-bold mb-2">{t('budget')}</label>
              <select id="budget" value={budgetId} onChange={e => setBudgetId(e.target.value)} className="w-full bg-primary p-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent" required>
                {budgets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="category" className="block text-medium text-sm font-bold mb-2">{t('category')}</label>
              <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-primary p-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="date" className="block text-medium text-sm font-bold mb-2">{t('date')}</label>
              <input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-primary p-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent" required />
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


export const Transactions: React.FC<{
  transactions: Transaction[],
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void,
  deleteTransaction: (id: string) => void,
  currency: Currency,
  budgets: Budget[],
  activeBudgetId: string | null,
  externalModalOpen?: boolean,
  onExternalModalClose?: () => void,
}> = ({ transactions, addTransaction, deleteTransaction, currency, budgets, activeBudgetId, externalModalOpen, onExternalModalClose }) => {
  const { t } = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const budgetMap = useMemo(() => new Map(budgets.map(b => [b.id, b.name])), [budgets]);

  const modalOpen = isModalOpen || !!externalModalOpen;
  const closeModal = () => { setIsModalOpen(false); onExternalModalClose?.(); };

  // Filter transactions by search query
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return transactions;
    return transactions.filter(tx =>
      tx.description.toLowerCase().includes(q) ||
      tx.category.toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  // Reset to page 1 whenever the search changes
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="p-6 bg-primary min-h-full">
      {modalOpen && <AddTransactionModal onClose={closeModal} onAdd={addTransaction} budgets={budgets} activeBudgetId={activeBudgetId} />}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-light">{t('all_transactions')}</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-accent hover:bg-accent-hover text-primary font-bold py-2 px-4 rounded-lg shadow-glow">
          {t('add_transaction')} <span className="ml-2 text-xs opacity-60 font-normal">[N]</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          id="transaction-search"
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by description or category..."
          className="w-full bg-secondary p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent text-light placeholder-gray-500"
        />
      </div>

      {/* Table */}
      <div className="bg-secondary shadow-lg rounded-lg border border-gray-800 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-primary">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium uppercase tracking-wider">{t('date')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium uppercase tracking-wider">{t('description')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium uppercase tracking-wider">{t('category')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium uppercase tracking-wider">{t('budget')}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-medium uppercase tracking-wider">{t('amount')}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-medium uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-medium">
                  {searchQuery ? 'No transactions match your search.' : t('no_transactions_prompt')}
                </td>
              </tr>
            ) : (
              paginated.map((tx) => (
                <tr key={tx.id} className="hover:bg-primary transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-medium">{formatDate(tx.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light">{tx.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-medium">{tx.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-medium">{tx.budgetId ? budgetMap.get(tx.budgetId) || 'N/A' : ''}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold font-mono ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount, currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => deleteTransaction(tx.id)} className="text-medium hover:text-red-500">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 text-sm text-medium">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="px-4 py-2 rounded-md bg-secondary border border-gray-700 hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>
          <span className="text-medium">
            Page <span className="text-light font-semibold">{safePage}</span> of <span className="text-light font-semibold">{totalPages}</span>
            <span className="ml-3 text-gray-600">({filtered.length} results)</span>
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="px-4 py-2 rounded-md bg-secondary border border-gray-700 hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Transactions;
