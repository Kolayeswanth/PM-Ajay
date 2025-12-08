import React from 'react';

/**
 * Component to display AI detection results for uploaded images
 */
const ImageVerificationBadge = ({ result, filename }) => {
    if (!result) return null;

    const getStatusColor = () => {
        if (result.confidence >= 60) return '#10b981'; // Green
        if (result.confidence >= 40) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    const getStatusIcon = () => {
        if (result.confidence >= 60) return '✅';
        if (result.confidence >= 40) return '⚠️';
        return '❌';
    };

    const getStatusText = () => {
        if (result.confidence >= 60) return 'Verified';
        if (result.confidence >= 40) return 'Warning';
        return 'Rejected';
    };

    return (
        <div style={{
            background: '#fff',
            border: `2px solid ${getStatusColor()}`,
            borderRadius: '8px',
            padding: '12px',
            marginTop: '8px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>{getStatusIcon()}</span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: getStatusColor() }}>
                        {getStatusText()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        {filename && filename.length > 30 ? filename.substring(0, 27) + '...' : filename}
                    </div>
                </div>
                <div style={{
                    background: getStatusColor(),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}>
                    {result.confidence.toFixed(0)}%
                </div>
            </div>

            {/* NEW: Three-Way Percentage Breakdown */}
            {result.percentages && (
                <div style={{
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    border: '1px solid #bae6fd',
                    borderRadius: '8px',
                    padding: '12px',
                    marginTop: '12px'
                }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0369a1', marginBottom: '10px' }}>
                        🔍 AI Detection Breakdown
                    </div>

                    {/* TRUE (Authentic) */}
                    <div style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#059669' }}>
                                ✅ TRUE (Authentic)
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#059669' }}>
                                {result.percentages.true}%
                            </span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '6px',
                            background: '#dcfce7',
                            borderRadius: '3px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${result.percentages.true}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #10b981, #059669)',
                                transition: 'width 0.5s ease'
                            }} />
                        </div>
                    </div>

                    {/* FAKE (AI-Generated) */}
                    <div style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#dc2626' }}>
                                🤖 FAKE (AI-Generated)
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#dc2626' }}>
                                {result.percentages.fake}%
                            </span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '6px',
                            background: '#fee2e2',
                            borderRadius: '3px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${result.percentages.fake}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                                transition: 'width 0.5s ease'
                            }} />
                        </div>
                    </div>

                    {/* MANIPULATED (Edited) */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#d97706' }}>
                                ✏️ MANIPULATED (Edited)
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#d97706' }}>
                                {result.percentages.manipulated}%
                            </span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '6px',
                            background: '#fed7aa',
                            borderRadius: '3px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${result.percentages.manipulated}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                                transition: 'width 0.5s ease'
                            }} />
                        </div>
                    </div>
                </div>
            )}

            {result.warnings && result.warnings.length > 0 && (
                <div style={{
                    background: '#fef3c7',
                    border: '1px solid #fbbf24',
                    borderRadius: '4px',
                    padding: '8px',
                    marginTop: '8px'
                }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#92400e', marginBottom: '4px' }}>
                        ⚠️ Warnings:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '11px', color: '#78350f' }}>
                        {result.warnings.map((warning, index) => (
                            <li key={index} style={{ marginBottom: '2px' }}>{warning}</li>
                        ))}
                    </ul>
                </div>
            )}

            {result.metadata && (
                <div style={{
                    marginTop: '8px',
                    padding: '6px',
                    background: '#f3f4f6',
                    borderRadius: '4px',
                    fontSize: '10px',
                    color: '#4b5563'
                }}>
                    <div><strong>Format:</strong> {result.metadata.format || 'N/A'}</div>
                    <div><strong>Size:</strong> {result.metadata.width}x{result.metadata.height}</div>
                    {result.metadata.gps && <div>📍 GPS: Enabled</div>}
                    {result.metadata.hasCamera && <div>📷 Camera: Detected</div>}
                </div>
            )}

            {result.verdict && (
                <div style={{
                    marginTop: '8px',
                    fontSize: '11px',
                    color: '#6b7280',
                    fontStyle: 'italic',
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '6px'
                }}>
                    {result.verdict}
                </div>
            )}
        </div>
    );
};

/**
 * Summary component for multiple image verification
 */
export const VerificationSummary = ({ summary }) => {
    if (!summary) return null;

    return (
        <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold' }}>
                🔍 AI Verification Summary
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{summary.total}</div>
                    <div style={{ fontSize: '11px', opacity: 0.9 }}>Total Images</div>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.3)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{summary.authentic}</div>
                    <div style={{ fontSize: '11px' }}>✅ Verified</div>
                </div>
                <div style={{ background: 'rgba(245,158,11,0.3)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{summary.warnings}</div>
                    <div style={{ fontSize: '11px' }}>⚠️ Warnings</div>
                </div>
                <div style={{ background: 'rgba(239,68,68,0.3)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{summary.rejected}</div>
                    <div style={{ fontSize: '11px' }}>❌ Rejected</div>
                </div>
            </div>
            <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '12px', opacity: 0.9 }}>
                Average Confidence: <strong>{summary.averageConfidence?.toFixed(1)}%</strong>
            </div>
        </div>
    );
};

export default ImageVerificationBadge;
