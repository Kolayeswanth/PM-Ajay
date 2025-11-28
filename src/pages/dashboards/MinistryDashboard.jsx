import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../../components/NotificationBell';
import DashboardSidebar from '../../components/DashboardSidebar';
import { useAuth } from '../../contexts/AuthContext';
import DashboardPanel from './ministry/DashboardPanel';
import ManageStateAdmins from './ministry/ManageStateAdmins';
import FundAllocation from './ministry/FundAllocation';
import FundReleased from './ministry/FundReleased';
import AnnualPlansApproval from './ministry/AnnualPlansApproval';
import MonitorProgress from './ministry/MonitorProgress';
import IssueNotifications from './ministry/IssueNotifications';
import ReportsAnalytics from './ministry/ReportsAnalytics';
import HelpSupport from './ministry/HelpSupport';

const MinistryDashboard = () => {
    const [selectedState, setSelectedState] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();
    const { logout } = useAuth();

    // Scroll to top when dashboard loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);


    const sidebarMenu = [
        { icon: '📊', label: 'Dashboard', action: () => setActiveTab('dashboard'), active: activeTab === 'dashboard' },
        { icon: '👥', label: 'Manage State Admins', action: () => setActiveTab('admins'), active: activeTab === 'admins' },
        { icon: '💰', label: 'Fund Allocation', action: () => setActiveTab('funds'), active: activeTab === 'funds' },
        { icon: '💸', label: 'Fund Released', action: () => setActiveTab('released'), active: activeTab === 'released' },
        { icon: '✅', label: 'Annual Plans Approval', action: () => setActiveTab('plans'), active: activeTab === 'plans' },
        { icon: '📈', label: 'Monitor Progress', action: () => setActiveTab('monitor'), active: activeTab === 'monitor' },
        { icon: '📢', label: 'Notifications/Circulars', action: () => setActiveTab('notifications'), active: activeTab === 'notifications' },
        { icon: '📑', label: 'Reports & Analytics', action: () => setActiveTab('reports'), active: activeTab === 'reports' },
        { icon: '❓', label: 'Help/Support', action: () => setActiveTab('help'), active: activeTab === 'help' },
        { icon: '🚪', label: 'Logout', action: () => { logout(); navigate('/login'); } }
    ];


    const formatCurrency = (amount) => {
        return `₹${(amount / 10000000000).toFixed(2)} Cr`;
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <DashboardPanel
                        selectedState={selectedState}
                        setSelectedState={setSelectedState}
                        selectedDistrict={selectedDistrict}
                        setSelectedDistrict={setSelectedDistrict}
                        formatCurrency={formatCurrency}
                    />
                );
            case 'admins':
                return <ManageStateAdmins />;
            case 'funds':
                return <FundAllocation formatCurrency={formatCurrency} />;
            case 'released':
                return <FundReleased formatCurrency={formatCurrency} />;
            case 'plans':
                return <AnnualPlansApproval />;
            case 'monitor':
                return <MonitorProgress />;
            case 'notifications':
                return <IssueNotifications />;
            case 'reports':
                return <ReportsAnalytics />;
            case 'help':
                return <HelpSupport />;
            default:
                return (
                    <DashboardPanel
                        selectedState={selectedState}
                        setSelectedState={setSelectedState}
                        selectedDistrict={selectedDistrict}
                        setSelectedDistrict={setSelectedDistrict}
                        formatCurrency={formatCurrency}
                    />
                );
        }
    };

    const getBreadcrumb = () => {
        const labels = {
            'dashboard': 'Dashboard',
            'admins': 'Manage State Admins',
            'funds': 'Fund Allocation',
            'released': 'Fund Released',
            'plans': 'Annual Plans Approval',
            'monitor': 'Monitor Progress',
            'notifications': 'Notifications & Circulars',
            'reports': 'Reports & Analytics',
            'help': 'Help & Support'
        };
        return `Home > ${labels[activeTab] || 'Dashboard'}`;
    };

    return (
        <div className="dashboard-layout">
            <DashboardSidebar menuItems={sidebarMenu} />

            <main className="dashboard-main">
                <div className="dashboard-header">
                    <div className="dashboard-title-section" style={{ marginTop: '1.5rem' }}>
                        <h1>Ministry Dashboard</h1>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
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

export default MinistryDashboard;
