import React, { useState, useRef, useEffect } from 'react';
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


const App: React.FC = () => {
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
  const [dataError, setDataError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('jarvisai_language', lang);
  }

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
      if (document.visibilityState === 'visible') {
        checkAndProcessRecurring();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkAndProcessRecurring]);

  const t = (key: string, placeholders?: Record<string, any>): string => {
    return translations[language][key](placeholders);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsDataLoading(true);
      setDataError(null);
      try {
        const importedState = await excelService.importStateFromExcel(file);
        setAppState(importedState);
        // Optional: reload to ensure clean state propagation, though React state updates should handle it.
        // window.location.reload(); 
      } catch (error) {
        console.error(error);
        setDataError(error instanceof Error ? error.message : t('restore_failed'));
        setTimeout(() => setDataError(null), 5000);
      } finally {
        setIsDataLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleExport = async () => {
    setIsDataLoading(true);
    setDataError(null);
    try {
      const fullState = {
        transactions,
        budgets,
        recurringTransactions,
        goals,
        settings: {
          activeBudgetId,
          currency,
          language
        }
      };
      await excelService.exportStateToExcel(fullState);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : t('backup_failed'));
      setTimeout(() => setDataError(null), 5000);
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
        return <Transactions transactions={transactions} addTransaction={addTransaction} deleteTransaction={deleteTransaction} currency={currency} budgets={budgets} activeBudgetId={activeBudgetId} />;
      case View.Analysis:
        return <Analysis transactions={transactions} currency={currency} budgets={budgets} />;
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
      <div className="flex h-screen bg-primary font-sans text-light">
        {isDataLoading && (
          <div className="fixed inset-0 bg-primary bg-opacity-70 flex flex-col justify-center items-center z-50">
            <LoadingSpinner />
            <p className="mt-4 text-lg">{t('processing_data')}</p>
          </div>
        )}
        {dataError && (
          <div className="fixed bottom-5 right-5 bg-red-500 text-white py-2 px-4 rounded-lg shadow-lg z-50">
            {dataError}
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
    </TranslationContext.Provider>
  );
};

export default App;