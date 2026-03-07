<div align="center">

# 💰 MoneyTracker AI

**A smart, AI-powered personal finance manager — runs entirely in your browser.**

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite)
![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat&logo=google)

</div>

---

## ✨ Features

- **📊 Dashboard** — Overview of balance, income, expenses, recent transactions, and budget status, plus a new **Activity Heatmap** and premium gamified **Achievements**.
- **💸 Transactions** — Add, view, and delete income/expense entries. You can now **assign Income directly to Budgets**.
- **🔁 Recurring Transactions** — Set up daily/weekly/monthly/yearly recurring entries that auto-execute on app load.
- **📈 Analysis** — Interactive line charts with date/type/budget filters, plus a **30-day Predictive Cash Flow** forecast based on your habits.
- **🎯 Budgets** — Create budgets with an **initial total amount** and categorical limits. Any **assigned Income** automatically increases your effective budget limit.
- **🏆 Financial Goals** — Set savings goals with target amounts/dates, tracked by visual bars and **animated confetti celebrations** at key milestones.
- **🤖 AI Financial Advisor ("Fin")** — Chat with an AI assistant powered by Google Gemini, context-aware of your transaction history. Supports streaming responses.
- **📤 Export / Import** — Back up and restore your entire financial data as an `.xlsx` file.
- **🌍 Multi-language** — English, French, Spanish, and Arabic.
- **💱 Multi-currency** — USD, EUR, GBP, JPY, CAD, AUD, MAD.
- **🌙 Dark Theme** — Modern dark UI with high-contrast elements.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- A free **Google Gemini API key** (see below)

### 1. Clone the repository
```bash
git clone https://github.com/AyoubBentahir/Money-Manager
cd Money-Manager
```

### 2. Get your Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key

### 3. Configure your API key
Create a `.env.local` file in the project root:
```env
GEMINI_API_KEY="your_api_key_here"
```

> ⚠️ **Never share this file or commit it to GitHub.** It's already listed in `.gitignore`.

### 4. Install dependencies
```bash
npm install
```

### 5. Run the app
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| AI | Google Gemini (`gemini-2.0-flash-exp`) via `@google/generative-ai` |
| Styling | Tailwind CSS |
| Data Export | `xlsx` |
| Storage | Browser `localStorage` (no backend required) |

---

## 📁 Project Structure

```
├── components/        # UI components (Dashboard, Transactions, Goals, etc.)
├── contexts/          # React context for global state
├── hooks/             # Custom React hooks
├── services/          # Gemini AI service
├── utils/             # Helper utilities
├── types.ts           # TypeScript type definitions
├── App.tsx            # Root application component
└── index.tsx          # Entry point
```

---

## 🔒 Privacy

All your financial data is stored **locally in your browser** using `localStorage`. No data is ever sent to a server (except AI chat messages sent to the Gemini API using your own key).

---

## 📄 License

This project is open source. Feel free to fork, modify, and use it for personal or educational purposes.
