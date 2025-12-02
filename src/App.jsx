import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth, ROLES } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import AdarshGram from './pages/AdarshGram';
import ContactUs from './pages/pm-contactUs/ContactUs';
import Login from './pages/Login';
import DashboardRouter from './pages/dashboards/DashboardRouter';
import PublicDashboard from './pages/dashboards/PublicDashboard';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                fontSize: 'var(--text-xl)'
            }}>
                Loading...
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Main App Layout
const AppLayout = ({ children }) => {
    const location = useLocation();
    const { user } = useAuth();

    // Hide global header on dashboard for PUBLIC users, Ministry users, and State users (who have custom header)
    const shouldHideHeader = location.pathname === '/dashboard' && (user?.role === ROLES.PUBLIC || user?.role === ROLES.MINISTRY || user?.role === ROLES.STATE);

    return (
        <>
            {!shouldHideHeader && <Header />}
            <main style={{ flex: 1, marginTop: shouldHideHeader ? 0 : 'var(--header-height)' }}>
                {children}
            </main>
        </>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <ScrollToTop />
                <AppLayout>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/adarsh-gram" element={<AdarshGram />} />
                        <Route path="/contact-us" element={<ContactUs />} />
                        <Route path="/login" element={<Login />} />

                        {/* Protected Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <DashboardRouter />
                                </ProtectedRoute>
                            }
                        />

                        {/* Placeholder routes for future implementation */}
                        <Route path="/public-dashboard" element={<PublicDashboard />} />
                        <Route path="/reports" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>Reports (Coming Soon)</h1></div></ProtectedRoute>} />
                        <Route path="/fund-allocation" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>Fund Allocation (Coming Soon)</h1></div></ProtectedRoute>} />
                        <Route path="/districts" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>Districts Management (Coming Soon)</h1></div></ProtectedRoute>} />
                        <Route path="/fund-release" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>Fund Release (Coming Soon)</h1></div></ProtectedRoute>} />
                        <Route path="/proposals" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>Proposals (Coming Soon)</h1></div></ProtectedRoute>} />
                        <Route path="/works" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>Works Management (Coming Soon)</h1></div></ProtectedRoute>} />
                        <Route path="/my-projects" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>My Projects (Coming Soon)</h1></div></ProtectedRoute>} />
                        <Route path="/new-proposal" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>New Proposal (Coming Soon)</h1></div></ProtectedRoute>} />
                        <Route path="/work-orders" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>Work Orders (Coming Soon)</h1></div></ProtectedRoute>} />
                        <Route path="/dpr-upload" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>DPR Upload (Coming Soon)</h1></div></ProtectedRoute>} />
                        <Route path="/assigned-works" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>Assigned Works (Coming Soon)</h1></div></ProtectedRoute>} />
                        <Route path="/progress-update" element={<ProtectedRoute><div className="container" style={{ padding: 'var(--space-8)' }}><h1>Progress Update (Coming Soon)</h1></div></ProtectedRoute>} />

                        {/* 404 Route */}
                        <Route path="*" element={
                            <div className="page-wrapper">
                                <div className="page-content">
                                    <div className="container" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                                        <h1 style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-4)' }}>404</h1>
                                        <p style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>Page Not Found</p>
                                        <a href="/" className="btn btn-primary">Go to Homepage</a>
                                    </div>
                                </div>
                            </div>
                        } />
                    </Routes>
                </AppLayout>
            </Router>
        </AuthProvider>
    );
}

export default App;
