import React, { useState, useEffect } from 'react';

const FundsReceivedFromMinistry = () => {
    const [fundsData, setFundsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data for funds received from ministry
        const mockFunds = [
            {
                id: 1,
                releaseDate: '2025-11-15',
                amount: 50000000,
                component: 'Adarsh Gram',
                sanctionOrder: 'MO/AG/2025/001',
                status: 'Received'
            },
            {
                id: 2,
                releaseDate: '2025-10-20',
                amount: 35000000,
                component: 'Grants-in-Aid',
                sanctionOrder: 'MO/GIA/2025/045',
                status: 'Received'
            },
            {
                id: 3,
                releaseDate: '2025-09-10',
                amount: 25000000,
                component: 'Hostel Construction',
                sanctionOrder: 'MO/HC/2025/023',
                status: 'Received'
            }
        ];

        setTimeout(() => {
            setFundsData(mockFunds);
            setLoading(false);
        }, 500);
    }, []);

    const formatCurrency = (amount) => {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                <p>Loading funds data...</p>
            </div>
        );
    }

    const totalReceived = fundsData.reduce((sum, fund) => sum + fund.amount, 0);

    return (
        <div className="dashboard-panel">
            <div className="section-header">
                <h2 className="section-title">Funds Received from Ministry</h2>
            </div>

            {/* Summary Card */}
            <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-6)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                    <div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Total Received</div>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-success)' }}>
                            {formatCurrency(totalReceived)}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Total Releases</div>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-primary)' }}>
                            {fundsData.length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Funds Table */}
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Release Date</th>
                            <th>Sanction Order</th>
                            <th>Component</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fundsData.map((fund) => (
                            <tr key={fund.id}>
                                <td>{formatDate(fund.releaseDate)}</td>
                                <td>
                                    <code style={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        padding: '2px 6px',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: 'var(--text-sm)'
                                    }}>
                                        {fund.sanctionOrder}
                                    </code>
                                </td>
                                <td>{fund.component}</td>
                                <td>
                                    <strong style={{ color: 'var(--color-success)' }}>
                                        {formatCurrency(fund.amount)}
                                    </strong>
                                </td>
                                <td>
                                    <span className="badge badge-success">
                                        {fund.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {fundsData.length === 0 && (
                <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>No funds received yet</p>
                </div>
            )}
        </div>
    );
};

export default FundsReceivedFromMinistry;
