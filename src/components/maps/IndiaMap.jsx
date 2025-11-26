import React, { useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import { indiaGeoJSON } from '../../data/geoData';
import { states } from '../../data/mockData';
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

  // Removed window.handleStateDrillDown useEffect as we are using direct DOM event listeners now

  const onEachState = (feature, layer) => {
    const geoJsonName = feature.properties.NAME_1;
    const stateName = normalizeStateName(geoJsonName);
    const stateData = states.find(s => s.name === stateName);

    layer.setStyle({
      fillColor: getStateColor(stateName),
      weight: 1.5,
      opacity: 1,
      color: '#4338CA', // Dark Blue border
      fillOpacity: 1
    });

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

    // Create Popup Content using DOM elements to avoid inline onclick issues
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
      e.stopPropagation(); // Prevent map click
      setSelectedState(stateName);
      if (onStateSelect) {
        onStateSelect(stateName);
      }
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



  return (
    <div className="map-container">
      <MapContainer
        center={[22.5, 78.9]}
        zoom={5}
        style={{ height: '100%', width: '100%', backgroundColor: '#F3F4F6' }}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        dragging={false}
        touchZoom={false}
        zoomControl={false}
        keyboard={false}
      >
        {/* TileLayer removed for clean vector map look */}

        <GeoJSON
          data={indiaGeoJSON}
          onEachFeature={onEachState}
        />
      </MapContainer>

      {/* Legend Removed as per new uniform styling */}
    </div>
  );
};

export default IndiaMap;
