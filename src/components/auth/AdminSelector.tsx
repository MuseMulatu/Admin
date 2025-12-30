import React, { useState } from 'react';
import { useAdminStore, AVAILABLE_ADMINS, AdminUser } from '../../store/useAdminStore';
import axios from 'axios';

export default function AdminSelector() {
  const { isAuthenticated, login } = useAdminStore();
  const [selectedTarget, setSelectedTarget] = useState<AdminUser | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return null;

  const handleAdminClick = (admin: AdminUser) => {
    // If it's the Guest User, login immediately (no password needed)
    if (admin.role === 'READ_ONLY') {
        login(admin);
        return;
    }
    // Otherwise, show password prompt
    setSelectedTarget(admin);
    setError('');
    setPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarget) return;

    setLoading(true);
    setError('');

    try {
        // Call your new backend endpoint
        const response = await axios.post('http://localhost:5000/api/admin/login', {
            adminId: selectedTarget.id,
            password: password
        });

        if (response.data.success) {
            login(selectedTarget);
            setSelectedTarget(null);
        }
    } catch (err) {
        setError('Invalid password');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/90 backdrop-blur-sm p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden relative">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedTarget ? `Authenticate` : 'Select Identity'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    {selectedTarget ? `Enter password for ${selectedTarget.name}` : 'Who is accessing the dashboard?'}
                </p>
            </div>
            
            <div className="p-4">
                {/* VIEW 1: LIST OF ADMINS */}
                {!selectedTarget && (
                    <div className="space-y-3">
                        {AVAILABLE_ADMINS.map((admin) => (
                            <button
                                key={admin.id}
                                onClick={() => handleAdminClick(admin)}
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
                )}

                {/* VIEW 2: PASSWORD INPUT */}
                {selectedTarget && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="flex justify-center mb-4">
                            <img src={selectedTarget.avatar} alt={selectedTarget.name} className="w-20 h-20 rounded-full border-4 border-brand-100" />
                        </div>

                        <div>
                            <input 
                                type="password" 
                                autoFocus
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter admin password..."
                                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            />
                            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => { setSelectedTarget(null); setPassword(''); setError(''); }}
                                className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 p-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Login'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 text-center text-xs text-gray-400">
                ⚠️ Secure Admin Access Area
            </div>
        </div>
    </div>
  );
}