//import React from 'react';
import { useAdminStore, AVAILABLE_ADMINS, AdminUser } from '../../store/useAdminStore';
//import Modal from '../common/Modal'; // Using your existing Modal

export default function AdminSelector() {
  const { isAuthenticated, login } = useAdminStore();

  if (isAuthenticated) return null;

  const handleSelect = (admin: AdminUser) => {
    login(admin);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/90 backdrop-blur-sm p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select Identity</h2>
                <p className="text-sm text-gray-500 mt-1">Who is accessing the operations dashboard?</p>
            </div>
            
            <div className="p-4 space-y-3">
                {AVAILABLE_ADMINS.map((admin) => (
                    <button
                        key={admin.id}
                        onClick={() => handleSelect(admin)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-brand-500 transition-all group text-left"
                    >
                        <img src={admin.avatar} alt={admin.name} className="w-12 h-12 rounded-full" />
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors">
                                {admin.name}
                            </h4>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                admin.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                                admin.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                                {admin.role.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="text-gray-400 group-hover:text-brand-500">→</div>
                    </button>
                ))}
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 text-center text-xs text-gray-400">
                ⚠️ All actions will be logged under this identity.
            </div>
        </div>
    </div>
  );
}