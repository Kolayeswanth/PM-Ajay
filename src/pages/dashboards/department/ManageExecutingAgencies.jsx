import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { useAuth } from '../../../contexts/AuthContext';

const ManageExecutingAgencies = () => {
    const { user } = useAuth();
    const [agencies, setAgencies] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        role: '',
        component: ''
    });
    const [errors, setErrors] = useState({});

    // Supabase Configuration
    const SUPABASE_URL = 'https://gwfeaubvzjepmmhxgdvc.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZmVhdWJ2emplcG1taHhnZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjY1MDEsImV4cCI6MjA3OTc0MjUwMX0.uelA90LXrAcLazZi_LkdisGqft-dtvj0wgOQweMEUGE';

    useEffect(() => {
        fetchAgencies();
    }, [user?.id]);

    const fetchAgencies = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/executing_agencies?implementing_agency_id=eq.${user.id}&select=*&order=created_at.desc`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') ? JSON.parse(localStorage.getItem('supabase.auth.token')).access_token : ''}`
                }
            });
            if (response.ok) {
                const data = await response.json();
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
        if (!formData.phone.trim()) errs.phone = 'Phone number is required';
        if (!formData.role.trim()) errs.role = 'Role is required';
        if (!formData.component) errs.component = 'Component is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            const payload = {
                ...formData,
                implementing_agency_id: user.id,
                created_by: user.id
            };

            const response = await fetch(`${SUPABASE_URL}/rest/v1/executing_agencies`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') ? JSON.parse(localStorage.getItem('supabase.auth.token')).access_token : ''}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                fetchAgencies();
                setIsModalOpen(false);
                setFormData({ name: '', phone: '', role: '', component: '' });
            } else {
                console.error('Failed to add agency');
            }
        } catch (error) {
            console.error('Error adding agency:', error);
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
                            <th>Phone No</th>
                            <th>Role</th>
                            <th>Component</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : agencies.length > 0 ? (
                            agencies.map((agency) => (
                                <tr key={agency.id}>
                                    <td>{agency.name}</td>
                                    <td>{agency.phone}</td>
                                    <td>{agency.role}</td>
                                    <td><span className="badge badge-primary">{agency.component}</span></td>
                                    <td>
                                        <button className="btn btn-sm btn-outline">Edit</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>No executing agencies found. Add one to get started.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add Executing Agency"
                footer={
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
                    </div>
                }
            >
                <div className="form-group" style={{ marginBottom: 15 }}>
                    <label className="form-label">Name</label>
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
                    <label className="form-label">Role</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder="Enter role"
                    />
                    {errors.role && <div className="form-error">{errors.role}</div>}
                </div>

                <div className="form-group" style={{ marginBottom: 15 }}>
                    <label className="form-label">Component</label>
                    <select
                        className="form-control"
                        value={formData.component}
                        onChange={(e) => setFormData({ ...formData, component: e.target.value })}
                    >
                        <option value="">Select Component</option>
                        <option value="Adarsh Gram">Adarsh Gram</option>
                        <option value="GIA">GIA</option>
                        <option value="Hostel">Hostel</option>
                    </select>
                    {errors.component && <div className="form-error">{errors.component}</div>}
                </div>
            </Modal>
        </div>
    );
};

export default ManageExecutingAgencies;
