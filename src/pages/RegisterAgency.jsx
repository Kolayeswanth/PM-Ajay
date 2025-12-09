
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { indiaHierarchy } from '../data/indiaHierarchy';
=======
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterAgency.css';

const RegisterAgency = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        agencyName: '',

        phoneNumber: '',
        email: '',
        password: '',
        gstNumber: '',
        state: '',
        districts: []
    });
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
=======
        agencyType: '',
        registrationNo: '',
        address: '',
        contactNumber: '',
        email: '',
        stateName: '',
        districtName: '',
        password: '',
        confirmPassword: ''
    });

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Fetch states on component mount
    useEffect(() => {
        fetchStates();
    }, []);

    // Fetch districts when state changes
    useEffect(() => {
        if (formData.stateName) {
            fetchDistricts(formData.stateName);
        } else {
            setDistricts([]);
        }
    }, [formData.stateName]);

    const fetchStates = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/states');
            const data = await response.json();
            if (data.success) {
                setStates(data.data);
            }
        } catch (error) {
            console.error('Error fetching states:', error);
        }
    };

    const fetchDistricts = async (stateName) => {
        try {
            const response = await fetch(`http://localhost:5001/api/districts?state=${encodeURIComponent(stateName)}`);
            const data = await response.json();
            if (data.success) {
                setDistricts(data.data);
            }
        } catch (error) {
            console.error('Error fetching districts:', error);
        }
    };


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
=======

    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        setLoading(true);

        try {
            console.log('=== REGISTRATION ATTEMPT ===');
            console.log('Form Data:', formData);

            // Validate districts
            if (formData.districts.length === 0) {
                setError('Please select at least one district');
                setLoading(false);
                return;
            }

            // Call backend API
            const response = await fetch('http://localhost:5001/api/implementing-agencies/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Registration failed');
            }

            console.log('✅ Registration successful:', result);
            alert(result.message || 'Registration Successful! Your application is pending approval from the State Admin.');
            navigate('/login');

        } catch (err) {
            console.error('❌ REGISTRATION ERROR:', err);
            setError(err.message || 'Registration failed');
=======

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5001/api/agencies/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(data.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error registering agency:', error);
            setError('Network error. Please try again.');

        } finally {
            setLoading(false);
        }
    };


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

                    {error && <div className="alert alert-error" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Agency Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter agency name"
=======
    if (success) {
        return (
            <div className="register-agency-container">
                <div className="success-message-card">
                    <div className="success-icon">✓</div>
                    <h2>Registration Successful!</h2>
                    <p>Your agency registration has been submitted for approval.</p>
                    <p>You will receive an email once your application is reviewed by the Ministry/State Admin.</p>
                    <p style={{ marginTop: '20px', color: '#64748b' }}>Redirecting to login page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="register-agency-container">
            <div className="register-agency-card">
                <h1>Register as Implementing Agency</h1>
                <p className="subtitle">Apply to become an approved implementing agency for PM-AJAY projects</p>

                {error && (
                    <div className="error-alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-section">
                        <h3>Agency Information</h3>

                        <div className="form-group">
                            <label htmlFor="agencyName">Agency Name *</label>
                            <input
                                type="text"
                                id="agencyName"

                                name="agencyName"
                                value={formData.agencyName}
                                onChange={handleChange}
                                required

=======
                                placeholder="Enter agency name"

                            />
                        </div>

                        <div className="form-group">

                            <label className="form-label">Phone Number</label>
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

                            <label htmlFor="agencyType">Agency Type *</label>
                            <select
                                id="agencyType"
                                name="agencyType"
                                value={formData.agencyType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select agency type</option>
                                <option value="NGO">Non-Governmental Organization (NGO)</option>
                                <option value="Private Company">Private Company</option>
                                <option value="Government Body">Government Body</option>
                                <option value="Cooperative Society">Cooperative Society</option>
                                <option value="Public Sector Unit">Public Sector Unit</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="registrationNo">Registration Number *</label>
                            <input
                                type="text"
                                id="registrationNo"
                                name="registrationNo"
                                value={formData.registrationNo}
                                onChange={handleChange}
                                required
                                placeholder="Enter registration number"

                            />
                        </div>

                        <div className="form-group">

                            <label className="form-label">Email Address</label>
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
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Create a password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="6"

                            <label htmlFor="address">Address *</label>
                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                rows="3"
                                placeholder="Enter complete address"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Contact Details</h3>

                        <div className="form-group">
                            <label htmlFor="contactNumber">Contact Number *</label>
                            <input
                                type="tel"
                                id="contactNumber"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                required
                                placeholder="Enter contact number"
                                pattern="[0-9]{10}"
                                title="Please enter a valid 10-digit phone number"

                            />
                        </div>

                        <div className="form-group">

                            <label className="form-label">GST Number</label>
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
                            <label className="form-label">State</label>
                            <select
                                className="form-control"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                                style={{ backgroundImage: 'none' }}
                            >
                                <option value="">Select State</option>
                                {indiaHierarchy.map(state => (
                                    <option key={state.id} value={state.name}>{state.name}</option>
                                ))}
                            </select>
                        </div>

                        {formData.state && (
                            <div className="form-group">
                                <label className="form-label">Select Districts (Available for Work)</label>
                                <div style={{
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    border: '1px solid #ccc',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    backgroundColor: '#f9fafb'
                                }}>
                                    {availableDistricts.length > 0 ? (
                                        availableDistricts.map(district => (
                                            <div key={district.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                <input
                                                    type="checkbox"
                                                    id={`district-${district.id}`}
                                                    checked={formData.districts.includes(district.name)}
                                                    onChange={() => handleDistrictChange(district.name)}
                                                    style={{ marginRight: '8px' }}
                                                />
                                                <label htmlFor={`district-${district.id}`} style={{ cursor: 'pointer', fontSize: '14px' }}>
                                                    {district.name}
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ fontSize: '14px', color: '#666' }}>No districts available</p>
                                    )}
                                </div>
                                <small style={{ color: '#666', fontSize: '12px' }}>
                                    Selected: {formData.districts.length} districts
                                </small>
                            </div>
                        )}

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
                    </form>

                    <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                            Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)' }}>Login here</Link>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </>

                            <label htmlFor="email">Email Address *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter email address"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Location</h3>

                        <div className="form-group">
                            <label htmlFor="stateName">State *</label>
                            <select
                                id="stateName"
                                name="stateName"
                                value={formData.stateName}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select state</option>
                                {states.map(state => (
                                    <option key={state.id} value={state.name}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="districtName">District *</label>
                            <select
                                id="districtName"
                                name="districtName"
                                value={formData.districtName}
                                onChange={handleChange}
                                required
                                disabled={!formData.stateName}
                            >
                                <option value="">Select district</option>
                                {districts.map(district => (
                                    <option key={district.id} value={district.name}>
                                        {district.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Account Security</h3>

                        <div className="form-group">
                            <label htmlFor="password">Password *</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="6"
                                placeholder="Enter password (min. 6 characters)"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password *</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                minLength="6"
                                placeholder="Re-enter password"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => navigate('/')}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Register Agency'}
                        </button>
                    </div>

                    <div className="form-note">
                        <p><strong>Note:</strong> Your application will be reviewed by the Ministry or State Admin before approval. You will receive an email notification once your application is processed.</p>
                    </div>
                </form>
            </div>
        </div>

    );
};

export default RegisterAgency;
