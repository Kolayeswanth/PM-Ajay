import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';

const ManageStateAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [formData, setFormData] = useState({
        admin_name: '',
        state_name: '',
        phone_no: '',
        email: '',
        bank_account_number: ''
    });
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);

    // API Base URL
    const API_BASE_URL = 'http://localhost:5001/api/state-admins';

    // Fetch all state admins from backend
    useEffect(() => {
        fetchStateAdmins();
    }, []);

    const fetchStateAdmins = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_BASE_URL);
            const result = await response.json();

            if (result.success) {
                setAdmins(result.data);
            } else {
                showToast('Error fetching state admins', 'error');
            }
        } catch (error) {
            console.error('Error fetching state admins:', error);
            showToast('Failed to load state admins', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Open modal to add new admin
    const handleAdd = () => {
        setCurrentAdmin(null);
        setFormData({ admin_name: '', state_name: '', phone_no: '', email: '', bank_account_number: '' });
        setErrors({});
        setIsModalOpen(true);
    };

    // Open modal to edit existing admin
    const handleEdit = (admin) => {
        setCurrentAdmin(admin);
        setFormData({
            admin_name: admin.admin_name,
            state_name: admin.state_name,
            phone_no: admin.phone_no,
            email: admin.email,
            bank_account_number: admin.bank_account_number
        });
        setErrors({});
        setIsModalOpen(true);
    };

    // Validation
    const validate = () => {
        const errs = {};
        if (!formData.admin_name.trim()) errs.admin_name = 'Please enter admin name.';
        if (!formData.state_name.trim()) errs.state_name = 'Please enter state name.';
        if (!formData.email.trim()) errs.email = 'Please enter email address.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            errs.email = 'Please enter a valid email address.';
        if (!formData.phone_no.trim()) errs.phone_no = 'Please enter phone number.';
        else if (!/^[0-9]{10}$/.test(formData.phone_no))
            errs.phone_no = 'Please enter a valid 10-digit phone number.';
        if (!formData.bank_account_number.trim())
            errs.bank_account_number = 'Please enter bank account number.';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Save (Add or Update) state admin
    const handleSave = async () => {
        if (!validate()) return;

        try {
            setLoading(true);
            let response;

            if (currentAdmin) {
                // Update existing admin
                response = await fetch(`${API_BASE_URL}/${currentAdmin.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                // Add new admin
                response = await fetch(API_BASE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }

            const result = await response.json();

            if (result.success) {
                showToast(result.message, 'success');
                fetchStateAdmins(); // Refresh the list
                setIsModalOpen(false);
            } else {
                showToast(result.error || 'Failed to save admin', 'error');
            }
        } catch (error) {
            console.error('Error saving admin:', error);
            showToast('Failed to save admin', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Deactivate state admin (deletes from database)
    const handleDeactivate = async (admin) => {
        if (!confirm(`Are you sure you want to deactivate and remove "${admin.admin_name}" from the database? This action cannot be undone.`)) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/${admin.id}/deactivate`, {
                method: 'PATCH'
            });

            const result = await response.json();

            if (result.success) {
                showToast(`Admin "${admin.admin_name}" deactivated and removed successfully`, 'success');
                fetchStateAdmins(); // Refresh the list
            } else {
                showToast(result.error || 'Failed to deactivate admin', 'error');
            }
        } catch (error) {
            console.error('Error deactivating admin:', error);
            showToast('Failed to deactivate admin', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20, height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>Manage State Admins</h2>
                <button className="btn btn-primary btn-sm" onClick={handleAdd}>
                    + Add State Admin
                </button>
            </div>

            {toast && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{
                        display: 'inline-block',
                        background: toast.type === 'error' ? '#E74C3C' : '#00B894',
                        color: '#fff',
                        padding: '8px 12px',
                        borderRadius: 6
                    }}>
                        {toast.message}
                    </div>
                </div>
            )}

            {loading && (
                <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>
                    Loading...
                </div>
            )}

            <div className="table-wrapper" style={{ marginBottom: 16 }}>
                <table className="table" style={{ minWidth: 800 }}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>State Name</th>
                            <th>Phone No</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.length > 0 ? (
                            admins.map(admin => (
                                <tr key={admin.id}>
                                    <td style={{ fontWeight: 600 }}>{admin.admin_name}</td>
                                    <td>{admin.state_name}</td>
                                    <td>{admin.phone_no}</td>
                                    <td>{admin.email}</td>
                                    <td>
                                        <span className={`badge badge-${admin.status === 'Active' ? 'success' : 'error'}`}>
                                            {admin.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleEdit(admin)}
                                            style={{ marginRight: '5px' }}
                                            disabled={loading}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-outline btn-sm"
                                            onClick={() => handleDeactivate(admin)}
                                            disabled={loading}
                                        >
                                            Deactivate
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                    No states found. Click "Add State Admin" to create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Admin Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentAdmin ? "Edit State Admin" : "Add New State Admin"}
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{
                                background: 'transparent',
                                border: '2px solid #ddd',
                                color: '#333',
                                padding: '8px 14px',
                                borderRadius: 8
                            }}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="btn btn-primary"
                            style={{ padding: '8px 14px' }}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Confirm Release'}
                        </button>
                    </div>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Rajesh Kumar"
                            value={formData.admin_name}
                            onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                            style={{ padding: '10px' }}
                        />
                        {errors.admin_name && <div className="form-error">{errors.admin_name}</div>}
                        <div className="form-helper">Enter the full name of the admin</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">State Name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Maharashtra"
                            value={formData.state_name}
                            onChange={(e) => setFormData({ ...formData, state_name: e.target.value })}
                            style={{ padding: '10px' }}
                        />
                        {errors.state_name && <div className="form-error">{errors.state_name}</div>}
                        <div className="form-helper">Enter the name of the state</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="e.g. admin@state.gov.in"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={{ padding: '10px' }}
                        />
                        {errors.email && <div className="form-error">{errors.email}</div>}
                        <div className="form-helper">Official government email</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone No</label>
                        <input
                            type="tel"
                            className="form-control"
                            placeholder="e.g. 9876543210"
                            value={formData.phone_no}
                            onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })}
                            style={{ padding: '10px' }}
                        />
                        {errors.phone_no && <div className="form-error">{errors.phone_no}</div>}
                        <div className="form-helper">10-digit mobile number</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Bank Account Number</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. 1234567890123456"
                            value={formData.bank_account_number}
                            onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                            style={{ padding: '10px' }}
                        />
                        {errors.bank_account_number && <div className="form-error">{errors.bank_account_number}</div>}
                        <div className="form-helper">Bank account number for fund transfers (stored in database, not displayed in table)</div>
                    </div>

                    <div style={{ fontSize: 13, color: '#555', marginTop: 10 }}>
                        <strong>Note:</strong> The state admin will be added with "Active" status by default. Bank account number will be stored securely in the database.
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ManageStateAdmins;
