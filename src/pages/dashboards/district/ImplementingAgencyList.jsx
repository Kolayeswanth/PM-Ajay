import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { Eye, Star } from 'lucide-react';
import InteractiveButton from '../../../components/InteractiveButton';

const ImplementingAgencyList = ({ districtId, stateName }) => {
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        console.log('ImplementingAgencyList mounted/updated. DistrictId:', districtId, 'StateName:', stateName);
        fetchData();
    }, [districtId, stateName]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Agencies
            let query = supabase
                .from('implementing_agencies')
                .select('*')
                .order('agency_name');

            if (stateName) {
                query = query.ilike('state', stateName);
            }

            const { data: agencyData, error: agencyError } = await query;

            if (agencyError) throw agencyError;

            // 2. Fetch Project Counts (Work Orders)
            // We get all work orders and aggregate in memory for simplicity (or use .select(count) with group by if Supabase supports it easily in one go, but easy aggregation is fine for < 1000 items)
            const { data: projectsData, error: projectsError } = await supabase
                .from('work_orders')
                .select('implementing_agency_id');

            if (projectsError) throw projectsError;

            // Aggregate counts
            const projectCounts = {};
            projectsData.forEach(p => {
                if (p.implementing_agency_id) {
                    projectCounts[p.implementing_agency_id] = (projectCounts[p.implementing_agency_id] || 0) + 1;
                }
            });

            // 3. Merge Data & Mock Rating
            const mergedData = agencyData.map(agency => ({
                ...agency,
                projectsDone: projectCounts[agency.id] || 0,
                rating: (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1) // Random rating between 3.5 and 5.0
            }));

            setAgencies(mergedData);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontWeight: 'bold', color: '#1F2937' }}>{rating}</span>
                <Star size={14} fill="#F59E0B" color="#F59E0B" />
            </div>
        );
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div style={{
                background: 'white',
                padding: '32px',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                border: '1px solid #F3F4F6'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #F3F4F6', paddingBottom: '16px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', margin: 0 }}>
                        Implementing Agencies
                    </h2>
                    <div style={{ color: '#6B7280', fontSize: '14px' }}>
                        Total: {agencies.length}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>Loading...</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Agency Name</th>
                                    <th>Agency Type</th>
                                    <th>Phone Number</th>
                                    <th>Projects Done</th>
                                    <th>Rating</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agencies.length > 0 ? (
                                    agencies.map((agency) => (
                                        <tr key={agency.id}>
                                            <td>
                                                <div style={{ fontWeight: '600', color: '#111827' }}>{agency.agency_name}</div>
                                                <div style={{ fontSize: '12px', color: '#6B7280' }}>{agency.district || agency.state}</div>
                                            </td>
                                            <td>
                                                <span className="badge badge-secondary">{agency.agency_type || 'N/A'}</span>
                                            </td>
                                            <td style={{ fontFamily: 'monospace', color: '#4B5563' }}>
                                                {agency.phone_no || '-'}
                                            </td>
                                            <td>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    background: '#EFF6FF',
                                                    color: '#2563EB',
                                                    fontWeight: '600',
                                                    fontSize: '12px'
                                                }}>
                                                    {agency.projectsDone}
                                                </span>
                                            </td>
                                            <td>
                                                {renderStars(agency.rating)}
                                            </td>
                                            <td>
                                                <InteractiveButton variant="secondary" size="sm">
                                                    <Eye size={16} /> View
                                                </InteractiveButton>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#6B7280' }}>
                                            No agencies found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImplementingAgencyList;
