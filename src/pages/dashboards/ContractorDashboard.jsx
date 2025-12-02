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
    const [works, setWorks] = useState([]);

    useEffect(() => {
        // Load work orders assigned to this executing agency only
        const fetchAssignedWorks = async () => {
            if (!user?.email || user?.role !== 'executing_agency') {
                setWorks([]);
                return;
            }

            try {
                const { supabase } = await import('../../lib/supabaseClient');


                // 1. Get executing agency ID using email-based matching
                const { data: allAgencies, error: agenciesError } = await supabase
                    .from('executing_agencies')
                    .select('id, agency_name, email, name');

                if (agenciesError) {
                    console.error('Error fetching agencies:', agenciesError);
                    return;
                }

                // Match by email
                const matchedAgency = allAgencies?.find(agency =>
                    agency.email && agency.email.toLowerCase() === user.email.toLowerCase()
                );

                if (!matchedAgency) {
                    console.warn('No agency matched for user:', user.email);
                    setWorks([]);
                    return;
                }

                console.log('✅ Fetching work orders for agency:', matchedAgency.agency_name, matchedAgency.id);

                // 2. Fetch work orders assigned to this executing agency
                const { data: workOrdersData, error: workOrdersError } = await supabase
                    .from('work_orders')
                    .select('*')
                    .eq('executing_agency_id', matchedAgency.id)
                    .order('created_at', { ascending: false });

                if (workOrdersError) {
                    console.error('Error fetching work orders:', workOrdersError);
                    return;
                }

                console.log('✅ Fetched work orders:', workOrdersData?.length || 0);

                // 3. Get the latest progress for each work order
                if (workOrdersData && workOrdersData.length > 0) {
                    const workOrderIds = workOrdersData.map(w => w.id);

                    const { data: progressData, error: progressError } = await supabase
                        .from('work_progress')
                        .select('*')
                        .in('work_order_id', workOrderIds)
                        .order('created_at', { ascending: false });

                    if (progressError) {
                        console.error('Error fetching progress:', progressError);
                        setWorks(workOrdersData);
                        return;
                    }

                    // Merge with latest progress
                    const mergedWorks = workOrdersData.map(work => {
                        const latestUpdate = progressData?.find(p => p.work_order_id === work.id);

                        if (latestUpdate) {
                            return {
                                ...work,
                                progress: latestUpdate.progress_percentage,
                                fundsReleased: latestUpdate.funds_released,
                                fundsUsed: latestUpdate.funds_used,
                                fundsRemaining: latestUpdate.funds_remaining,
                                remarks: latestUpdate.remarks,
                                lastUpdated: new Date(latestUpdate.created_at).toISOString().split('T')[0],
                                officerName: latestUpdate.officer_name,
                                officerPhone: latestUpdate.officer_phone,
                                viewedByAgency: latestUpdate.viewed_by_agency,
                                viewedAt: latestUpdate.viewed_at
                            };
                        }
                        return {
                            ...work,
                            progress: work.progress || 0,
                            fundsReleased: work.funds_released || 0,
                            fundsUsed: work.funds_used || 0,
                            fundsRemaining: work.funds_remaining || 0,
                            remarks: work.remarks || '',
                            lastUpdated: null
                        };
                    });

                    setWorks(mergedWorks);
                } else {
                    setWorks([]);
                }
            } catch (error) {
                console.error('Error in fetchAssignedWorks:', error);
                setWorks([]);
            }
        };

        fetchAssignedWorks();
    }, [user?.email, user?.role]);


    // --- Handlers ---
    const handleUpdateProgress = (updatedWork, officerDetails) => {
        return import('../../services/WorkService').then(({ WorkService }) => {
            return WorkService.updateWork(updatedWork, officerDetails).then(newWorks => {
                setWorks(newWorks);
            });
        });
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
                return <AssignedWorks />;
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
