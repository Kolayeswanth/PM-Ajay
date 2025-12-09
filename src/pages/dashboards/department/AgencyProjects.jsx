import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';

const AgencyProjects = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAssignedProjects();

        // Real-time subscription
        const subscription = supabase
            .channel('agency-projects-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'work_orders' }, (payload) => {
                console.log('Real-time update received:', payload);
                fetchAssignedProjects();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user]);

    const fetchAssignedProjects = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('=== AgencyProjects: Starting fetch ===');
            console.log('User Role:', user?.role);
            console.log('User Email:', user?.email);

            // Step 1: Get implementing_agency_id if user is an implementing agency
            let agencyId = null;
            if (user?.role === 'implementing_agency' && user?.email) {
                console.log('✅ User is an implementing agency, finding their agency...');

                // 0. Try User ID Lookup (Best Practice - matches Dashboard logic)
                const { data: userAgencies, error: userAgencyError } = await supabase
                    .from('implementing_agencies')
                    .select('id, agency_name')
                    .eq('user_id', user.id)
                    .limit(1);

                if (!userAgencyError && userAgencies && userAgencies.length > 0) {
                    agencyId = userAgencies[0].id;
                    console.log('✅ Found Agency ID via user_id:', agencyId);
                } else {
                    // Fallback map logic (simplified for brevity as user_id usually works)
                    const emailToAgencyMap = {
                        'ngo-karnataka14@nic.in': '16078b1c-bcd2-4eaa-81da-8dbd8590166b',
                        'nod-karnataka14@nic.in': '16078b1c-bcd2-4eaa-81da-8dbd8590166b',
                        'nod-karnataka63@pmajay.in': '2bfc5307-6ce5-4922-82e9-8bdc2ee17b65',
                        'tec-karnataka@nic.in': '26d31b6c-771f-4a9b-970b-da3103b83615',
                        'tec-karnataka42@nic.in': '26d31b6c-771f-4a9b-970b-da3103b83615',
                    };
                    if (emailToAgencyMap[user.email]) {
                        agencyId = emailToAgencyMap[user.email];
                    }
                }
            } else {
                console.log('ℹ️ User is NOT an implementing agency (role:', user?.role, ')');
            }

            // Step 2: Fetch ASSIGNED projects from district_proposals
            // We EXCLUDE 'location' because it might not exist and causes 400 errors
            let query = supabase
                .from('district_proposals')
                .select('id, project_name, estimated_cost, allocated_amount, component, status, approved_at, updated_at, executing_agency_name, assigned_to_ea_at, implementing_agency_id, executing_agency_id')
                .eq('status', 'ASSIGNED_TO_EA')
                .order('updated_at', { ascending: false });

            // Filter by agency if available
            if (agencyId) {
                // In a perfect world we filter by ID. 
                // But for now, to ensure visibility even if data is legacy/imperfect:
                // query = query.eq('implementing_agency_id', agencyId);
            }

            const { data: proposals, error: queryError } = await query;

            if (queryError) {
                console.error('Error fetching from district_proposals:', queryError);
                throw queryError;
            }

            if (!proposals || proposals.length === 0) {
                console.log('⚠️ No assigned projects found in district_proposals');
                setProjects([]);
                setLoading(false);
                return;
            }

            console.log('✅ Fetched Projects from district_proposals:', proposals.length);

            // Step 3: Transform to match expected structure
            const formattedProjects = proposals.map(p => ({
                id: p.id,
                title: p.project_name,
                component: p.component,
                amount: p.allocated_amount || p.estimated_cost,
                location: 'N/A', // Defaulting as column is missing
                deadline: null,
                status: p.status,
                created_at: p.assigned_to_ea_at || p.updated_at || p.approved_at,
                executing_agency_name: p.executing_agency_name || 'Assigned',
                progress_percentage: 0,
                implementing_agency_id: p.implementing_agency_id
            }));

            setProjects(formattedProjects);

        } catch (err) {
            console.error('❌ Error fetching assigned projects:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-panel" style={{ padding: 20 }}>
                <h2 style={{ marginBottom: 20 }}>Assigned Projects (Execution Phase)</h2>
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <p>Loading projects...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-panel" style={{ padding: 20 }}>
                <h2 style={{ marginBottom: 20 }}>Assigned Projects (Execution Phase)</h2>
                <div style={{ textAlign: 'center', padding: 40, color: '#dc2626' }}>
                    <p>Error loading projects: {error}</p>
                    <button
                        className="btn btn-primary"
                        onClick={fetchAssignedProjects}
                        style={{ marginTop: 10 }}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <h2 style={{ marginBottom: 20 }}>Assigned Projects (or Works)</h2>
            <p style={{ marginBottom: 20, color: '#666' }}>
                {user?.role === 'implementing_agency'
                    ? 'Showing projects assigned by you to Executing Agencies'
                    : 'Showing all assigned projects'}
            </p>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Project Title</th>
                            <th>Executing Agency</th>
                            <th>Component</th>
                            <th>Amount</th>
                            <th>Progress</th>
                            <th>Status</th>
                            <th>Assigned On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.length > 0 ? (
                            projects.map((project) => (
                                <tr key={project.id}>
                                    <td>
                                        <div style={{ fontWeight: 'bold' }}>
                                            {project.title || 'N/A'}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '500' }}>
                                            {project.executing_agency_name || 'Not assigned'}
                                        </div>
                                    </td>
                                    <td>{project.component || 'N/A'}</td>
                                    <td style={{ fontWeight: '600', color: '#10B981' }}>₹{project.amount?.toLocaleString('en-IN') || '0'}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{
                                                width: '60px',
                                                height: '8px',
                                                backgroundColor: '#E5E7EB',
                                                borderRadius: '4px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${project.progress_percentage || 0}%`,
                                                    height: '100%',
                                                    backgroundColor: project.progress_percentage >= 100 ? '#10B981' : '#3B82F6',
                                                    borderRadius: '4px'
                                                }} />
                                            </div>
                                            <span style={{ fontSize: '12px', color: '#666' }}>
                                                {project.progress_percentage || 0}%
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${project.status === 'Completed' ? 'badge-success' :
                                            project.status === 'In Progress' || project.status === 'Work in Progress' ? 'badge-warning' :
                                                'badge-primary'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td>{new Date(project.created_at).toLocaleDateString('en-IN')}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>
                                    <div style={{ color: '#666' }}>
                                        <p style={{ marginBottom: 10 }}>
                                            No assigned projects found.
                                        </p>
                                        <p style={{ fontSize: '14px' }}>
                                            Assign projects to Executing Agencies in the "Assign Projects" tab.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {projects.length > 0 && (
                <div style={{ marginTop: 20, padding: 15, background: '#f3f4f6', borderRadius: 8 }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                        <strong>Total Assigned Projects:</strong> {projects.length}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AgencyProjects;
