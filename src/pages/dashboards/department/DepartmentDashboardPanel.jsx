import React from 'react';
import StatCard from '../../../components/StatCard';

const DepartmentDashboardPanel = ({ formatCurrency, stats, recentOrders, projects, onNavigate }) => {

    const getStatusBadge = (status) => {
        const badges = {
            'PROPOSED': 'badge-info',
            'APPROVED': 'badge-info',
            'ONGOING': 'badge-warning',
            'In Progress': 'badge-warning',
            'COMPLETED': 'badge-success',
            'Completed': 'badge-success',
            'DELAYED': 'badge-error',
            'Not Started': 'badge-info'
        };
        return badges[status] || 'badge-info';
    };

    return (
        <>
            {/* Department KPIs */}
            <div className="kpi-row">
                <StatCard
                    icon="🏗️"
                    value={stats.totalWorks}
                    label="Total Works Assigned"
                    color="var(--color-primary)"
                />
                <StatCard
                    icon="⚙️"
                    value={stats.ongoing}
                    label="Ongoing Works"
                    color="var(--color-warning)"
                />
                <StatCard
                    icon="💰"
                    value={formatCurrency(stats.fundsUtilized)}
                    label="Funds Utilized"
                    color="var(--color-success)"
                />
                <StatCard
                    icon="📄"
                    value={stats.pendingDPR}
                    label="Pending DPRs"
                    color="var(--color-error)"
                />
            </div>

            {/* Recent Work Orders */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Recent Work Orders</h2>
                    <button className="btn btn-primary btn-sm" onClick={() => onNavigate('work-orders')}>View All Orders</button>
                </div>

                <div className="card">
                    {recentOrders && recentOrders.length > 0 ? (
                        recentOrders.map((order, index) => (
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
                                    <h4 style={{ margin: 0, marginBottom: 'var(--space-2)' }}>{order.title}</h4>
                                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                        Location: {order.location} • ID: WO-{order.id}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    <span className={`badge ${getStatusBadge(order.status)}`}>{order.status}</span>
                                    <button className="btn btn-outline btn-sm" onClick={() => onNavigate('work-orders')}>Update Progress</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No recent work orders.</div>
                    )}
                </div>
            </div>

            {/* Project Progress Table */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Project Execution Status</h2>
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('dpr-upload')}>📄 Upload DPR</button>
                        <button className="btn btn-outline btn-sm" onClick={() => onNavigate('reports')}>📊 Export Status</button>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Work Order</th>
                                <th>Location</th>
                                <th>Contractor</th>
                                <th>Status</th>
                                <th>Physical Progress</th>
                                <th>Financial Progress</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map(project => (
                                <tr key={project.id}>
                                    <td>
                                        <strong>{project.name}</strong>
                                        <br />
                                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                            WO-{project.id + 100}
                                        </span>
                                    </td>
                                    <td>{project.gp}</td>
                                    <td>M/s Patil Constructions</td>
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
                                        <div style={{ fontSize: 'var(--text-sm)' }}>
                                            {formatCurrency(project.budget * (project.progress / 100))} / {formatCurrency(project.budget)}
                                        </div>
                                    </td>
                                    <td>
                                        <button className="btn btn-primary btn-sm" onClick={() => onNavigate('work-orders')}>Update</button>
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

export default DepartmentDashboardPanel;
