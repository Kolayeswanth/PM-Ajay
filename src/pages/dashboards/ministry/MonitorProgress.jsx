import React, { useState, useEffect } from 'react';
import IndiaMap from '../../../components/maps/IndiaMap';
import StatCard from '../../../components/StatCard';

const THEME = {
    primary: '#7C3AED',
    secondary: '#EC4899',
    accent: '#F59E0B',
    background: '#F5F3FF',
    text: '#4C1D95',
    textLight: '#6B7280',
    white: '#FFFFFF',
    grid: '#E5E7EB',
    completed: '#10B981',
    pending: '#F59E0B',
    notStarted: '#EF4444',
};

const generateStateData = (stateName) => {
    const generateTrend = (type) => {
        const data = [];
        let current = 0;

        if (type === 'up') {
            current = Math.floor(Math.random() * 20) + 10;
            for (let i = 0; i < 6; i++) {
                data.push(current);
                current += Math.floor(Math.random() * 15) + 5;
                if (current > 100) current = 100;
            }
        } else if (type === 'down') {
            current = Math.floor(Math.random() * 30) + 60;
            for (let i = 0; i < 6; i++) {
                data.push(current);
                current -= Math.floor(Math.random() * 15) + 5;
                if (current < 0) current = 0;
            }
        } else {
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
                { label: 'Completed', values: generateTrend('up'), color: THEME.completed },
                { label: 'Pending', values: generateTrend('random'), color: THEME.pending },
                { label: 'Not Started', values: generateTrend('down'), color: THEME.notStarted }
            ]
        },
        components: {
            'Adarsh Gram': { progress: Math.floor(Math.random() * 30) + 70, color: '#7C3AED' },
            'GIA': { progress: Math.floor(Math.random() * 40) + 40, color: '#EC4899' },
            'Hostel': { progress: Math.floor(Math.random() * 30) + 20, color: '#F59E0B' }
        }
    };
};

// Generate national overview data for each component
const generateNationalOverview = (component) => {
    const baseValue = component === 'All Components' ? 78 :
        component === 'Adarsh Gram' ? 85 :
            component === 'GIA' ? 72 :
                component === 'Hostel' ? 65 : 78;

    return {
        utilization: baseValue,
        completed: component === 'All Components' ? 65 :
            component === 'Adarsh Gram' ? 75 :
                component === 'GIA' ? 60 :
                    component === 'Hostel' ? 55 : 65,
        beneficiaries: component === 'All Components' ? '1.2M' :
            component === 'Adarsh Gram' ? '450K' :
                component === 'GIA' ? '520K' :
                    component === 'Hostel' ? '230K' : '1.2M'
    };
};

