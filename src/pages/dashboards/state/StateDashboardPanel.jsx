import React, { useState } from 'react';
import StatCard from '../../../components/StatCard';
import DistrictMap from '../../../components/maps/DistrictMap';
import CityMap from '../../../components/maps/CityMap';
import { stateStats } from '../../../data/mockData';

const StateDashboardPanel = ({ formatCurrency, stateName = 'Maharashtra' }) => {
    const stats = stateStats[stateName] || stateStats.Maharashtra;
    const [selectedDistrict, setSelectedDistrict] = useState(null);

    // Don't render map until we have a valid state name
    const isValidState = stateName && stateName !== 'Loading...' && stateName !== 'State';
    const displayStateName = isValidState ? stateName : 'Maharashtra';

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
                    value={formatCurrency(stats.fundAllocated)}
                    label="Total Fund Released"
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
