import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../../components/NotificationBell';
import DashboardSidebar from '../../components/DashboardSidebar';
import { useAuth } from '../../contexts/AuthContext';
import DistrictDashboardPanel from './district/DistrictDashboardPanel';
import ManageGPAdmins from './district/ManageGPAdmins';
import FundReleaseToGP from './district/FundReleaseToGP';
import ApproveGPProposals from './district/ApproveGPProposals';
import UploadUCs from './district/UploadUCs';
import DistrictReports from './district/DistrictReports';
import DistrictNotifications from './district/DistrictNotifications';
import DistrictHelp from './district/DistrictHelp';

const DistrictDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();
    const { logout } = useAuth();

    const sidebarMenu = [
        { icon: '📊', label: 'Dashboard', action: () => setActiveTab('dashboard'), active: activeTab === 'dashboard' },
        { icon: '👥', label: 'Manage GP Admins', action: () => setActiveTab('admins'), active: activeTab === 'admins' },
        { icon: '💰', label: 'Fund Release to GPs', action: () => setActiveTab('funds'), active: activeTab === 'funds' },
        { icon: '✅', label: 'Approve GP Proposals', action: () => setActiveTab('proposals'), active: activeTab === 'proposals' },
        { icon: '📄', label: 'Upload UCs', action: () => setActiveTab('ucs'), active: activeTab === 'ucs' },
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
                return <DistrictDashboardPanel formatCurrency={formatCurrency} />;
            case 'admins':
                return <ManageGPAdmins />;
            case 'funds':
                return <FundReleaseToGP formatCurrency={formatCurrency} />;
            case 'proposals':
                return <ApproveGPProposals />;
            case 'ucs':
                return <UploadUCs />;
            case 'reports':
                return <DistrictReports />;
            case 'notifications':
                return <DistrictNotifications />;
            case 'help':
                return <DistrictHelp />;
            default:
                return <DistrictDashboardPanel formatCurrency={formatCurrency} />;
        }
    };

    const getBreadcrumb = () => {
        const labels = {
            'dashboard': 'Dashboard',
            'admins': 'Manage GP Admins',
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
                        <h1>District Dashboard - Pune</h1>
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

export default DistrictDashboard;
