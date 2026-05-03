import { useState, useEffect } from 'react';
import API from '../api/axios';
import { motion } from 'framer-motion';
import { RotateCcw, Search, User, Book as BookIcon, Calendar, Plus, BookmarkPlus, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const IssuedBooks = () => {
    const [issuedBooks, setIssuedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showIssueModal, setShowIssueModal] = useState(false);
    
    // Direct Issue Form
    const [issueForm, setIssueForm] = useState({ studentId: '', bookId: '', returnDate: '' });
    const [availableBooks, setAvailableBooks] = useState([]);

    const fetchData = async () => {
        try {
            const issuedRes = await API.get('/issued');
            setIssuedBooks(issuedRes.data);
            
            const booksRes = await API.get('/admin/books');
            setAvailableBooks(booksRes.data.filter(b => b.availableCopies > 0));
            
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleReturn = async (id) => {
        if (!window.confirm('Mark this book as returned?')) return;
        try {
            await API.patch(`/issued/${id}/return`);
            toast.success('Book returned and inventory updated');
            fetchData();
        } catch (err) {
            toast.error('Return failed');
        }
    };

    const handleDirectIssue = async (e) => {
        e.preventDefault();
        try {
            await API.post('/issued', issueForm);
            toast.success('Book issued successfully!');
            setShowIssueModal(false);
            setIssueForm({ studentId: '', bookId: '', returnDate: '' });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Issue failed');
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Issued Books</h1>
                    <p className="text-slate-400">Track and manage library book circulation</p>
                </div>
                <button 
                    onClick={() => setShowIssueModal(true)}
                    className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-primary-900/20"
                >
                    <Plus size={20} />
                    Issue Book Directly
                </button>
            </header>

            {loading ? (
                <div className="text-center text-white py-20">Loading issued records...</div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {issuedBooks.map((record, i) => (
                        <motion.div
                            key={record._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-amber-400 border border-slate-700">
                                    <BookIcon size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{record.bookId?.title}</h3>
                                    <div className="flex flex-wrap gap-4 mt-1">
                                        <p className="text-sm text-slate-400 flex items-center gap-2">
                                            <User size={14} className="text-primary-400" />
                                            {record.studentId?.name} ({record.studentId?.studentId})
                                        </p>
                                        <p className="text-sm text-slate-400 flex items-center gap-2">
                                            <Calendar size={14} className="text-amber-400" />
                                            Issued: {new Date(record.issueDate).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm font-semibold text-red-400 flex items-center gap-2">
                                            <Clock size={14} />
                                            Due: {new Date(record.returnDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleReturn(record._id)}
                                className="px-6 py-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                            >
                                <RotateCcw size={18} />
                                Mark as Returned
                            </button>
                        </motion.div>
                    ))}

                    {issuedBooks.length === 0 && (
                        <div className="glass-card p-12 rounded-3xl text-center border-dashed border-2 border-slate-800">
                            <p className="text-slate-500 italic">No books are currently issued.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Direct Issue Modal */}
            {showIssueModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card w-full max-w-lg p-8 rounded-3xl border border-white/10"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <BookmarkPlus className="text-primary-400" />
                            Direct Book Issue
                        </h2>
                        
                        <form onSubmit={handleDirectIssue} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Student ID</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="Enter Student ID (e.g. STU-123)"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-all"
                                    value={issueForm.studentId}
                                    onChange={(e) => setIssueForm({...issueForm, studentId: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Select Book</label>
                                <select 
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-all appearance-none"
                                    value={issueForm.bookId}
                                    onChange={(e) => setIssueForm({...issueForm, bookId: e.target.value})}
                                >
                                    <option value="">Select a book...</option>
                                    {availableBooks.map(book => (
                                        <option key={book._id} value={book._id}>
                                            {book.title} ({book.availableCopies} left)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Return Date</label>
                                <input 
                                    type="date" 
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-all"
                                    value={issueForm.returnDate}
                                    onChange={(e) => setIssueForm({...issueForm, returnDate: e.target.value})}
                                />
                            </div>
                            
                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowIssueModal(false)}
                                    className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all font-bold"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-500 transition-all font-bold"
                                >
                                    Issue Book
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default IssuedBooks;
