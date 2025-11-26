import React, { useState } from 'react';
import IndiaMap from '../../../components/maps/IndiaMap';
import StatCard from '../../../components/StatCard';

const MonitorProgress = () => {
    const [selectedState, setSelectedState] = useState(null);

    return (
        <div className="dashboard-panel">
            <div className="section-header">
                <h2 className="section-title">Monitor Progress</h2>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <select className="form-select">
                        <option>All Components</option>
                        <option>Adarsh Gram</option>
                        <option>GIA</option>
                        <option>Hostel</option>
                    </select>
                    <input type="date" className="form-input" />
                </div>
            </div>

            <div className="dashboard-section">
                <div className="kpi-row">
                    <StatCard
                        icon="📈"
                        value="78%"
                        label="Fund Utilization"
                        color="var(--color-primary)"
                    />
                    <StatCard
                        icon="🏗️"
                        value="65%"
                        label="Project Completion"
                        color="var(--color-secondary)"
                    />
                    <StatCard
                        icon="👥"
                        value="1.2M"
                        label="Beneficiaries"
                        color="var(--color-accent)"
                    />
                </div>
            </div>

            <div className="dashboard-section" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                    <h3 className="section-title">Geographic Progress Overview</h3>
                    <IndiaMap onStateSelect={setSelectedState} />
                </div>
                <div>
                    <h3 className="section-title">Region-wise Performance</h3>
                    <div className="card" style={{ padding: 'var(--space-4)' }}>
                        {['North', 'South', 'East', 'West', 'North-East'].map(region => (
                            <div key={region} style={{ marginBottom: 'var(--space-3)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                                    <span>{region}</span>
                                    <span>{Math.floor(Math.random() * 40) + 50}%</span>
                                </div>
                                <div className="progress-bar" style={{ height: '8px' }}>
                                    <div className="progress-fill" style={{ width: `${Math.floor(Math.random() * 40) + 50}%`, backgroundColor: 'var(--color-primary)' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonitorProgress;
