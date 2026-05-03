import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Library from './pages/Library';
import Marketplace from './pages/Marketplace';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import BookRequests from './pages/BookRequests';
import IssuedBooks from './pages/IssuedBooks';

const App = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="h-screen flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen">
            {user && <Navbar />}
            <main className={user ? "container mx-auto p-4" : ""}>
                <Routes>
                    <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
                    <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
                    
                    {/* Protected Routes */}
                    <Route path="/" element={user ? (user.role === 'Admin' ? <AdminDashboard /> : <StudentDashboard />) : <Navigate to="/login" />} />
                    <Route path="/library" element={user ? <Library /> : <Navigate to="/login" />} />
                    <Route path="/marketplace" element={user ? <Marketplace /> : <Navigate to="/login" />} />
                    <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} />
                    <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                    
                    {/* Admin Only Routes */}
                    <Route path="/requests" element={user?.role === 'Admin' ? <BookRequests /> : <Navigate to="/" />} />
                    <Route path="/issued" element={user?.role === 'Admin' ? <IssuedBooks /> : <Navigate to="/" />} />
                </Routes>
            </main>
        </div>
    );
};

export default App;
