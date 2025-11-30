import React, { useState, useEffect } from 'react';
import StatCard from '../../../components/StatCard';
import DistrictMap from '../../../components/maps/DistrictMap';
import CityMap from '../../../components/maps/CityMap';

const StateDashboardPanel = ({ formatCurrency, stateName }) => {
    const [dashboardStats, setDashboardStats] = useState({
        totalFundReceived: 0,
        fundUtilizedPercentage: 0,
        districtsReporting: 0,
        totalDistricts: 0,
        pendingApprovals: 0,
        districtFundStatus: []
    });
    const [loading, setLoading] = useState(false);
    const [selectedDistrict, setSelectedDistrict] = useState(null);

    const API_BASE_URL = 'http://localhost:5001/api';

    useEffect(() => {
        const fetchDashboardStats = async () => {
            if (!stateName || stateName === 'Loading...' || stateName === 'State') return;

            // Clean the state name (remove 'State Admin', 'Admin', 'State')
            let cleanStateName = stateName;
            cleanStateName = cleanStateName.replace(' State Admin', '').replace(' Admin', '').replace(' State', '').trim();
            console.log('📊 Dashboard fetching stats for:', cleanStateName);

            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/dashboard/state-stats?stateName=${encodeURIComponent(cleanStateName)}`);

                if (response.ok) {
                    const result = await response.json();
                    console.log('📊 Dashboard stats received:', result);

                    if (result.success) {
                        setDashboardStats(result.data);
                    } else {
                        console.error('Failed to fetch dashboard stats:', result.error);
                    }
                } else {
                    console.error('API request failed with status:', response.status);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, [stateName]);

    // Don't render map until we have a valid state name
    const isValidState = stateName && stateName !== 'Loading...' && stateName !== 'State';
    const displayStateName = isValidState ? stateName.replace(' State Admin', '').replace(' Admin', '').replace(' State', '').trim() : 'Maharashtra';

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
                    value={loading ? "Loading..." : (formatCurrency ? formatCurrency(dashboardStats.totalFundReceived) : `₹${dashboardStats.totalFundReceived}`)}
                    label="Total Fund Received"
                    color="var(--color-primary)"
                />
                <StatCard
                    icon="📈"
                    value={loading ? "Loading..." : `${dashboardStats.fundUtilizedPercentage}%`}
                    label="Fund Utilized"
                    color="var(--color-secondary)"
                />
                <StatCard
                    icon="🏘️"
                    value={loading ? "Loading..." : dashboardStats.districtsReporting}
                    label="Districts Reporting"
                    color="var(--color-accent)"
                />
                <StatCard
                    icon="⏳"
                    value={loading ? "Loading..." : dashboardStats.pendingApprovals}
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
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                        Loading district data...
                                    </td>
                                </tr>
                            ) : dashboardStats.districtFundStatus && dashboardStats.districtFundStatus.length > 0 ? (
                                dashboardStats.districtFundStatus.map((district, index) => (
                                    <tr key={index}>
                                        <td><strong>{district.districtName}</strong></td>
                                        <td>{formatCurrency ? formatCurrency(district.fundReleased) : `₹${district.fundReleased}`}</td>
                                        <td>
                                            {formatCurrency ? formatCurrency(district.fundUtilized) : `₹${district.fundUtilized}`}
                                            {' '}({district.utilizationPercent}%)
                                        </td>
                                        <td>
                                            <span className={`badge ${district.projectStatus === 'On Track' ? 'badge-success' : 'badge-warning'}`}>
                                                {district.projectStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${district.ucUploaded ? 'badge-success' : 'badge-warning'}`}>
                                                {district.ucUploaded ? 'YES' : 'NO'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                        No district data available for {displayStateName}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StateDashboardPanel;
