import React from 'react';
import { NavLink } from 'react-router-dom';

const DashboardSidebar = ({ menuItems }) => {
    return (
        <aside className="dashboard-sidebar">
            <nav>
                <ul className="dashboard-sidebar-nav">
                    {menuItems.map((item, index) => (
                        <li key={index} className="dashboard-sidebar-item">
                            {item.action ? (
                                <button
                                    onClick={item.action}
                                    className={`dashboard-sidebar-link ${item.active ? 'active' : ''}`}
                                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                                >
                                    <span className="dashboard-sidebar-icon">{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            ) : (
                                <NavLink
                                    to={item.path || '#'}
                                    className={({ isActive }) =>
                                        `dashboard-sidebar-link ${isActive && item.path !== '#' ? 'active' : ''}`
                                    }
                                >
                                    <span className="dashboard-sidebar-icon">{item.icon}</span>
                                    <span>{item.label}</span>
                                </NavLink>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default DashboardSidebar;
