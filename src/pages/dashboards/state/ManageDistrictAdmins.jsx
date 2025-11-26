import React, { useState } from 'react';
import Modal from '../../../components/Modal';

// List of major districts in Maharashtra (you can expand this)
const MAHARASHTRA_DISTRICTS = [
    "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur",
    "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur",
    "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar",
    "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur",
    "Thane", "Wardha", "Washim", "Yavatmal"
];

const ManageDistrictAdmins = () => {
    const [admins, setAdmins] = useState([
        { id: 1, district: 'Pune', name: 'Rahul Deshmukh', email: 'rahul.d@pune.gov.in', phone: '9876543210', status: 'Active', username: 'rahul.pun', password: 'Pun@2024' },
        { id: 2, district: 'Mumbai City', name: 'Priya Sharma', email: 'priya.s@mumbai.gov.in', phone: '9876543211', status: 'Active', username: 'priya.mum', password: 'Mum@2024' },
        { id: 3, district: 'Nagpur', name: 'Vikram Singh', email: 'vikram.s@nagpur.gov.in', phone: '9876543212', status: 'Inactive', username: 'vikram.nag', password: 'Nag@2024' },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [formData, setFormData] = useState({ district: '', name: '', email: '', phone: '', status: true, username: '', password: '' });
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // small helper to show transient messages
    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleAdd = () => {
        setCurrentAdmin(null);
        setFormData({ district: '', name: '', email: '', phone: '', status: true, username: '', password: '' });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleEdit = (admin) => {
        setCurrentAdmin(admin);
        setFormData({ ...admin, status: admin.status === 'Active', username: admin.username || '', password: admin.password || '' });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleDeleteClick = (admin) => {
        setCurrentAdmin(admin);
        setIsDeleteModalOpen(true);
    };

    // Basic validation
    const validate = () => {
        const errs = {};
        if (!formData.district) errs.district = 'Please select a district.';
        if (!formData.name.trim()) errs.name = 'Please enter admin name.';
        if (!formData.username.trim()) errs.username = 'Please enter username.';
        else if (formData.username.length < 4) errs.username = 'Username must be at least 4 characters.';
        if (!formData.password.trim()) errs.password = 'Please enter password.';
        else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters.';
        if (!formData.email.trim()) errs.email = 'Please enter email address.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Please enter a valid email address.';
        if (!formData.phone.trim()) errs.phone = 'Please enter phone number.';
        else if (!/^[0-9]{10}$/.test(formData.phone)) errs.phone = 'Please enter a valid 10-digit phone number.';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;

        if (currentAdmin) {
            setAdmins(admins.map(a => a.id === currentAdmin.id ? { ...formData, id: a.id, status: formData.status ? 'Active' : 'Inactive' } : a));
            showToast(`Admin "${formData.name}" updated successfully`);
        } else {
            setAdmins([...admins, { ...formData, id: Date.now(), status: formData.status ? 'Active' : 'Inactive' }]);
            showToast(`Admin "${formData.name}" added successfully`);
        }
        setIsModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        setAdmins(admins.map(a => a.id === currentAdmin.id ? { ...a, status: 'Inactive' } : a)); // Soft delete/Deactivate
        showToast(`Admin "${currentAdmin.name}" deactivated successfully`);
        setIsDeleteModalOpen(false);
    };

    const handleActivate = (admin) => {
        setAdmins(admins.map(a => a.id === admin.id ? { ...a, status: 'Active' } : a));
        showToast(`Admin "${admin.name}" activated successfully`);
    };

    // Export to PDF function using print
    const handleExportPDF = () => {
        try {
            console.log('Export PDF button clicked!');

            // Create a new window for printing
            const printWindow = window.open('', '_blank');

            // Generate HTML content
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>District Admins List</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                        }
                        h1 {
                            color: #2c3e50;
                            border-bottom: 3px solid #3498db;
                            padding-bottom: 10px;
                        }
                        .metadata {
                            margin: 20px 0;
                            color: #666;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 20px;
                        }
                        th {
                            background-color: #3498db;
                            color: white;
                            padding: 12px;
                            text-align: left;
                            font-weight: bold;
                        }
                        td {
                            padding: 10px;
                            border: 1px solid #ddd;
                        }
                        tr:nth-child(even) {
                            background-color: #f9f9f9;
                        }
                        .status-active {
                            color: green;
                            font-weight: bold;
                        }
                        .status-inactive {
                            color: red;
                            font-weight: bold;
                        }
                        @media print {
                            body {
                                padding: 10px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <h1>District Admins List</h1>
                    <div class="metadata">
                        <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                        <p><strong>Total Admins:</strong> ${admins.length}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>District</th>
                                <th>Admin Name</th>
                                <th>Username</th>
                                <th>Password</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${admins.map(admin => `
                                <tr>
                                    <td>${admin.district}</td>
                                    <td>${admin.name}</td>
                                    <td>${admin.username}</td>
                                    <td>${admin.password}</td>
                                    <td>${admin.email}</td>
                                    <td>${admin.phone}</td>
                                    <td class="${admin.status === 'Active' ? 'status-active' : 'status-inactive'}">${admin.status}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
                </html>
            `;

            // Write content to new window
            printWindow.document.write(htmlContent);
            printWindow.document.close();

            // Wait for content to load, then trigger print dialog
            printWindow.onload = function () {
                printWindow.print();
            };

            showToast('Print dialog opened! Use "Save as PDF" option.');
            console.log('Print window opened successfully');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            showToast('Error exporting PDF. Please try again.');
        }
    };

    // Filter admins based on search query
    const filteredAdmins = admins.filter(admin => {
        const query = searchQuery.toLowerCase();
        return (
            admin.name.toLowerCase().includes(query) ||
            admin.district.toLowerCase().includes(query) ||
            admin.email.toLowerCase().includes(query) ||
            admin.phone.includes(query)
        );
    });

    return (
        <div className="dashboard-panel" style={{ padding: 20, height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>Manage District Admins</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                    <input
                        type="text"
                        placeholder="Search by name, district, email, or phone..."
                        className="form-input"
                        style={{ width: '300px' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="btn btn-primary btn-sm" onClick={handleAdd}>+ Add New Admin</button>
                    <button className="btn btn-outline btn-sm" onClick={handleExportPDF}>📥 Export</button>
                </div>
            </div>

            {toast && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>{toast}</div>
                </div>
            )}

            <div className="table-wrapper" style={{ marginBottom: 16 }}>
                <table className="table" style={{ minWidth: 800 }}>
                    <thead>
                        <tr>
                            <th>District</th>
                            <th>Admin Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAdmins.map(admin => (
                            <tr key={admin.id}>
                                <td>{admin.district}</td>
                                <td style={{ padding: '12px 16px' }}>
                                    <div style={{ fontWeight: 700 }}>{admin.name}</div>
                                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                                        <div>Username: <span style={{ fontWeight: 600, color: '#333' }}>{admin.username}</span></div>
                                        <div>Password: <span style={{ fontWeight: 600, color: '#333' }}>{admin.password}</span></div>
                                    </div>
                                </td>
                                <td>{admin.email}</td>
                                <td>{admin.phone}</td>
                                <td>
                                    <span className={`badge badge-${admin.status === 'Active' ? 'success' : 'error'}`}>
                                        {admin.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(admin)} style={{ marginRight: '5px' }}>Edit</button>
                                    {admin.status === 'Active' ? (
                                        <button className="btn btn-outline btn-sm" onClick={() => handleDeleteClick(admin)}>Deactivate</button>
                                    ) : (
                                        <button className="btn btn-primary btn-sm" onClick={() => handleActivate(admin)}>Activate</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Admin Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentAdmin ? "Edit District Admin" : "Add New District Admin"}
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: '2px solid #ddd', color: '#333', padding: '8px 14px', borderRadius: 8 }}>
                            Cancel
                        </button>
                        <button onClick={handleSave} className="btn btn-primary" style={{ padding: '8px 14px' }}>
                            Save
                        </button>
                    </div>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    <div className="form-group">
                        <label className="form-label">District Name</label>
                        <select
                            className="form-control"
                            value={formData.district}
                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        >
                            <option value="">-- select district --</option>
                            {MAHARASHTRA_DISTRICTS.map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                        {errors.district && <div className="form-error">{errors.district}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Admin Name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Rahul Deshmukh"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{ padding: '10px' }}
                        />
                        {errors.name && <div className="form-error">{errors.name}</div>}
                        <div className="form-helper">Enter the full name of the district admin</div>
                    </div>

                    {/* Admin Credentials Section */}
                    <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#333' }}>Admin Credentials</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div className="form-group">
                                <label className="form-label">Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. rahul.pun"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    style={{ padding: '10px' }}
                                />
                                {errors.username && <div className="form-error">{errors.username}</div>}
                                <div className="form-helper">Unique login username</div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Pun@2024"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    style={{ padding: '10px' }}
                                />
                                {errors.password && <div className="form-error">{errors.password}</div>}
                                <div className="form-helper">Minimum 6 characters</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="e.g. admin@district.gov.in"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{ padding: '10px' }}
                            />
                            {errors.email && <div className="form-error">{errors.email}</div>}
                            <div className="form-helper">Official government email</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                className="form-control"
                                placeholder="e.g. 9876543210"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                style={{ padding: '10px' }}
                            />
                            {errors.phone && <div className="form-error">{errors.phone}</div>}
                            <div className="form-helper">10-digit mobile number</div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                                type="checkbox"
                                checked={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                            />
                            Active Status
                        </label>
                        <div className="form-helper">Uncheck to deactivate admin access</div>
                    </div>

                    <div style={{ fontSize: 13, color: '#555' }}>
                        <strong>Note:</strong> The admin will receive login credentials via email after account creation.
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deactivation"
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => setIsDeleteModalOpen(false)} style={{ background: 'transparent', border: '2px solid #ddd', color: '#333', padding: '8px 14px', borderRadius: 8 }}>
                            Cancel
                        </button>
                        <button onClick={handleDeleteConfirm} className="btn btn-error" style={{ padding: '8px 14px' }}>
                            Deactivate
                        </button>
                    </div>
                }
            >
                <p>Are you sure you want to deactivate this admin? They will no longer be able to access the system.</p>
            </Modal>
        </div>
    );
};

export default ManageDistrictAdmins;
