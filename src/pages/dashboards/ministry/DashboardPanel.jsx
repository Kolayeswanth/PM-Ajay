import React from 'react';
import StatCard from '../../../components/StatCard';
import IndiaMap from '../../../components/maps/IndiaMap';
import { nationalStats } from '../../../data/mockData';

const DashboardPanel = ({ setSelectedState, formatCurrency }) => {
    return (
        <div className="dashboard-panel">
            {/* National Statistics */}
            <div className="kpi-row">
                <StatCard
                    icon="🏛️"
                    value={nationalStats.totalStates}
                    label="States/UTs"
                    color="var(--color-primary)"
                />
                <StatCard
                    icon="🏘️"
                    value={nationalStats.totalDistricts}
                    label="Districts"
                    color="var(--color-secondary)"
                />
                <StatCard
                    icon="📊"
                    value={nationalStats.totalProjects}
                    label="Total Projects"
                    trend="positive"
                    trendValue="+12% this year"
                    color="var(--color-accent)"
                />
                <StatCard
                    icon="💰"
                    value={formatCurrency(nationalStats.totalFundAllocated)}
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
                        value={nationalStats.projectsCompleted}
                        label="Completed"
                        trend="positive"
                        trendValue="+8% this month"
                        color="var(--color-success)"
                    />
                    <StatCard
                        icon="🚧"
                        value={nationalStats.projectsOngoing}
                        label="Ongoing"
                        color="var(--color-warning)"
                    />
                    <StatCard
                        icon="✅"
                        value={nationalStats.projectsApproved}
                        label="Approved"
                        color="var(--color-info)"
                    />
                    <StatCard
                        icon="📝"
                        value={nationalStats.projectsProposed}
                        label="Pending"
                        color="var(--color-error)"
                    />
                </div>
            </div>

            {/* GIS Map */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">State-wise Project Distribution</h2>
                    <button className="btn btn-primary btn-sm">📥 Export Map Data</button>
                </div>
                <IndiaMap onStateSelect={setSelectedState} />
            </div>
        </div>
    );
};

export default DashboardPanel;
