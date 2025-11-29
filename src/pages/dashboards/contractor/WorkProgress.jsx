import React, { useState } from 'react';
import Modal from '../../../components/Modal';

const WorkProgress = ({ works, onUpdateProgress }) => {
    const [selectedWorkId, setSelectedWorkId] = useState('');
    const [progressData, setProgressData] = useState({
        remarks: '',
        photos: [],
        fundsReleased: '',
        fundsUsed: '',
        fundsRemaining: '',
        progress: ''
    });
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const validate = () => {
        const errs = {};
        if (!selectedWorkId) errs.workId = 'Please select a work order.';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Auto-calculation effect
    React.useEffect(() => {
        if (!selectedWorkId) return;

        const work = works.find(w => w.id === parseInt(selectedWorkId));
        if (!work) return;

        const released = parseFloat(progressData.fundsReleased) || 0;
        const used = parseFloat(progressData.fundsUsed) || 0;
        const totalAmount = parseFloat(work.amount) || 1; // Avoid division by zero

        // Calculate Remaining
        const remaining = released - used;

        // Calculate Physical Progress % (Based on Funds Used / Total Amount)
        // Cap at 100%
        let calculatedProgress = (used / totalAmount) * 100;
        if (calculatedProgress > 100) calculatedProgress = 100;
        if (calculatedProgress < 0) calculatedProgress = 0;

        // Only update if values differ to avoid infinite loops
        // But here we are updating state based on state, so we need to be careful.
        // Actually, we can just calculate these for display and submission, 
        // OR update them when fundsReleased/fundsUsed change.

        // Let's update the state only if the calculated values are different from current state
        // AND we are not currently editing them (though they should be read-only ideally?)
        // The user said "automatically calculate", implying they might be read-only or auto-filled.
        // Let's make them auto-filled but editable? Or just display them?
        // "update the progress and physical progress ... automatically calculate"

        // Better approach: Update state when inputs change.
    }, [progressData.fundsReleased, progressData.fundsUsed, selectedWorkId, works]);

    const handleFundsChange = (field, value) => {
        const newData = { ...progressData, [field]: value };

        const work = works.find(w => w.id === parseInt(selectedWorkId));
        if (work) {
            const released = parseFloat(field === 'fundsReleased' ? value : newData.fundsReleased) || 0;
            const used = parseFloat(field === 'fundsUsed' ? value : newData.fundsUsed) || 0;
            const totalAmount = parseFloat(work.amount) || 1;

            // Auto-calculate Remaining
            newData.fundsRemaining = (released - used).toFixed(2);

            // Auto-calculate Progress
            let calcProgress = (used / totalAmount) * 100;
            if (calcProgress > 100) calcProgress = 100;
            newData.progress = calcProgress.toFixed(2);
        }

        setProgressData(newData);
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const updatedWork = works.find(w => w.id === parseInt(selectedWorkId));
        if (updatedWork) {
            setIsSubmitting(true);
            try {
                // Mock officer details for now (In real app, fetch from user profile)
                const officerDetails = {
                    name: 'Rajesh Kumar', // This should come from auth/profile
                    phone: '9876543210'   // This should come from auth/profile
                };

                console.log("Submitting progress update for work:", updatedWork.id);
                console.log("Progress Data:", progressData);

                const payload = {
                    ...updatedWork,
                    fundsReleased: Number(progressData.fundsReleased) || 0,
                    fundsUsed: Number(progressData.fundsUsed) || 0,
                    fundsRemaining: Number(progressData.fundsRemaining) || 0,
                    remarks: progressData.remarks,
                    progress: Number(progressData.progress) || 0,
                    status: (Number(progressData.progress) >= 100)
                        ? 'Completed'
                        : 'In Progress' // Enforce 'In Progress' on any update unless completed
                };

                console.log("Payload to send:", payload);

                await onUpdateProgress(payload, officerDetails);

                showToast('Progress updated successfully!');
                setProgressData({
                    remarks: '',
                    photos: [],
                    fundsReleased: '',
                    fundsUsed: '',
                    fundsRemaining: '',
                    progress: ''
                });
                setSelectedWorkId('');
                setErrors({});
            } catch (error) {
                console.error("Submission error:", error);
                showToast(error.message || 'Failed to submit progress. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
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
                <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>Submit site photos and remarks</p>
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

                    {/* Physical Progress Removed as per request */}

                    <style>
                        {`
                            /* Hide spinners for number inputs */
                            input[type=number]::-webkit-inner-spin-button, 
                            input[type=number]::-webkit-outer-spin-button { 
                                -webkit-appearance: none; 
                                margin: 0; 
                            }
                            input[type=number] {
                                -moz-appearance: textfield;
                            }
                        `}
                    </style>

                    <div className="form-group">
                        <label className="form-label">Funds Released (₹)</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Enter amount released"
                            value={progressData.fundsReleased}
                            onChange={(e) => handleFundsChange('fundsReleased', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Funds Used (₹)</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Enter amount used"
                            value={progressData.fundsUsed}
                            onChange={(e) => handleFundsChange('fundsUsed', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Funds Remaining (₹) <span style={{ fontSize: '12px', color: '#666' }}>(Auto-calculated)</span></label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Auto-calculated"
                            value={progressData.fundsRemaining}
                            readOnly
                            style={{ backgroundColor: '#f9f9f9' }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Physical Progress (%) <span style={{ fontSize: '12px', color: '#666' }}>(Auto-calculated based on Funds Used)</span></label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Auto-calculated"
                            value={progressData.progress}
                            readOnly
                            style={{ backgroundColor: '#f9f9f9' }}
                        />
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

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ marginTop: 10 }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Progress Report'}
                    </button>
                </form>

                {/* Submission History / Status */}
                <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Latest Submission Status</h3>
                    {[...works]
                        .sort((a, b) => {
                            if (!a.lastUpdated) return 1;
                            if (!b.lastUpdated) return -1;
                            return new Date(b.lastUpdated) - new Date(a.lastUpdated);
                        })
                        .map(work => {
                            if (!work.lastUpdated) return null;
                            return (
                                <div key={work.id} style={{
                                    padding: '10px',
                                    background: '#f8f9fa',
                                    borderRadius: '6px',
                                    marginBottom: '10px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{work.title}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>Updated: {work.lastUpdated}</div>
                                        <div style={{ marginTop: '8px', fontSize: '13px', color: '#444', background: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid #eee' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                                                <div><strong>Released:</strong> ₹{work.fundsReleased}</div>
                                                <div><strong>Used:</strong> ₹{work.fundsUsed}</div>
                                                <div style={{ gridColumn: 'span 2' }}><strong>Remaining:</strong> ₹{work.fundsRemaining}</div>
                                            </div>
                                            {work.remarks && (
                                                <div style={{ marginTop: '6px', borderTop: '1px dashed #ddd', paddingTop: '4px', fontStyle: 'italic', color: '#666' }}>
                                                    "{work.remarks}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            color: work.viewedByAgency ? '#27ae60' : '#f39c12'
                                        }}>
                                            {work.viewedByAgency ? (
                                                <>
                                                    <span>👁️ Viewed by Agency</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>📤 Sent (Pending Review)</span>
                                                </>
                                            )}
                                        </div>
                                        {work.viewedByAgency && work.viewedAt && (
                                            <div style={{ fontSize: '11px', color: '#999' }}>
                                                {new Date(work.viewedAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
};

export default WorkProgress;
