import React, { useState } from 'react';
import StatCard from '../../../components/StatCard';
import DistrictMap from '../../../components/maps/DistrictMap';
import { districtStats, mockProjects } from '../../../data/mockData';

const DistrictDashboardPanel = ({ formatCurrency, districtId }) => {
    const [stats, setStats] = useState({
        gramPanchayats: 0,
        totalProjects: 0,
        fundAllocated: 0,
        completedProjects: 0
    });
    const [fundAllocated, setFundAllocated] = useState(0);
    const [recentReleases, setRecentReleases] = useState([]);
    const [showAddLocationModal, setShowAddLocationModal] = useState(false);
    const [newLocation, setNewLocation] = useState({
        name: '',
        gp: '',
        component: 'Adarsh Gram',
        estimatedCost: '',
        description: ''
    });
    const [myProposals, setMyProposals] = useState([]);

    // Fetch district statistics
    React.useEffect(() => {
        if (!districtId) return;
        const fetchStats = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/dashboard/district-stats/${districtId}`);
                const result = await response.json();
                if (result.success) {
                    setStats(result.data);
                }
            } catch (error) {
                console.error('Error fetching district stats:', error);
            }
        };
        fetchStats();
    }, [districtId]);

    // Fetch my proposals
    React.useEffect(() => {
        if (!districtId) return;
        const fetchProposals = async () => {
            try {
                const res = await fetch(`http://localhost:5001/api/proposals/district/${districtId}`);
                const data = await res.json();
                if (data.success) {
                    setMyProposals(data.data);
                }
            } catch (err) {
                console.error('Error fetching proposals:', err);
            }
        };
        fetchProposals();
    }, [districtId]);

    // Fetch allocated funds
    React.useEffect(() => {
        const fetchFunds = async () => {
            if (!districtId) return;

            try {
                const response = await fetch(`https://gwfeaubvzjepmmhxgdvc.supabase.co/rest/v1/fund_releases?district_id=eq.${districtId}&select=*&order=created_at.desc`, {
                    headers: {
                        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZmVhdWJ2emplcG1taHhnZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjY1MDEsImV4cCI6MjA3OTc0MjUwMX0.uelA90LXrAcLazZi_LkdisGqft-dtvj0wgOQweMEUGE'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const total = data.reduce((sum, item) => sum + (item.amount_cr || 0), 0);
                    setFundAllocated(total * 10000000);
                    setRecentReleases(data.slice(0, 5)); // Keep top 5
                }
            } catch (error) {
                console.error('Error fetching funds:', error);
            }
        };

        fetchFunds();
    }, [districtId]);

    const getStatusBadge = (status) => {
        const badges = {
            'PROPOSED': 'badge-info',
            'APPROVED': 'badge-info',
            'ONGOING': 'badge-warning',
            'COMPLETED': 'badge-success',
            'DELAYED': 'badge-error',
            'SUBMITTED': 'badge-info',
            'APPROVED_BY_STATE': 'badge-warning',
            'APPROVED_BY_MINISTRY': 'badge-success',
            'REJECTED_BY_STATE': 'badge-error',
            'REJECTED': 'badge-error'
        };
        return badges[status] || 'badge-info';
    };

    const getReadableStatus = (status) => {
        if (status === 'SUBMITTED') return 'Pending at State';
        if (status === 'APPROVED_BY_STATE') return 'Pending at Ministry';
        if (status === 'APPROVED_BY_MINISTRY') return 'Approved & Active';
        if (status === 'REJECTED_BY_STATE') return 'Rejected by State';
        if (status === 'REJECTED') return 'Rejected';
        return status;
    };

    const handleAddLocation = () => {
        console.log('Adding new location:', newLocation);
        // Here you would typically send this to your backend
        setShowAddLocationModal(false);
        setNewLocation({
            name: '',
            gp: '',
            component: 'Adarsh Gram',
            estimatedCost: '',
            description: ''
        });
    };

    return (
        <>
            {/* District KPIs */}
            <div className="kpi-row">
                <StatCard
                    icon="🏡"
                    value={stats.gramPanchayats}
                    label="Gram Panchayats"
                    color="var(--color-primary)"
                />
                <StatCard
                    icon="📊"
                    value={stats.totalProjects}
                    label="Total Projects"
                    color="var(--color-secondary)"
                />
                <StatCard
                    icon="💰"
                    value={`₹${stats.fundAllocated.toFixed(2)} Cr`}
                    label="Fund Allocated"
                    color="var(--color-success)"
                />
                <StatCard
                    icon="✔️"
                    value={stats.completedProjects}
                    label="Completed"
                    trend="positive"
                    trendValue="+5 this month"
                    color="var(--color-success)"
                />
            </div>

            {/* Recent Funds Received */}
            <div className="dashboard-section" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="section-header">
                    <h2 className="section-title">Recent Funds Received from State</h2>
                </div>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="table" style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Component</th>
                                <th>Amount</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentReleases.length > 0 ? (
                                recentReleases.map(release => (
                                    <tr key={release.id}>
                                        <td>{release.release_date}</td>
                                        <td>
                                            {release.component && release.component.map((c, i) => (
                                                <span key={i} className="badge badge-primary" style={{ marginRight: 4 }}>{c}</span>
                                            ))}
                                        </td>
                                        <td style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>
                                            ₹{release.amount_cr} Cr
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                            {release.remarks || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--text-tertiary)' }}>
                                        No funds received yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* GIS Map */}
            <div className="dashboard-section" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="section-header" style={{ marginBottom: 'var(--space-4)' }}>
                    <h2 className="section-title">Project Locations (GIS View)</h2>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAddLocationModal(true)}>
                        📍 Add New Location
                    </button>
                </div>
                <div style={{ height: '500px', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                    <DistrictMap state="Maharashtra" />
                </div>
            </div>

            {/* Add New Location Modal */}
            {showAddLocationModal && (
                <div className="modal-overlay" onClick={() => setShowAddLocationModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
                        <h2 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-navy)' }}>Add New Project Location</h2>

                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <label className="form-label">Project Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={newLocation.name}
                                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                                placeholder="Enter project name"
                            />
                        </div>

                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <label className="form-label">Gram Panchayat</label>
                            <select
                                className="form-control"
                                value={newLocation.gp}
                                onChange={(e) => setNewLocation({ ...newLocation, gp: e.target.value })}
                            >
                                <option value="">Select GP</option>
                                <option value="Shirur GP">Shirur GP</option>
                                <option value="Khed GP">Khed GP</option>
                                <option value="Baramati GP">Baramati GP</option>
                                <option value="Junnar GP">Junnar GP</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <label className="form-label">Component</label>
                            <select
                                className="form-control"
                                value={newLocation.component}
                                onChange={(e) => setNewLocation({ ...newLocation, component: e.target.value })}
                            >
                                <option value="Adarsh Gram">Adarsh Gram</option>
                                <option value="GIA (Grant-in-Aid)">GIA (Grant-in-Aid)</option>
                                <option value="Hostel">Hostel</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <label className="form-label">Estimated Cost (in Lakhs)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={newLocation.estimatedCost}
                                onChange={(e) => setNewLocation({ ...newLocation, estimatedCost: e.target.value })}
                                placeholder="Enter estimated cost"
                            />
                        </div>

                        <div style={{ marginBottom: 'var(--space-6)' }}>
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-control"
                                value={newLocation.description}
                                onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
                                placeholder="Enter project description"
                                rows="3"
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                            <button className="btn btn-outline" onClick={() => setShowAddLocationModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleAddLocation}>
                                Add Location
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* GP Proposals Pending */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">GP Proposals Pending Approval</h2>
                    <span className="badge badge-warning" style={{ fontSize: 'var(--text-base)', padding: 'var(--space-2) var(--space-4)' }}>
                        {stats.projectsProposed} Pending
                    </span>
                </div>

                <div className="card">
                    {['Shirur GP - Community Center', 'Khed GP - Water Tank'].map((proposal, index) => (
                        <div key={index} style={{
                            padding: 'var(--space-4)',
                            border: '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--space-3)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h4 style={{ margin: 0, marginBottom: 'var(--space-2)' }}>{proposal}</h4>
                                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                    Submitted: Nov {22 + index}, 2025 • Component: Adarsh Gram •
                                    Estimated Cost: ₹{(Math.random() * 50 + 20).toFixed(2)} L
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <button className="btn btn-secondary btn-sm">📄 Review</button>
                                <button className="btn btn-primary btn-sm">✅ Approve</button>
                                <button className="btn btn-outline btn-sm">❌ Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* My Submitted Proposals (To State) */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">My Submitted Proposals (To State)</h2>
                </div>
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Project Name</th>
                                <th>Component</th>
                                <th>Est. Cost</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myProposals.length > 0 ? (
                                myProposals.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.project_name}</td>
                                        <td><span className="badge badge-primary">{p.component}</span></td>
                                        <td>₹{p.estimated_cost} L</td>
                                        <td><span className={`badge ${getStatusBadge(p.status)}`}>{getReadableStatus(p.status)}</span></td>
                                        <td>{new Date(p.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                        No proposals submitted yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* All Projects Table */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">All District Projects</h2>
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <button className="btn btn-secondary btn-sm">➕ Assign Work</button>
                        <button className="btn btn-outline btn-sm">📊 Export Data</button>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Project Name</th>
                                <th>GP</th>
                                <th>Component</th>
                                <th>Status</th>
                                <th>Progress</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myProposals.map(project => (
                                <tr key={project.id}>
                                    <td>
                                        <strong>{project.project_name}</strong>
                                        <br />
                                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                            ID: PRJ-{project.id.toString().padStart(4, '0')}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 'var(--text-sm)' }}>-</td>
                                    <td>
                                        <span className="badge badge-primary">{project.component}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(project.status)}`}>
                                            {getReadableStatus(project.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <div className="progress-bar" style={{ flex: 1, height: '6px', minWidth: '80px' }}>
                                                <div className="progress-fill" style={{ width: '0%' }}></div>
                                            </div>
                                            <span style={{ fontSize: 'var(--text-sm)' }}>0%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <button className="btn btn-primary btn-sm">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default DistrictDashboardPanel;
