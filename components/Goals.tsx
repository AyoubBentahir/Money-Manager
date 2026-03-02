import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Goal, Currency } from '../types';
import { useTranslations } from '../contexts/TranslationContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { TrashIcon, TargetIcon } from './icons';

// ─── Priority Types ──────────────────────────────────────────────────────────
type Priority = 'high' | 'medium' | 'low';

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string }> = {
    high: { label: 'High', color: 'text-red-400', dot: 'bg-red-500' },
    medium: { label: 'Medium', color: 'text-yellow-400', dot: 'bg-yellow-500' },
    low: { label: 'Low', color: 'text-green-400', dot: 'bg-green-500' },
};

// ─── Milestone thresholds ────────────────────────────────────────────────────
const MILESTONES = [25, 50, 75, 100];
const MILESTONE_COLORS: Record<number, string> = {
    25: 'bg-blue-500',
    50: 'bg-yellow-500',
    75: 'bg-orange-500',
    100: 'bg-green-500',
};

// ─── Confetti ────────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function randomBetween(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);

    useEffect(() => {
        if (!active || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const particles = Array.from({ length: 80 }, () => ({
            x: randomBetween(0, canvas.width),
            y: randomBetween(-canvas.height, 0),
            w: randomBetween(6, 12),
            h: randomBetween(6, 12),
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            speed: randomBetween(2, 5),
            angle: randomBetween(0, Math.PI * 2),
            spin: randomBetween(-0.1, 0.1),
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.y += p.speed;
                p.angle += p.spin;
                if (p.y > canvas.height) { p.y = -20; p.x = randomBetween(0, canvas.width); }
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            });
            animRef.current = requestAnimationFrame(draw);
        };

        draw();
        const timeout = setTimeout(() => cancelAnimationFrame(animRef.current), 3000);
        return () => { cancelAnimationFrame(animRef.current); clearTimeout(timeout); };
    }, [active]);

    if (!active) return null;
    return (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none rounded-lg" style={{ zIndex: 10 }} />
    );
};

// ─── Modals ──────────────────────────────────────────────────────────────────
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
            onSave({ name, targetAmount: parseFloat(targetAmount), targetDate });
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
    );
};

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
        const v = parseFloat(amount);
        if (v > 0) { onContribute(v); onClose(); }
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
    );
};

