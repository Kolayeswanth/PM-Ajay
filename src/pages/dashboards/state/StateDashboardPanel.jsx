import React, { useState, useEffect } from 'react';
import StatCard from '../../../components/StatCard';
import DistrictMap from '../../../components/maps/DistrictMap';
import CityMap from '../../../components/maps/CityMap';
import { stateStats } from '../../../data/mockData';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../../lib/supabaseConfig';

const StateDashboardPanel = ({ formatCurrency, stateName }) => {
    const [totalFundReleased, setTotalFundReleased] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedDistrict, setSelectedDistrict] = useState(null);

    useEffect(() => {
        const fetchTotalFunds = async () => {
            if (!stateName || stateName === 'Loading...' || stateName === 'State') return;

            // Clean the state name (remove 'State Admin', 'Admin', 'State')
            let cleanStateName = stateName;
            cleanStateName = cleanStateName.replace(' State Admin', '').replace(' Admin', '').replace(' State', '').trim();
            console.log('📊 Dashboard fetching funds for:', cleanStateName);

            setLoading(true);
            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/state_fund_releases?select=amount_rupees,states!inner(name)`, {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') ? JSON.parse(localStorage.getItem('supabase.auth.token')).access_token : ''}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('📊 All funds:', data);

                    // Filter for current state using cleaned name
                    const stateFunds = data.filter(item => item.states.name === cleanStateName);
                    console.log('📊 Filtered funds for', cleanStateName, ':', stateFunds);

                    // Sum up
                    const total = stateFunds.reduce((sum, item) => sum + (item.amount_rupees || 0), 0);
                    console.log('📊 Total fund received:', total);
                    setTotalFundReleased(total);
                }
            } catch (error) {
                console.error('Error fetching total funds:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTotalFunds();
    }, [stateName]);

    // Don't render map until we have a valid state name
    const isValidState = stateName && stateName !== 'Loading...' && stateName !== 'State';
    const displayStateName = isValidState ? stateName : 'Maharashtra';

    // Fallback stats if state not found in mock data
    const stats = stateStats[displayStateName] || stateStats.Maharashtra || { districts: 0, projectsProposed: 0 };

    const handleDistrictSelect = (districtName) => {
        setSelectedDistrict(districtName);
        console.log('Selected district:', districtName);
    };

    const handleBack = () => {
        setSelectedDistrict(null);
    };

    return (
        <div className="dashboard-panel">
            {/* State KPIs */}
            <div className="kpi-row">
                <StatCard
                    icon="💰"
                    value={loading ? "Loading..." : (formatCurrency ? formatCurrency(totalFundReleased) : `₹${totalFundReleased}`)}
                    label="Total Fund Received"
                    color="var(--color-primary)"
                />
                <StatCard
                    icon="📈"
                    value="76%"
                    label="Fund Utilized"
                    color="var(--color-secondary)"
                />
                <StatCard
                    icon="🏘️"
                    value={stats.districts}
                    label="Districts Reporting"
                    color="var(--color-accent)"
                />
                <StatCard
                    icon="⏳"
                    value={stats.projectsProposed}
                    label="Pending Approvals"
                    color="var(--color-warning)"
                />
            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">
                        {selectedDistrict
                            ? `${selectedDistrict} District Overview`
                            : `${displayStateName} District-wise Progress Map`
                        }
                    </h2>
                    {selectedDistrict && (
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={handleBack}
                        >
                            ← Back to State View
                        </button>
                    )}
                </div>
                <div style={{ height: '800px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    {selectedDistrict ? (
                        <CityMap district={selectedDistrict} state={displayStateName} />
                    ) : (
                        <DistrictMap state={displayStateName} onDistrictSelect={handleDistrictSelect} />
                    )}
                </div>
            </div>

            {/* District-wise Status */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">District Fund Status</h2>
                </div>

                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>District Name</th>
                                <th>Fund Released</th>
                                <th>Fund Utilized</th>
                                <th>Project Status</th>
                                <th>UC Uploaded</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Pune</strong></td>
                                <td>₹68 Cr</td>
                                <td>₹52 Cr (76%)</td>
                                <td>
                                    <span className="badge badge-success">On Track</span>
                                </td>
                                <td><span className="badge badge-success">YES</span></td>
                            </tr>
                            <tr>
                                <td><strong>Mumbai</strong></td>
                                <td>₹92 Cr</td>
                                <td>₹71 Cr (77%)</td>
                                <td>
                                    <span className="badge badge-success">On Track</span>
                                </td>
                                <td><span className="badge badge-success">YES</span></td>
                            </tr>
                            <tr>
                                <td><strong>Nagpur</strong></td>
                                <td>₹54 Cr</td>
                                <td>₹38 Cr (70%)</td>
                                <td>
                                    <span className="badge badge-warning">Delayed</span>
                                </td>
                                <td><span className="badge badge-warning">NO</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StateDashboardPanel;
