import React from 'react';
import StatCard from '../../../components/StatCard';
import DistrictMap from '../../../components/maps/DistrictMap';
import { districtStats, mockProjects } from '../../../data/mockData';

const DistrictDashboardPanel = ({ formatCurrency }) => {
    const stats = districtStats.Pune;
    const districtProjects = mockProjects.filter(p => p.district === 'Pune');

    const getStatusBadge = (status) => {
        const badges = {
            'PROPOSED': 'badge-info',
            'APPROVED': 'badge-info',
            'ONGOING': 'badge-warning',
            'COMPLETED': 'badge-success',
            'DELAYED': 'badge-error'
        };
        return badges[status] || 'badge-info';
    };

    return (
        <>
            {/* District KPIs */}
            <div className="kpi-row">
                <StatCard
                    icon="🏡"
                    value={stats.gps}
                    label="Gram Panchayats"
                    color="var(--color-primary)"
                />
                <StatCard
                    icon="📊"
                    value={stats.projects}
                    label="Total Projects"
                    color="var(--color-secondary)"
                />
                <StatCard
                    icon="💰"
                    value={formatCurrency(stats.fundAllocated)}
                    label="Fund Allocated"
                    color="var(--color-success)"
                />
                <StatCard
                    icon="✔️"
                    value={stats.projectsCompleted}
                    label="Completed"
                    trend="positive"
                    trendValue="+5 this month"
                    color="var(--color-success)"
                />
            </div>

            {/* GIS Map */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Project Locations (GIS View)</h2>
                    <button className="btn btn-primary btn-sm">📍 Add New Location</button>
                </div>
                <DistrictMap state="Maharashtra" />
            </div>

            {/* GP Proposals Pending */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">GP Proposals Pending Approval</h2>
                    <span className="badge badge-warning" style={{ fontSize: 'var(--text-base)', padding: 'var(--space-2) var(--space-4)' }}>
                        {stats.projectsProposed} Pending
                    </span>
                </div>

                <div className="card">
                    {['Shirur GP - Community Center', 'Khed GP - Water Tank'].map((proposal, index) => (
                        <div key={index} style={{
                            padding: 'var(--space-4)',
                            border: '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--space-3)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h4 style={{ margin: 0, marginBottom: 'var(--space-2)' }}>{proposal}</h4>
                                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                    Submitted: Nov {22 + index}, 2025 • Component: Adarsh Gram •
                                    Estimated Cost: ₹{(Math.random() * 50 + 20).toFixed(2)} L
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <button className="btn btn-secondary btn-sm">📄 Review</button>
                                <button className="btn btn-primary btn-sm">✅ Approve</button>
                                <button className="btn btn-outline btn-sm">❌ Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* All Projects Table */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">All District Projects</h2>
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <button className="btn btn-secondary btn-sm">➕ Assign Work</button>
                        <button className="btn btn-outline btn-sm">📊 Export Data</button>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Project Name</th>
                                <th>GP</th>
                                <th>Component</th>
                                <th>Status</th>
                                <th>Progress</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {districtProjects.map(project => (
                                <tr key={project.id}>
                                    <td>
                                        <strong>{project.name}</strong>
                                        <br />
                                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                            ID: PRJ-{project.id.toString().padStart(4, '0')}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 'var(--text-sm)' }}>{project.gp}</td>
                                    <td>
                                        <span className="badge badge-primary">{project.component}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(project.status)}`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <div className="progress-bar" style={{ flex: 1, height: '6px', minWidth: '80px' }}>
                                                <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                                            </div>
                                            <span style={{ fontSize: 'var(--text-sm)' }}>{project.progress}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <button className="btn btn-primary btn-sm">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default DistrictDashboardPanel;
