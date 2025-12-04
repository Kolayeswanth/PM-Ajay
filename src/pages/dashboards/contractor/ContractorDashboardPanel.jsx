import React from 'react';
import InteractiveButton from '../../../components/InteractiveButton';
import { Construction, Settings, Wallet, CheckCircle, Camera, Receipt, AlertCircle, ArrowRight } from 'lucide-react';

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

    // ModernStatCard component matching the premium style
    const ModernStatCard = ({ icon, value, label, description, iconBg, iconColor }) => (
        <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'default',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
        >
            {/* Icon */}
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
            }}>
                <div style={{ color: iconColor, display: 'flex' }}>
                    {icon}
                </div>
            </div>

            {/* Value */}
            <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '0.25rem',
                lineHeight: '1.2'
            }}>
                {value}
            </div>

            {/* Label */}
            <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#4B5563',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
            }}>
                {label}
            </div>

            {/* Description */}
            <p style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                lineHeight: '1.6',
                margin: 0
            }}>
                {description}
            </p>
        </div>
    );

    return (
        <>
            {/* Contractor KPIs */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <ModernStatCard
                    icon={<Construction size={24} strokeWidth={1.5} />}
                    value={stats.totalWorks}
                    label="Assigned Works"
                    iconBg="#DBEAFE"
                    iconColor="#2563EB"
                />
                <ModernStatCard
                    icon={<Settings size={24} strokeWidth={1.5} />}
                    value={stats.ongoing}
                    label="Works In Progress"
                    iconBg="#D1FAE5"
                    iconColor="#10B981"
                />
                <ModernStatCard
                    icon={<Wallet size={24} strokeWidth={1.5} />}
                    value={formatCurrency(stats.pendingPayments)}
                    label="Pending Payments"
                    iconBg="#FEF3C7"
                    iconColor="#F59E0B"
                />
                <ModernStatCard
                    icon={<CheckCircle size={24} strokeWidth={1.5} />}
                    value={stats.completed}
                    label="Completed Works"
                    iconBg="#D1FAE5"
                    iconColor="#10B981"
                />
            </div>

            {/* Recent Assigned Works */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Recent Assigned Works</h2>
                    <InteractiveButton
                        variant="primary"
                        size="sm"
                        onClick={() => onNavigate('assigned-works')}
                    >
                        View All Works <ArrowRight size={16} style={{ marginLeft: 'var(--space-1)' }} />
                    </InteractiveButton>
                </div>

                <div className="card" style={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    {recentWorks && recentWorks.length > 0 ? (
                        recentWorks.map((work, index) => (
                            <div key={index} style={{
                                padding: 'var(--space-4)',
                                border: '1px solid var(--border-light)',
                                borderRadius: '12px',
                                marginBottom: 'var(--space-3)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: '#fff'
                            }}>
                                <div>
                                    <h4 style={{ margin: 0, marginBottom: 'var(--space-2)', fontSize: '1rem', fontWeight: 600 }}>{work.title}</h4>
                                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                        Location: {work.location} • ID: WO-{work.id}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                    <span className={`badge ${getStatusBadge(work.status)}`}>{work.status}</span>
                                    <InteractiveButton
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => onNavigate('work-progress')}
                                    >
                                        Update Progress
                                    </InteractiveButton>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                            No assigned works found.
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">
                <h2 className="section-title">Quick Actions</h2><br />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
                    <div
                        className="card action-card"
                        onClick={() => onNavigate('work-progress')}
                        style={{
                            cursor: 'pointer',
                            textAlign: 'center',
                            padding: 'var(--space-8)',
                            transition: 'all var(--transition-base)',
                            border: '1px solid var(--border-light)',
                            borderRadius: '16px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-primary)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                            e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-light)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div style={{
                            fontSize: 'var(--text-4xl)',
                            marginBottom: 'var(--space-3)',
                            color: 'var(--color-primary)'
                        }}>
                            <Camera size={48} strokeWidth={1} />
                        </div>
                        <h3 style={{ marginBottom: 'var(--space-2)' }}>Upload Site Photos</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>
                            Update physical progress with images
                        </p>
                    </div>
                    <div
                        className="card action-card"
                        onClick={() => onNavigate('payment-status')}
                        style={{
                            cursor: 'pointer',
                            textAlign: 'center',
                            padding: 'var(--space-8)',
                            transition: 'all var(--transition-base)',
                            border: '1px solid var(--border-light)',
                            borderRadius: '16px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-success)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                            e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-light)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div style={{
                            fontSize: 'var(--text-4xl)',
                            marginBottom: 'var(--space-3)',
                            color: 'var(--color-success)'
                        }}>
                            <Receipt size={48} strokeWidth={1} />
                        </div>
                        <h3 style={{ marginBottom: 'var(--space-2)' }}>Check Payments</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>
                            View bill status and history
                        </p>
                    </div>
                    <div
                        className="card action-card"
                        onClick={() => onNavigate('help')}
                        style={{
                            cursor: 'pointer',
                            textAlign: 'center',
                            padding: 'var(--space-8)',
                            transition: 'all var(--transition-base)',
                            border: '1px solid var(--border-light)',
                            borderRadius: '16px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-error)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                            e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-light)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div style={{
                            fontSize: 'var(--text-4xl)',
                            marginBottom: 'var(--space-3)',
                            color: 'var(--color-error)'
                        }}>
                            <AlertCircle size={48} strokeWidth={1} />
                        </div>
                        <h3 style={{ marginBottom: 'var(--space-2)' }}>Raise Issue</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>
                            Contact department for support
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContractorDashboardPanel;
