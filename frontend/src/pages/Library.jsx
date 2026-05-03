import { useState, useEffect } from 'react';
import API from '../api/axios';
import { motion } from 'framer-motion';
import { Search, Filter, Book, BookmarkCheck, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Library = () => {
    const { user } = useAuth();
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [requests, setRequests] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchBooks = async () => {
        try {
            const { data } = await API.get(`/student/books?keyword=${keyword}&category=${selectedCategory}`);
            setBooks(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await API.get('/admin/categories');
            setCategories(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRequests = async () => {
        if (user?.role === 'Student') {
            try {
                const { data } = await API.get(`/requests/student/${user._id}`);
                setRequests(data);
            } catch (err) {
                console.error(err);
            }
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchRequests();
    }, []);

    useEffect(() => {
        fetchBooks();
    }, [keyword, selectedCategory]);

    const handleRequestBook = async (bookId) => {
        try {
            await API.post('/requests', { bookId });
            toast.success('Book request sent!');
            fetchRequests();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to request book');
        }
    };

    const getRequestStatus = (bookId) => {
        const req = requests.find(r => r.bookId._id === bookId);
        return req ? req.status : null;
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Campus Library</h1>
                    <p className="text-slate-400">Explore and search for academic resources</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text"
                            placeholder="Search title or author..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="relative sm:w-48">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="text-center text-white py-20">Loading books...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {books.map((book, i) => {
                        const status = getRequestStatus(book._id);
                        return (
                            <motion.div 
                                key={book._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-6 rounded-2xl group hover:border-primary-500/50 transition-all flex flex-col"
                            >
                                <div className="bg-slate-800 h-40 rounded-xl mb-4 flex items-center justify-center text-slate-600 group-hover:text-primary-400 transition-colors">
                                    <Book size={48} />
                                </div>
                                <div className="mb-4 flex-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400 bg-primary-500/10 px-2 py-1 rounded">
                                        {book.category?.name || 'General'}
                                    </span>
                                    <h3 className="text-base font-bold text-white mt-2 line-clamp-1">{book.title}</h3>
                                    <p className="text-slate-400 text-xs mb-3">{book.author}</p>
                                    
                                    <div className="grid grid-cols-3 gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-500 uppercase">Total</p>
                                            <p className="text-sm font-bold text-white">{book.totalCopies || 0}</p>
                                        </div>
                                        <div className="text-center border-x border-slate-800">
                                            <p className="text-[10px] text-slate-500 uppercase">Avail</p>
                                            <p className="text-sm font-bold text-emerald-400">{book.availableCopies || 0}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-500 uppercase">Issued</p>
                                            <p className="text-sm font-bold text-amber-400">{book.issuedCopies || 0}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-3 pt-4 border-t border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            {book.availableCopies > 0 ? (
                                                <BookmarkCheck className="text-emerald-400" size={14} />
                                            ) : (
                                                <AlertCircle className="text-red-400" size={14} />
                                            )}
                                            <span className={`text-[10px] font-bold uppercase ${book.availableCopies > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {book.availableCopies > 0 ? 'Available' : 'Not Available'}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-mono">ISBN: {book.isbn || 'N/A'}</span>
                                    </div>

                                    {user?.role === 'Student' && (
                                        status ? (
                                            <div className={`w-full py-2 rounded-xl text-center text-xs font-bold uppercase tracking-wider ${
                                                status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                status === 'Issued' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                                {status} Request
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleRequestBook(book._id)}
                                                disabled={book.availableCopies <= 0}
                                                className="w-full py-2 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                                            >
                                                <Send size={14} />
                                                Request Book
                                            </button>
                                        )
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {!loading && books.length === 0 && (
                <div className="glass-card p-12 rounded-3xl text-center">
                    <p className="text-slate-400">No books found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default Library;
