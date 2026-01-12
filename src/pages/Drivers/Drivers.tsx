import { useState, useEffect, useRef } from "react"; 
import PageMeta from "../../components/common/PageMeta";
import Modal from "../../components/common/Modal";
import { useAdminStore } from "../../store/useAdminStore";

interface Driver {
  id?: string; // Made optional as sometimes backend uses user_id as primary
  user_id: string;
  share_username: string; 
  phone_number: string; 
  city?: string;
  vehicle_details: any; 
  status: string;
  earnings: number;
  profile_image?: string;
  bio?: string;
}

// --- CONFIGURATION ---
const CLOUD_NAME = "dpccavqia"; 
const UPLOAD_PRESET = "expo_profile_images"; 

export default function Drivers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  
  // State for Adding Driver
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 

  const [newDriver, setNewDriver] = useState({
      name: "",
      phone_number: "+1", 
      gender: "Male",
      city: "Atlanta, GA", 
      languages: "",       
      bio: "",
      profile_image: "",   
      vehicle_model: "",
      vehicle_color: "",
      vehicle_plate: ""
  });

  // Ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth
  const { hasPermission, currentAdmin } = useAdminStore(); 
  const canManageDrivers = hasPermission('ADMIN');

  // --- HELPER: Status Badge Styles ---
  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'available') {
        return "bg-green-100 text-green-700 border-green-200";
    } else if (s === 'suspended') {
        return "bg-red-100 text-red-700 border-red-200";
    } else if (s === 'offline') {
        return "bg-gray-100 text-gray-600 border-gray-200";
    } else {
        // Fallback for busy, etc.
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  // --- FETCH DRIVERS ---
  const fetchDrivers = () => {
      fetch(`https://app.share-rides.com/admin/drivers`)
        .then(res => res.json())
        .then(data => {
          setDrivers(Array.isArray(data) ? data : []);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch drivers:", err);
          setIsLoading(false);
        });
  };

  useEffect(() => {
      fetchDrivers();
  }, []);

  // --- IMAGE UPLOAD LOGIC ---
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
          const formData = new FormData();
          formData.append("file", file); 
          formData.append("upload_preset", UPLOAD_PRESET);

          const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
              method: "POST",
              body: formData,
          });

          const data = await res.json();
          
          if (data.secure_url) {
              setNewDriver(prev => ({ ...prev, profile_image: data.secure_url }));
              console.log("Uploaded:", data.secure_url);
          } else {
              alert("Upload failed. Check console.");
              console.error(data);
          }
      } catch (error) {
          console.error("Error uploading image:", error);
          alert("Error uploading image");
      } finally {
          setIsUploading(false);
      }
  };

  // --- SUBMIT HANDLER (CREATE) ---
  const handleCreateDriver = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
          const response = await fetch(`https://app.share-rides.com/admin/drivers`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newDriver)
          });

          if (!response.ok) throw new Error('Failed to create driver');
          
          const responseData = await response.json();

          // A. VISUALLY UPDATE LIST (PREPEND)
          // We construct the object manually to match the interface so it appears immediately
          const createdDriverObj: Driver = {
              id: responseData.driver.user_id,
              user_id: responseData.driver.user_id,
              share_username: newDriver.name,
              phone_number: newDriver.phone_number,
              city: newDriver.city,
              status: 'available', // Default from backend
              earnings: 0,
              profile_image: newDriver.profile_image,
              bio: newDriver.bio,
              vehicle_details: {
                  model: newDriver.vehicle_model,
                  color: newDriver.vehicle_color,
                  plate_number: newDriver.vehicle_plate
              }
          };

          setDrivers(prev => [createdDriverObj, ...prev]);
          setIsAddModalOpen(false);
          
          // Reset Form
          setNewDriver({
              name: "",
              phone_number: "+1",
              gender: "Male",
              city: "Atlanta, GA",
              languages: "",
              bio: "",
              profile_image: "",
              vehicle_model: "",
              vehicle_color: "",
              vehicle_plate: ""
          });

          // B. FEEDBACK ALERT
          alert(`Driver "${createdDriverObj.share_username}" added successfully!`);

      } catch (error) {
          alert("Error creating driver. Please check the console.");
          console.error(error);
      } finally {
          setIsSubmitting(false);
      }
  };

  // --- STATUS CHANGE HANDLER ---
  const handleStatusChange = async (driverId: string, newStatus: string) => {
    // 1. Auth Check
    if (!currentAdmin) {
        alert("You must be logged in to perform this action");
        return;
    }

    // 2. SNAPSHOT: Save current state
    const previousDrivers = drivers;

    // 3. OPTIMISTIC UPDATE
    setDrivers(prevDrivers => prevDrivers.map(d => 
        d.user_id === driverId ? { ...d, status: newStatus } : d
    ));

    // Also update the selected driver modal if it's open
    if (selectedDriver && selectedDriver.user_id === driverId) {
        setSelectedDriver(prev => prev ? { ...prev, status: newStatus } : null);
    }

    try {
        const response = await fetch(`https://app.share-rides.com/admin/drivers/${driverId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Id': currentAdmin.id,
                'X-Admin-Role': currentAdmin.role, 
            },
            body: JSON.stringify({
                status: newStatus,
                action: "UPDATE_DRIVER_STATUS",
                admin_name: currentAdmin.name 
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update status');
        }

        // B. FEEDBACK ALERT
        alert(`Driver status successfully updated to: ${newStatus.toUpperCase()}`);

    } catch (error: any) {
        console.error('Error updating status:', error);
        
        // 4. ROLLBACK
        setDrivers(previousDrivers);
        if (selectedDriver && selectedDriver.user_id === driverId) {
             // Revert modal too
             const oldDriver = previousDrivers.find(d => d.user_id === driverId);
             if (oldDriver) setSelectedDriver(oldDriver);
        }
        
        alert(`Failed to update status: ${error.message}`);
    }
  };

  return (
    <>
      <PageMeta
        title="Driver Management"
        description="Manage fleet and drivers"
      />

      {/* --- ADD DRIVER MODAL --- */}
     <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Driver">
          <form onSubmit={handleCreateDriver} className="space-y-4 mt-1 max-h-[80vh] overflow-y-auto pr-2">
              
              {/* IMAGE UPLOAD SECTION */}
              <div className="flex flex-col items-center justify-center mb-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-gray-50 overflow-hidden relative"
                  >
                      {isUploading ? (
                          <span className="text-xs text-gray-500">Uploading...</span>
                      ) : newDriver.profile_image ? (
                          <img src={newDriver.profile_image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                          <div className="text-center">
                              <span className="text-2xl">📷</span>
                              <p className="text-[10px] text-gray-400">Upload</p>
                          </div>
                      )}
                  </div>
                  <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*"
                  />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                      <input required type="text" className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                          value={newDriver.name} onChange={e => setNewDriver({...newDriver, name: e.target.value})} />
                  </div>

                  <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                      <input required type="text" className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                          value={newDriver.phone_number} onChange={e => setNewDriver({...newDriver, phone_number: e.target.value})} />
                  </div>

                  <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                      <select className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                          value={newDriver.gender} onChange={e => setNewDriver({...newDriver, gender: e.target.value})}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                      </select>
                  </div>

                  <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                      <input required type="text" className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                          placeholder="e.g. Atlanta, GA"
                          value={newDriver.city} onChange={e => setNewDriver({...newDriver, city: e.target.value})} />
                  </div>

                  <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Languages</label>
                      <input type="text" className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                          placeholder="e.g. English, Spanish"
                          value={newDriver.languages} onChange={e => setNewDriver({...newDriver, languages: e.target.value})} />
                  </div>

                  <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio (Optional)</label>
                      <textarea className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white text-sm"
                          rows={2} placeholder="Brief driver background..."
                          value={newDriver.bio} onChange={e => setNewDriver({...newDriver, bio: e.target.value})} />
                  </div>

                  {/* Vehicle Section */}
                  <div className="col-span-2 border-t pt-4 border-gray-100 dark:border-gray-700">
                      <h4 className="text-sm font-bold text-brand-500">Vehicle Details</h4>
                  </div>
                  <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Model</label>
                      <input required type="text" className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                          value={newDriver.vehicle_model} onChange={e => setNewDriver({...newDriver, vehicle_model: e.target.value})} />
                  </div>
                  <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                      <input type="text" className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                          value={newDriver.vehicle_color} onChange={e => setNewDriver({...newDriver, vehicle_color: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Plate Number</label>
                      <input required type="text" className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                          value={newDriver.vehicle_plate} onChange={e => setNewDriver({...newDriver, vehicle_plate: e.target.value})} />
                  </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                  <button type="submit" disabled={isSubmitting || isUploading} className="px-4 py-2 text-sm bg-brand-500 text-white rounded hover:bg-brand-600 disabled:opacity-50">
                      {isSubmitting ? 'Creating...' : 'Create Driver Account'}
                  </button>
              </div>
          </form>
      </Modal>

      {/* --- DRIVER DETAIL MODAL --- */}
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
                    {/* Reusing the helper here with some extra margin/padding for the modal view */}
                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-bold border ${getStatusBadge(selectedDriver?.status || '')}`}>
                        {selectedDriver?.status}
                    </span>
                </div>
                <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase">Earnings</span>
                    <span className="block mt-1 font-mono text-gray-900 dark:text-white">$ {selectedDriver?.earnings}</span>
                </div>
            </div>

            {/* Admin Actions in Modal */}
            {canManageDrivers && (
                <div className="border-t pt-4 mt-2 border-gray-100 dark:border-gray-700">
                    <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Admin Actions</h4>
                    <div className="flex flex-wrap gap-2">
                        {selectedDriver?.status !== 'suspended' && (
                            <button 
                                onClick={() => handleStatusChange(selectedDriver!.user_id, 'suspended')}
                                className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded text-sm font-medium transition border border-red-200"
                            >
                                Suspend Driver
                            </button>
                        )}
                        
                        {selectedDriver?.status !== 'available' && (
                            <button 
                                onClick={() => handleStatusChange(selectedDriver!.user_id, 'available')}
                                className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded text-sm font-medium transition border border-green-200"
                            >
                                {selectedDriver?.status === 'suspended' ? 'Reactivate Driver' : 'Mark Available'}
                            </button>
                        )}

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
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Driver Fleet ({drivers.length})</h2>
              <div className="flex gap-2">
                  <input type="text" placeholder="Search..." className="rounded-lg border px-4 py-2 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  {canManageDrivers && (
                      <button onClick={() => setIsAddModalOpen(true)} className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-medium text-white hover:bg-brand-600">
                          + Add Driver
                      </button>
                  )}
              </div>
          </div>

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
                        <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg overflow-hidden">
                           {driver.profile_image ? (
                             <img src={driver.profile_image} alt="" className="h-full w-full object-cover"/>
                           ) : "👨‍✈️"}
                        </div>
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
                        {typeof driver.vehicle_details === 'string' ? 'Vehicle Info' : driver.vehicle_details?.model || "Unknown Model"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {typeof driver.vehicle_details === 'string' ? '' : driver.vehicle_details?.plate_number || "No Plate"}
                      </div>
                    </td>
                      <td className="p-4">
                      {/* C. VISUALLY DISTINCT STATUS BADGES */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(driver.status)}`}>
                        {driver.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-sm text-gray-600 dark:text-gray-300">
                       $ {driver.earnings}
                    </td>
                      <td className="p-4 text-right text-gray-400">
                        ⋮
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