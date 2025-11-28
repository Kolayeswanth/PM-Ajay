import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// ⭐ KEEP PM-AJAY HEADER (import stays same)
// Header is now global in App.jsx
import Footer from "../components/Footer";

// ⭐ COMPONENTS FROM PM.ZIP
import ImageSlider from "../components/ImageSlider";
import ComponentsSection from "../components/ComponentsSection";
import StatisticsSection from "../components/StatisticsSection";
import IndiaMap from "../components/maps/IndiaMap";
import StatCard from "../components/StatCard";

// ⭐ DATA
import { nationalStats } from "../data/mockData";

// ⭐ Styles
import "./Home.css";

const Home = () => {
    const [selectedState, setSelectedState] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const navigate = useNavigate();

    const handleStateSelect = (stateName) => {
        setSelectedState(stateName);
        console.log("Selected state:", stateName);
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

    // ⭐ PDF Redirect function for 2 components
    const openGuidelinesPDF = () => {
        window.open(
            "https://pmajay.dosje.gov.in/Writereaddata/Guidelines.pdf",
            "_blank"
        );
    };

    return (
        <div className="page-wrapper">
            <ImageSlider />

            <div className="page-content">

                {/* ⭐ COMPONENTS SECTION (from PM.zip, with updated navigation) */}
                <ComponentsSection
                    onAdarshGramClick={() => navigate("/adarsh-gram")}
                    onGIAclick={openGuidelinesPDF}
                    onHostelClick={openGuidelinesPDF}
                />

                {/* ⭐ STATISTICS SECTION (from PM.zip) */}
                <StatisticsSection />

                {/* ⭐ WHITE CONTAINER SECTION */}
                <div style={{ paddingTop: "60px", backgroundColor: "white" }}>
                    <div className="container">

                        {/* ⭐ NATIONAL OVERVIEW (from PM.zip) */}
                        <div className="dashboard-section home-national-overview">
                            <div className="section-header">
                                <h2 className="section-title">National Overview</h2>
                            </div>

                            <div className="dashboard-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(6, 1fr)',
                                gap: '1rem',
                                marginBottom: '2rem'
                            }}>
                                <StatCard icon="🏛️" value={nationalStats.totalStates} label="States/UTs" />
                                <StatCard icon="🏘️" value={nationalStats.totalDistricts} label="Districts" />
                                <StatCard icon="📊" value={nationalStats.totalProjects} label="Total Projects"
                                    trend="positive" trendValue="+12% this year" />
                                <StatCard icon="💰" value={formatCurrency(nationalStats.totalFundAllocated)}
                                    label="Fund Allocated" />
                                <StatCard icon="✅" value={nationalStats.projectsCompleted}
                                    label="Completed Projects" trend="positive" trendValue="+8% this month" />
                                <StatCard icon="🚧" value={nationalStats.projectsOngoing} label="Ongoing Projects" />
                            </div>
                        </div>

                        {/* ⭐ INTERACTIVE MAP */}
                        <div className="dashboard-section">
                            <div className="section-header">
                                <h2 className="section-title">Interactive State Map</h2>
                                <p className="section-subtitle">
                                    Click on any state to view district-level details
                                </p>
                            </div>

                            <IndiaMap onStateSelect={handleStateSelect} />

                            {selectedState && (
                                <div className="alert alert-info" style={{ marginTop: "1rem" }}>
                                    <strong>Selected:</strong> {selectedState} – Login to view district details
                                </div>
                            )}
                        </div>

                        {/* ⭐ PORTAL FEATURES */}
                        <div className="dashboard-section">
                            <div className="section-header">
                                <h2 className="section-title">Portal Features</h2>
                            </div>

                            <div className="dashboard-grid">
                                <div className="card">
                                    <h3>🗺️ GIS Mapping</h3>
                                    <p>Interactive maps with project locations, progress tracking, and geo-tagged updates.</p>
                                </div>
                                <div className="card">
                                    <h3>👥 Role-Based Access</h3>
                                    <p>Custom dashboards for Ministry, State, District, and other stakeholders.</p>
                                </div>
                                <div className="card">
                                    <h3>💸 Fund Management</h3>
                                    <p>Tracks fund flow from Ministry down to execution level.</p>
                                </div>
                                <div className="card">
                                    <h3>📋 Workflow Automation</h3>
                                    <p>Automated approval workflows for proposals, DPRs, and payments.</p>
                                </div>
                                <div className="card">
                                    <h3>📊 Real-Time Reports</h3>
                                    <p>MIS reports, analytics, and export options.</p>
                                </div>
                                <div className="card">
                                    <h3>🔔 Notifications</h3>
                                    <p>Automatic alerts for approvals, deadlines, and fund releases.</p>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            <Footer />
        </div>

    );
};

export default Home;
