import React, { useState, useEffect } from 'react';
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
import FundsReceivedFromMinistry from './state/FundsReceivedFromMinistry';

const StateDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stateName, setStateName] = useState('Loading...');
    const [stateId, setStateId] = useState(null);
    const [stateCode, setStateCode] = useState(null);
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    // Fetch state name from user profile
    React.useEffect(() => {
        const fetchStateName = async () => {
            if (user?.id) {
                console.log('Fetching state name for user:', user.email);
                try {
                    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
                    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

                    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=full_name`, {
                        headers: {
                            'apikey': SUPABASE_ANON_KEY
                        }
                    });
                    const data = await response.json();
                    console.log('State name data:', data);
                    if (data[0]?.full_name) {
                        // Extract state name (e.g., "Maharashtra State Admin" -> "Maharashtra")
                        let name = data[0].full_name
                            .replace(' State Admin', '')
                            .replace(' Admin', '')
                            .replace(' State', '')
                            .trim();
                        console.log('Setting state name to:', name);
                        setStateName(name);

                        // Fetch State ID and Code
                        const stateRes = await fetch(`${SUPABASE_URL}/rest/v1/states?name=eq.${name}&select=id,code`, {
                            headers: {
                                'apikey': SUPABASE_ANON_KEY
                            }
                        });
                        const stateData = await stateRes.json();
                        if (stateData && stateData.length > 0) {
                            setStateId(stateData[0].id);
                            setStateCode(stateData[0].code);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching state name:', error);
                    setStateName('State');
                }
            }
        };
        fetchStateName();
    }, [user?.id, user?.email]); // Refetch when user changes

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sidebarMenu = [
        { icon: '📊', label: 'Dashboard', action: () => setActiveTab('dashboard'), active: activeTab === 'dashboard' },
        { icon: '💵', label: 'Funds Received from Ministry', action: () => setActiveTab('received'), active: activeTab === 'received' },
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
                return <StateDashboardPanel formatCurrency={formatCurrency} stateName={stateName} />;

            case 'received':
                return <FundsReceivedFromMinistry formatCurrency={formatCurrency} />;
            case 'admins':
                return <ManageDistrictAdmins />;
            case 'funds':
                return <FundRelease formatCurrency={formatCurrency} stateId={stateId} stateCode={stateCode} />;
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
                return <StateDashboardPanel formatCurrency={formatCurrency} stateName={stateName} />;
        }
    };

    const getBreadcrumb = () => {
        const labels = {
            'dashboard': 'Dashboard',
            'received': 'Funds Received from Ministry',
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
                        <h1>State Dashboard - {stateName}</h1>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                            {getBreadcrumb()}
                        </p>
                    </div>
                    <div className="dashboard-actions">
                        <NotificationBell userRole="state" stateName={stateName} />
                    </div>
                </div>

                {renderContent()}
            </main>
        </div>
    );
};

export default StateDashboard;
