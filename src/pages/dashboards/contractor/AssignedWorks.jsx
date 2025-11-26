import React, { useState } from 'react';

const AssignedWorks = ({ works }) => {
    const [filterStatus, setFilterStatus] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleViewWorkOrder = (work) => {
        try {
            const printWindow = window.open('', '_blank');
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Work Order - ${work.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 20px; margin-bottom: 30px; }
                        h1 { color: #2c3e50; margin: 0; }
                        .section { margin-bottom: 25px; }
                        .section-title { font-weight: bold; color: #2c3e50; font-size: 16px; margin-bottom: 8px; border-bottom: 2px solid #ecf0f1; padding-bottom: 5px; }
                        .info-row { display: flex; margin-bottom: 10px; }
                        .info-label { font-weight: bold; width: 200px; color: #555; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Work Order Details</h1>
                        <div style="color: #666; margin-top: 5px;">Order ID: WO-${work.id}</div>
                    </div>
                    <div class="section">
                        <div class="section-title">Project Information</div>
                        <div class="info-row"><div class="info-label">Project Title:</div><div>${work.title}</div></div>
                        <div class="info-row"><div class="info-label">Location:</div><div>${work.location}</div></div>
                        <div class="info-row"><div class="info-label">Contract Amount:</div><div>${work.amount}</div></div>
                    </div>
                    <div class="section">
                        <div class="section-title">Timeline & Status</div>
                        <div class="info-row"><div class="info-label">Start Date:</div><div>${work.date}</div></div>
                        <div class="info-row"><div class="info-label">Deadline:</div><div>${work.deadline}</div></div>
                        <div class="info-row"><div class="info-label">Current Status:</div><div>${work.status}</div></div>
                    </div>
                    <div style="margin-top: 50px; text-align: center; color: #666; font-size: 12px;">Generated on: ${new Date().toLocaleString()}</div>
                </body>
                </html>
            `;
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.onload = function () { printWindow.print(); };
            showToast('Work Order PDF opened');
        } catch (error) {
            console.error('Error generating PDF:', error);
            showToast('Error generating PDF');
        }
    };

    const filteredWorks = filterStatus
        ? works.filter(w => w.status === filterStatus)
        : works;

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Assigned Works</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                    <select
                        className="form-control"
                        style={{ width: '180px' }}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Not Started">Not Started</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
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
                            <th>Order ID</th>
                            <th>Project Title</th>
                            <th>Location</th>
                            <th>Amount</th>
                            <th>Deadline</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredWorks.length > 0 ? (
                            filteredWorks.map(work => (
                                <tr key={work.id}>
                                    <td><strong>WO-{work.id}</strong></td>
                                    <td>{work.title}</td>
                                    <td>{work.location}</td>
                                    <td>{work.amount}</td>
                                    <td>{work.deadline}</td>
                                    <td>
                                        <span className={`badge badge-${work.status === 'Completed' ? 'success' : work.status === 'In Progress' ? 'warning' : 'info'}`}>
                                            {work.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-secondary btn-sm" onClick={() => handleViewWorkOrder(work)}>View Order</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                    No assigned works found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AssignedWorks;
