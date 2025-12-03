import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Modal from '../../../components/Modal';
import { supabase } from '../../../lib/supabaseClient';

const UploadUCs = () => {
    const { user } = useAuth();
    const [ucs, setUcs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [districtName, setDistrictName] = useState('');
    const [districtId, setDistrictId] = useState(null);
    const [totalFundsReleased, setTotalFundsReleased] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        financialYear: '2024-25',
        component: '',
        fundReleased: '',
        fundUtilized: '',
        file: null
    });
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const API_BASE_URL = 'http://localhost:5001/api';

    // Fetch district name and ID
    useEffect(() => {
        const fetchDistrictInfo = async () => {
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
                            .replace(' District Admin', '')
                            .replace(' Admin', '')
                            .replace(' District', '')
                            .trim();
                        setDistrictName(name);

                        const districtRes = await fetch(`${SUPABASE_URL}/rest/v1/districts?name=eq.${name}&select=id`, {
                            headers: { 'apikey': SUPABASE_ANON_KEY }
                        });
                        const districtData = await districtRes.json();
                        if (districtData && districtData.length > 0) {
                            setDistrictId(districtData[0].id);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching district info:', error);
                }
            }
        };
        fetchDistrictInfo();
    }, [user?.id]);

    // Fetch total funds released to this district
    useEffect(() => {
        const fetchFundsReleased = async () => {
            if (!districtId) return;

            try {
                console.log('💰 Fetching funds released for district ID:', districtId);
                const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
                const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

                const response = await fetch(
                    `${SUPABASE_URL}/rest/v1/fund_releases?district_id=eq.${districtId}&select=amount_cr`,
                    {
                        headers: {
                            'apikey': SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                        }
                    }
                );
                const data = await response.json();

                if (data && data.length > 0) {
                    // amount_cr is already in Crores, just sum it
                    const total = data.reduce((sum, release) => sum + (release.amount_cr || 0), 0);
                    setTotalFundsReleased(total.toFixed(2));
                    console.log('✅ Total funds released:', total.toFixed(2), 'Cr');
                } else {
                    console.log('⚠️ No funds released to this district yet');
                    setTotalFundsReleased(0);
                }
            } catch (error) {
                console.error('Error fetching funds released:', error);
            }
        };

        fetchFundsReleased();
    }, [districtId]);

    // Fetch UCs
    useEffect(() => {
        const fetchUCs = async () => {
            if (!districtId) return;

            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/ucs/district/${districtId}`);
                const result = await response.json();

                if (result.success) {
                    const transformedUCs = result.data.map(uc => ({
                        id: uc.id,
                        financialYear: uc.financial_year,
                        component: uc.component || 'General',
                        fundReleased: (uc.fund_released / 10000000).toFixed(2),
                        fundUtilized: (uc.fund_utilized / 10000000).toFixed(2),
                        utilizationPercent: uc.utilization_percent,
                        date: uc.submitted_date,
                        status: uc.status,
                        file: uc.document_url ? uc.document_url.split('/').pop() : 'N/A',
                        remarks: uc.remarks || ''
                    }));
                    setUcs(transformedUCs);
                }
            } catch (error) {
                console.error('Error fetching UCs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUCs();
    }, [districtId]);

    // Auto-fill fund released when modal opens
    useEffect(() => {
        if (isModalOpen && totalFundsReleased > 0) {
            setFormData(prev => ({ ...prev, fundReleased: totalFundsReleased }));
        }
    }, [isModalOpen, totalFundsReleased]);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const validate = () => {
        const errs = {};

        if (!formData.fundReleased || parseFloat(formData.fundReleased) <= 0) {
            errs.fundReleased = 'Please enter fund released amount';
        }

        if (!formData.fundUtilized || parseFloat(formData.fundUtilized) <= 0) {
            errs.fundUtilized = 'Please enter fund utilized amount';
        }

        // Check if utilized exceeds released
        if (parseFloat(formData.fundUtilized) > parseFloat(formData.fundReleased)) {
            errs.fundUtilized = `❌ Fund utilized (₹${formData.fundUtilized} Cr) cannot exceed fund released (₹${formData.fundReleased} Cr)`;
        }

        if (!formData.file) {
            errs.file = 'Please select a PDF file';
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleUpload = async () => {
        if (!validate()) return;
        if (!districtId) {
            showToast('District information not found');
            return;
        }

        setSubmitting(true);
        try {
            const fundReleasedRupees = Math.round(parseFloat(formData.fundReleased) * 10000000);
            const fundUtilizedRupees = Math.round(parseFloat(formData.fundUtilized) * 10000000);

            // Upload file to Supabase Storage
            let uploadedFileUrl = null;
            if (formData.file) {
                const fileExt = formData.file.name.split('.').pop();
                const fileName = `${districtId}_${formData.financialYear.replace('/', '-')}_${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('ucs')
                    .upload(fileName, formData.file);

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    throw new Error('Failed to upload file: ' + uploadError.message);
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('ucs')
                    .getPublicUrl(fileName);

                uploadedFileUrl = publicUrl;
            }

            const ucData = {
                districtId: districtId,
                financialYear: formData.financialYear,
                fundReleased: fundReleasedRupees,
                fundUtilized: fundUtilizedRupees,
                documentUrl: uploadedFileUrl
            };

            const response = await fetch(`${API_BASE_URL}/ucs/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ucData)
            });

            const result = await response.json();

            if (result.success) {
                const newUC = {
                    id: result.data.id,
                    financialYear: formData.financialYear,
                    component: formData.component || 'General',
                    fundReleased: formData.fundReleased,
                    fundUtilized: formData.fundUtilized,
                    utilizationPercent: Math.round((fundUtilizedRupees / fundReleasedRupees) * 100),
                    date: new Date().toISOString().split('T')[0],
                    status: 'Pending Verification',
                    file: formData.file.name,
                    remarks: ''
                };

                setUcs([newUC, ...ucs]);
                showToast('✅ UC submitted successfully! State will verify it.');
                setIsModalOpen(false);
                setFormData({ financialYear: '2024-25', component: '', fundReleased: '', fundUtilized: '', file: null });
                setErrors({});
            } else {
                showToast('Failed to submit UC: ' + result.error);
            }
        } catch (error) {
            console.error('Error submitting UC:', error);
            showToast('Error submitting UC');
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewFile = (uc) => {
        try {
            const printWindow = window.open('', '_blank');
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Utilization Certificate - ${districtName}</title>
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
                        .stamp { position: absolute; right: 100px; top: 400px; opacity: 0.3; transform: rotate(-15deg); border: 3px solid ${uc.status === 'Verified' ? '#10B981' : '#F59E0B'}; padding: 10px 20px; font-size: 24px; font-weight: bold; color: ${uc.status === 'Verified' ? '#10B981' : '#F59E0B'}; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">🇮🇳</div>
                        <h1>Utilization Certificate</h1>
                        <h2>Pradhan Mantri Anusuchit Jaati Abhyuday Yojana (PM-AJAY)</h2>
                        <p style="margin: 10px 0; font-size: 14px;">District: ${districtName}</p>
                    </div>
                    
                    ${uc.status === 'Verified' ? '<div class="stamp">VERIFIED</div>' : '<div class="stamp">PENDING</div>'}
                    
                    <div class="content">
                        <p>
                            This is to certify that the District of <strong>${districtName}</strong> has submitted 
                            the Utilization Certificate for funds released under the PM-AJAY scheme for the 
                            financial year <strong>${uc.financialYear}</strong>.
                        </p>
                    </div>

                    <div class="details">
                        <div class="detail-row">
                            <div class="detail-label">District Name:</div>
                            <div class="detail-value">${districtName}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Financial Year:</div>
                            <div class="detail-value">${uc.financialYear}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Funds Released:</div>
                            <div class="detail-value">₹${uc.fundReleased} Cr</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Funds Utilized:</div>
                            <div class="detail-value">₹${uc.fundUtilized} Cr</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Utilization Percentage:</div>
                            <div class="detail-value">${uc.utilizationPercent}%</div>
                        </div>
                         <div class="detail-row">
                            <div class="detail-label">Status:</div>
                            <div class="detail-value">${uc.status}</div>
                        </div>
                    </div>

                    <div class="signature-section">
                        <div class="signature">
                            District Magistrate<br>
                            (Signature & Seal)
                        </div>
                        <div class="signature">
                            District Welfare Officer<br>
                            (Signature & Seal)
                        </div>
                    </div>

                    <div class="footer">
                        Generated on ${new Date().toLocaleDateString()} | PM-AJAY Portal
                    </div>
                </body>
                </html>
            `;
            printWindow.document.write(htmlContent);
            printWindow.document.close();
        } catch (error) {
            console.error('Error opening file:', error);
            showToast('Error viewing file');
        }
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h2 style={{ margin: 0 }}>Upload Utilisation Certificates</h2>
                    <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                        Submit UCs to State for verification - District: <strong>{districtName || 'Loading...'}</strong>
                        {totalFundsReleased > 0 && (
                            <span style={{ marginLeft: '16px', color: '#059669', fontWeight: 'bold' }}>
                                💰 Funds Released: ₹{totalFundsReleased} Cr
                            </span>
                        )}
                    </p>
                </div>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsModalOpen(true)}
                    disabled={totalFundsReleased <= 0}
                    title={totalFundsReleased <= 0 ? 'No funds released yet' : 'Upload new UC'}
                >
                    + Upload New UC
                </button>
            </div>

            {totalFundsReleased <= 0 && (
                <div style={{ padding: '16px', backgroundColor: '#FEF3C7', borderLeft: '4px solid #F59E0B', marginBottom: '20px', borderRadius: '6px' }}>
                    <strong>⚠️ No Funds Released Yet</strong>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                        The State has not released any funds to your district yet. You can upload UCs once funds are released.
                    </p>
                </div>
            )}

            {toast && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>{toast}</div>
                </div>
            )}

            <div className="table-wrapper">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading UCs...</div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Financial Year</th>
                                <th>Component</th>
                                <th style={{ textAlign: 'right' }}>Fund Released</th>
                                <th style={{ textAlign: 'right' }}>Fund Utilized</th>
                                <th style={{ textAlign: 'center' }}>Utilization %</th>
                                <th>Submission Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ucs.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>📄</div>
                                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No Utilization Certificates Uploaded</div>
                                        <div style={{ fontSize: '14px' }}>Click "+ Upload New UC" to submit your first utilization certificate to State</div>
                                    </td>
                                </tr>
                            ) : (
                                ucs.map(uc => (
                                    <tr key={uc.id}>
                                        <td><strong>{uc.financialYear}</strong></td>
                                        <td>{uc.component}</td>
                                        <td style={{ textAlign: 'right' }}>₹{uc.fundReleased} Cr</td>
                                        <td style={{ textAlign: 'right' }}>₹{uc.fundUtilized} Cr</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{
                                                fontWeight: 'bold',
                                                color: uc.utilizationPercent >= 80 ? '#059669' : uc.utilizationPercent >= 50 ? '#F59E0B' : '#DC2626'
                                            }}>
                                                {uc.utilizationPercent}%
                                            </span>
                                        </td>
                                        <td>{uc.date}</td>
                                        <td>
                                            <span className={`badge badge-${uc.status === 'Verified' ? 'success' : uc.status === 'Rejected' ? 'danger' : 'warning'}`}>
                                                {uc.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleViewFile(uc)}>View</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setErrors({}); }}
                title="Upload Utilization Certificate"
                footer={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => { setIsModalOpen(false); setErrors({}); }} style={{ background: 'transparent', border: '2px solid #ddd', color: '#333', padding: '8px 14px', borderRadius: 8 }}>
                            Cancel
                        </button>
                        <button onClick={handleUpload} className="btn btn-primary" style={{ padding: '8px 14px' }} disabled={submitting}>
                            {submitting ? 'Uploading...' : 'Upload UC'}
                        </button>
                    </div>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                    <div style={{ padding: '12px', backgroundColor: '#F3F4F6', borderRadius: '8px', marginBottom: '8px' }}>
                        <strong>District:</strong> {districtName || 'Loading...'}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Financial Year</label>
                        <select
                            className="form-control"
                            value={formData.financialYear}
                            onChange={(e) => setFormData({ ...formData, financialYear: e.target.value })}
                        >
                            <option value="2024-25">2024-25</option>
                            <option value="2023-24">2023-24</option>
                            <option value="2022-23">2022-23</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Scheme Component (Optional)</label>
                        <select
                            className="form-control"
                            value={formData.component}
                            onChange={(e) => setFormData({ ...formData, component: e.target.value })}
                        >
                            <option value="">-- Select Component --</option>
                            <option value="Adarsh Gram">Adarsh Gram</option>
                            <option value="GIA">Grant-in-Aid (GIA)</option>
                            <option value="Hostel">Hostel Construction</option>
                            <option value="General">General</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Fund Released (in Crores)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-control no-spin"
                            placeholder="0.00"
                            value={formData.fundReleased}
                            onChange={(e) => setFormData({ ...formData, fundReleased: e.target.value })}
                            style={{ backgroundColor: '#F9FAFB' }}
                        />
                        <div className="form-helper">
                            💰 Total funds released to this district: <strong>₹{totalFundsReleased} Cr</strong>
                        </div>
                        {errors.fundReleased && <div className="form-error">{errors.fundReleased}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Fund Utilized (in Crores)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-control no-spin"
                            placeholder="0.00"
                            value={formData.fundUtilized}
                            onChange={(e) => setFormData({ ...formData, fundUtilized: e.target.value })}
                        />
                        <div className="form-helper">Amount actually utilized from released funds</div>
                        {errors.fundUtilized && <div className="form-error">{errors.fundUtilized}</div>}
                    </div>

                    {formData.fundReleased && formData.fundUtilized && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: parseFloat(formData.fundUtilized) > parseFloat(formData.fundReleased) ? '#FEE2E2' : '#DBEAFE',
                            borderRadius: '8px',
                            fontSize: '14px',
                            border: parseFloat(formData.fundUtilized) > parseFloat(formData.fundReleased) ? '2px solid #DC2626' : 'none'
                        }}>
                            <strong>Utilization:</strong> {Math.round((parseFloat(formData.fundUtilized) / parseFloat(formData.fundReleased)) * 100) || 0}%
                            {parseFloat(formData.fundUtilized) > parseFloat(formData.fundReleased) && (
                                <div style={{ color: '#DC2626', marginTop: '8px', fontWeight: 'bold' }}>
                                    ⚠️ ERROR: Utilized amount exceeds released amount!
                                </div>
                            )}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label required">Upload UC Document (PDF)</label>
                        <input
                            type="file"
                            accept=".pdf"
                            className="form-control"
                            onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                            style={{ padding: '8px' }}
                        />
                        <div className="form-helper">Max file size: 5MB. PDF only.</div>
                        {errors.file && <div className="form-error">{errors.file}</div>}
                    </div>
                </div>
            </Modal>
        </div >
    );
};

export default UploadUCs;
