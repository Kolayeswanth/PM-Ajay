import React, { useState } from 'react';

const UploadUC = () => {
    const [ucs, setUcs] = useState([
        { id: 1, district: 'Pune', year: '2024-25', date: '2025-01-15', status: 'Uploaded' },
        { id: 2, district: 'Mumbai', year: '2024-25', date: '2025-02-01', status: 'Uploaded' },
    ]);

    const [formData, setFormData] = useState({ district: '', year: '2024-25', file: null });

    const handleUpload = () => {
        if (formData.file) {
            setUcs([...ucs, {
                id: Date.now(),
                district: formData.district,
                year: formData.year,
                date: new Date().toISOString().split('T')[0],
                status: 'Uploaded'
            }]);
            setFormData({ district: '', year: '2024-25', file: null });
            alert('Utilization Certificate uploaded successfully!');
        }
    };

    return (
        <div className="dashboard-panel">
            <div className="section-header">
                <h2 className="section-title">Upload Utilization Certificate (UC)</h2>
            </div>

            <div className="form-section" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="form-group">
                    <label className="form-label required">Select District</label>
                    <select
                        className="form-control form-select"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    >
                        <option value="">Select District</option>
                        <option value="Pune">Pune</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Nagpur">Nagpur</option>
                        <option value="Nashik">Nashik</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label required">Financial Year</label>
                    <select
                        className="form-control form-select"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    >
                        <option value="2024-25">2024-25</option>
                        <option value="2023-24">2023-24</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Upload UC Document</label>
                    <div className="upload-area">
                        <input
                            type="file"
                            style={{ display: 'none' }}
                            id="uc-upload"
                            onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                        />
                        <label htmlFor="uc-upload" style={{ cursor: 'pointer', textAlign: 'center', width: '100%' }}>
                            <div className="upload-area-icon">📄</div>
                            <div className="upload-area-text">
                                {formData.file ? formData.file.name : "Upload Utilization Certificate"}
                            </div>
                            <div className="upload-area-hint">PDF format, digitally signed</div>
                        </label>
                    </div>
                </div>

                <button className="btn btn-primary" onClick={handleUpload} disabled={!formData.district || !formData.file}>
                    Submit UC to Ministry
                </button>
            </div>

            <div className="section-header">
                <h3 className="section-title">Uploaded Certificates History</h3>
            </div>
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>District</th>
                            <th>Financial Year</th>
                            <th>Upload Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ucs.map(uc => (
                            <tr key={uc.id}>
                                <td>{uc.district}</td>
                                <td>{uc.year}</td>
                                <td>{uc.date}</td>
                                <td><span className="badge badge-success">{uc.status}</span></td>
                                <td><button className="btn btn-secondary btn-sm">Download</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UploadUC;
