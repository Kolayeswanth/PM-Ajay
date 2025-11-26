import React, { useState } from 'react';

const ContractorHelp = () => {
    const [formData, setFormData] = useState({
        subject: '',
        category: 'Payment Issue',
        priority: 'Medium',
        message: ''
    });
    const [tickets, setTickets] = useState([
        { id: 1, subject: 'Payment Delay for WO-101', category: 'Payment Issue', status: 'Open', date: '2025-11-24', priority: 'High' },
    ]);
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.subject || !formData.message) return;

        const newTicket = {
            id: Date.now(),
            subject: formData.subject,
            category: formData.category,
            priority: formData.priority,
            status: 'Open',
            date: new Date().toISOString().split('T')[0]
        };

        setTickets([newTicket, ...tickets]);
        showToast('Support ticket submitted successfully!');
        setFormData({ subject: '', category: 'Payment Issue', priority: 'Medium', message: '' });
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Help & Support</h2>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>Contact department for issues related to works or payments</p>
            </div>

            {toast && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>{toast}</div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
                {/* Contact Support Form */}
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 15 }}>Submit Issue</h3>
                    <div className="card" style={{ padding: 20 }}>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Subject</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Brief description of issue"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select
                                        className="form-control"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Payment Issue">Payment Issue</option>
                                        <option value="Site Issue">Site Issue</option>
                                        <option value="Material Shortage">Material Shortage</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Priority</label>
                                    <select
                                        className="form-control"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Describe your issue in detail..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 10 }}>
                                Submit Ticket
                            </button>
                        </form>
                    </div>
                </div>

                {/* My Tickets Section */}
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 15 }}>My Tickets</h3>
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Subject</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map(ticket => (
                                    <tr key={ticket.id}>
                                        <td><strong>#{ticket.id}</strong></td>
                                        <td>{ticket.subject}</td>
                                        <td>
                                            <span className={`badge badge-${ticket.status === 'Resolved' ? 'success' : 'warning'}`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td>{ticket.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractorHelp;
