import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { useAuth } from '../../../contexts/AuthContext';

const FundReleased = ({ formatCurrency }) => {
    const { user } = useAuth();
    const [releasedFunds, setReleasedFunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [bankAccount, setBankAccount] = useState('');
    const [toast, setToast] = useState(null);

    // Fetch Data on Mount
    useEffect(() => {
        fetchApprovedProjects();
    }, []);

    const fetchApprovedProjects = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5001/api/proposals/approved');
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setReleasedFunds(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleReleaseClick = (project) => {
        setSelectedProject(project);
        setBankAccount('');
        setIsReleaseModalOpen(true);
    };

    const handleConfirmRelease = async () => {
        if (!bankAccount.trim()) {
            showToast('Please enter a bank account number', 'error');
            return;
        }

        // Use the minimum allocation amount automatically
        const releaseAmount = selectedProject.minimumAllocation || selectedProject.allocatedAmount;

        if (!releaseAmount || parseFloat(releaseAmount) <= 0) {
            showToast('Invalid minimum allocation amount', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/funds/release', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stateName: selectedProject.stateName,
                    amount: (parseFloat(releaseAmount) / 100).toFixed(4), // Convert Lakhs to Cr if needed
                    amount_rupees: parseFloat(releaseAmount) * 100000,
                    component: [selectedProject.component],
                    date: new Date().toISOString().slice(0, 10),
                    officerId: `PROJ-${selectedProject.id}`,
                    remarks: `Fund release for project: ${selectedProject.projectName}`,
                    bankAccount: bankAccount
                })
            });

            const result = await response.json();

            if (result.success) {
                showToast('Funds released successfully!');
                setIsReleaseModalOpen(false);
                fetchApprovedProjects(); // Refresh list
            } else {
                showToast('Failed to release funds', 'error');
            }
        } catch (error) {
            console.error('Error releasing funds:', error);
            showToast('Error releasing funds', 'error');
        }
    };

    return (
        <div className="fund-released-page" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Fund Released Log</h2>
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
                            <th>STATE/UT</th>
                            <th>SCHEME COMPONENT</th>
                            <th style={{ textAlign: 'right' }}>PROJECT COST</th>
                            <th style={{ textAlign: 'right' }}>MINIMUM ALLOCATION</th>
                            <th style={{ textAlign: 'right' }}>AMOUNT RELEASED</th>
                            <th style={{ textAlign: 'right' }}>REMAINING FUND</th>
                            <th>PROJECT NAME</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: 30 }}>Loading data...</td>
                            </tr>
                        ) : releasedFunds.length > 0 ? (
                            releasedFunds.map((item) => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: 600 }}>{item.stateName}</td>
                                    <td>
                                        <span style={{
                                            background: '#e3f2fd',
                                            color: '#1976d2',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            display: 'inline-block'
                                        }}>
                                            {item.component}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right', color: '#555' }}>
                                        ₹{item.estimatedCost} Lakhs
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#2c3e50' }}>
                                        ₹{item.allocatedAmount} Lakhs
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#2ecc71' }}>
                                        ₹{item.releasedAmount} Lakhs
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#0984e3' }}>
                                        ₹{item.remainingAmount} Lakhs
                                    </td>
                                    <td style={{ color: '#555' }}>
                                        {item.projectName}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm"
                                            onClick={() => handleReleaseClick(item)}
                                            disabled={item.remainingAmount <= 0}
                                            style={{
                                                background: item.remainingAmount <= 0 ? '#ccc' : '#ff9800',
                                                color: 'white',
                                                border: 'none',
                                                padding: '6px 16px',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                cursor: item.remainingAmount <= 0 ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {item.remainingAmount <= 0 ? 'Fully Released' : 'Release Funds'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                    No approved projects found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Release Modal */}
            <Modal
                isOpen={isReleaseModalOpen}
                onClose={() => setIsReleaseModalOpen(false)}
                title="Release Funds to Project"
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => setIsReleaseModalOpen(false)} style={{ background: 'transparent', border: '2px solid #ddd', color: '#333', padding: '8px 14px', borderRadius: 8 }}>
                            Cancel
                        </button>
                        <button onClick={handleConfirmRelease} className="btn btn-primary" style={{ background: '#ff9800', border: 'none', padding: '8px 14px' }}>
                            Confirm Release
                        </button>
                    </div>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                    <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#495057' }}>Project Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', fontSize: '13px' }}>
                            <div style={{ color: '#6c757d' }}>State:</div>
                            <div style={{ fontWeight: 600, textAlign: 'right' }}>{selectedProject?.stateName}</div>

                            <div style={{ color: '#6c757d' }}>Component:</div>
                            <div style={{ fontWeight: 600, textAlign: 'right' }}>{selectedProject?.component}</div>

                            <div style={{ color: '#6c757d' }}>Project:</div>
                            <div style={{ fontWeight: 600, textAlign: 'right' }}>{selectedProject?.projectName}</div>

                            <div style={{ color: '#6c757d', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #dee2e6' }}>Amount to be Released:</div>
                            <div style={{ fontWeight: 700, color: '#2ecc71', fontSize: '15px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #dee2e6', textAlign: 'right' }}>
                                ₹{selectedProject?.minimumAllocation || selectedProject?.allocatedAmount} Lakhs
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>Bank Account Number <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter bank account number"
                            value={bankAccount}
                            onChange={(e) => setBankAccount(e.target.value)}
                            style={{ padding: '10px' }}
                        />
                        <div className="form-helper">Enter the bank account number for fund transfer</div>
                    </div>

                    <div style={{
                        background: '#fff3cd',
                        color: '#856404',
                        padding: '12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        border: '1px solid #ffeeba',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span>⚠️</span>
                        <span>Note: Please verify the bank account number before confirming the fund release.</span>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default FundReleased;
