import { useState, useEffect } from 'react';
import API from '../api/axios';
import { motion } from 'framer-motion';
import { Users, BookOpen, BookmarkCheck, RotateCcw, Plus, Trash2, Clock, AlertCircle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBookModal, setShowBookModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [categories, setCategories] = useState([]);
    
    // Form States
    const [bookForm, setBookForm] = useState({ title: '', author: '', category: '', isbn: '', totalCopies: 1, description: '' });
    const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

    const fetchAnalytics = async () => {
        try {
            const { data } = await API.get('/admin/analytics');
            setAnalytics(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
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

    useEffect(() => {
        fetchAnalytics();
        fetchCategories();
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await API.post('/admin/categories', categoryForm);
            setShowCategoryModal(false);
            setCategoryForm({ name: '', description: '' });
            fetchAnalytics();
            fetchCategories();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return;
        try {
            await API.delete(`/admin/categories/${categoryToDelete}`);
            setShowDeleteModal(false);
            setCategoryToDelete(null);
            fetchAnalytics();
            fetchCategories();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        try {
            await API.post('/admin/books', bookForm);
            setShowBookModal(false);
            setBookForm({ title: '', author: '', category: '', isbn: '', totalCopies: 1, description: '' });
            fetchAnalytics();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Loading Dashboard...</div>;

    const barData = {
        labels: analytics?.categoryStats.map(c => c.name) || [],
        datasets: [
            {
                label: 'Books per Category',
                data: analytics?.categoryStats.map(c => c.count) || [],
                backgroundColor: 'rgba(56, 189, 248, 0.6)',
                borderColor: 'rgba(56, 189, 248, 1)',
                borderWidth: 1,
            },
        ],
    };

    const pieData = {
        labels: ['Issued', 'Available'],
        datasets: [
            {
                data: [analytics?.stats.issuedCopies, analytics?.stats.availableCopies],
                backgroundColor: ['rgba(239, 68, 68, 0.6)', 'rgba(34, 197, 94, 0.6)'],
                borderColor: ['rgba(239, 68, 68, 1)', 'rgba(34, 197, 94, 1)'],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="space-y-8 pb-10">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">Admin Command Center</h1>
                <p className="text-slate-400">Real-time campus library analytics and management</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {[
                    { label: 'Total Students', value: analytics?.stats.totalStudents, icon: Users, color: 'text-blue-400' },
                    { label: 'Total Copies', value: analytics?.stats.totalCopies, icon: BookOpen, color: 'text-emerald-400' },
                    { label: 'Available Copies', value: analytics?.stats.availableCopies, icon: BookmarkCheck, color: 'text-emerald-500' },
                    { label: 'Issued Copies', value: analytics?.stats.issuedCopies, icon: RotateCcw, color: 'text-amber-400' },
                    { label: 'Pending Requests', value: analytics?.stats.pendingRequests, icon: Clock, color: 'text-purple-400' },
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6 rounded-2xl flex flex-col justify-center"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg bg-slate-800 ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{stat.label}</p>
                        </div>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-8 rounded-3xl h-[400px]">
                    <h3 className="text-xl font-bold text-white mb-6">Books per Category</h3>
                    <div className="h-[280px]">
                        <Bar 
                            data={barData} 
                            options={{ 
                                responsive: true, 
                                maintainAspectRatio: false,
                                scales: { 
                                    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                                    x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
                                },
                                plugins: { legend: { display: false } }
                            }} 
                        />
                    </div>
                </div>

                <div className="glass-card p-8 rounded-3xl h-[400px]">
                    <h3 className="text-xl font-bold text-white mb-6">Inventory Status</h3>
                    <div className="h-[280px] flex justify-center">
                        <Pie 
                            data={pieData} 
                            options={{ 
                                responsive: true, 
                                maintainAspectRatio: false,
                                plugins: { 
                                    legend: { 
                                        position: 'bottom',
                                        labels: { color: '#94a3b8', padding: 20 }
                                    } 
                                }
                            }} 
                        />
                    </div>
                </div>
            </div>

            {/* Management Quick Actions */}
            <div className="glass-card p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-white">Category Management</h3>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setShowBookModal(true)}
                            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
                        >
                            <Plus size={18} />
                            Add Book
                        </button>
                        <button 
                            onClick={() => setShowCategoryModal(true)}
                            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
                        >
                            <Plus size={18} />
                            Add Category
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 border-b border-slate-800">
                                <th className="pb-4 font-medium">Category Name</th>
                                <th className="pb-4 font-medium">Description</th>
                                <th className="pb-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-300">
                            {categories.map((cat, i) => (
                                <tr key={cat._id} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                                    <td className="py-4 font-semibold text-white">{cat.name}</td>
                                    <td className="py-4 italic text-sm text-slate-400">{cat.description || 'No description'}</td>
                                    <td className="py-4 text-right">
                                        <button 
                                            onClick={() => {
                                                setCategoryToDelete(cat._id);
                                                setShowDeleteModal(true);
                                            }}
                                            className="text-slate-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Book Modal */}
            {showBookModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-8 rounded-3xl w-full max-w-lg border border-white/10 max-h-[90vh] overflow-y-auto"
                    >
                        <h3 className="text-2xl font-bold text-white mb-6">Add New Book</h3>
                        <form onSubmit={handleAddBook} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Book Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-all"
                                        value={bookForm.title}
                                        onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Author</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-all"
                                        value={bookForm.author}
                                        onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">ISBN</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-all"
                                        value={bookForm.isbn}
                                        onChange={(e) => setBookForm({...bookForm, isbn: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Total Copies</label>
                                    <input 
                                        type="number" 
                                        required
                                        min="1"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-all"
                                        value={bookForm.totalCopies}
                                        onChange={(e) => setBookForm({...bookForm, totalCopies: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                                <select 
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-all"
                                    value={bookForm.category}
                                    onChange={(e) => setBookForm({...bookForm, category: e.target.value})}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Description (for AI AI summaries)</label>
                                <textarea 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-all h-24"
                                    value={bookForm.description}
                                    onChange={(e) => setBookForm({...bookForm, description: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-4 mt-8">
                                <button 
                                    type="button"
                                    onClick={() => setShowBookModal(false)}
                                    className="flex-1 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-500 transition-all font-semibold"
                                >
                                    Add Book
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Add Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-8 rounded-3xl w-full max-w-md border border-white/10"
                    >
                        <h3 className="text-2xl font-bold text-white mb-6">Add New Category</h3>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Category Name</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-all"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                                <textarea 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-all h-24"
                                    value={categoryForm.description}
                                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-4 mt-8">
                                <button 
                                    type="button"
                                    onClick={() => setShowCategoryModal(false)}
                                    className="flex-1 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-500 transition-all font-semibold"
                                >
                                    Create Category
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-8 rounded-3xl w-full max-w-sm border border-white/10 text-center"
                    >
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Are you sure?</h3>
                        <p className="text-slate-400 mb-8">This action cannot be undone. All books in this category will remain but will lose their category association.</p>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteCategory}
                                className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-500 transition-all font-semibold"
                            >
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
