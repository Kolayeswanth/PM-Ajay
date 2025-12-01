import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../../components/NotificationBell';
import DashboardSidebar from '../../components/DashboardSidebar';
import { useAuth } from '../../contexts/AuthContext';
import DistrictDashboardPanel from './district/DistrictDashboardPanel';
import ManageGPAdmins from './district/ManageGPAdmins';
import FundsReceivedFromState from './district/FundsReceivedFromState';
import UploadUCs from './district/UploadUCs';
import DistrictReports from './district/DistrictReports';
import DistrictNotifications from './district/DistrictNotifications';
import DistrictHelp from './district/DistrictHelp';
import CreateProposal from './district/CreateProposal';
import AssignProjectsDistrict from './district/AssignProjectsDistrict';

const DistrictDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [districtName, setDistrictName] = useState('Loading...');
    const [districtId, setDistrictId] = useState(null);
    const [stateId, setStateId] = useState(null);
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    // Fetch district name from user profile
    React.useEffect(() => {
        const fetchDistrictName = async () => {
            if (user?.id) {
                try {
                    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=full_name`, {
                        headers: {
                            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                        }
                    });
                    const data = await response.json();
                    if (data[0]?.full_name) {
                        // Extract district name (e.g., "Pune District Admin" -> "Pune")
                        const name = data[0].full_name.replace(' District Admin', '').replace(' Admin', '').trim();
                        setDistrictName(name);

                        // Fetch District ID and State ID
                        const districtRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/districts?name=eq.${name}&select=id,state_id`, {
                            headers: {
                                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                            }
                        });
                        const districtData = await districtRes.json();
                        if (districtData && districtData.length > 0) {
                            setDistrictId(districtData[0].id);
                            setStateId(districtData[0].state_id);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching district name:', error);
                    setDistrictName('District');
                }
            }
        };
        fetchDistrictName();
    }, [user?.id, user?.email]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sidebarMenu = [
        { icon: '📊', label: 'Dashboard', action: () => setActiveTab('dashboard'), active: activeTab === 'dashboard' },
        { icon: '📝', label: 'Create Proposal', action: () => setActiveTab('create-proposal'), active: activeTab === 'create-proposal' },
        { icon: '✍️', label: 'Assign Projects', action: () => setActiveTab('assign-projects'), active: activeTab === 'assign-projects' },
        { icon: '👥', label: 'Manage GP Admins', action: () => setActiveTab('gp-admins'), active: activeTab === 'gp-admins' },
        { icon: '💰', label: 'Funds Received from State', action: () => setActiveTab('funds-received'), active: activeTab === 'funds-received' },
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
                return <DistrictDashboardPanel formatCurrency={formatCurrency} districtId={districtId} />;
            case 'create-proposal':
                return <CreateProposal districtId={districtId} />;
            case 'assign-projects':
                return <AssignProjectsDistrict districtId={districtId} stateId={stateId} />;
            case 'gp-admins':
                return <ManageGPAdmins />;
            case 'funds-received':
                return <FundsReceivedFromState formatCurrency={formatCurrency} districtId={districtId} />;
            case 'ucs':
                return <UploadUCs />;
            case 'reports':
                return <DistrictReports />;
            case 'notifications':
                return <DistrictNotifications />;
            case 'help':
                return <DistrictHelp />;
            default:
                return <DistrictDashboardPanel formatCurrency={formatCurrency} districtId={districtId} />;
        }
    };

    const getBreadcrumb = () => {
        const labels = {
            'dashboard': 'Dashboard',
            'create-proposal': 'Create Proposal',
            'assign-projects': 'Assign Projects',
            'gp-admins': 'Manage GP Admins',
            'funds-received': 'Funds Received from State',
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
                        <h1>District Dashboard - {districtName}</h1>
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
