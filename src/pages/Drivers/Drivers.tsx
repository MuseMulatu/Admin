import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Modal from "../../components/common/Modal";
import { drivers, Driver } from "../../data/mockData";

export default function Drivers() {
  const [searchTerm, setSearchTerm] = useState("");
const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null); 

  return (
    <>
      <PageMeta
        title="Driver Management"
        description="Manage fleet and verify documents"
      />

      {/* DRIVER DETAIL MODAL */}
         <Modal isOpen={!!selectedDriver} onClose={() => setSelectedDriver(null)} title={selectedDriver?.name || "Driver Details"}>
        
        <div className="space-y-3 mt-2">
            <div className="flex justify-between border-b pb-2 border-gray-100 dark:border-gray-700">
                <span className="font-semibold text-gray-500">Phone:</span>
                <span className="text-gray-900 dark:text-white">{selectedDriver?.phone}</span>
            </div>

            <div className="flex justify-between border-b pb-2 border-gray-100 dark:border-gray-700">
                <span className="font-semibold text-gray-500">Vehicle:</span>
                <span className="text-gray-900 dark:text-white">{selectedDriver?.vehicle?.model}</span>
            </div>

            <div className="flex justify-between border-b pb-2 border-gray-100 dark:border-gray-700">
                <span className="font-semibold text-gray-500">Plate:</span>
                <span className="text-gray-900 dark:text-white">{selectedDriver?.vehicle?.plate}</span>
            </div>

            <div className="flex justify-between border-b pb-2 border-gray-100 dark:border-gray-700">
                <span className="font-semibold text-gray-500">Status:</span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                    selectedDriver?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                    {selectedDriver?.status}
                </span>
            </div>

            <div className="flex justify-between border-b pb-2 border-gray-100 dark:border-gray-700">
                <span className="font-semibold text-gray-500">Earnings:</span>
                <span className="text-brand-500 font-bold">ETB {selectedDriver?.earnings}</span>
            </div>
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
              placeholder="Search license, name..."
              className="rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-medium text-white hover:bg-brand-600">
              Add Driver
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <th className="p-4 text-xs font-medium uppercase text-gray-500">Details</th>
                <th className="p-4 text-xs font-medium uppercase text-gray-500">Vehicle</th>
                <th className="p-4 text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="p-4 text-xs font-medium uppercase text-gray-500">Earnings</th>
                <th className="p-4 text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {drivers
                .filter((d) =>
                  d.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((driver) => (
                  <tr
                    key={driver.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] cursor-pointer"
                    onClick={() => setSelectedDriver(driver)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                          👨‍✈️
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {driver.name}
                          </h5>
                          <p className="text-xs text-gray-500">{driver.phone}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {driver.vehicle.model}
                      </p>
                      <p className="text-xs text-gray-500">
                        {driver.vehicle.plate} • {driver.vehicle.color}
                      </p>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          driver.status === "active"
                            ? "bg-green-100 text-green-700"
                            : driver.status === "suspended"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {driver.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ETB {driver.earnings}
                      </p>
                      <p className="text-xs text-gray-500">Commission: 10%</p>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-brand-500 hover:underline">
                          Edit
                        </button>
                        <button className="text-xs text-red-500 hover:underline">
                          Suspend
                        </button>
                      </div>
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
