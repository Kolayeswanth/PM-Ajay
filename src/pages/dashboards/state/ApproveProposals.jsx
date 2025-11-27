import React, { useState } from 'react';
import Modal from '../../../components/Modal';

const ApproveProposals = () => {
    const [proposals, setProposals] = useState([
        { id: 1, district: 'Pune', title: 'Community Development Projects', date: '2025-11-18', status: 'Pending', budget: '15.5 Cr', description: 'Development of community centers and public facilities' },
        { id: 2, district: 'Nashik', title: 'Infrastructure Upgrades', date: '2025-11-19', status: 'Pending', budget: '22.0 Cr', description: 'Road and bridge infrastructure improvements' },
        { id: 3, district: 'Mumbai City', title: 'Skill Development Center', date: '2025-11-10', status: 'Approved', budget: '10.0 Cr', description: 'Establishment of vocational training centers' },
        { id: 4, district: 'Nagpur', title: 'Healthcare Facilities', date: '2025-11-05', status: 'Rejected', budget: '18.0 Cr', description: 'Construction of primary health centers', rejectReason: 'Insufficient documentation' },
    ]);

    const [selectedProposal, setSelectedProposal] = useState(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleApproveClick = (proposal) => {
        setSelectedProposal(proposal);
        setIsApproveModalOpen(true);
    };

    const handleRejectClick = (proposal) => {
        setSelectedProposal(proposal);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    const confirmApprove = () => {
        setProposals(proposals.map(p => p.id === selectedProposal.id ? { ...p, status: 'Approved' } : p));
        showToast(`Proposal "${selectedProposal.title}" approved successfully`);
        setIsApproveModalOpen(false);
    };

    const confirmReject = () => {
        if (!rejectReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        setProposals(proposals.map(p => p.id === selectedProposal.id ? { ...p, status: 'Rejected', rejectReason } : p));
        showToast(`Proposal "${selectedProposal.title}" rejected`);
        setIsRejectModalOpen(false);
    };

    // View/Download PDF function
    const handleViewPDF = (proposal) => {
        try {
            console.log('Generating PDF for proposal:', proposal.title);

            // Create a new window for printing
            const printWindow = window.open('', '_blank');

            // Generate HTML content
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Proposal - ${proposal.title}</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 40px;
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        .header {
                            text-align: center;
                            border-bottom: 3px solid #3498db;
                            padding-bottom: 20px;
                            margin-bottom: 30px;
                        }
                        h1 {
                            color: #2c3e50;
                            margin: 0;
                        }
                        .proposal-id {
                            color: #666;
                            font-size: 14px;
                            margin-top: 5px;
                        }
                        .section {
                            margin-bottom: 25px;
                        }
                        .section-title {
                            font-weight: bold;
                            color: #2c3e50;
                            font-size: 16px;
                            margin-bottom: 8px;
                            border-bottom: 2px solid #ecf0f1;
                            padding-bottom: 5px;
                        }
                        .info-row {
                            display: flex;
                            margin-bottom: 10px;
                        }
                        .info-label {
                            font-weight: bold;
                            width: 200px;
                            color: #555;
                        }
                        .info-value {
                            color: #333;
                        }
                        .status {
                            display: inline-block;
                            padding: 5px 15px;
                            border-radius: 20px;
                            font-weight: bold;
                            font-size: 14px;
                        }
                        .status-pending {
                            background-color: #fff3cd;
                            color: #856404;
                        }
                        .status-approved {
                            background-color: #d4edda;
                            color: #155724;
                        }
                        .status-rejected {
                            background-color: #f8d7da;
                            color: #721c24;
                        }
                        .footer {
                            margin-top: 50px;
                            padding-top: 20px;
                            border-top: 2px solid #ecf0f1;
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                        }
                        @media print {
                            body {
                                padding: 20px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>District Proposal Document</h1>
                        <div class="proposal-id">Proposal ID: PROP-${proposal.id}</div>
                    </div>

                    <div class="section">
                        <div class="section-title">Basic Information</div>
                        <div class="info-row">
                            <div class="info-label">District:</div>
                            <div class="info-value">${proposal.district}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Proposal Title:</div>
                            <div class="info-value">${proposal.title}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Submission Date:</div>
                            <div class="info-value">${proposal.date}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Budget Requested:</div>
                            <div class="info-value">₹${proposal.budget}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Status:</div>
                            <div class="info-value">
                                <span class="status status-${proposal.status.toLowerCase()}">${proposal.status}</span>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">Proposal Description</div>
                        <p>${proposal.description || 'No description provided.'}</p>
                    </div>

                    ${proposal.rejectReason ? `
                    <div class="section">
                        <div class="section-title">Rejection Reason</div>
                        <p>${proposal.rejectReason}</p>
                    </div>
                    ` : ''}

                    <div class="footer">
                        <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                        <p>PM-AJAY Portal - State Dashboard</p>
                    </div>
                </body>
                </html>
            `;

            // Write content to new window
            printWindow.document.write(htmlContent);
            printWindow.document.close();

            // Wait for content to load, then trigger print dialog
            printWindow.onload = function () {
                printWindow.print();
            };

            showToast('PDF preview opened! Use "Save as PDF" to download.');
            console.log('PDF window opened successfully');
        } catch (error) {
            console.error('Error generating PDF:', error);
            showToast('Error generating PDF. Please try again.');
        }
    };

    // Filter proposals based on status
    const filteredProposals = statusFilter
        ? proposals.filter(p => p.status === statusFilter)
        : proposals;

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Approve District Proposals</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                    <select
                        className="form-control"
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
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>{toast}</div>
                </div>
            )}

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>District</th>
                            <th>Proposal Title</th>
                            <th>Submission Date</th>
                            <th>Budget</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProposals.length > 0 ? (
                            filteredProposals.map(proposal => (
                                <tr key={proposal.id}>
                                    <td>{proposal.district}</td>
                                    <td>{proposal.title}</td>
                                    <td>{proposal.date}</td>
                                    <td>₹{proposal.budget}</td>
                                    <td>
                                        <span className={`badge badge-${proposal.status === 'Approved' ? 'success' : proposal.status === 'Rejected' ? 'error' : 'warning'}`}>
                                            {proposal.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleViewPDF(proposal)}
                                            >
                                                View
                                            </button>
                                            {proposal.status === 'Pending' && (
                                                <>
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleApproveClick(proposal)}>Approve</button>
                                                    <button className="btn btn-outline btn-sm" onClick={() => handleRejectClick(proposal)}>Reject</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                    No proposals found for the selected status.
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
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => setIsApproveModalOpen(false)} style={{ background: 'transparent', border: '2px solid #ddd', color: '#333', padding: '8px 14px', borderRadius: 8 }}>
                            Cancel
                        </button>
                        <button onClick={confirmApprove} className="btn btn-primary" style={{ padding: '8px 14px' }}>
                            Confirm Approve
                        </button>
                    </div>
                }
            >
                <p>Are you sure you want to approve the proposal <strong>"{selectedProposal?.title}"</strong>?</p>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>This action will mark the proposal as approved and notify the district admin.</p>
            </Modal>

            <Modal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                title="Reject Proposal"
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => setIsRejectModalOpen(false)} style={{ background: 'transparent', border: '2px solid #ddd', color: '#333', padding: '8px 14px', borderRadius: 8 }}>
                            Cancel
                        </button>
                        <button onClick={confirmReject} className="btn btn-error" style={{ padding: '8px 14px' }}>
                            Reject Proposal
                        </button>
                    </div>
                }
            >
                <div className="form-group">
                    <label className="form-label">Reason for Rejection</label>
                    <textarea
                        className="form-control"
                        rows="4"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Please provide a detailed reason for rejection..."
                    />
                    <div className="form-helper">This reason will be sent to the district admin</div>
                </div>
            </Modal>
        </div>
    );
};

export default ApproveProposals;
