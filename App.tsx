import React, { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import FinancialAdvice from './components/FinancialAdvice';
import Analysis from './components/Analysis';
import Budgets from './components/Budgets';
import Recurring from './components/Recurring';
import Goals from './components/Goals';
import { View, Language } from './types';
import { useTransactions } from './hooks/useTransactions';
import { LoadingSpinner } from './components/icons';
import { translations } from './utils/translations';
import { excelService } from './services/dbService';
import TranslationContext from './contexts/TranslationContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';


const AppInner: React.FC = () => {
  const { showToast } = useToast();
  const [language, setLanguage] = useState<Language>(() => {
    const storedLang = localStorage.getItem('jarvisai_language');
    return (storedLang as Language) || 'en';
  });

  const {
    transactions,
    addTransaction,
    deleteTransaction,
    budgets,
    activeBudgetId,
    setActiveBudgetId,
    addBudget,
    deleteBudget,
    updateBudget,
    currency,
    setCurrency,
    recurringTransactions,
    addRecurringTransaction,
    deleteRecurringTransaction,
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    addContributionToGoal,
    setAppState,
    checkAndProcessRecurring,
  } = useTransactions();

  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('jarvisai_language', lang);
  };

  useEffect(() => {
    const htmlTag = document.getElementById('html-tag');
    if (htmlTag) {
      htmlTag.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [language]);

  // Process recurring transactions on initial load and when app becomes visible
  useEffect(() => {
    checkAndProcessRecurring();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkAndProcessRecurring();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkAndProcessRecurring]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if (isTyping) return;

      if (e.key === 'n' || e.key === 'N') {
        if (currentView === View.Transactions) {
          setIsTransactionModalOpen(true);
        }
      }
      if (e.key === 'Escape') {
        setIsTransactionModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView]);

  const t = useCallback((key: string, placeholders?: Record<string, any>): string => {
    return translations[language][key](placeholders);
  }, [language]);

  const handleImport = () => fileInputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsDataLoading(true);
      try {
        const importedState = await excelService.importStateFromExcel(file);
        setAppState(importedState);
        showToast('Data imported successfully!', 'success');
      } catch (error) {
        showToast(error instanceof Error ? error.message : t('restore_failed'), 'error');
      } finally {
        setIsDataLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = async () => {
    setIsDataLoading(true);
    try {
      const fullState = {
        transactions, budgets, recurringTransactions, goals,
        settings: { activeBudgetId, currency, language }
      };
      await excelService.exportStateToExcel(fullState);
      showToast('Data exported successfully!', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('backup_failed'), 'error');
    } finally {
      setIsDataLoading(false);
    }
  };

  const renderContent = () => {
    const activeBudget = budgets.find(b => b.id === activeBudgetId);
    switch (currentView) {
      case View.Dashboard:
        return <Dashboard transactions={transactions} activeBudget={activeBudget} currency={currency} budgets={budgets} setActiveBudgetId={setActiveBudgetId} />;
      case View.Transactions:
        return <Transactions transactions={transactions} addTransaction={addTransaction} deleteTransaction={deleteTransaction} currency={currency} budgets={budgets} activeBudgetId={activeBudgetId} externalModalOpen={isTransactionModalOpen} onExternalModalClose={() => setIsTransactionModalOpen(false)} />;
      case View.Analysis:
        return <Analysis transactions={transactions} recurringTransactions={recurringTransactions} currency={currency} budgets={budgets} />;
      case View.Budgets:
        return <Budgets budgets={budgets} transactions={transactions} activeBudgetId={activeBudgetId} setActiveBudgetId={setActiveBudgetId} addBudget={addBudget} deleteBudget={deleteBudget} updateBudget={updateBudget} currency={currency} />;
      case View.FinancialAdvice:
        return <FinancialAdvice transactions={transactions} />;
      case View.Recurring:
        return <Recurring recurringTransactions={recurringTransactions} addRecurringTransaction={addRecurringTransaction} deleteRecurringTransaction={deleteRecurringTransaction} currency={currency} budgets={budgets} />;
      case View.Goals:
        return <Goals goals={goals} addGoal={addGoal} updateGoal={updateGoal} deleteGoal={deleteGoal} addContributionToGoal={addContributionToGoal} currency={currency} />;
      default:
        return <Dashboard transactions={transactions} activeBudget={activeBudget} currency={currency} budgets={budgets} setActiveBudgetId={setActiveBudgetId} />;
    }
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage: handleLanguageChange, t }}>
      <div className="flex h-screen bg-gradient-to-br from-[#0B1120] via-[#0f172a] to-[#020617] font-sans text-light relative overflow-hidden">
        {/* Animated Glow Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple/20 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Main Content Wrapper */}
        <div className="flex w-full h-full relative z-10">
          {isDataLoading && (
            <div className="fixed inset-0 bg-primary bg-opacity-70 flex flex-col justify-center items-center z-50">
              <LoadingSpinner />
              <p className="mt-4 text-lg">{t('processing_data')}</p>
            </div>
          )}
          <Sidebar
            currentView={currentView}
            onViewChange={setCurrentView}
            onImport={handleImport}
            onExport={handleExport}
            currency={currency}
            setCurrency={setCurrency}
          />
          <main className="flex-1 overflow-y-auto">
            {renderContent()}
          </main>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls" />
        </div>
      </div>
    </TranslationContext.Provider>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  </ThemeProvider>
);

export default App;