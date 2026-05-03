import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Save, CheckCircle } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.put('/auth/profile', { name, email, password });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto py-10">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 rounded-3xl"
            >
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-primary-500/20">
                        {user?.name[0]}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">{user?.name}</h1>
                        <p className="text-slate-400 flex items-center gap-1 mt-1">
                            <Shield size={14} className="text-primary-400" />
                            {user?.role} • {user?.studentId || 'Administrator'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input 
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 ml-1">Change Password (Leave blank to keep current)</label>
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-2">
                            {success && (
                                <motion.span 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-emerald-400 flex items-center gap-1 text-sm"
                                >
                                    <CheckCircle size={16} />
                                    Profile updated successfully!
                                </motion.span>
                            )}
                        </div>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            <Save size={20} />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Profile;
