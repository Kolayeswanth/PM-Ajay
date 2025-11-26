import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { states as initialStates } from '../../../data/mockData';

/**
 * FundAllocation (state dropdown)
 * - Removes previous "Target / state id" UI
 * - Adds a single "State Name" dropdown with all India states & union territories
 * - Selecting a state will top-up allocation if that state exists in fundStates, otherwise a new record is created
 * - Persists fundStates to localStorage and updates table in real-time
 */

const STORAGE_KEY = 'pmajay_fund_states_v1';

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

const FundAllocation = ({ formatCurrency }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allocationData, setAllocationData] = useState({
        stateName: '',
        component: [],
        amount: '',
        date: '',
        officerId: '',
    });
    const [fundStates, setFundStates] = useState([]);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(null);

    // Load from localStorage (or fallback to initialStates) on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                setFundStates(JSON.parse(raw));
            } else {
                setFundStates(initialStates || []);
            }
        } catch (e) {
            setFundStates(initialStates || []);
        }
    }, []);

    // Persist fundStates to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fundStates));
        } catch (e) {
            // ignore
        }
    }, [fundStates]);

    // small helper to show transient messages
    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    // Open Add Allocation modal
    const openAddAllocation = () => {
        setAllocationData({
            stateName: '',
            component: [],
            amount: '',
            date: new Date().toISOString().slice(0, 10),
            officerId: '',
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
        setAllocationData((prev) => {
            const next = checked ? [...prev.component, value] : prev.component.filter((c) => c !== value);
            return { ...prev, component: next };
        });
    };

    // Basic validation
    const validate = () => {
        const errs = {};
        if (!allocationData.stateName) errs.stateName = 'Please select a state/UT.';
        const amountCr = parseFloat(allocationData.amount);
        if (isNaN(amountCr) || amountCr <= 0) errs.amount = 'Enter a valid amount (> 0).';
        if (!allocationData.officerId.trim()) errs.officerId = 'Enter Allocation Officer ID.';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Perform allocation (persisted + immediate update)
    const handleAllocateSubmit = () => {
        if (!validate()) return;

        const amountCr = parseFloat(allocationData.amount);
        const amountInRupees = Math.round(amountCr * 10000000); // 1 Cr = 10,000,000

        // Try to find existing state record (by exact name)
        const idx = fundStates.findIndex((s) => s.name === allocationData.stateName);

        let updatedStates = [...fundStates];

        const allocationRecord = {
            amountInRupees,
            amountCr,
            date: allocationData.date,
            officerId: allocationData.officerId,
            component: allocationData.component,
        };

        if (idx >= 0) {
            // Top-up existing state's allocation
            const s = updatedStates[idx];
            const prev = s.fundAllocated || 0;
            updatedStates[idx] = {
                ...s,
                component: allocationData.component.length ? allocationData.component : s.component,
                fundAllocated: prev + amountInRupees,
                lastAllocation: allocationRecord,
            };
        } else {
            // Create a new state record (no code available here)
            const newState = {
                name: allocationData.stateName,
                code: '', // code not provided in dropdown; you can fill if you want
                component: allocationData.component,
                fundAllocated: amountInRupees,
                amountReleased: 0,
                lastAllocation: allocationRecord,
            };
            updatedStates = [newState, ...updatedStates];
        }

        // Update state immediately so UI reflects change in real-time
        setFundStates(updatedStates);
        showToast(`Allocation of ${amountCr} Cr recorded for ${allocationData.stateName}`);
        closeModal();
    };

    // Helper: find selected state's current allocation (if any)
    const selectedState = allocationData.stateName
        ? fundStates.find((s) => s.name === allocationData.stateName)
        : null;

    return (
        <div className="fund-allocation-page" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>State-wise Fund Allocation</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-outline" onClick={openAddAllocation} style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                        + Add Allocation
                    </button>
                </div>
            </div>

            {toast && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>{toast}</div>
                </div>
            )}

            <div className="table-wrapper" style={{ marginBottom: 16 }}>
                <table className="table" style={{ minWidth: 800 }}>
                    <thead>
                        <tr>
                            <th>State/UT</th>
                            <th>Scheme Component</th>
                            <th style={{ textAlign: 'right' }}>Total Allocated</th>
                            <th style={{ textAlign: 'right' }}>Amount Released</th>
                            <th style={{ textAlign: 'right' }}>Pending Release</th>
                            <th style={{ textAlign: 'center' }}>Last Allocation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fundStates.map((s) => (
                            <tr key={s.name}>
                                <td style={{ padding: '12px 16px' }}>
                                    <div style={{ fontWeight: 700 }}>{s.name}</div>
                                    <div style={{ fontSize: 12, color: '#666' }}>{s.code}</div>
                                </td>
                                <td style={{ padding: '12px 16px' }}>{Array.isArray(s.component) ? s.component.join(', ') : s.component || '-'}</td>
                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>{formatCurrency ? formatCurrency(s.fundAllocated || 0) : s.fundAllocated || 0}</td>
                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>{formatCurrency ? formatCurrency(s.amountReleased || 0) : s.amountReleased || 0}</td>
                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>{formatCurrency ? formatCurrency((s.fundAllocated || 0) - (s.amountReleased || 0)) : ((s.fundAllocated || 0) - (s.amountReleased || 0))}</td>
                                <td style={{ padding: '8px 16px', textAlign: 'center', fontSize: 12 }}>
                                    {s.lastAllocation ? (
                                        <div>
                                            <div>₹{(s.lastAllocation.amountInRupees || 0).toLocaleString()} ({s.lastAllocation.amountCr} Cr)</div>
                                            <div style={{ color: '#666' }}>{s.lastAllocation.date || '-'}</div>
                                            <div style={{ color: '#666' }}>Officer: {s.lastAllocation.officerId || '-'}</div>
                                        </div>
                                    ) : (
                                        <div style={{ color: '#999' }}>No allocation yet</div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {fundStates.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ padding: 20, textAlign: 'center' }}>No states available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Allocation Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Add Allocation"
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={closeModal} style={{ background: 'transparent', border: '2px solid #ddd', color: '#333', padding: '8px 14px', borderRadius: 8 }}>
                            Cancel
                        </button>
                        <button onClick={handleAllocateSubmit} className="btn btn-primary" style={{ padding: '8px 14px' }}>
                            Allocate
                        </button>
                    </div>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    <div className="form-group">
                        <label className="form-label">State Name</label>
                        <select
                            className="form-control"
                            value={allocationData.stateName}
                            onChange={(e) => setAllocationData({ ...allocationData, stateName: e.target.value })}
                        >
                            <option value="">-- select state / UT --</option>
                            {INDIA_STATES_AND_UT.map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                        {errors.stateName && <div className="form-error">{errors.stateName}</div>}
                        {selectedState && selectedState.fundAllocated > 0 && (
                            <div className="form-helper" style={{ marginTop: 8 }}>
                                Note: this state already has {formatCurrency ? formatCurrency(selectedState.fundAllocated) : selectedState.fundAllocated}. Submitting will top-up the allocation.
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
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                            <label className="form-label">Amount to Allocate (in Cr)</label>
                            <input
                                type="number"
                                inputMode="decimal"
                                pattern="[0-9]*[.,]?[0-9]*"
                                className="form-control no-spin"
                                placeholder="e.g. 1.5"
                                value={allocationData.amount}
                                onChange={(e) => setAllocationData({ ...allocationData, amount: e.target.value })}
                                style={{ padding: '10px' }}
                            />
                            {errors.amount && <div className="form-error">{errors.amount}</div>}
                            <div className="form-helper">Enter numeric value (decimals allowed)</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Allocation Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={allocationData.date}
                                onChange={(e) => setAllocationData({ ...allocationData, date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Allocation Officer ID</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. OFF1234"
                            value={allocationData.officerId}
                            onChange={(e) => setAllocationData({ ...allocationData, officerId: e.target.value })}
                        />
                        {errors.officerId && <div className="form-error">{errors.officerId}</div>}
                    </div>

                    <div style={{ fontSize: 13, color: '#555' }}>
                        <strong>Note:</strong> Select a state/UT from the list. If the state does not exist in the table it will be added.
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default FundAllocation;
