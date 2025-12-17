import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useAdminStore } from "../../store/useAdminStore";

interface Rider {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  balance: string | number; // API returns string, but we handle both
  status: string;
  avatar_url?: string;
  last_active?: string;
  gender?: string; // Added gender to interface for potentially better random images
}

export default function Riders() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentAdmin } = useAdminStore();

  useEffect(() => {
    fetch("https://app.share-rides.com/admin/riders", {
        headers: {
            'X-Admin-Id': currentAdmin?.id || '',
            'X-Admin-Role': currentAdmin?.role || ''
        }
    })
      .then(res => res.json())
      .then(data => {
          setRiders(Array.isArray(data) ? data : []);
          setLoading(false);
      })
      .catch(err => {
          console.error("Fetch riders failed", err);
          setLoading(false);
      });
  }, [currentAdmin]);

  return (
    <>
      <PageMeta title="Rider Management" description="View and manage app users" />
      
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
                                // Prevent infinite loop if the fallback also fails
                                target.onerror = null; 
                                // Generate random number between 0 and 99
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
                    ETB {Number(rider.balance).toFixed(2)}
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-xs font-medium text-brand-500 hover:underline">View History</button>
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