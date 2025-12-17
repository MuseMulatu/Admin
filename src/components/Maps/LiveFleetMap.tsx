import { MapContainer, TileLayer, CircleMarker, Tooltip, ZoomControl } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { useFleetStore } from '../../store/useFleetStore';
import { useAdminStore } from '../../store/useAdminStore'; 

const CENTER: [number, number] = [30.2672, -97.7431]; // Austin

export default function LiveFleetMap() {
  const drivers = useFleetStore((state) => state.drivers);
  const fetchDrivers = useFleetStore((state) => state.fetchDrivers);
  const updateDriverStatus = useFleetStore((state) => state.updateDriverStatus); // Get update action
  const isLoading = useFleetStore((state) => state.isLoading);
  
  // Auth check
  const hasPermission = useAdminStore((state) => state.hasPermission);
  const canUpdate = hasPermission('ADMIN'); // Only ADMIN or SUPER_ADMIN can update

  useEffect(() => {
    fetchDrivers("Austin, TX");
    const interval = setInterval(() => {
        fetchDrivers("Austin, TX");
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchDrivers]);

  const handleStatusChange = (driverId: string, status: string) => {
      if (!confirm(`Are you sure you want to mark this driver as ${status}? This action will be logged.`)) return;
      updateDriverStatus(driverId, status);
      // Here you would also trigger the API call and log to your logs table
  };

  return (
    <div className="h-full w-full relative bg-gray-900 group">
      
      {isLoading && drivers.length === 0 && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
            <span className="text-xs font-medium text-white/80">Locating Fleet...</span>
          </div>
        </div>
      )}

      <MapContainer 
        center={CENTER} 
        zoom={13} 
        scrollWheelZoom={true} 
        zoomControl={false} 
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
              color: d.status === 'available' ? '#10B981' : d.status === 'offline' ? '#6B7280' : '#F59E0B',
              fillColor: d.status === 'available' ? '#10B981' : d.status === 'offline' ? '#6B7280' : '#F59E0B',
              fillOpacity: 0.7,
              weight: 2,
              className: 'transition-all duration-300'
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-tooltip">
              <div className="flex flex-col items-center gap-2 p-1 min-w-[140px]">
                {d.profile_image ? (
                  <img 
                    src={d.profile_image} 
                    alt={d.share_username || 'Driver'} 
                    className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${d.share_username || 'Driver'}&background=random`;
                    }}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm text-gray-500 font-bold">
                    {(d.share_username || 'D').charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div className="text-center w-full">
                  <b className="block text-sm text-gray-800 mb-1">{d.share_username || 'Driver'}</b>
                  <div className="flex flex-wrap justify-center gap-1 mb-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wide px-1.5 py-0.5 rounded-full ${d.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {d.status}
                    </span>
                  </div>

                  {/* ADMIN ACTIONS */}
                  {canUpdate && (
                      <div className="grid grid-cols-2 gap-1 w-full border-t pt-2 mt-1">
                          {d.status !== 'offline' && (
                              <button 
                                onClick={() => handleStatusChange(d.user_id, 'offline')}
                                className="text-[10px] bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded"
                              >
                                Force Offline
                              </button>
                          )}
                          {d.status === 'offline' && (
                              <button 
                                onClick={() => handleStatusChange(d.user_id, 'available')}
                                className="text-[10px] bg-green-50 text-green-600 hover:bg-green-100 px-2 py-1 rounded"
                              >
                                Activate
                              </button>
                          )}
                          <button 
                            className="text-[10px] bg-gray-50 text-gray-600 hover:bg-gray-100 px-2 py-1 rounded"
                            onClick={() => alert("Detailed logs would open here")}
                          >
                            View Logs
                          </button>
                      </div>
                  )}
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}