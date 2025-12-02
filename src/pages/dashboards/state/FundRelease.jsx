import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { useAuth } from '../../../contexts/AuthContext';
import InteractiveButton from '../../../components/InteractiveButton';

const FundRelease = ({ formatCurrency, stateId, stateCode }) => {
    const { user } = useAuth();
    const [releasedFunds, setReleasedFunds] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [totalReceived, setTotalReceived] = useState(0);
    const [totalReleased, setTotalReleased] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [districtStats, setDistrictStats] = useState(null);

    const [formData, setFormData] = useState({
        districtId: '',
        component: [],
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        remarks: '',
        officerId: '',
    });

    const [errors, setErrors] = useState({});

    // API Base URL
    const API_BASE_URL = 'http://localhost:5001/api';

    // Fetch state name from user profile
    const [stateName, setStateName] = useState('');

    useEffect(() => {
        const fetchStateName = async () => {
            if (!user?.id) return;
            try {
                const response = await fetch(`${API_BASE_URL}/profile?userId=${user.id}`);
                const result = await response.json();
                if (result.success && result.data?.full_name) {
                    let name = result.data.full_name;
                    name = name.replace(' State Admin', '').replace(' Admin', '').replace(' State', '').trim();
                    setStateName(name);
                }
            } catch (error) {
                console.error('Error fetching state name:', error);
            }
        };
        fetchStateName();
    }, [user]);

    // Fetch Data when stateName is available
    useEffect(() => {
        if (stateName && stateCode) {
            fetchDistricts();
            fetchReleasedFunds();
        }
    }, [stateName, stateCode]);

    const fetchDistricts = async () => {
        if (!stateCode) return;
        try {
            const response = await fetch(`${API_BASE_URL}/state-admins/districts?stateName=${encodeURIComponent(stateName)}`);
            const result = await response.json();
            if (result.success) {
                // Transform to match expected format
                const formattedDistricts = result.data.map((name, index) => ({
                    id: index + 1, // Temporary ID, should use real district IDs
                    name: name
                }));
                setDistricts(formattedDistricts);
            }
        } catch (error) {
            console.error('Error fetching districts:', error);
        }
    };

    const fetchReleasedFunds = async () => {
        setLoading(true);
        try {
            console.log('📊 Fetching fund releases for state:', stateName);

            // Use new backend API that filters by state
            const response = await fetch(`${API_BASE_URL}/funds/district-releases?stateName=${encodeURIComponent(stateName)}`);

            if (response.ok) {
                const result = await response.json();
                console.log('📊 Fund releases received:', result);

                if (result.success) {
                    // Transform data to match UI structure
                    const formattedData = result.data.map(item => ({
                        id: item.id,
                        districtName: item.districts?.name || 'Unknown District',
                        component: item.component,
                        amountInRupees: item.amount_rupees,
                        amountCr: item.amount_cr,
                        date: item.release_date,
                        officerId: item.officer_id,
                        remarks: item.remarks
                    }));
                    setReleasedFunds(formattedData);

                    // Calculate total released
                    const total = formattedData.reduce((sum, item) => sum + (item.amountCr || 0), 0);
                    setTotalReleased(total);
                } else {
                    console.error('Failed to fetch fund releases:', result.error);
                }
            } else {
                console.error('API request failed with status:', response.status);
            }
        } catch (error) {
            console.error('Error fetching funds:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Total Funds Received from Ministry
    useEffect(() => {
        const fetchReceivedFunds = async () => {
            if (!stateId || !stateName) return;
            try {
                const response = await fetch(`${API_BASE_URL}/funds/releases`);

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        // Filter for current state and sum up
                        const stateFunds = result.data.filter(item => item.states?.id === stateId);
                        const total = stateFunds.reduce((sum, item) => sum + (item.amount_cr || 0), 0);
                        setTotalReceived(total);
                    }
                }
            } catch (error) {
                console.error('Error fetching received funds:', error);
            }
        };
        fetchReceivedFunds();
    }, [stateId, stateName]);

    // Fetch District Stats when district is selected
    useEffect(() => {
        const fetchDistrictStats = async () => {
            if (!formData.districtId) {
                setDistrictStats(null);
                return;
            }
            try {
                const response = await fetch(`${API_BASE_URL}/funds/district-stats?districtId=${formData.districtId}`);
                const result = await response.json();
                if (result.success) {
                    setDistrictStats(result.data);
                }
            } catch (error) {
                console.error('Error fetching district stats:', error);
            }
        };
        fetchDistrictStats();
    }, [formData.districtId]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const openModal = () => {
        setFormData({
            districtId: '',
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
        if (!formData.districtId) errs.districtId = 'Select a district.';
        if (formData.component.length === 0) errs.component = 'Select at least one component.';

        const amountCr = parseFloat(formData.amount);
        if (isNaN(amountCr) || amountCr <= 0) errs.amount = 'Enter a valid amount (> 0).';

        if (!formData.date) errs.date = 'Select a release date.';
        if (!formData.officerId.trim()) errs.officerId = 'Enter Officer ID.';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleReleaseSubmit = async () => {
        if (!validate()) return;

        const amountCr = parseFloat(formData.amount);
        const amountInRupees = Math.round(amountCr * 10000000);

        // CRITICAL VALIDATION: Check if sufficient balance is available
        const availableBalance = totalReceived - totalReleased;
        if (amountCr > availableBalance) {
            showToast(`Insufficient balance! Available: ₹${availableBalance.toFixed(2)} Cr, Requested: ₹${amountCr.toFixed(2)} Cr`, 'error');
            return;
        }

        try {
            const payload = {
                district_id: formData.districtId,
                component: formData.component,
                amount_rupees: amountInRupees,
                amount_cr: amountCr,
                release_date: formData.date,
                officer_id: formData.officerId,
                remarks: formData.remarks,
                created_by: user?.id,
                state_name: stateName
            };

            console.log('📤 Submitting fund release:', payload);

            const response = await fetch(`${API_BASE_URL}/funds/release`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showToast(`Successfully released ₹${amountCr} Cr`);
                fetchReleasedFunds(); // Refresh the list
                closeModal();
            } else {
                showToast(`Error: ${result.error || 'Failed to release funds'}`, 'error');
            }
        } catch (error) {
            console.error('Error saving fund release:', error);
            showToast('Network error occurred', 'error');
        }
    };

    return (
        <div className="fund-released-page" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Fund Release to Districts</h2>
                <InteractiveButton variant="primary" onClick={openModal}>
                    + Release New Funds
                </InteractiveButton>
            </div>

            {/* Fund Summary Card */}
            <div className="card" style={{ padding: 20, marginBottom: 20, backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#666' }}>Total Funds Received (Ministry)</h3>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>₹{totalReceived.toFixed(2)} Cr</div>
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#666' }}>Total Released (Districts)</h3>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e67e22' }}>₹{totalReleased.toFixed(2)} Cr</div>
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#666' }}>Available Balance</h3>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
                            ₹{(totalReceived - totalReleased).toFixed(2)} Cr
                        </div>
                    </div>
                </div>
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
                        {loading ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: 30 }}>Loading data...</td>
                            </tr>
                        ) : releasedFunds.length > 0 ? (
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
                        <InteractiveButton variant="outline" onClick={closeModal}>
                            Cancel
                        </InteractiveButton>
                        <InteractiveButton variant="primary" onClick={handleReleaseSubmit}>
                            Confirm Release
                        </InteractiveButton>
                    </div>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    <div className="form-group">
                        <label className="form-label">District Name</label>
                        <select
                            className="form-control"
                            value={formData.districtId}
                            onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                        >
                            <option value="">-- select district --</option>
                            {districts.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                        {districtStats && (
                            <div style={{ marginTop: 10, padding: '10px 12px', background: '#f8f9fa', borderRadius: 6, border: '1px solid #e9ecef', fontSize: '13px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ color: '#666' }}>Total Released to District:</span>
                                    <span style={{ fontWeight: 600, color: '#2980b9' }}>₹{districtStats.totalReleased.toFixed(2)} Cr</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#666' }}>State Available Balance:</span>
                                    <span style={{ fontWeight: 600, color: '#27ae60' }}>₹{(totalReceived - totalReleased).toFixed(2)} Cr</span>
                                </div>
                            </div>
                        )}
                        {errors.districtId && <div className="form-error">{errors.districtId}</div>}
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
                        <strong>Note:</strong> Available balance is ₹{(totalReceived - totalReleased).toFixed(2)} Cr.
                        {formData.amount && parseFloat(formData.amount) > (totalReceived - totalReleased) && (
                            <div style={{ color: '#e74c3c', marginTop: 8, fontWeight: 600 }}>
                                ⚠️ Warning: Requested amount (₹{parseFloat(formData.amount).toFixed(2)} Cr) exceeds available balance!
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default FundRelease;
