import React, { useState } from 'react';

const DepartmentReports = () => {
    const [reportType, setReportType] = useState('Execution');
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    // Sample Data for Reports
    const reportData = {
        'Execution': {
            title: 'Project Execution Status Report',
            summary: { totalWorks: 45, completed: 20, ongoing: 15, delayed: 10 },
            details: [
                { id: 101, title: 'Community Hall', location: 'Shirur', status: 'Ongoing', progress: '65%' },
                { id: 102, title: 'Road Phase 1', location: 'Khed', status: 'Delayed', progress: '30%' },
                { id: 103, title: 'Solar Lights', location: 'Baramati', status: 'Completed', progress: '100%' },
            ]
        },
        'Financial': {
            title: 'Financial Utilization Report',
            summary: { allocated: '₹15.00 Cr', utilized: '₹8.50 Cr', pending: '₹6.50 Cr' },
            details: [
                { id: 101, title: 'Community Hall', budget: '0.50', utilized: '0.35', balance: '0.15' },
                { id: 102, title: 'Road Phase 1', budget: '0.80', utilized: '0.20', balance: '0.60' },
                { id: 103, title: 'Solar Lights', budget: '0.25', utilized: '0.25', balance: '0.00' },
            ]
        }
    };

    const handleExportPDF = () => {
        const data = reportData[reportType];
        try {
            const printWindow = window.open('', '_blank');

            let tableHeaders = '';
            let tableRows = '';

            if (reportType === 'Execution') {
                tableHeaders = '<th>Work ID</th><th>Project Title</th><th>Location</th><th>Status</th><th>Progress</th>';
                tableRows = data.details.map(row => `
                    <tr>
                        <td>WO-${row.id}</td>
                        <td>${row.title}</td>
                        <td>${row.location}</td>
                        <td><span class="badge badge-${row.status === 'Completed' ? 'success' : row.status === 'Ongoing' ? 'warning' : 'error'}">${row.status}</span></td>
                        <td>${row.progress}</td>
                    </tr>
                `).join('');
            } else {
                tableHeaders = '<th>Work ID</th><th>Project Title</th><th>Budget (Cr)</th><th>Utilized (Cr)</th><th>Balance (Cr)</th>';
                tableRows = data.details.map(row => `
                    <tr>
                        <td>WO-${row.id}</td>
                        <td>${row.title}</td>
                        <td>₹${row.budget}</td>
                        <td>₹${row.utilized}</td>
                        <td>₹${row.balance}</td>
                    </tr>
                `).join('');
            }

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${data.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; }
                        h1 { text-align: center; color: #2c3e50; margin-bottom: 10px; }
                        .subtitle { text-align: center; color: #666; margin-bottom: 30px; }
                        .summary-box { display: flex; justify-content: space-between; background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e9ecef; }
                        .summary-item { text-align: center; }
                        .summary-label { font-size: 14px; color: #666; margin-bottom: 5px; }
                        .summary-value { font-size: 20px; font-weight: bold; color: #2c3e50; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background-color: #3498db; color: white; }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                        .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
                        .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
                        .badge-success { background-color: #d4edda; color: #155724; }
                        .badge-warning { background-color: #fff3cd; color: #856404; }
                        .badge-error { background-color: #f8d7da; color: #721c24; }
                    </style>
                </head>
                <body>
                    <h1>${data.title}</h1>
                    <div class="subtitle">Generated on: ${new Date().toLocaleDateString()}</div>

                    <div class="summary-box">
                        ${Object.entries(data.summary).map(([key, value]) => `
                            <div class="summary-item">
                                <div class="summary-label">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                <div class="summary-value">${value}</div>
                            </div>
                        `).join('')}
                    </div>

                    <table>
                        <thead>
                            <tr>${tableHeaders}</tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>

                    <div class="footer">
                        <p>This is an official report generated from PM-AJAY Department Dashboard.</p>
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.onload = function () { printWindow.print(); };
            showToast('Report generated successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            showToast('Error generating report');
        }
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Reports & Analytics</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                    <select
                        className="form-control"
                        style={{ width: '200px' }}
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                    >
                        <option value="Execution">Execution Report</option>
                        <option value="Financial">Financial Report</option>
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={handleExportPDF}>📥 Export Report</button>
                </div>
            </div>

            {toast && (
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'inline-block', background: '#00B894', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>{toast}</div>
                </div>
            )}

            {/* Report Preview */}
            <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0, marginBottom: 20, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                    {reportData[reportType].title}
                </h3>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 30 }}>
                    {Object.entries(reportData[reportType].summary).map(([key, value]) => (
                        <div key={key} style={{ padding: 15, backgroundColor: '#f8f9fa', borderRadius: 8, textAlign: 'center', border: '1px solid #e9ecef' }}>
                            <div style={{ fontSize: '14px', color: '#666', marginBottom: 5, textTransform: 'capitalize' }}>
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' }}>{value}</div>
                        </div>
                    ))}
                </div>

                {/* Data Table */}
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            {reportType === 'Execution' && (
                                <tr>
                                    <th>Work ID</th>
                                    <th>Project Title</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Progress</th>
                                </tr>
                            )}
                            {reportType === 'Financial' && (
                                <tr>
                                    <th>Work ID</th>
                                    <th>Project Title</th>
                                    <th>Budget (Cr)</th>
                                    <th>Utilized (Cr)</th>
                                    <th>Balance (Cr)</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {reportData[reportType].details.map((row, index) => (
                                <tr key={index}>
                                    <td><strong>WO-{row.id}</strong></td>
                                    <td>{row.title}</td>
                                    {reportType === 'Execution' && (
                                        <>
                                            <td>{row.location}</td>
                                            <td>
                                                <span className={`badge badge-${row.status === 'Completed' ? 'success' : row.status === 'Ongoing' ? 'warning' : 'error'}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td>{row.progress}</td>
                                        </>
                                    )}
                                    {reportType === 'Financial' && (
                                        <>
                                            <td>₹{row.budget}</td>
                                            <td>₹{row.utilized}</td>
                                            <td>₹{row.balance}</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DepartmentReports;
