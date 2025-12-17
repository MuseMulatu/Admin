import { MapContainer, TileLayer, CircleMarker, Tooltip, ZoomControl } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { useFleetStore } from '../../store/useFleetStore';

const CENTER: [number, number] = [30.2672, -97.7431]; // Austin

export default function LiveFleetMap() {
  // Selecting state individually. Safer, performant than returning an object
  // avoids unnecessary re-renders
  const drivers = useFleetStore((state) => state.drivers);
  const fetchDrivers = useFleetStore((state) => state.fetchDrivers);
  const isLoading = useFleetStore((state) => state.isLoading);

  useEffect(() => {
    // Initial fetch on mount
    fetchDrivers("Austin, TX");

    // live polling every 30 seconds
    const interval = setInterval(() => {
        fetchDrivers("Austin, TX");
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDrivers]); // fetchDrivers is stable from Zustand

  return (
    <div className="h-full w-full relative bg-gray-900 group">
      
      {/* Loading Overlay (Only shows if loading AND no drivers are visible yet) */}
      {isLoading && drivers.length === 0 && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
            <span className="text-xs font-medium text-white/80">Locating Fleet...</span>
          </div>
        </div>
      )}

      {/* Map Instance */}
      <MapContainer 
        center={CENTER} 
        zoom={13} 
        scrollWheelZoom={true} 
        zoomControl={false} // We use custom position below
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <ZoomControl position="bottomright" />

        {drivers.map((d, i) => (
          <CircleMarker
            key={d.user_id || i}
            center={[d.lat, d.lng]}
            radius={6}
            pathOptions={{
              color: d.status === 'available' ? '#10B981' : '#F59E0B',
              fillColor: d.status === 'available' ? '#10B981' : '#F59E0B',
              fillOpacity: 0.7,
              weight: 2,
              className: 'transition-all duration-300'
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <div className="text-center">
                <b className="block text-sm">{d.share_username || 'Driver'}</b>
                <span className={`text-xs uppercase font-bold ${d.status === 'available' ? 'text-green-600' : 'text-amber-600'}`}>
                    {d.status}
                </span>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
