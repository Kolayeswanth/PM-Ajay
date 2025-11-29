import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';

const DepartmentReports = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        reportType: 'Execution',
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        description: ''
    });

    useEffect(() => {
        fetchReports();
    }, [user?.id]);

    const fetchReports = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .eq('submitted_by', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = async () => {
        console.log('Submitting report...', formData);
        if (!formData.title || !formData.description) {
            showToast('Please fill in all required fields');
            return;
        }

        if (!user || !user.id) {
            console.error('User not authenticated');
            showToast('User not authenticated');
            return;
        }

        try {
            const payload = {
                title: formData.title,
                report_type: formData.reportType,
                reporting_month: formData.month,
                reporting_year: parseInt(formData.year),
                description: formData.description,
                submitted_by: user.id
            };

            console.log('Payload:', payload);

            const { data, error } = await supabase
                .from('reports')
                .insert([payload])
                .select();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Success:', data);
            fetchReports();
            showToast('Report submitted successfully');
            setIsModalOpen(false);
            setFormData({
                title: '',
                reportType: 'Execution',
                month: new Date().toLocaleString('default', { month: 'long' }),
                year: new Date().getFullYear(),
                description: ''
            });

        } catch (error) {
            console.error('Error submitting report:', error);
            showToast(`Error: ${error.message}`);
        }
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Reports & Analytics</h2>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Submit New Report</button>
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
                            <th>Report Title</th>
                            <th>Type</th>
                            <th>Period</th>
                            <th>Description</th>
                            <th>Submitted On</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : reports.length > 0 ? (
                            reports.map(report => (
                                <tr key={report.id}>
                                    <td><strong>{report.title}</strong></td>
                                    <td><span className="badge badge-primary">{report.report_type}</span></td>
                                    <td>{report.reporting_month} {report.reporting_year}</td>
                                    <td>{report.description.substring(0, 50)}...</td>
                                    <td>{new Date(report.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline">View</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: 20 }}>No reports submitted yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Submit New Report"
                footer={
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit}>Submit Report</button>
                    </div>
                }
            >
                <div className="form-group" style={{ marginBottom: 15 }}>
                    <label className="form-label">Report Title</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Monthly Progress Report - Nov 2025"
                    />
                </div>

                <div className="form-group" style={{ marginBottom: 15 }}>
                    <label className="form-label">Report Type</label>
                    <select
                        className="form-control"
                        value={formData.reportType}
                        onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                    >
                        <option value="Execution">Execution Report</option>
                        <option value="Financial">Financial Report</option>
                        <option value="MPR">Monthly Progress Report (MPR)</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="form-group" style={{ marginBottom: 15, display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                        <label className="form-label">Month</label>
                        <select
                            className="form-control"
                            value={formData.month}
                            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                        >
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label className="form-label">Year</label>
                        <input
                            type="number"
                            className="form-control"
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: 15 }}>
                    <label className="form-label">Description / Remarks</label>
                    <textarea
                        className="form-control"
                        rows="4"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter report details..."
                    ></textarea>
                </div>
            </Modal>
        </div>
    );
};

export default DepartmentReports;
