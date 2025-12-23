import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useAdminStore } from "../../store/useAdminStore";

interface Ride {
  id: string;
  type: 'corider' | 'solo' | string;
  origin: string; // Used for audit
  origin_address: string; // Used for display
  destination: string;
  destination_address: string;
  distance_km: number;
  time_taken: number; // in minutes
  fare: number;
  driver_name?: string;
  user_name?: string;
  status: string;
}

export default function Rides() {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentAdmin, hasPermission } = useAdminStore();
  const canManageRides = hasPermission('ADMIN');

  const [isAuditModalOpen, setAuditModalOpen] = useState(false);
  const [auditingId, setAuditingId] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<any>(null);

  const handleAuditRide = async (ride: any) => {
    setAuditingId(ride.id);
    setAuditResult(null);
    setAuditModalOpen(true);

    try {
      const response = await fetch(`${API_BASE}/api/ai/audit-ride`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add your auth headers here if needed
          'X-Admin-Role': 'super_admin' 
        },
        body: JSON.stringify({
          rideId: ride.id,
          origin_address: ride.origin,
          destination_address: ride.destination,
          distance_km: ride.distance_km,
          time_taken: ride.time_taken
        })
      });

      if (!response.ok) throw new Error('Audit failed');
      
      const data = await response.json();
      setAuditResult(data);
    } catch (error) {
      console.error(error);
      setAuditResult({ error: "Failed to connect to AI Auditor." });
    } finally {
      setAuditingId(null);
    }
  };

useEffect(() => {
  fetch(`/api/admin/rides/active`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
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
const response = await fetch(
  `/api/admin/action/rides/${rideId}/cancel`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      reason,
      action: "FORCE_CANCEL_RIDE",
      admin_name: currentAdmin?.name
    })
  }
);

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
// Helper to get the ride currently being audited
// const currentAuditRide = rides.find(r => r.id === auditingId);
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
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <button 
                      onClick={() => handleAuditRide(ride)}
                      className="inline-flex items-center justify-center gap-2.5 rounded-full bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-4 xl:px-6"
                    >
                      <span>✨</span> Audit
                    </button>
                  </td>
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

            {isAuditModalOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 outline-none focus:outline-none">
           <div className="relative w-full max-w-lg rounded-lg bg-white p-8 dark:bg-boxdark">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-black dark:text-white">Ride Audit Report</h3>
                  <button onClick={() => setAuditModalOpen(false)} className="text-2xl">&times;</button>
              </div>
              
              {auditingId ? (
                  <div className="flex flex-col items-center py-8">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
                      <p className="mt-4 text-gray-500">Hulum AI is analyzing route data...</p>
                  </div>
              ) : auditResult ? (
                  <div className="space-y-4">
                      <div className={`p-4 rounded-lg border-l-4 ${auditResult.flag === 'Red' ? 'bg-red-50 border-red-500 text-red-700' : auditResult.flag === 'Yellow' ? 'bg-yellow-50 border-yellow-500 text-yellow-700' : 'bg-green-50 border-green-500 text-green-700'}`}>
                          <strong className="block text-lg mb-1">{auditResult.flag} Flag</strong>
                          {auditResult.summary}
                      </div>
                      
                      {auditResult.comparison && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-meta-4 p-3 rounded">
                            <p><strong>Analysis Data:</strong></p>
                            <ul className="list-disc ml-5 mt-1">
                                <li>Actual Distance: {rides.find(r => r.id === auditingId)?.distance_km}km vs Std: {auditResult.comparison.standardDistanceKm.toFixed(1)}km</li>
                                <li>Actual Time: {rides.find(r => r.id === auditingId)?.time_taken}min vs Std: {auditResult.comparison.standardTimeMin.toFixed(1)}min</li>
                            </ul>
                        </div>
                      )}
                  </div>
              ) : (
                  <p className="text-red-500">Could not retrieve audit.</p>
              )}
              
              <div className="mt-6 flex justify-end">
                  <button onClick={() => setAuditModalOpen(false)} className="rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white">
                      Close
                  </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
}
