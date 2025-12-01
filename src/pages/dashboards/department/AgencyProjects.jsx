import React from 'react';

const AgencyProjects = ({ projects }) => {
    return (
        <div className="dashboard-panel" style={{ padding: 20 }}>
            <h2 style={{ marginBottom: 20 }}>Assigned Projects</h2>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Project Title</th>
                            <th>Location</th>
                            <th>Project Fund</th>
                            <th>Deadline</th>
                            <th>Status</th>
                            <th>Assigned On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.length > 0 ? (
                            projects.map((project) => (
                                <tr key={project.id}>
                                    <td>
                                        <div style={{ fontWeight: 'bold' }}>{project.title}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>ID: {project.id}</div>
                                    </td>
                                    <td>{project.location || 'N/A'}</td>
                                    <td>₹{project.amount}</td>
                                    <td>{project.deadline || 'N/A'}</td>
                                    <td>
                                        <span className={`badge ${project.status === 'Completed' ? 'badge-success' : 'badge-primary'}`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td>{new Date(project.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: 20 }}>
                                    No projects assigned yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AgencyProjects;
