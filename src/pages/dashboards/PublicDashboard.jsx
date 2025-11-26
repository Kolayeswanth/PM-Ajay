import React, { useState } from 'react';
import PublicSidebar from './public/PublicSidebar';
import PublicHome from './public/PublicHome';
import PublicAllProjects from './public/PublicAllProjects';
import PublicComplaint from './public/PublicComplaint';

const PublicDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <PublicHome />;
            case 'projects':
                return <PublicAllProjects />;
            case 'complaint':
                return <PublicComplaint />;
            default:
                return <PublicHome />;
        }
    };

    return (
        <div className="dashboard-layout">
            <PublicSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="dashboard-main" style={{ marginLeft: '260px' }}>
                {renderContent()}
            </div>
        </div>
    );
};

export default PublicDashboard;
