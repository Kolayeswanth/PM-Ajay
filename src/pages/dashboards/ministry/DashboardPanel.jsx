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

    return (
        <div className="dashboard-panel">
            {/* National Statistics */}
            <div className="kpi-row">
                <StatCard
                    icon="🏛️"
                    value={stats.totalStates}
                    label="States/UTs"
                    color="var(--color-primary)"
                />
                <StatCard
                    icon="🏘️"
                    value={stats.totalDistricts}
                    label="Districts"
                    color="var(--color-secondary)"
                />
                <StatCard
                    icon="📊"
                    value={stats.totalProjects}
                    label="Total Projects"
                    trend="positive"
                    trendValue="+12% this year"
                    color="var(--color-accent)"
                />
                <StatCard
                    icon="💰"
                    value={formatCurrency(stats.totalFundAllocated)}
                    label="Fund Allocated"
                    color="var(--color-success)"
                />
            </div>

            {/* Project Status */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Project Status Overview</h2>
                </div>
                <div className="kpi-row">
                    <StatCard
                        icon="✔️"
                        value={stats.projectsCompleted}
                        label="Completed"
                        trend="positive"
                        trendValue="+8% this month"
                        color="var(--color-success)"
                    />
                    <StatCard
                        icon="🚧"
                        value={stats.projectsOngoing}
                        label="Ongoing"
                        color="var(--color-warning)"
                    />
                    <StatCard
                        icon="✅"
                        value={stats.projectsApproved}
                        label="Approved"
                        color="var(--color-info)"
                    />
                    <StatCard
                        icon="📝"
                        value={stats.projectsProposed}
                        label="Pending"
                        color="var(--color-error)"
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
                        <CityMap district={selectedDistrict} state={selectedState} />
                    ) : selectedState ? (
                        <DistrictMap state={selectedState} onDistrictSelect={handleDistrictSelect} />
                    ) : (
                        <IndiaMap onStateSelect={setSelectedState} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPanel;
