import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import { indiaDistrictsGeoJSON } from '../../data/geoData';
import { districts, mockProjects } from '../../data/mockData';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Component to handle map bounds updates
const MapUpdater = ({ bounds }) => {
    const map = useMap();

    useEffect(() => {
        if (bounds && bounds.isValid()) {
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }, [bounds, map]);

    return null;
};

const DistrictMap = ({ state = 'Maharashtra', onDistrictSelect }) => {
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [showProjects, setShowProjects] = useState(true);

    const districtData = districts[state] || [];
    const stateProjects = mockProjects.filter(p => p.state === state);

    const normalizeStateName = (geoJsonName) => {
        const nameMapping = {
            'Orissa': 'Odisha',
            'Uttaranchal': 'Uttarakhand',
            'Andaman and Nicobar': 'Andaman & Nicobar Islands',
            'Pondicherry': 'Puducherry',
            'Dadra and Nagar Haveli': 'Dadra & Nagar Haveli and Daman & Diu',
            'Daman and Diu': 'Dadra & Nagar Haveli and Daman & Diu',
            'Telangana': 'Andhra Pradesh', // Mapping Telangana to AP for pre-2014 data
            'Andhra Pradesh': 'Andhra Pradesh'
        };
        // If the input is one of our keys (modern name), map it to the GeoJSON name (legacy)
        // Wait, the input here is from GeoJSON (legacy). 
        // We need to match the PROP passed to the component (modern) with the GeoJSON property (legacy).

        // Actually, the filter logic is: normalize(feature.NAME_1) === state (modern).
        // So normalize should take Legacy -> Modern.
        // 'Andhra Pradesh' (Legacy) -> 'Andhra Pradesh' (Modern).
        // But 'Telangana' (Modern) passed as prop.
        // So we need to check if feature.NAME_1 matches the mapped version of state.

        // Let's reverse the logic slightly for clarity in the filter.
        return nameMapping[geoJsonName] || geoJsonName;
    };

    // Helper to map Prop State Name -> GeoJSON State Name
    const getGeoJSONStateName = (modernStateName) => {
        const mapping = {
            'Odisha': 'Orissa',
            'Uttarakhand': 'Uttaranchal',
            'Andaman & Nicobar Islands': 'Andaman and Nicobar',
            'Puducherry': 'Puducherry', // Check spelling
            'Telangana': 'Andhra Pradesh', // Show AP map for Telangana
            'Andhra Pradesh': 'Andhra Pradesh'
        };
        return mapping[modernStateName] || modernStateName;
    };

    // Filter GeoJSON for the selected state
    const stateDistrictsGeoJSON = useMemo(() => {
        if (!indiaDistrictsGeoJSON) return null;

        const targetGeoJSONName = getGeoJSONStateName(state);

        return {
            ...indiaDistrictsGeoJSON,
            features: indiaDistrictsGeoJSON.features.filter(feature =>
                feature.properties.NAME_1 === targetGeoJSONName
            )
        };
    }, [state]);

    // Calculate bounds
    const mapBounds = useMemo(() => {
        if (stateDistrictsGeoJSON && stateDistrictsGeoJSON.features.length > 0) {
            return L.geoJSON(stateDistrictsGeoJSON).getBounds();
        }
        return null;
    }, [stateDistrictsGeoJSON]);

    const getDistrictColor = (districtName) => {
        // Uniform color to match the requested style (Pink)
        return '#FCE7F3';
    };

    const onEachDistrict = (feature, layer) => {
        const districtName = feature.properties.NAME_2 || feature.properties.name; // NAME_2 is usually district name in this dataset
        const district = districtData.find(d => d.name === districtName);

        layer.setStyle({
            fillColor: getDistrictColor(districtName),
            weight: 1.5,
            opacity: 1,
            color: '#DB2777', // Dark Pink border
            fillOpacity: 1
        });

        layer.on({
            mouseover: (e) => {
                e.target.setStyle({
                    weight: 2.5,
                    color: '#9D174D', // Darker Pink on hover
                    fillOpacity: 0.9,
                    fillColor: '#FBCFE8' // Slightly darker pink fill
                });
            },
            mouseout: (e) => {
                e.target.setStyle({
                    weight: 1.5,
                    color: '#DB2777',
                    fillOpacity: 1,
                    fillColor: '#FCE7F3'
                });
            },
            click: (e) => {
                setSelectedDistrict(districtName);
                if (onDistrictSelect) {
                    onDistrictSelect(districtName);
                }
            }
        });

        if (district) {
            layer.bindPopup(`
        <div style="font-family: var(--font-primary); padding: 8px;">
          <h3 style="margin: 0 0 8px 0; color: var(--color-navy); font-size: 16px;">
            ${districtName} District
          </h3>
          <p style="margin: 4px 0; font-size: 14px;">
            <strong>Projects:</strong> ${district.projects}
          </p>
          <p style="margin: 4px 0; font-size: 14px;">
            <strong>Progress:</strong> ${district.progress}%
          </p>
          <p style="margin: 4px 0; font-size: 14px;">
            <strong>Fund Allocated:</strong> ₹${(district.fundAllocated / 10000000).toFixed(2)} Cr
          </p>
        </div>
      `);
        } else {
            layer.bindPopup(`
        <div style="font-family: var(--font-primary); padding: 8px;">
          <h3 style="margin: 0 0 8px 0; color: var(--color-navy); font-size: 16px;">
            ${districtName}
          </h3>
          <p style="margin: 4px 0; font-size: 14px; color: #666;">
            No specific data available.
          </p>
        </div>
      `);
        }

        // Add Label using Tooltip
        layer.bindTooltip(districtName, {
            permanent: true,
            direction: 'center',
            className: 'district-label',
            opacity: 1
        });

    };

    // Create custom icons for different project types
    const getProjectIcon = (component) => {
        const colors = {
            'Adarsh Gram': '#FF9933',
            'GIA (Grant-in-Aid)': '#138808',
            'Hostel': '#000080'
        };

        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="
        background-color: ${colors[component] || '#3B82F6'};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
    };

    return (
        <div className="map-container">
            <MapContainer
                center={[22, 79]} // Default center
                zoom={6}
                style={{ height: '100%', width: '100%', backgroundColor: '#F3F4F6' }}
                scrollWheelZoom={true}
                doubleClickZoom={false}
                dragging={true}
                zoomControl={false}
            >
                {/* Update map bounds when state changes */}
                <MapUpdater bounds={mapBounds} />

                {/* TileLayer removed for clean vector map look */}

                {stateDistrictsGeoJSON && (
                    <GeoJSON
                        key={state} // Force re-mount of GeoJSON when state changes
                        data={stateDistrictsGeoJSON}
                        onEachFeature={onEachDistrict}
                    />
                )}

                {/* Project Markers */}
                {showProjects && stateProjects.map(project => (
                    <Marker
                        key={project.id}
                        position={project.coordinates}
                        icon={getProjectIcon(project.component)}
                    >
                        <Popup>
                            <div style={{ fontFamily: 'var(--font-primary)', minWidth: '250px' }}>
                                <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-navy)', fontSize: '14px' }}>
                                    {project.name}
                                </h3>
                                <div style={{ fontSize: '12px' }}>
                                    <p style={{ margin: '4px 0' }}>
                                        <strong>Component:</strong> {project.component}
                                    </p>
                                    <p style={{ margin: '4px 0' }}>
                                        <strong>Status:</strong>
                                        <span className={`badge badge-${project.status.toLowerCase()}`} style={{ marginLeft: '4px' }}>
                                            {project.status}
                                        </span>
                                    </p>
                                    <p style={{ margin: '4px 0' }}>
                                        <strong>Progress:</strong> {project.progress}%
                                    </p>
                                    <div className="progress-bar" style={{ margin: '8px 0' }}>
                                        <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                                    </div>
                                    <p style={{ margin: '4px 0' }}>
                                        <strong>Fund Allocated:</strong> ₹{(project.fundAllocated / 100000).toFixed(2)} L
                                    </p>
                                    <p style={{ margin: '4px 0' }}>
                                        <strong>Department:</strong> {project.department}
                                    </p>
                                    <p style={{ margin: '4px 0' }}>
                                        <strong>Agency:</strong> {project.agency}
                                    </p>
                                    <p style={{ margin: '4px 0', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                                        Last Updated: {project.lastUpdate}
                                    </p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Controls */}
            <div style={{
                position: 'absolute',
                top: 'var(--space-4)',
                right: 'var(--space-4)',
                backgroundColor: 'var(--bg-primary)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 1000
            }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={showProjects}
                        onChange={(e) => setShowProjects(e.target.checked)}
                    />
                    <span style={{ fontSize: 'var(--text-sm)' }}>Show Projects</span>
                </label>
            </div>

            {/* Legend */}
            {/* Legend Removed as per new uniform styling */}

        </div>
    );
};

export default DistrictMap;
