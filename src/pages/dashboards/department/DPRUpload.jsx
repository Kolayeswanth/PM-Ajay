import React, { useState } from 'react';
import Modal from '../../../components/Modal';

const DPRUpload = ({ dprs, onAddDPR }) => {
    // Use props 'dprs' instead of local state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', location: '', estimatedCost: '', file: null });
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const validate = () => {
        const errs = {};
        if (!formData.title.trim()) errs.title = 'Project title is required';
        if (!formData.location.trim()) errs.location = 'Location is required';
        if (!formData.estimatedCost) errs.estimatedCost = 'Estimated cost is required';
        if (!formData.file) errs.file = 'DPR file is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleUpload = () => {
        if (!validate()) return;

        const newDPR = {
            id: Date.now(),
            title: formData.title,
            location: formData.location,
            estimatedCost: `${formData.estimatedCost} Cr`,
            date: new Date().toISOString().split('T')[0],
            status: 'Submitted',
            file: formData.file.name
        };

        onAddDPR(newDPR); // Call parent handler
        showToast('DPR uploaded successfully');
        setIsModalOpen(false);
        setFormData({ title: '', location: '', estimatedCost: '', file: null });
        setErrors({});
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>DPR Upload & Management</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>+ Upload New DPR</button>
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
                            <th>Project Title</th>
                            <th>Location</th>
                            <th>Estimated Cost</th>
                            <th>Submission Date</th>
                            <th>Status</th>
                            <th>File</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dprs.map(dpr => (
                            <tr key={dpr.id}>
                                <td><strong>{dpr.title}</strong></td>
                                <td>{dpr.location}</td>
                                <td>₹{dpr.estimatedCost}</td>
                                <td>{dpr.date}</td>
                                <td>
                                    <span className={`badge badge-${dpr.status === 'Submitted' ? 'success' : 'warning'}`}>
                                        {dpr.status}
                                    </span>
                                </td>
                                <td>{dpr.file}</td>
                                <td>
                                    <button className="btn btn-secondary btn-sm">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setErrors({}); }}
                title="Upload Detailed Project Report (DPR)"
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => { setIsModalOpen(false); setErrors({}); }} style={{ background: 'transparent', border: '2px solid #ddd', color: '#333', padding: '8px 14px', borderRadius: 8 }}>
                            Cancel
                        </button>
                        <button onClick={handleUpload} className="btn btn-primary" style={{ padding: '8px 14px' }}>
                            Upload DPR
                        </button>
                    </div>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    <div className="form-group">
                        <label className="form-label">Project Title</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Construction of Community Hall"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        {errors.title && <div className="form-error">{errors.title}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Location (GP/District)</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Shirur GP, Pune"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                        {errors.location && <div className="form-error">{errors.location}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Estimated Cost (in Crores)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-control no-spin"
                            placeholder="0.00"
                            value={formData.estimatedCost}
                            onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                        />
                        {errors.estimatedCost && <div className="form-error">{errors.estimatedCost}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Upload DPR Document (PDF)</label>
                        <input
                            type="file"
                            accept=".pdf"
                            className="form-control"
                            onChange={handleFileChange}
                            style={{ padding: '8px' }}
                        />
                        <div className="form-helper">Max file size: 10MB. PDF only.</div>
                        {errors.file && <div className="form-error">{errors.file}</div>}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DPRUpload;
