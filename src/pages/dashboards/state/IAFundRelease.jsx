import React, { useState, useEffect } from 'react';
import { IndianRupee, Building2, Calendar, FileText, TrendingUp, CheckCircle } from 'lucide-react';
import InteractiveButton from '../../../components/InteractiveButton';

const IAFundRelease = ({ stateId }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showReleaseModal, setShowReleaseModal] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        installmentNumber: '',
        sanctionOrderNo: '',
        remarks: ''
    });
    const [releasing, setReleasing] = useState(false);
    const [toast, setToast] = useState(null);
    const [filterDistrict, setFilterDistrict] = useState('all');
    const [filterIA, setFilterIA] = useState('all');

    const API_BASE_URL = 'http://localhost:5001/api/state-admins';

    useEffect(() => {
        if (stateId) {
            fetchProjects();
        }
    }, [stateId]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/ia-fund-projects?stateId=${stateId}`);
            const result = await response.json();
            
            if (result.success) {
                setProjects(result.data);
            } else {
                showToast('Failed to fetch projects', 'error');
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            showToast('Error loading projects', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleReleaseFund = (project) => {
        setSelectedProject(project);
        setFormData({
            amount: '',
            installmentNumber: (project.releases?.length || 0) + 1,
            sanctionOrderNo: '',
            remarks: ''
        });
        setShowReleaseModal(true);
    };

    const handleSubmitRelease = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.amount || !formData.sanctionOrderNo) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        const amount = parseFloat(formData.amount);
        if (amount <= 0 || amount > selectedProject.pending_amount) {
            showToast(`Amount must be between ₹1 and ₹${selectedProject.pending_amount.toLocaleString()}`, 'error');
            return;
        }

        const confirmed = window.confirm(
            `Release ₹${amount.toLocaleString()} to ${selectedProject.ia_name}?\n\n` +
            `Project: ${selectedProject.project_name}\n` +
            `District: ${selectedProject.district_name}\n` +
            `Installment: ${formData.installmentNumber}\n` +
            `Sanction Order: ${formData.sanctionOrderNo}`
        );

        if (!confirmed) return;

        try {
            setReleasing(true);
            const response = await fetch(`${API_BASE_URL}/ia-fund-release`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: selectedProject.id,
                    iaId: selectedProject.ia_id,
                    amount: amount,
                    installmentNumber: formData.installmentNumber,
                    sanctionOrderNo: formData.sanctionOrderNo,
                    remarks: formData.remarks
                })
            });

            const result = await response.json();

            if (result.success) {
                showToast('Fund released successfully!', 'success');
                setShowReleaseModal(false);
                fetchProjects();
            } else {
                showToast(result.error || 'Failed to release fund', 'error');
            }
        } catch (error) {
            console.error('Error releasing fund:', error);
            showToast('Error releasing fund', 'error');
        } finally {
            setReleasing(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Get unique districts and IAs for filters
    const districts = ['all', ...new Set(projects.map(p => p.district_name))];
    const ias = ['all', ...new Set(projects.map(p => p.ia_name))];

    // Apply filters
    const filteredProjects = projects.filter(p => {
        const matchesDistrict = filterDistrict === 'all' || p.district_name === filterDistrict;
        const matchesIA = filterIA === 'all' || p.ia_name === filterIA;
        return matchesDistrict && matchesIA;
    });

    // Calculate stats
    const totalAllocated = filteredProjects.reduce((sum, p) => sum + p.allocated_amount, 0);
    const totalReleased = filteredProjects.reduce((sum, p) => sum + p.total_released, 0);
    const totalPending = filteredProjects.reduce((sum, p) => sum + p.pending_amount, 0);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #1976d2',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1rem'
                }}></div>
                <p>Loading projects...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', background: '#f8f9fa', minHeight: '100vh' }}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '1rem 1.5rem',
                    borderRadius: '8px',
                    background: toast.type === 'success' ? '#10b981' : '#ef4444',
                    color: 'white',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 9999
                }}>
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', color: '#1e293b' }}>
                    IA Fund Release
                </h2>
                <p style={{ margin: 0, color: '#64748b' }}>
                    Release funds to Implementing Agencies in installments
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderLeft: '4px solid #3b82f6'
                }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#3b82f6' }}>
                        {formatCurrency(totalAllocated)}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Total Allocated
                    </div>
                </div>
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderLeft: '4px solid #10b981'
                }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#10b981' }}>
                        {formatCurrency(totalReleased)}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Total Released
                    </div>
                </div>
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderLeft: '4px solid #f59e0b'
                }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#f59e0b' }}>
                        {formatCurrency(totalPending)}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Pending Release
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ 
                background: 'white', 
                padding: '1rem 1.5rem', 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                        Filter by District
                    </label>
                    <select
                        value={filterDistrict}
                        onChange={(e) => setFilterDistrict(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.9rem'
                        }}
                    >
                        {districts.map(d => (
                            <option key={d} value={d}>
                                {d === 'all' ? 'All Districts' : d}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                        Filter by Implementing Agency
                    </label>
                    <select
                        value={filterIA}
                        onChange={(e) => setFilterIA(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.9rem'
                        }}
                    >
                        {ias.map(ia => (
                            <option key={ia} value={ia}>
                                {ia === 'all' ? 'All Agencies' : ia}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Projects List */}
            {filteredProjects.length === 0 ? (
                <div style={{
                    background: 'white',
                    padding: '4rem 2rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: '#64748b'
                }}>
                    <Building2 size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                    <p style={{ margin: 0, fontSize: '1.1rem' }}>No projects assigned to IAs</p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                        Assign projects to implementing agencies in Central Projects Assignment
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredProjects.map((project) => {
                        const releaseProgress = (project.total_released / project.allocated_amount) * 100;

                        return (
                            <div key={project.id} style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#1e293b' }}>
                                            {project.project_name}
                                        </h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Building2 size={14} /> {project.district_name}
                                            </span>
                                            <span style={{ fontWeight: '600', color: '#3b82f6' }}>
                                                {project.ia_name}
                                            </span>
                                            <span>{project.component}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Fund Status */}
                                <div style={{ 
                                    background: '#f8fafc', 
                                    padding: '1rem', 
                                    borderRadius: '8px',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Allocated</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#3b82f6' }}>
                                                {formatCurrency(project.allocated_amount)}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Released</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#10b981' }}>
                                                {formatCurrency(project.total_released)}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Pending</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#f59e0b' }}>
                                                {formatCurrency(project.pending_amount)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div style={{ position: 'relative', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{
                                            position: 'absolute',
                                            left: 0,
                                            top: 0,
                                            height: '100%',
                                            width: `${releaseProgress}%`,
                                            background: 'linear-gradient(90deg, #10b981, #059669)',
                                            transition: 'width 0.3s ease'
                                        }}></div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                        {releaseProgress.toFixed(1)}% Released
                                    </div>
                                </div>

                                {/* Release History */}
                                {project.releases && project.releases.length > 0 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b' }}>
                                            Release History ({project.releases.length} installment{project.releases.length !== 1 ? 's' : ''})
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {project.releases.slice(0, 3).map((release, index) => (
                                                <div key={release.id} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '0.5rem 0.75rem',
                                                    background: '#f1f5f9',
                                                    borderRadius: '6px',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    <span>
                                                        <CheckCircle size={14} style={{ color: '#10b981', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                                        Installment {release.installment_number}
                                                    </span>
                                                    <span style={{ fontWeight: '600' }}>
                                                        {formatCurrency(release.amount)}
                                                    </span>
                                                    <span style={{ color: '#64748b' }}>
                                                        {formatDate(release.released_at)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Button */}
                                {project.pending_amount > 0 ? (
                                    <InteractiveButton
                                        onClick={() => handleReleaseFund(project)}
                                        style={{ width: '100%' }}
                                    >
                                        <TrendingUp size={18} />
                                        Release Fund
                                    </InteractiveButton>
                                ) : (
                                    <div style={{
                                        padding: '0.75rem',
                                        background: '#dcfce7',
                                        border: '1px solid #bbf7d0',
                                        borderRadius: '8px',
                                        color: '#166534',
                                        textAlign: 'center',
                                        fontWeight: '600'
                                    }}>
                                        <CheckCircle size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                                        Fully Released
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Release Modal */}
            {showReleaseModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setShowReleaseModal(false)}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        width: '90%',
                        maxWidth: '600px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            padding: '1.5rem 2rem',
                            borderBottom: '1px solid #e2e8f0'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>Release Fund</h3>
                        </div>

                        <form onSubmit={handleSubmitRelease} style={{ padding: '2rem' }}>
                            {/* Project Info */}
                            <div style={{
                                background: '#f0f9ff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '8px',
                                padding: '1rem',
                                marginBottom: '1.5rem'
                            }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>
                                    {selectedProject?.project_name}
                                </h4>
                                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#3b82f6' }}>
                                    <Building2 size={14} style={{ verticalAlign: 'middle' }} /> {selectedProject?.ia_name}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                                    Pending: <strong>{formatCurrency(selectedProject?.pending_amount)}</strong>
                                </p>
                            </div>

                            {/* Form Fields */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                                        Amount <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="Enter amount"
                                        required
                                        min="1"
                                        max={selectedProject?.pending_amount}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                                        Installment Number
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.installmentNumber}
                                        readOnly
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            fontSize: '1rem',
                                            background: '#f8fafc'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                                        Sanction Order No <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.sanctionOrderNo}
                                        onChange={(e) => setFormData({ ...formData, sanctionOrderNo: e.target.value })}
                                        placeholder="Enter sanction order number"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                                        Remarks (Optional)
                                    </label>
                                    <textarea
                                        value={formData.remarks}
                                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                        placeholder="Enter any additional remarks"
                                        rows="3"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            fontSize: '1rem',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <InteractiveButton
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowReleaseModal(false)}
                                    disabled={releasing}
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </InteractiveButton>
                                <InteractiveButton
                                    type="submit"
                                    disabled={releasing}
                                    style={{ flex: 1 }}
                                >
                                    {releasing ? 'Releasing...' : 'Release Fund'}
                                </InteractiveButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IAFundRelease;
