import React, { useState } from 'react';
import Modal from '../../../components/Modal';

const WorkProgress = ({ works, onUpdateProgress }) => {
    const [selectedWorkId, setSelectedWorkId] = useState('');
    const [progressData, setProgressData] = useState({ physical: '', financial: '', remarks: '', photos: [] });
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const validate = () => {
        const errs = {};
        if (!selectedWorkId) errs.workId = 'Please select a work order.';
        if (!progressData.physical) errs.physical = 'Physical progress is required.';
        else if (progressData.physical < 0 || progressData.physical > 100) errs.physical = 'Progress must be between 0 and 100.';
        if (!progressData.financial) errs.financial = 'Financial progress is required.';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const updatedWork = works.find(w => w.id === parseInt(selectedWorkId));
        if (updatedWork) {
            onUpdateProgress({
                ...updatedWork,
                progress: progressData.physical,
                financialProgress: progressData.financial,
                lastUpdated: new Date().toISOString().split('T')[0]
            });
            showToast('Progress updated successfully!');
            setProgressData({ physical: '', financial: '', remarks: '', photos: [] });
            setSelectedWorkId('');
            setErrors({});
        }
    };

    const handlePhotoUpload = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setProgressData({ ...progressData, photos: [...progressData.photos, ...files] });
        }
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Update Work Progress</h2>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>Submit physical and financial progress reports</p>
            </div>

            {toast && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>{toast}</div>
                </div>
            )}

            <div className="card" style={{ padding: 20, maxWidth: '800px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Select Work Order</label>
                        <select
                            className="form-control"
                            value={selectedWorkId}
                            onChange={(e) => setSelectedWorkId(e.target.value)}
                        >
                            <option value="">-- Select Work --</option>
                            {works.map(work => (
                                <option key={work.id} value={work.id}>
                                    WO-{work.id}: {work.title} ({work.location})
                                </option>
                            ))}
                        </select>
                        {errors.workId && <div className="form-error">{errors.workId}</div>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div className="form-group">
                            <label className="form-label">Physical Progress (%)</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="e.g. 45"
                                value={progressData.physical}
                                onChange={(e) => setProgressData({ ...progressData, physical: e.target.value })}
                            />
                            {errors.physical && <div className="form-error">{errors.physical}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Financial Progress (₹ utilized)</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="e.g. 500000"
                                value={progressData.financial}
                                onChange={(e) => setProgressData({ ...progressData, financial: e.target.value })}
                            />
                            {errors.financial && <div className="form-error">{errors.financial}</div>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Upload Site Photos</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="form-control"
                            onChange={handlePhotoUpload}
                            style={{ padding: '8px' }}
                        />
                        <div className="form-helper">Upload current photos of the construction site.</div>
                        {progressData.photos.length > 0 && (
                            <div style={{ marginTop: 10, fontSize: '14px', color: '#2c3e50' }}>
                                {progressData.photos.length} photo(s) selected
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Remarks / Issues</label>
                        <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Any issues faced or additional comments..."
                            value={progressData.remarks}
                            onChange={(e) => setProgressData({ ...progressData, remarks: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: 10 }}>
                        Submit Progress Report
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WorkProgress;
