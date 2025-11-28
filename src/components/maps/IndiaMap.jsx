import React, { useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import { indiaGeoJSON } from '../../data/geoData';
import { states, districts } from '../../data/mockData';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const IndiaMap = ({ onStateSelect }) => {
  const [selectedState, setSelectedState] = useState(null);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [districtModalState, setDistrictModalState] = useState(null);

  const getStateColor = (stateName) => {
    // Uniform color to match the requested style (Light Blue/Purple)
    return '#E0E7FF';
  };

  const normalizeStateName = (geoJsonName) => {
    const nameMapping = {
      'Orissa': 'Odisha',
      'Uttaranchal': 'Uttarakhand',
      'Andaman and Nicobar': 'Andaman & Nicobar Islands',
      'Pondicherry': 'Puducherry',
      'Dadra and Nagar Haveli': 'Dadra & Nagar Haveli and Daman & Diu',
      'Daman and Diu': 'Dadra & Nagar Haveli and Daman & Diu'
    };
    return nameMapping[geoJsonName] || geoJsonName;
  };

  const handleViewDistricts = (stateName) => {
    setDistrictModalState(stateName);
    setShowDistrictModal(true);
  };

  const mapStyle = (feature) => {
    const geoJsonName = feature.properties.NAME_1;
    const stateName = normalizeStateName(geoJsonName);

    return {
      fillColor: getStateColor(stateName),
      weight: 1.5,
      opacity: 1,
      color: '#4338CA', // Dark Blue border
      fillOpacity: 1
    };
  };

  const onEachState = (feature, layer) => {
    const geoJsonName = feature.properties.NAME_1;
    const stateName = normalizeStateName(geoJsonName);
    const stateData = states.find(s => s.name === stateName);

    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 2.5,
          color: '#312E81', // Darker Navy on hover
          fillOpacity: 0.9,
          fillColor: '#C7D2FE' // Slightly darker fill on hover
        });
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 1.5,
          color: '#4338CA',
          fillOpacity: 1,
          fillColor: '#E0E7FF'
        });
      },
      click: (e) => {
        // Allow clicking the state polygon directly to drill down
        setSelectedState(stateName);
        if (onStateSelect) {
          onStateSelect(stateName);
        }
      }
    });

    // Create Popup Content using DOM elements
    const container = document.createElement('div');
    container.style.fontFamily = 'var(--font-primary)';
    container.style.padding = '8px';
    container.style.minWidth = '200px';

    const title = document.createElement('h3');
    title.style.margin = '0 0 8px 0';
    title.style.color = 'var(--color-navy)';
    title.style.fontSize = '16px';
    title.textContent = stateName;
    container.appendChild(title);

    if (stateData) {
      const details = `
                <p style="margin: 4px 0; font-size: 14px;">
                    <strong>Districts:</strong> ${stateData.districts}
                </p>
                <p style="margin: 4px 0; font-size: 14px;">
                    <strong>Projects:</strong> ${stateData.projects}
                </p>
                <p style="margin: 4px 0; font-size: 14px;">
                    <strong>Fund Allocated:</strong> ₹${(stateData.fundAllocated / 10000000).toFixed(2)} Cr
                </p>
            `;
      const detailsDiv = document.createElement('div');
      detailsDiv.innerHTML = details;
      container.appendChild(detailsDiv);
    } else {
      const noData = document.createElement('p');
      noData.style.margin = '4px 0';
      noData.style.fontSize = '14px';
      noData.style.color = '#666';
      noData.textContent = 'No specific project data available.';
      container.appendChild(noData);
    }

    const button = document.createElement('button');
    button.textContent = 'View Districts →';
    button.style.marginTop = '12px';
    button.style.width = '100%';
    button.style.backgroundColor = 'var(--color-primary)';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.padding = '8px 12px';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '12px';
    button.style.fontWeight = '500';

    button.onclick = (e) => {
      e.stopPropagation();
      handleViewDistricts(stateName);
    };

    container.appendChild(button);
    layer.bindPopup(container);

    // Add Label using Tooltip
    layer.bindTooltip(stateName, {
      permanent: true,
      direction: 'center',
      className: 'state-label',
      opacity: 1
    });
  };

  const stateDistricts = districtModalState ? (districts[districtModalState] || []) : [];

  return (
    <>
      <div className="map-container">
        <MapContainer
          center={[22, 82]}
          zoom={4.5}
          style={{ height: '100%', width: '100%', backgroundColor: '#F3F4F6' }}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          dragging={true}
          touchZoom={false}
          zoomControl={true}
          keyboard={false}
        >
          <GeoJSON
            data={indiaGeoJSON}
            style={mapStyle}
            onEachFeature={onEachState}
          />
        </MapContainer>
      </div>

      {/* District Modal */}
      {showDistrictModal && (
        <div className="modal-overlay" onClick={() => setShowDistrictModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ margin: 0, color: 'var(--color-navy)' }}>Districts in {districtModalState}</h2>
              <button onClick={() => setShowDistrictModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>×</button>
            </div>

            {stateDistricts.length > 0 ? (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>District Name</th>
                      <th>Projects</th>
                      <th>Progress</th>
                      <th>Fund Allocated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stateDistricts.map((district, index) => (
                      <tr key={index}>
                        <td><strong>{district.name}</strong></td>
                        <td>{district.projects}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <div className="progress-bar" style={{ flex: 1, height: '6px', minWidth: '80px' }}>
                              <div className="progress-fill" style={{ width: `${district.progress}%` }}></div>
                            </div>
                            <span style={{ fontSize: 'var(--text-sm)' }}>{district.progress}%</span>
                          </div>
                        </td>
                        <td>₹{(district.fundAllocated / 10000000).toFixed(2)} Cr</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#666', padding: 'var(--space-6)' }}>
                No district data available for {districtModalState}
              </p>
            )}

            <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setShowDistrictModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IndiaMap;
