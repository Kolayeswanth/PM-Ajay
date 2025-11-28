import React, { useState, useEffect, useRef } from 'react';
import './MonitorableIndicators.css';

// Hook for number animation
const useCounter = (end, duration = 2000, shouldStart) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!shouldStart) {
            setCount(0); // Reset count when out of view
            return;
        }

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // Ease out quart
            const easeProgress = 1 - Math.pow(1 - progress, 4);

            setCount(Math.floor(easeProgress * end));

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    }, [end, duration, shouldStart]);

    return count;
};

// Gauge Component
const GaugeCard = ({ data, isVisible }) => {
    const { achievement, target, caption } = data;
    const animatedAchievement = useCounter(achievement, 2000, isVisible);

    // Calculate percentage for gauge (max 100%)
    const percentage = Math.min((animatedAchievement / target) * 100, 100);

    // SVG Arc calculations
    const radius = 80;
    const stroke = 20;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    // We only want a semi-circle (half circumference)
    const strokeDasharray = `${circumference} ${circumference}`;
    // Offset for semi-circle (starts at 180deg)
    // Full circle is 0 offset. We want to show only a portion.
    // Actually for a simple semi-circle gauge, CSS rotation is often easier or a specific SVG path.
    // Let's use a simple SVG path approach for the arc.

    // Path for the background arc (180 degrees)
    // M startX startY A radius radius 0 0 1 endX endY
    // Center (100, 100). Radius 80.
    // Start (20, 100). End (180, 100).

    // Calculate end point for the colored arc based on percentage
    // Angle goes from -180 (left) to 0 (right) or similar depending on coord system.
    // Let's say 0 is left (-90deg relative to top) and 180 is right.
    const angle = (percentage / 100) * 180;
    const angleRad = (angle * Math.PI) / 180;

    // We start from left (180 degrees in standard trig, but let's define our own)
    // Center 100,100. Radius 80.
    // Start point: x=20, y=100
    // End point: x = 100 - 80 * cos(angle), y = 100 - 80 * sin(angle) 
    // Wait, standard parametric: x = cx + r*cos(a), y = cy + r*sin(a)
    // We want semi circle from PI to 2PI (if y goes down) or PI to 0.
    // Let's stick to CSS conic gradient or rotation for simplicity and smoothness if possible, 
    // BUT SVG is requested for "big semi-circular gauge".

    // Let's use stroke-dashoffset on a circle rotated -90deg? No, semi-circle.
    // Easiest: Circle with stroke-dasharray = circumference / 2. 
    // Then hide the bottom half.

    const semiCircumference = (Math.PI * 80); // r=80
    const strokeDashoffset = semiCircumference - ((percentage / 100) * semiCircumference);

    return (
        <div className="gauge-card">
            <div className="gauge-wrapper">
                <svg viewBox="0 0 200 110" className="gauge-svg">
                    {/* Background Arc */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#e0e0e0"
                        strokeWidth="25"
                        strokeLinecap="round"
                    />
                    {/* Progress Arc */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#5cb85c"
                        strokeWidth="25"
                        strokeLinecap="round"
                        strokeDasharray={semiCircumference}
                        strokeDashoffset={strokeDashoffset}
                        className="gauge-progress"
                    />
                </svg>
                <div className="gauge-content">
                    <div className="gauge-start">0</div>
                    <div className="gauge-achievement">{animatedAchievement.toLocaleString()}</div>
                    <div className="gauge-target">{target.toLocaleString()}</div>
                </div>
            </div>
            <div className="gauge-caption">{caption}</div>
        </div>
    );
};

// Indicator Card Component
const IndicatorCard = ({ data, isVisible }) => {
    const { title, achievement, target, color } = data;
    const animatedAchievement = useCounter(achievement, 2000, isVisible);
    const percentage = Math.min((animatedAchievement / target) * 100, 100);

    return (
        <div className="indicator-card">
            <div className="indicator-title">{title}</div>
            <div className="indicator-values">
                <span className="indicator-achievement" style={{ color: color }}>
                    {animatedAchievement.toLocaleString()}
                </span>
                <span className="indicator-target">
                    {target.toLocaleString()}
                </span>
            </div>
            <div className="indicator-progress-bg">
                <div
                    className="indicator-progress-fill"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: color
                    }}
                />
            </div>
        </div>
    );
};

