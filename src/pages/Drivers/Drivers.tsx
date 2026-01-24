import { useState, useEffect, useRef } from "react"; 
import PageMeta from "../../components/common/PageMeta";
import Modal from "../../components/common/Modal";
import { useAdminStore } from "../../store/useAdminStore";
import { Edit2, Save, X, Camera, UploadCloud } from "lucide-react"; // Assuming you have lucide-react, or use emojis

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
  email?: string;
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

  // State for Invite Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [driverToInvite, setDriverToInvite] = useState<Driver | null>(null);
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // --- NEW: EDIT MODE STATES ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const editFileRef = useRef<HTMLInputElement>(null);

  const [newDriver, setNewDriver] = useState({
      name: "", phone_number: "+1", gender: "Male", city: "Atlanta, GA", 
      languages: "", bio: "", profile_image: "",    
      vehicle_model: "", vehicle_color: "", vehicle_plate: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
      console.log("drivers--------------:", drivers[0])
  }, [drivers]);
  // --- NEW: INITIALIZE EDIT FORM ---
  useEffect(() => {
    if (selectedDriver) {
        setEditFormData({
            share_username: selectedDriver.share_username,
            phone_number: selectedDriver.phone_number,
            city: selectedDriver.city || "",
            bio: selectedDriver.bio || "",
            profile_image: selectedDriver.profile_image || "",
            // Flatten vehicle details for the form inputs
            vehicle_model: selectedDriver.vehicle_details?.model || "",
            vehicle_color: selectedDriver.vehicle_details?.color || "",
            vehicle_plate: selectedDriver.vehicle_details?.plate_number || "",
        });
        setIsEditMode(false); // Reset to view mode on open
    }
  }, [selectedDriver]);

  // --- IMAGE UPLOAD LOGIC (Generic) ---
  const uploadImage = async (file: File) => {
      const formData = new FormData();
      formData.append("file", file); 
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData,
      });
      return await res.json();
  };

  // Handler for Create Mode Upload
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setIsUploading(true);
      try {
          const data = await uploadImage(file);
          if (data.secure_url) setNewDriver(prev => ({ ...prev, profile_image: data.secure_url }));
      } catch (e) { console.error(e); alert("Upload failed"); } 
      finally { setIsUploading(false); }
  };

  // --- NEW: Handler for Edit Mode Upload ---
  const handleEditFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
        const data = await uploadImage(file);
        if (data.secure_url) setEditFormData((prev: any) => ({ ...prev, profile_image: data.secure_url }));
    } catch (e) { console.error(e); alert("Upload failed"); } 
    finally { setIsUploading(false); }
  };


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


  const handleUpdateDriver = async () => {
    if (!selectedDriver) return;
    setIsSubmitting(true);

    try {
        // 1. Reconstruct complex objects
        const updatedVehicle = {
            model: editFormData.vehicle_model,
            color: editFormData.vehicle_color,
            plate_number: editFormData.vehicle_plate
        };

        // 2. Prepare Payload (MAP FRONTEND KEYS TO DB COLUMNS)
        const payload = {
            share_username: editFormData.share_username,
            pnumber: editFormData.phone_number, // 👈 CHANGED: 'phone_number' -> 'pnumber'
            city: editFormData.city,
            bio: editFormData.bio,
            profile_image: editFormData.profile_image,
            vehicle_details: JSON.stringify(updatedVehicle) 
        };

        // 3. API Call
        const response = await fetch(`https://app.share-rides.com/admin/drivers/${selectedDriver.user_id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || "Update failed");
        }

        // 4. Update Local State (Keep using frontend naming for the UI)
        const updatedDriver: Driver = {
            ...selectedDriver,
            share_username: editFormData.share_username,
            phone_number: editFormData.phone_number, // UI still expects phone_number
            city: editFormData.city,
            bio: editFormData.bio,
            profile_image: editFormData.profile_image,
            vehicle_details: updatedVehicle
        };

        setDrivers(prev => prev.map(d => d.user_id === selectedDriver.user_id ? updatedDriver : d));
        setSelectedDriver(updatedDriver);
        setIsEditMode(false);
        alert("Driver updated successfully!");

    } catch (error: any) {
        console.error(error);
        alert(`Failed to update driver: ${error.message}`);
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


  // --- INVITE HANDLERS (Keep existing) ---
  const openInviteModal = (driver: Driver, e: React.MouseEvent) => {
    e.stopPropagation();
    setDriverToInvite(driver);
    setInviteEmail(driver.email || "");
    setIsInviteModalOpen(true);
  };

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

     {/* --- ADD DRIVER MODAL (Keep existing code) --- */}

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


      {/* --- INVITE MODAL (Keep existing code) --- */}
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

      {/* --- DRIVER DETAIL & EDIT MODAL --- */}
      <Modal 
        isOpen={!!selectedDriver} 
        onClose={() => setSelectedDriver(null)} 
        title={isEditMode ? "Edit Driver" : (selectedDriver?.share_username || "Details")}
      >
         {selectedDriver && (
             <div className="space-y-6">
                 
                 {/* 1. Header Actions (Edit / Save / Cancel) */}
                 <div className="flex justify-end gap-2 border-b pb-4">
                     {!isEditMode ? (
                         <button 
                             onClick={() => setIsEditMode(true)}
                             className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition"
                         >
                             <Edit2 size={14} /> Edit Profile
                         </button>
                     ) : (
                         <>
                            <button 
                                onClick={() => setIsEditMode(false)}
                                className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition"
                            >
                                <X size={14} /> Cancel
                            </button>
                            <button 
                                onClick={handleUpdateDriver}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-4 py-1.5 bg-brand-500 text-white hover:bg-brand-600 rounded-md text-sm font-medium transition shadow-sm"
                            >
                                <Save size={14} /> {isSubmitting ? "Saving..." : "Save Changes"}
                            </button>
                         </>
                     )}
                 </div>

                 {/* 2. Profile Image Section */}
                 <div className="flex flex-col items-center">
                     <div className="relative group">
                         <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm">
                             <img 
                                src={isEditMode ? (editFormData.profile_image || "https://ui-avatars.com/api/?name=Driver") : (selectedDriver.profile_image || "https://ui-avatars.com/api/?name=Driver")} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                             />
                         </div>
                         
                         {/* Edit Overlay */}
                         {isEditMode && (
                             <div 
                                onClick={() => editFileRef.current?.click()}
                                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                 {isUploading ? <UploadCloud className="text-white animate-bounce" /> : <Camera className="text-white" />}
                             </div>
                         )}
                         <input type="file" ref={editFileRef} onChange={handleEditFileChange} className="hidden" accept="image/*" />
                     </div>
                     {isEditMode && <p className="text-xs text-gray-400 mt-2">Click image to change</p>}
                 </div>

                 {/* 3. Fields Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     
                     {/* Name */}
                     <div className="space-y-1">
                         <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                         {isEditMode ? (
                             <input 
                                className="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-1 focus:ring-brand-500 outline-none"
                                value={editFormData.share_username}
                                onChange={e => setEditFormData({...editFormData, share_username: e.target.value})}
                             />
                         ) : (
                             <p className="font-medium text-gray-900">{selectedDriver.share_username}</p>
                         )}
                     </div>

                     {/* Phone */}
                     <div className="space-y-1">
                         <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                         {isEditMode ? (
                             <input 
                                className="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-1 focus:ring-brand-500 outline-none"
                                value={editFormData.phone_number}
                                onChange={e => setEditFormData({...editFormData, phone_number: e.target.value})}
                             />
                         ) : (
                             <p className="font-medium text-gray-900">{selectedDriver.phone_number}</p>
                         )}
                     </div>

                     {/* City */}
                     <div className="space-y-1">
                         <label className="text-xs font-bold text-gray-500 uppercase">City</label>
                         {isEditMode ? (
                             <input 
                                className="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-1 focus:ring-brand-500 outline-none"
                                value={editFormData.city}
                                onChange={e => setEditFormData({...editFormData, city: e.target.value})}
                             />
                         ) : (
                             <p className="font-medium text-gray-900">{selectedDriver.city || "N/A"}</p>
                         )}
                     </div>

                     {/* Earnings (Read Only) */}
                     <div className="space-y-1">
                         <label className="text-xs font-bold text-gray-500 uppercase">Total Earnings</label>
                         <p className="font-mono font-medium text-green-600">$ {selectedDriver.earnings}</p>
                     </div>

                     {/* Bio (Full Width) */}
                     <div className="md:col-span-2 space-y-1">
                         <label className="text-xs font-bold text-gray-500 uppercase">Bio</label>
                         {isEditMode ? (
                             <textarea 
                                rows={2}
                                className="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-1 focus:ring-brand-500 outline-none text-sm"
                                value={editFormData.bio}
                                onChange={e => setEditFormData({...editFormData, bio: e.target.value})}
                             />
                         ) : (
                             <p className="text-sm text-gray-600">{selectedDriver.bio || "No bio available."}</p>
                         )}
                     </div>

                     {/* --- VEHICLE SECTION --- */}
                     <div className="md:col-span-2 pt-4 border-t mt-2">
                         <h4 className="text-sm font-bold text-gray-900 mb-3">Vehicle Information</h4>
                         <div className="grid grid-cols-3 gap-3">
                            {/* Model */}
                            <div>
                                <label className="text-xs text-gray-500">Model</label>
                                {isEditMode ? (
                                    <input 
                                        className="w-full p-2 border rounded bg-gray-50 text-sm"
                                        value={editFormData.vehicle_model}
                                        onChange={e => setEditFormData({...editFormData, vehicle_model: e.target.value})}
                                    />
                                ) : (
                                    <p className="font-medium text-sm">{selectedDriver.vehicle_details?.model}</p>
                                )}
                            </div>

                            {/* Color */}
                            <div>
                                <label className="text-xs text-gray-500">Color</label>
                                {isEditMode ? (
                                    <input 
                                        className="w-full p-2 border rounded bg-gray-50 text-sm"
                                        value={editFormData.vehicle_color}
                                        onChange={e => setEditFormData({...editFormData, vehicle_color: e.target.value})}
                                    />
                                ) : (
                                    <p className="font-medium text-sm">{selectedDriver.vehicle_details?.color}</p>
                                )}
                            </div>

                            {/* Plate */}
                            <div>
                                <label className="text-xs text-gray-500">Plate #</label>
                                {isEditMode ? (
                                    <input 
                                        className="w-full p-2 border rounded bg-gray-50 text-sm"
                                        value={editFormData.vehicle_plate}
                                        onChange={e => setEditFormData({...editFormData, vehicle_plate: e.target.value})}
                                    />
                                ) : (
                                    <p className="font-medium text-sm">{selectedDriver.vehicle_details?.plate_number}</p>
                                )}
                            </div>
                         </div>
                     </div>
                 </div>

                 {/* 4. Status Actions (Only show in View Mode) */}
                 {!isEditMode && canManageDrivers && (
                    <div className="border-t pt-4 mt-2">
                        <h4 className="text-sm font-semibold mb-2">Account Status</h4>
                        <div className="flex gap-2">
                            {selectedDriver.status !== 'suspended' && (
                                <button onClick={() => handleStatusChange(selectedDriver.user_id, 'suspended')} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded text-sm font-medium transition">
                                    Suspend Driver
                                </button>
                            )}
                            {selectedDriver.status !== 'available' && (
                                <button onClick={() => handleStatusChange(selectedDriver.user_id, 'available')} className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded text-sm font-medium transition">
                                    Activate Account
                                </button>
                            )}
                        </div>
                    </div>
                 )}
             </div>
         )}
      </Modal>

      {/* MAIN TABLE (Keep existing table code) */}
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
              {/*  <th className="p-4 text-xs font-semibold uppercase text-gray-500">Earnings</th> 
              */}
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
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
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
                      {/* <td className="p-4 font-mono text-sm text-gray-600">$ {driver.earnings}</td> */}
                      <td className="p-4 text-right">
                        <button 
                            onClick={(e) => openInviteModal(driver, e)}
                            className=" hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-xs font-bold transition border border-gray-300"
                        >
                            {driver.email ? 'Resend Invite ✉️' : 'Invite ✉️'}
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