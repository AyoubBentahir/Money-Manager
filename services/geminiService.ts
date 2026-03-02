import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Transaction } from "../types";

let ai: GoogleGenerativeAI | null = null;

// This function safely retrieves the API key
const getApiKey = (): string => {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
}

const getAiClient = (): GoogleGenerativeAI => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API key not configured. Please add GEMINI_API_KEY to your .env.local file.");
  }
  if (!ai) {
    ai = new GoogleGenerativeAI(apiKey);
  }
  return ai;
};

export const startChatSession = (transactions: Transaction[]) => {
  const client = getAiClient();

  const transactionSummary = transactions.length > 0
    ? `Here is a summary of recent transactions: ${JSON.stringify(transactions.slice(0, 20))}`
    : "The user has not added any transactions yet.";

  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `You are 'Fin', a friendly, encouraging, and highly knowledgeable financial assistant for the JarvisAI app. Your goal is to provide actionable, easy-to-understand financial advice. You can analyze spending, identify trends, answer questions about budgeting, and suggest ways to save or invest. Always be positive and helpful. Base your initial analysis on this data: ${transactionSummary}.`
  });

  const chat = model.startChat({
    history: [],
  });

  return chat;
};