const AnimatedLineChart = ({ data, height = 300 }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(false);
        const timer = setTimeout(() => setAnimate(true), 50);
        return () => clearTimeout(timer);
    }, [data]);

    const width = 500;
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
        <div style={{ width: '100%', position: 'relative', padding: '10px 0' }}>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                {[0, 25, 50, 75, 100].map((tick, i) => {
                    const y = height - padding - (tick / maxY) * graphHeight;
                    return (
                        <g key={i}>
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke={THEME.grid} strokeWidth="1" strokeDasharray="4 4" />
                            <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="10" fill={THEME.textLight}>{tick}%</text>
                        </g>
                    );
                })}

                {data.datasets.map((dataset, idx) => {
                    const pathD = generatePath(dataset.values);
                    const pathLength = 1500;

                    return (
                        <g key={idx}>
                            <path
                                d={pathD}
                                fill="none"
                                stroke={dataset.color}
                                strokeWidth="3"
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
                        </g>
                    );
                })}

                {data.datasets.map((dataset, idx) => (
                    <g key={`points-${idx}`} style={{ opacity: (hoveredIndex === null || hoveredIndex === idx) ? 1 : 0.1 }}>
                        {dataset.values.map((val, i) => {
                            const x = padding + (i / (dataset.values.length - 1)) * graphWidth;
                            const y = height - padding - (val / maxY) * graphHeight;
                            return (
                                <g key={i}>
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={animate ? 4 : 0}
                                        fill="white"
                                        stroke={dataset.color}
                                        strokeWidth="2"
                                        style={{ transition: 'r 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.2s' }}
                                    />
                                </g>
                            );
                        })}
                    </g>
                ))}

                {data.months.map((month, i) => {
                    const x = padding + (i / (data.months.length - 1)) * graphWidth;
                    return (
                        <text key={i} x={x} y={height - 10} textAnchor="middle" fontSize="10" fill={THEME.textLight} fontWeight="500">
                            {month}
                        </text>
                    );
                })}
            </svg>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                {data.datasets.map((dataset, idx) => (
                    <div
                        key={idx}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', opacity: (hoveredIndex === null || hoveredIndex === idx) ? 1 : 0.4, transition: 'opacity 0.3s' }}
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dataset.color }}></div>
                        <span style={{ fontSize: '11px', fontWeight: '500', color: THEME.text }}>{dataset.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PieChart = ({ data, size = 200 }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(false);
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, [data]);

    const percentage = (data.utilized / data.total) * 100;
    const radius = size / 2;
    const strokeWidth = 30;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg height={size} width={size} style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                        stroke="#E5E7EB"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <circle
                        stroke={THEME.primary}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{
                            strokeDashoffset: animate ? strokeDashoffset : circumference,
                            transition: 'stroke-dashoffset 1.5s ease-out'
                        }}
                        strokeLinecap="round"
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                </svg>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: THEME.text }}>
                        {Math.round(percentage)}%
                    </div>
                    <div style={{ fontSize: '12px', color: THEME.textLight }}>Utilized</div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: THEME.primary }}></div>
                    <span style={{ color: THEME.text }}>Utilized: ₹{data.utilized} Cr</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#E5E7EB' }}></div>
                    <span style={{ color: THEME.textLight }}>Remaining: ₹{data.total - data.utilized} Cr</span>
                </div>
            </div>
        </div>
    );
};

