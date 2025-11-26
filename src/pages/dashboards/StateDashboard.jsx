import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../../components/NotificationBell';
import DashboardSidebar from '../../components/DashboardSidebar';
import { useAuth } from '../../contexts/AuthContext';
import StateDashboardPanel from './state/StateDashboardPanel';
import ManageDistrictAdmins from './state/ManageDistrictAdmins';
import FundRelease from './state/FundRelease';
import ApproveProposals from './state/ApproveProposals';
import UploadUC from './state/UploadUC';
import StateReports from './state/StateReports';
import StateNotifications from './state/StateNotifications';
import StateHelp from './state/StateHelp';

const StateDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();
    const { logout } = useAuth();

    const sidebarMenu = [
        { icon: '📊', label: 'Dashboard', action: () => setActiveTab('dashboard'), active: activeTab === 'dashboard' },
        { icon: '👥', label: 'Manage District Admins', action: () => setActiveTab('admins'), active: activeTab === 'admins' },
        { icon: '💰', label: 'Fund Release to Districts', action: () => setActiveTab('funds'), active: activeTab === 'funds' },
        { icon: '✅', label: 'Approve District Proposals', action: () => setActiveTab('proposals'), active: activeTab === 'proposals' },
        { icon: '📄', label: 'Upload Utilisation Certificates', action: () => setActiveTab('ucs'), active: activeTab === 'ucs' },
        { icon: '📊', label: 'Reports', action: () => setActiveTab('reports'), active: activeTab === 'reports' },
        { icon: '🔔', label: 'Notifications', action: () => setActiveTab('notifications'), active: activeTab === 'notifications' },
        { icon: '❓', label: 'Help', action: () => setActiveTab('help'), active: activeTab === 'help' },
        { icon: '🚪', label: 'Logout', action: () => { logout(); navigate('/login'); } }
    ];

    const formatCurrency = (amount) => {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <StateDashboardPanel formatCurrency={formatCurrency} />;
            case 'admins':
                return <ManageDistrictAdmins />;
            case 'funds':
                return <FundRelease formatCurrency={formatCurrency} />;
            case 'proposals':
                return <ApproveProposals />;
            case 'ucs':
                return <UploadUC />;
            case 'reports':
                return <StateReports />;
            case 'notifications':
                return <StateNotifications />;
            case 'help':
                return <StateHelp />;
            default:
                return <StateDashboardPanel formatCurrency={formatCurrency} />;
        }
    };

    const getBreadcrumb = () => {
        const labels = {
            'dashboard': 'Dashboard',
            'admins': 'Manage District Admins',
            'funds': 'Fund Release',
            'proposals': 'Approve Proposals',
            'ucs': 'Upload UCs',
            'reports': 'Reports',
            'notifications': 'Notifications',
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
                        <h1>State Dashboard - Maharashtra</h1>
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

export default StateDashboard;
