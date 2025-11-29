import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { useAuth } from '../../../contexts/AuthContext';

const FundReleased = ({ formatCurrency }) => {
    const { user } = useAuth();
    const [releasedFunds, setReleasedFunds] = useState([]);
    const [states, setStates] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        stateId: '',
        component: [],
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        remarks: '',
        officerId: '',
    });

    const [errors, setErrors] = useState({});

    // Supabase Configuration
    const SUPABASE_URL = 'https://gwfeaubvzjepmmhxgdvc.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZmVhdWJ2emplcG1taHhnZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjY1MDEsImV4cCI6MjA3OTc0MjUwMX0.uelA90LXrAcLazZi_LkdisGqft-dtvj0wgOQweMEUGE';

    // Fetch Data on Mount
    useEffect(() => {
        fetchStates();
        fetchReleasedFunds();
    }, []);

    const fetchStates = async () => {
        try {
            // Fetch fund allocations which includes state details and amounts
            const response = await fetch('http://localhost:5001/api/funds');
            if (response.ok) {
                const data = await response.json();
                // Map to format needed for dropdown, but keep allocation info
                const formattedStates = data.map(item => ({
                    id: item.name, // Using name as ID since fund_allocations uses state_name
                    name: item.name,
                    allocated: item.fundAllocated || 0,
                    released: item.amountReleased || 0,
                    available: (item.fundAllocated || 0) - (item.amountReleased || 0)
                }));
                setStates(formattedStates);
            }
        } catch (error) {
            console.error('Error fetching states:', error);
        }
    };

    const fetchReleasedFunds = async () => {
        setLoading(true);
        try {
            // Fetch releases and join with states to get the name
            const response = await fetch(`${SUPABASE_URL}/rest/v1/state_fund_releases?select=*,states(name,id)&order=created_at.desc`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') ? JSON.parse(localStorage.getItem('supabase.auth.token')).access_token : ''}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                // Transform data to match UI structure
                const formattedData = data.map(item => ({
                    id: item.id,
                    stateName: item.states?.name || 'Unknown State',
                    stateId: item.states?.id,
                    component: item.component,
                    amountInRupees: item.amount_rupees,
                    amountCr: item.amount_cr,
                    date: item.release_date,
                    officerId: item.officer_id || item.sanction_order_no, // Mapping sanction order or officer id
                    remarks: item.remarks
                }));
                setReleasedFunds(formattedData);
            }
        } catch (error) {
            console.error('Error fetching funds:', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const openModal = () => {
        setFormData({
            stateId: '',
            component: [],
            amount: '',
            date: new Date().toISOString().slice(0, 10),
            remarks: '',
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
        setFormData((prev) => {
            const next = checked ? [...prev.component, value] : prev.component.filter((c) => c !== value);
            return { ...prev, component: next };
        });
    };

    const validate = () => {
        const errs = {};
        if (!formData.stateId) errs.stateId = 'Select a state.';
        if (formData.component.length === 0) errs.component = 'Select at least one component.';

        const amountCr = parseFloat(formData.amount);
        if (isNaN(amountCr) || amountCr <= 0) errs.amount = 'Enter a valid amount (> 0).';

        // Check available balance
        const selectedState = states.find(s => s.name === formData.stateId);
        if (selectedState) {
            const availableCr = selectedState.available / 10000000;
            if (amountCr > availableCr) {
                errs.amount = `Amount exceeds available balance (₹${availableCr.toFixed(2)} Cr).`;
            }
        }

        if (!formData.date) errs.date = 'Select a release date.';
        if (!formData.officerId.trim()) errs.officerId = 'Enter Officer ID / Sanction Order No.';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleReleaseSubmit = async () => {
        if (!validate()) return;

        try {
            const payload = {
                stateName: formData.stateId, // formData.stateId holds the name
                amount: formData.amount,
                component: formData.component,
                date: formData.date,
                officerId: formData.officerId,
                remarks: formData.remarks
            };

            console.log('=== RELEASING FUND VIA BACKEND ===');
            console.log('Payload:', payload);

            const response = await fetch('http://localhost:5001/api/funds/release', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Successfully released!');
                showToast(`Successfully released ${formData.amount} Cr`);
                fetchReleasedFunds(); // Refresh the log
                fetchStates(); // Refresh the allocations/balances
                closeModal();
            } else {
                console.error('❌ Failed to release:', result);
                showToast(`Error: ${result.error || 'Failed to release funds'}`, 'error');
            }
        } catch (error) {
            console.error('❌ Network error:', error);
            showToast('Network error occurred', 'error');
        }
    };

    // Helper to get selected state details
    const selectedStateData = states.find(s => s.name === formData.stateId);

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
                            <th style={{ textAlign: 'right' }}>Remaining Fund</th>
                            <th>Release Date</th>
                            <th>Officer ID / Sanction No</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: 30 }}>Loading data...</td>
                            </tr>
                        ) : releasedFunds.length > 0 ? (
                            releasedFunds.map((item) => {
                                // Find the state data to get remaining balance
                                const stateData = states.find(s => s.name === item.stateName);
                                const remainingCr = stateData ? (stateData.available / 10000000).toFixed(2) : '0.00';

                                return (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: 600 }}>{item.stateName}</td>
                                        <td>{item.component.join(', ')}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#2ecc71' }}>
                                            {formatCurrency ? formatCurrency(item.amountInRupees) : item.amountInRupees}
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#0984e3' }}>
                                            ₹{remainingCr} Cr
                                        </td>
                                        <td>{item.date}</td>
                                        <td>{item.officerId || '-'}</td>
                                        <td style={{ color: '#666', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.remarks}>
                                            {item.remarks || '-'}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
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
                            value={formData.stateId}
                            onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
                        >
                            <option value="">-- select state / UT --</option>
                            {states.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        {errors.stateId && <div className="form-error">{errors.stateId}</div>}

                        {selectedStateData && (
                            <div style={{ marginTop: 8, padding: 10, background: '#f8f9fa', borderRadius: 6, fontSize: 13 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span>Total Allocated:</span>
                                    <strong>₹{(selectedStateData.allocated / 10000000).toFixed(2)} Cr</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: '#2ecc71' }}>
                                    <span>Already Released:</span>
                                    <strong>₹{(selectedStateData.released / 10000000).toFixed(2)} Cr</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingTop: 4 }}>
                                    <span>Available Balance:</span>
                                    <strong style={{ color: selectedStateData.available > 0 ? '#0984e3' : '#d63031' }}>
                                        ₹{(selectedStateData.available / 10000000).toFixed(2)} Cr
                                    </strong>
                                </div>
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
                        <label className="form-label">Release Officer ID / Sanction No</label>
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
