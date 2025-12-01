import React, { useState } from 'react';
import StatCard from '../../../components/StatCard';

const ReportsAnalytics = () => {
    const [reportType, setReportType] = useState('Fund Utilization');
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    // Sample data for different report types
    const reportData = {
        'Fund Utilization': {
            totalAllocated: '₹5000 Cr',
            totalReleased: '₹3500 Cr',
            totalUtilized: '₹2800 Cr',
            utilizationRate: '80%',
            states: [
                { name: 'Maharashtra', allocated: '₹500 Cr', utilized: '₹420 Cr', rate: '84%' },
                { name: 'Karnataka', allocated: '₹450 Cr', utilized: '₹360 Cr', rate: '80%' },
                { name: 'Gujarat', allocated: '₹400 Cr', utilized: '₹300 Cr', rate: '75%' },
            ]
        },
        'Project Progress': {
            totalProjects: 1250,
            completed: 450,
            ongoing: 650,
            pending: 150
        },
        'Annual Plan Summary': {
            totalPlans: 36,
            approved: 28,
            pending: 8,
            totalBudget: '₹5000 Cr'
        },
        'UCs submitted': {
            totalUCs: 850,
            verified: 720,
            pending: 130,
            verificationRate: '85%'
        },
        'State-wise Comparison': {
            topPerformers: ['Maharashtra', 'Karnataka', 'Gujarat'],
            needsAttention: ['Bihar', 'Jharkhand', 'Odisha']
        }
    };

    const handleExportPDF = () => {
        try {
            console.log('Exporting report:', reportType);

            const printWindow = window.open('', '_blank');
            const data = reportData[reportType];

            let reportContent = '';

            // Generate content based on report type
            if (reportType === 'Fund Utilization') {
                reportContent = `
                    <div class="section">
                        <div class="section-title">Summary</div>
                        <div class="info-row">
                            <div class="info-label">Total Allocated:</div>
                            <div class="info-value">${data.totalAllocated}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Total Released:</div>
                            <div class="info-value">${data.totalReleased}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Total Utilized:</div>
                            <div class="info-value">${data.totalUtilized}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Utilization Rate:</div>
                            <div class="info-value"><strong>${data.utilizationRate}</strong></div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">State-wise Breakdown</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>State</th>
                                    <th>Allocated</th>
                                    <th>Utilized</th>
                                    <th>Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.states.map(state => `
                                    <tr>
                                        <td>${state.name}</td>
                                        <td>${state.allocated}</td>
                                        <td>${state.utilized}</td>
                                        <td><strong>${state.rate}</strong></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            } else if (reportType === 'Project Progress') {
                reportContent = `
                    <div class="section">
                        <div class="section-title">Project Statistics</div>
                        <div class="info-row">
                            <div class="info-label">Total Projects:</div>
                            <div class="info-value"><strong>${data.totalProjects}</strong></div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Completed:</div>
                            <div class="info-value" style="color: green;">${data.completed}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Ongoing:</div>
                            <div class="info-value" style="color: orange;">${data.ongoing}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Pending:</div>
                            <div class="info-value" style="color: red;">${data.pending}</div>
                        </div>
                    </div>
                `;
            } else if (reportType === 'Annual Plan Summary') {
                reportContent = `
                    <div class="section">
                        <div class="section-title">Annual Plan Overview</div>
                        <div class="info-row">
                            <div class="info-label">Total Plans Submitted:</div>
                            <div class="info-value">${data.totalPlans}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Approved:</div>
                            <div class="info-value" style="color: green;">${data.approved}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Pending Approval:</div>
                            <div class="info-value" style="color: orange;">${data.pending}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Total Budget:</div>
                            <div class="info-value"><strong>${data.totalBudget}</strong></div>
                        </div>
                    </div>
                `;
            } else if (reportType === 'UCs submitted') {
                reportContent = `
                    <div class="section">
                        <div class="section-title">Utilization Certificates Status</div>
                        <div class="info-row">
                            <div class="info-label">Total UCs Submitted:</div>
                            <div class="info-value">${data.totalUCs}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Verified:</div>
                            <div class="info-value" style="color: green;">${data.verified}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Pending Verification:</div>
                            <div class="info-value" style="color: orange;">${data.pending}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Verification Rate:</div>
                            <div class="info-value"><strong>${data.verificationRate}</strong></div>
                        </div>
                    </div>
                `;
            } else if (reportType === 'State-wise Comparison') {
                reportContent = `
                    <div class="section">
                        <div class="section-title">Top Performing States</div>
                        <ul>
                            ${data.topPerformers.map(state => `<li style="color: green; font-weight: bold;">${state}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">States Needing Attention</div>
                        <ul>
                            ${data.needsAttention.map(state => `<li style="color: orange;">${state}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${reportType} Report - PM-AJAY</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 40px;
                            max-width: 900px;
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
                        .report-type {
                            color: #666;
                            font-size: 18px;
                            margin-top: 10px;
                        }
                        .section {
                            margin-bottom: 30px;
                        }
                        .section-title {
                            font-weight: bold;
                            color: #2c3e50;
                            font-size: 18px;
                            margin-bottom: 15px;
                            border-bottom: 2px solid #ecf0f1;
                            padding-bottom: 8px;
                        }
                        .info-row {
                            display: flex;
                            margin-bottom: 12px;
                            padding: 8px;
                            background-color: #f9f9f9;
                        }
                        .info-label {
                            font-weight: bold;
                            width: 250px;
                            color: #555;
                        }
                        .info-value {
                            color: #333;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 15px;
                        }
                        th {
                            background-color: #3498db;
                            color: white;
                            padding: 12px;
                            text-align: left;
                        }
                        td {
                            padding: 10px;
                            border: 1px solid #ddd;
                        }
                        tr:nth-child(even) {
                            background-color: #f9f9f9;
                        }
                        ul {
                            list-style-type: none;
                            padding-left: 0;
                        }
                        li {
                            padding: 8px;
                            margin-bottom: 5px;
                            background-color: #f9f9f9;
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
                        <h1>PM-AJAY Portal</h1>
                        <div class="report-type">${reportType} Report</div>
                    </div>

                    ${reportContent}

                    <div class="footer">
                        <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                        <p>Ministry of Social Justice & Empowerment</p>
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();

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

    const InfoCard = ({ icon, value, label, colorBg, colorText }) => (
        <div className="card" style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            border: 'none',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)'
        }}>
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: colorBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colorText,
                fontSize: '1.5rem'
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
            </div>
        </div>
    );



    return (
        <div className="dashboard-panel" style={{ backgroundColor: '#FFFFFF', padding: 20 }}>
            <h2 style={{ margin: '0 0 1.5rem 0' }}>Reports & Analytics</h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <select
                    className="form-control"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    style={{ width: '200px' }}
                >
                    <option value="Fund Utilization">Fund Utilization</option>
                    <option value="Project Progress">Project Progress</option>
                    <option value="Annual Plan Summary">Annual Plan Summary</option>
                    <option value="UCs submitted">UCs submitted</option>
                    <option value="State-wise Comparison">State-wise Comparison</option>
                </select>
                <button className="btn btn-primary btn-sm" onClick={handleExportPDF}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Export Report
                </button>
            </div>

            {toast && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>{toast}</div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <InfoCard
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}
                    value="12"
                    label="Reports Generated"
                    colorBg="#F5F3FF"
                    colorText="#7C3AED"
                />
                <InfoCard
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>}
                    value="45"
                    label="Downloads"
                    colorBg="#DBEAFE"
                    colorText="#2563EB"
                />
            </div>

            <div className="dashboard-section">
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>{reportType} Report</h3>
                <div className="card" style={{ padding: 'var(--space-4)', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-light)' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Graphical representation and detailed data for <strong>{reportType}</strong> will be displayed here.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReportsAnalytics;
