import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User, BookOpen, Loader2 } from 'lucide-react';
import API from '../api/axios';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'bot', content: "Hello! I'm your Smart Campus AI Assistant. How can I help you find or summarize books today?", type: 'text' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage, type: 'text' }]);
        setIsLoading(true);

        try {
            const { data } = await API.post('/ai/chat', { message: userMessage });
            
            let botMessage = { role: 'bot' };

            if (data.type === 'recommendation') {
                botMessage = { 
                    ...botMessage, 
                    type: 'recommendation', 
                    books: data.books,
                    content: `Here are some books I found for you:`
                };
            } else if (data.type === 'summary') {
                botMessage = { 
                    ...botMessage, 
                    type: 'summary', 
                    content: data.text 
                };
            } else {
                botMessage = { 
                    ...botMessage, 
                    type: 'text', 
                    content: data.text || "I'm not sure how to answer that. Try asking for a book recommendation!" 
                };
            }

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { 
                role: 'bot', 
                content: "Sorry, I'm having trouble connecting right now. Please try again later.",
                type: 'text'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${
                    isOpen ? 'bg-red-500 hover:bg-red-600 rotate-90' : 'bg-blue-600 hover:bg-blue-700'
                } text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform flex items-center justify-center`}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Bot size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Campus AI Assistant</h3>
                                <p className="text-blue-100 text-xs flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    Online & Ready
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 h-96 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-3 ${
                                    msg.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-tr-none' 
                                        : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-tl-none'
                                }`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                                        <span className="text-[10px] uppercase font-bold opacity-70">
                                            {msg.role === 'user' ? 'You' : 'Assistant'}
                                        </span>
                                    </div>
                                    
                                    <p className="text-sm leading-relaxed">{msg.content}</p>

                                    {/* Recommendations List */}
                                    {msg.type === 'recommendation' && msg.books && (
                                        <div className="mt-3 space-y-2">
                                            {msg.books.map((book, bIdx) => (
                                                <div key={bIdx} className="bg-gray-700/50 p-2 rounded-lg border border-gray-600">
                                                    <div className="flex items-start gap-2">
                                                        <BookOpen size={14} className="mt-1 text-blue-400" />
                                                        <div>
                                                            <p className="text-xs font-bold text-white">{book.title}</p>
                                                            <p className="text-[10px] text-gray-400">by {book.author}</p>
                                                            <p className="text-[10px] text-blue-300 mt-1 italic">{book.category}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Summary Display */}
                                    {msg.type === 'summary' && (
                                        <div className="mt-2 pt-2 border-t border-gray-700 italic text-xs text-gray-400">
                                            Extracted from library database
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-800 rounded-2xl p-3 rounded-tl-none border border-gray-700">
                                    <Loader2 size={16} className="animate-spin text-blue-500" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 bg-gray-900 border-t border-gray-800">
                        <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-1 border border-gray-700 focus-within:border-blue-500 transition-colors">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask for recommendations..."
                                className="flex-1 bg-transparent text-gray-100 py-2 text-sm focus:outline-none"
                                disabled={isLoading}
                            />
                            <button 
                                type="submit" 
                                disabled={isLoading || !input.trim()}
                                className="text-blue-500 hover:text-blue-400 disabled:opacity-50 transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 text-center">
                            Try "Suggest machine learning books"
                        </p>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AIChatbot;
