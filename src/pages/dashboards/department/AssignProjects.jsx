import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';

const AssignProjects = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedAgency, setSelectedAgency] = useState('');
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        fetchData();
    }, [user?.id]);

    const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            // 1. Fetch User's State
            const { data: userData } = await supabase
                .from('implementing_agencies')
                .select('state_name')
                .eq('user_id', user.id)
                .single();

            const userState = userData?.state_name;

            // 2. Fetch Unassigned Projects (Mock logic for now, or fetch from 'works' table if available)
            // For now, let's fetch from 'works' table where agency_id is null
            const { data: worksData, error: worksError } = await supabase
                .from('works')
                .select('*')
                .is('executing_agency_id', null); // Assuming this column exists or similar logic

            if (worksData) setProjects(worksData);

            // 3. Fetch Executing Agencies for the State
            if (userState) {
                const { data: agencyData } = await supabase
                    .from('executing_agencies')
                    .select('id, agency_name')
                    .eq('state_name', userState);

                if (agencyData) setAgencies(agencyData);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedProject || !selectedAgency) return;
        setAssigning(true);
        try {
            const { error } = await supabase
                .from('works')
                .update({ executing_agency_id: selectedAgency })
                .eq('id', selectedProject);

            if (error) throw error;

            alert('Project assigned successfully!');
            fetchData(); // Refresh list
            setSelectedProject('');
            setSelectedAgency('');
        } catch (error) {
            console.error('Error assigning project:', error);
            alert('Failed to assign project.');
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <h2 style={{ marginBottom: 20 }}>Assign Projects</h2>

            <div className="card" style={{ padding: 20, maxWidth: 600 }}>
                <div className="form-group" style={{ marginBottom: 15 }}>
                    <label className="form-label">Select Project</label>
                    <select
                        className="form-control"
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                    >
                        <option value="">-- Select Project --</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.work_name || p.title}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group" style={{ marginBottom: 15 }}>
                    <label className="form-label">Select Executing Agency</label>
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

                <button
                    className="btn btn-primary"
                    onClick={handleAssign}
                    disabled={!selectedProject || !selectedAgency || assigning}
                >
                    {assigning ? 'Assigning...' : 'Assign Project'}
                </button>
            </div>
        </div>
    );
};

export default AssignProjects;
