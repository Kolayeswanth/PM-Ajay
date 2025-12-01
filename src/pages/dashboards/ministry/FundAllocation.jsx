import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { states as initialStates } from '../../../data/mockData';

/**
 * FundAllocation with Backend Integration
 * - Fetches fund states from backend API
 * - Persists allocation to backend API
 * - Sends WhatsApp notification via backend
 */

const FundAllocation = ({ formatCurrency }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allocationData, setAllocationData] = useState({
        stateName: '',
        component: [],
        amount: '',
        date: '',
        officerId: '',
        allocatorName: '',
        allocatorRole: ''
    });
    const [fundStates, setFundStates] = useState([]);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(null);
    const [isNotifying, setIsNotifying] = useState(false);

    // Backend API Base URL
    const API_BASE_URL = 'http://localhost:5001/api';

    // Fetch Fund Allocations from Supabase via Backend
    useEffect(() => {
        const fetchAllocations = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/funds`);
                const data = await response.json();
                setFundStates(data || []);
            } catch (error) {
                console.error('Error fetching allocations:', error);
                setFundStates(initialStates || []); // Fallback to mock data
            }
        };
        fetchAllocations();
    }, []);

    // small helper to show transient messages
    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 4000);
    };

    // Open Add Allocation modal
    const openAddAllocation = () => {
        setAllocationData({
            stateName: '',
            component: [],
            amount: '',
            date: new Date().toISOString().slice(0, 10),
            officerId: '',
            allocatorName: '',
            allocatorRole: ''
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

    // Enhanced validation including allocator fields
    const validate = () => {
        const errs = {};
        if (!allocationData.stateName) errs.stateName = 'Please select a state/UT.';
        const amountCr = parseFloat(allocationData.amount);
        if (isNaN(amountCr) || amountCr <= 0) errs.amount = 'Enter a valid amount (> 0).';
        if (!allocationData.officerId.trim()) errs.officerId = 'Enter Allocation Officer ID.';

        // Validate allocator information
        if (!allocationData.allocatorName.trim()) errs.allocatorName = 'Enter allocator name.';
        if (!allocationData.allocatorRole.trim()) errs.allocatorRole = 'Enter allocator role.';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Perform allocation (No WhatsApp Notification)
    const handleAllocate = async () => {
        if (!validate()) return;

        setIsNotifying(true);

        const amountCr = parseFloat(allocationData.amount);
        const amountInRupees = Math.round(amountCr * 10000000); // 1 Cr = 10,000,000

        try {
            // Prepare allocation data
            const allocationPayload = {
                stateName: allocationData.stateName,
                component: allocationData.component,
                amount: amountCr,
                date: allocationData.date,
                officerId: allocationData.officerId,
                allocatorName: allocationData.allocatorName,
                allocatorRole: allocationData.allocatorRole
            };

            // Step 1: Save to Supabase via Backend
            const saveResponse = await fetch(`${API_BASE_URL}/funds/allocate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(allocationPayload),
            });

            const saveResult = await saveResponse.json();

            if (!saveResult.success) {
                throw new Error(saveResult.error || 'Failed to save allocation');
            }

            setIsNotifying(false);

            // Step 2: Refresh table data from Supabase
            const response = await fetch(`${API_BASE_URL}/funds`);
            const data = await response.json();
            setFundStates(data || []);

            // Success popup
            const successMessage =
                `✅ FUND ALLOCATION SAVED!\n\n` +
                `📊 Allocation Details:\n` +
                `• State: ${allocationData.stateName}\n` +
                `• Amount: ₹${amountInRupees.toLocaleString()} (${amountCr} Cr)\n` +
                `• Component: ${allocationData.component.join(', ') || 'N/A'}\n\n` +
                `💾 Database: SAVED TO SUPABASE ✅`;

            alert(successMessage);
            showToast(`✅ Allocation saved successfully!`);
            closeModal();

        } catch (error) {
            console.error("Allocation Error:", error);
            setIsNotifying(false);
            alert(`❌ Error: ${error.message}\n\nPlease check the backend server and try again.`);
        }
    };

    // Helper: find selected state's current allocation (if any)
    const selectedState = allocationData.stateName
        ? fundStates.find((s) => s.name === allocationData.stateName)
        : null;

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

    return (
        <div className="fund-allocation-page" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>State-wise Fund Allocation</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        className="btn"
                        onClick={openAddAllocation}
                        style={{
                            backgroundColor: 'var(--color-saffron)',
                            color: 'white',
                            border: '2px solid var(--color-saffron)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#d97706';
                            e.currentTarget.style.borderColor = '#d97706';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-saffron)';
                            e.currentTarget.style.borderColor = 'var(--color-saffron)';
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.boxShadow = '0 0 0 4px rgba(255, 153, 0, 0.3)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                        onMouseDown={(e) => {
                            e.currentTarget.style.boxShadow = '0 0 0 4px rgba(255, 153, 0, 0.3)';
                        }}
                        onMouseUp={(e) => {
                            if (!e.currentTarget.matches(':focus')) {
                                e.currentTarget.style.boxShadow = 'none';
                            }
                        }}
                    >
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
                            <th>Allocator Name</th>
                            <th>Role</th>
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
                                <td style={{ padding: '12px 16px' }}>{s.lastAllocation?.allocatorName || '-'}</td>
                                <td style={{ padding: '12px 16px' }}>{s.lastAllocation?.allocatorRole || '-'}</td>
                            </tr>
                        ))}
                        {fundStates.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: 20, textAlign: 'center' }}>No states available</td>
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
                        <button
                            onClick={handleAllocate}
                            className="btn btn-primary"
                            style={{ padding: '8px 14px' }}
                            disabled={isNotifying}
                        >
                            {isNotifying ? 'Saving...' : 'Allocate Fund'}
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

                    <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #ddd' }} />
                    <h4 style={{ margin: '8px 0', fontSize: 16 }}>State Allocator Information</h4>

                    <div className="form-group">
                        <label className="form-label">Allocator Name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Rajesh Kumar"
                            value={allocationData.allocatorName}
                            onChange={(e) => setAllocationData({ ...allocationData, allocatorName: e.target.value })}
                        />
                        {errors.allocatorName && <div className="form-error">{errors.allocatorName}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Allocator Role in State Government</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. State Finance Secretary"
                            value={allocationData.allocatorRole}
                            onChange={(e) => setAllocationData({ ...allocationData, allocatorRole: e.target.value })}
                        />
                        {errors.allocatorRole && <div className="form-error">{errors.allocatorRole}</div>}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default FundAllocation;
