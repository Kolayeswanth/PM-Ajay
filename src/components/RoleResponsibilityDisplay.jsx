import React from 'react';

const RoleResponsibilityDisplay = ({ project }) => {
  if (!project) return null;

  return (
    <div style={{ 
      border: '1px solid #e5e7eb', 
      borderRadius: '8px', 
      padding: '16px', 
      backgroundColor: '#f9fafb',
      marginTop: '12px'
    }}>
      {project.assigned_user_role && (
        <div style={{ marginBottom: '12px' }}>
          <strong>Role:</strong>{' '}
          <span className="badge badge-info" style={{ marginLeft: '8px' }}>
            {project.assigned_user_role}
          </span>
        </div>
      )}
      
      {project.assigned_user_responsibilities && project.assigned_user_responsibilities.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <strong>Responsibilities:</strong>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px', 
            marginTop: '6px' 
          }}>
            {project.assigned_user_responsibilities.map((resp, index) => (
              <span 
                key={index} 
                className="badge badge-secondary" 
                style={{ fontSize: '12px' }}
              >
                {resp}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {project.assigned_user_notes && (
        <div>
          <strong>Notes:</strong>
          <p style={{ 
            margin: '6px 0 0 0', 
            padding: '8px', 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            {project.assigned_user_notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default RoleResponsibilityDisplay;