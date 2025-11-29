import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { useAuth } from '../../../contexts/AuthContext';

const FundRelease = ({ formatCurrency, stateId, stateCode }) => {
    const { user } = useAuth();
    const [releasedFunds, setReleasedFunds] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [totalReceived, setTotalReceived] = useState(0);
    const [totalReleased, setTotalReleased] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        districtId: '',
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
        fetchDistricts();
        fetchReleasedFunds();
    }, [stateCode]);

    const fetchDistricts = async () => {
        if (!stateCode) return;
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/districts?state_code=eq.${stateCode}&select=id,name&order=name.asc`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') ? JSON.parse(localStorage.getItem('supabase.auth.token')).access_token : ''}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setDistricts(data);
            }
        } catch (error) {
            console.error('Error fetching districts:', error);
        }
    };

    const fetchReleasedFunds = async () => {
        setLoading(true);
        try {
            // Fetch releases and join with districts to get the name
            const response = await fetch(`${SUPABASE_URL}/rest/v1/fund_releases?select=*,districts(name)&order=created_at.desc`, {
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
            if (!stateId) return;
            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/state_fund_releases?state_id=eq.${stateId}&select=amount_cr`, {
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') ? JSON.parse(localStorage.getItem('supabase.auth.token')).access_token : ''}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    const total = data.reduce((sum, item) => sum + (item.amount_cr || 0), 0);
                    setTotalReceived(total);
                }
            } catch (error) {
                console.error('Error fetching received funds:', error);
            }
        };
        fetchReceivedFunds();
    }, [stateId]);

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

        try {
            const payload = {
                district_id: formData.districtId,
                component: formData.component,
                amount_rupees: amountInRupees,
                amount_cr: amountCr,
                release_date: formData.date,
                officer_id: formData.officerId,
                remarks: formData.remarks,
                created_by: user?.id
            };

            const response = await fetch(`${SUPABASE_URL}/rest/v1/fund_releases`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') ? JSON.parse(localStorage.getItem('supabase.auth.token')).access_token : ''}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showToast(`Successfully released ${amountCr} Cr`);
                fetchReleasedFunds(); // Refresh the list
                closeModal();
            } else {
                const errorData = await response.json();
                showToast(`Error: ${errorData.message || 'Failed to release funds'}`, 'error');
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
                <button className="btn btn-primary" onClick={openModal}>
                    + Release New Funds
                </button>
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
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default FundRelease;
