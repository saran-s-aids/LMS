import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Book, ShoppingBag, MessageSquare, LayoutDashboard, User as UserIcon, Clock, BookmarkCheck } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass sticky top-0 z-50 px-6 py-4 mb-8 flex items-center justify-between mx-4 mt-4">
            <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="bg-primary-500 p-1.5 rounded-lg shadow-lg shadow-primary-500/30">
                    <Book size={24} />
                </span>
                SmartLMS
            </Link>

            <div className="flex items-center gap-6">
                <Link to="/" className="text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors font-medium">
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                </Link>
                <Link to="/library" className="text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors font-medium">
                    <Book size={18} />
                    <span>Library</span>
                </Link>

                {user?.role === 'Admin' && (
                    <>
                        <Link to="/requests" className="text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors font-medium">
                            <Clock size={18} />
                            <span>Requests</span>
                        </Link>
                        <Link to="/issued" className="text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors font-medium">
                            <BookmarkCheck size={18} />
                            <span>Issued</span>
                        </Link>
                    </>
                )}

                <Link to="/marketplace" className="text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors font-medium">
                    <ShoppingBag size={18} />
                    <span>Marketplace</span>
                </Link>
                <Link to="/chat" className="text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors font-medium">
                    <MessageSquare size={18} />
                    <span>Chat</span>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 text-white bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-all border border-white/10">
                    <UserIcon size={18} />
                    <span className="text-sm font-bold">{user?.name}</span>
                </Link>
                <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
