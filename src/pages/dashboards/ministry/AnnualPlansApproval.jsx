import React, { useState } from 'react';
import Modal from '../../../components/Modal';
import { states } from '../../../data/mockData';
import InteractiveButton from '../../../components/InteractiveButton';

const AnnualPlansApproval = () => {
    const [plans, setPlans] = useState(states.slice(0, 5).map((state, index) => ({
        id: index,
        state: state.name,
        submissionDate: `2025-11-${20 + index}`,
        title: `Annual Action Plan 2025-26 - ${state.name}`,
        status: index === 0 ? 'Approved' : index === 1 ? 'Rejected' : 'Pending',
        projects: Math.floor(Math.random() * 50) + 30
    })));

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [toast, setToast] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleApproveClick = (plan) => {
        setSelectedPlan(plan);
        setIsApproveModalOpen(true);
    };

    const handleRejectClick = (plan) => {
        setSelectedPlan(plan);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    const confirmApprove = () => {
        setPlans(plans.map(p => p.id === selectedPlan.id ? { ...p, status: 'Approved' } : p));
        showToast(`Plan "${selectedPlan.title}" approved successfully`);
        setIsApproveModalOpen(false);
    };

    const confirmReject = () => {
        setPlans(plans.map(p => p.id === selectedPlan.id ? { ...p, status: 'Rejected' } : p));
        showToast(`Plan "${selectedPlan.title}" rejected`);
        setIsRejectModalOpen(false);
    };

    const handleViewPDF = (plan) => {
        try {
            const printWindow = window.open('', '_blank');
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Annual Action Plan - ${plan.state}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 20px; margin-bottom: 30px; }
                        h1 { color: #2c3e50; margin: 0; }
                        .section { margin-bottom: 25px; }
                        .section-title { font-weight: bold; color: #2c3e50; font-size: 16px; margin-bottom: 8px; border-bottom: 2px solid #ecf0f1; padding-bottom: 5px; }
                        .info-row { display: flex; margin-bottom: 10px; }
                        .info-label { font-weight: bold; width: 200px; color: #555; }
                        .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; }
                        .status-pending { background-color: #fff3cd; color: #856404; }
                        .status-approved { background-color: #d4edda; color: #155724; }
                        .status-rejected { background-color: #f8d7da; color: #721c24; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Annual Action Plan 2025-26</h1>
                        <div style="color: #666; margin-top: 5px;">State: ${plan.state}</div>
                    </div>
                    <div class="section">
                        <div class="section-title">Plan Overview</div>
                        <div class="info-row"><div class="info-label">Plan Title:</div><div>${plan.title}</div></div>
                        <div class="info-row"><div class="info-label">Submission Date:</div><div>${plan.submissionDate}</div></div>
                        <div class="info-row"><div class="info-label">Total Projects:</div><div>${plan.projects}</div></div>
                        <div class="info-row"><div class="info-label">Status:</div><div><span class="status status-${plan.status.toLowerCase()}">${plan.status}</span></div></div>
                    </div>
                    <div class="section">
                        <div class="section-title">Executive Summary</div>
                        <p>This Annual Action Plan outlines the proposed development projects for the fiscal year 2025-26 for the state of ${plan.state}. The plan focuses on infrastructure development, skill training, and social welfare schemes under the PM-AJAY initiative.</p>
                        <p>The total estimated budget requirement is ₹${(plan.projects * 0.5).toFixed(2)} Crores, covering ${plan.projects} distinct projects across various districts.</p>
                    </div>
                    <div style="margin-top: 50px; text-align: center; color: #666; font-size: 12px;">Generated on: ${new Date().toLocaleString()}</div>
                </body>
                </html>
            `;
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            // printWindow.onload = function () { printWindow.print(); }; // Optional: Auto-print
            showToast('PDF preview opened');
        } catch (error) {
            console.error('Error generating PDF:', error);
            showToast('Error generating PDF');
        }
    };

    const filteredPlans = statusFilter
        ? plans.filter(plan => plan.status === statusFilter)
        : plans;

    return (
        <div className="dashboard-panel">
            <div className="section-header">
                <h2 className="section-title">Annual Plans Approval</h2>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <select
                        className="form-select"
                        style={{ width: '150px' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {toast && (
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: '6px' }}>{toast}</div>
                </div>
            )}

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>State</th>
                            <th>Submission Date</th>
                            <th>Plan Title</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPlans.length > 0 ? (
                            filteredPlans.map(plan => (
                                <tr key={plan.id}>
                                    <td>{plan.state}</td>
                                    <td>{plan.submissionDate}</td>
                                    <td>{plan.title}</td>
                                    <td>
                                        <span className={`badge badge-${plan.status === 'Approved' ? 'success' : plan.status === 'Rejected' ? 'error' : 'warning'}`}>
                                            {plan.status}
                                        </span>
                                    </td>
                                    <td>
                                        <InteractiveButton variant="info" size="sm" onClick={() => handleViewPDF(plan)} style={{ marginRight: '5px' }}>View</InteractiveButton>
                                        {plan.status === 'Pending' && (
                                            <>
                                                <InteractiveButton variant="success" size="sm" onClick={() => handleApproveClick(plan)} style={{ marginRight: '5px' }}>Approve</InteractiveButton>
                                                <InteractiveButton variant="danger" size="sm" onClick={() => handleRejectClick(plan)}>Reject</InteractiveButton>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                    No plans found for the selected status.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isApproveModalOpen}
                onClose={() => setIsApproveModalOpen(false)}
                title="Confirm Approval"
                footer={
                    <>
                        <InteractiveButton variant="secondary" onClick={() => setIsApproveModalOpen(false)}>Cancel</InteractiveButton>
                        <InteractiveButton variant="success" onClick={confirmApprove}>Confirm Approve</InteractiveButton>
                    </>
                }
            >
                <p>Are you sure you want to approve the <strong>{selectedPlan?.title}</strong>?</p>
            </Modal>

            <Modal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                title="Reject Plan"
                footer={
                    <>
                        <InteractiveButton variant="secondary" onClick={() => setIsRejectModalOpen(false)}>Cancel</InteractiveButton>
                        <InteractiveButton variant="danger" onClick={confirmReject}>Reject Plan</InteractiveButton>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Reason for Rejection</label>
                    <textarea
                        className="form-input"
                        rows="4"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Please provide a reason for rejection..."
                    ></textarea>
                </div>
            </Modal>
        </div>
    );
};

export default AnnualPlansApproval;
