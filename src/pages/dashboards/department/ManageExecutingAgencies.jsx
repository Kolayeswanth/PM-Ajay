import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';

const ManageExecutingAgencies = () => {
    const { user } = useAuth();
    const [agencies, setAgencies] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        agency_officer: '',
        phone: '',
        email: '',
        work_assigned: '',
        status: 'Active'
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchAgencies();
    }, [user?.id]);

    const fetchAgencies = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            // Fetch from the new 'agency_assignments' table
            const { data, error } = await supabase
                .from('agency_assignments')
                .select('*')
                .eq('implementing_agency_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                // No need to map 'agency_name' anymore as new table uses 'name'
                setAgencies(data);
            }
        } catch (error) {
            console.error('Error fetching agencies:', error);
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const errs = {};
        if (!formData.name.trim()) errs.name = 'Name is required';
        if (!formData.agency_officer.trim()) errs.agency_officer = 'Agency Officer is required';
        if (!formData.phone.trim()) errs.phone = 'Phone number is required';
        if (!formData.email.trim()) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email format';
        if (!formData.work_assigned.trim()) errs.work_assigned = 'Work Assigned is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        if (editingId) {
            // Editing an existing item
            const isLocal = agencies.find(a => a.id === editingId)?.status === 'Inactive';

            if (isLocal) {
                // Update local state
                setAgencies(prev => prev.map(a => a.id === editingId ? { ...a, ...formData } : a));
                handleCloseModal();
            } else {
                // Update in DB (agency_assignments table)
                try {
                    const payload = {
                        name: formData.name,
                        agency_officer: formData.agency_officer,
                        phone: formData.phone,
                        email: formData.email,
                        work_assigned: formData.work_assigned,
                    };

                    const { error } = await supabase
                        .from('agency_assignments')
                        .update(payload)
                        .eq('id', editingId);

                    if (error) throw error;

                    setAgencies(prev => prev.map(a => a.id === editingId ? { ...a, ...formData } : a));
                    handleCloseModal();
                } catch (error) {
                    console.error('Error updating agency:', error);
                    alert('Failed to update agency: ' + error.message);
                }
            }
        } else {
            // Adding new item -> Local Only (Inactive)
            const newAgency = {
                id: `local-${Date.now()}`,
                ...formData,
                status: 'Inactive',
                implementing_agency_id: user.id
            };
            setAgencies([newAgency, ...agencies]);
            handleCloseModal();
        }
    };

    const handleEdit = (agency) => {
        setEditingId(agency.id);
        setFormData({
            name: agency.name,
            agency_officer: agency.agency_officer || '',
            phone: agency.phone,
            email: agency.email || '',
            work_assigned: agency.work_assigned || '',
            status: agency.status || 'Active'
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ name: '', agency_officer: '', phone: '', email: '', work_assigned: '', status: 'Active' });
        setErrors({});
    };

    const handleStatusChange = async (agency, newStatus) => {
        setProcessingId(agency.id);
        if (newStatus === 'Active') {
            // Activate: Add to DB (agency_assignments)
            try {
                const payload = {
                    name: agency.name,
                    agency_officer: agency.agency_officer,
                    phone: agency.phone,
                    email: agency.email,
                    work_assigned: agency.work_assigned,
                    status: 'Active',
                    implementing_agency_id: user.id
                };

                const { data, error } = await supabase
                    .from('agency_assignments')
                    .insert([payload])
                    .select();

                if (error) throw error;

                if (data) {
                    const savedData = data[0];
                    setAgencies(prev => prev.map(a => a.id === agency.id ? savedData : a));
                }
            } catch (error) {
                console.error('Error activating agency:', error);
                alert('Failed to activate agency: ' + error.message);
            } finally {
                setProcessingId(null);
            }
        } else {
            // Deactivate: Remove from DB (agency_assignments)
            try {
                if (!String(agency.id).startsWith('local-')) {
                    const { error } = await supabase
                        .from('agency_assignments')
                        .delete()
                        .eq('id', agency.id);

                    if (error) throw error;
                }
                setAgencies(prev => prev.map(a => a.id === agency.id ? { ...a, status: 'Inactive' } : a));
            } catch (error) {
                console.error('Error deactivating agency:', error);
                alert('Failed to deactivate agency: ' + error.message);
            } finally {
                setProcessingId(null);
            }
        }
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Manage Executing Agencies</h2>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Add Executing Agency</button>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Agency Officer</th>
                            <th>Email</th>
                            <th>Phone No</th>
                            <th>Work Assigned</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : agencies.length > 0 ? (
                            agencies.map((agency) => (
                                <tr key={agency.id}>
                                    <td>{agency.name}</td>
                                    <td>{agency.agency_officer || '-'}</td>
                                    <td>{agency.email || '-'}</td>
                                    <td>{agency.phone}</td>
                                    <td>{agency.work_assigned || '-'}</td>
                                    <td>
                                        <span className={`badge ${agency.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
                                            {agency.status || 'Active'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleEdit(agency)}
                                                style={{ marginRight: '5px' }}
                                                disabled={processingId === agency.id}
                                            >
                                                Edit
                                            </button>
                                            {agency.status === 'Active' ? (
                                                <button
                                                    className="btn btn-outline btn-sm"
                                                    onClick={() => handleStatusChange(agency, 'Inactive')}
                                                    disabled={processingId === agency.id}
                                                >
                                                    {processingId === agency.id ? 'Wait...' : 'Deactivate'}
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleStatusChange(agency, 'Active')}
                                                    disabled={processingId === agency.id}
                                                >
                                                    {processingId === agency.id ? 'Wait...' : 'Activate'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: 20 }}>No executing agencies found. Add one to get started.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingId ? "Edit Executing Agency" : "Add Executing Agency"}
                footer={
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button className="btn btn-outline" onClick={handleCloseModal}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit}>{editingId ? "Update" : "Submit"}</button>
                    </div>
                }
            >
                <div className="form-group" style={{ marginBottom: 15 }}>
                    <label className="form-label">Agency Name</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter agency name"
                    />
                    {errors.name && <div className="form-error">{errors.name}</div>}
                </div>

                <div className="form-group" style={{ marginBottom: 15 }}>
                    <label className="form-label">Agency Officer</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.agency_officer}
                        onChange={(e) => setFormData({ ...formData, agency_officer: e.target.value })}
                        placeholder="Enter officer name"
                    />
                    {errors.agency_officer && <div className="form-error">{errors.agency_officer}</div>}
                </div>

                <div className="form-group" style={{ marginBottom: 15 }}>
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email address"
                    />
                    {errors.email && <div className="form-error">{errors.email}</div>}
                </div>

                <div className="form-group" style={{ marginBottom: 15 }}>
                    <label className="form-label">Phone No</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                    />
                    {errors.phone && <div className="form-error">{errors.phone}</div>}
                </div>

                <div className="form-group" style={{ marginBottom: 15 }}>
                    <label className="form-label">Work Assigned</label>
                    <textarea
                        className="form-control"
                        value={formData.work_assigned}
                        onChange={(e) => setFormData({ ...formData, work_assigned: e.target.value })}
                        placeholder="Enter work assigned"
                        rows="3"
                    />
                    {errors.work_assigned && <div className="form-error">{errors.work_assigned}</div>}
                </div>
            </Modal>
        </div>
    );
};

export default ManageExecutingAgencies;
