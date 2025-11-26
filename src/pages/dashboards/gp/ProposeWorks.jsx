import React from 'react';

const ProposeWorks = () => {
    return (
        <div className="dashboard-panel">
            <div className="form-section">
                <div className="form-section-header">
                    <h3 className="form-section-title">Propose New Work</h3>
                </div>

                <form>
                    <div className="form-group">
                        <label className="form-label required">Project Title</label>
                        <input type="text" className="form-control" placeholder="e.g., Community Hall Construction" />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Component</label>
                        <select className="form-control form-select">
                            <option>Select Component</option>
                            <option>Adarsh Gram</option>
                            <option>GIA (Grant-in-Aid)</option>
                            <option>Hostel</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Description</label>
                        <textarea className="form-control" rows="4" placeholder="Describe the proposed work in detail"></textarea>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Estimated Cost (₹)</label>
                        <input type="number" className="form-control" placeholder="Enter estimated cost" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Upload Documents/Photos</label>
                        <div className="upload-area" onClick={() => document.getElementById('fileInput').click()}>
                            <div className="upload-area-icon">📁</div>
                            <div className="upload-area-text">Click to upload or drag and drop</div>
                            <div className="upload-area-hint">PDF, JPG, PNG (Max 10MB)</div>
                            <input id="fileInput" type="file" multiple accept="image/*,.pdf" style={{ display: 'none' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <button type="submit" className="btn btn-primary">Submit Proposal</button>
                        <button type="button" className="btn btn-outline">Save as Draft</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProposeWorks;
