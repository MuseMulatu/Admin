import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import Modal from "../../components/common/Modal";
import { useAdminStore } from "../../store/useAdminStore"; // Import Auth Store

// Define Driver Interface
interface Driver {
  id: string;
  user_id: string;
  share_username: string; 
  phone_number: string; 
  vehicle_details: any; 
  status: string;
  earnings: number;
  profile_image?: string;
}

// 
const API_BASE_URL = "https://app.share-rides.com"; 

export default function Drivers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  
  // Auth & Permissions
  const { hasPermission } = useAdminStore();
  const canManageDrivers = hasPermission('ADMIN');

  // Fetch Drivers
useEffect(() => {
console.log(`Fetching drivers from: ${API_BASE_URL}/admin/drivers`);
  fetch(`/api/admin/drivers`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      setDrivers(Array.isArray(data) ? data : []);
      setIsLoading(false);
    })
    .catch(err => {
      console.error("Failed to fetch drivers:", err);
      setIsLoading(false);
    });
}, []);


    const handleStatusChange = async (driverId: string, newStatus: string) => {
        try {
            // Updated to use the working "muse_mulatu" credentials
            const response = await fetch(`/api/admin/drivers/${driverId}/status`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: newStatus,
    action: "UPDATE_DRIVER_STATUS"
  })
});
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update status');
            }

            const data = await response.json();
            
            // Update local state to reflect change immediately
            setDrivers(drivers.map(d => 
                d.id === driverId ? { ...d, status: newStatus } : d
            ));
            
            // Optional: Show success message
            console.log('Success:', data.message);

        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update driver status');
        }
    };

  return (
    <>
      <PageMeta
        title="Driver Management"
        description="Manage fleet and verify documents"
      />

      {/* DRIVER DETAIL MODAL */}
      <Modal isOpen={!!selectedDriver} onClose={() => setSelectedDriver(null)} title={selectedDriver?.share_username || "Driver Details"}>
        <div className="space-y-4 mt-2">
            <div className="flex items-center gap-4 border-b pb-4 border-gray-100 dark:border-gray-700">
                {selectedDriver?.profile_image ? (
                    <img 
                        src={selectedDriver.profile_image} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-full object-cover" 
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${selectedDriver?.share_username}&background=random`;
                        }}
                    />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500">
                        {selectedDriver?.share_username?.charAt(0)}
                    </div>
                )}
                <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{selectedDriver?.share_username}</h3>
                    <p className="text-sm text-gray-500">{selectedDriver?.user_id}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase">Status</span>
                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-bold ${
                        selectedDriver?.status === 'available' ? 'bg-green-100 text-green-700' : 
                        selectedDriver?.status === 'suspended' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                        {selectedDriver?.status}
                    </span>
                </div>
                <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase">Earnings</span>
                    <span className="block mt-1 font-mono text-gray-900 dark:text-white">ETB {selectedDriver?.earnings}</span>
                </div>
            </div>

            {/* Admin Actions in Modal */}
            {canManageDrivers && (
                <div className="border-t pt-4 mt-2 border-gray-100 dark:border-gray-700">
                    <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Admin Actions</h4>
                    <div className="flex flex-wrap gap-2">
                        {/* Suspend Action */}
                        {selectedDriver?.status !== 'suspended' && (
                            <button 
                                onClick={() => handleStatusChange(selectedDriver!.user_id, 'suspended')}
                                className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded text-sm font-medium transition border border-red-200"
                            >
                                Suspend Driver
                            </button>
                        )}
                        
                        {/* Make Available (Reactivate) */}
                        {selectedDriver?.status !== 'available' && (
                            <button 
                                onClick={() => handleStatusChange(selectedDriver!.user_id, 'available')}
                                className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded text-sm font-medium transition border border-green-200"
                            >
                                {selectedDriver?.status === 'suspended' ? 'Reactivate Driver' : 'Mark Available'}
                            </button>
                        )}

                        {/* Force Offline (if they are stuck in available/busy but not suspended) */}
                        {selectedDriver?.status === 'available' && (
                             <button 
                                onClick={() => handleStatusChange(selectedDriver!.user_id, 'offline')}
                                className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded text-sm font-medium transition border border-gray-300"
                            >
                                Force Offline
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
      </Modal>

      {/* MAIN TABLE */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">

        {/* Header + Search */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Driver Fleet ({drivers.length})
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search driver..."
              className="rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {canManageDrivers && (
                <button className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-medium text-white hover:bg-brand-600 shadow-sm transition-all hover:shadow-md">
                + Add Driver
                </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                <th className="p-4 text-xs font-semibold uppercase text-gray-500 tracking-wide">Driver</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500 tracking-wide">Vehicle</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500 tracking-wide">Status</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500 tracking-wide">Earnings</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500 tracking-wide text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading fleet data...</td></tr>
              ) : drivers
                .filter((d) =>
                  (d.share_username || "").toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((driver) => (
                  <tr
                    key={driver.user_id}
                    className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => setSelectedDriver(driver)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {driver.profile_image ? (
                            <img 
                                src={driver.profile_image} 
                                alt="" 
                                className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" 
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${driver.share_username}&background=random`;
                                }}
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg">
                            👨‍✈️
                            </div>
                        )}
                        <div>
                          <h5 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {driver.share_username}
                          </h5>
                          <p className="text-xs text-gray-500">{driver.phone_number}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {/* Adapt based on your actual vehicle JSON structure */}
                        {typeof driver.vehicle_details === 'string' ? 'Vehicle Info' : driver.vehicle_details?.model || "Unknown Model"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {typeof driver.vehicle_details === 'string' ? '' : driver.vehicle_details?.plate_number || "No Plate"}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          driver.status === "available"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : driver.status === "suspended"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                             driver.status === "available" ? "bg-green-500" : driver.status === "suspended" ? "bg-red-500" : "bg-yellow-500"
                        }`}></span>
                        {driver.status}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-sm text-gray-600 dark:text-gray-300">
                       ETB {driver.earnings}
                    </td>

                    <td className="p-4 text-right">
                      <button className="text-gray-400 hover:text-brand-500 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
