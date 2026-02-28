import React, { useState, useMemo } from 'react';
import { Goal, Currency } from '../types';
import { useTranslations } from '../contexts/TranslationContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { TrashIcon, TargetIcon } from './icons';

interface GoalModalProps {
    onClose: () => void;
    onSave: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
    goal?: Goal;
}

const GoalModal: React.FC<GoalModalProps> = ({ onClose, onSave, goal }) => {
    const { t } = useTranslations();
    const [name, setName] = useState(goal?.name || '');
    const [targetAmount, setTargetAmount] = useState(goal ? String(goal.targetAmount) : '');
    const [targetDate, setTargetDate] = useState(goal?.targetDate || new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && targetAmount && targetDate) {
            onSave({
                name,
                targetAmount: parseFloat(targetAmount),
                targetDate,
            });
            onClose();
        }
    };
    
    return (
        <div className="fixed inset-0 bg-primary bg-opacity-75 flex justify-center items-center z-40" onClick={onClose}>
            <div className="bg-secondary rounded-lg shadow-glow border border-gray-800 p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-light">{t('new_goal')}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-medium text-sm font-bold mb-2">{t('goal_name')}</label>
                        <input id="name" type="text" value={name} placeholder={t('eg_new_laptop')} onChange={e => setName(e.target.value)} className="w-full bg-primary p-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label htmlFor="targetAmount" className="block text-medium text-sm font-bold mb-2">{t('target_amount')}</label>
                            <input id="targetAmount" type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="w-full bg-primary p-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent" required />
                        </div>
                        <div>
                            <label htmlFor="targetDate" className="block text-medium text-sm font-bold mb-2">{t('target_date')}</label>
                            <input id="targetDate" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="w-full bg-primary p-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent" required />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-light font-bold py-2 px-4 rounded-md">{t('cancel')}</button>
                        <button type="submit" className="bg-accent hover:bg-accent-hover text-primary font-bold py-2 px-4 rounded-md">{t('add')}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

interface ContributionModalProps {
    onClose: () => void;
    onContribute: (amount: number) => void;
    goalName: string;
}

const ContributionModal: React.FC<ContributionModalProps> = ({ onClose, onContribute, goalName }) => {
    const { t } = useTranslations();
    const [amount, setAmount] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const contributionAmount = parseFloat(amount);
        if (contributionAmount > 0) {
            onContribute(contributionAmount);
            onClose();
        }
    };

    return (
         <div className="fixed inset-0 bg-primary bg-opacity-75 flex justify-center items-center z-40" onClick={onClose}>
            <div className="bg-secondary rounded-lg shadow-glow border border-gray-800 p-8 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-2 text-light">{t('add_contribution')}</h2>
                <p className="text-medium mb-6">{t('to')} <span className="font-semibold text-accent">{goalName}</span></p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="contributionAmount" className="block text-medium text-sm font-bold mb-2">{t('contribution_amount')}</label>
                        <input id="contributionAmount" type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-primary p-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent" required autoFocus />
                    </div>
                     <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-light font-bold py-2 px-4 rounded-md">{t('cancel')}</button>
                        <button type="submit" className="bg-accent hover:bg-accent-hover text-primary font-bold py-2 px-4 rounded-md">{t('add')}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const GoalCard: React.FC<{ goal: Goal, onContribute: (id: string, amount: number) => void, onDelete: (id: string) => void, currency: Currency }> = ({ goal, onContribute, onDelete, currency }) => {
    const { t } = useTranslations();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    
    const handleContribute = (amount: number) => {
        onContribute(goal.id, amount);
    };

    const handleDelete = () => {
        if (window.confirm(t('delete_goal_confirmation'))) {
            onDelete(goal.id);
        }
    }

    return (
        <div className="bg-secondary rounded-lg border border-gray-800 p-6 flex flex-col">
            {isModalOpen && <ContributionModal onClose={() => setIsModalOpen(false)} onContribute={handleContribute} goalName={goal.name} />}
            <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-light">{goal.name}</h3>
                     <button onClick={handleDelete} className="text-medium hover:text-red-500">
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
                <p className="text-sm text-medium mb-4">{t('target_date')}: {formatDate(goal.targetDate)}</p>
                
                <div className="w-full bg-primary rounded-full h-4 border border-gray-700 mb-2">
                    <div
                        className="bg-accent h-4 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
                <div className="text-sm font-mono text-medium">
                    <span className="text-light font-semibold">{formatCurrency(goal.currentAmount, currency)}</span> {t('saved_of')} {formatCurrency(goal.targetAmount, currency)}
                </div>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="mt-6 w-full bg-accent hover:bg-accent-hover text-primary font-bold py-2 px-4 rounded-md">
                {t('contribute')}
            </button>
        </div>
    )
}


export const Goals: React.FC<{
    goals: Goal[],
    addGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void,
    updateGoal: (goal: Goal) => void,
    deleteGoal: (id: string) => void,
    addContributionToGoal: (id: string, amount: number) => void,
    currency: Currency,
}> = ({ goals, addGoal, updateGoal, deleteGoal, addContributionToGoal, currency }) => {
    const { t } = useTranslations();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="p-6 bg-primary min-h-full">
            {isModalOpen && <GoalModal onClose={() => setIsModalOpen(false)} onSave={addGoal} />}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-light">{t('goal_management')}</h1>
                <button onClick={() => setIsModalOpen(true)} className="bg-accent hover:bg-accent-hover text-primary font-bold py-2 px-4 rounded-lg shadow-glow">
                    {t('add_goal')}
                </button>
            </div>

            {goals.length === 0 ? (
                <div className="text-center py-20 bg-secondary rounded-lg border border-gray-800">
                    <TargetIcon className="h-16 w-16 mx-auto text-medium mb-4" />
                    <h2 className="text-2xl font-semibold text-light mb-2">{t('no_goals_yet')}</h2>
                    <p className="text-medium">{t('no_goals_prompt')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => (
                        <GoalCard key={goal.id} goal={goal} onContribute={addContributionToGoal} onDelete={deleteGoal} currency={currency} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Goals;
