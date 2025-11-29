import React, { useState, useEffect } from 'react';
import IndiaMap from '../../../components/maps/IndiaMap';
import StatCard from '../../../components/StatCard';

// Purple Theme Colors
const THEME = {
    primary: '#7C3AED',    // Violet 600
    secondary: '#EC4899',  // Pink 500
    accent: '#F59E0B',     // Amber 500
    background: '#F5F3FF', // Violet 50
    text: '#4C1D95',       // Violet 900
    textLight: '#6B7280',  // Gray 500
    white: '#FFFFFF',
    grid: '#E5E7EB',       // Gray 200
};

// Mock Data Generator - Dynamic Trends per State
const generateStateData = (stateName) => {
    // Helper to generate unique random trends for each state
    const generateTrend = (type) => {
        const data = [];
        let current = 0;

        if (type === 'up') {
            // Completed: Generally increasing
            current = Math.floor(Math.random() * 20) + 10;
            for (let i = 0; i < 6; i++) {
                data.push(current);
                current += Math.floor(Math.random() * 15) + 5;
                if (current > 100) current = 100;
            }
        } else if (type === 'down') {
            // Not Started: Generally decreasing
            current = Math.floor(Math.random() * 30) + 60;
            for (let i = 0; i < 6; i++) {
                data.push(current);
                current -= Math.floor(Math.random() * 15) + 5;
                if (current < 0) current = 0;
            }
        } else {
            // Pending: Fluctuating
            current = Math.floor(Math.random() * 20) + 20;
            for (let i = 0; i < 6; i++) {
                data.push(current);
                current += Math.floor(Math.random() * 20) - 10;
                if (current < 0) current = 0;
                if (current > 100) current = 100;
            }
        }
        return data;
    };

    return {
        name: stateName,
        fundUtilization: {
            utilized: Math.floor(Math.random() * 60) + 30,
            total: 100
        },
        projectTrends: {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Completed',
                    values: generateTrend('up'),
                    color: THEME.primary
                },
                {
                    label: 'Pending',
                    values: generateTrend('random'),
                    color: THEME.secondary
                },
                {
                    label: 'Not Started',
                    values: generateTrend('down'),
                    color: THEME.accent
                }
            ]
        },
        components: [
            { name: 'Adarsh Gram', progress: Math.floor(Math.random() * 30) + 70, color: '#7C3AED' },
            { name: 'Grants-in-aid', progress: Math.floor(Math.random() * 40) + 40, color: '#EC4899' },
            { name: 'Hostels', progress: Math.floor(Math.random() * 30) + 20, color: '#F59E0B' }
        ]
    };
};

