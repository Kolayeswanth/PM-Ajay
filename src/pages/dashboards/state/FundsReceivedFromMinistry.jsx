import React, { useState } from 'react';

const FundsReceivedFromMinistry = ({ formatCurrency }) => {
    // Mock data for now
    const [funds] = useState([
        { id: 1, component: 'Adarsh Gram', amount: 50000000, date: '2025-11-01', reference: 'MIN/2025/001', status: 'Received' },
        { id: 2, component: 'Infrastructure', amount: 75000000, date: '2025-11-15', reference: 'MIN/2025/002', status: 'Received' },
        { id: 3, component: 'Livelihood', amount: 25000000, date: '2025-11-20', reference: 'MIN/2025/003', status: 'Pending' },
    ]);

    return (
        <div className="funds-received-page" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Funds Received from Ministry</h2>
                <button className="btn btn-primary" disabled>
                    + Request Funds
                </button>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Reference No.</th>
                            <th>Component</th>
                            <th style={{ textAlign: 'right' }}>Amount</th>
                            <th>Date Received</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {funds.map((item) => (
                            <tr key={item.id}>
                                <td style={{ fontWeight: 600 }}>{item.reference}</td>
                                <td>{item.component}</td>
                                <td style={{ textAlign: 'right', fontWeight: 600, color: '#2ecc71' }}>
                                    {formatCurrency ? formatCurrency(item.amount) : `₹${item.amount}`}
                                </td>
                                <td>{item.date}</td>
                                <td>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: 4,
                                        fontSize: 12,
                                        background: item.status === 'Received' ? '#e8f5e9' : '#fff3e0',
                                        color: item.status === 'Received' ? '#2ecc71' : '#f39c12'
                                    }}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FundsReceivedFromMinistry;
