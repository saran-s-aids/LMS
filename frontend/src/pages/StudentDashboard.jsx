import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Book, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AIChatbot from '../components/AIChatbot';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [issuedBooks, setIssuedBooks] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const booksRes = await API.get('/student/my-books');
                setIssuedBooks(booksRes.data);
                
                const notifRes = await API.get('/student/notifications');
                setNotifications(notifRes.data);
                
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8 pb-10">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Hello, {user?.name}!</h1>
                    <p className="text-slate-400">Student ID: <span className="text-primary-400 font-mono">{user?.studentId}</span></p>
                </div>
                <div className="hidden md:block">
                    <div className="text-right">
                        <p className="text-slate-400 text-sm">Member since</p>
                        <p className="text-white font-medium">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Issued Books Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Book size={20} className="text-primary-400" />
                            Currently Borrowed
                        </h2>
                        <Link to="/library" className="text-sm text-primary-400 hover:underline flex items-center">
                            Browse Library <ChevronRight size={14} />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-slate-500">Loading your books...</div>
                        ) : issuedBooks.length > 0 ? (
                            issuedBooks.map((record, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass-card p-5 rounded-2xl flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-16 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                                            <Book size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{record.bookId?.title}</h3>
                                            <p className="text-sm text-slate-400">{record.bookId?.author}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Due Date</p>
                                        <div className="flex items-center gap-2 text-amber-400 font-semibold">
                                            <Clock size={14} />
                                            {new Date(record.returnDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="glass-card p-10 rounded-2xl text-center text-slate-500 border-dashed border-2 border-slate-800">
                                <p>You haven't borrowed any books yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <AlertTriangle size={18} className="text-amber-400" />
                            Notifications
                        </h3>
                        <div className="space-y-4">
                            {notifications.length > 0 ? (
                                notifications.map((notif, i) => (
                                    <div 
                                        key={i} 
                                        className={`p-3 bg-white/5 rounded-xl text-sm border-l-4 ${notif.type === 'due' ? 'border-amber-500' : 'border-primary-500'}`}
                                    >
                                        <p className="text-white font-medium">{notif.title}</p>
                                        <p className="text-slate-400 text-xs mt-1">{notif.message}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 text-sm text-center py-4 italic">No new notifications</p>
                            )}
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-primary-600/20 to-transparent">
                        <h3 className="text-lg font-bold text-white mb-2">Sell your books</h3>
                        <p className="text-slate-400 text-sm mb-4">Finished with your old textbooks? List them in the marketplace for other students.</p>
                        <Link to="/marketplace" className="block w-full py-2 bg-primary-600 hover:bg-primary-500 text-white text-center font-bold rounded-xl transition-all">
                            Go to Marketplace
                        </Link>
                    </div>
                </div>
            </div>
            <AIChatbot />
        </div>
    );
};

export default StudentDashboard;
