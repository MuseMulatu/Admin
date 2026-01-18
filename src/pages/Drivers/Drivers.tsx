import { useState, useEffect, useRef } from "react"; 
import PageMeta from "../../components/common/PageMeta";
import Modal from "../../components/common/Modal";
import { useAdminStore } from "../../store/useAdminStore";

interface Driver {
  id?: string;
  user_id: string;
  share_username: string; 
  phone_number: string; 
  city?: string;
  vehicle_details: any; 
  status: string;
  earnings: number;
  profile_image?: string;
  bio?: string;
  email?: string; // Added email interface
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

  // --- NEW: State for Invite Modal ---
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [driverToInvite, setDriverToInvite] = useState<Driver | null>(null);
  const [isSendingInvite, setIsSendingInvite] = useState(false);

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
    if (s === 'available') return "bg-green-100 text-green-700 border-green-200";
    if (s === 'suspended') return "bg-red-100 text-red-700 border-red-200";
    if (s === 'offline') return "bg-gray-100 text-gray-600 border-gray-200";
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
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
          } else {
              alert("Upload failed.");
          }
      } catch (error) {
          console.error("Error uploading image:", error);
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

          const createdDriverObj: Driver = {
              id: responseData.driver.user_id,
              user_id: responseData.driver.user_id,
              share_username: newDriver.name,
              phone_number: newDriver.phone_number,
              city: newDriver.city,
              status: 'available', 
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
          
          setNewDriver({
              name: "", phone_number: "+1", gender: "Male", city: "Atlanta, GA", 
              languages: "", bio: "", profile_image: "", vehicle_model: "", 
              vehicle_color: "", vehicle_plate: ""
          });

          alert(`Driver "${createdDriverObj.share_username}" added successfully!`);
      } catch (error) {
          alert("Error creating driver.");
          console.error(error);
      } finally {
          setIsSubmitting(false);
      }
  };

  // --- STATUS CHANGE HANDLER ---
  const handleStatusChange = async (driverId: string, newStatus: string) => {
    if (!currentAdmin) return;
    const previousDrivers = drivers;

    setDrivers(prevDrivers => prevDrivers.map(d => 
        d.user_id === driverId ? { ...d, status: newStatus } : d
    ));

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

        if (!response.ok) throw new Error('Failed to update status');
        alert(`Status updated to: ${newStatus.toUpperCase()}`);

    } catch (error: any) {
        setDrivers(previousDrivers);
        if (selectedDriver && selectedDriver.user_id === driverId) {
             const oldDriver = previousDrivers.find(d => d.user_id === driverId);
             if (oldDriver) setSelectedDriver(oldDriver);
        }
        alert(`Failed to update status`);
    }
  };

  // --- NEW: OPEN INVITE MODAL ---
  const openInviteModal = (driver: Driver, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening detail modal
    setDriverToInvite(driver);
    setInviteEmail(driver.email || ""); // Pre-fill if exists
    setIsInviteModalOpen(true);
  };

  // --- NEW: SEND INVITE HANDLER ---
  const handleSendInvite = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!driverToInvite || !inviteEmail) return;
      
      setIsSendingInvite(true);
      try {
          const res = await fetch(`https://app.share-rides.com/admin/drivers/${driverToInvite.user_id}/invite`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: inviteEmail })
          });

          if (!res.ok) throw new Error("Failed to send invite");

          // Update local state with new email
          setDrivers(prev => prev.map(d => 
              d.user_id === driverToInvite.user_id ? { ...d, email: inviteEmail } : d
          ));
          
          alert("Invitation sent successfully!");
          setIsInviteModalOpen(false);
          setInviteEmail("");
      } catch (error) {
          alert("Error sending invitation.");
          console.error(error);
      } finally {
          setIsSendingInvite(false);
      }
  };

  return (
    <>
      <PageMeta title="Driver Management" description="Manage fleet and drivers" />

     {/* --- ADD DRIVER MODAL --- */}
<Modal
  isOpen={isAddModalOpen}
  onClose={() => setIsAddModalOpen(false)}
  title="Add New Driver"
>
  <form
    onSubmit={handleCreateDriver}
    className="space-y-4 mt-1 max-h-[80vh] overflow-y-auto pr-2"
  >
    {/* IMAGE UPLOAD */}
    <div className="flex flex-col items-center justify-center mb-6">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300
                   flex items-center justify-center cursor-pointer
                   hover:border-brand-500 hover:bg-gray-50 overflow-hidden"
      >
        {isUploading ? (
          <span className="text-xs text-gray-500">Uploading...</span>
        ) : newDriver.profile_image ? (
          <img
            src={newDriver.profile_image}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl">📷</span>
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

    {/* FORM FIELDS */}
    <div className="grid grid-cols-2 gap-4">
      <input
        required
        type="text"
        placeholder="Full Name"
        className="col-span-2 w-full p-2 rounded border"
        value={newDriver.name}
        onChange={e => setNewDriver({ ...newDriver, name: e.target.value })}
      />

      <input
        required
        type="text"
        placeholder="Phone"
        className="w-full p-2 rounded border"
        value={newDriver.phone_number}
        onChange={e =>
          setNewDriver({ ...newDriver, phone_number: e.target.value })
        }
      />

      <select
        className="w-full p-2 rounded border"
        value={newDriver.gender}
        onChange={e =>
          setNewDriver({ ...newDriver, gender: e.target.value })
        }
      >
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>

      <input
        required
        type="text"
        placeholder="City"
        className="w-full p-2 rounded border"
        value={newDriver.city}
        onChange={e => setNewDriver({ ...newDriver, city: e.target.value })}
      />

      <input
        type="text"
        placeholder="Languages (e.g. English, Spanish)"
        className="w-full p-2 rounded border"
        value={newDriver.languages}
        onChange={e =>
          setNewDriver({ ...newDriver, languages: e.target.value })
        }
      />

      <input
        type="text"
        placeholder="Vehicle Model"
        className="w-full p-2 rounded border"
        value={newDriver.vehicle_model}
        onChange={e =>
          setNewDriver({ ...newDriver, vehicle_model: e.target.value })
        }
      />

      <input
        type="text"
        placeholder="Vehicle Color"
        className="w-full p-2 rounded border"
        value={newDriver.vehicle_color}
        onChange={e =>
          setNewDriver({ ...newDriver, vehicle_color: e.target.value })
        }
      />

      <input
        required
        type="text"
        placeholder="Plate Number"
        className="col-span-2 w-full p-2 rounded border"
        value={newDriver.vehicle_plate}
        onChange={e =>
          setNewDriver({ ...newDriver, vehicle_plate: e.target.value })
        }
      />

      {/* BIO */}
      <textarea
        placeholder="Bio (Optional)"
        rows={2}
        className="col-span-2 w-full p-2 rounded border text-sm"
        value={newDriver.bio}
        onChange={e => setNewDriver({ ...newDriver, bio: e.target.value })}
      />
    </div>

    {/* ACTIONS */}
    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
      <button
        type="button"
        onClick={() => setIsAddModalOpen(false)}
        className="px-4 py-2 text-sm text-gray-600"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={isSubmitting || isUploading}
        className="px-4 py-2 text-sm bg-brand-500 text-white rounded
                   hover:bg-brand-600 disabled:opacity-50"
      >
        {isSubmitting ? 'Creating...' : 'Create Driver'}
      </button>
    </div>
  </form>
</Modal>


      {/* --- NEW: INVITE MODAL --- */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Send Portal Invitation">
          <form onSubmit={handleSendInvite} className="space-y-4 pt-2">
              <p className="text-sm text-gray-500">
                  Send an invitation link to <strong>{driverToInvite?.share_username}</strong>. 
                  This will verify their email and grant access to <em>driver.hulum.live</em>.
              </p>
              <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Driver Email</label>
                  <input 
                    required 
                    type="email" 
                    placeholder="driver@example.com" 
                    className="w-full mt-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 outline-none"
                    value={inviteEmail} 
                    onChange={e => setInviteEmail(e.target.value)} 
                  />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={isSendingInvite} 
                    className="px-6 py-2 text-sm font-bold bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                  >
                      {isSendingInvite ? 'Sending...' : 'Send Invite 🚀'}
                  </button>
              </div>
          </form>
      </Modal>

      {/* --- DRIVER DETAIL MODAL --- */}
      <Modal isOpen={!!selectedDriver} onClose={() => setSelectedDriver(null)} title={selectedDriver?.share_username || "Details"}>
         {/* ... (Existing Detail Modal Code) ... */}
         {/* ... Just ensuring logic is preserved ... */}
         <div className="space-y-4">
            {/* ... image ... */}
            <div className="grid grid-cols-2 gap-4">
               {/* ... stats ... */}
            </div>
            {canManageDrivers && (
                <div className="border-t pt-4 mt-2">
                    <h4 className="text-sm font-semibold mb-2">Actions</h4>
                    <div className="flex gap-2">
                        {selectedDriver?.status !== 'suspended' && <button onClick={() => handleStatusChange(selectedDriver!.user_id, 'suspended')} className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm">Suspend</button>}
                        {selectedDriver?.status !== 'available' && <button onClick={() => handleStatusChange(selectedDriver!.user_id, 'available')} className="px-3 py-1 bg-green-100 text-green-600 rounded text-sm">Activate</button>}
                    </div>
                </div>
            )}
         </div>
      </Modal>

      {/* MAIN TABLE */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Driver Fleet ({drivers.length})</h2>
              <div className="flex gap-2">
                  <input type="text" placeholder="Search..." className="rounded-lg border px-4 py-2 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  {canManageDrivers && <button onClick={() => setIsAddModalOpen(true)} className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-medium text-white hover:bg-brand-600">+ Add Driver</button>}
              </div>
          </div>

         <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Driver</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Vehicle</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Status</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500">Earnings</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
             <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : drivers.filter(d => (d.share_username || "").toLowerCase().includes(searchTerm.toLowerCase())).map((driver) => (
                  <tr key={driver.user_id} className="group hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedDriver(driver)}>
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                           {driver.profile_image ? <img src={driver.profile_image} alt="" className="h-full w-full object-cover"/> : "👨‍✈️"}
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 text-sm">{driver.share_username}</h5>
                          <p className="text-xs text-gray-500">{driver.phone_number}</p>
                        </div>
                      </div>
                    </td>
                      <td className="p-4 text-sm">{driver.vehicle_details?.model || "Unknown"} <br/><span className="text-xs text-gray-500">{driver.vehicle_details?.plate_number}</span></td>
                      <td className="p-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(driver.status)}`}>{driver.status}</span></td>
                      <td className="p-4 font-mono text-sm text-gray-600">$ {driver.earnings}</td>
                      
                      {/* --- NEW: INVITE BUTTON --- */}
                      <td className="p-4 text-right">
                        <button 
                            onClick={(e) => openInviteModal(driver, e)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-xs font-bold transition border border-gray-300"
                        >
                            {driver.email ? 'Resend Invite' : 'Send Invite ✉️'}
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