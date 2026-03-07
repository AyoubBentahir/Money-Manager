import React, { useState, useEffect } from 'react';
import { Budget, Transaction, Currency, ExpenseCategory, ExpenseCategoryType, SpendingLimit } from '../types';
import { formatCurrency } from '../utils/formatters';
import { TrashIcon } from './icons';
import { useTranslations } from '../contexts/TranslationContext';
import { useToast } from '../contexts/ToastContext';

const BudgetManager: React.FC<{
    activeBudget: Budget;
    transactions: Transaction[];
    updateBudget: (budget: Budget) => void;
    currency: Currency;
}> = ({ activeBudget, transactions, updateBudget, currency }) => {
    const { t } = useTranslations();
    const [limits, setLimits] = useState<SpendingLimit>(activeBudget.limits);

    useEffect(() => {
        setLimits(activeBudget.limits);
    }, [activeBudget]);

    const totalSpent = transactions
        .filter(tx => tx.type === 'expense' && tx.budgetId === activeBudget.id)
        .reduce((sum, tx) => sum + tx.amount, 0);

    const totalIncome = transactions
        .filter(tx => tx.type === 'income' && tx.budgetId === activeBudget.id)
        .reduce((sum, tx) => sum + tx.amount, 0);

    const effectiveTotalAmount = activeBudget.totalAmount + totalIncome;
    const remaining = effectiveTotalAmount - totalSpent;
    const percentage = effectiveTotalAmount > 0 ? Math.min((totalSpent / effectiveTotalAmount) * 100, 100) : 0;

    const handleLimitChange = (category: ExpenseCategoryType, value: string) => {
        const newLimits = { ...limits, [category]: value === '' ? undefined : parseFloat(value) };
        setLimits(newLimits);
        updateBudget({ ...activeBudget, limits: newLimits });
    };

    return (
        <div className="mt-6">
            <h3 className="text-2xl font-semibold text-light mb-4">{t('set_spending_limits')} <span className="text-accent">{activeBudget.name}</span></h3>

            {/* Total Budget Balance */}
            <div className="bg-[#0f172a]/50 backdrop-blur-sm p-6 shadow-glass rounded-2xl border-gray-800/50 rounded-lg border border-gray-700 mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-medium text-sm font-semibold uppercase tracking-wider">{t('total_budget')}</span>
                    <div className="text-right">
                        <span className="font-mono font-bold text-light text-lg">{formatCurrency(effectiveTotalAmount, currency)}</span>
                        {totalIncome > 0 && (
                            <div className="text-xs text-green-400 mt-1">
                                +{formatCurrency(totalIncome, currency)} {t('income')}
                            </div>
                        )}
                    </div>
                </div>
                <div className="w-full bg-[#0f172a]/50 rounded-full h-3 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)] mb-2">
                    <div
                        className={`h-3 rounded-full transition-all duration-500 ${percentage >= 100 ? 'bg-red-500' : percentage >= 90 ? 'bg-yellow-500' : 'bg-accent'}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <div className="flex justify-between font-mono text-sm mt-1">
                    <span className="text-medium">{t('spent')}: {formatCurrency(totalSpent, currency)}</span>
                    <span className={remaining >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {remaining >= 0
                            ? `${formatCurrency(remaining, currency)} ${t('remaining')}`
                            : `${formatCurrency(Math.abs(remaining), currency)} ${t('over')}`}
                    </span>
                </div>
            </div>

            {/* Per-category limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ExpenseCategory.map(category => (
                    <div key={category} className="bg-[#0f172a]/50 backdrop-blur-sm p-5 shadow-glass rounded-2xl border border-gray-800/50 hover:bg-[#0f172a]/80 transition-all duration-300">
                        <label htmlFor={`limit-${category}`} className="block text-medium text-sm font-bold mb-2">{category}</label>
                        <input
                            id={`limit-${category}`}
                            type="number"
                            min="0"
                            placeholder={t('no_limit')}
                            value={limits[category] || ''}
                            onChange={e => handleLimitChange(category, e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === '-' || e.key === 'e') {
                                    e.preventDefault();
                                }
                            }}
                            className="w-full bg-secondary p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-accent font-mono"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export const Budgets: React.FC<{
    budgets: Budget[];
    transactions: Transaction[];
    activeBudgetId: string | null;
    setActiveBudgetId: (id: string) => void;
    addBudget: (name: string, totalAmount: number) => void;
    deleteBudget: (id: string) => void;
    updateBudget: (budget: Budget) => void;
    currency: Currency;
}> = ({ budgets, transactions, activeBudgetId, setActiveBudgetId, addBudget, deleteBudget, updateBudget, currency }) => {
    const { t } = useTranslations();
    const { confirm, showToast } = useToast();
    const [newBudgetName, setNewBudgetName] = useState('');
    const [newBudgetAmount, setNewBudgetAmount] = useState('');
    const [editingName, setEditingName] = useState('');
    const activeBudget = budgets.find(b => b.id === activeBudgetId);

    useEffect(() => {
        if (activeBudget) {
            setEditingName(activeBudget.name);
        }
    }, [activeBudget]);


    const handleAddBudget = () => {
        const amount = parseFloat(newBudgetAmount);
        if (newBudgetName.trim() && !isNaN(amount) && amount > 0) {
            addBudget(newBudgetName.trim(), amount);
            showToast(`Budget "${newBudgetName.trim()}" created!`, 'success');
            setNewBudgetName('');
            setNewBudgetAmount('');
        }
    };

    const handleDeleteBudget = async () => {
        if (activeBudgetId) {
            const ok = await confirm(t('delete_budget_confirmation'));
            if (ok) { deleteBudget(activeBudgetId); showToast('Budget deleted.', 'warning'); }
        }
    }

    const handleRenameBudget = () => {
        if (editingName.trim() && activeBudget && editingName.trim() !== activeBudget.name) {
            updateBudget({ ...activeBudget, name: editingName.trim() });
        }
    }

    return (
        <div className="p-6 bg-transparent min-h-full">
            <h1 className="text-4xl font-bold mb-8 text-light">{t('budget_management')}</h1>

            <div className="bg-secondary p-6 rounded-lg border border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {/* Column 1: Active Budget Selection */}
                    <div className="md:col-span-1">
                        <h2 className="text-xl font-semibold text-light mb-2">{t('select_active_budget')}</h2>
                        {budgets.length > 0 ? (
                            <>
                                <select
                                    value={activeBudgetId || ''}
                                    onChange={e => setActiveBudgetId(e.target.value)}
                                    className="w-full bg-[#0f172a]/50 backdrop-blur-sm p-3 rounded-xl border border-gray-700/50 focus:bg-[#0f172a]/80 focus:outline-none focus:ring-2 focus:ring-accent mb-4"
                                >
                                    {budgets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                                {activeBudgetId && (
                                    <button onClick={handleDeleteBudget} className="w-full flex items-center justify-center p-2 text-red-400 hover:bg-red-900 hover:text-light rounded-md transition-colors">
                                        <TrashIcon className="h-4 w-4 mr-2" /> {t('delete_selected_budget')}
                                    </button>
                                )}
                            </>
                        ) : (
                            <p className="text-medium mt-2">{t('no_budgets_created')}</p>
                        )}
                    </div>
                    {/* Column 2: Create New Budget */}
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-semibold text-light mb-2">{t('create_new_budget')}</h2>
                        <div className="flex flex-col gap-2">
                            <input
                                type="text"
                                value={newBudgetName}
                                onChange={e => setNewBudgetName(e.target.value)}
                                placeholder={t('eg_vacation_fund')}
                                className="bg-[#0f172a]/50 backdrop-blur-sm p-3 rounded-xl border border-gray-700/50 focus:bg-[#0f172a]/80 focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={newBudgetAmount}
                                    onChange={e => setNewBudgetAmount(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === '-' || e.key === 'e') {
                                            e.preventDefault();
                                        }
                                    }}
                                    placeholder={t('initial_budget_amount')}
                                    className="flex-grow bg-[#0f172a]/50 backdrop-blur-sm p-3 rounded-xl border border-gray-700/50 focus:bg-[#0f172a]/80 focus:outline-none focus:ring-2 focus:ring-accent font-mono"
                                />
                                <button
                                    onClick={handleAddBudget}
                                    disabled={!newBudgetName.trim() || !newBudgetAmount || parseFloat(newBudgetAmount) <= 0}
                                    className="bg-accent hover:bg-accent-hover text-primary font-bold py-2 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >{t('create')}</button>
                            </div>
                        </div>
                    </div>
                </div>

                {activeBudget && (
                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <h2 className="text-xl font-semibold text-light mb-2">{t('rename_budget')}</h2>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={editingName}
                                onChange={e => setEditingName(e.target.value)}
                                className="flex-grow bg-[#0f172a]/50 backdrop-blur-sm p-3 rounded-xl border border-gray-700/50 focus:bg-[#0f172a]/80 focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                            <button onClick={handleRenameBudget} className="bg-accent hover:bg-accent-hover text-primary font-bold py-2 px-6 rounded-md">{t('save_name')}</button>
                        </div>
                    </div>
                )}


                {activeBudget ? (
                    <BudgetManager activeBudget={activeBudget} transactions={transactions} updateBudget={updateBudget} currency={currency} />
                ) : (
                    <p className="mt-6 text-center text-medium">{t('no_budgets_available')}</p>
                )}
            </div>
        </div>
    );
};

export default Budgets;
