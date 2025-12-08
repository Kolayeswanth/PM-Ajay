import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import InteractiveButton from '../../../components/InteractiveButton';
import { Eye } from 'lucide-react';

const ExecutingAgencyList = ({ stateName }) => {
    const { user } = useAuth();
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedAgency, setSelectedAgency] = useState(null);

    useEffect(() => {
        if (stateName) {
            fetchAgencies();
        }
    }, [stateName]);

    const fetchAgencies = async () => {
        setLoading(true);
        try {
            console.log('🔍 Fetching executing agencies for state:', stateName);

            // Generate completely generic dummy executing agencies data with consistent project counts
            const dummyAgencies = [
                {
                    id: 'ea-001',
                    agency_name: 'ABC Construction Company',
                    agency_type: 'Construction',
                    email: 'contact@abc-construction.com',
                    phone_number: '+91 9876543210',
                    state_name: stateName,
                    created_at: '2024-01-15T10:30:00Z',
                    projectCount: 7,
                    rating: 4.2
                },
                {
                    id: 'ea-002',
                    agency_name: 'XYZ Infrastructure Ltd',
                    agency_type: 'Infrastructure',
                    email: 'info@xyz-infra.com',
                    phone_number: '+91 9876543211',
                    state_name: stateName,
                    created_at: '2024-02-20T14:15:00Z',
                    projectCount: 12,
                    rating: 4.5
                },
                {
                    id: 'ea-003',
                    agency_name: 'BuildPro Contractors',
                    agency_type: 'Construction',
                    email: 'contact@buildpro.com',
                    phone_number: '+91 9876543212',
                    state_name: stateName,
                    created_at: '2024-03-10T09:45:00Z',
                    projectCount: 5,
                    rating: 3.8
                },
                {
                    id: 'ea-004',
                    agency_name: 'Metro Engineering Services',
                    agency_type: 'Engineering',
                    email: 'info@metro-eng.com',
                    phone_number: '+91 9876543213',
                    state_name: stateName,
                    created_at: '2024-04-05T11:20:00Z',
                    projectCount: 15,
                    rating: 4.7
                },
                {
                    id: 'ea-005',
                    agency_name: 'Prime Builders Association',
                    agency_type: 'Construction',
                    email: 'contact@primebuilders.com',
                    phone_number: '+91 9876543214',
                    state_name: stateName,
                    created_at: '2024-05-12T16:00:00Z',
                    projectCount: 9,
                    rating: 4.1
                },
            ];

            console.log(`✅ Fetched ${dummyAgencies.length} executing agencies:`, dummyAgencies);
            setAgencies(dummyAgencies);
        } catch (error) {
            console.error('Error loading agencies:', error);
            setAgencies([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = (agency) => {
        setSelectedAgency(agency);
        setShowModal(true);
    };

    const generateDummyProjects = (count) => {
        const projectTypes = ['Road Construction', 'School Building', 'Water Supply', 'Community Center', 'Health Clinic', 'Drainage System'];
        const statuses = ['Completed', 'In Progress', 'Completed', 'Completed'];

        return Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            name: `${projectTypes[i % projectTypes.length]} - Phase ${Math.floor(i / projectTypes.length) + 1}`,
            status: statuses[i % statuses.length],
            budget: `₹${(Math.random() * 50 + 10).toFixed(2)} L`,
            completion: statuses[i % statuses.length] === 'Completed' ? 100 : Math.floor(Math.random() * 40 + 40)
        }));
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div className="dashboard-section">
                <div className="section-header">
                    <h2 className="section-title">Executing Agencies - {stateName || 'Loading...'}</h2>
                </div>

                <div className="table-wrapper">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <p>Loading agencies...</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Agency Name</th>
                                    <th>Agency Type</th>
                                    <th>Phone Number</th>
                                    <th>Projects</th>
                                    <th>Rating</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agencies.length > 0 ? (
                                    agencies.map((agency, index) => (
                                        <tr key={agency.id}>
                                            <td>
                                                <strong>{agency.agency_name}</strong>
                                            </td>
                                            <td>
                                                <span className="badge badge-primary">
                                                    {agency.agency_type || 'N/A'}
                                                </span>
                                            </td>
                                            <td>{agency.phone_number || `+91 ${9100000000 + index}${Math.floor(Math.random() * 100)}`}</td>
                                            <td>
                                                <span style={{ color: 'var(--color-navy)', fontWeight: '600' }}>
                                                    {agency.projectCount}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{ color: '#F59E0B', fontSize: '16px' }}>★</span>
                                                    <span style={{ fontWeight: '600' }}>
                                                        {agency.rating}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <InteractiveButton
                                                    variant="info"
                                                    size="sm"
                                                    onClick={() => handleViewProfile(agency)}
                                                >
                                                    <Eye size={16} /> View
                                                </InteractiveButton>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                                            No executing agencies found for {stateName}.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Agency Profile Modal */}
            {showModal && selectedAgency && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '800px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                                    {selectedAgency.agency_name}
                                </h2>
                                <span className="badge badge-primary" style={{ marginTop: '8px', display: 'inline-block' }}>
                                    {selectedAgency.agency_type || 'N/A'}
                                </span>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#6B7280',
                                    padding: '4px 8px'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Agency Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '12px' }}>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Overall Rating</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ color: '#F59E0B', fontSize: '20px' }}>★</span>
                                    <span style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                                        {selectedAgency.rating}
                                    </span>
                                </div>
                            </div>
                            <div style={{ padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '12px' }}>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Total Projects</div>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                                    {selectedAgency.projectCount}
                                </div>
                            </div>
                            <div style={{ padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '12px' }}>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Completed</div>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>
                                    {Math.floor(selectedAgency.projectCount * 0.7)}
                                </div>
                            </div>
                        </div>

                        {/* Projects List */}
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
                                Recent Projects
                            </h3>
                            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                                <table className="table" style={{ fontSize: '14px' }}>
                                    <thead>
                                        <tr>
                                            <th>Project Name</th>
                                            <th>Budget</th>
                                            <th>Status</th>
                                            <th>Progress</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {generateDummyProjects(selectedAgency.projectCount).map((project) => (
                                            <tr key={project.id}>
                                                <td>{project.name}</td>
                                                <td>{project.budget}</td>
                                                <td>
                                                    <span className={`badge ${project.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                                                        {project.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ flex: 1, height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <div style={{
                                                                width: `${project.completion}%`,
                                                                height: '100%',
                                                                backgroundColor: project.completion === 100 ? '#10B981' : '#F59E0B',
                                                                transition: 'width 0.3s ease'
                                                            }}></div>
                                                        </div>
                                                        <span style={{ fontSize: '12px', color: '#6B7280', minWidth: '40px' }}>
                                                            {project.completion}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Close Button */}
                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                            <InteractiveButton variant="secondary" onClick={() => setShowModal(false)}>
                                Close
                            </InteractiveButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExecutingAgencyList;
