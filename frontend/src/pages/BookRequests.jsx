import { useState, useEffect } from 'react';
import API from '../api/axios';
import { motion } from 'framer-motion';
import { Check, X, BookmarkPlus, User, Book as BookIcon, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BookRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [returnDate, setReturnDate] = useState('');

    const fetchRequests = async () => {
        try {
            const { data } = await API.get('/requests/admin');
            setRequests(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id) => {
        try {
            await API.patch(`/requests/${id}/approve`);
            toast.success('Request approved');
            fetchRequests();
        } catch (err) {
            toast.error('Action failed');
        }
    };

    const handleReject = async (id) => {
        try {
            await API.patch(`/requests/${id}/reject`);
            toast.success('Request rejected');
            fetchRequests();
        } catch (err) {
            toast.error('Action failed');
        }
    };

    const handleIssue = async (e) => {
        e.preventDefault();
        try {
            await API.patch(`/requests/${selectedRequest._id}/issue`, { returnDate });
            toast.success('Book issued successfully!');
            setSelectedRequest(null);
            setReturnDate('');
            fetchRequests();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to issue book');
        }
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">Book Requests</h1>
                <p className="text-slate-400">Manage student requests for library books</p>
            </header>

            {loading ? (
                <div className="text-center text-white py-20">Loading requests...</div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {requests.map((req, i) => (
                        <motion.div
                            key={req._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-primary-400">
                                    <BookIcon size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{req.bookId?.title}</h3>
                                    <p className="text-sm text-slate-400 flex items-center gap-2">
                                        <User size={14} className="text-slate-500" />
                                        {req.studentId?.name} ({req.studentId?.studentId})
                                    </p>
                                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                        <Calendar size={12} />
                                        Requested on {new Date(req.requestedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    req.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' :
                                    req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' :
                                    req.status === 'Issued' ? 'bg-blue-500/10 text-blue-400' :
                                    'bg-red-500/10 text-red-400'
                                }`}>
                                    {req.status}
                                </div>

                                <div className="flex gap-2">
                                    {req.status === 'Pending' && (
                                        <>
                                            <button 
                                                onClick={() => handleApprove(req._id)}
                                                className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-all"
                                                title="Approve"
                                            >
                                                <Check size={20} />
                                            </button>
                                            <button 
                                                onClick={() => handleReject(req._id)}
                                                className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                                                title="Reject"
                                            >
                                                <X size={20} />
                                            </button>
                                        </>
                                    )}
                                    {req.status === 'Approved' && (
                                        <button 
                                            onClick={() => setSelectedRequest(req)}
                                            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                                        >
                                            <BookmarkPlus size={18} />
                                            Issue Book
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {requests.length === 0 && (
                        <div className="glass-card p-12 rounded-3xl text-center">
                            <p className="text-slate-400 italic">No book requests found.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Issue Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card w-full max-w-md p-8 rounded-3xl"
                    >
                        <h2 className="text-2xl font-bold text-white mb-2">Issue Book</h2>
                        <p className="text-slate-400 text-sm mb-6">
                            Issuing <span className="text-white font-bold">{selectedRequest.bookId?.title}</span> to <span className="text-white font-bold">{selectedRequest.studentId?.name}</span>
                        </p>
                        
                        <form onSubmit={handleIssue} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Return Date</label>
                                <input 
                                    type="date" 
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-all"
                                    value={returnDate}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setSelectedRequest(null)}
                                    className="flex-1 px-4 py-3 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-500 transition-all font-bold"
                                >
                                    Confirm Issue
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default BookRequests;
