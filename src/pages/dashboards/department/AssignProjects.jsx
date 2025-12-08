import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import RoleResponsibilityDisplay from '../../../components/RoleResponsibilityDisplay';

const AssignProjects = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedAgency, setSelectedAgency] = useState('');
    const [assigning, setAssigning] = useState(false);
    const [assignedProjects, setAssignedProjects] = useState([]);
    
    // Role and Responsibility State
    const [assignedRole, setAssignedRole] = useState('');
    const [assignedResponsibilities, setAssignedResponsibilities] = useState([]);
    const [roleNotes, setRoleNotes] = useState('');

    // Helper function to get responsibilities based on role
    const getResponsibilitiesForRole = (role) => {
        const roleResponsibilities = {
            'Site Supervisor': ['Day-to-day site management', 'Worker supervision', 'Safety compliance'],
            'Procurement Officer': ['Material procurement', 'Vendor management', 'Cost optimization'],
            'Construction Manager': ['Construction oversight', 'Timeline adherence', 'Quality control'],
            'Field Engineer': ['Technical implementation', 'Design adherence', 'Problem resolution'],
            'Safety Officer': ['Safety protocols enforcement', 'Incident reporting', 'Compliance'],
            'Progress Tracker': ['Work progress documentation', 'Milestone reporting', 'Photo documentation']
        };
        return roleResponsibilities[role] || [];
    };

    // Helper function to handle responsibility checkbox changes
    const handleResponsibilityChange = (responsibility) => {
        setAssignedResponsibilities(prev => {
            if (prev.includes(responsibility)) {
                return prev.filter(r => r !== responsibility);
            } else {
                return [...prev, responsibility];
            }
        });
    };

    useEffect(() => {
        fetchData();

        // Real-time subscription
        const subscription = supabase
            .channel('assign-projects-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'work_orders' }, (payload) => {
                console.log('Real-time update received:', payload);
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user?.email]);

    const fetchData = async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            console.log('=== AssignProjects: Fetching data ===');
            console.log('User Email:', user.email);
            console.log('User Role:', user.role);

            // 1. Get implementing agency ID using email-based matching
            let implementingAgencyId = null;
            let userState = null;
            let stateId = null;
            let districtId = null;

            if (user?.role === 'implementing_agency' && user?.email) {
                console.log('✅ User is an implementing agency, finding their agency...');

                // 0. Try User ID Lookup (Best Practice - matches Dashboard logic)
                const { data: userAgencies, error: userAgencyError } = await supabase
                    .from('implementing_agencies')
                    .select('id, agency_name')
                    .eq('user_id', user.id)
                    .limit(1);

                if (!userAgencyError && userAgencies && userAgencies.length > 0) {
                    implementingAgencyId = userAgencies[0].id;
                    console.log('✅ Found Agency ID via user_id:', implementingAgencyId);
                }

                // 1a. Try Hardcoded Map First (Fallback if user_id not linked)
                if (!implementingAgencyId) {
                    const emailToAgencyMap = {
                        'ngo-karnataka14@nic.in': '16078b1c-bcd2-4eaa-81da-8dbd8590166b', // NGO - Karnataka (Correct ID)
                        'nod-karnataka14@nic.in': '16078b1c-bcd2-4eaa-81da-8dbd8590166b', // Typo variant
                        'nod-karnataka63@pmajay.in': '2bfc5307-6ce5-4922-82e9-8bdc2ee17b65', // Actual NGO email
                        'tec-karnataka@nic.in': '26d31b6c-771f-4a9b-970b-da3103b83615', // TEC - Karnataka
                        'tec-karnataka42@nic.in': '26d31b6c-771f-4a9b-970b-da3103b83615', // Map 42 to 54 (where project is)
                    };

                    if (emailToAgencyMap[user.email]) {
                        implementingAgencyId = emailToAgencyMap[user.email];
                        console.log('✅ Found Agency ID from direct map:', implementingAgencyId);
                    } else {
                        // 1b. Dynamic Matching (Fallback)
                        const emailBase = user.email
                            .split('@')[0]
                            .replace(/\d+/g, '')
                            .replace(/[-_.]/g, ' ')
                            .trim()
                            .toLowerCase();

                        console.log('📧 Email base:', emailBase);

                        // Fetch all implementing agencies
                        const { data: allAgencies, error: agenciesError } = await supabase
                            .from('implementing_agencies')
                            .select('id, agency_name, state_name, state_id, district_id');

                        if (agenciesError) {
                            console.error('❌ Error fetching agencies:', agenciesError);
                        } else if (allAgencies && allAgencies.length > 0) {
                            const matchedAgency = allAgencies.find(agency => {
                                const agencyNameNormalized = agency.agency_name
                                    .toLowerCase()
                                    .replace(/[-_.]/g, ' ')
                                    .trim();

                                const agencyTokens = agencyNameNormalized.split(/\s+/).filter(t => t.length > 2);
                                const emailTokens = emailBase.split(/\s+/).filter(t => t.length > 2);

                                const matchCount = agencyTokens.filter(aToken =>
                                    emailTokens.some(eToken => eToken.includes(aToken) || aToken.includes(eToken))
                                ).length;

                                const isMatch = matchCount >= Math.ceil(agencyTokens.length / 2);

                                if (isMatch) {
                                    console.log(`  ✓ Candidate Match: "${agency.agency_name}"`);
                                }
                                return isMatch;
                            });

                            if (matchedAgency) {
                                implementingAgencyId = matchedAgency.id;
                                console.log('✅ Matched Agency Dynamically:', matchedAgency);
                            } else {
                                console.warn('⚠️ No agency matched dynamically for:', user.email);
                            }
                        }
                    }

                }

                // Fetch full agency details if we found an ID
                if (implementingAgencyId) {
                    const { data: agencyDetails } = await supabase
                        .from('implementing_agencies')
                        .select('id, state_name, state_id, district_id')
                        .eq('id', implementingAgencyId)
                        .single();

                    if (agencyDetails) {
                        userState = agencyDetails.state_name;
                        stateId = agencyDetails.state_id;
                        districtId = agencyDetails.district_id;
                    }
                }
            }

            if (!implementingAgencyId) {
                console.error('❌ Could not identify implementing agency for this user');
                setLoading(false);
                return;
            }

            console.log('✅ Implementing Agency ID:', implementingAgencyId);
            console.log('State:', userState, 'State ID:', stateId, 'District ID:', districtId);

            // 2. Fetch Projects assigned to this implementing agency (from work_orders)
            // These are projects that have NOT yet been assigned to an executing agency
            const { data: workOrdersData, error: workOrdersError } = await supabase
                .from('work_orders')
                .select('id, title, amount, location, deadline, status, proposal_id')
                .eq('implementing_agency_id', implementingAgencyId)
                .is('executing_agency_id', null) // Only unassigned projects
                .order('created_at', { ascending: false });

            if (workOrdersError) {
                console.error('Error fetching work orders:', workOrdersError);
            } else {
                console.log('Fetched Work Orders (unassigned to EA):', workOrdersData);
                setProjects(workOrdersData || []);
            }


            // 3. Fetch Executing Agencies for the State/District
            let agencyQuery = supabase
                .from('executing_agencies')
                .select('id, agency_name, state_name, district_name');

            // Filter by state name (executing_agencies table doesn't have state_id or district_id)
            if (userState) {
                agencyQuery = agencyQuery.eq('state_name', userState);
            }

            const { data: executingAgenciesData, error: executingAgenciesError } = await agencyQuery;

            if (executingAgenciesError) {
                console.error('Error fetching executing agencies:', executingAgenciesError);
            } else {
                console.log('Fetched Executing Agencies:', executingAgenciesData);
                setAgencies(executingAgenciesData || []);
            }


            // 4. Fetch already assigned projects (for display in history table)
            const { data: assignedData, error: assignedError } = await supabase
                .from('work_orders')
                .select(`
                    id, 
                    title, 
                    amount, 
                    location, 
                    deadline, 
                    status, 
                    executing_agency_id,
                    created_at
                `)
                .eq('implementing_agency_id', implementingAgencyId)
                .not('executing_agency_id', 'is', null)
                .order('created_at', { ascending: false });

            if (assignedError) {
                console.error('Error fetching assigned projects:', assignedError);
            } else {
                // Fetch executing agency names for assigned projects
                if (assignedData && assignedData.length > 0) {
                    const eaIds = [...new Set(assignedData.map(p => p.executing_agency_id).filter(Boolean))];
                    const { data: eaData } = await supabase
                        .from('executing_agencies')
                        .select('id, agency_name')
                        .in('id', eaIds);

                    const eaMap = (eaData || []).reduce((acc, ea) => {
                        acc[ea.id] = ea;
                        return acc;
                    }, {});

                    const mergedAssigned = assignedData.map(p => ({
                        ...p,
                        executing_agencies: eaMap[p.executing_agency_id] || null
                    }));

                    console.log('Assigned Projects:', mergedAssigned);
                    setAssignedProjects(mergedAssigned);
                } else {
                    setAssignedProjects([]);
                }
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedProject || !selectedAgency) {
            alert('Please select both a project and an executing agency.');
            return;
        }

        setAssigning(true);
        try {
            const { error } = await supabase
                .from('work_orders')
                .update({
                    executing_agency_id: selectedAgency,
                    status: 'Assigned to EA',
                    // Role and responsibility fields
                    assigned_user_role: assignedRole,
                    assigned_user_responsibilities: assignedResponsibilities,
                    assigned_user_notes: roleNotes
                })
                .eq('id', selectedProject);

            if (error) throw error;

            alert('Project assigned to executing agency successfully!');
            fetchData(); // Refresh lists
            setSelectedProject('');
            setSelectedAgency('');
            setAssignedRole('');
            setAssignedResponsibilities([]);
            setRoleNotes('');
        } catch (error) {
            console.error('Error assigning project:', error);
            alert('Failed to assign project: ' + error.message);
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <div className="card" style={{ padding: 20, borderRadius: '12px' }}>
                <div style={{ marginBottom: 20 }}>
                    <h2 style={{ margin: 0 }}>Assign Projects to Executing Agencies</h2>
                    <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
                        Assign projects that have been allocated to your implementing agency to executing agencies for execution.
                    </p>
                </div>

                {/* Assignment Form */}
                <div style={{ padding: 20, marginBottom: 30, backgroundColor: '#Ffffff', borderRadius: '8px', border: '1px solid #E5E7EB', maxWidth: '50%' }}>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <>
                            <div className="form-group" style={{ marginBottom: 15 }}>
                                <label className="form-label">Select Project</label>
                                <select
                                    className="form-control"
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                >
                                    <option value="">-- Select Project --</option>
                                    {projects.length > 0 ? (
                                        projects.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.title} (₹{p.amount?.toLocaleString('en-IN') || '0'})
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>No unassigned projects available</option>
                                    )}
                                </select>
                                {projects.length === 0 && !loading && (
                                    <small style={{ color: '#666', marginTop: 5, display: 'block' }}>
                                        All projects have been assigned to executing agencies or no projects are allocated to your agency yet.
                                    </small>
                                )}
                            </div>

                            <div className="form-group" style={{ marginBottom: 15 }}>
                                <label className="form-label">Select Executing Agency</label>
                                <select
                                    className="form-control"
                                    value={selectedAgency}
                                    onChange={(e) => setSelectedAgency(e.target.value)}
                                >
                                    <option value="">-- Select Agency --</option>
                                    {agencies.length > 0 ? (
                                        agencies.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.agency_name} - {a.district_name || 'N/A'}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>No executing agencies available</option>
                                    )}
                                </select>
                            </div>

                            {/* Role Selection */}
                            <div className="form-group" style={{ marginBottom: 15 }}>
                                <label className="form-label">Assigned Role</label>
                                <select
                                    className="form-control"
                                    value={assignedRole}
                                    onChange={(e) => setAssignedRole(e.target.value)}
                                >
                                    <option value="">-- Select Role --</option>
                                    <option value="Site Supervisor">Site Supervisor</option>
                                    <option value="Procurement Officer">Procurement Officer</option>
                                    <option value="Construction Manager">Construction Manager</option>
                                    <option value="Field Engineer">Field Engineer</option>
                                    <option value="Safety Officer">Safety Officer</option>
                                    <option value="Progress Tracker">Progress Tracker</option>
                                </select>
                            </div>

                            {/* Responsibilities Checkboxes */}
                            <div className="form-group" style={{ marginBottom: 15 }}>
                                <label className="form-label">Responsibilities</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {getResponsibilitiesForRole(assignedRole).map((responsibility) => (
                                        <label key={responsibility} style={{ display: 'flex', alignItems: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={assignedResponsibilities.includes(responsibility)}
                                                onChange={() => handleResponsibilityChange(responsibility)}
                                                style={{ marginRight: '8px' }}
                                            />
                                            {responsibility}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="form-group" style={{ marginBottom: 15 }}>
                                <label className="form-label">Notes</label>
                                <textarea
                                    className="form-control"
                                    value={roleNotes}
                                    onChange={(e) => setRoleNotes(e.target.value)}
                                    rows="3"
                                    placeholder="Additional notes about this assignment..."
                                />
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={handleAssign}
                                disabled={!selectedProject || !selectedAgency || assigning}
                            >
                                {assigning ? 'Assigning...' : 'Assign Project'}
                            </button>
                        </>
                    )}
                </div>

                {/* Assigned Projects History */}
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 15 }}>Assigned Projects History</h3>
                    <div className="card" style={{ borderRadius: '12px' }}>
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Project Title</th>
                                        <th>Executing Agency</th>
                                        <th>Location</th>
                                        <th>Amount</th>
                                        <th>Deadline</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Assigned On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignedProjects.length > 0 ? (
                                        assignedProjects.map((project) => (
                                            <tr key={project.id}>
                                                <td>
                                                    <div style={{ fontWeight: 'bold' }}>
                                                        {project.title || 'N/A'}
                                                    </div>
                                                    <RoleResponsibilityDisplay project={project} />
                                                </td>
                                                <td>
                                                    {project.executing_agencies?.agency_name || 'Unknown'}
                                                </td>
                                                <td>{project.location || 'N/A'}</td>
                                                <td style={{ fontWeight: '600', color: '#10B981' }}>
                                                    ₹{project.amount?.toLocaleString('en-IN') || '0'}
                                                </td>
                                                <td>
                                                    {project.deadline
                                                        ? new Date(project.deadline).toLocaleDateString('en-IN')
                                                        : 'N/A'}
                                                </td>
                                                <td>
                                                    <span className="badge badge-info">
                                                        {project.assigned_user_role || 'N/A'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${project.status === 'Completed' ? 'badge-success' :
                                                        project.status === 'In Progress' || project.status === 'Work in Progress' ? 'badge-warning' :
                                                            'badge-primary'
                                                        }`}>
                                                        {project.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {new Date(project.created_at).toLocaleDateString('en-IN')}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" style={{ textAlign: 'center', padding: 20, color: '#666' }}>
                                                No projects assigned to executing agencies yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignProjects;
