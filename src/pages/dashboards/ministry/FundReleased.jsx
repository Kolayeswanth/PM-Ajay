import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { states as initialStates } from '../../../data/mockData';

const STORAGE_KEY_FUNDS = 'pmajay_fund_states_v1';
const STORAGE_KEY_RELEASED = 'pmajay_released_funds_v1';

// Full list of States + Union Territories of India (current)
const INDIA_STATES_AND_UT = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    // Union Territories
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const FundReleased = ({ formatCurrency }) => {
    const [releasedFunds, setReleasedFunds] = useState([]);
    const [fundStates, setFundStates] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState(null);

    const [formData, setFormData] = useState({
        stateName: '',
        component: [],
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        remarks: '',
        officerId: '',
        releasedBy: 'Ministry Admin', // Hardcoded for now, could come from auth context
    });

    const [errors, setErrors] = useState({});

    // Load data on mount
    useEffect(() => {
        try {
            const rawFunds = localStorage.getItem(STORAGE_KEY_FUNDS);
            if (rawFunds) {
                setFundStates(JSON.parse(rawFunds));
            } else {
                setFundStates(initialStates || []);
            }

            const rawReleased = localStorage.getItem(STORAGE_KEY_RELEASED);
            if (rawReleased) {
                setReleasedFunds(JSON.parse(rawReleased));
            } else {
                setReleasedFunds([]);
            }
        } catch (e) {
            console.error("Error loading data", e);
            setFundStates(initialStates || []);
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

    // Persist fundStates whenever it changes (updated when funds are released)
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY_FUNDS, JSON.stringify(fundStates));
        } catch (e) {
            console.error("Error saving fund states", e);
        }
    }, [fundStates]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const openModal = () => {
        setFormData({
            stateName: '',
            component: [],
            amount: '',
            date: new Date().toISOString().slice(0, 10),
            remarks: '',
            officerId: '',
            releasedBy: 'Ministry Admin',
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
        if (!formData.stateName) errs.stateName = 'Select a state.';
        if (formData.component.length === 0) errs.component = 'Select at least one component.';

        const amountCr = parseFloat(formData.amount);
        if (isNaN(amountCr) || amountCr <= 0) errs.amount = 'Enter a valid amount (> 0).';

        if (!formData.date) errs.date = 'Select a release date.';
        if (!formData.officerId.trim()) errs.officerId = 'Enter Officer ID.';

        // Budget Check
        if (formData.stateName) {
            const state = fundStates.find(s => s.name === formData.stateName);
            if (!state) {
                errs.stateName = 'No funds allocated to this state yet.';
            } else {
                const allocated = state.fundAllocated || 0;
                const released = state.amountReleased || 0;
                const available = allocated - released;
                const requestAmountRupees = Math.round(amountCr * 10000000);

                if (requestAmountRupees > available) {
                    errs.amount = `Insufficient funds. Available: ${formatCurrency(available)}`;
                }
            }
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleReleaseSubmit = () => {
        if (!validate()) return;

        const amountCr = parseFloat(formData.amount);
        const amountInRupees = Math.round(amountCr * 10000000);

        // 1. Update Fund States (increment amountReleased)
        const updatedStates = fundStates.map(s => {
            if (s.name === formData.stateName) {
                return {
                    ...s,
                    amountReleased: (s.amountReleased || 0) + amountInRupees
                };
            }
            return s;
        });
        setFundStates(updatedStates);

        // 2. Add to Released Funds Log
        const newRelease = {
            id: Date.now(),
            ...formData,
            amountInRupees,
            amountCr,
            timestamp: new Date().toISOString()
        };
        setReleasedFunds([newRelease, ...releasedFunds]);

        showToast(`Successfully released ${amountCr} Cr to ${formData.stateName}`);
        closeModal();
    };

    // Helper to get available funds for selected state
    const getAvailableFunds = () => {
        if (!formData.stateName) return null;
        const state = fundStates.find(s => s.name === formData.stateName);
        if (!state) return 0;
        return (state.fundAllocated || 0) - (state.amountReleased || 0);
    };

    const availableFunds = getAvailableFunds();

    return (
        <div className="fund-released-page" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Fund Released Log</h2>
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
                            <th>State/UT</th>
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
                                    <td style={{ fontWeight: 600 }}>{item.stateName}</td>
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
                title="Release Funds"
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
                        <label className="form-label">State Name</label>
                        <select
                            className="form-control"
                            value={formData.stateName}
                            onChange={(e) => setFormData({ ...formData, stateName: e.target.value })}
                        >
                            <option value="">-- select state / UT --</option>
                            {INDIA_STATES_AND_UT.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        {errors.stateName && <div className="form-error">{errors.stateName}</div>}
                        {formData.stateName && availableFunds !== null && (
                            <div className="form-helper" style={{ marginTop: 8 }}>
                                <strong style={{ color: availableFunds > 0 ? '#2ecc71' : '#e74c3c' }}>
                                    Available Balance: {formatCurrency ? formatCurrency(availableFunds) : availableFunds}
                                </strong>
                            </div>
                        )}
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
                        <strong>Note:</strong> Ensure the amount does not exceed the available balance for the selected state.
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default FundReleased;
