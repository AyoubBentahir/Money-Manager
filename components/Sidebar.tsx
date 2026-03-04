import React, { useMemo } from 'react';
import { Currency, CURRENCIES, View, LANGUAGES, Language, NavItem } from '../types';
import { ImportIcon, ExportIcon, CurrencyIcon, HomeIcon, ListIcon, AnalysisIcon, BudgetIcon, SparklesIcon, LanguageIcon, RecurringIcon, TargetIcon } from './icons';
import { useTranslations } from '../contexts/TranslationContext';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onImport: () => void;
  onExport: () => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onImport, onExport, currency, setCurrency }) => {
  const { t, language, setLanguage } = useTranslations();
  const { theme, toggleTheme } = useTheme();

  const navItems: NavItem[] = useMemo(() => [
    { name: t('dashboard'), view: View.Dashboard, icon: HomeIcon },
    { name: t('transactions'), view: View.Transactions, icon: ListIcon },
    { name: t('recurring'), view: View.Recurring, icon: RecurringIcon },
    { name: t('analysis'), view: View.Analysis, icon: AnalysisIcon },
    { name: t('budgets'), view: View.Budgets, icon: BudgetIcon },
    { name: t('goals'), view: View.Goals, icon: TargetIcon },
    { name: t('financial_advice'), view: View.FinancialAdvice, icon: SparklesIcon },
  ], [t]);

  return (
    <aside className="w-64 bg-secondary text-light flex flex-col border-r border-gray-800">
      <div className="p-6 text-2xl font-semibold text-center border-b border-gray-800">
        MoneyTracker AI
      </div>
      <nav className="flex-1 px-4 py-2 mt-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.view}>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onViewChange(item.view); }}
                className={`flex items-center p-3 my-1 rounded-lg transition-all duration-200 ${currentView === item.view
                    ? 'bg-accent text-primary font-semibold shadow-glow'
                    : 'text-medium hover:bg-gray-800 hover:text-light'
                  }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-4 py-4 border-t border-gray-800">
        <h3 className="px-3 text-xs font-semibold uppercase text-medium mb-2">{t('app_state')}</h3>
        <button onClick={onImport} className="flex items-center w-full p-3 my-1 rounded-lg text-medium hover:bg-gray-800 hover:text-light transition-colors duration-200">
          <ImportIcon className="h-5 w-5 mr-3" />
          <span>{t('import_from_excel')}</span>
        </button>
        <button onClick={onExport} className="flex items-center w-full p-3 my-1 rounded-lg text-medium hover:bg-gray-800 hover:text-light transition-colors duration-200">
          <ExportIcon className="h-5 w-5 mr-3" />
          <span>{t('export_to_excel')}</span>
        </button>

        <h3 className="px-3 mt-4 text-xs font-semibold uppercase text-medium mb-2">{t('settings')}</h3>
        <div className="relative flex items-center p-3 text-medium">
          <CurrencyIcon className="h-5 w-5 mr-3" />
          <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="w-full bg-transparent border-0 focus:ring-0 appearance-none" aria-label={t('select_currency')}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="relative flex items-center p-3 text-medium">
          <LanguageIcon className="h-5 w-5 mr-3" />
          <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="w-full bg-transparent border-0 focus:ring-0 appearance-none" aria-label={t('select_language')}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>
        <button
          onClick={toggleTheme}
          className="flex items-center w-full p-3 my-1 rounded-lg text-medium hover:bg-gray-800 hover:text-light transition-colors duration-200"
        >
          <span className="mr-3 text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