// Animated Multi-Line Chart
const AnimatedLineChart = ({ data, height = 300 }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [animate, setAnimate] = useState(false);

    // Trigger animation on mount or data change
    useEffect(() => {
        setAnimate(false);
        // Small delay to allow react to render the initial state before animating
        const timer = setTimeout(() => setAnimate(true), 50);
        return () => clearTimeout(timer);
    }, [data]);

    const width = 600;
    const padding = 50;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;
    const maxY = 100;

    const generatePath = (values) => {
        const points = values.map((val, i) => {
            const x = padding + (i / (values.length - 1)) * graphWidth;
            const y = height - padding - (val / maxY) * graphHeight;
            return `${x},${y}`;
        });

        if (points.length === 0) return '';

        // Smooth Curve (Catmull-Rom to Cubic Bezier)
        let d = `M ${points[0]}`;
        for (let i = 0; i < points.length - 1; i++) {
            const [x0, y0] = points[Math.max(i - 1, 0)].split(',').map(Number);
            const [x1, y1] = points[i].split(',').map(Number);
            const [x2, y2] = points[i + 1].split(',').map(Number);
            const [x3, y3] = points[Math.min(i + 2, points.length - 1)].split(',').map(Number);

            const cp1x = x1 + (x2 - x0) / 6;
            const cp1y = y1 + (y2 - y0) / 6;
            const cp2x = x2 - (x3 - x1) / 6;
            const cp2y = y2 - (y3 - y1) / 6;

            d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
        }
        return d;
    };

    return (
        <div style={{ width: '100%', position: 'relative' }}>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                {/* Grid & Y-Axis */}
                {[0, 25, 50, 75, 100].map((tick, i) => {
                    const y = height - padding - (tick / maxY) * graphHeight;
                    return (
                        <g key={i}>
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke={THEME.grid} strokeWidth="1" strokeDasharray="4 4" />
                            <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="12" fill={THEME.textLight}>{tick}%</text>
                        </g>
                    );
                })}

                {/* Lines with Animation */}
                {data.datasets.map((dataset, idx) => {
                    const pathD = generatePath(dataset.values);
                    const pathLength = 1500; // Increased length for smoother animation

                    return (
                        <g key={idx}>
                            <path
                                d={pathD}
                                fill="none"
                                stroke={dataset.color}
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeDasharray={pathLength}
                                strokeDashoffset={animate ? 0 : pathLength}
                                style={{
                                    transition: 'stroke-dashoffset 1.5s ease-out',
                                    opacity: (hoveredIndex === null || hoveredIndex === idx) ? 1 : 0.3
                                }}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            />
                            {/* Line Label at the end */}
                            <text
                                x={width - padding + 10}
                                y={height - padding - (dataset.values[dataset.values.length - 1] / maxY) * graphHeight}
                                fill={dataset.color}
                                fontSize="12"
                                fontWeight="bold"
                                alignmentBaseline="middle"
                                style={{ opacity: animate ? 1 : 0, transition: 'opacity 0.5s ease 1.5s' }}
                            >
                                {dataset.label}
                            </text>
                        </g>
                    );
                })}

                {/* Interactive Points & Tooltips */}
                {data.datasets.map((dataset, idx) => (
                    <g key={`points-${idx}`} style={{ opacity: (hoveredIndex === null || hoveredIndex === idx) ? 1 : 0.1 }}>
                        {dataset.values.map((val, i) => {
                            const x = padding + (i / (dataset.values.length - 1)) * graphWidth;
                            const y = height - padding - (val / maxY) * graphHeight;
                            return (
                                <g key={i} className="chart-point">
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={animate ? 5 : 0}
                                        fill="white"
                                        stroke={dataset.color}
                                        strokeWidth="2"
                                        style={{ transition: 'r 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.2s' }}
                                    />
                                    {/* Tooltip Value */}
                                    <text
                                        x={x}
                                        y={y - 10}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fontWeight="bold"
                                        fill={dataset.color}
                                        style={{ opacity: animate ? 1 : 0, transition: 'opacity 0.5s ease 1.5s' }}
                                    >
                                        {val}%
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                ))}

                {/* X-Axis Labels */}
                {data.months.map((month, i) => {
                    const x = padding + (i / (data.months.length - 1)) * graphWidth;
                    return (
                        <text key={i} x={x} y={height - 10} textAnchor="middle" fontSize="12" fill={THEME.textLight} fontWeight="500">
                            {month}
                        </text>
                    );
                })}
            </svg>

            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: THEME.textLight }}>
                Hover over lines to highlight specific trends.
            </div>
        </div>
    );
};

// Donut Chart (Unchanged)
const DonutChart = ({ value, total, color, label, size = 160 }) => {
    const radius = size / 2;
    const strokeWidth = 15;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (value / total) * circumference;

    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg height={size} width={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle stroke="#E5E7EB" strokeWidth={strokeWidth} fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
                <circle
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
                    strokeLinecap="round"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: THEME.text }}>{Math.round((value / total) * 100)}%</span>
                <br />
                <span style={{ fontSize: '12px', color: THEME.textLight }}>{label}</span>
            </div>
        </div>
    );
};

