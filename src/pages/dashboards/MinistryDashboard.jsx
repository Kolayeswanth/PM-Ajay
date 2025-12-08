import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../../components/NotificationBell';
import DashboardSidebar from '../../components/DashboardSidebar';
import DashboardHeader from '../../components/DashboardHeader';
import { useAuth } from '../../contexts/AuthContext';
import DashboardPanel from './ministry/DashboardPanel';
import ManageStateAdmins from './ministry/ManageStateAdmins';
import FundAllocation from './ministry/FundAllocation';
import FundReleased from './ministry/FundReleased';
import AnnualPlansApproval from './ministry/AnnualPlansApproval';
import AnnualActionPlan from './ministry/AnnualActionPlan';
import MonitorProgress from './ministry/MonitorProgress';
import IssueNotifications from './ministry/IssueNotifications';
import ReportsAnalytics from './ministry/ReportsAnalytics';
import HelpSupport from './ministry/HelpSupport';
import AllProjects from './ministry/AllProjects';

import {
    LayoutDashboard,
    Users,
    Wallet,
    Send,
    FileCheck,
    LineChart,
    Bell,
    FileBarChart,
    HelpCircle,
    LogOut,
    FileText,
    Phone,
    MessageCircle
} from 'lucide-react';

const MinistryDashboard = () => {
    const [selectedState, setSelectedState] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Scroll to top when dashboard loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const toggleSidebar = () => {
        console.log('Toggle sidebar clicked! Current state:', isSidebarOpen);
        setIsSidebarOpen(!isSidebarOpen);
        console.log('New state will be:', !isSidebarOpen);
    };


    const sidebarMenu = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', action: () => setActiveTab('dashboard'), active: activeTab === 'dashboard' },
        { icon: <Users size={20} />, label: 'Manage State Admins', action: () => setActiveTab('admins'), active: activeTab === 'admins' },
        { icon: <Wallet size={20} />, label: 'Fund Allocation', action: () => setActiveTab('funds'), active: activeTab === 'funds' },
        { icon: <Send size={20} />, label: 'Fund Released', action: () => setActiveTab('released'), active: activeTab === 'released' },
        { icon: <FileCheck size={20} />, label: 'Project Approval', action: () => setActiveTab('plans'), active: activeTab === 'plans' },
        { icon: <FileText size={20} />, label: 'Annual Plan Approvals', action: () => setActiveTab('aap'), active: activeTab === 'aap' },
        { icon: <LineChart size={20} />, label: 'Monitor Progress', action: () => setActiveTab('monitor'), active: activeTab === 'monitor' },
        { icon: <Bell size={20} />, label: 'Notifications/Circulars', action: () => setActiveTab('notifications'), active: activeTab === 'notifications' },
        { icon: <FileBarChart size={20} />, label: 'Reports & Analytics', action: () => setActiveTab('reports'), active: activeTab === 'reports' },
        { icon: <HelpCircle size={20} />, label: 'Help/Support', action: () => setActiveTab('help'), active: activeTab === 'help' },
        { icon: <LogOut size={20} />, label: 'Logout', action: () => { logout(); navigate('/login'); }, isLogout: true }
    ];


    const formatCurrency = (amount) => {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
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
            case 'aap':
                return <AnnualActionPlan />;
            case 'monitor':
                return <MonitorProgress />;
            case 'notifications':
                return <IssueNotifications />;
            case 'reports':
                return <ReportsAnalytics />;
            case 'help':
                return <HelpSupport />;
            case 'allProjects':
                return <AllProjects />;
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
            'plans': 'Project Approval',
            'aap': 'Annual Plan Approvals',
            'monitor': 'Monitor Progress',
            'notifications': 'Notifications & Circulars',
            'reports': 'Reports & Analytics',
            'help': 'Help & Support',
            'allProjects': 'All Projects'
        };
        return `Home > ${labels[activeTab] || 'Dashboard'}`;
    };



    return (
        <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <DashboardHeader
                toggleSidebar={toggleSidebar}
                breadcrumb={getBreadcrumb()}
                showNotificationBell={false}
            />
            <DashboardSidebar menuItems={sidebarMenu} user={user} isOpen={isSidebarOpen} />

            <main className="dashboard-main">
                <div className="dashboard-header">
                    <div className="dashboard-title-section">
                        <h3 style={{ margin: 0 }}>Ministry Dashboard</h3>
                    </div>
                    <div className="dashboard-actions">
                        <button
                            onClick={() => setActiveTab('allProjects')}
                            style={{
                                backgroundColor: '#25D366',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                marginRight: '12px',
                                boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#20BA5A';
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#25D366';
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(37, 211, 102, 0.3)';
                            }}
                            title="Messages"
                        >
                            <MessageCircle size={20} />
                        </button>
                        <NotificationBell userRole="ministry" />
                    </div>
                </div>
                {renderContent()}
            </main>
        </div>
    );
};

export default MinistryDashboard;
