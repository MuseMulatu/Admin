//import React from "react";
import PageMeta from "../../components/common/PageMeta";
import { rides } from "../../data/mockData";

export default function Rides() {
  return (
    <>
      <PageMeta title="Ride Management" description="Monitor live rides and pools" />
      
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Live Operations</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="p-4 text-xs font-medium uppercase text-gray-500">Ride ID</th>
                <th className="p-4 text-xs font-medium uppercase text-gray-500">Type</th>
                <th className="p-4 text-xs font-medium uppercase text-gray-500">Route</th>
                <th className="p-4 text-xs font-medium uppercase text-gray-500">Driver/User</th>
                <th className="p-4 text-xs font-medium uppercase text-gray-500">Fare</th>
                <th className="p-4 text-xs font-medium uppercase text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {rides.map((ride) => (
                <tr key={ride.id}>
                  <td className="p-4 font-mono text-sm">{ride.id}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${ride.type === 'Pool' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                      {ride.type} {ride.type === 'Pool' && `(${ride.seats_filled}/4)`}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-900 dark:text-white">📍 {ride.origin}</span>
                      <span className="text-gray-500 text-xs pl-4">⬇</span>
                      <span className="text-gray-900 dark:text-white">🏁 {ride.destination}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="text-gray-900 dark:text-white font-medium">{ride.driver}</div>
                    <div className="text-gray-500 text-xs">User: {ride.user}</div>
                  </td>
                  <td className="p-4 text-sm font-bold text-brand-500">
                    ETB {ride.fare}
                  </td>
                  <td className="p-4">
                    {ride.status === 'In Progress' && (
                       <button className="px-3 py-1 bg-red-500/10 text-red-500 rounded hover:bg-red-500 hover:text-white transition text-xs border border-red-500/20">
                         Force Stop
                       </button>
                    )}
                    {ride.status === 'Completed' && (
                       <span className="text-green-500 text-xs">Completed</span>
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