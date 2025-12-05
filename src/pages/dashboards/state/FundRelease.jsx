import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { useAuth } from '../../../contexts/AuthContext';
import InteractiveButton from '../../../components/InteractiveButton';

const FundRelease = ({ formatCurrency, stateId, stateCode }) => {
    const { user } = useAuth();
    const [releasedFunds, setReleasedFunds] = useState([]);
    const [receivedFunds, setReceivedFunds] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [totalReceived, setTotalReceived] = useState(0);
    const [totalReleased, setTotalReleased] = useState(0);
    const [componentStats, setComponentStats] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [districtStats, setDistrictStats] = useState(null);

    const [formData, setFormData] = useState({
        districtId: '',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        bankAccount: ''
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
                // Use real district IDs from backend
                setDistricts(result.data);
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
                        // Filter for current state
                        const stateFunds = result.data.filter(item => item.states?.id === stateId);
                        setReceivedFunds(stateFunds);

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

    // Calculate Component-wise Stats
    useEffect(() => {
        const stats = {
            'Adarsh Gram': { received: 0, released: 0 },
            'GIA': { received: 0, released: 0 },
            'Hostel': { received: 0, released: 0 }
        };

        // Process Received Funds
        receivedFunds.forEach(item => {
            const amount = item.amount_cr || 0;
            const comps = Array.isArray(item.component) ? item.component : [item.component];
            comps.forEach(c => {
                if (stats[c]) stats[c].received += amount;
            });
        });

        // Process Released Funds
        releasedFunds.forEach(item => {
            const amount = item.amountCr || 0;
            const comps = Array.isArray(item.component) ? item.component : [item.component];
            comps.forEach(c => {
                if (stats[c]) stats[c].released += amount;
            });
        });

        setComponentStats(stats);
    }, [receivedFunds, releasedFunds]);

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
        // Identify components with available balance
        const availableComps = Object.keys(componentStats).filter(c =>
            (componentStats[c]?.received - componentStats[c]?.released) > 0
        );

        setFormData({
            districtId: '',
            component: availableComps.length === 1 ? availableComps[0] : '', // Auto-select if only one
            amount: '',
            date: new Date().toISOString().slice(0, 10),
            bankAccount: '',
            availableComponents: availableComps // Store for UI
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setErrors({});
    };



    const validate = () => {
        const errs = {};
        if (!formData.districtId) errs.districtId = 'Select a district.';
        if (!formData.component) errs.component = 'Select a component.';

        const amountCr = parseFloat(formData.amount);
        if (isNaN(amountCr) || amountCr <= 0) errs.amount = 'Enter a valid amount (> 0).';

        if (!formData.date) errs.date = 'Select a release date.';
        if (!formData.bankAccount.trim()) errs.bankAccount = 'Enter Bank Account Number.';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleReleaseSubmit = async () => {
        if (!validate()) return;

        const amountCr = parseFloat(formData.amount);
        const amountInRupees = Math.round(amountCr * 10000000);
        const activeComponent = formData.component;

        const compAvailable = componentStats[activeComponent]?.received - componentStats[activeComponent]?.released || 0;

        if (amountCr > compAvailable) {
            showToast(`Insufficient balance for ${activeComponent}! Available: ₹${compAvailable.toFixed(2)} Cr`, 'error');
            return;
        }

        try {
            const payload = {
                district_id: formData.districtId,
                component: [activeComponent],
                amount_rupees: amountInRupees,
                amount_cr: amountCr,
                release_date: formData.date,
                officer_id: 'STATE-ADMIN',
                remarks: `Fund release to district for ${activeComponent}`,
                created_by: user?.id,
                state_name: stateName,
                bankAccount: formData.bankAccount
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

            {/* Component-wise Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 20 }}>
                {Object.entries(componentStats).map(([component, stats]) => (
                    <div key={component} className="card" style={{ padding: 15, border: '1px solid #e0e0e0', borderRadius: 8, backgroundColor: '#fff' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50', borderBottom: '1px solid #eee', paddingBottom: 8, fontSize: '16px' }}>{component}</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ color: '#7f8c8d', fontSize: 13 }}>Received:</span>
                            <span style={{ fontWeight: 600, color: '#2c3e50' }}>₹{stats.received.toFixed(2)} Cr</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ color: '#7f8c8d', fontSize: 13 }}>Released:</span>
                            <span style={{ fontWeight: 600, color: '#e67e22' }}>₹{stats.released.toFixed(2)} Cr</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px dashed #eee' }}>
                            <span style={{ color: '#7f8c8d', fontSize: 13 }}>Available:</span>
                            <span style={{ fontWeight: 'bold', color: (stats.received - stats.released) < 0 ? '#EF4444' : '#00B894' }}>
                                ₹{(stats.received - stats.released).toFixed(2)} Cr
                            </span>
                        </div>
                    </div>
                ))}
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
                    {/* Active Component Display */}
                    {/* Component Selection Logic */}
                    <div className="form-group">
                        <label className="form-label">Scheme Component</label>
                        {formData.availableComponents && formData.availableComponents.length > 1 ? (
                            <select
                                className="form-control"
                                value={formData.component}
                                onChange={(e) => setFormData({ ...formData, component: e.target.value })}
                            >
                                <option value="">-- Select Component --</option>
                                {formData.availableComponents.map(c => (
                                    <option key={c} value={c}>
                                        {c} (Avail: ₹{(componentStats[c]?.received - componentStats[c]?.released).toFixed(2)} Cr)
                                    </option>
                                ))}
                            </select>
                        ) : formData.availableComponents && formData.availableComponents.length === 1 ? (
                            <div style={{ padding: '10px', backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd', color: '#0369a1' }}>
                                <strong>{formData.availableComponents[0]}</strong>
                                <span style={{ float: 'right', fontWeight: 'bold' }}>
                                    Avail: ₹{(componentStats[formData.availableComponents[0]]?.received - componentStats[formData.availableComponents[0]]?.released).toFixed(2)} Cr
                                </span>
                            </div>
                        ) : (
                            <div style={{ padding: '10px', backgroundColor: '#fee2e2', borderRadius: '6px', border: '1px solid #fca5a5', color: '#b91c1c' }}>
                                No funds available to release.
                            </div>
                        )}
                        {errors.component && <div className="form-error">{errors.component}</div>}
                    </div>

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
                        {errors.districtId && <div className="form-error">{errors.districtId}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Amount to Release (in Cr)</label>
                        <input
                            type="number"
                            inputMode="decimal"
                            pattern="[0-9]*[.,]?[0-9]*"
                            min="0"
                            className="form-control no-spin"
                            placeholder="e.g. 0.5"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            style={{ padding: '10px' }}
                        />
                        {errors.amount && <div className="form-error">{errors.amount}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Bank Account Number</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Bank Account Number"
                            value={formData.bankAccount}
                            onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                        />
                        {errors.bankAccount && <div className="form-error">{errors.bankAccount}</div>}
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

            </Modal >
        </div >
    );
};

export default FundRelease;
