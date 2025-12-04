import React from 'react';
import StatCard from '../../../components/StatCard';
import { useLanguage } from '../../../contexts/LanguageContext';
import { t } from '../../../utils/translations';

const ContractorDashboardPanel = ({ formatCurrency, stats, recentWorks, onNavigate }) => {
    const { language } = useLanguage();

    const getStatusBadge = (status) => {
        const badges = {
            'In Progress': 'badge-warning',
            'Completed': 'badge-success',
            'Not Started': 'badge-info',
            'Delayed': 'badge-error'
        };
        return badges[status] || 'badge-info';
    };

    const translateStatus = (status) => {
        const statusMap = {
            'In Progress': t('inProgress', language),
            'Completed': t('completed', language),
            'Not Started': t('notStarted', language),
            'Delayed': t('delayed', language),
            'Pending': t('pending', language)
        };
        return statusMap[status] || status;
    };

    return (
        <>
            {/* Contractor KPIs */}
            <div className="kpi-row">
                <StatCard
                    icon="🏗️"
                    value={stats.totalWorks}
                    label={t('assignedWorks', language)}
                    color="var(--color-primary)"
                />
                <StatCard
                    icon="⚙️"
                    value={stats.ongoing}
                    label={t('worksInProgress', language)}
                    color="var(--color-warning)"
                />
                <StatCard
                    icon="💰"
                    value={formatCurrency(stats.pendingPayments)}
                    label={t('pendingPayments', language)}
                    color="var(--color-error)"
                />
                <StatCard
                    icon="✅"
                    value={stats.completed}
                    label={t('completedWorks', language)}
                    color="var(--color-success)"
                />
            </div>

            {/* Recent Assigned Works */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">{t('recentAssignedWorks', language)}</h2>
                    <button className="btn btn-primary btn-sm" onClick={() => onNavigate('assigned-works')}>
                        {t('viewAllWorks', language)}
                    </button>
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
                                        {t('location', language)}: {work.location} • ID: WO-{work.id}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    <span className={`badge ${getStatusBadge(work.status)}`}>
                                        {translateStatus(work.status)}
                                    </span>
                                    <button className="btn btn-outline btn-sm" onClick={() => onNavigate('work-progress')}>
                                        {t('updateProgress', language)}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                            {t('noAssignedWorks', language)}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">
                <h2 className="section-title">{t('quickActions', language)}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div className="card action-card" onClick={() => onNavigate('work-progress')} style={{ cursor: 'pointer', textAlign: 'center', padding: '30px' }}>
                        <div style={{ fontSize: '30px', marginBottom: '10px' }}>📸</div>
                        <h3>{t('uploadSitePhotos', language)}</h3>
                        <p style={{ color: '#666', fontSize: '14px' }}>{t('updatePhysicalProgress', language)}</p>
                    </div>
                    <div className="card action-card" onClick={() => onNavigate('payment-status')} style={{ cursor: 'pointer', textAlign: 'center', padding: '30px' }}>
                        <div style={{ fontSize: '30px', marginBottom: '10px' }}>🧾</div>
                        <h3>{t('checkPayments', language)}</h3>
                        <p style={{ color: '#666', fontSize: '14px' }}>{t('viewBillStatus', language)}</p>
                    </div>
                    <div className="card action-card" onClick={() => onNavigate('help')} style={{ cursor: 'pointer', textAlign: 'center', padding: '30px' }}>
                        <div style={{ fontSize: '30px', marginBottom: '10px' }}>🆘</div>
                        <h3>{t('raiseIssue', language)}</h3>
                        <p style={{ color: '#666', fontSize: '14px' }}>{t('contactDepartment', language)}</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContractorDashboardPanel;