// ─── GoalCard ────────────────────────────────────────────────────────────────
const GoalCard: React.FC<{
    goal: Goal;
    onContribute: (id: string, amount: number) => void;
    onDelete: (id: string) => void;
    currency: Currency;
}> = ({ goal, onContribute, onDelete, currency }) => {
    const { t } = useTranslations();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    // Feature 1: Priority state (persisted locally per card via state)
    const [priority, setPriority] = useState<Priority>('medium');
    const prevPercentageRef = useRef(0);

    const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

    // Feature: Confetti when first reaching 100%
    useEffect(() => {
        if (percentage >= 100 && prevPercentageRef.current < 100) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3500);
        }
        prevPercentageRef.current = percentage;
    }, [percentage]);

    // Feature: Estimated completion date
    const estimatedCompletion = useMemo(() => {
        const remaining = goal.targetAmount - goal.currentAmount;
        if (remaining <= 0 || goal.currentAmount <= 0) return null;
        const dailyRate = goal.currentAmount / 30;
        if (dailyRate <= 0) return null;
        const daysNeeded = remaining / dailyRate;
        const estDate = new Date(Date.now() + daysNeeded * 24 * 60 * 60 * 1000);
        return estDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }, [goal.currentAmount, goal.targetAmount]);

    // Feature 3: Days remaining countdown
    const daysRemaining = useMemo(() => {
        const diff = new Date(goal.targetDate).getTime() - Date.now();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }, [goal.targetDate]);

    const daysColor = daysRemaining > 30 ? 'text-green-400' : daysRemaining > 7 ? 'text-yellow-400' : 'text-red-400';

    // Feature 4: Milestones achieved
    const achievedMilestones = MILESTONES.filter(m => percentage >= m);
    const latestMilestone = achievedMilestones[achievedMilestones.length - 1];

    const handleContribute = (amount: number) => onContribute(goal.id, amount);
    const handleDelete = () => {
        if (window.confirm(t('delete_goal_confirmation'))) onDelete(goal.id);
    };

    const priorityCfg = PRIORITY_CONFIG[priority];

    return (
        <div className="relative bg-secondary rounded-lg border border-gray-800 p-6 flex flex-col overflow-hidden">
            <Confetti active={showConfetti} />
            {isModalOpen && <ContributionModal onClose={() => setIsModalOpen(false)} onContribute={handleContribute} goalName={goal.name} />}

            {/* Header row: name + priority badge + delete */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-light truncate">{goal.name}</h3>
                    {/* Feature 1: Priority Badge */}
                    <div className="relative group flex-shrink-0">
                        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border border-gray-700 cursor-pointer ${priorityCfg.color}`}>
                            <span className={`w-2 h-2 rounded-full ${priorityCfg.dot}`} />
                            {priorityCfg.label}
                        </span>
                        {/* Dropdown on hover */}
                        <div className="absolute hidden group-hover:flex flex-col bg-secondary border border-gray-700 rounded-lg shadow-xl z-20 top-full mt-1 left-0 min-w-max">
                            {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([key, cfg]) => (
                                <button
                                    key={key}
                                    onClick={() => setPriority(key)}
                                    className={`flex items-center gap-2 px-3 py-2 text-xs hover:bg-primary transition-colors ${cfg.color}`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                    {cfg.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <button onClick={handleDelete} className="text-medium hover:text-red-500 flex-shrink-0 ml-2">
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Feature 3: Days remaining countdown */}
            <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-medium">{t('target_date')}: {formatDate(goal.targetDate)}</p>
                {percentage < 100 && (
                    <span className={`text-xs font-bold ${daysColor}`}>
                        {daysRemaining > 0 ? `${daysRemaining}d left` : 'Overdue!'}
                    </span>
                )}
            </div>

            {/* Estimated completion */}
            {estimatedCompletion && percentage < 100 && (
                <p className="text-xs text-accent mb-2">✦ Est. completion: <span className="font-semibold">{estimatedCompletion}</span></p>
            )}
            {percentage >= 100 && (
                <p className="text-xs text-green-400 font-bold mb-2">🎉 Goal Achieved!</p>
            )}

            {/* Progress bar */}
            <div className="w-full bg-primary rounded-full h-4 border border-gray-700 mb-1 relative">
                <div
                    className={`h-4 rounded-full transition-all duration-500 ${percentage >= 100 ? 'bg-green-500' : 'bg-accent'}`}
                    style={{ width: `${percentage}%` }}
                />
                {/* Feature 4: Milestone markers */}
                {MILESTONES.filter(m => m < 100).map(m => (
                    <div
                        key={m}
                        title={`${m}% milestone`}
                        className={`absolute top-0 h-4 w-1 rounded-full transition-all duration-300 ${percentage >= m ? MILESTONE_COLORS[m] : 'bg-gray-600'}`}
                        style={{ left: `calc(${m}% - 2px)` }}
                    />
                ))}
            </div>

            {/* Feature 4: Milestone badges row */}
            <div className="flex gap-1 mb-3">
                {MILESTONES.map(m => (
                    <span
                        key={m}
                        className={`text-xs font-bold px-1.5 py-0.5 rounded transition-all duration-300 ${percentage >= m ? `${MILESTONE_COLORS[m]} text-white` : 'bg-gray-800 text-gray-600'}`}
                    >
                        {m}%
                    </span>
                ))}
                {latestMilestone && latestMilestone < 100 && (
                    <span className="text-xs text-accent ml-auto animate-pulse">★ {latestMilestone}% reached!</span>
                )}
            </div>

            <div className="text-sm font-mono text-medium mb-4">
                <span className="text-light font-semibold">{formatCurrency(goal.currentAmount, currency)}</span> {t('saved_of')} {formatCurrency(goal.targetAmount, currency)}
                <span className="ml-2 text-xs">({percentage.toFixed(0)}%)</span>
            </div>

            <button onClick={() => setIsModalOpen(true)} className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-2 px-4 rounded-md">
                {t('contribute')}
            </button>
        </div>
    );
};


// ─── Goals Page ──────────────────────────────────────────────────────────────
export const Goals: React.FC<{
    goals: Goal[];
    addGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
    updateGoal: (goal: Goal) => void;
    deleteGoal: (id: string) => void;
    addContributionToGoal: (id: string, amount: number) => void;
    currency: Currency;
}> = ({ goals, addGoal, updateGoal: _updateGoal, deleteGoal, addContributionToGoal, currency }) => {
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
