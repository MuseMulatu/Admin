import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useAdminStore } from "../../store/useAdminStore";

export default function Rides() {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentAdmin, hasPermission } = useAdminStore();
  const canManageRides = hasPermission('ADMIN');

  useEffect(() => {
    fetch("https://app.share-rides.com/admin/rides/active") // Assuming endpoint
      .then(res => res.json())
      .then(data => {
          setRides(Array.isArray(data) ? data : []);
          setLoading(false);
      })
      .catch(err => {
          console.error("Fetch rides failed", err);
          setLoading(false);
      });
  }, []);

  const handleForceCancel = async (rideId: string) => {
      const reason = prompt("Enter reason for forced cancellation (Required for audit log):");
      if (!reason) return;

      try {
        const response = await fetch(`https://app.share-rides.com/admin/rides/${rideId}/cancel`, {
            method: 'POST', // or PATCH
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Id': currentAdmin?.id || '',
                'X-Admin-Role': currentAdmin?.role || ''
            },
            body: JSON.stringify({
                reason: reason,
                action: "FORCE_CANCEL_RIDE",
                admin_name: currentAdmin?.name
            })
        });

        if (response.ok) {
            setRides(prev => prev.filter(r => r.id !== rideId)); // Remove from list
            alert("Ride cancelled and action logged.");
        } else {
            alert("Failed to cancel ride.");
        }
      } catch (error) {
          console.error("Cancel error", error);
          alert("Network error.");
      }
  };

  return (
    <>
      <PageMeta title="Ride Management" description="Monitor live rides and pools" />
      
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Live Operations</h2>
            <div className="flex gap-2">
                <button className="px-3 py-1 text-xs font-medium bg-brand-50 text-brand-600 rounded-full border border-brand-200">Live ({rides.length})</button>
                <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700">Completed</button>
            </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <th className="p-4 text-xs font-semibold uppercase text-gray-500 tracking-wide">Ride ID</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500 tracking-wide">Type</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500 tracking-wide">Route</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500 tracking-wide">Driver/User</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500 tracking-wide">Fare</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500 tracking-wide text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading rides...</td></tr>
              ) : rides.map((ride) => (
                <tr key={ride.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <td className="p-4 font-mono text-sm text-gray-600">{ride.id}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${
                        ride.type === 'corider' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {ride.type === 'corider' ? 'Pool' : 'Std'}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          <span className="text-gray-900 dark:text-white truncate max-w-[150px]">{ride.origin_address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          <span className="text-gray-500 truncate max-w-[150px]">{ride.destination_address}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="text-gray-900 dark:text-white font-medium">{ride.driver_name || "Assigning..."}</div>
                    <div className="text-gray-500 text-xs">Pass: {ride.user_name}</div>
                  </td>
                  <td className="p-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                    ETB {ride.fare}
                  </td>
                  <td className="p-4 text-right">
                    {canManageRides && (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleForceCancel(ride.id)}
                                className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 text-xs font-medium"
                            >
                                Force Stop
                            </button>
                        </div>
                    )}
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