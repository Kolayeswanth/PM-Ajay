import React, { useState, useEffect } from 'react';
import { Check, X, FileText } from 'lucide-react';

const ApproveAgencyRegistrations = () => {
    const [pendingAgencies, setPendingAgencies] = useState([]);
    const [selectedAgency, setSelectedAgency] = useState(null);

    useEffect(() => {
        // Load pending agencies from localStorage
        const storedAgencies = JSON.parse(localStorage.getItem('pendingAgencies') || '[]');
        setPendingAgencies(storedAgencies);
    }, []);

    const handleApprove = (id) => {
        if (window.confirm('Are you sure you want to approve this agency?')) {
            const updatedAgencies = pendingAgencies.filter(agency => agency.id !== id);
            localStorage.setItem('pendingAgencies', JSON.stringify(updatedAgencies));
            setPendingAgencies(updatedAgencies);
            setSelectedAgency(null);
            alert('Agency Approved!');
        }
    };

    const handleReject = (id) => {
        if (window.confirm('Are you sure you want to reject this agency?')) {
            const updatedAgencies = pendingAgencies.filter(agency => agency.id !== id);
            localStorage.setItem('pendingAgencies', JSON.stringify(updatedAgencies));
            setPendingAgencies(updatedAgencies);
            setSelectedAgency(null);
        }
    };

    return (
        <div className="dashboard-panel">
            <h2 className="section-title">Agency Registration Approvals</h2>

            {pendingAgencies.length === 0 ? (
                <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    <p>No pending agency registrations found.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* List of Pending Agencies */}
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Agency Name</th>
                                        <th>State</th>
                                        <th>Submitted At</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingAgencies.map((agency) => (
                                        <tr
                                            key={agency.id}
                                            onClick={() => setSelectedAgency(agency)}
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor: selectedAgency?.id === agency.id ? '#f0f9ff' : 'transparent'
                                            }}
                                        >
                                            <td style={{ fontWeight: '500' }}>{agency.agencyName}</td>
                                            <td>{agency.state}</td>
                                            <td>{new Date(agency.submittedAt).toLocaleDateString()}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedAgency(agency);
                                                    }}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Detail View */}
                    <div>
                        {selectedAgency ? (
                            <div className="card" style={{ padding: '24px' }}>
                                <h3 style={{ margin: '0 0 20px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    Application Details
                                </h3>

                                <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                                    <div>
                                        <label style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>AGENCY NAME</label>
                                        <div style={{ fontSize: '16px' }}>{selectedAgency.agencyName}</div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>PHONE</label>
                                            <div>{selectedAgency.phoneNumber}</div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>EMAIL</label>
                                            <div>{selectedAgency.email}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>GST NUMBER</label>
                                        <div style={{ fontFamily: 'monospace' }}>{selectedAgency.gstNumber}</div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>ADDRESS</label>
                                        <div>{selectedAgency.address}</div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>REQUESTED DISTRICTS</label>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                                            {selectedAgency.districts && selectedAgency.districts.length > 0 ? (
                                                selectedAgency.districts.map((d, i) => (
                                                    <span key={i} className="badge badge-info">{d}</span>
                                                ))
                                            ) : (
                                                <span className="text-muted">None selected</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                    <button
                                        className="btn btn-success"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        onClick={() => handleApprove(selectedAgency.id)}
                                    >
                                        <Check size={18} /> Approve
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        onClick={() => handleReject(selectedAgency.id)}
                                    >
                                        <X size={18} /> Reject
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="card" style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <FileText size={48} color="#e5e7eb" style={{ marginBottom: '16px' }} />
                                <p style={{ color: '#6b7280' }}>Select an application to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApproveAgencyRegistrations;
