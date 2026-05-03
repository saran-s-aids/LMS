import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../api/axios';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User as UserIcon, Search, MessageSquare, ShoppingBag } from 'lucide-react';

const Chat = () => {
    const location = useLocation();
    const { user } = useAuth();
    const { messages, setMessages, sendMessage } = useChat();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [input, setInput] = useState('');
    const [search, setSearch] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const { data } = await API.get(`/chat/conversations/user/${user._id}`);
            setConversations(data);
            
            // If redirected from marketplace, select that conversation
            if (location.state?.conversationId) {
                const found = data.find(c => c._id === location.state.conversationId);
                if (found) setSelectedConversation(found);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user) fetchConversations();
    }, [user, location.state]);

    useEffect(() => {
        if (selectedConversation) {
            const fetchHistory = async () => {
                try {
                    const { data } = await API.get(`/chat/messages/${selectedConversation._id}`);
                    setMessages(data);
                } catch (err) {
                    console.error(err);
                }
            };
            fetchHistory();
        }
    }, [selectedConversation]);

    const handleSend = (e) => {
        e.preventDefault();
        if (input.trim() && selectedConversation) {
            const receiverId = selectedConversation.buyerId._id === user._id 
                ? selectedConversation.sellerId._id 
                : selectedConversation.buyerId._id;
            
            sendMessage(selectedConversation._id, input, receiverId);
            setInput('');
        }
    };

    const filteredConversations = conversations.filter(c => {
        const otherUser = c.buyerId._id === user._id ? c.sellerId : c.buyerId;
        return otherUser.name.toLowerCase().includes(search.toLowerCase()) || 
               c.marketplaceItemId?.title.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="glass-card rounded-3xl overflow-hidden h-[calc(100vh-140px)] flex">
            {/* Sidebar */}
            <div className="w-full md:w-96 border-r border-slate-800 flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white mb-4">Marketplace Chats</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="text"
                            placeholder="Search chats or items..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filteredConversations.map(c => {
                        const otherUser = c.buyerId._id === user._id ? c.sellerId : c.buyerId;
                        return (
                            <button 
                                key={c._id}
                                onClick={() => setSelectedConversation(c)}
                                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border ${selectedConversation?._id === c._id ? 'bg-primary-600 border-primary-500 text-white' : 'hover:bg-white/5 border-transparent text-slate-400'}`}
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-slate-700 flex items-center justify-center">
                                    {c.marketplaceItemId?.image ? (
                                        <img src={`http://localhost:5000/${c.marketplaceItemId.image}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <ShoppingBag size={20} />
                                    )}
                                </div>
                                <div className="text-left overflow-hidden flex-1">
                                    <p className="font-bold truncate text-sm">{c.marketplaceItemId?.title || 'Unknown Item'}</p>
                                    <p className="text-xs opacity-70 truncate flex items-center gap-1">
                                        <UserIcon size={10} /> {otherUser.name}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                    {conversations.length === 0 && (
                        <div className="text-center py-10 px-4">
                            <p className="text-slate-500 text-sm">No conversations yet. Go to Marketplace to contact sellers.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className="hidden md:flex flex-1 flex-col bg-slate-900/30">
                {selectedConversation ? (
                    <>
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center border border-primary-500/30">
                                    <UserIcon size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">
                                        {selectedConversation.buyerId._id === user._id ? selectedConversation.sellerId.name : selectedConversation.buyerId.name}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                        Item: {selectedConversation.marketplaceItemId?.title}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
                            <AnimatePresence initial={false}>
                                {messages.filter(m => m.conversationId === selectedConversation._id).map((msg, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`flex ${msg.senderId === user._id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] p-3 px-4 rounded-2xl text-sm shadow-lg ${msg.senderId === user._id ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                                            {msg.message}
                                            <p className="text-[10px] opacity-50 mt-1 text-right">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSend} className="p-4 bg-slate-900/50 border-t border-slate-800">
                            <div className="flex gap-2">
                                <input 
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-inner"
                                />
                                <button 
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white p-3 rounded-xl transition-all shadow-lg"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
                        <div className="p-8 rounded-full bg-slate-800/50 border border-slate-700 animate-pulse">
                            <MessageSquare size={64} className="text-slate-600" />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-white">Your Conversation</p>
                            <p className="text-sm text-slate-500">Select a marketplace chat to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
