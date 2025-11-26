import React from 'react';
import StatCard from '../../../components/StatCard';

const ContractorDashboardPanel = ({ formatCurrency, stats, recentWorks, onNavigate }) => {

    const getStatusBadge = (status) => {
        const badges = {
            'In Progress': 'badge-warning',
            'Completed': 'badge-success',
            'Not Started': 'badge-info',
            'Delayed': 'badge-error'
        };
        return badges[status] || 'badge-info';
    };

    return (
        <>
            {/* Contractor KPIs */}
            <div className="kpi-row">
                <StatCard
                    icon="🏗️"
                    value={stats.totalWorks}
                    label="Assigned Works"
                    color="var(--color-primary)"
                />
                <StatCard
                    icon="⚙️"
                    value={stats.ongoing}
                    label="Works In Progress"
                    color="var(--color-warning)"
                />
                <StatCard
                    icon="💰"
                    value={formatCurrency(stats.pendingPayments)}
                    label="Pending Payments"
                    color="var(--color-error)"
                />
                <StatCard
                    icon="✅"
                    value={stats.completed}
                    label="Completed Works"
                    color="var(--color-success)"
                />
            </div>

            {/* Recent Assigned Works */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Recent Assigned Works</h2>
                    <button className="btn btn-primary btn-sm" onClick={() => onNavigate('assigned-works')}>View All Works</button>
                </div>

                <div className="card">
                    {recentWorks && recentWorks.length > 0 ? (
                        recentWorks.map((work, index) => (
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
                                    <h4 style={{ margin: 0, marginBottom: 'var(--space-2)' }}>{work.title}</h4>
                                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                        Location: {work.location} • ID: WO-{work.id}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    <span className={`badge ${getStatusBadge(work.status)}`}>{work.status}</span>
                                    <button className="btn btn-outline btn-sm" onClick={() => onNavigate('work-progress')}>Update Progress</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No assigned works found.</div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">
                <h2 className="section-title">Quick Actions</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div className="card action-card" onClick={() => onNavigate('work-progress')} style={{ cursor: 'pointer', textAlign: 'center', padding: '30px' }}>
                        <div style={{ fontSize: '30px', marginBottom: '10px' }}>📸</div>
                        <h3>Upload Site Photos</h3>
                        <p style={{ color: '#666', fontSize: '14px' }}>Update physical progress with images</p>
                    </div>
                    <div className="card action-card" onClick={() => onNavigate('payment-status')} style={{ cursor: 'pointer', textAlign: 'center', padding: '30px' }}>
                        <div style={{ fontSize: '30px', marginBottom: '10px' }}>🧾</div>
                        <h3>Check Payments</h3>
                        <p style={{ color: '#666', fontSize: '14px' }}>View bill status and history</p>
                    </div>
                    <div className="card action-card" onClick={() => onNavigate('help')} style={{ cursor: 'pointer', textAlign: 'center', padding: '30px' }}>
                        <div style={{ fontSize: '30px', marginBottom: '10px' }}>🆘</div>
                        <h3>Raise Issue</h3>
                        <p style={{ color: '#666', fontSize: '14px' }}>Contact department for support</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContractorDashboardPanel;
