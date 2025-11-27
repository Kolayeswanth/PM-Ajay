import React, { useState } from 'react';
import Modal from '../../../components/Modal';

const WorkOrders = ({ orders, onUpdateOrder }) => {
    // Use props 'orders' instead of local state
    const [filterStatus, setFilterStatus] = useState('');
    const [toast, setToast] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleViewPDF = (order) => {
        try {
            const printWindow = window.open('', '_blank');
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Work Order - ${order.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 20px; margin-bottom: 30px; }
                        h1 { color: #2c3e50; margin: 0; }
                        .section { margin-bottom: 25px; }
                        .section-title { font-weight: bold; color: #2c3e50; font-size: 16px; margin-bottom: 8px; border-bottom: 2px solid #ecf0f1; padding-bottom: 5px; }
                        .info-row { display: flex; margin-bottom: 10px; }
                        .info-label { font-weight: bold; width: 200px; color: #555; }
                        .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Work Order Details</h1>
                        <div style="color: #666; margin-top: 5px;">Order ID: WO-${order.id}</div>
                    </div>
                    <div class="section">
                        <div class="section-title">Project Information</div>
                        <div class="info-row"><div class="info-label">Project Title:</div><div>${order.title}</div></div>
                        <div class="info-row"><div class="info-label">Location:</div><div>${order.location}</div></div>
                        <div class="info-row"><div class="info-label">Assigned Contractor:</div><div>${order.contractor}</div></div>
                        <div class="info-row"><div class="info-label">Contract Amount:</div><div>${order.amount}</div></div>
                    </div>
                    <div class="section">
                        <div class="section-title">Timeline & Status</div>
                        <div class="info-row"><div class="info-label">Issue Date:</div><div>${order.date}</div></div>
                        <div class="info-row"><div class="info-label">Deadline:</div><div>${order.deadline}</div></div>
                        <div class="info-row"><div class="info-label">Current Status:</div><div>${order.status}</div></div>
                    </div>
                    <div class="section">
                        <div class="section-title">Terms & Conditions</div>
                        <p>1. The work should be completed within the stipulated deadline.<br>
                           2. Quality of materials used must adhere to PWD standards.<br>
                           3. Weekly progress reports must be submitted by the contractor.</p>
                    </div>
                    <div style="margin-top: 50px; text-align: center; color: #666; font-size: 12px;">Generated on: ${new Date().toLocaleString()}</div>
                </body>
                </html>
            `;
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.onload = function () { printWindow.print(); };
            showToast('PDF preview opened');
        } catch (error) {
            console.error('Error generating PDF:', error);
            showToast('Error generating PDF');
        }
    };

    const openUpdateModal = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setIsModalOpen(true);
    };

    const handleUpdateStatus = () => {
        if (selectedOrder && newStatus) {
            onUpdateOrder({ ...selectedOrder, status: newStatus });
            showToast(`Order status updated to ${newStatus}`);
            setIsModalOpen(false);
        }
    };

    const filteredOrders = filterStatus
        ? orders.filter(o => o.status === filterStatus)
        : orders;

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Work Orders Management</h2>
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
                            <th>Contractor</th>
                            <th>Amount</th>
                            <th>Deadline</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <tr key={order.id}>
                                    <td><strong>WO-{order.id}</strong></td>
                                    <td>{order.title}</td>
                                    <td>{order.location}</td>
                                    <td>{order.contractor}</td>
                                    <td>{order.amount}</td>
                                    <td>{order.deadline}</td>
                                    <td>
                                        <span className={`badge badge-${order.status === 'Completed' ? 'success' : order.status === 'In Progress' ? 'warning' : 'info'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleViewPDF(order)}>View</button>
                                            <button className="btn btn-primary btn-sm" onClick={() => openUpdateModal(order)}>Update</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                    No work orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Update Work Order Status"
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: '2px solid #ddd', color: '#333', padding: '8px 14px', borderRadius: 8 }}>
                            Cancel
                        </button>
                        <button onClick={handleUpdateStatus} className="btn btn-primary" style={{ padding: '8px 14px' }}>
                            Save Changes
                        </button>
                    </div>
                }
            >
                <div className="form-group">
                    <label className="form-label">Select New Status</label>
                    <select
                        className="form-control"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                    >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Delayed">Delayed</option>
                    </select>
                </div>
            </Modal>
        </div>
    );
};

export default WorkOrders;
