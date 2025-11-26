import React from 'react';

const Communication = () => {
    return (
        <div className="dashboard-panel">
            <div className="communication-panel">
                <h3 style={{ marginBottom: 'var(--space-4)' }}>Communication with District Admin</h3>

                <div className="message-list">
                    <div className="message-item">
                        <div className="message-avatar">DA</div>
                        <div className="message-content">
                            <div className="message-header">
                                <span className="message-sender">District Admin</span>
                                <span className="message-time">2 hours ago</span>
                            </div>
                            <p className="message-text">
                                Your proposal for Community Hall has been approved. Please proceed with the survey.
                            </p>
                        </div>
                    </div>

                    <div className="message-item">
                        <div className="message-avatar">GP</div>
                        <div className="message-content">
                            <div className="message-header">
                                <span className="message-sender">You</span>
                                <span className="message-time">1 day ago</span>
                            </div>
                            <p className="message-text">
                                Submitted proposal for Community Hall construction. Estimated cost: ₹50 Lakhs.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <textarea className="form-control" rows="3" placeholder="Type your message..."></textarea>
                </div>
                <button className="btn btn-primary">Send Message</button>
            </div>
        </div>
    );
};

export default Communication;
