import React, { useState } from 'react';
import StatCard from '../../../components/StatCard';

const StateReports = () => {
    const [reportType, setReportType] = useState('Financial');
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    // Sample data for different report types
    const reportData = {
        'Financial': {
            totalReceived: '₹500 Cr',
            totalReleased: '₹420 Cr',
            totalUtilized: '₹350 Cr',
            balance: '₹150 Cr',
            districts: [
                { name: 'Pune', received: '₹50 Cr', utilized: '₹42 Cr', balance: '₹8 Cr' },
                { name: 'Mumbai City', received: '₹60 Cr', utilized: '₹55 Cr', balance: '₹5 Cr' },
                { name: 'Nagpur', received: '₹45 Cr', utilized: '₹38 Cr', balance: '₹7 Cr' },
            ]
        },
        'Progress': {
            totalProjects: 125,
            completed: 45,
            ongoing: 65,
            pending: 15,
            completionRate: '36%'
        },
        'UCs': {
            totalUCs: 85,
            submitted: 72,
            verified: 60,
            pending: 25,
            verificationRate: '83%'
        }
    };

    const handleExportPDF = () => {
        try {
            console.log('Exporting state report:', reportType);

            const printWindow = window.open('', '_blank');
            const data = reportData[reportType];

            let reportContent = '';

            // Generate content based on report type
            if (reportType === 'Financial') {
                reportContent = `
                    <div class="section">
                        <div class="section-title">Financial Summary - Maharashtra</div>
                        <div class="info-row">
                            <div class="info-label">Total Funds Received:</div>
                            <div class="info-value"><strong>${data.totalReceived}</strong></div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Total Released to Districts:</div>
                            <div class="info-value">${data.totalReleased}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Total Utilized:</div>
                            <div class="info-value">${data.totalUtilized}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Balance Available:</div>
                            <div class="info-value" style="color: green;"><strong>${data.balance}</strong></div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">District-wise Financial Breakdown</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>District</th>
                                    <th>Received</th>
                                    <th>Utilized</th>
                                    <th>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.districts.map(district => `
                                    <tr>
                                        <td>${district.name}</td>
                                        <td>${district.received}</td>
                                        <td>${district.utilized}</td>
                                        <td>${district.balance}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            } else if (reportType === 'Progress') {
                reportContent = `
                    <div class="section">
                        <div class="section-title">Project Progress - Maharashtra</div>
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
                        <div class="info-row">
                            <div class="info-label">Completion Rate:</div>
                            <div class="info-value"><strong>${data.completionRate}</strong></div>
                        </div>
                    </div>
                `;
            } else if (reportType === 'UCs') {
                reportContent = `
                    <div class="section">
                        <div class="section-title">Utilization Certificates Status - Maharashtra</div>
                        <div class="info-row">
                            <div class="info-label">Total UCs Required:</div>
                            <div class="info-value">${data.totalUCs}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Submitted:</div>
                            <div class="info-value" style="color: blue;">${data.submitted}</div>
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
            }

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${reportType} Report - Maharashtra State</title>
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
                        .state-name {
                            color: #666;
                            font-size: 16px;
                            margin-top: 5px;
                        }
                        .report-type {
                            color: #3498db;
                            font-size: 18px;
                            margin-top: 10px;
                            font-weight: bold;
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
                            width: 300px;
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
                        <div class="state-name">State Dashboard - Maharashtra</div>
                        <div class="report-type">${reportType} Report</div>
                    </div>

                    ${reportContent}

                    <div class="footer">
                        <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                        <p>State Administration - Maharashtra</p>
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

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Reports</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                    <select
                        className="form-control"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        style={{ width: '200px' }}
                    >
                        <option value="Financial">Financial Reports</option>
                        <option value="Progress">Progress Reports</option>
                        <option value="UCs">UC Status Reports</option>
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={handleExportPDF}>📥 Export Report</button>
                </div>
            </div>

            {toast && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>{toast}</div>
                </div>
            )}

            <div className="dashboard-section">
                <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                    <StatCard
                        icon="📊"
                        value="8"
                        label="Reports Available"
                        color="var(--color-primary)"
                    />
                    <StatCard
                        icon="📥"
                        value="24"
                        label="Downloads this month"
                        color="var(--color-secondary)"
                    />
                </div>
            </div>

            <div className="dashboard-section">
                <h3 className="section-title">{reportType} Report Overview</h3>
                <div className="card" style={{ padding: 'var(--space-4)', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-light)' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Detailed charts and data tables for <strong>{reportType}</strong> will be displayed here.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StateReports;
