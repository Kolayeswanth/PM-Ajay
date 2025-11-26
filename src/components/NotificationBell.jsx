import React, { useState } from 'react';
import { mockNotifications } from '../data/mockData';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState(mockNotifications);

    const unreadCount = notifications.filter(n => !n.read).length;

    const getNotificationClass = (type) => {
        const classes = {
            success: 'alert-success',
            warning: 'alert-warning',
            error: 'alert-error',
            info: 'alert-info'
        };
        return classes[type] || 'alert-info';
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    return (
        <div className="notification-bell" style={{ position: 'relative' }}>
            <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
                <span className="notification-icon">🔔</span>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 'var(--space-2)',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    width: '350px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: 'var(--z-dropdown)',
                    border: '1px solid var(--border-light)'
                }}>
                    <div style={{
                        padding: 'var(--space-4)',
                        borderBottom: '1px solid var(--border-light)',
                        fontWeight: 'var(--font-semibold)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>Notifications</span>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: 'var(--text-xl)',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)'
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {notifications.length === 0 ? (
                        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No notifications
                        </div>
                    ) : (
                        <div>
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={() => markAsRead(notification.id)}
                                    style={{
                                        padding: 'var(--space-4)',
                                        borderBottom: '1px solid var(--border-light)',
                                        cursor: 'pointer',
                                        backgroundColor: notification.read ? 'transparent' : 'var(--bg-secondary)',
                                        transition: 'background-color var(--transition-base)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notification.read ? 'transparent' : 'var(--bg-secondary)'}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'start',
                                        marginBottom: 'var(--space-2)'
                                    }}>
                                        <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                                            {notification.title}
                                        </strong>
                                        {!notification.read && (
                                            <span style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--color-primary)',
                                                display: 'inline-block'
                                            }} />
                                        )}
                                    </div>
                                    <p style={{
                                        fontSize: 'var(--text-sm)',
                                        color: 'var(--text-secondary)',
                                        margin: 0,
                                        marginBottom: 'var(--space-2)'
                                    }}>
                                        {notification.message}
                                    </p>
                                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                        {notification.date}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
