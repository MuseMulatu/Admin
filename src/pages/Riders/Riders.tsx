import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import Modal from "../../components/common/Modal"; // We reuse the Modal
import { useAdminStore } from "../../store/useAdminStore";

interface Rider {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  balance: string | number;
  status: string;
  avatar_url?: string;
  last_active?: string;
  gender?: string;
}

// Configuration
//const API_BASE_URL = "https://app.share-rides.com";

export default function Riders() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentAdmin, hasPermission } = useAdminStore();
  const canEditWallet = hasPermission('ADMIN');

  // Modal States
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [modalType, setModalType] = useState<'history' | 'wallet' | null>(null);
  const [walletAmount, setWalletAmount] = useState("");

useEffect(() => {
  fetch(`/api/admin/riders`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      setRiders(Array.isArray(data) ? data : []);
      setLoading(false);
    })
    .catch(err => {
      console.error("Fetch riders failed", err);
      setLoading(false);
    });
}, [currentAdmin]);


  const handleWalletUpdate = async () => {
      if (!selectedRider || !walletAmount) return;
      if (!confirm(`Are you sure you want to add ETB ${walletAmount} to ${selectedRider.username}'s wallet?`)) return;

      try {
          const response = await fetch(`/api/admin/riders/${selectedRider.id}/wallet`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: Number(walletAmount),
    action: "UPDATE_WALLET_BALANCE",
    admin_name: currentAdmin?.name || "Admin"
  })
});
          if (response.ok) {
              alert("Wallet updated successfully");
              // Update local state
              const newBalance = Number(selectedRider.balance) + Number(walletAmount);
              setRiders(prev => prev.map(r => r.id === selectedRider.id ? { ...r, balance: newBalance } : r));
              setModalType(null);
              setWalletAmount("");
          } else {
              alert("Failed to update wallet");
          }
      } catch (err) {
          console.error("Wallet update error", err);
          alert("Network error");
      }
  };

  const openHistory = (rider: Rider) => {
      setSelectedRider(rider);
      setModalType('history');
  };

  const openWallet = (rider: Rider) => {
      setSelectedRider(rider);
      setModalType('wallet');
  };

  return (
    <>
      <PageMeta title="Rider Management" description="View and manage app users" />
      
      {/* HISTORY MODAL */}
      <Modal isOpen={modalType === 'history'} onClose={() => setModalType(null)} title={`History: ${selectedRider?.username}`}>
          <div className="p-2 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Recent Rides</h4>
                  {/* Mock Data for History */}
                  <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                          <span>To Bole Airport</span>
                          <span className="text-green-600">Completed (ETB 150)</span>
                      </li>
                      <li className="flex justify-between">
                          <span>To Kazanchis</span>
                          <span className="text-red-500">Cancelled</span>
                      </li>
                      <li className="flex justify-between">
                          <span>To Piassa</span>
                          <span className="text-green-600">Completed (ETB 85)</span>
                      </li>
                  </ul>
              </div>
              <div className="text-center">
                  <button className="text-xs text-brand-500 hover:underline">View All Activity Logs</button>
              </div>
          </div>
      </Modal>

      {/* WALLET MODAL */}
      <Modal isOpen={modalType === 'wallet'} onClose={() => setModalType(null)} title={`Edit Wallet: ${selectedRider?.username}`}>
          <div className="p-2 space-y-4">
              <div className="text-center mb-4">
                  <span className="block text-gray-500 text-xs uppercase">Current Balance</span>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                      ETB {Number(selectedRider?.balance || 0).toFixed(2)}
                  </span>
              </div>
              
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount to Add (Negative to deduct)</label>
                  <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">ETB</span>
                      <input 
                        type="number" 
                        value={walletAmount}
                        onChange={(e) => setWalletAmount(e.target.value)}
                        className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:border-brand-500 outline-none"
                        placeholder="0.00"
                      />
                  </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                  <button 
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleWalletUpdate}
                    className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 shadow-md"
                  >
                    Update Balance
                  </button>
              </div>
          </div>
      </Modal>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Base ({riders.length})</h2>
            
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Search users..." 
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:border-brand-500 outline-none w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <th className="p-4 text-xs font-semibold uppercase text-gray-500 tracking-wide">User</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500 tracking-wide">Contact</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500 tracking-wide">Status</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500 tracking-wide">Wallet</th>
                <th className="p-4 text-xs font-semibold uppercase text-gray-500 tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading users...</td></tr>
              ) : riders
                .filter(r => r.username.toLowerCase().includes(searchTerm.toLowerCase()) || r.email.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((rider) => (
                <tr key={rider.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                        {/* Avatar Logic with Fallback to Random Image */}
                        <img 
                            src={rider.avatar_url || `https://ui-avatars.com/api/?name=${rider.username}&background=random`} 
                            alt="" 
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null; 
                                const randomNum = Math.floor(Math.random() * 99);
                                const genderPath = rider.gender === 'Female' ? 'women' : 'men';
                                target.src = `https://randomuser.me/api/portraits/${genderPath}/${randomNum}.jpg`;
                            }} 
                        />
                        <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{rider.username}</div>
                            <div className="text-xs text-gray-500">Last active: {rider.last_active ? new Date(rider.last_active).toLocaleDateString() : 'N/A'}</div>
                        </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-700 dark:text-gray-300">{rider.email}</div>
                    <div className="text-xs text-gray-500">{rider.phone_number}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rider.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {rider.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-sm text-gray-700 dark:text-gray-300">
                    ETB {Number(rider.balance || 0).toFixed(2)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                        {canEditWallet && (
                            <button 
                                onClick={() => openWallet(rider)}
                                className="text-xs font-medium text-brand-500 hover:underline bg-brand-50 px-2 py-1 rounded"
                            >
                                Wallet
                            </button>
                        )}
                        <button 
                            onClick={() => openHistory(rider)}
                            className="text-xs font-medium text-gray-500 hover:text-gray-700 hover:underline px-2 py-1"
                        >
                            History
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
