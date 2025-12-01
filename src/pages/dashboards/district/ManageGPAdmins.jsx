import React, { useState } from 'react';
import Modal from '../../../components/Modal';

const ManageGPAdmins = () => {
    const [admins, setAdmins] = useState([
        { id: 1, name: 'Ramesh Patil', gp: 'Shirur', email: 'ramesh.patil@gp.gov.in', phone: '9876543210', status: 'Active', lastLogin: '2025-11-20' },
        { id: 2, name: 'Suresh Deshmukh', gp: 'Khed', email: 'suresh.deshmukh@gp.gov.in', phone: '9876543211', status: 'Active', lastLogin: '2025-11-18' },
        { id: 3, name: 'Mahesh Joshi', gp: 'Baramati', email: 'mahesh.joshi@gp.gov.in', phone: '9876543212', status: 'Inactive', lastLogin: '2025-10-15' },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ name: '', gp: '', email: '', phone: '', username: '', password: '' });
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const validate = () => {
        const errs = {};
        if (!formData.name.trim()) errs.name = 'Name is required';
        if (!formData.gp.trim()) errs.gp = 'Agency name is required';
        if (!formData.email.trim()) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email format';
        if (!formData.phone.trim()) errs.phone = 'Phone is required';
        else if (!/^[0-9]{10}$/.test(formData.phone)) errs.phone = 'Invalid phone number';
        if (!formData.username.trim()) errs.username = 'Username is required';
        if (!formData.password.trim()) errs.password = 'Password is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleAddAdmin = () => {
        if (!validate()) return;

        const newAdmin = {
            id: Date.now(),
            name: formData.name,
            gp: formData.gp,
            email: formData.email,
            phone: formData.phone,
            status: 'Active',
            lastLogin: 'Never'
        };

        setAdmins([...admins, newAdmin]);
        showToast(`Implementing Agency '${formData.gp}' added successfully`);
        setIsModalOpen(false);
        setFormData({ name: '', gp: '', email: '', phone: '', username: '', password: '' });
        setErrors({});
    };

    const handleToggleStatus = (id) => {
        setAdmins(admins.map(admin => {
            if (admin.id === id) {
                const newStatus = admin.status === 'Active' ? 'Inactive' : 'Active';
                showToast(`Admin status changed to ${newStatus}`);
                return { ...admin, status: newStatus };
            }
            return admin;
        }));
    };

    const handleExportPDF = () => {
        try {
            const printWindow = window.open('', '_blank');
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Implementing Agencies List</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { text-align: center; color: #2c3e50; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background-color: #3498db; color: white; }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                        .status-active { color: green; font-weight: bold; }
                        .status-inactive { color: red; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>Implementing Agencies List - District</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Agency Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Last Login</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${admins.map(admin => `
                                <tr>
                                    <td>${admin.name}</td>
                                    <td>${admin.gp}</td>
                                    <td>${admin.email}</td>
                                    <td>${admin.phone}</td>
                                    <td class="status-${admin.status.toLowerCase()}">${admin.status}</td>
                                    <td>${admin.lastLogin}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div style="margin-top: 20px; text-align: center; color: #666;">
                        Generated on: ${new Date().toLocaleString()}
                    </div>
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

    const filteredAdmins = admins.filter(admin =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.gp.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Manage Implementing Agencies</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                    <input
                        type="text"
                        placeholder="Search by Name or Agency..."
                        className="form-control"
                        style={{ width: '250px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>+ Add New Agency</button>
                    <button className="btn btn-secondary btn-sm" onClick={handleExportPDF}>📥 Export List</button>
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
                            <th>Name</th>
                            <th>Agency Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Last Login</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAdmins.length > 0 ? (
                            filteredAdmins.map(admin => (
                                <tr key={admin.id}>
                                    <td>{admin.name}</td>
                                    <td>{admin.gp}</td>
                                    <td>{admin.email}</td>
                                    <td>{admin.phone}</td>
                                    <td>
                                        <span className={`badge badge-${admin.status === 'Active' ? 'success' : 'error'}`}>
                                            {admin.status}
                                        </span>
                                    </td>
                                    <td>{admin.lastLogin}</td>
                                    <td>
                                        <button
                                            className={`btn btn-sm ${admin.status === 'Active' ? 'btn-outline' : 'btn-primary'}`}
                                            onClick={() => handleToggleStatus(admin.id)}
                                        >
                                            {admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                    No admins found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setErrors({}); }}
                title="Add New Implementing Agency"
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => { setIsModalOpen(false); setErrors({}); }} style={{ background: 'transparent', border: '2px solid #ddd', color: '#333', padding: '8px 14px', borderRadius: 8 }}>
                            Cancel
                        </button>
                        <button onClick={handleAddAdmin} className="btn btn-primary" style={{ padding: '8px 14px' }}>
                            Save Admin
                        </button>
                    </div>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        {errors.name && <div className="form-error">{errors.name}</div>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Agency Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.gp}
                            onChange={(e) => setFormData({ ...formData, gp: e.target.value })}
                        />
                        {errors.gp && <div className="form-error">{errors.gp}</div>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        {errors.email && <div className="form-error">{errors.email}</div>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input
                            type="tel"
                            className="form-control"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        {errors.phone && <div className="form-error">{errors.phone}</div>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                        {errors.username && <div className="form-error">{errors.username}</div>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        {errors.password && <div className="form-error">{errors.password}</div>}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ManageGPAdmins;
