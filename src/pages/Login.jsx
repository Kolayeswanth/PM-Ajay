import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../contexts/AuthContext';

const Login = () => {
    const [selectedRole, setSelectedRole] = useState('ministry');
    const navigate = useNavigate();
    const { login } = useAuth();

    const roles = [
        { value: 'ministry', label: 'Ministry Admin (MoSJE)', icon: '🏛️' },
        { value: 'state', label: 'State Admin (SSWD)', icon: '🏢' },
        { value: 'district', label: 'District Admin', icon: '🏘️' },
        { value: 'gp', label: 'Gram Panchayat Officer', icon: '🏡' },
        { value: 'department', label: 'Implementing Department', icon: '🏗️' },
        { value: 'contractor', label: 'Executing Agency/Contractor', icon: '👷' },
        { value: 'public', label: 'Public/Beneficiary', icon: '👤' }
    ];

    const handleLogin = (e) => {
        e.preventDefault();
        const user = login({ role: selectedRole });
        navigate('/dashboard');
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <img src="/logos/pmajay.png" alt="PM-AJAY" className="login-logo" />
                    <h1 className="login-title">PM-AJAY Portal</h1>
                    <p className="login-subtitle">Ministry of Social Justice & Empowerment</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label required">Select Your Role</label>
                        <select
                            className="form-control form-select"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            required
                        >
                            {roles.map(role => (
                                <option key={role.value} value={role.value}>
                                    {role.icon} {role.label}
                                </option>
                            ))}
                        </select>
                        <p className="form-helper">
                            This is a demonstration portal. Select your role to access the respective dashboard.
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email / Username</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter your email or username"
                            defaultValue="demo@pmajay.gov.in"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter your password"
                            defaultValue="PMajay@2024#Demo"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-4)' }}>
                        Login to Dashboard
                    </button>
                </form>

                <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        <a href="#" style={{ color: 'var(--color-primary)' }}>Forgot Password?</a>
                    </p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                        Don't have an account? <a href="#" style={{ color: 'var(--color-primary)' }}>Contact Admin</a>
                    </p>
                </div>

                <div className="alert alert-info" style={{ marginTop: 'var(--space-6)' }}>
                    <strong>🔒 Security Notice:</strong> This portal uses government-grade encryption and authentication.
                    All activities are logged for audit purposes.
                </div>
            </div>
        </div>
    );
};

export default Login;
