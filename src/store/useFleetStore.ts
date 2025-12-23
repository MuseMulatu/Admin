import { create } from 'zustand';

// Define the shape of a Driver object based on your API
export interface Driver {
  user_id: string;
  lat: number;
  lng: number;
  share_username?: string;
  status: 'available' | 'busy' | 'offline' | 'suspended' | string;
  profile_image?: string; // 
}

interface FleetState {
  drivers: Driver[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  fetchDrivers: (city: string) => Promise<void>;
  updateDriverStatus: (driverId: string, newStatus: string) => void; // New action for local updates
}

export const useFleetStore = create<FleetState>((set, get) => ({
  drivers: [],
  isLoading: false,
  error: null,
  lastUpdated: null,

  fetchDrivers: async (city: string) => {
    // Only set loading if not already loading to avoid jitter, 
    // but for initial fetch, visual feedback.
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/admin/drivers/live`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch live fleet data');
      }

      const data = await response.json();

      // ensure data is an array before setting
     if (Array.isArray(data)) {
  const normalized = data
    .filter(d => d.lat != null && d.lng != null)
    .map(d => ({
      ...d,
      lat: Number(d.lat),
      lng: Number(d.lng)
    }));

  set({
    drivers: normalized,
    isLoading: false,
    lastUpdated: Date.now()
  });
} else {
  console.warn("Unexpected API response format:", data);
  set({
    drivers: [],
    isLoading: false,
    error: "Invalid data format received from server"
  });
}

    } catch (err: any) {
      console.error("Fleet store fetch error:", err);
      set({ 
        isLoading: false, 
        error: err.message || 'Unknown error occurred' 
      });
    }
  },

  // immediate UI feedback
  updateDriverStatus: (driverId, newStatus) => {
    const { drivers } = get();
    const updatedDrivers = drivers.map(d => 
        d.user_id === driverId ? { ...d, status: newStatus } : d
    );
    set({ drivers: updatedDrivers });
    
    // In a real app, you would also make a PATCH request here
    // fetch(`/api/drivers/${driverId}`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) })
  }
}));
