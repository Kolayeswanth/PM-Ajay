import React, { useState } from 'react';
import Modal from '../../../components/Modal';
import { states } from '../../../data/mockData';

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
        setIsApproveModalOpen(false);
    };

    const confirmReject = () => {
        setPlans(plans.map(p => p.id === selectedPlan.id ? { ...p, status: 'Rejected' } : p));
        setIsRejectModalOpen(false);
    };

    return (
        <div className="dashboard-panel">
            <div className="section-header">
                <h2 className="section-title">Annual Plans Approval</h2>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <select className="form-select" style={{ width: '150px' }}>
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

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
                        {plans.map(plan => (
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
                                    <button className="btn btn-secondary btn-sm" style={{ marginRight: '5px' }}>View</button>
                                    {plan.status === 'Pending' && (
                                        <>
                                            <button className="btn btn-primary btn-sm" onClick={() => handleApproveClick(plan)} style={{ marginRight: '5px' }}>Approve</button>
                                            <button className="btn btn-error btn-sm" onClick={() => handleRejectClick(plan)}>Reject</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isApproveModalOpen}
                onClose={() => setIsApproveModalOpen(false)}
                title="Confirm Approval"
                footer={
                    <>
                        <button className="btn btn-outline" onClick={() => setIsApproveModalOpen(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={confirmApprove}>Confirm Approve</button>
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
                        <button className="btn btn-outline" onClick={() => setIsRejectModalOpen(false)}>Cancel</button>
                        <button className="btn btn-error" onClick={confirmReject}>Reject Plan</button>
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
