import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useAdminStore } from "../../store/useAdminStore";

interface LogEntry {
    id: number;
    admin_name: string;
    admin_role: string;
    action: string;
    entity_type: string;
    entity_id: string;
    created_at: string;
    ip_address: string;
}

export default function AdminLogs() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const { currentAdmin } = useAdminStore();

    useEffect(() => {
        fetch("https://app.share-rides.com/admin/logs", {
            headers: {
                'X-Admin-Id': currentAdmin?.id || '',
                'X-Admin-Role': currentAdmin?.role || ''
            }
        })
        .then(res => res.json())
        .then(data => {
            setLogs(Array.isArray(data) ? data : []);
            setLoading(false);
        })
        .catch(err => {
            console.error("Fetch logs failed", err);
            setLoading(false);
        });
    }, [currentAdmin]);

    return (
        <>
            <PageMeta title="Audit Logs" description="System action history" />
            
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">System Audit Logs</h2>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800 text-xs uppercase text-gray-500">
                                <th className="p-4">Time</th>
                                <th className="p-4">Admin</th>
                                <th className="p-4">Action</th>
                                <th className="p-4">Entity</th>
                                <th className="p-4">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading logs...</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                    <td className="p-4 text-xs text-gray-500">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-[10px] font-bold text-brand-600">
                                                {log.admin_name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{log.admin_name}</div>
                                                <div className="text-[10px] text-gray-500">{log.admin_role}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono font-medium text-gray-700 dark:text-gray-300">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                                        {log.entity_type} #{log.entity_id}
                                    </td>
                                    <td className="p-4 text-xs text-gray-400 font-mono">
                                        {log.ip_address}
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