import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

const FundsReceivedFromMinistry = ({ formatCurrency }) => {
    const { user } = useAuth();
    const [receivedFunds, setReceivedFunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stateName, setStateName] = useState('');

    // Supabase Configuration
    const SUPABASE_URL = 'https://gwfeaubvzjepmmhxgdvc.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZmVhdWJ2emplcG1taHhnZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjY1MDEsImV4cCI6MjA3OTc0MjUwMX0.uelA90LXrAcLazZi_LkdisGqft-dtvj0wgOQweMEUGE';

    useEffect(() => {
        fetchStateName();
    }, [user?.id]);

    useEffect(() => {
        if (stateName) {
            fetchReceivedFunds();
        }
    }, [stateName]);

    const fetchStateName = async () => {
        if (!user?.id) return;

        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=full_name`, {
                headers: {
                    'apikey': SUPABASE_KEY
                }
            });
            const data = await response.json();
            if (data[0]?.full_name) {
                // Remove 'State Admin', 'Admin', and 'State' from the name
                let name = data[0].full_name;
                name = name.replace(' State Admin', '').replace(' Admin', '').replace(' State', '').trim();
                console.log('📍 Original name:', data[0].full_name);
                console.log('📍 Cleaned name:', name);
                setStateName(name);
            }
        } catch (error) {
            console.error('Error fetching state name:', error);
        }
    };

    const fetchReceivedFunds = async () => {
        setLoading(true);
        console.log('=== FETCHING FUNDS FOR STATE ===');
        console.log('State Name:', stateName);

        try {
            const url = `${SUPABASE_URL}/rest/v1/state_fund_releases?select=*,states(name)&order=created_at.desc`;

            const response = await fetch(url, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') ? JSON.parse(localStorage.getItem('supabase.auth.token')).access_token : ''}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('All fund releases from DB:', data);

                // Log each state name for debugging
                data.forEach((item, idx) => {
                    const dbStateName = item.states?.name;
                    console.log(`Item ${idx}: DB state = "${dbStateName}", Profile state = "${stateName}", Match = ${dbStateName === stateName}`);
                });

                // Filter for current state
                const stateFunds = data.filter(item => item.states?.name === stateName);
                console.log('✅ Filtered funds for', stateName, ':', stateFunds);

                const formattedData = stateFunds.map(item => ({
                    id: item.id,
                    component: item.component,
                    amountInRupees: item.amount_rupees,
                    amountCr: item.amount_cr,
                    date: item.release_date,
                    sanctionNo: item.sanction_order_no,
                    remarks: item.remarks
                }));
                setReceivedFunds(formattedData);
            }
        } catch (error) {
            console.error('Error fetching funds:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalReceived = receivedFunds.reduce((sum, item) => sum + (item.amountInRupees || 0), 0);

    return (
        <div className="fund-received-page" style={{ padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Funds Received from Ministry</h2>
                <p style={{ color: '#666', marginTop: 8 }}>View all fund releases from the Ministry to {stateName}</p>
            </div>

            {/* Summary Card */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: 24,
                borderRadius: 12,
                marginBottom: 24,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <div style={{ fontSize: 14, opacity: 0.9 }}>Total Funds Received</div>
                <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>
                    {formatCurrency ? formatCurrency(totalReceived) : `₹${totalReceived}`}
                </div>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                    {receivedFunds.length} release{receivedFunds.length !== 1 ? 's' : ''} received
                </div>
            </div>

            {/* Table */}
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Scheme Component</th>
                            <th style={{ textAlign: 'right' }}>Amount Released</th>
                            <th>Release Date</th>
                            <th>Sanction Order No</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: 30 }}>
                                    Loading data...
                                </td>
                            </tr>
                        ) : receivedFunds.length > 0 ? (
                            receivedFunds.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {item.component.map((comp, idx) => (
                                                <span key={idx} style={{
                                                    background: '#e3f2fd',
                                                    color: '#1976d2',
                                                    padding: '4px 8px',
                                                    borderRadius: 4,
                                                    fontSize: 12,
                                                    fontWeight: 600
                                                }}>
                                                    {comp}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#2ecc71', fontSize: 16 }}>
                                        {formatCurrency ? formatCurrency(item.amountInRupees) : `₹${item.amountCr} Cr`}
                                    </td>
                                    <td>{new Date(item.date).toLocaleDateString('en-IN')}</td>
                                    <td>
                                        <span style={{
                                            background: '#fff3cd',
                                            color: '#856404',
                                            padding: '4px 8px',
                                            borderRadius: 4,
                                            fontSize: 12,
                                            fontWeight: 600
                                        }}>
                                            {item.sanctionNo || '-'}
                                        </span>
                                    </td>
                                    <td style={{
                                        color: '#666',
                                        maxWidth: 200,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }} title={item.remarks}>
                                        {item.remarks || '-'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                    No fund releases received yet from the Ministry.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FundsReceivedFromMinistry;
