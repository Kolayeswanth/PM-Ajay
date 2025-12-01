import React, { useState, useEffect } from 'react';
import StatCard from '../../../components/StatCard';
import IndiaMap from '../../../components/maps/IndiaMap';
import DistrictMap from '../../../components/maps/DistrictMap';
import CityMap from '../../../components/maps/CityMap';
import { nationalStats, states, mockProjects } from '../../../data/mockData';

const DashboardPanel = ({ selectedState, setSelectedState, selectedDistrict, setSelectedDistrict, formatCurrency }) => {
    const [stats, setStats] = useState({
        totalStates: 0,
        totalDistricts: 0,
        totalProjects: 0,
        totalFundAllocated: 0,
        projectsCompleted: 0,
        projectsOngoing: 0,
        projectsApproved: 0,
        projectsProposed: 0
    });

    // Fetch real dashboard statistics
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/dashboard/ministry-stats');
                const result = await response.json();

                if (result.success) {
                    setStats(result.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                // Fallback to mock data if API fails
                setStats({
                    ...nationalStats,
                    totalFundAllocated: nationalStats.totalFundAllocated
                });
            }
        };

        fetchStats();
    }, []);

    const handleExportMapData = () => {
        try {
            // Prepare state-wise project data
            const stateData = states.map(state => {
                const stateProjects = mockProjects.filter(p => p.state === state.name);
                const completedProjects = stateProjects.filter(p => p.status === 'COMPLETED').length;
                const ongoingProjects = stateProjects.filter(p => p.status === 'ONGOING').length;
                const totalFunds = stateProjects.reduce((sum, p) => sum + p.fundAllocated, 0);

                return {
                    'State/UT': state.name,
                    'Total Projects': stateProjects.length,
                    'Completed': completedProjects,
                    'Ongoing': ongoingProjects,
                    'Approved': stateProjects.filter(p => p.status === 'APPROVED').length,
                    'Proposed': stateProjects.filter(p => p.status === 'PROPOSED').length,
                    'Total Fund Allocated (Cr)': (totalFunds / 10000000).toFixed(2),
                    'Progress (%)': stateProjects.length > 0
                        ? ((stateProjects.reduce((sum, p) => sum + p.progress, 0) / stateProjects.length).toFixed(1))
                        : '0'
                };
            });

            // Convert to CSV
            const headers = Object.keys(stateData[0]);
            const csvContent = [
                headers.join(','),
                ...stateData.map(row => headers.map(header => `"${row[header]}"`).join(','))
            ].join('\n');

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `PM-AJAY_State_Data_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting map data:', error);
            alert('Failed to export data. Please try again.');
        }
    };

    const handleDistrictSelect = (districtName) => {
        setSelectedDistrict(districtName);
        console.log('Selected district:', districtName);
    };

    const handleBack = () => {
        if (selectedDistrict) {
            setSelectedDistrict(null);
        } else {
            setSelectedState(null);
        }
    };

    const InfoCard = ({ icon, value, label, colorBg, colorText }) => (
        <div className="card" style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            border: 'none',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)'
        }}>
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: colorBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colorText,
                fontSize: '1.5rem'
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
            </div>
        </div>
    );

    return (
        <div className="dashboard-panel">
            {/* Dashboard Title */}
            <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '2rem',
                textAlign: 'left',
                textTransform: 'uppercase',
                letterSpacing: '1px'
            }}>
                MINISTRY DASHBOARD
            </h1>
            {/* National Statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <InfoCard
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V7l8-4 8 4v14" /><path d="M5 10h14" /><path d="M9 21v-8h6v8" /></svg>}
                    value={stats.totalStates}
                    label="States/UTs"
                    colorBg="#E0E7FF"
                    colorText="#4338CA"
                />
                <InfoCard
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
                    value={stats.totalDistricts}
                    label="Districts"
                    colorBg="#FEF3C7"
                    colorText="#D97706"
                />
                <InfoCard
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}
                    value={stats.totalProjects}
                    label="Total Projects"
                    colorBg="#DBEAFE"
                    colorText="#2563EB"
                />
                <InfoCard
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
                    value={formatCurrency(stats.totalFundAllocated)}
                    label="Fund Allocated"
                    colorBg="#D1FAE5"
                    colorText="#059669"
                />
            </div>

            {/* Project Status */}
            <div className="dashboard-section">
                <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Project Status Overview</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    <InfoCard
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
                        value={stats.projectsCompleted}
                        label="Completed"
                        colorBg="#D1FAE5"
                        colorText="#059669"
                    />
                    <InfoCard
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
                        value={stats.projectsOngoing}
                        label="Ongoing"
                        colorBg="#FEF3C7"
                        colorText="#D97706"
                    />
                    <InfoCard
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                        value={stats.projectsApproved}
                        label="Approved"
                        colorBg="#E0E7FF"
                        colorText="#4338CA"
                    />
                    <InfoCard
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>}
                        value={stats.projectsProposed}
                        label="Pending"
                        colorBg="#FEE2E2"
                        colorText="#DC2626"
                    />
                </div>
            </div>

            {/* GIS Map */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">
                        {selectedDistrict
                            ? `${selectedDistrict} District Overview`
                            : selectedState
                                ? `${selectedState} Project Distribution`
                                : 'State-wise Project Distribution'
                        }
                    </h2>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {(selectedState || selectedDistrict) && (
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={handleBack}
                            >
                                ← Back to {selectedDistrict ? 'State View' : 'National View'}
                            </button>
                        )}
                        <button className="btn btn-primary btn-sm" onClick={handleExportMapData}>
                            📥 Export Map Data
                        </button>
                    </div>
                </div>
                <div style={{ height: '800px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    {selectedDistrict ? (
                        <DistrictMap
                            key={selectedDistrict}
                            state={selectedState}
                            district={selectedDistrict}
                        />
                    ) : selectedState ? (
                        <DistrictMap
                            key={selectedState}
                            state={selectedState}
                            district={null}
                            onDistrictSelect={handleDistrictSelect}
                        />
                    ) : (
                        <IndiaMap onStateSelect={setSelectedState} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPanel;
