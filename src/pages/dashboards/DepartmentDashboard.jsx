import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../../components/NotificationBell';
import DashboardSidebar from '../../components/DashboardSidebar';
import { useAuth } from '../../contexts/AuthContext';
import DepartmentDashboardPanel from './department/DepartmentDashboardPanel';
import WorkOrders from './department/WorkOrders';
import DPRUpload from './department/DPRUpload';
import DepartmentReports from './department/DepartmentReports';
import DepartmentNotifications from './department/DepartmentNotifications';
import DepartmentHelp from './department/DepartmentHelp';
import ManageExecutingAgencies from './department/ManageExecutingAgencies';
import { mockProjects } from '../../data/mockData';

const DepartmentDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // --- Lifted State ---

    // Projects (Initialize with mock data filtered for department)
    const [projects, setProjects] = useState(
        mockProjects.filter(p => p.component === 'Infrastructure' || p.component === 'Adarsh Gram')
    );

    // Work Orders (Initialize with data from WorkService)
    const [workOrders, setWorkOrders] = useState([]);

    const loadWorkOrders = () => {
        import('../../services/WorkService').then(({ WorkService }) => {
            WorkService.getAllWorks().then(data => {
                setWorkOrders(data);
            });
        });
    };

    useEffect(() => {
        loadWorkOrders();
        // Add event listener for storage changes to sync across tabs/windows
        window.addEventListener('storage', loadWorkOrders);
        return () => window.removeEventListener('storage', loadWorkOrders);
    }, []);

    // DPRs (Initialize with sample data from DPRUpload.jsx)
    const [dprs, setDprs] = useState([
        { id: 1, title: 'New Community Center', location: 'Shirur GP', estimatedCost: '0.50 Cr', date: '2025-11-20', status: 'Submitted', file: 'dpr_shirur_cc.pdf' },
        { id: 2, title: 'Village Road Phase 2', location: 'Khed GP', estimatedCost: '0.80 Cr', date: '2025-11-18', status: 'Draft', file: 'dpr_khed_road.pdf' },
    ]);

    // --- Handlers ---

    const handleAddDPR = (newDPR) => {
        setDprs([newDPR, ...dprs]);
    };

    const handleUpdateWorkOrder = (updatedOrder) => {
        import('../../services/WorkService').then(({ WorkService }) => {
            // Department updates status, not progress details, so pass empty officer details or handle differently
            // For now, we just update the status which is part of updatedOrder
            WorkService.updateWork(updatedOrder, {}).then(newWorks => {
                setWorkOrders(newWorks);
            });
        });
    };

    const handleViewProgress = (updatedWorks) => {
        setWorkOrders(updatedWorks);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // Calculate Stats for Dashboard Panel
    const stats = {
        totalWorks: workOrders.length,
        ongoing: workOrders.filter(o => o.status === 'In Progress').length,
        completed: workOrders.filter(o => o.status === 'Completed').length,
        pendingDPR: dprs.filter(d => d.status === 'Draft' || d.status === 'Submitted').length,
        fundsAllocated: 150000000, // Static for now
        fundsUtilized: 85000000 // Static for now
    };

    const sidebarMenu = [
        { icon: '📊', label: 'Dashboard', action: () => setActiveTab('dashboard'), active: activeTab === 'dashboard' },
        { icon: '📋', label: 'Work Progress', action: () => setActiveTab('work-orders'), active: activeTab === 'work-orders' },
        { icon: '📤', label: 'DPR Upload', action: () => setActiveTab('dpr-upload'), active: activeTab === 'dpr-upload' },
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
                return <DepartmentDashboardPanel
                    formatCurrency={formatCurrency}
                    stats={stats}
                    recentOrders={workOrders.slice(0, 3)}
                    projects={projects}
                    onNavigate={handleTabChange}
                />;
            case 'executing-agencies':
                return <ManageExecutingAgencies />;
            case 'work-orders':
                return <WorkOrders
                    orders={workOrders}
                    onUpdateOrder={handleUpdateWorkOrder}
                    onViewProgress={handleViewProgress}
                />;
            case 'dpr-upload':
                return <DPRUpload
                    dprs={dprs}
                    onAddDPR={handleAddDPR}
                />;
            case 'reports':
                return <DepartmentReports />;
            case 'notifications':
                return <DepartmentNotifications />;
            case 'help':
                return <DepartmentHelp />;
            default:
                return <DepartmentDashboardPanel formatCurrency={formatCurrency} stats={stats} recentOrders={workOrders.slice(0, 3)} projects={projects} onNavigate={handleTabChange} />;
        }
    };

    const getBreadcrumb = () => {
        const labels = {
            'dashboard': 'Dashboard',
            'executing-agencies': 'Manage Executing Agencies',
            'work-orders': 'Work Orders',
            'work-orders': 'Work Progress',
            'dpr-upload': 'DPR Upload',
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
                        <h1>{user?.role === 'implementing_agency' ? `${user?.full_name || user?.user_metadata?.full_name || 'Implementing Agency'} Dashboard` : 'Department Dashboard - PWD'}</h1>
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

export default DepartmentDashboard;
