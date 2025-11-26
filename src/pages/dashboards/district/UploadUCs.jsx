import React, { useState } from 'react';
import Modal from '../../../components/Modal';

const UploadUCs = () => {
    const [ucs, setUcs] = useState([
        { id: 1, gp: 'Shirur', component: 'Adarsh Gram', amount: '0.50 Cr', date: '2025-11-20', status: 'Verified', file: 'uc_shirur_001.pdf' },
        { id: 2, gp: 'Khed', component: 'Infrastructure', amount: '0.75 Cr', date: '2025-11-18', status: 'Pending', file: 'uc_khed_002.pdf' },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ gp: '', component: '', amount: '', file: null });
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});

    // Sample GPs
    const gps = ["Shirur", "Khed", "Baramati", "Haveli", "Mulshi", "Maval", "Junnar"];

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const validate = () => {
        const errs = {};
        if (!formData.gp) errs.gp = 'Please select a Gram Panchayat';
        if (!formData.component) errs.component = 'Please select a component';
        if (!formData.amount) errs.amount = 'Please enter amount';
        if (!formData.file) errs.file = 'Please select a file';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleUpload = () => {
        if (!validate()) return;

        const newUC = {
            id: Date.now(),
            gp: formData.gp,
            component: formData.component,
            amount: `${formData.amount} Cr`,
            date: new Date().toISOString().split('T')[0],
            status: 'Pending',
            file: formData.file.name
        };

        setUcs([newUC, ...ucs]);
        showToast('Utilization Certificate uploaded successfully');
        setIsModalOpen(false);
        setFormData({ gp: '', component: '', amount: '', file: null });
        setErrors({});
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    const handleViewFile = (filename) => {
        showToast(`Opening ${filename}...`);
        // In a real app, this would open the file URL
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Upload Utilisation Certificates</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>+ Upload New UC</button>
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
                            <th>Gram Panchayat</th>
                            <th>Component</th>
                            <th>Amount Utilized</th>
                            <th>Submission Date</th>
                            <th>Status</th>
                            <th>File</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ucs.map(uc => (
                            <tr key={uc.id}>
                                <td><strong>{uc.gp}</strong></td>
                                <td>{uc.component}</td>
                                <td>{uc.amount}</td>
                                <td>{uc.date}</td>
                                <td>
                                    <span className={`badge badge-${uc.status === 'Verified' ? 'success' : 'warning'}`}>
                                        {uc.status}
                                    </span>
                                </td>
                                <td>{uc.file}</td>
                                <td>
                                    <button className="btn btn-secondary btn-sm" onClick={() => handleViewFile(uc.file)}>View File</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setErrors({}); }}
                title="Upload Utilization Certificate"
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => { setIsModalOpen(false); setErrors({}); }} style={{ background: 'transparent', border: '2px solid #ddd', color: '#333', padding: '8px 14px', borderRadius: 8 }}>
                            Cancel
                        </button>
                        <button onClick={handleUpload} className="btn btn-primary" style={{ padding: '8px 14px' }}>
                            Upload UC
                        </button>
                    </div>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    <div className="form-group">
                        <label className="form-label">Select Gram Panchayat</label>
                        <select
                            className="form-control"
                            value={formData.gp}
                            onChange={(e) => setFormData({ ...formData, gp: e.target.value })}
                        >
                            <option value="">-- Select GP --</option>
                            {gps.map(gp => (
                                <option key={gp} value={gp}>{gp}</option>
                            ))}
                        </select>
                        {errors.gp && <div className="form-error">{errors.gp}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Scheme Component</label>
                        <select
                            className="form-control"
                            value={formData.component}
                            onChange={(e) => setFormData({ ...formData, component: e.target.value })}
                        >
                            <option value="">-- Select Component --</option>
                            <option value="Adarsh Gram">Adarsh Gram</option>
                            <option value="Infrastructure">Infrastructure</option>
                            <option value="Skill Development">Skill Development</option>
                        </select>
                        {errors.component && <div className="form-error">{errors.component}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Amount Utilized (in Crores)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-control no-spin"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                        {errors.amount && <div className="form-error">{errors.amount}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Upload UC Document (PDF)</label>
                        <input
                            type="file"
                            accept=".pdf"
                            className="form-control"
                            onChange={handleFileChange}
                            style={{ padding: '8px' }}
                        />
                        <div className="form-helper">Max file size: 5MB. PDF only.</div>
                        {errors.file && <div className="form-error">{errors.file}</div>}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UploadUCs;
