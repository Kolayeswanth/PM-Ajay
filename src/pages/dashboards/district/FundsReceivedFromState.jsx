import React, { useState, useEffect } from 'react';

const FundsReceivedFromState = ({ formatCurrency, districtId }) => {
    const [fundReleases, setFundReleases] = useState([]);
    const [totalReceived, setTotalReceived] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFundReleases = async () => {
            if (!districtId) return;

            setLoading(true);
            try {
                const response = await fetch(`https://gwfeaubvzjepmmhxgdvc.supabase.co/rest/v1/fund_releases?district_id=eq.${districtId}&select=*&order=created_at.desc`, {
                    headers: {
                        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZmVhdWJ2emplcG1taHhnZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjY1MDEsImV4cCI6MjA3OTc0MjUwMX0.uelA90LXrAcLazZi_LkdisGqft-dtvj0wgOQweMEUGE'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setFundReleases(data);
                    const total = data.reduce((sum, item) => sum + (item.amount_cr || 0), 0);
                    setTotalReceived(total);
                }
            } catch (error) {
                console.error('Error fetching fund releases:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFundReleases();
    }, [districtId]);

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Funds Received from State</h2>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
                    View all fund allocations released by the State Admin
                </p>
            </div>

            {/* Summary Card */}
            <div className="card" style={{ padding: 20, marginBottom: 20, backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#666' }}>Total Funds Received</h3>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>₹{totalReceived.toFixed(2)} Cr</div>
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#666' }}>Total Releases</h3>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#27ae60' }}>{fundReleases.length}</div>
                    </div>
                </div>
            </div>

            {/* Funds Table */}
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Release Date</th>
                            <th>Component</th>
                            <th>Amount</th>
                            <th>Officer ID</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: 30 }}>Loading...</td>
                            </tr>
                        ) : fundReleases.length > 0 ? (
                            fundReleases.map((release) => (
                                <tr key={release.id}>
                                    <td>{release.release_date}</td>
                                    <td>
                                        {release.component && release.component.map((c, i) => (
                                            <span key={i} className="badge badge-primary" style={{ marginRight: 4 }}>{c}</span>
                                        ))}
                                    </td>
                                    <td style={{ fontWeight: 'bold', color: '#27ae60' }}>
                                        ₹{release.amount_cr} Cr
                                    </td>
                                    <td>{release.officer_id || '-'}</td>
                                    <td style={{ color: '#666', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={release.remarks}>
                                        {release.remarks || '-'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                    No fund releases received yet from the State.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FundsReceivedFromState;
