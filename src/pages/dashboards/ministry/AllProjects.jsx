import React, { useState, useEffect } from 'react';
import InteractiveButton from '../../../components/InteractiveButton';
import ChatInterface from '../../../components/ChatInterface';
import { Eye, Download, FileText, MapPin, Phone, MessageCircle } from 'lucide-react';

const AllProjects = ({ showChat = false }) => {
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [selectedState, setSelectedState] = useState('all');
    const [selectedComponent, setSelectedComponent] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [allStates, setAllStates] = useState([]);
    const [isChatOpen, setIsChatOpen] = useState(showChat);
    const [chatRecipients, setChatRecipients] = useState([]);

    // Fetch all states from backend
    useEffect(() => {
        fetchAllStates();
    }, []);

    const fetchAllStates = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/states?select=name&order=name.asc`, {
                headers: {
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                }
            });
            const data = await response.json();
            if (data) {
                setAllStates(data.map(s => s.name));
            }
        } catch (error) {
            console.error('Error fetching states:', error);
        }
    };

    // Fetch all projects from backend
    useEffect(() => {
        fetchAllProjects();
    }, []);

    const fetchAllProjects = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5001/api/proposals/all');
            const result = await response.json();

            if (result.success) {
                setProjects(result.data);
                setFilteredProjects(result.data);
            } else {
                showToast('Error fetching projects', 'error');
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            showToast('Failed to load projects', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Apply filters
    useEffect(() => {
        let filtered = projects;

        if (selectedState !== 'all') {
            filtered = filtered.filter(p => p.state_name === selectedState);
        }

        if (selectedComponent !== 'all') {
            filtered = filtered.filter(p => p.component === selectedComponent);
        }

        if (selectedStatus !== 'all') {
            if (selectedStatus === 'Approved') {
                filtered = filtered.filter(p =>
                    p.status === 'APPROVED_BY_STATE' || p.status === 'APPROVED_BY_MINISTRY'
                );
            } else if (selectedStatus === 'Disapproved') {
                filtered = filtered.filter(p =>
                    p.status === 'REJECTED_BY_STATE' || p.status === 'REJECTED_BY_MINISTRY'
                );
            }
        }

        setFilteredProjects(filtered);

        // Extract unique states from filtered projects for chat recipients
        const uniqueStates = [...new Set(filtered.map(p => p.state_name))].filter(Boolean);
        setChatRecipients(uniqueStates);
    }, [selectedState, selectedComponent, selectedStatus, projects]);

    // Predefined complete lists for filters
    const allComponents = ['Adarsh Gram', 'GIA', 'Hostel'];
    const allStatuses = ['Approved', 'Disapproved'];

    const getStatusBadge = (status) => {
        const statusColors = {
            'SUBMITTED': { bg: '#E0E7FF', text: '#4338CA' },
            'APPROVED_BY_STATE': { bg: '#FEF3C7', text: '#D97706' },
            'APPROVED_BY_MINISTRY': { bg: '#D1FAE5', text: '#059669' },
            'REJECTED_BY_STATE': { bg: '#FEE2E2', text: '#DC2626' },
            'REJECTED_BY_MINISTRY': { bg: '#FEE2E2', text: '#DC2626' },
        };
        const colors = statusColors[status] || { bg: '#F3F4F6', text: '#6B7280' };
        return (
            <span style={{
                backgroundColor: colors.bg,
                color: colors.text,
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase'
            }}>
                {status?.replace(/_/g, ' ')}
            </span>
        );
    };

    const handleViewProject = (project) => {
        // Open project details in new window
        const printWindow = window.open('', '_blank');
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Project - ${project.project_name}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                    .header { text-align: center; border-bottom: 3px solid #7C3AED; padding-bottom: 20px; margin-bottom: 30px; }
                    h1 { color: #2c3e50; margin: 0; }
                    .section { margin-bottom: 25px; }
                    .info-row { display: flex; margin-bottom: 10px; }
                    .info-label { font-weight: bold; width: 200px; color: #555; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Project Details</h1>
                    <div style="color: #666; margin-top: 5px;">${project.state_name} - ${project.district_name}</div>
                </div>
                <div class="section">
                    <div class="info-row"><div class="info-label">Project Name:</div><div>${project.project_name}</div></div>
                    <div class="info-row"><div class="info-label">Component:</div><div>${project.component}</div></div>
                    <div class="info-row"><div class="info-label">Estimated Cost:</div><div>₹${project.estimated_cost} Lakhs</div></div>
                    <div class="info-row"><div class="info-label">Status:</div><div>${project.status}</div></div>
                    <div class="info-row"><div class="info-label">Submission Date:</div><div>${new Date(project.created_at).toLocaleDateString()}</div></div>
                </div>
                <div class="section">
                    <h3>Description</h3>
                    <p>${project.description || 'No description provided.'}</p>
                </div>
            </body>
            </html>
        `;
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    const handleExportData = () => {
        // Export filtered projects to CSV
        const headers = ['State', 'District', 'Project Name', 'Component', 'Cost (Lakhs)', 'Status', 'Date'];
        const csvContent = [
            headers.join(','),
            ...filteredProjects.map(p => [
                p.state_name,
                p.district_name,
                `"${p.project_name}"`,
                p.component,
                p.estimated_cost,
                p.status,
                new Date(p.created_at).toLocaleDateString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `All_Projects_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        import React, { useState, useEffect } from 'react';
        import InteractiveButton from '../../../components/InteractiveButton';
        import ChatInterface from '../../../components/ChatInterface';
        import { Eye, Download, FileText, MapPin, Phone, MessageCircle } from 'lucide-react';

        const AllProjects = ({ showChat = false }) => {
            const [projects, setProjects] = useState([]);
            const [filteredProjects, setFilteredProjects] = useState([]);
            const [selectedState, setSelectedState] = useState('all');
            const [selectedComponent, setSelectedComponent] = useState('all');
            const [selectedStatus, setSelectedStatus] = useState('all');
            const [loading, setLoading] = useState(false);
            const [toast, setToast] = useState(null);
            const [allStates, setAllStates] = useState([]);
            const [isChatOpen, setIsChatOpen] = useState(showChat);
            const [chatRecipients, setChatRecipients] = useState([]);

            // Fetch all states from backend
            useEffect(() => {
                fetchAllStates();
            }, []);

            const fetchAllStates = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/states?select=name&order=name.asc`, {
                        headers: {
                            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                        }
                    });
                    const data = await response.json();
                    if (data) {
                        setAllStates(data.map(s => s.name));
                    }
                } catch (error) {
                    console.error('Error fetching states:', error);
                }
            };

            // Fetch all projects from backend
            useEffect(() => {
                fetchAllProjects();
            }, []);

            const fetchAllProjects = async () => {
                try {
                    setLoading(true);
                    const response = await fetch('http://localhost:5001/api/proposals/all');
                    const result = await response.json();

                    if (result.success) {
                        setProjects(result.data);
                        setFilteredProjects(result.data);
                    } else {
                        showToast('Error fetching projects', 'error');
                    }
                } catch (error) {
                    console.error('Error fetching projects:', error);
                    showToast('Failed to load projects', 'error');
                } finally {
                    setLoading(false);
                }
            };

            const showToast = (message, type = 'success') => {
                setToast({ message, type });
                setTimeout(() => setToast(null), 3000);
            };

            // Apply filters
            useEffect(() => {
                let filtered = projects;

                if (selectedState !== 'all') {
                    filtered = filtered.filter(p => p.state_name === selectedState);
                }

                if (selectedComponent !== 'all') {
                    filtered = filtered.filter(p => p.component === selectedComponent);
                }

                if (selectedStatus !== 'all') {
                    if (selectedStatus === 'Approved') {
                        filtered = filtered.filter(p =>
                            p.status === 'APPROVED_BY_STATE' || p.status === 'APPROVED_BY_MINISTRY'
                        );
                    } else if (selectedStatus === 'Disapproved') {
                        filtered = filtered.filter(p =>
                            p.status === 'REJECTED_BY_STATE' || p.status === 'REJECTED_BY_MINISTRY'
                        );
                    }
                }

                setFilteredProjects(filtered);

                // Extract unique states from filtered projects for chat recipients
                const uniqueStates = [...new Set(filtered.map(p => p.state_name))].filter(Boolean);
                setChatRecipients(uniqueStates);
            }, [selectedState, selectedComponent, selectedStatus, projects]);

            // Predefined complete lists for filters
            const allComponents = ['Adarsh Gram', 'GIA', 'Hostel'];
            const allStatuses = ['Approved', 'Disapproved'];

            const getStatusBadge = (status) => {
                const statusColors = {
                    'SUBMITTED': { bg: '#E0E7FF', text: '#4338CA' },
                    'APPROVED_BY_STATE': { bg: '#FEF3C7', text: '#D97706' },
                    'APPROVED_BY_MINISTRY': { bg: '#D1FAE5', text: '#059669' },
                    'REJECTED_BY_STATE': { bg: '#FEE2E2', text: '#DC2626' },
                    'REJECTED_BY_MINISTRY': { bg: '#FEE2E2', text: '#DC2626' },
                };
                const colors = statusColors[status] || { bg: '#F3F4F6', text: '#6B7280' };
                return (
                    <span style={{
                        backgroundColor: colors.bg,
                        color: colors.text,
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                    }}>
                        {status?.replace(/_/g, ' ')}
                    </span>
                );
            };

            const handleViewProject = (project) => {
                // Open project details in new window
                const printWindow = window.open('', '_blank');
                const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Project - ${project.project_name}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                    .header { text-align: center; border-bottom: 3px solid #7C3AED; padding-bottom: 20px; margin-bottom: 30px; }
                    h1 { color: #2c3e50; margin: 0; }
                    .section { margin-bottom: 25px; }
                    .info-row { display: flex; margin-bottom: 10px; }
                    .info-label { font-weight: bold; width: 200px; color: #555; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Project Details</h1>
                    <div style="color: #666; margin-top: 5px;">${project.state_name} - ${project.district_name}</div>
                </div>
                <div class="section">
                    <div class="info-row"><div class="info-label">Project Name:</div><div>${project.project_name}</div></div>
                    <div class="info-row"><div class="info-label">Component:</div><div>${project.component}</div></div>
                    <div class="info-row"><div class="info-label">Estimated Cost:</div><div>₹${project.estimated_cost} Lakhs</div></div>
                    <div class="info-row"><div class="info-label">Status:</div><div>${project.status}</div></div>
                    <div class="info-row"><div class="info-label">Submission Date:</div><div>${new Date(project.created_at).toLocaleDateString()}</div></div>
                </div>
                <div class="section">
                    <h3>Description</h3>
                    <p>${project.description || 'No description provided.'}</p>
                </div>
            </body>
            </html>
        `;
                printWindow.document.write(htmlContent);
                printWindow.document.close();
            };

            const handleExportData = () => {
                // Export filtered projects to CSV
                const headers = ['State', 'District', 'Project Name', 'Component', 'Cost (Lakhs)', 'Status', 'Date'];
                const csvContent = [
                    headers.join(','),
                    ...filteredProjects.map(p => [
                        p.state_name,
                        p.district_name,
                        `"${p.project_name}"`,
                        p.component,
                        p.estimated_cost,
                        p.status,
                        new Date(p.created_at).toLocaleDateString()
                    ].join(','))
                ].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `All_Projects_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

            return (
                <div style={{ display: 'flex', height: '100%', width: '100%' }}>
                    {/* Left Side - Projects List */}
                    <div className="dashboard-panel" style={{
                        padding: 20,
                        height: '100%',
                        overflowY: 'auto',
                        flex: isChatOpen ? '0 0 70%' : '1',
                        transition: 'flex 0.3s ease',
                        borderRight: isChatOpen ? '1px solid #e0e0e0' : 'none'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ margin: 0, color: '#2c3e50' }}>
                                <FileText size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                                All Projects
                            </h2>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <button
                                    onClick={() => setIsChatOpen(!isChatOpen)}
                                    style={{
                                        backgroundColor: isChatOpen ? '#20BA5A' : '#25D366',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
                                        transition: 'all 0.3s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.02)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    <MessageCircle size={18} />
                                    {isChatOpen ? 'Hide Chat' : 'Open Chat'}
                                    {chatRecipients.length > 0 && (
                                        <span style={{
                                            backgroundColor: '#DC2626',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '20px',
                                            height: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '11px',
                                            fontWeight: 'bold'
                                        }}>
                                            {chatRecipients.length}
                                        </span>
                                    )}
                                </button>
                                <InteractiveButton variant="secondary" size="sm" onClick={handleExportData}>
                                    <Download size={16} style={{ marginRight: 5 }} /> Export Data
                                </InteractiveButton>
                            </div>
                        </div>

                        {/* Filters */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                            <select
                                value={selectedState}
                                onChange={(e) => setSelectedState(e.target.value)}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    minWidth: '180px'
                                }}
                            >
                                <option value="all">All States</option>
                                {allStates.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>

                            <select
                                value={selectedComponent}
                                onChange={(e) => setSelectedComponent(e.target.value)}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    minWidth: '180px'
                                }}
                            >
                                <option value="all">All Components</option>
                                {allComponents.map(component => (
                                    <option key={component} value={component}>{component}</option>
                                ))}
                            </select>

                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    minWidth: '180px'
                                }}
                            >
                                <option value="all">All Statuses</option>
                                {allStatuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        {/* Summary Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: isChatOpen ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '16px', marginBottom: 20 }}>
                            <div style={{ backgroundColor: '#E0E7FF', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #4338CA' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4338CA' }}>{filteredProjects.length}</div>
                                <div style={{ fontSize: '14px', color: '#6B7280' }}>Total Projects</div>
                            </div>
                            <div style={{ backgroundColor: '#D1FAE5', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #059669' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                                    {filteredProjects.filter(p => p.status === 'APPROVED_BY_MINISTRY' || p.status === 'APPROVED_BY_STATE').length}
                                </div>
                                <div style={{ fontSize: '14px', color: '#6B7280' }}>Approved</div>
                            </div>
                            <div style={{ backgroundColor: '#FEE2E2', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #DC2626' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#DC2626' }}>
                                    {filteredProjects.filter(p => p.status === 'REJECTED_BY_STATE' || p.status === 'REJECTED_BY_MINISTRY').length}
                                </div>
                                <div style={{ fontSize: '14px', color: '#6B7280' }}>Disapproved</div>
                            </div>
                            <div style={{ backgroundColor: '#DBEAFE', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #2563EB' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563EB' }}>
                                    ₹{filteredProjects.reduce((sum, p) => sum + parseFloat(p.estimated_cost || 0), 0).toFixed(2)}
                                </div>
                                <div style={{ fontSize: '14px', color: '#6B7280' }}>Total Cost (Lakhs)</div>
                            </div>
                        </div>

                        {toast && (
                            <div style={{ marginBottom: 12 }}>
                                <div style={{
                                    display: 'inline-block',
                                    background: toast.type === 'error' ? '#E74C3C' : '#00B894',
                                    color: '#fff',
                                    padding: '8px 12px',
                                    borderRadius: 6
                                }}>
                                    {toast.message}
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>
                                Loading projects...
                            </div>
                        )}

                        {/* Projects Table */}
                        <div className="table-wrapper" style={{ marginBottom: 16, overflowX: 'auto' }}>
                            <table className="table" style={{ minWidth: isChatOpen ? 800 : 1000 }}>
                                <thead>
                                    <tr>
                                        <th>State / District</th>
                                        <th>Project</th>
                                        <th>Component</th>
                                        <th>Cost</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProjects.length > 0 ? (
                                        filteredProjects.map(project => (
                                            <tr key={project.id}>
                                                <td>
                                                    <div style={{ fontWeight: 'bold', color: '#000', fontSize: '14px' }}>
                                                        <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                                        {project.state_name}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#888' }}>{project.district_name}</div>
                                                </td>
                                                <td style={{ fontSize: '14px', color: '#333', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {project.project_name}
                                                </td>
                                                <td>
                                                    <span style={{
                                                        background: '#e3f2fd',
                                                        color: '#1976d2',
                                                        padding: '4px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '11px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {project.component}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 'bold', color: '#333' }}>₹{project.estimated_cost}L</td>
                                                <td>{getStatusBadge(project.status)}</td>
                                                <td>
                                                    <InteractiveButton
                                                        variant="info"
                                                        size="sm"
                                                        onClick={() => handleViewProject(project)}
                                                    >
                                                        <Eye size={14} /> View
                                                    </InteractiveButton>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: 30, color: '#888' }}>
                                                No projects found with the selected filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right Side - Chat Interface */}
                    {isChatOpen && (
                        <div style={{
                            flex: '0 0 30%',
                            height: '100%',
                            backgroundColor: '#fff',
                            display: 'flex',
                            flexDirection: 'column',
                            borderLeft: '1px solid #e0e0e0'
                        }}>
                            <ChatInterface
                                isOpen={true}
                                onClose={() => setIsChatOpen(false)}
                                context={{
                                    state: selectedState,
                                    component: selectedComponent,
                                    status: selectedStatus
                                }}
                                recipients={chatRecipients}
                                onSendMessage={(message, recipients) => {
                                    console.log('Message sent:', message);
                                    console.log('Recipients:', recipients);
                                    showToast(`Message sent to ${recipients.length} state${recipients.length !== 1 ? 's' : ''}!`, 'success');
                                }}
                                embedded={true}
                            />
                        </div>
                    )}
                </div>
            );
        };

        export default AllProjects;
