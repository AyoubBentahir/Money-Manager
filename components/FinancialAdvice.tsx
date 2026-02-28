import React, { useState, useEffect, useRef, useCallback } from 'react';
import { startChatSession } from '../services/geminiService';
import { LoadingSpinner, SendIcon } from './icons';
import { Transaction, ChatMessage } from '../types';
import { useTranslations } from '../contexts/TranslationContext';
import type { ChatSession } from '@google/generative-ai';

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl lg:max-w-2xl px-4 py-3 rounded-2xl ${isUser ? 'bg-accent text-primary' : 'bg-primary border border-gray-700'}`}>
                {/* Basic markdown for lists */}
                {message.parts[0].text.split('\n').map((line, index) => {
                    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                        return <p key={index} className="ml-4" style={{ textIndent: '-1em' }}>• {line.substring(2)}</p>;
                    }
                    return <p key={index}>{line}</p>
                })}
            </div>
        </div>
    );
};

export const FinancialAdvice: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    const { t } = useTranslations();
    const [chat, setChat] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            setError(null);
            const newChat = startChatSession(transactions);
            setChat(newChat);
            setMessages([]); // Clear previous chat history on component mount/transaction update
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : t('unknown_error');
            setError(errorMessage);
        }
    }, [transactions, t]);

    useEffect(() => {
        chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
    }, [messages, isLoading]);

    const handleSendMessage = useCallback(async () => {
        if (!currentInput.trim() || !chat) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: currentInput }] };
        setMessages(prev => [...prev, userMessage]);
        setCurrentInput('');
        setIsLoading(true);

        try {
            const result = await chat.sendMessageStream(currentInput);
            let modelResponse = '';

            setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

            for await (const chunk of result.stream) {
                modelResponse += chunk.text();
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'model', parts: [{ text: modelResponse }] };
                    return newMessages;
                });
            }

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : t('unknown_error');
            setError(`${t('advice_fetch_failed')}: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [chat, currentInput, t]);

    return (
        <div className="p-6 bg-primary min-h-full flex flex-col h-full">
            <h1 className="text-4xl font-bold mb-4 text-light shrink-0">{t('financial_advice_title')}</h1>
            <p className="mb-6 text-medium shrink-0">
                {t('financial_advice_prompt')}
            </p>
            <div className="bg-secondary shadow-lg rounded-lg border border-gray-800 flex-1 flex flex-col min-h-0">
                <div ref={chatContainerRef} className="flex-1 p-6 space-y-4 overflow-y-auto">
                    {messages.length === 0 && !isLoading && (
                        <ChatBubble message={{ role: 'model', parts: [{ text: t('chat_welcome') }] }} />
                    )}
                    {messages.map((msg, index) => (
                        <ChatBubble key={index} message={msg} />
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-xl lg:max-w-2xl px-4 py-3 rounded-2xl bg-primary border border-gray-700 flex items-center">
                                <LoadingSpinner className="h-5 w-5 mr-3" />
                                <span>{t('fin_is_typing')}</span>
                            </div>
                        </div>
                    )}
                    {error && <div className="text-red-400 bg-red-900 bg-opacity-30 p-4 rounded-lg border border-red-500">{error}</div>}
                </div>
                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center bg-primary rounded-lg border border-gray-600 focus-within:ring-2 focus-within:ring-accent">
                        <input
                            type="text"
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                            placeholder={t('chat_placeholder')}
                            disabled={isLoading || !!error}
                            className="flex-1 bg-transparent p-3 focus:outline-none"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isLoading || !currentInput.trim()}
                            className="p-3 text-accent hover:text-accent-hover disabled:text-gray-500 disabled:cursor-not-allowed"
                            aria-label={t('send')}
                        >
                            <SendIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialAdvice;
