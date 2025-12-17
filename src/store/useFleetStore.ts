import { create } from 'zustand';

export interface Driver {
  user_id: string;
  lat: number;
  lng: number;
  share_username?: string;
  status: 'available' | 'busy' | string;
  profile_image?: string;
}

interface FleetState {
  drivers: Driver[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  fetchDrivers: (city: string) => Promise<void>;
}

export const useFleetStore = create<FleetState>((set) => ({
  drivers: [],
  isLoading: false,
  error: null,
  lastUpdated: null,

  fetchDrivers: async (city: string) => {
    // Only set loading if not already loading to avoid jitter, 
    // but for initial fetch we want visual feedback.
    // We can check if we already have drivers to decide on 'isLoading'
    // or just let it be handled by the UI.
    
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`https://app.share-rides.com/admin/drivers/live?city=${encodeURIComponent(city)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch live fleet data');
      }

      const data = await response.json();

      // Robustness check: Ensure data is an array before setting
      if (Array.isArray(data)) {
        set({ 
          drivers: data, 
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
}));
