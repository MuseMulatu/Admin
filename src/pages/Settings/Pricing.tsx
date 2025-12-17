import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useAdminStore } from "../../store/useAdminStore";

export default function Pricing() {
  const { currentAdmin } = useAdminStore();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
        setIsSaving(false);
        alert("Settings saved successfully!");
    }, 1500);
  };

  return (
    <>
      <PageMeta title="Settings" description="Manage your preferences" />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-2">
            {['profile', 'notifications', 'security', 'billing'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === tab 
                        ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400' 
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`}
                >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
                
                {/* Profile Section */}
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Profile Information</h3>
                        
                        <div className="flex items-center gap-6">
                            <img 
                                src={currentAdmin?.avatar || "https://ui-avatars.com/api/?name=Admin"} 
                                alt="Avatar" 
                                className="w-20 h-20 rounded-full border-4 border-gray-100 dark:border-gray-700"
                            />
                            <div>
                                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Change Photo</button>
                                <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size 800K</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                <input type="text" defaultValue={currentAdmin?.name} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:border-brand-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                                <input type="text" value={currentAdmin?.role} disabled className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-500 cursor-not-allowed" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                <input type="email" defaultValue="admin@share-rides.com" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:border-brand-500 outline-none" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications Section */}
                {activeTab === 'notifications' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Notification Preferences</h3>
                        <div className="space-y-4">
                            {['Email me when a ride is flagged', 'Send weekly financial reports', 'Notify me about driver signups', 'System maintenance alerts'].map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-2">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Security Section */}
                {activeTab === 'security' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Security</h3>
                        <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-800 text-sm">
                            Two-factor authentication is currently <strong>enabled</strong>.
                        </div>
                        <button className="text-brand-500 text-sm font-medium hover:underline">Change Password</button>
                    </div>
                )}

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`px-6 py-2.5 rounded-lg text-white font-medium transition-all ${
                            isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-500 hover:bg-brand-600 shadow-lg hover:shadow-xl'
                        }`}
                    >
                        {isSaving ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </span>
                        ) : 'Save Changes'}
                    </button>
                </div>

            </div>
        </div>
      </div>
    </>
  );
}