const ComponentProgressChart = ({ component, progress }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(false);
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, [component, progress]);

    const maxValue = 100;
    const chartHeight = 200;
    const barHeight = (progress / maxValue) * (chartHeight - 50);

    return (
        <div style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: THEME.text, marginBottom: '16px', textAlign: 'center' }}>
                {component} Progress
            </h4>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: chartHeight }}>
                <div style={{ width: '60%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '100%',
                        height: animate ? `${barHeight}px` : '0px',
                        backgroundColor: component === 'Adarsh Gram' ? '#7C3AED' : component === 'GIA' ? '#EC4899' : '#F59E0B',
                        borderRadius: '8px 8px 0 0',
                        transition: 'height 1s ease-out',
                        position: 'relative',
                        boxShadow: `0 4px 12px ${component === 'Adarsh Gram' ? '#7C3AED' : component === 'GIA' ? '#EC4899' : '#F59E0B'}40`
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-25px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: component === 'Adarsh Gram' ? '#7C3AED' : component === 'GIA' ? '#EC4899' : '#F59E0B',
                            opacity: animate ? 1 : 0,
                            transition: 'opacity 0.5s ease 1s',
                            whiteSpace: 'nowrap'
                        }}>
                            {progress}%
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: THEME.text }}>{component}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MonitorProgress = () => {
    const [selectedState, setSelectedState] = useState(null);
    const [selectedComponent, setSelectedComponent] = useState('All Components');
    const [stateData, setStateData] = useState(null);
    const [nationalOverview, setNationalOverview] = useState(generateNationalOverview('All Components'));

    useEffect(() => {
        if (selectedState) {
            setStateData(generateStateData(selectedState));
        } else {
            setStateData(null);
        }
    }, [selectedState]);

    useEffect(() => {
        setNationalOverview(generateNationalOverview(selectedComponent));
    }, [selectedComponent]);

    const handleComponentChange = (e) => {
        setSelectedComponent(e.target.value);
    };

    return (
        <div className="dashboard-panel" style={{ backgroundColor: '#F9FAFB' }}>
            <div className="section-header" style={{ marginBottom: '24px' }}>
                <h2 className="section-title" style={{ color: THEME.text }}>Monitor Progress</h2>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <select
                            className="form-select"
                            value={selectedComponent}
                            onChange={handleComponentChange}
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
                </div>
            </div>

            <div className="dashboard-section">
                <div className="kpi-row">
                    <StatCard icon="📈" value={`${nationalOverview.utilization}%`} label={`${selectedComponent} Utilization`} color={THEME.primary} />
                    <StatCard icon="🏗" value={`${nationalOverview.completed}%`} label="Projects Completed" color={THEME.secondary} />
                    <StatCard icon="👥" value={nationalOverview.beneficiaries} label="Total Beneficiaries" color={THEME.accent} />
                </div>
            </div>

            <div className="dashboard-section" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                <div className="card" style={{ padding: '0', minHeight: '700px', overflow: 'hidden', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #F3F4F6', backgroundColor: 'white' }}>
                        <h3 className="section-title" style={{ marginBottom: '4px', color: THEME.text, fontSize: '20px' }}>
                            {selectedComponent} - Geographic Overview
                        </h3>
                        <p style={{ fontSize: '14px', color: '#6B7280', margin: '0' }}>
                            {selectedState ? `Selected: ${selectedState}` : 'Click on a state to view detailed progress'}
                        </p>
                    </div>
                    <div style={{ height: '650px', width: '100%' }}>
                        <IndiaMap onStateSelect={setSelectedState} />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card" style={{ padding: '20px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        {stateData ? (
                            <>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', color: THEME.text, marginBottom: '16px', textAlign: 'center' }}>
                                    Fund Utilization - {stateData.name}
                                </h4>
                                <PieChart data={stateData.fundUtilization} size={180} />
                            </>
                        ) : (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF' }}>
                                <div style={{ fontSize: '40px', marginBottom: '8px', opacity: 0.5 }}>💰</div>
                                <h4 style={{ fontSize: '14px', color: THEME.text, marginBottom: '4px' }}>No State Selected</h4>
                                <p style={{ fontSize: '12px', color: '#6B7280' }}>Click on a state to view fund utilization</p>
                            </div>
                        )}
                    </div>

                    <div className="card" style={{ padding: '0', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        {stateData && selectedComponent !== 'All Components' ? (
                            <ComponentProgressChart
                                component={selectedComponent}
                                progress={stateData.components[selectedComponent].progress}
                            />
                        ) : stateData && selectedComponent === 'All Components' ? (
                            <div style={{ padding: '20px' }}>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', color: THEME.text, marginBottom: '16px', textAlign: 'center' }}>
                                    All Components Progress
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {Object.entries(stateData.components).map(([name, data]) => (
                                        <div key={name}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: THEME.text }}>
                                                <span>{name}</span>
                                                <span>{data.progress}%</span>
                                            </div>
                                            <div style={{ height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${data.progress}%`,
                                                    height: '100%',
                                                    backgroundColor: data.color,
                                                    borderRadius: '4px',
                                                    transition: 'width 0.8s ease'
                                                }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF' }}>
                                <div style={{ fontSize: '40px', marginBottom: '8px', opacity: 0.5 }}>📊</div>
                                <h4 style={{ fontSize: '14px', color: THEME.text, marginBottom: '4px' }}>No State Selected</h4>
                                <p style={{ fontSize: '12px', color: '#6B7280' }}>Click on a state to view components</p>
                            </div>
                        )}
                    </div>

                    <div className="card" style={{ padding: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', flex: 1 }}>
                        {stateData ? (
                            <>
                                <h4 style={{ fontSize: '15px', fontWeight: '600', color: THEME.text, marginBottom: '8px', textAlign: 'center' }}>
                                    Project Trends
                                </h4>
                                <AnimatedLineChart data={stateData.projectTrends} height={180} />
                            </>
                        ) : (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF' }}>
                                <div style={{ fontSize: '40px', marginBottom: '8px', opacity: 0.5 }}>📈</div>
                                <h4 style={{ fontSize: '14px', color: THEME.text, marginBottom: '4px' }}>No State Selected</h4>
                                <p style={{ fontSize: '12px', color: '#6B7280' }}>Click on a state to view trends</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonitorProgress;