import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useAdminStore } from "../../store/useAdminStore";
import { Save, AlertCircle, RefreshCw, Zap } from "lucide-react"; // Make sure you have lucide-react

export default function Pricing() {
  const { currentAdmin } = useAdminStore();
  const [activeTab, setActiveTab] = useState('pricing'); // Default to pricing for now
  
  // Pricing State
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 1. Fetch Rules on Load
  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    setLoading(true);
    try {
        const res = await fetch('https://app.share-rides.com/api/admin/pricing');
        const data = await res.json();
        setRules(data);
    } catch (e) {
        alert("Failed to load pricing rules");
    }
    setLoading(false);
  };

  // 2. Handle Local Input Changes
  const handleInputChange = (id: number, field: string, value: any) => {
     setRules(prev => prev.map(rule => 
        rule.id === id ? { ...rule, [field]: value } : rule
     ));
     setHasUnsavedChanges(true);
  };

  // 3. Save All Changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
        // We save individually for simplicity, or you could make a bulk endpoint
        const promises = rules.map(rule => 
            fetch(`https://app.share-rides.com/api/admin/pricing/${rule.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rule)
            })
        );
        
        await Promise.all(promises);
        setHasUnsavedChanges(false);
        alert("All pricing rules updated successfully! 💸");
    } catch (e) {
        alert("Error saving settings");
    }
    setIsSaving(false);
  };

  // Helper: Group rules by City for cleaner UI
  const groupedRules = rules.reduce((acc: any, rule) => {
      if (!acc[rule.city]) acc[rule.city] = [];
      acc[rule.city].push(rule);
      return acc;
  }, {});

  return (
    <>
      <PageMeta title="Pricing Engine" description="Manage fares and city rules" />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 font-sans">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-2">
            {['pricing', 'profile', 'notifications', 'security'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === tab 
                        ? 'bg-black text-white shadow-lg' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    {tab === 'pricing' ? '💰 Pricing Engine' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
            
            {/* PRICING TAB */}
            {activeTab === 'pricing' && (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Fare Settings</h2>
                            <p className="text-sm text-gray-500">Adjust base fares, rates, and radius rules per city.</p>
                        </div>
                        <button 
                            onClick={handleSave}
                            disabled={!hasUnsavedChanges || isSaving}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                                hasUnsavedChanges 
                                ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-green-200'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {isSaving ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18} />}
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center p-10">Loading engine...</div>
                    ) : (
                        Object.entries(groupedRules).map(([city, cityRules]: [string, any]) => (
                            <div key={city} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                                {/* City Header */}
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-lg font-black text-gray-800 uppercase tracking-wider">
                                        🏙️ {city === 'default' ? 'Global Default' : city}
                                    </h3>
                                    {city === 'Atlanta' && (
                                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">
                                            Flat Rate Active
                                        </span>
                                    )}
                                </div>

                                {/* Rules Table */}
                                <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b">
                                        <tr>
                                            <th className="px-6 py-3">Vehicle</th>
                                            <th className="px-4 py-3">Base Fare ($)</th>
                                            <th className="px-4 py-3">Per KM ($)</th>
                                            <th className="px-4 py-3">Per Min ($)</th>
                                            <th className="px-4 py-3">Min Fare ($)</th>
                                            <th className="px-6 py-3 bg-yellow-50/50 border-l border-yellow-100">
                                                <div className="flex items-center gap-1 text-yellow-700">
                                                    <Zap size={12}/> Flat Rate Rule
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {cityRules.map((rule: any) => (
                                            <tr key={rule.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-900 capitalize">
                                                    {rule.vehicle_type === 'xl' ? 'Van (XL)' : rule.vehicle_type}
                                                </td>
                                                
                                                {/* Standard Rates */}
                                                <td className="px-4 py-2">
                                                    <input type="number" step="0.10" value={rule.base_fare} 
                                                        onChange={(e) => handleInputChange(rule.id, 'base_fare', e.target.value)}
                                                        className="w-20 px-2 py-1 rounded border border-gray-200 font-mono text-center focus:border-black outline-none" 
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input type="number" step="0.10" value={rule.rate_per_km} 
                                                        onChange={(e) => handleInputChange(rule.id, 'rate_per_km', e.target.value)}
                                                        className="w-20 px-2 py-1 rounded border border-gray-200 font-mono text-center focus:border-black outline-none" 
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input type="number" step="0.05" value={rule.rate_per_min} 
                                                        onChange={(e) => handleInputChange(rule.id, 'rate_per_min', e.target.value)}
                                                        className="w-20 px-2 py-1 rounded border border-gray-200 font-mono text-center focus:border-black outline-none" 
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input type="number" step="1.00" value={rule.min_fare} 
                                                        onChange={(e) => handleInputChange(rule.id, 'min_fare', e.target.value)}
                                                        className="w-20 px-2 py-1 rounded border border-gray-200 font-mono text-center focus:border-black outline-none" 
                                                    />
                                                </td>

                                                {/* Flat Rate Logic (Yellow Section) */}
                                                <td className="px-6 py-4 bg-yellow-50/30 border-l border-yellow-100">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <label className="text-xs text-gray-500">Active?</label>
                                                            <input type="checkbox" checked={!!rule.flat_rate_active} 
                                                                onChange={(e) => handleInputChange(rule.id, 'flat_rate_active', e.target.checked ? 1 : 0)}
                                                                className="h-4 w-4 accent-yellow-600 rounded cursor-pointer" 
                                                            />
                                                        </div>
                                                        <div className={`transition-opacity ${rule.flat_rate_active ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-[10px] uppercase font-bold text-gray-400 w-12">Price:</span>
                                                                <input type="number" value={rule.flat_rate_amount} 
                                                                    onChange={(e) => handleInputChange(rule.id, 'flat_rate_amount', e.target.value)}
                                                                    className="w-16 px-1 py-0.5 text-xs border rounded bg-white text-right font-mono" 
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] uppercase font-bold text-gray-400 w-12">Dist &lt;</span>
                                                                <input type="number" value={rule.flat_rate_threshold_km} 
                                                                    onChange={(e) => handleInputChange(rule.id, 'flat_rate_threshold_km', e.target.value)}
                                                                    className="w-16 px-1 py-0.5 text-xs border rounded bg-white text-right font-mono" 
                                                                />
                                                                <span className="text-[10px] text-gray-400">km</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* KEEP EXISTING TABS (Profile, etc) */}
            {activeTab === 'profile' && (
               <div className="p-10 text-center bg-white rounded-2xl border border-gray-200">Profile Settings Placeholder</div>
            )}
            {activeTab === 'notifications' && (
               <div className="p-10 text-center bg-white rounded-2xl border border-gray-200">Notifications Placeholder</div>
            )}
        </div>
      </div>
    </>
  );
}