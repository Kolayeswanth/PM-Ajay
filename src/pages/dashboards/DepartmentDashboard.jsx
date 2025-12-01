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
import AssignProjects from './department/AssignProjects';
import AgencyProjects from './department/AgencyProjects';
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
    // Work Orders (Initialize with data from WorkService)
    const [workOrders, setWorkOrders] = useState([]);

    const loadWorkOrders = async () => {
        if (!user) return;

        const { WorkService } = await import('../../services/WorkService');
        const { supabase } = await import('../../lib/supabaseClient');

        if (user.role === 'implementing_agency') {
            // Fetch the Agency ID for this user
            try {
                const { data: agencies, error: agencyError } = await supabase
                    .from('implementing_agencies')
                    .select('id')
                    .eq('user_id', user.id)
                    .limit(1);

                if (agencyError) {
                    console.error('Error fetching agency ID:', agencyError);
                    return;
                }

                if (agencies && agencies.length > 0) {
                    const agencyData = agencies[0];
                    const data = await WorkService.getWorksByAgency(agencyData.id);
                    setWorkOrders(data);
                }
            } catch (err) {
                console.error('Error loading agency works:', err);
            }
        } else {
            // For Department/Admin, fetch all (or filter by department if needed later)
            WorkService.getAllWorks().then(data => {
                setWorkOrders(data);
            });
        }
    };

    useEffect(() => {
        loadWorkOrders();
        // Add event listener for storage changes to sync across tabs/windows
        window.addEventListener('storage', loadWorkOrders);
        return () => window.removeEventListener('storage', loadWorkOrders);
    }, [user]);

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
        { icon: '📂', label: 'Projects', action: () => setActiveTab('projects'), active: activeTab === 'projects' },
        { icon: '👥', label: 'Manage Executing Agency', action: () => setActiveTab('executing-agencies'), active: activeTab === 'executing-agencies' },
        { icon: '✍️', label: 'Assign Projects', action: () => setActiveTab('assign-projects'), active: activeTab === 'assign-projects' },
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
            case 'projects':
                return <AgencyProjects projects={workOrders} />;
            case 'executing-agencies':
                return <ManageExecutingAgencies />;
            case 'assign-projects':
                return <AssignProjects />;
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
            'assign-projects': 'Assign Projects',
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
                <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>{getBreadcrumb()}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <NotificationBell />
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '500', color: '#374151' }}>{user?.name || 'Department Admin'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{user?.role?.replace('_', ' ').toUpperCase()}</div>
                        </div>
                    </div>
                </div>
                <div className="dashboard-content" style={{ padding: '2rem' }}>
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default DepartmentDashboard;
