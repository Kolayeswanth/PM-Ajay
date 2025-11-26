import React from 'react';
import StatCard from '../../../components/StatCard';
import { stateStats } from '../../../data/mockData';
import IndiaMap from '../../../components/maps/IndiaMap'; // Using IndiaMap as placeholder for State Map

const StateDashboardPanel = ({ formatCurrency }) => {
    const stats = stateStats.Maharashtra;

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

            {/* GIS Map Placeholder */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">District-wise Progress Map</h2>
                </div>
                <IndiaMap />
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
