import { Language } from '../types';

type Translations = Record<Language, { [key: string]: string }>;

// Helper to replace placeholders like {placeholder}
const replacePlaceholders = (text: string, placeholders: Record<string, any>): string => {
  return text.replace(/{(\w+)}/g, (placeholderWithBraces, placeholderKey) => {
    return placeholders.hasOwnProperty(placeholderKey) ? placeholders[placeholderKey] : placeholderWithBraces;
  });
};

const baseTranslations: Omit<Translations, 'en'> & { en: Record<string, string> } = {
  en: {
    // Sidebar
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    analysis: 'Analysis',
    budgets: 'Budgets',
    goals: 'Goals',
    financial_advice: 'Financial Advice',
    recurring: 'Recurring',
    app_state: 'App State',
    import_from_excel: 'Import from Excel',
    export_to_excel: 'Export to Excel',
    settings: 'Settings',
    select_currency: 'Select Currency',
    select_language: 'Select Language',
    // Dashboard
    total_balance: 'Total Balance',
    total_income: 'Total Income',
    total_expenses: 'Total Expenses',
    active_budget: 'Active Budget',
    spent: 'Spent',
    remaining: 'Remaining',
    over: 'Over',
    recent_transactions: 'Recent Transactions',
    no_transactions_yet: 'No transactions made yet.',
    no_active_budget: 'No Active Budget',
    no_active_budget_prompt: 'Go to the Budgets page to create or select a budget.',
    top_5_spending_categories: 'Top 5 Spending Categories',
    no_expense_data: 'No expense data available.',
    budget_alerts: 'Budget Alerts',
    alert_message: "You've spent {percentage}% of your budget for {category}.",
    // Transactions
    all_transactions: 'All Transactions',
    add_transaction: 'Add Transaction',
    add_new_transaction: 'Add New Transaction',
    type: 'Type',
    expense: 'Expense',
    income: 'Income',
    description: 'Description',
    amount: 'Amount',
    budget: 'Budget',
    category: 'Category',
    date: 'Date',
    cancel: 'Cancel',
    add: 'Add',
    no_transactions_prompt: "You haven't added any transactions yet. Click 'Add Transaction' to get started!",
    // Analysis
    filters: 'Filters',
    start_date: 'Start Date',
    end_date: 'End Date',
    all: 'All',
    all_budgets: 'All Budgets',
    group_by: 'Group By',
    day: 'Day',
    month: 'Month',
    year: 'Year',
    y_axis_interval: 'Y-Axis Interval',
    auto: 'Auto',
    transaction_trends: 'Transaction Trends',
    filtered_transactions: 'Filtered Transactions',
    // Budgets
    budget_management: 'Budget Management',
    select_active_budget: 'Select Active Budget',
    delete_selected_budget: 'Delete Selected Budget',
    no_budgets_created: 'No budgets created yet.',
    create_new_budget: 'Create New Budget',
    eg_vacation_fund: 'e.g., Vacation Fund',
    create: 'Create',
    rename_budget: 'Rename Budget',
    save_name: 'Save Name',
    set_spending_limits: 'Set Spending Limits for',
    no_limit: 'No Limit',
    no_budgets_available: 'No budgets available. Create one to get started!',
    delete_budget_confirmation: "Are you sure you want to delete this budget?",
    initial_budget_amount: 'Initial Budget Amount',
    total_budget: 'Total Budget',
    // Financial Advice
    financial_advice_title: 'Chat with Fin',
    financial_advice_prompt: "Ask your AI assistant 'Fin' anything about your finances.",
    chat_welcome: "Hello! I'm Fin, your personal financial assistant. How can I help you today? You can ask me about your spending, suggest a budget, or find ways to save money.",
    chat_placeholder: "Ask Fin anything...",
    send: "Send",
    fin_is_typing: "Fin is typing...",
    advice_fetch_failed: 'Failed to get a response from Fin',
    unknown_error: 'An unknown error occurred.',
    // Recurring
    recurring_transactions: 'Recurring Transactions',
    add_recurring_transaction: 'Add Recurring Transaction',
    frequency: 'Frequency',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    start_date_label: 'Start Date',
    next_due_date: 'Next Due Date',
    no_recurring_transactions_prompt: "You haven't set up any recurring transactions yet. Add one to automate your finances!",
    // Goals
    goal_management: "Financial Goals",
    add_goal: "Add Goal",
    new_goal: "New Financial Goal",
    goal_name: "Goal Name",
    eg_new_laptop: "e.g., New Laptop",
    target_amount: "Target Amount",
    current_amount: "Current Amount",
    target_date: "Target Date",
    contribute: "Contribute",
    add_contribution: "Add Contribution",
    contribution_amount: "Contribution Amount",
    no_goals_prompt: "You haven't set any financial goals yet. Click 'Add Goal' to start planning for your future!",
    no_goals_yet: "No Goals Yet",
    delete_goal_confirmation: "Are you sure you want to delete this goal?",
    saved_of: "saved of",
    to: "to",
    // Global
    processing_data: 'Processing data...',
    backup_failed: 'Failed to backup application state.',
    restore_failed: 'Failed to restore application state from file.',
  },
  fr: {
    // Sidebar
    dashboard: 'Tableau de bord',
    transactions: 'Transactions',
    analysis: 'Analyse',
    budgets: 'Budgets',
    goals: 'Objectifs',
    financial_advice: 'Conseils Financiers',
    recurring: 'Récurrent',
    app_state: 'État de l\'App',
    import_from_excel: 'Importer d\'Excel',
    export_to_excel: 'Exporter vers Excel',
    settings: 'Paramètres',
    select_currency: 'Sélectionner la devise',
    select_language: 'Sélectionner la langue',
    // Budgets
    eg_vacation_fund: 'ex: Fonds de vacances',
    // Goals
    goal_management: "Objectifs Financiers",
    add_goal: "Ajouter un Objectif",
    new_goal: "Nouvel Objectif Financier",
    goal_name: "Nom de l'Objectif",
    eg_new_laptop: "ex: Nouvel Ordinateur",
    target_amount: "Montant Cible",
    current_amount: "Montant Actuel",
    target_date: "Date Cible",
    contribute: "Contribuer",
    add_contribution: "Ajouter une Contribution",
    contribution_amount: "Montant de la Contribution",
    no_goals_prompt: "Vous n'avez pas encore défini d'objectifs financiers. Cliquez sur 'Ajouter un Objectif' pour commencer à planifier votre avenir !",
    no_goals_yet: "Aucun Objectif Pour l'Instant",
    delete_goal_confirmation: "Êtes-vous sûr de vouloir supprimer cet objectif ?",
    saved_of: "économisé sur",
    to: "à",
    // Chat
    financial_advice_title: 'Discuter avec Fin',
    financial_advice_prompt: "Demandez n'importe quoi à votre assistant IA 'Fin' sur vos finances.",
    chat_welcome: "Bonjour ! Je suis Fin, votre assistant financier personnel. Comment puis-je vous aider aujourd'hui ? Vous pouvez m'interroger sur vos dépenses, me suggérer un budget ou trouver des moyens d'économiser de l'argent.",
    chat_placeholder: "Demandez n'importe quoi à Fin...",
    send: "Envoyer",
    fin_is_typing: "Fin est en train d'écrire...",
    advice_fetch_failed: "Échec de la réponse de Fin",
  },
  es: {
    // Sidebar
    dashboard: 'Tablero',
    transactions: 'Transacciones',
    analysis: 'Análisis',
    budgets: 'Presupuestos',
    goals: 'Metas',
    financial_advice: 'Asesoramiento Financiero',
    recurring: 'Recurrente',
    app_state: 'Estado de la App',
    import_from_excel: 'Importar desde Excel',
    export_to_excel: 'Exportar a Excel',
    settings: 'Configuración',
    select_currency: 'Seleccionar Moneda',
    select_language: 'Seleccionar Idioma',
    // Goals
    goal_management: "Metas Financieras",
    add_goal: "Añadir Meta",
    new_goal: "Nueva Meta Financiera",
    goal_name: "Nombre de la Meta",
    eg_new_laptop: "ej: Laptop Nueva",
    target_amount: "Monto Objetivo",
    current_amount: "Monto Actual",
    target_date: "Fecha Objetivo",
    contribute: "Contribuir",
    add_contribution: "Añadir Contribución",
    contribution_amount: "Monto de la Contribución",
    no_goals_prompt: "Aún no has establecido ninguna meta financiera. ¡Haz clic en 'Añadir Meta' para empezar a planificar tu futuro!",
    no_goals_yet: "Aún No Hay Metas",
    delete_goal_confirmation: "¿Estás seguro de que quieres eliminar esta meta?",
    saved_of: "ahorrado de",
    to: "a",
    // Chat
    financial_advice_title: 'Chatear con Fin',
    financial_advice_prompt: "Pregúntale a tu asistente de IA 'Fin' cualquier cosa sobre tus finanzas.",
    chat_welcome: "¡Hola! Soy Fin, tu asistente financiero personal. ¿Cómo puedo ayudarte hoy? Puedes preguntarme sobre tus gastos, sugerir un presupuesto o encontrar formas de ahorrar dinero.",
    chat_placeholder: "Pregúntale a Fin cualquier cosa...",
    send: "Enviar",
    fin_is_typing: "Fin está escribiendo...",
    advice_fetch_failed: "No se pudo obtener una respuesta de Fin",
  },
  ar: {
    // Sidebar
    dashboard: 'لوحة التحكم',
    transactions: 'المعاملات',
    analysis: 'التحليل',
    budgets: 'الميزانيات',
    goals: 'الأهداف',
    financial_advice: 'نصائح مالية',
    recurring: 'المتكررة',
    app_state: 'حالة التطبيق',
    import_from_excel: 'استيراد من Excel',
    export_to_excel: 'تصدير إلى Excel',
    settings: 'الإعدادات',
    select_currency: 'اختر العملة',
    select_language: 'اختر اللغة',
    // Goals
    goal_management: "الأهداف المالية",
    add_goal: "إضافة هدف",
    new_goal: "هدف مالي جديد",
    goal_name: "اسم الهدف",
    eg_new_laptop: "مثال: كمبيوتر محمول جديد",
    target_amount: "المبلغ المستهدف",
    current_amount: "المبلغ الحالي",
    target_date: "التاريخ المستهدف",
    contribute: "المساهمة",
    add_contribution: "إضافة مساهمة",
    contribution_amount: "مبلغ المساهمة",
    no_goals_prompt: "لم تقم بتعيين أي أهداف مالية بعد. انقر على 'إضافة هدف' لبدء التخطيط لمستقبلك!",
    no_goals_yet: "لا توجد أهداف بعد",
    delete_goal_confirmation: "هل أنت متأكد أنك تريد حذف هذا الهدف؟",
    saved_of: "تم توفيره من",
    to: "إلى",
    // Chat
    financial_advice_title: 'الدردشة مع فين',
    financial_advice_prompt: "اسأل مساعدك الذكي 'فين' أي شيء عن أموالك.",
    chat_welcome: "مرحباً! أنا فين، مساعدك المالي الشخصي. كيف يمكنني مساعدتك اليوم؟ يمكنك أن تسألني عن إنفاقك، أو تقترح ميزانية، أو تجد طرقًا لتوفير المال.",
    chat_placeholder: "اسأل فين أي شيء...",
    send: "إرسال",
    fin_is_typing: "فين يكتب...",
    advice_fetch_failed: "فشل في الحصول على رد من فين",
  },
};


// Create a temporary object to hold the final translations
const tempTranslations: any = {};

const mergeWithEnglish = (base: Record<string, string>, fallback: Record<string, string>): Record<string, string> => {
  return { ...fallback, ...base };
}


// Process each language
for (const langCode in baseTranslations) {
  if (Object.prototype.hasOwnProperty.call(baseTranslations, langCode)) {
    const langKey = langCode as Language;
    // Merge with English to provide fallbacks for missing keys
    const mergedTranslations = langKey === 'en'
      ? baseTranslations.en
      : mergeWithEnglish(baseTranslations[langKey], baseTranslations.en);

    tempTranslations[langKey] = new Proxy(mergedTranslations, {
      get(target, prop: string) {
        const text = target[prop] || prop;
        return (placeholders?: Record<string, any>) => {
          if (placeholders) {
            return replacePlaceholders(text, placeholders);
          }
          return text;
        };
      }
    });
  }
}

// Since the original structure was Record<Language, { [key: string]: string }>,
// we adjust the export to match the expected interpolated function type.
// The actual implementation is a bit more complex due to the Proxy.
export const translations: Record<Language, { [key: string]: (placeholders?: Record<string, any>) => string }> = tempTranslations;