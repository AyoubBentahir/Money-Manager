import React, { useMemo } from 'react';
import { Transaction, Budget } from '../types';
import { TargetIcon } from './icons';

interface AchievementProps {
    transactions: Transaction[];
    budgets: Budget[];
}

interface BadgeDef {
    id: string;
    title: string;
    description: string;
    icon: string;
    colorClass: string;
    unlocked: boolean;
}

const Achievements: React.FC<AchievementProps> = ({ transactions, budgets }) => {
    const badges = useMemo<BadgeDef[]>(() => {
        const hasTransactions = transactions.length > 0;
        const hasBudget = budgets.length > 0;

        // Count distinct days of transactions
        const distinctDays = new Set(transactions.map(t => t.date)).size;

        // Total Income
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

        return [
            {
                id: 'first-step',
                title: 'First Step',
                description: 'Added your first transaction.',
                icon: '🚀',
                colorClass: 'from-blue-500/20 to-blue-600/20 border-blue-500/50 text-blue-400',
                unlocked: hasTransactions
            },
            {
                id: 'planner',
                title: 'Planner',
                description: 'Created your first budget.',
                icon: '📋',
                colorClass: 'from-purple-500/20 to-purple-600/20 border-purple-500/50 text-purple-400',
                unlocked: hasBudget
            },
            {
                id: 'dedicated',
                title: 'Dedicated Track',
                description: 'Logged transactions on 7 different days.',
                icon: '🔥',
                colorClass: 'from-orange-500/20 to-orange-600/20 border-orange-500/50 text-orange-400',
                unlocked: distinctDays >= 7
            },
            {
                id: 'rainmaker',
                title: 'Rainmaker',
                description: 'Logged over 5,000 in income.',
                icon: '💰',
                colorClass: 'from-green-500/20 to-green-600/20 border-green-500/50 text-green-400',
                unlocked: totalIncome >= 5000
            }
        ];
    }, [transactions, budgets]);

    const unlockedCount = badges.filter(b => b.unlocked).length;

    return (
        <div className="p-6 bg-secondary/80 backdrop-blur-md shadow-glass rounded-xl border border-gray-800/50 transition-all duration-300 hover:shadow-glow hover:border-gray-700/50 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-light flex items-center gap-2">
                    <TargetIcon className="w-5 h-5 text-accent" />
                    Achievements
                </h3>
                <span className="text-sm font-mono text-medium bg-[#0f172a] px-3 py-1 rounded-full border border-gray-700">
                    {unlockedCount} / {badges.length} Unlocked
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map(badge => (
                    <div
                        key={badge.id}
                        className={`relative p-4 rounded-xl border ${badge.unlocked ? `bg-gradient-to-br ${badge.colorClass} shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] shadow-glow` : 'bg-[#0f172a]/40 border-gray-800/50 grayscale opacity-60'} transition-all duration-300 flex items-start gap-3 overflow-hidden group`}
                    >
                        {badge.unlocked && (
                            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] group-hover:animate-shine pointer-events-none" />
                        )}
                        <div className="text-3xl filter drop-shadow-md">{badge.icon}</div>
                        <div>
                            <h4 className={`text-sm font-bold ${badge.unlocked ? 'text-light' : 'text-gray-500'}`}>{badge.title}</h4>
                            <p className="text-xs text-medium line-clamp-2 mt-0.5">{badge.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Achievements;
