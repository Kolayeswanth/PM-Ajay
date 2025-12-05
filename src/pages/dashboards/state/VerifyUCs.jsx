import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const VerifyUCs = () => {
    const { user } = useAuth();
    const [ucs, setUcs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stateName, setStateName] = useState('');
    const [selectedUC, setSelectedUC] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [verificationData, setVerificationData] = useState({
        status: '',
        remarks: ''
    });
    const [toast, setToast] = useState(null);

    const API_BASE_URL = 'http://localhost:5001/api';

    // Fetch state name from user profile
    useEffect(() => {
        const fetchStateName = async () => {
            if (user?.id) {
                try {
                    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
                    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

                    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=full_name`, {
                        headers: { 'apikey': SUPABASE_ANON_KEY }
                    });
                    const data = await response.json();
                    if (data[0]?.full_name) {
                        const name = data[0].full_name
                            .replace(' State Admin', '')
                            .replace(' Admin', '')
                            .replace(' State', '')
                            .trim();
                        setStateName(name);
                    }
                } catch (error) {
                    console.error('Error fetching state name:', error);
                }
            }
        };
        fetchStateName();
    }, [user?.id]);

    // Fetch UCs from backend
    useEffect(() => {
        const fetchUCs = async () => {
            if (!stateName) return;

            setLoading(true);
            try {
                console.log('📋 Fetching UCs for state:', stateName);
                const response = await fetch(`${API_BASE_URL}/ucs/state?stateName=${encodeURIComponent(stateName)}`);
                const result = await response.json();

                if (result.success) {
                    // Transform data to match component format
                    const transformedUCs = result.data.map(uc => ({
                        id: uc.id,
                        district: uc.districts?.name || 'Unknown',
                        year: uc.financial_year,
                        submittedDate: uc.submitted_date,
                        fundReleased: uc.fund_released,
                        fundUtilized: uc.fund_utilized,
                        utilizationPercent: uc.utilization_percent,
                        status: uc.status,
                        documentUrl: uc.document_url || '#',
                        remarks: uc.remarks || ''
                    }));
                    setUcs(transformedUCs);
                    console.log('✅ Loaded', transformedUCs.length, 'UCs');
                } else {
                    console.error('Failed to fetch UCs:', result.error);
                    showToast('Failed to load UCs');
                }
            } catch (error) {
                console.error('Error fetching UCs:', error);
                showToast('Error loading UCs');
            } finally {
                setLoading(false);
            }
        };

        fetchUCs();
    }, [stateName]);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const formatCurrency = (amount) => {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
    };

    const handleVerify = (uc) => {
        setSelectedUC(uc);
        setVerificationData({
            status: uc.status === 'Pending Verification' ? '' : uc.status,
            remarks: uc.remarks || ''
        });
        setShowModal(true);
    };

    const handleSubmitVerification = async () => {
        if (!verificationData.status) {
            showToast('Please select verification status');
            return;
        }

        try {
            console.log('📤 Submitting verification for UC:', selectedUC.id);

            const response = await fetch(`${API_BASE_URL}/ucs/verify/${selectedUC.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: verificationData.status,
                    remarks: verificationData.remarks,
                    verifiedBy: user?.id
                })
            });

            const result = await response.json();

            if (result.success) {
                // Update local state
                setUcs(ucs.map(uc =>
                    uc.id === selectedUC.id
                        ? { ...uc, status: verificationData.status, remarks: verificationData.remarks }
                        : uc
                ));

                setShowModal(false);
                setSelectedUC(null);
                showToast(`UC ${verificationData.status === 'Verified' ? 'approved' : 'rejected'} successfully!`);
                console.log('✅ Verification saved to database');
            } else {
                showToast('Failed to save verification');
                console.error('Verification failed:', result.error);
            }
        } catch (error) {
            console.error('Error submitting verification:', error);
            showToast('Error saving verification');
        }
    };

    const handleViewDocument = (uc) => {
        // Generate UC preview
        const printWindow = window.open('', '_blank');
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Utilization Certificate - ${uc.district}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; border: 5px double #333; }
                    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    .logo { font-size: 40px; margin-bottom: 10px; }
                    h1 { font-size: 28px; text-transform: uppercase; margin: 10px 0; color: #FF9933; }
                    h2 { font-size: 20px; font-weight: normal; margin-top: 0; }
                    .content { line-height: 1.8; font-size: 16px; text-align: justify; margin-bottom: 30px; }
                    .details { margin: 30px 0; }
                    .detail-row { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
                    .detail-label { font-weight: bold; width: 40%; }
                    .detail-value { width: 60%; text-align: right; }
                    .signature-section { display: flex; justify-content: space-between; margin-top: 80px; }
                    .signature { text-align: center; border-top: 2px solid #333; width: 200px; padding-top: 10px; }
                    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
                    .stamp { position: absolute; right: 100px; top: 400px; opacity: 0.3; transform: rotate(-15deg); border: 3px solid #FF9933; padding: 10px 20px; font-size: 24px; font-weight: bold; color: #FF9933; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">🇮🇳</div>
                    <h1>Utilization Certificate</h1>
                    <h2>Pradhan Mantri Anusuchit Jaati Abhyuday Yojana (PM-AJAY)</h2>
                    <p style="margin: 10px 0; font-size: 14px;">Financial Year: ${uc.year}</p>
                </div>
                
                ${uc.status === 'Verified' ? '<div class="stamp">VERIFIED</div>' : ''}
                
                <div class="content">
                    <p>
                        This is to certify that the District of <strong>${uc.district}</strong> has submitted 
                        the Utilization Certificate for funds released under the PM-AJAY scheme for the 
                        financial year <strong>${uc.year}</strong>.
                    </p>
                </div>

                <div class="details">
                    <div class="detail-row">
                        <div class="detail-label">District Name:</div>
                        <div class="detail-value">${uc.district}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Financial Year:</div>
                        <div class="detail-value">${uc.year}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Funds Released:</div>
                        <div class="detail-value">${formatCurrency(uc.fundReleased)}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Funds Utilized:</div>
                        <div class="detail-value">${formatCurrency(uc.fundUtilized)}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Utilization Percentage:</div>
                        <div class="detail-value">${uc.utilizationPercent}%</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Submission Date:</div>
                        <div class="detail-value">${uc.submittedDate}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Verification Status:</div>
                        <div class="detail-value"><strong>${uc.status}</strong></div>
                    </div>
                    ${uc.remarks ? `
                    <div class="detail-row">
                        <div class="detail-label">Remarks:</div>
                        <div class="detail-value">${uc.remarks}</div>
                    </div>
                    ` : ''}
                </div>

                <div class="content">
                    <p>
                        It is certified that the funds have been utilized for the approved purposes and 
                        all supporting documents including bills, vouchers, and beneficiary lists have 
                        been verified and found to be in order.
                    </p>
                </div>

                <div class="signature-section">
                    <div class="signature">
                        <strong>District Magistrate</strong><br>
                        ${uc.district} District
                    </div>
                    <div class="signature">
                        <strong>State Project Director</strong><br>
                        PM-AJAY Cell
                    </div>
                </div>

                <div class="footer">
                    Generated on: ${new Date().toLocaleString()} | Document ID: UC-${uc.id}-${uc.year}<br>
                    Ministry of Social Justice & Empowerment, Government of India
                </div>
            </body>
            </html>
        `;
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    const getStatusBadge = (status) => {
        const badges = {
            'Pending Verification': 'badge-warning',
            'Verified': 'badge-success',
            'Rejected': 'badge-danger'
        };
        return badges[status] || 'badge-secondary';
    };

    const pendingCount = ucs.filter(uc => uc.status === 'Pending Verification').length;
    const verifiedCount = ucs.filter(uc => uc.status === 'Verified').length;
    const rejectedCount = ucs.filter(uc => uc.status === 'Rejected').length;

    return (
        <div className="dashboard-panel">
            <div className="section-header">
                <h2 className="section-title">Verify Utilization Certificates (UCs)</h2>
                <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                    Review and verify UCs submitted by districts before releasing additional funds
                </p>
            </div>

            {toast && (
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: '6px' }}>{toast}</div>
                </div>
            )}

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                {/* Card 1: Verified */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    border: '1px solid #F3F4F6'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: '#D1FAE5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                        color: '#059669'
                    }}>
                        <CheckCircle size={24} />
                    </div>
                    <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#111827',
                        lineHeight: '1.2',
                        marginBottom: '4px'
                    }}>
                        {verifiedCount}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Verified
                    </div>
                </div>

                {/* Card 2: Pending Verification */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    border: '1px solid #F3F4F6'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: '#FEF3C7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                        color: '#D97706'
                    }}>
                        <Clock size={24} />
                    </div>
                    <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#111827',
                        lineHeight: '1.2',
                        marginBottom: '4px'
                    }}>
                        {pendingCount}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Pending Verification
                    </div>
                </div>
                {/* Card 3: Rejected */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    border: '1px solid #F3F4F6'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: '#FEE2E2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                        color: '#DC2626'
                    }}>
                        <XCircle size={24} />
                    </div>
                    <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#111827',
                        lineHeight: '1.2',
                        marginBottom: '4px'
                    }}>
                        {rejectedCount}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Rejected
                    </div>
                </div>
            </div>

            {/* UCs Table */}
            <div className="section-header">
                <h3 className="section-title">Submitted Utilization Certificates</h3>
            </div>
            <div className="table-wrapper">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        Loading UCs...
                    </div>
                ) : ucs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        No UCs submitted yet. Districts will upload UCs after utilizing funds.
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>District</th>
                                <th>Financial Year</th>
                                <th>Submitted Date</th>
                                <th style={{ textAlign: 'right' }}>Fund Released</th>
                                <th style={{ textAlign: 'right' }}>Fund Utilized</th>
                                <th style={{ textAlign: 'center' }}>Utilization %</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ucs.map(uc => (
                                <tr key={uc.id}>
                                    <td><strong>{uc.district}</strong></td>
                                    <td>{uc.year}</td>
                                    <td>{uc.submittedDate}</td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(uc.fundReleased)}</td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(uc.fundUtilized)}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{
                                            fontWeight: 'bold',
                                            color: uc.utilizationPercent >= 80 ? '#059669' : uc.utilizationPercent >= 50 ? '#F59E0B' : '#DC2626'
                                        }}>
                                            {uc.utilizationPercent}%
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(uc.status)}`}>
                                            {uc.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleViewDocument(uc)}
                                                title="View UC Document"
                                            >
                                                👁️ View
                                            </button>
                                            {uc.status === 'Pending Verification' && (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleVerify(uc)}
                                                >
                                                    ✓ Verify
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Verification Modal */}
            {showModal && selectedUC && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3>Verify Utilization Certificate</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>UC Details</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                                    <div><strong>District:</strong> {selectedUC.district}</div>
                                    <div><strong>Year:</strong> {selectedUC.year}</div>
                                    <div><strong>Fund Released:</strong> {formatCurrency(selectedUC.fundReleased)}</div>
                                    <div><strong>Fund Utilized:</strong> {formatCurrency(selectedUC.fundUtilized)}</div>
                                    <div><strong>Utilization:</strong> {selectedUC.utilizationPercent}%</div>
                                    <div><strong>Submitted:</strong> {selectedUC.submittedDate}</div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label required">Verification Decision</label>
                                <select
                                    className="form-control"
                                    value={verificationData.status}
                                    onChange={(e) => setVerificationData({ ...verificationData, status: e.target.value })}
                                >
                                    <option value="">-- Select Decision --</option>
                                    <option value="Verified">✓ Approve & Verify</option>
                                    <option value="Rejected">✗ Reject</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Remarks / Comments</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Enter verification remarks, observations, or reasons for rejection..."
                                    value={verificationData.remarks}
                                    onChange={(e) => setVerificationData({ ...verificationData, remarks: e.target.value })}
                                />
                            </div>

                            {verificationData.status === 'Verified' && (
                                <div style={{ padding: '12px', backgroundColor: '#D1FAE5', borderRadius: '6px', fontSize: '14px', color: '#059669' }}>
                                    ✓ Verifying this UC will allow the district to request additional funds.
                                </div>
                            )}

                            {verificationData.status === 'Rejected' && (
                                <div style={{ padding: '12px', backgroundColor: '#FEE2E2', borderRadius: '6px', fontSize: '14px', color: '#DC2626' }}>
                                    ⚠️ Rejecting this UC will require the district to resubmit with corrections.
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmitVerification}
                                disabled={!verificationData.status}
                            >
                                Submit Verification
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerifyUCs;
