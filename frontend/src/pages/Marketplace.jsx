import { useState, useEffect } from 'react';
import API from '../api/axios';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Plus, MessageSquare, Tag, User, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Marketplace = () => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newItem, setNewItem] = useState({ title: '', price: '', description: '', category: 'Books' });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchItems = async () => {
        try {
            const { data } = await API.get(`/marketplace?keyword=${keyword}`);
            setItems(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [keyword]);

    const handleCreateListing = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', newItem.title);
        formData.append('price', newItem.price);
        formData.append('description', newItem.description);
        formData.append('category', newItem.category);
        if (image) formData.append('image', image);

        try {
            await API.post('/marketplace', formData);
            setShowModal(false);
            toast.success('Listing created successfully!');
            fetchItems();
        } catch (err) {
            toast.error('Failed to create listing');
        }
    };

    const handleDeleteListing = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;
        try {
            await API.delete(`/marketplace/${id}`);
            toast.success('Listing deleted!');
            fetchItems();
        } catch (err) {
            toast.error('Failed to delete listing');
        }
    };

    const handleContactSeller = async (item) => {
        try {
            const { data } = await API.post('/chat/conversations/marketplace', {
                sellerId: item.sellerId._id,
                marketplaceItemId: item._id
            });
            navigate('/chat', { state: { conversationId: data._id, name: item.sellerId.name, itemTitle: item.title } });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to start conversation');
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Student Marketplace</h1>
                    <p className="text-slate-400">Buy and sell books within the campus community</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text"
                            placeholder="Search items..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    {user?.role === 'Student' && (
                        <button 
                            onClick={() => setShowModal(true)}
                            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
                        >
                            <Plus size={18} />
                            List Item
                        </button>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item, i) => (
                    <motion.div 
                        key={item._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card overflow-hidden rounded-2xl group flex flex-col"
                    >
                        <div className="h-48 bg-slate-800 relative">
                            {item.image ? (
                                <img 
                                    src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}/${item.image}`} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-700">
                                    <ShoppingBag size={48} />
                                </div>
                            )}
                            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-emerald-400 font-bold flex items-center gap-1">
                                <Tag size={14} />
                                ${item.price}
                            </div>
                        </div>
                        
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{item.title}</h3>
                            <p className="text-slate-400 text-xs mb-4 line-clamp-2">{item.description}</p>
                            
                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-800">
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <User size={12} />
                                    <span className="truncate max-w-[80px]">{item.sellerId?.name}</span>
                                </div>
                                <div className="flex gap-2">
                                    {(user?._id === item.sellerId?._id || user?.role === 'Admin') && (
                                        <button 
                                            onClick={() => handleDeleteListing(item._id)}
                                            className="text-red-400 hover:text-red-300 p-2 bg-red-500/10 rounded-lg transition-colors"
                                            title="Delete Listing"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    {user?._id !== item.sellerId?._id && (
                                        <button 
                                            onClick={() => handleContactSeller(item)}
                                            className="text-primary-400 hover:text-primary-300 flex items-center gap-1.5 text-xs font-bold p-2 bg-primary-500/10 rounded-lg transition-colors"
                                        >
                                            <MessageSquare size={16} />
                                            Contact
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {!loading && items.length === 0 && (
                <div className="glass-card p-12 rounded-3xl text-center">
                    <p className="text-slate-400 italic">No marketplace items found.</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card w-full max-w-lg p-8 rounded-3xl"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6">List Item for Sale</h2>
                        <form onSubmit={handleCreateListing} className="space-y-4">
                            <input 
                                type="text"
                                placeholder="Item Title"
                                required
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                            />
                            <div className="flex gap-4">
                                <input 
                                    type="number"
                                    placeholder="Price ($)"
                                    required
                                    className="w-1/2 bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                                />
                                <select 
                                    className="w-1/2 bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                                >
                                    <option>Books</option>
                                    <option>Notes</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <textarea 
                                placeholder="Description"
                                required
                                rows="3"
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                            ></textarea>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Item Image</label>
                                <input 
                                    type="file"
                                    onChange={(e) => setImage(e.target.files[0])}
                                    className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-500"
                                />
                            </div>
                            
                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="w-1/2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="w-1/2 bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-xl transition-all"
                                >
                                    Create Listing
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Marketplace;
