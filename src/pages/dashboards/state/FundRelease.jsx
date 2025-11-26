import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';

const STORAGE_KEY_RELEASED = 'pmajay_state_released_funds_v1';

// List of major districts in Maharashtra
const MAHARASHTRA_DISTRICTS = [
    "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur",
    "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur",
    "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar",
    "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur",
    "Thane", "Wardha", "Washim", "Yavatmal"
];

const FundRelease = ({ formatCurrency }) => {
    const [releasedFunds, setReleasedFunds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState(null);

    const [formData, setFormData] = useState({
        districtName: '',
        component: [],
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        remarks: '',
        officerId: '',
        releasedBy: 'State Admin', // Hardcoded for now
    });

    const [errors, setErrors] = useState({});

    // Load data on mount
    useEffect(() => {
        try {
            const rawReleased = localStorage.getItem(STORAGE_KEY_RELEASED);
            if (rawReleased) {
                setReleasedFunds(JSON.parse(rawReleased));
            } else {
                // Initialize with sample data
                setReleasedFunds([
                    { id: 1, districtName: 'Pune', component: ['Adarsh Gram'], amountInRupees: 680000000, amountCr: 68, date: '2025-01-15', officerId: 'OFF001', remarks: 'Initial release' },
                    { id: 2, districtName: 'Mumbai City', component: ['GIA'], amountInRupees: 920000000, amountCr: 92, date: '2025-02-01', officerId: 'OFF002', remarks: 'Q1 release' },
                ]);
            }
        } catch (e) {
            console.error("Error loading data", e);
            setReleasedFunds([]);
        }
    }, []);

    // Persist releasedFunds whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY_RELEASED, JSON.stringify(releasedFunds));
        } catch (e) {
            console.error("Error saving released funds", e);
        }
    }, [releasedFunds]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const openModal = () => {
        setFormData({
            districtName: '',
            component: [],
            amount: '',
            date: new Date().toISOString().slice(0, 10),
            remarks: '',
            officerId: '',
            releasedBy: 'State Admin',
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setErrors({});
    };

    const handleComponentChange = (e) => {
        const { value, checked } = e.target;
        setFormData((prev) => {
            const next = checked ? [...prev.component, value] : prev.component.filter((c) => c !== value);
            return { ...prev, component: next };
        });
    };

    const validate = () => {
        const errs = {};
        if (!formData.districtName) errs.districtName = 'Select a district.';
        if (formData.component.length === 0) errs.component = 'Select at least one component.';

        const amountCr = parseFloat(formData.amount);
        if (isNaN(amountCr) || amountCr <= 0) errs.amount = 'Enter a valid amount (> 0).';

        if (!formData.date) errs.date = 'Select a release date.';
        if (!formData.officerId.trim()) errs.officerId = 'Enter Officer ID.';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleReleaseSubmit = () => {
        if (!validate()) return;

        const amountCr = parseFloat(formData.amount);
        const amountInRupees = Math.round(amountCr * 10000000);

        // Add to Released Funds Log
        const newRelease = {
            id: Date.now(),
            ...formData,
            amountInRupees,
            amountCr,
            timestamp: new Date().toISOString()
        };
        setReleasedFunds([newRelease, ...releasedFunds]);

        showToast(`Successfully released ${amountCr} Cr to ${formData.districtName}`);
        closeModal();
    };

    return (
        <div className="fund-released-page" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Fund Release to Districts</h2>
                <button className="btn btn-primary" onClick={openModal}>
                    + Release New Funds
                </button>
            </div>

            {toast && (
                <div style={{ marginBottom: 16 }}>
                    <div style={{
                        display: 'inline-block',
                        background: toast.type === 'error' ? '#FF7675' : '#00B894',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: 6,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}>
                        {toast.message}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>District</th>
                            <th>Scheme Component</th>
                            <th style={{ textAlign: 'right' }}>Amount Released</th>
                            <th>Release Date</th>
                            <th>Officer ID</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {releasedFunds.length > 0 ? (
                            releasedFunds.map((item) => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: 600 }}>{item.districtName}</td>
                                    <td>{item.component.join(', ')}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#2ecc71' }}>
                                        {formatCurrency ? formatCurrency(item.amountInRupees) : item.amountInRupees}
                                    </td>
                                    <td>{item.date}</td>
                                    <td>{item.officerId || '-'}</td>
                                    <td style={{ color: '#666', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.remarks}>
                                        {item.remarks || '-'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                    No fund release records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Release Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Release Funds to District"
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={closeModal} style={{ background: 'transparent', border: '2px solid #ddd', color: '#333', padding: '8px 14px', borderRadius: 8 }}>
                            Cancel
                        </button>
                        <button onClick={handleReleaseSubmit} className="btn btn-primary" style={{ padding: '8px 14px' }}>
                            Confirm Release
                        </button>
                    </div>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    <div className="form-group">
                        <label className="form-label">District Name</label>
                        <select
                            className="form-control"
                            value={formData.districtName}
                            onChange={(e) => setFormData({ ...formData, districtName: e.target.value })}
                        >
                            <option value="">-- select district --</option>
                            {MAHARASHTRA_DISTRICTS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                        {errors.districtName && <div className="form-error">{errors.districtName}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Scheme Component</label>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <label><input type="checkbox" value="Adarsh Gram" onChange={handleComponentChange} /> Adarsh Gram</label>
                            <label><input type="checkbox" value="GIA" onChange={handleComponentChange} /> GIA</label>
                            <label><input type="checkbox" value="Hostel" onChange={handleComponentChange} /> Hostel</label>
                        </div>
                        {errors.component && <div className="form-error">{errors.component}</div>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                            <label className="form-label">Amount to Release (in Cr)</label>
                            <input
                                type="number"
                                inputMode="decimal"
                                pattern="[0-9]*[.,]?[0-9]*"
                                className="form-control no-spin"
                                placeholder="e.g. 0.5"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                style={{ padding: '10px' }}
                            />
                            {errors.amount && <div className="form-error">{errors.amount}</div>}
                            <div className="form-helper">Enter numeric value (decimals allowed)</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Release Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                            {errors.date && <div className="form-error">{errors.date}</div>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Release Officer ID</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. OFF1234"
                            value={formData.officerId}
                            onChange={(e) => setFormData({ ...formData, officerId: e.target.value })}
                        />
                        {errors.officerId && <div className="form-error">{errors.officerId}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Remarks (Optional)</label>
                        <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Enter any remarks or reference numbers..."
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        />
                        <div className="form-helper">Add any additional notes or reference information</div>
                    </div>

                    <div style={{ fontSize: 13, color: '#555' }}>
                        <strong>Note:</strong> Funds will be released to the selected district for the specified scheme components.
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default FundRelease;
