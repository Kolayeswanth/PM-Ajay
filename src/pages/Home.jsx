import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IndiaMap from '../components/maps/IndiaMap';
import DistrictMap from '../components/maps/DistrictMap';
import CityMap from '../components/maps/CityMap';
import StatCard from '../components/StatCard';
import { nationalStats, schemeComponents } from '../data/mockData';

const Home = () => {
    const [selectedState, setSelectedState] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const navigate = useNavigate();

    const handleStateSelect = (stateName) => {
        setSelectedState(stateName);
        setSelectedDistrict(null);
        console.log('Selected state:', stateName);
    };

    const handleDistrictSelect = (districtName) => {
        setSelectedDistrict(districtName);
        console.log('Selected district:', districtName);
    };

    const handleBack = () => {
        if (selectedDistrict) {
            setSelectedDistrict(null);
        } else {
            setSelectedState(null);
        }
    };

    const formatCurrency = (amount) => {
        return `₹${(amount / 10000000000).toFixed(2)} Cr`;
    };

    return (
        <div className="page-wrapper">
            <div className="page-content">
                {/* Hero Section */}
                <div style={{
                    background: 'var(--bg-gradient)',
                    color: 'var(--text-inverse)',
                    padding: 'var(--space-12) 0',
                    marginBottom: 'var(--space-8)'
                }}>
                    <div className="container">
                        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                            <h1 style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-4)', color: 'white' }}>
                                PM-AJAY Portal
                            </h1>
                            <p style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)', color: 'white' }}>
                                Centralized Agency Mapping & Project Management System
                            </p>
                            <p style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-8)', color: 'white', opacity: 0.9 }}>
                                Streamlining implementation of Adarsh Gram, GIA, and Hostel components across India
                            </p>
                            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => navigate('/login')}
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: 'white',
                                        padding: '1rem 2rem',
                                        fontSize: '1.125rem',
                                        fontWeight: 500,
                                        border: '2px solid white',
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        transition: 'none'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.border = '2px solid white';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.border = '2px solid white';
                                    }}
                                    onMouseDown={(e) => {
                                        e.currentTarget.style.backgroundColor = '#FF9933';
                                        e.currentTarget.style.borderColor = '#FF9933';
                                        e.currentTarget.style.transform = 'none';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                    onMouseUp={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderColor = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderColor = 'white';
                                    }}
                                >
                                    Login to Portal
                                </button>
                                <button
                                    onClick={() => navigate('/public-dashboard')}
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: 'white',
                                        padding: '1rem 2rem',
                                        fontSize: '1.125rem',
                                        fontWeight: 500,
                                        border: '2px solid white',
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        transition: 'none'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.border = '2px solid white';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.border = '2px solid white';
                                    }}
                                    onMouseDown={(e) => {
                                        e.currentTarget.style.backgroundColor = '#FF9933';
                                        e.currentTarget.style.borderColor = '#FF9933';
                                        e.currentTarget.style.transform = 'none';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                    onMouseUp={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderColor = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderColor = 'white';
                                    }}
                                >
                                    View Public Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container">
                    {/* National Statistics */}
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2 className="section-title">National Overview</h2>
                        </div>

                        <div className="dashboard-grid">
                            <StatCard
                                icon="🏛️"
                                value={nationalStats.totalStates}
                                label="States/UTs"
                                color="var(--color-primary)"
                            />
                            <StatCard
                                icon="🏘️"
                                value={nationalStats.totalDistricts}
                                label="Districts"
                                color="var(--color-secondary)"
                            />
                            <StatCard
                                icon="📊"
                                value={nationalStats.totalProjects}
                                label="Total Projects"
                                trend="positive"
                                trendValue="+12% this year"
                                color="var(--color-accent)"
                            />
                            <StatCard
                                icon="💰"
                                value={formatCurrency(nationalStats.totalFundAllocated)}
                                label="Fund Allocated"
                                color="var(--color-success)"
                            />
                            <StatCard
                                icon="✅"
                                value={nationalStats.projectsCompleted}
                                label="Completed Projects"
                                trend="positive"
                                trendValue="+8% this month"
                                color="var(--color-success)"
                            />
                            <StatCard
                                icon="🚧"
                                value={nationalStats.projectsOngoing}
                                label="Ongoing Projects"
                                color="var(--color-warning)"
                            />
                        </div>
                    </div>

                    {/* Scheme Components */}
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2 className="section-title">PM-AJAY Components</h2>
                        </div>

                        <div className="dashboard-grid">
                            {schemeComponents.map(component => (
                                <div key={component.id} className="card">
                                    <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-3)' }}>
                                        {component.icon}
                                    </div>
                                    <h3 style={{ color: component.color, marginBottom: 'var(--space-2)' }}>
                                        {component.name}
                                    </h3>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                        {component.code === 'AG' && 'Development of model villages with comprehensive infrastructure and facilities for SC/ST communities.'}
                                        {component.code === 'GIA' && 'Grant-in-Aid support for NGOs and organizations working for SC/ST welfare and empowerment.'}
                                        {component.code === 'HOSTEL' && 'Construction and maintenance of hostels for SC/ST students to support their education.'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Interactive Map */}
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2 className="section-title">
                                {selectedDistrict
                                    ? `${selectedDistrict} District Overview`
                                    : selectedState
                                        ? `${selectedState} Overview`
                                        : 'Interactive State Map'
                                }
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {(selectedState || selectedDistrict) && (
                                    <button
                                        className="btn btn-outline"
                                        onClick={handleBack}
                                        style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}
                                    >
                                        ← Back to {selectedDistrict ? 'State View' : 'National View'}
                                    </button>
                                )}
                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0 }}>
                                    {selectedDistrict
                                        ? 'View major cities and project locations'
                                        : selectedState
                                            ? 'Click on a district to view major cities'
                                            : 'Click on any state to view district-level details'
                                    }
                                </p>
                            </div>
                        </div>

                        <div style={{ height: '800px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                            {selectedDistrict ? (
                                <CityMap district={selectedDistrict} state={selectedState} />
                            ) : selectedState ? (
                                <DistrictMap state={selectedState} onDistrictSelect={handleDistrictSelect} />
                            ) : (
                                <IndiaMap onStateSelect={handleStateSelect} />
                            )}
                        </div>

                        {selectedState && (
                            <div className="alert alert-info" style={{ marginTop: 'var(--space-4)' }}>
                                <strong>Selected:</strong> {selectedState} {selectedDistrict ? `> ${selectedDistrict}` : ''} - Login to view detailed information
                            </div>
                        )}
                    </div>

                    {/* Features */}
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2 className="section-title">Portal Features</h2>
                        </div>

                        <div className="dashboard-grid">
                            <div className="card">
                                <h3 style={{ color: 'var(--color-primary)' }}>🗺️ GIS Mapping</h3>
                                <p>Interactive maps with real-time project locations, progress tracking, and geo-tagged updates.</p>
                            </div>
                            <div className="card">
                                <h3 style={{ color: 'var(--color-primary)' }}>👥 Role-Based Access</h3>
                                <p>Customized dashboards for Ministry, State, District, GP, Department, and Contractor roles.</p>
                            </div>
                            <div className="card">
                                <h3 style={{ color: 'var(--color-primary)' }}>💸 Fund Management</h3>
                                <p>End-to-end fund flow tracking from Ministry to execution level with utilization certificates.</p>
                            </div>
                            <div className="card">
                                <h3 style={{ color: 'var(--color-primary)' }}>📋 Workflow Automation</h3>
                                <p>Streamlined approval workflows for proposals, DPRs, payments, and project completion.</p>
                            </div>
                            <div className="card">
                                <h3 style={{ color: 'var(--color-primary)' }}>📊 Real-Time Reports</h3>
                                <p>Comprehensive MIS reports, analytics, and data export at all administrative levels.</p>
                            </div>
                            <div className="card">
                                <h3 style={{ color: 'var(--color-primary)' }}>🔔 Notifications</h3>
                                <p>Automated alerts for deadlines, approvals, fund releases, and project milestones.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
