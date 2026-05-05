import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { motion } from 'framer-motion';
import { Users, BookOpen, BookmarkCheck, RotateCcw, Plus, Trash2, Clock, Image, X } from 'lucide-react';
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
    const [bookToDelete, setBookToDelete] = useState(null);
    const [categories, setCategories] = useState([]);
    const [books, setBooks] = useState([]);
    const [students, setStudents] = useState([]);
    const [deleteType, setDeleteType] = useState(null); // 'category' or 'book'
    
    // Form States
    const [bookForm, setBookForm] = useState({ title: '', author: '', category: '', isbn: '', totalCopies: 1, description: '' });
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
    const coverInputRef = useRef(null);

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

    const fetchBooks = async () => {
        try {
            const { data } = await API.get('/admin/books');
            setBooks(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStudents = async () => {
        try {
            const { data } = await API.get('/admin/students');
            setStudents(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchAnalytics();
        fetchCategories();
        fetchBooks();
        fetchStudents();
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

    const handleDeleteBook = async () => {
        if (!bookToDelete) return;
        try {
            await API.delete(`/admin/books/${bookToDelete}`);
            setShowDeleteModal(false);
            setBookToDelete(null);
            fetchAnalytics();
            fetchBooks();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', bookForm.title);
            formData.append('author', bookForm.author);
            formData.append('category', bookForm.category);
            formData.append('isbn', bookForm.isbn);
            formData.append('totalCopies', bookForm.totalCopies);
            formData.append('description', bookForm.description);
            if (coverImageFile) formData.append('coverImage', coverImageFile);

            await API.post('/admin/books', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowBookModal(false);
            setBookForm({ title: '', author: '', category: '', isbn: '', totalCopies: 1, description: '' });
            setCoverImageFile(null);
            setCoverImagePreview(null);
            fetchAnalytics();
            fetchBooks();
        } catch (err) {
            console.error(err);
        }
    };

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImageFile(file);
            setCoverImagePreview(URL.createObjectURL(file));
        }
    };

    const removeCoverImage = () => {
        setCoverImageFile(null);
        if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
        setCoverImagePreview(null);
        if (coverInputRef.current) coverInputRef.current.value = '';
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
                                                setDeleteType('category');
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

            {/* Book Management */}
            <div className="glass-card p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-white">Book Inventory</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 border-b border-slate-800">
                                <th className="pb-4 font-medium">Book</th>
                                <th className="pb-4 font-medium">Author</th>
                                <th className="pb-4 font-medium">Category</th>
                                <th className="pb-4 font-medium">ISBN</th>
                                <th className="pb-4 font-medium">Copies</th>
                                <th className="pb-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-300">
                            {books.map((book, i) => (
                                <tr key={book._id} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            {book.coverImage ? (
                                                <img src={`${API.defaults.baseURL.replace('/api', '')}${book.coverImage}`} className="w-8 h-10 object-cover rounded shadow-sm" alt="" />
                                            ) : (
                                                <div className="w-8 h-10 bg-slate-800 rounded flex items-center justify-center text-slate-500">
                                                    <BookOpen size={14} />
                                                </div>
                                            )}
                                            <span className="font-semibold text-white">{book.title}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 text-sm text-slate-400">{book.author}</td>
                                    <td className="py-4 text-sm">
                                        <span className="bg-slate-800 px-2 py-1 rounded-lg text-slate-300">
                                            {book.category?.name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="py-4 text-sm font-mono text-slate-500">{book.isbn}</td>
                                    <td className="py-4 text-sm">{book.totalCopies}</td>
                                    <td className="py-4 text-right">
                                        <button 
                                            onClick={() => {
                                                setBookToDelete(book._id);
                                                setDeleteType('book');
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

            {/* Registered Students Management */}
            <div className="glass-card p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-white">Registered Students</h3>
                    <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                        {students.length} Total
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 border-b border-slate-800">
                                <th className="pb-4 font-medium">Full Name</th>
                                <th className="pb-4 font-medium">Student ID</th>
                                <th className="pb-4 font-medium">Email Address</th>
                                <th className="pb-4 font-medium">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-300">
                            {students.map((student) => (
                                <tr key={student._id} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center font-bold text-xs uppercase">
                                                {student.name.charAt(0)}
                                            </div>
                                            <span className="font-semibold text-white">{student.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 font-mono text-xs text-slate-400 uppercase tracking-wider">{student.studentId}</td>
                                    <td className="py-4 text-sm text-slate-400">{student.email}</td>
                                    <td className="py-4 text-xs text-slate-500">
                                        {new Date(student.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="py-10 text-center text-slate-500 italic">
                                        No students registered yet.
                                    </td>
                                </tr>
                            )}
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
                                <label className="block text-sm font-medium text-slate-400 mb-1">Description (for AI summaries)</label>
                                <textarea 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-all h-24"
                                    value={bookForm.description}
                                    onChange={(e) => setBookForm({...bookForm, description: e.target.value})}
                                />
                            </div>

                            {/* Cover Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Book Cover Image <span className="text-slate-600">(optional)</span></label>
                                {coverImagePreview ? (
                                    <div className="relative group w-full">
                                        <img 
                                            src={coverImagePreview} 
                                            alt="Cover preview" 
                                            className="w-full h-48 object-cover rounded-xl border border-slate-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeCoverImage}
                                            className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-lg">
                                            {coverImageFile?.name}
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => coverInputRef.current?.click()}
                                        className="w-full h-36 border-2 border-dashed border-slate-700 hover:border-primary-500 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-primary-400 transition-all"
                                    >
                                        <Image size={28} />
                                        <span className="text-sm font-medium">Click to upload cover image</span>
                                        <span className="text-xs">JPG, PNG, WebP up to 5MB</span>
                                    </button>
                                )}
                                <input
                                    ref={coverInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                    onChange={handleCoverImageChange}
                                    className="hidden"
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
                        <p className="text-slate-400 mb-8">
                            {deleteType === 'category' 
                                ? 'This action cannot be undone. All books in this category will remain but will lose their category association.'
                                : 'This action cannot be undone. This book will be permanently removed from the library.'}
                        </p>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setCategoryToDelete(null);
                                    setBookToDelete(null);
                                }}
                                className="flex-1 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={deleteType === 'category' ? handleDeleteCategory : handleDeleteBook}
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
