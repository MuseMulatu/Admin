import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { drivers } from '../../data/mockData'; // We'll use your mock data

// Coordinates for Addis Ababa
const CENTER_POSITION: [number, number] = [9.005401, 38.763611];

// Simulating some random offsets to scatter drivers around Addis for the demo
// More realistic geographic scatter (small ~200–300m jitter)
const getRandomOffset = (scale = 0.002) => {
  return (Math.random() - 0.5) * scale;
};


const LiveFleetMap = () => {
  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden z-0 relative">
      <MapContainer 
        center={CENTER_POSITION} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        {/* Dark Mode Map Style (CartoDB Dark Matter) - Looks amazing in dashboards */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {drivers.map((driver, index) => {
          const position: [number, number] = [
            CENTER_POSITION[0] + getRandomOffset(),
            CENTER_POSITION[1] + getRandomOffset(),
          ];
          return (
            <CircleMarker 
              key={index} 
              center={position} 
              pathOptions={{ 
                color: driver.status === 'active' ? '#10B981' : '#F59E0B', 
                fillColor: driver.status === 'active' ? '#10B981' : '#F59E0B', 
                fillOpacity: 0.7 
              }}
              radius={6}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <span><b>{driver.name}</b><br/>{driver.vehicle.model}</span>
              </Tooltip>
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold">{driver.name}</h3>
                  <p className="text-xs text-gray-500">{driver.phone}</p>
                  <span className={`text-xs px-2 py-0.5 rounded text-white ${driver.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                    {driver.status}
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      
      {/* Overlay Legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-[1000] text-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-gray-600 dark:text-gray-300">Active (Available)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
          <span className="text-gray-600 dark:text-gray-300">In Ride / Busy</span>
        </div>
      </div>
    </div>
  );
};

export default LiveFleetMap;