const MonitorProgress = () => {
    const [selectedState, setSelectedState] = useState(null);
    const [stateData, setStateData] = useState(null);

    useEffect(() => {
        if (selectedState) {
            setStateData(generateStateData(selectedState));
        } else {
            setStateData(null);
        }
    }, [selectedState]);

    return (
        <div className="dashboard-panel" style={{ backgroundColor: '#F9FAFB' }}>
            <div className="section-header" style={{ marginBottom: '24px' }}>
                <h2 className="section-title" style={{ color: THEME.text }}>Monitor Progress</h2>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <select
                            className="form-select"
                            style={{
                                appearance: 'none',
                                padding: '10px 40px 10px 20px',
                                borderRadius: '50px',
                                border: `1px solid ${THEME.primary}`,
                                backgroundColor: 'white',
                                color: THEME.text,
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.1)',
                                outline: 'none',
                                backgroundImage: 'none',
                                minWidth: '180px'
                            }}
                        >
                            <option>All Components</option>
                            <option>Adarsh Gram</option>
                            <option>GIA</option>
                            <option>Hostel</option>
                        </select>
                        <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: THEME.primary, fontSize: '12px' }}>
                            ▼
                        </div>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="date"
                            className="form-input"
                            style={{
                                padding: '10px 20px',
                                borderRadius: '50px',
                                border: `1px solid ${THEME.primary}`,
                                backgroundColor: 'white',
                                color: THEME.text,
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.1)',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="dashboard-section">
                <div className="kpi-row">
                    <StatCard icon="📈" value="78%" label="National Utilization" color={THEME.primary} />
                    <StatCard icon="🏗" value="65%" label="Projects Completed" color={THEME.secondary} />
                    <StatCard icon="👥" value="1.2M" label="Total Beneficiaries" color={THEME.accent} />
                </div>
            </div>

            <div className="dashboard-section" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-6)' }}>
                {/* Map Section */}
                <div className="card" style={{ padding: '0', minHeight: '500px', overflow: 'hidden', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid #F3F4F6', backgroundColor: 'white' }}>
                        <h3 className="section-title" style={{ marginBottom: '0', color: THEME.text }}>Geographic Overview</h3>
                        <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0 0' }}>
                            Click on a state to view detailed progress.
                        </p>
                    </div>
                    <div style={{ height: '500px', width: '100%' }}>
                        <IndiaMap onStateSelect={setSelectedState} />
                    </div>
                </div>

                {/* Details Section */}
                <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    {stateData ? (
                        <>
                            <div style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: '16px' }}>
                                <h3 className="section-title" style={{ color: THEME.text, fontSize: '24px', marginBottom: '4px' }}>
                                    {stateData.name}
                                </h3>
                                <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>Comprehensive Progress Report</p>
                            </div>

                            {/* 1. Fund Utilization (Donut) */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: THEME.background, padding: '16px', borderRadius: '12px' }}>
                                <div>
                                    <h4 style={{ fontSize: '16px', color: THEME.text, fontWeight: '600', marginBottom: '4px' }}>Fund Utilization</h4>
                                    <p style={{ fontSize: '12px', color: THEME.textLight }}>Allocated vs Utilized</p>
                                </div>
                                <DonutChart
                                    value={stateData.fundUtilization.utilized}
                                    total={stateData.fundUtilization.total}
                                    color={THEME.primary}
                                    label="Utilized"
                                    size={100}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {stateData.components.map((comp, idx) => (
                                    <div key={idx}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: THEME.text }}>
                                            <span>{comp.name}</span>
                                            <span>{comp.progress}%</span>
                                        </div>
                                        <div style={{ height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${comp.progress}%`,
                                                height: '100%',
                                                backgroundColor: comp.color,
                                                borderRadius: '4px',
                                                transition: 'width 0.8s ease'
                                            }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', textAlign: 'center', padding: '32px' }}>
                            <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>🗺</div>
                            <h3 style={{ fontSize: '18px', color: THEME.text, marginBottom: '8px' }}>Select a State</h3>
                            <p style={{ maxWidth: '250px', color: '#6B7280' }}>Click on any state in the map to view detailed progress reports.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MonitorProgress;