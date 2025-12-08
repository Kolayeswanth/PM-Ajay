import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Filter, Download, Building2, MapPin, FolderOpen, Users, RefreshCw, CreditCard } from 'lucide-react';
import '../../../dashboard.css';

const FundFlow = () => {
    const [fundFlowData, setFundFlowData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedComponent, setSelectedComponent] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [status, setStatus] = useState('');
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [components, setComponents] = useState([]);
    const [showInstallments, setShowInstallments] = useState(false);

    // Fetch available states
    useEffect(() => {
        const fetchStates = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/state-admins/states');
                const data = await response.json();
                if (data && Array.isArray(data)) {
                    setStates(data.map(s => s.name));
                }
            } catch (error) {
                console.error('Error fetching states:', error);
            }
        };
        fetchStates();
    }, []);

    // Fetch available scheme components from database
    useEffect(() => {
        const fetchComponents = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/dashboard/scheme-components');
                const result = await response.json();
                if (result.success && result.data) {
                    setComponents(result.data);
                    console.log('Loaded components:', result.data);
                }
            } catch (error) {
                console.error('Error fetching components:', error);
            }
        };
        fetchComponents();
    }, []);

    // Fetch districts when state is selected
    useEffect(() => {
        if (selectedState) {
            const fetchDistricts = async () => {
                try {
                    const response = await fetch(`http://localhost:5001/api/state-admins/districts?stateName=${encodeURIComponent(selectedState)}`);
                    const data = await response.json();
                    if (data && Array.isArray(data)) {
                        setDistricts(data.map(d => d.name));
                    }
                } catch (error) {
                    console.error('Error fetching districts:', error);
                }
            };
            fetchDistricts();
        } else {
            setDistricts([]);
            setSelectedDistrict('');
        }
    }, [selectedState]);

    // Fetch fund flow data with all filters
    useEffect(() => {
        const fetchFundFlow = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                
                if (selectedState) params.append('state', selectedState);
                if (selectedDistrict) params.append('district', selectedDistrict);
                if (selectedComponent) params.append('component', selectedComponent);
                if (selectedYear) params.append('year', selectedYear);
                if (dateRange.start) params.append('startDate', dateRange.start);
                if (dateRange.end) params.append('endDate', dateRange.end);
                if (minAmount) params.append('minAmount', minAmount);
                if (maxAmount) params.append('maxAmount', maxAmount);
                if (status) params.append('status', status);

                const url = `http://localhost:5001/api/dashboard/fund-flow?${params.toString()}`;
                const response = await fetch(url);
                const result = await response.json();

                if (result.success) {
                    setFundFlowData(result.data);
                }
            } catch (error) {
                console.error('Error fetching fund flow data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFundFlow();
    }, [selectedState, selectedDistrict, selectedComponent, selectedYear, dateRange, minAmount, maxAmount, status]);

    const formatCurrency = (amount) => {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(2)} Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)} L`;
        } else {
            return `₹${amount.toFixed(2)}`;
        }
    };

    const handleExport = () => {
        if (!fundFlowData) return;

        const exportData = {
            summary: fundFlowData.summary,
            filters: fundFlowData.filters,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fund-flow-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const clearFilters = () => {
        setSelectedState('');
        setSelectedDistrict('');
        setSelectedComponent('');
        setSelectedYear('');
        setDateRange({ start: '', end: '' });
        setMinAmount('');
        setMaxAmount('');
        setStatus('');
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="loading-spinner">Loading fund flow data...</div>
            </div>
        );
    }

    if (!fundFlowData) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>No fund flow data available</p>
            </div>
        );
    }

    const { summary, flows } = fundFlowData;

    return (
        <div style={{ padding: '1.5rem' }}>
            {/* Header Section */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Fund Flow Analysis</h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Track fund flow from ministry to beneficiaries
                    </p>
                </div>
                <button 
                    onClick={handleExport}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                    }}
                >
                    <Download size={18} />
                    Export Data
                </button>
            </div>

            {/* Advanced Filter Section */}
            <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={20} />
                        <h3 style={{ margin: 0 }}>Advanced Filters</h3>
                    </div>
                    <button 
                        onClick={clearFilters}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '500'
                        }}
                    >
                        <RefreshCw size={16} />
                        Reset All
                    </button>
                </div>
                
                {/* Location Filters */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#666' }}>Location</h4>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '500' }}>
                                State
                            </label>
                            <select 
                                value={selectedState}
                                onChange={(e) => setSelectedState(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <option value="">All States</option>
                                {states.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '500' }}>
                                District
                            </label>
                            <select 
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                disabled={!selectedState}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '0.9rem',
                                    opacity: selectedState ? 1 : 0.5
                                }}
                            >
                                <option value="">All Districts</option>
                                {districts.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Scheme Component & Year Filters */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#666' }}>Scheme & Time Period</h4>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '500' }}>
                                Scheme Component
                            </label>
                            <select 
                                value={selectedComponent}
                                onChange={(e) => setSelectedComponent(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <option value="">All Components</option>
                                {components.map(component => (
                                    <option key={component} value={component}>{component}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '500' }}>
                                Financial Year
                            </label>
                            <select 
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <option value="">All Years</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}-{year + 1}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Date Range Filters */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#666' }}>Date Range</h4>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '500' }}>
                                From Date
                            </label>
                            <input 
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '500' }}>
                                To Date
                            </label>
                            <input 
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Amount Range Filters */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#666' }}>Amount Range (in Crores)</h4>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '500' }}>
                                Minimum Amount
                            </label>
                            <input 
                                type="number"
                                value={minAmount}
                                onChange={(e) => setMinAmount(e.target.value)}
                                placeholder="0"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '500' }}>
                                Maximum Amount
                            </label>
                            <input 
                                type="number"
                                value={maxAmount}
                                onChange={(e) => setMaxAmount(e.target.value)}
                                placeholder="1000"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Status Filter */}
                <div>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#666' }}>Release Status</h4>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '500' }}>
                                Status
                            </label>
                            <select 
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <option value="">All Status</option>
                                <option value="Released">Released</option>
                                <option value="Utilized">Utilized</option>
                                <option value="Pending">Pending</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Active Filters Summary */}
                {(selectedState || selectedDistrict || selectedComponent || selectedYear || dateRange.start || dateRange.end || minAmount || maxAmount || status) && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        backgroundColor: '#e3f2fd',
                        borderRadius: '8px',
                        border: '1px solid #2196f3'
                    }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: '600', color: '#1976d2' }}>
                            Active Filters:
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {selectedState && <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'white', borderRadius: '12px', fontSize: '0.8rem' }}>State: {selectedState}</span>}
                            {selectedDistrict && <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'white', borderRadius: '12px', fontSize: '0.8rem' }}>District: {selectedDistrict}</span>}
                            {selectedComponent && <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'white', borderRadius: '12px', fontSize: '0.8rem' }}>Component: {selectedComponent}</span>}
                            {selectedYear && <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'white', borderRadius: '12px', fontSize: '0.8rem' }}>Year: {selectedYear}-{parseInt(selectedYear) + 1}</span>}
                            {dateRange.start && <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'white', borderRadius: '12px', fontSize: '0.8rem' }}>From: {dateRange.start}</span>}
                            {dateRange.end && <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'white', borderRadius: '12px', fontSize: '0.8rem' }}>To: {dateRange.end}</span>}
                            {minAmount && <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'white', borderRadius: '12px', fontSize: '0.8rem' }}>Min: ₹{minAmount}Cr</span>}
                            {maxAmount && <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'white', borderRadius: '12px', fontSize: '0.8rem' }}>Max: ₹{maxAmount}Cr</span>}
                            {status && <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'white', borderRadius: '12px', fontSize: '0.8rem' }}>Status: {status}</span>}
                        </div>
                    </div>
                )}
            </div>

            {/* Summary Statistics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div style={{
                    backgroundColor: '#e3f2fd',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    borderLeft: '4px solid #2196f3'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#1976d2', fontWeight: '600' }}>
                                Ministry Allocation
                            </p>
                            <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.75rem', color: '#1565c0' }}>
                                {formatCurrency(summary.totalAllocatedByMinistry * 10000000)}
                            </h2>
                        </div>
                        <Building2 size={28} style={{ color: '#1976d2' }} />
                    </div>
                </div>

                <div style={{
                    backgroundColor: '#f3e5f5',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    borderLeft: '4px solid #9c27b0'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#7b1fa2', fontWeight: '600' }}>
                                Released by States
                            </p>
                            <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.75rem', color: '#6a1b9a' }}>
                                {formatCurrency(summary.totalReleasedByStates * 10000000)}
                            </h2>
                        </div>
                        <MapPin size={28} style={{ color: '#9c27b0' }} />
                    </div>
                </div>

                <div style={{
                    backgroundColor: '#e8f5e9',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    borderLeft: '4px solid #4caf50'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#388e3c', fontWeight: '600' }}>
                                Released by Districts
                            </p>
                            <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.75rem', color: '#2e7d32' }}>
                                {formatCurrency(summary.totalReleasedByDistricts * 10000000)}
                            </h2>
                        </div>
                        <FolderOpen size={28} style={{ color: '#4caf50' }} />
                    </div>
                </div>

                <div style={{
                    backgroundColor: '#fff3e0',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    borderLeft: '4px solid #ff9800'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#f57c00', fontWeight: '600' }}>
                                Fund Flow Efficiency
                            </p>
                            <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.75rem', color: '#e65100' }}>
                                {summary.efficiency}%
                            </h2>
                        </div>
                        {parseFloat(summary.efficiency) >= 70 ? 
                            <TrendingUp size={28} style={{ color: '#ff9800' }} /> : 
                            <TrendingDown size={28} style={{ color: '#ff9800' }} />
                        }
                    </div>
                </div>
            </div>

            {/* Fund Flow Visualization - Vertical Diagram */}
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '2rem' }}>Fund Flow Diagram</h3>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0',
                    padding: '1rem',
                    position: 'relative'
                }}>
                    {/* Ministry Level */}
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        position: 'relative',
                        zIndex: 4
                    }}>
                        <div style={{
                            width: '180px',
                            height: '180px',
                            borderRadius: '50%',
                            backgroundColor: '#2196f3',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            boxShadow: '0 8px 24px rgba(33, 150, 243, 0.4)',
                            border: '4px solid #1976d2',
                            position: 'relative'
                        }}>
                            <Building2 size={42} strokeWidth={2.5} />
                            <p style={{ margin: '0.75rem 0 0.25rem 0', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px' }}>MINISTRY</p>
                            <p style={{ margin: '0', fontSize: '1rem', fontWeight: 'bold' }}>
                                {formatCurrency(summary.totalAllocatedByMinistry * 10000000)}
                            </p>
                            <div style={{
                                position: 'absolute',
                                bottom: '-2px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '0',
                                height: '0',
                                borderLeft: '15px solid transparent',
                                borderRight: '15px solid transparent',
                                borderTop: '15px solid #1976d2'
                            }}></div>
                        </div>
                        {/* Connecting Line */}
                        <div style={{
                            width: '4px',
                            height: '60px',
                            background: 'linear-gradient(180deg, #1976d2 0%, #7b1fa2 100%)',
                            position: 'relative'
                        }}>
                            <div style={{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                color: '#1976d2',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                border: '1px solid #e3f2fd'
                            }}>
                                {summary.efficiency}%
                            </div>
                        </div>
                    </div>

                    {/* State Level */}
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        position: 'relative',
                        zIndex: 3
                    }}>
                        <div style={{
                            width: '170px',
                            height: '170px',
                            borderRadius: '50%',
                            backgroundColor: '#9c27b0',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            boxShadow: '0 8px 24px rgba(156, 39, 176, 0.4)',
                            border: '4px solid #7b1fa2',
                            position: 'relative'
                        }}>
                            <MapPin size={40} strokeWidth={2.5} />
                            <p style={{ margin: '0.75rem 0 0.25rem 0', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px' }}>STATES</p>
                            <p style={{ margin: '0', fontSize: '1rem', fontWeight: 'bold' }}>
                                {formatCurrency(summary.totalReleasedByStates * 10000000)}
                            </p>
                            <div style={{
                                position: 'absolute',
                                bottom: '-2px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '0',
                                height: '0',
                                borderLeft: '15px solid transparent',
                                borderRight: '15px solid transparent',
                                borderTop: '15px solid #7b1fa2'
                            }}></div>
                        </div>
                        {/* Connecting Line */}
                        <div style={{
                            width: '4px',
                            height: '60px',
                            background: 'linear-gradient(180deg, #7b1fa2 0%, #2e7d32 100%)',
                            position: 'relative'
                        }}></div>
                    </div>

                    {/* District Level */}
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        position: 'relative',
                        zIndex: 2
                    }}>
                        <div style={{
                            width: '160px',
                            height: '160px',
                            borderRadius: '50%',
                            backgroundColor: '#4caf50',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            boxShadow: '0 8px 24px rgba(76, 175, 80, 0.4)',
                            border: '4px solid #2e7d32',
                            position: 'relative'
                        }}>
                            <FolderOpen size={38} strokeWidth={2.5} />
                            <p style={{ margin: '0.75rem 0 0.25rem 0', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px' }}>DISTRICTS</p>
                            <p style={{ margin: '0', fontSize: '1rem', fontWeight: 'bold' }}>
                                {formatCurrency(summary.totalReleasedByDistricts * 10000000)}
                            </p>
                            <div style={{
                                position: 'absolute',
                                bottom: '-2px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '0',
                                height: '0',
                                borderLeft: '15px solid transparent',
                                borderRight: '15px solid transparent',
                                borderTop: '15px solid #2e7d32'
                            }}></div>
                        </div>
                        {/* Connecting Line */}
                        <div style={{
                            width: '4px',
                            height: '60px',
                            background: 'linear-gradient(180deg, #2e7d32 0%, #e65100 100%)',
                            position: 'relative'
                        }}></div>
                    </div>

                    {/* Villages/Projects Level */}
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <div style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            backgroundColor: '#ff9800',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            boxShadow: '0 8px 24px rgba(255, 152, 0, 0.4)',
                            border: '4px solid #e65100',
                            position: 'relative'
                        }}>
                            <Users size={36} strokeWidth={2.5} />
                            <p style={{ margin: '0.75rem 0 0.25rem 0', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px' }}>VILLAGES</p>
                            <p style={{ margin: '0', fontSize: '1rem', fontWeight: 'bold' }}>
                                {formatCurrency(summary.totalReleasedToAgencies * 10000000)}
                            </p>
                        </div>
                        {/* Utilization Info */}
                        {summary.utilizationRate && (
                            <div style={{
                                marginTop: '1rem',
                                backgroundColor: '#fff3e0',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '20px',
                                border: '2px solid #ff9800',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#e65100', fontWeight: '600' }}>
                                    Utilization: <strong style={{ fontSize: '0.9rem' }}>{summary.utilizationRate}%</strong>
                                </p>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.7rem', color: '#f57c00' }}>
                                    {formatCurrency(summary.totalUtilized * 10000000)} utilized
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Legend */}
                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '1.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2196f3' }}></div>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>Ministry Allocation</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#9c27b0' }}></div>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>State Release</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#4caf50' }}></div>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>District Release</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff9800' }}></div>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>Village/Project Level</span>
                    </div>
                </div>
            </div>

            {/* Installments Toggle */}
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <button
                    onClick={() => setShowInstallments(!showInstallments)}
                    style={{
                        padding: '0.75rem 2rem',
                        backgroundColor: showInstallments ? '#2196f3' : 'white',
                        color: showInstallments ? 'white' : '#2196f3',
                        border: '2px solid #2196f3',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <CreditCard size={18} />
                    {showInstallments ? 'Hide Installment Details' : 'Show Installment Details'}
                </button>
            </div>

            {/* Detailed Breakdown Tables with Installments */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '1.5rem'
            }}>
                {/* Ministry to State Flow */}
                {flows.ministryToState && flows.ministryToState.length > 0 && (
                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ margin: 0, color: '#2196f3' }}>
                                Ministry → States
                            </h4>
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                {flows.ministryToState.length} {flows.ministryToState.length === 1 ? 'State' : 'States'}
                            </span>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0 }}>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>State</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Allocated</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Released</th>
                                        {showInstallments && <th style={{ padding: '0.75rem', textAlign: 'center' }}>Installments</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {flows.ministryToState.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '0.75rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: '600' }}>{item.state}</span>
                                                    {item.components && item.components.length > 0 && (
                                                        <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                                                            {item.components.join(', ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#2196f3' }}>
                                                {formatCurrency(item.allocated)}
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#4caf50' }}>
                                                {formatCurrency(item.released)}
                                            </td>
                                            {showInstallments && (
                                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                    <span style={{ 
                                                        padding: '0.25rem 0.75rem', 
                                                        backgroundColor: '#e3f2fd', 
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        color: '#1976d2'
                                                    }}>
                                                        {item.count || 0} {item.count === 1 ? 'installment' : 'installments'}
                                                    </span>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* State to District Flow */}
                {flows.stateToDistrict && flows.stateToDistrict.length > 0 && (
                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ margin: 0, color: '#9c27b0' }}>
                                States → Districts
                            </h4>
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                {flows.stateToDistrict.length} {flows.stateToDistrict.length === 1 ? 'District' : 'Districts'}
                            </span>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0 }}>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>District</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Released</th>
                                        {showInstallments && <th style={{ padding: '0.75rem', textAlign: 'center' }}>Installments</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {flows.stateToDistrict.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '0.75rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: '600' }}>{item.district}</span>
                                                    {item.state && (
                                                        <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                                                            {item.state}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#9c27b0' }}>
                                                {formatCurrency(item.released)}
                                            </td>
                                            {showInstallments && (
                                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                    <span style={{ 
                                                        padding: '0.25rem 0.75rem', 
                                                        backgroundColor: '#f3e5f5', 
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        color: '#7b1fa2'
                                                    }}>
                                                        {item.count || 0} {item.count === 1 ? 'installment' : 'installments'}
                                                    </span>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* District to Project Flow */}
                {flows.districtToProject && flows.districtToProject.length > 0 && (
                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ margin: 0, color: '#4caf50' }}>
                                Districts → Projects
                            </h4>
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                {flows.districtToProject.length} {flows.districtToProject.length === 1 ? 'Project' : 'Projects'}
                            </span>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0 }}>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>District/Project</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Released</th>
                                        {showInstallments && <th style={{ padding: '0.75rem', textAlign: 'center' }}>Releases</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {flows.districtToProject.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '0.75rem' }}>
                                                <span style={{ fontWeight: '600' }}>{item.district_name || 'Unknown'}</span>
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#4caf50' }}>
                                                {formatCurrency(item.released)}
                                            </td>
                                            {showInstallments && (
                                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                    <span style={{ 
                                                        padding: '0.25rem 0.75rem', 
                                                        backgroundColor: '#e8f5e9', 
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        color: '#2e7d32'
                                                    }}>
                                                        {item.count || 0} {item.count === 1 ? 'release' : 'releases'}
                                                    </span>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Village/Agency Allocations */}
                {flows.agencyAllocations && flows.agencyAllocations.length > 0 && (
                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ margin: 0, color: '#ff9800' }}>
                                Village/Project Allocations
                            </h4>
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                {flows.agencyAllocations.length} {flows.agencyAllocations.length === 1 ? 'Village' : 'Villages'}
                            </span>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0 }}>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Village</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Released</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Utilized</th>
                                        {showInstallments && <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {flows.agencyAllocations.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '0.75rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: '600' }}>{item.village}</span>
                                                    {item.district && (
                                                        <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                                                            {item.district}, {item.state}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#ff9800' }}>
                                                {formatCurrency(item.released)}
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#4caf50' }}>
                                                {formatCurrency(item.utilized)}
                                            </td>
                                            {showInstallments && (
                                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                    <span style={{ 
                                                        padding: '0.25rem 0.75rem', 
                                                        backgroundColor: item.utilized >= item.released * 0.8 ? '#e8f5e9' : '#fff3e0', 
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        color: item.utilized >= item.released * 0.8 ? '#2e7d32' : '#e65100'
                                                    }}>
                                                        {item.utilized >= item.released * 0.8 ? 'Good' : 'Needs Attention'}
                                                    </span>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FundFlow;
