import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Search } from 'lucide-react';

const VillageProjectAllocation = () => {
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [selectedState, setSelectedState] = useState('');
    const [selectedStateId, setSelectedStateId] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [allStates, setAllStates] = useState([]);
    const [selectedVillage, setSelectedVillage] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [allYears, setAllYears] = useState([]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            await fetchStates();
            await fetchProjects();
        } catch (error) {
            console.error('Error fetching initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/dashboard/projects');
            const result = await response.json();

            if (result.success && result.data) {
                setProjects(result.data);

                // Extract unique years
                const years = [...new Set(result.data
                    .map(p => {
                        if (!p.deadline) return null;
                        return new Date(p.deadline).getFullYear();
                    })
                    .filter(y => y !== null)
                )].sort((a, b) => b - a);

                setAllYears(years);
                setFilteredProjects(result.data);
            } else {
                console.error('Error fetching projects from API:', result.error);
                setProjects([]);
                setFilteredProjects([]);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            setProjects([]);
            setFilteredProjects([]);
        }
    };

    const fetchStates = async () => {
        try {
            const { data, error } = await supabase
                .from('states')
                .select('name')
                .order('name', { ascending: true });

            if (error) {
                console.error('Error fetching states:', error);
                throw error;
            }

            if (data) {
                const stateNames = data.map(item => item.name).sort();
                setAllStates(stateNames);
                if (stateNames.includes('Andhra Pradesh')) {
                    setSelectedState('Andhra Pradesh');
                } else if (stateNames.length > 0) {
                    setSelectedState(stateNames[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching states:', error);
        }
    };

    const fetchStateIdAndDistricts = async () => {
        try {
            const { data: stateData, error: stateError } = await supabase
                .from('states')
                .select('id')
                .eq('name', selectedState)
                .single();

            if (stateError) {
                console.error('Error fetching state ID:', stateError);
                throw stateError;
            }

            if (stateData) {
                setSelectedStateId(stateData.id);
                const { data: districtData, error: districtError } = await supabase
                    .from('districts')
                    .select('name')
                    .eq('state_id', stateData.id)
                    .order('name', { ascending: true });

                if (districtError) {
                    console.error('Error fetching districts:', districtError);
                    throw districtError;
                }

                if (districtData) {
                    const districtNames = districtData.map(item => item.name).sort();
                    setDistricts(districtNames);
                } else {
                    setDistricts([]);
                }
            } else {
                setDistricts([]);
            }
        } catch (error) {
            console.error('Error fetching state ID and districts:', error);
            setDistricts([]);
        }
    };

    const fetchVillagesForDistrict = async () => {
        try {
            const { data: villageData, error: villageError } = await supabase
                .from('villages')
                .select('village_name')
                .eq('district_name', selectedDistrict)
                .eq('state_name', selectedState)
                .order('village_name', { ascending: true });

            const { data: fundVillageData, error: fundVillageError } = await supabase
                .from('village_fund_releases')
                .select('village_name')
                .eq('district_name', selectedDistrict)
                .eq('state_name', selectedState)
                .order('village_name', { ascending: true });

            let allVillages = [];

            if (villageData && !villageError) {
                allVillages = [...allVillages, ...villageData.map(item => item.village_name)];
            }

            if (fundVillageData && !fundVillageError) {
                allVillages = [...allVillages, ...fundVillageData.map(item => item.village_name)];
            }

            const uniqueVillages = [...new Set(allVillages)].sort();
            setVillages(uniqueVillages);
        } catch (error) {
            console.error('Error fetching villages:', error);
            setVillages([]);
        }
    };

    const filterProjects = () => {
        let filtered = projects;

        if (selectedState) {
            filtered = filtered.filter(project =>
                project.state_name === selectedState
            );
        }

        if (selectedDistrict) {
            filtered = filtered.filter(project =>
                project.district_name === selectedDistrict
            );
        }

        if (selectedVillage) {
            filtered = filtered.filter(project =>
                project.location === selectedVillage ||
                project.village_name === selectedVillage
            );
        }

        if (appliedSearch) {
            const lowerSearch = appliedSearch.toLowerCase().trim();
            filtered = filtered.filter(project => {
                const displayValue = project.location || project.village_name || '';
                return displayValue.toLowerCase().trim() === lowerSearch;
            });
        }

        if (selectedYear) {
            filtered = filtered.filter(project => {
                if (!project.deadline) return false;
                return new Date(project.deadline).getFullYear() === parseInt(selectedYear);
            });
        }

        setFilteredProjects(filtered);
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedState) {
            fetchStateIdAndDistricts();
        } else {
            setDistricts([]);
            setSelectedStateId(null);
        }
        setSelectedDistrict('');
        setVillages([]);
        setSearchTerm('');
        setSelectedVillage('');
    }, [selectedState]);

    useEffect(() => {
        if (selectedDistrict && selectedState) {
            fetchVillagesForDistrict();
        } else {
            setVillages([]);
        }
        setSearchTerm('');
        setSelectedVillage('');
    }, [selectedDistrict, selectedState]);

    useEffect(() => {
        filterProjects();
    }, [selectedState, selectedDistrict, selectedVillage, projects, appliedSearch, selectedYear]);

    const filteredVillages = villages.filter(village =>
        village.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return '#10B981';
            case 'In Progress': return '#3B82F6';
            case 'Assigned to IA': return '#F59E0B';
            case 'Assigned to EA': return '#8B5CF6';
            default: return '#6B7280';
        }
    };

    const getComponentColor = (component) => {
        switch (component) {
            case 'Adarsh Gram': return '#FF9933';
            case 'GIA': return '#138808';
            case 'Hostel': return '#000080';
            default: return '#6B7280';
        }
    };

    if (loading) {
        return (
            <div className="dashboard-panel">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '256px' }}>
                    <p>Loading projects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-panel">
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                    Village & District Project Allocation
                </h2>
                <p style={{ color: '#6B7280', fontSize: '14px' }}>
                    View allocated projects and components in villages and districts
                </p>
            </div>

            {/* Filters */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                padding: '16px',
                marginBottom: '24px'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '16px'
                }}>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            State
                        </label>
                        <select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                fontSize: '14px',
                                color: '#374151',
                                backgroundColor: 'white'
                            }}
                        >
                            <option value="">Select State</option>
                            {allStates.map((state) => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            District
                        </label>
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                fontSize: '14px',
                                color: '#374151',
                                backgroundColor: 'white'
                            }}
                            disabled={!selectedState}
                        >
                            <option value="">Select District</option>
                            {districts.map((district) => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Select Village
                        </label>
                        <select
                            value={selectedVillage}
                            onChange={(e) => setSelectedVillage(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                fontSize: '14px',
                                color: '#374151',
                                backgroundColor: 'white'
                            }}
                            disabled={!selectedDistrict || villages.length === 0}
                        >
                            <option value="">All Villages ({villages.length})</option>
                            {villages.map((village) => (
                                <option key={village} value={village}>{village}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Year
                        </label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                fontSize: '14px',
                                color: '#374151',
                                backgroundColor: 'white'
                            }}
                        >
                            <option value="">All Years</option>
                            {allYears.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Search Village
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search by name... (Press Enter)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setAppliedSearch(searchTerm);
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px 10px 36px',
                                    borderRadius: '8px',
                                    border: '1px solid #E5E7EB',
                                    fontSize: '14px',
                                    color: '#374151',
                                    backgroundColor: 'white'
                                }}
                            />
                            <Search
                                size={16}
                                style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9CA3AF'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    padding: '16px'
                }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Total Projects</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{filteredProjects.length}</div>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    padding: '16px'
                }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Total Funding</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                        {formatCurrency(filteredProjects.reduce((sum, p) => sum + (p.amount || p.amount_allocated || 0), 0))}
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    padding: '16px'
                }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Districts Covered</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                        {selectedDistrict ? 1 : 0}
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    padding: '16px'
                }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Villages Covered</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                        {selectedVillage ? 1 : villages.length}
                    </div>
                </div>
            </div>

            {/* Projects Table */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                overflow: 'hidden'
            }}>
                {filteredProjects.length === 0 ? (
                    <div style={{
                        padding: '48px',
                        textAlign: 'center',
                        color: '#6B7280'
                    }}>
                        <div style={{ marginBottom: '12px' }}>
                            <svg
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ margin: '0 auto', color: '#9CA3AF' }}
                            >
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                            No projects found
                        </h3>
                        <p style={{ fontSize: '14px' }}>
                            Try adjusting your filters or search terms
                        </p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#202076ff', borderBottom: '1px solid #E5E7EB' }}>
                                    <th style={{
                                        padding: '16px',
                                        textAlign: 'left',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#FFFFFF',
                                        textTransform: 'uppercase'
                                    }}>
                                        Project
                                    </th>
                                    <th style={{
                                        padding: '16px',
                                        textAlign: 'left',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#FFFFFF',
                                        textTransform: 'uppercase'
                                    }}>
                                        Village
                                    </th>
                                    <th style={{
                                        padding: '16px',
                                        textAlign: 'left',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#FFFFFF',
                                        textTransform: 'uppercase'
                                    }}>
                                        Component
                                    </th>
                                    <th style={{
                                        padding: '16px',
                                        textAlign: 'left',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#FFFFFF',
                                        textTransform: 'uppercase'
                                    }}>
                                        Agency
                                    </th>
                                    <th style={{
                                        padding: '16px',
                                        textAlign: 'left',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#FFFFFF',
                                        textTransform: 'uppercase'
                                    }}>
                                        Funding
                                    </th>
                                    <th style={{
                                        padding: '16px',
                                        textAlign: 'left',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#FFFFFF',
                                        textTransform: 'uppercase'
                                    }}>
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProjects.map((project) => (
                                    <tr key={project.id} style={{
                                        borderBottom: '1px solid #E5E7EB',
                                        transition: 'background-color 0.2s'
                                    }}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: '#111827',
                                                marginBottom: '4px'
                                            }}>
                                                {project.title || project.village_name || 'N/A'}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#6B7280'
                                            }}>
                                                ID: {project.id ? project.id.toString().substring(0, 8) : 'N/A'}...
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: '#111827',
                                                marginBottom: '4px'
                                            }}>
                                                {project.location || project.village_name || 'N/A'}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#6B7280'
                                            }}>
                                                {project.district_name || 'N/A'}, {project.state_name || 'N/A'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '4px 12px',
                                                borderRadius: '9999px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                backgroundColor: `${getComponentColor(project.component && project.component.length > 0 ? project.component[0] : 'N/A')}20`,
                                                color: getComponentColor(project.component && project.component.length > 0 ? project.component[0] : 'N/A'),
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {project.component && project.component.length > 0 ? project.component[0] : 'N/A'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                color: '#111827',
                                                marginBottom: '4px'
                                            }}>
                                                {project.agency_name || 'Unassigned'}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#6B7280'
                                            }}>
                                                {project.executing_agency_name || 'N/A'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: '#111827',
                                                marginBottom: '4px'
                                            }}>
                                                {formatCurrency(project.amount || 0)}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#6B7280'
                                            }}>
                                                Released: {formatCurrency(project.funds_released || 0)}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '4px 12px',
                                                borderRadius: '9999px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                backgroundColor: `${getStatusColor(project.status)}20`,
                                                color: getStatusColor(project.status),
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {project.status || 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Villages List */}
            {villages.length > 0 && !selectedVillage && (
                <div style={{
                    marginTop: '24px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    padding: '16px'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                    }}>
                        <h3 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#111827'
                        }}>
                            Villages in {selectedDistrict} ({villages.length} total)
                        </h3>
                        <div style={{
                            display: 'flex',
                            gap: '8px'
                        }}>
                            <input
                                type="text"
                                placeholder="Search villages..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #E5E7EB',
                                    fontSize: '13px',
                                    width: '200px'
                                }}
                            />
                            <button
                                onClick={() => setSearchTerm('')}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #E5E7EB',
                                    backgroundColor: '#F9FAFB',
                                    color: '#374151',
                                    fontSize: '13px',
                                    cursor: 'pointer'
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                        gap: '8px'
                    }}>
                        {filteredVillages.map((village, index) => (
                            <div
                                key={index}
                                onClick={() => setSelectedVillage(village)}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#202076ff',
                                    color: '#FFFFFF',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'opacity 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.opacity = '0.8'}
                                onMouseOut={(e) => e.target.style.opacity = '1'}
                            >
                                {village}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VillageProjectAllocation;