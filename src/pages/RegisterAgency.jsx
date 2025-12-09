import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { indiaHierarchy } from '../data/indiaHierarchy';
import './RegisterAgency.css';

const RegisterAgency = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        agencyName: '',
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        gstNumber: '',
        state: '',
        districts: []
    });
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'state') {
            const selectedStateData = indiaHierarchy.find(s => s.name === value);
            setAvailableDistricts(selectedStateData ? selectedStateData.districts : []);
            setFormData(prev => ({ ...prev, districts: [] })); // Reset districts
        }
    };

    const handleDistrictChange = (districtName) => {
        setFormData(prev => {
            const currentDistricts = prev.districts;
            if (currentDistricts.includes(districtName)) {
                return { ...prev, districts: currentDistricts.filter(d => d !== districtName) };
            } else {
                return { ...prev, districts: [...currentDistricts, districtName] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('=== REGISTRATION ATTEMPT ===');

            // Basic Validation
            if (formData.password !== formData.confirmPassword) {
                throw new Error('Passwords do not match');
            }
            if (formData.password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }
            if (formData.districts.length === 0) {
                throw new Error('Please select at least one district');
            }

            // Prepare payload (exclude confirmPassword)
            const payload = {
                agencyName: formData.agencyName,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                password: formData.password,
                gstNumber: formData.gstNumber,
                state: formData.state,
                districts: formData.districts
            };

            // Call backend API
            // Using absolute URL as seen in user attempts, but valid relative path is better if proxy exists.
            // Falling back to localhost port 5001 based on context.
            const response = await fetch('http://localhost:5001/api/implementing-agencies/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Registration failed');
            }

            console.log('✅ Registration successful:', result);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            console.error('❌ REGISTRATION ERROR:', err);
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="register-agency-container">
                <div className="success-message-card">
                    <div className="success-icon" style={{ fontSize: '4rem', color: 'green', display: 'flex', justifyContent: 'center' }}>✓</div>
                    <h2 style={{ textAlign: 'center' }}>Registration Successful!</h2>
                    <p style={{ textAlign: 'center' }}>Your agency registration has been submitted for approval.</p>
                    <p style={{ textAlign: 'center' }}>You will receive an email once your application is reviewed by the Ministry/State Admin.</p>
                    <p style={{ marginTop: '20px', color: '#64748b', textAlign: 'center' }}>Redirecting to login page...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="login-page">
                <div className="login-card" style={{ maxWidth: '600px' }}>
                    <div className="login-header">
                        <img
                            src="/logos/emblem.png"
                            alt="PM-AJAY"
                            className="login-logo"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZWRlZGVkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGR5PSIuM2VtIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzU1NSI+UE0tQUpBWTwvdGV4dD48L3N2Zz4=';
                            }}
                        />
                        <h1 className="login-title">Agency Registration</h1>
                        <p className="login-subtitle">PM-AJAY Portal</p>
                    </div>

                    {error && <div className="alert alert-error" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '0.5rem' }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Agency Name *</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter agency name"
                                name="agencyName"
                                value={formData.agencyName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number *</label>
                            <input
                                type="tel"
                                className="form-control"
                                placeholder="Enter phone number"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                                pattern="[0-9]{10}"
                                title="Please enter a valid 10-digit phone number"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address *</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Enter email address"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">GST Number *</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter GST Number"
                                name="gstNumber"
                                value={formData.gstNumber}
                                onChange={handleChange}
                                required
                                style={{ textTransform: 'uppercase' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password *</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Create a password (min 6 chars)"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="6"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password *</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Re-enter password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                minLength="6"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">State *</label>
                            <select
                                className="form-select form-control"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select State</option>
                                {indiaHierarchy.map(state => (
                                    <option key={state.id} value={state.name}>{state.name}</option>
                                ))}
                            </select>
                        </div>

                        {formData.state && (
                            <div className="form-group">
                                <label className="form-label">Select Districts (Available for Work) *</label>
                                <div style={{
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    border: '1px solid var(--border-medium)',
                                    padding: '10px',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: 'var(--bg-secondary)'
                                }}>
                                    {availableDistricts.length > 0 ? (
                                        availableDistricts.map(district => (
                                            <div key={district.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                <input
                                                    type="checkbox"
                                                    id={`district-${district.id}`}
                                                    checked={formData.districts.includes(district.name)}
                                                    onChange={() => handleDistrictChange(district.name)}
                                                    style={{ marginRight: '8px', width: 'auto' }}
                                                />
                                                <label htmlFor={`district-${district.id}`} style={{ cursor: 'pointer', fontSize: '14px', margin: 0 }}>
                                                    {district.name}
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>No districts available</p>
                                    )}
                                </div>
                                <small style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    Selected: {formData.districts.length} districts
                                </small>
                            </div>
                        )}

                        <div className="form-actions" style={{ marginTop: '20px' }}>
                            <button
                                type="submit"
                                className="btn btn-primary login-button"
                                style={{
                                    width: '100%',
                                    marginTop: 'var(--space-4)',
                                    borderRadius: '50px',
                                    transition: 'all 0.3s ease'
                                }}
                                disabled={loading}
                            >
                                {loading ? 'Registering...' : 'Register Agency'}
                            </button>
                        </div>

                        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)' }}>Login here</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default RegisterAgency;
