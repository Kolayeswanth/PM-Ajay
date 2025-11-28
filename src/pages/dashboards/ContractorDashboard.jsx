import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../../components/NotificationBell';
import DashboardSidebar from '../../components/DashboardSidebar';
import { useAuth } from '../../contexts/AuthContext';
import ContractorDashboardPanel from './contractor/ContractorDashboardPanel';
import AssignedWorks from './contractor/AssignedWorks';
import WorkProgress from './contractor/WorkProgress';
import PaymentStatus from './contractor/PaymentStatus';
import ContractorHelp from './contractor/ContractorHelp';

const ContractorDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // --- Lifted State ---
    const [works, setWorks] = useState([
        { id: 101, title: 'Construction of Community Hall', location: 'Shirur GP', amount: '₹15,00,000', date: '2025-10-01', deadline: '2026-03-31', status: 'In Progress', progress: 45 },
        { id: 102, title: 'Road Upgradation (Phase 1)', location: 'Khed GP', amount: '₹25,00,000', date: '2025-11-15', deadline: '2026-05-15', status: 'Not Started', progress: 0 },
        { id: 103, title: 'Solar Street Light Installation', location: 'Baramati GP', amount: '₹8,00,000', date: '2025-09-01', deadline: '2025-12-01', status: 'Completed', progress: 100 },
    ]);

    // --- Handlers ---
    const handleUpdateProgress = (updatedWork) => {
        setWorks(works.map(w => w.id === updatedWork.id ? updatedWork : w));
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // Calculate Stats
    const stats = {
        totalWorks: works.length,
        ongoing: works.filter(w => w.status === 'In Progress').length,
        completed: works.filter(w => w.status === 'Completed').length,
        pendingPayments: 1000000 // Mock value
    };

    const sidebarMenu = [
        { icon: '📊', label: 'Dashboard', action: () => setActiveTab('dashboard'), active: activeTab === 'dashboard' },
        { icon: '📋', label: 'Assigned Works', action: () => setActiveTab('assigned-works'), active: activeTab === 'assigned-works' },
        { icon: '📈', label: 'Update Progress', action: () => setActiveTab('work-progress'), active: activeTab === 'work-progress' },
        { icon: '💰', label: 'Payment Status', action: () => setActiveTab('payment-status'), active: activeTab === 'payment-status' },
        { icon: '❓', label: 'Help', action: () => setActiveTab('help'), active: activeTab === 'help' },
        { icon: '🚪', label: 'Logout', action: () => { logout(); navigate('/login'); } }
    ];

    const formatCurrency = (amount) => {
        return `₹${(amount / 100000).toFixed(2)} Lakh`;
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <ContractorDashboardPanel
                    formatCurrency={formatCurrency}
                    stats={stats}
                    recentWorks={works.slice(0, 3)}
                    onNavigate={handleTabChange}
                />;
            case 'assigned-works':
                return <AssignedWorks works={works} />;
            case 'work-progress':
                return <WorkProgress works={works} onUpdateProgress={handleUpdateProgress} />;
            case 'payment-status':
                return <PaymentStatus />;
            case 'help':
                return <ContractorHelp />;
            default:
                return <ContractorDashboardPanel formatCurrency={formatCurrency} stats={stats} recentWorks={works.slice(0, 3)} onNavigate={handleTabChange} />;
        }
    };

    const getBreadcrumb = () => {
        const labels = {
            'dashboard': 'Dashboard',
            'assigned-works': 'Assigned Works',
            'work-progress': 'Update Progress',
            'payment-status': 'Payment Status',
            'help': 'Help'
        };
        return `Home > ${labels[activeTab] || 'Dashboard'}`;
    };

    return (
        <div className="dashboard-layout">
            <DashboardSidebar menuItems={sidebarMenu} />

            <main className="dashboard-main">
                <div className="dashboard-header">
                    <div className="dashboard-title-section">
                        <h1>{user?.role === 'executing_agency' ? `${user?.full_name || user?.user_metadata?.full_name || 'Executing Agency'} Dashboard` : 'Contractor Dashboard'}</h1>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                            {getBreadcrumb()}
                        </p>
                    </div>
                    <div className="dashboard-actions">
                        <NotificationBell />
                    </div>
                </div>

                {renderContent()}
            </main>
        </div>
    );
};

export default ContractorDashboard;
