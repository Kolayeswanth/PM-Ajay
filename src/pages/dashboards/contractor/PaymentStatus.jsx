import React, { useState } from 'react';

const PaymentStatus = () => {
    const [payments, setPayments] = useState([
        { id: 1, workId: 'WO-101', title: 'Community Hall Foundation', amount: '₹15,00,000', date: '2025-10-15', status: 'Paid', transactionId: 'TXN123456' },
        { id: 2, workId: 'WO-101', title: 'Community Hall Walls', amount: '₹10,00,000', date: '2025-11-20', status: 'Pending', transactionId: '-' },
        { id: 3, workId: 'WO-103', title: 'Solar Lights Supply', amount: '₹25,00,000', date: '2025-11-05', status: 'Paid', transactionId: 'TXN789012' },
    ]);

    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleDownloadInvoice = (payment) => {
        showToast(`Downloading invoice for ${payment.workId}...`);
        // Mock download
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Payment Status & History</h2>
            </div>

            {toast && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>{toast}</div>
                </div>
            )}

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Work ID</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Transaction ID</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(payment => (
                            <tr key={payment.id}>
                                <td><strong>{payment.workId}</strong></td>
                                <td>{payment.title}</td>
                                <td>{payment.amount}</td>
                                <td>{payment.date}</td>
                                <td>
                                    <span className={`badge badge-${payment.status === 'Paid' ? 'success' : 'warning'}`}>
                                        {payment.status}
                                    </span>
                                </td>
                                <td>{payment.transactionId}</td>
                                <td>
                                    <button className="btn btn-secondary btn-sm" onClick={() => handleDownloadInvoice(payment)}>Invoice</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentStatus;
