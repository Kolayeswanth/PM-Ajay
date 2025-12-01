import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';

const AssignProjectsDistrict = ({ districtId, stateId }) => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);

    // Form State
    const [selectedProject, setSelectedProject] = useState('');
    const [projectFund, setProjectFund] = useState('');
    const [selectedAgency, setSelectedAgency] = useState('');
    const [deadline, setDeadline] = useState('');

    useEffect(() => {
        fetchData();
    }, [user?.id, districtId, stateId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Approved Proposals (State Approved)
            // We fetch from district_proposals where status is APPROVED_BY_STATE
            let query = supabase
                .from('district_proposals')
                .select('id, project_name, estimated_cost, status')
                .eq('status', 'APPROVED_BY_STATE');

            // If districtId is provided, filter by it. 
            if (districtId) {
                query = query.eq('district_id', districtId);
            }

            const { data: proposalsData, error: proposalsError } = await query;

            if (proposalsError) throw proposalsError;
            if (proposalsData) setProjects(proposalsData);

            // 2. Fetch Implementing Agencies
            if (districtId) {
                let agencyQuery = supabase
                    .from('implementing_agencies')
                    .select('id, agency_name, district_id, state_id');

                console.log('Fetching agencies for districtId:', districtId, 'stateId:', stateId);

                // Filter by district OR state
                if (stateId) {
                    // Show agencies assigned to this district OR assigned to the state
                    // Syntax: district_id.eq.X,state_id.eq.Y
                    agencyQuery = agencyQuery.or(`district_id.eq.${districtId},state_id.eq.${stateId}`);
                } else {
                    agencyQuery = agencyQuery.eq('district_id', districtId);
                }

                const { data: agencyData, error: agencyError } = await agencyQuery;

                if (agencyError) {
                    console.error('Error fetching agencies:', agencyError);
                } else {
                    console.log('Fetched Agencies:', agencyData);
                    setAgencies(agencyData);
                }
            } else {
                console.log('District ID not yet available, skipping agency fetch.');
                setAgencies([]);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedProject || !selectedAgency || !projectFund || !deadline) {
            alert('Please fill all fields.');
            return;
        }

        setAssigning(true);
        try {
            // Find the selected project details
            // Use loose equality (==) because selectedProject is a string from the select input, and p.id is a number
            const projectDetails = projects.find(p => p.id == selectedProject);
            if (!projectDetails) throw new Error("Project details not found");

            // 1. Create Work Order
            const { error: workOrderError } = await supabase
                .from('work_orders')
                .insert([
                    {
                        proposal_id: selectedProject,
                        title: projectDetails.project_name,
                        amount: projectFund, // Assigned fund amount (standard column)
                        project_fund: projectFund, // Specific column for project fund
                        implementing_agency_id: selectedAgency,
                        deadline: deadline,
                        status: 'Assigned to IA'
                    }
                ]);

            if (workOrderError) throw workOrderError;

            // 2. Update Proposal Status to 'ASSIGNED' (to prevent re-assignment)
            const { error: updateError } = await supabase
                .from('district_proposals')
                .update({ status: 'ASSIGNED' })
                .eq('id', selectedProject);

            if (updateError) {
                console.error("Warning: Failed to update proposal status", updateError);
            }

            alert('Project assigned successfully!');

            // Reset form
            setSelectedProject('');
            setProjectFund('');
            setSelectedAgency('');
            setDeadline('');

            // Refresh list
            fetchData();

        } catch (error) {
            console.error('Error assigning project:', error);
            alert('Failed to assign project: ' + error.message);
        } finally {
            setAssigning(false);
        }
    };

    // Auto-fill fund if project selected
    useEffect(() => {
        console.log('Selected Project ID:', selectedProject);
        console.log('Projects available:', projects);

        if (selectedProject) {
            // Use loose equality (==) to handle string/number mismatch
            const proj = projects.find(p => p.id == selectedProject);
            console.log('Found Project:', proj);

            if (proj && proj.estimated_cost) {
                setProjectFund(proj.estimated_cost); // Pre-fill with estimated cost
            }
        }
    }, [selectedProject, projects]);

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <h2 style={{ marginBottom: 20 }}>Assign Projects to Implementing Agency</h2>

            <div className="card" style={{ padding: 20, maxWidth: 600 }}>
                {loading ? <p>Loading...</p> : (
                    <>
                        <div className="form-group" style={{ marginBottom: 15 }}>
                            <label className="form-label">Select Project (Approved Proposals)</label>
                            <select
                                className="form-control"
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                            >
                                <option value="">-- Select Project --</option>
                                {projects.length > 0 ? (
                                    projects.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.project_name} (Est: ₹{p.estimated_cost})
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>No approved projects found</option>
                                )}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 15 }}>
                            <label className="form-label">Project Fund (₹)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={projectFund}
                                onChange={(e) => setProjectFund(e.target.value)}
                                placeholder="Enter Amount"
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 15 }}>
                            <label className="form-label">Select Implementing Agency</label>
                            <select
                                className="form-control"
                                value={selectedAgency}
                                onChange={(e) => setSelectedAgency(e.target.value)}
                            >
                                <option value="">-- Select Agency --</option>
                                {agencies.map(a => (
                                    <option key={a.id} value={a.id}>{a.agency_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 15 }}>
                            <label className="form-label">Deadline</label>
                            <input
                                type="date"
                                className="form-control"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                            />
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={handleAssign}
                            disabled={assigning}
                        >
                            {assigning ? 'Assigning...' : 'Assign Project'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default AssignProjectsDistrict;