const MonitorableIndicators = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false); // Reset when out of view to re-animate on scroll back? 
                    // User asked: "Re-run on each page refresh when the user scrolls down to this section again."
                    // Usually this means once per session or reset on exit. 
                    // "Trigger only when the section becomes visible... Re-run on each page refresh" -> implies normal scroll trigger.
                    // Let's keep it simple: trigger when visible. If they scroll away and back, maybe keep it?
                    // "Re-run on each page refresh" usually means if I reload and scroll, it runs.
                    // I will make it run every time it enters the viewport for visual effect as requested "Re-run... when the user scrolls down to this section again" implies reset.
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    const gauges = [
        { achievement: 1491, target: 7463, caption: "Villages provided adequate source of drinking water" },
        { achievement: 1061, target: 4469, caption: "Villages provided toilets in Schools" },
        { achievement: 1334, target: 5208, caption: "No. of villages connected with all weather road" },
        { achievement: 224, target: 1149, caption: "No. of villages electrified" }
    ];

    const indicators = [
        // Row 1
        { title: "No. of Households provided IHHL", achievement: 345245, target: 668772, color: "#5cb85c" }, // Green
        { title: "No. of Children enrolled in Primary School", achievement: 51732, target: 90336, color: "#d9534f" }, // Red
        { title: "No. of Children enrolled in Middle School", achievement: 25126, target: 45345, color: "#f0ad4e" }, // Yellow
        { title: "No. of Households covered under Health Protection Scheme", achievement: 405258, target: 838683, color: "#428bca" }, // Blue

        // Row 2
        { title: "No. of Children immunised", achievement: 6534, target: 12541, color: "#428bca" }, // Blue
        { title: "No. of Households provided AWAS under PMAY-G", achievement: 399561, target: 1103069, color: "#9b59b6" }, // Purple
        { title: "No. of women provided widow pension", achievement: 28563, target: 62866, color: "#1abc9c" }, // Teal
        { title: "No. of person provided old age Pension", achievement: 75823, target: 165624, color: "#808000" }, // Olive

        // Row 3
        { title: "No. of person provided Disability Pension", achievement: 14977, target: 30039, color: "#556b2f" }, // Dark Olive
        { title: "Length of internal Roads constructed (km.)", achievement: 6931, target: 32395, color: "#00ced1" }, // Cyan/Teal
        { title: "No. of Aaganwadi Centers constructed", achievement: 0, target: 11502, color: "#d9534f" }, // Red
        { title: "No. of Households provided Electricity Connections", achievement: 159676, target: 314095, color: "#555555" }, // Dark Grey

        // Row 4
        { title: "No. of Households provided LPG connection under UJJAWALA", achievement: 184280, target: 364527, color: "#5cb85c" }, // Green
        { title: "No. of villages connected with internet", achievement: 513, target: 2387, color: "#d9534f" }, // Red
        { title: "No. of youths imparted the Skill Development Training", achievement: 203088, target: 472821, color: "#f0ad4e" }, // Yellow/Orange
        { title: "No. of persons joined SHG", achievement: 130331, target: 303322, color: "#428bca" } // Blue
    ];

    return (
        <div className="monitorable-indicators" ref={sectionRef}>
            <div className="mi-header">
                <h2>Monitorable Indicators</h2>
            </div>

            {/* Top Section - Gauges */}
            <div className="mi-top-section">
                <div className="container">
                    <div className="gauges-grid">
                        {gauges.map((gauge, index) => (
                            <GaugeCard key={index} data={gauge} isVisible={isVisible} />
                        ))}
                    </div>
                    <div className="mi-legend">
                        <div className="legend-item">
                            <span className="legend-dot green"></span> Achievement
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot blue"></span> Target
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section - Indicators */}
            <div className="mi-bottom-section">
                <div className="container">
                    <div className="indicators-grid">
                        {indicators.map((indicator, index) => (
                            <IndicatorCard key={index} data={indicator} isVisible={isVisible} />
                        ))}
                    </div>
                    <div className="mi-legend-bottom">
                        Other Colors: Achievement <span className="color-samples">
                            <span className="sample red"></span>
                            <span className="sample yellow"></span>
                            <span className="sample blue"></span>
                        </span> and Target
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonitorableIndicators;
