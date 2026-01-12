import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Skeleton from "../../components/common/Skeleton";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import LiveFleetMap from "../../components/Maps/LiveFleetMap";
import { useFleetStore } from "../../store/useFleetStore";
import { useAdminStore } from "../../store/useAdminStore";

/* ---------- UI Components ---------- */

const AIBadge = () => (
  <span className="animate-pulse inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20 ml-2">
    ✨ AI Live
  </span>
);

const MetricCard = ({ label, value, icon, trend }: any) => (
  <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-900/50 dark:backdrop-blur-xl">
    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-brand-500/10 to-purple-500/10 blur-3xl transition-all group-hover:from-brand-500/20 group-hover:to-purple-500/20" />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 font-inter">
          {label}
        </p>
        <h4 className="mt-3 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {value}
        </h4>
        {trend && (
          <div className="mt-2 flex items-center gap-1">
            <span className={`text-xs font-bold ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-xs text-gray-400">vs yesterday</span>
          </div>
        )}
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-2xl shadow-inner dark:bg-gray-800 dark:text-white dark:shadow-none">
        {icon}
      </div>
    </div>
  </div>
);

const SmallMetric = ({ label, value, colorClass = "text-gray-900 dark:text-white" }: any) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
    <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</p>
    <p className={`mt-1 text-xl font-bold ${colorClass}`}>
      {value}
    </p>
  </div>
);

// --- ShadCN-style Logs Component ---
const ActivityLog = ({ logs }: { logs: any[] }) => {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 h-full flex flex-col">
      <div className="flex flex-col space-y-1.5 p-6 pb-4">
        <h3 className="text-lg font-semibold leading-none tracking-tight">Recent Activity</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Latest audit logs and system actions.
        </p>
      </div>
      <div className="p-0 flex-1 overflow-y-auto max-h-[350px]">
        <div className="w-full overflow-auto">
          <table className="w-full text-sm text-left">
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4 align-middle font-medium">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">{log.action}</span>
                    </div>
                  </td>
                  <td className="p-4 align-middle text-zinc-500 dark:text-zinc-400">
                    <span className="text-xs">{log.admin_name}</span>
                  </td>
                  <td className="p-4 align-middle text-right">
                    <span className="text-xs text-zinc-400 font-mono">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-zinc-500 text-xs italic">
                    No recent activity logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- CITY CONFIGURATION ---
const CITIES = {
  "Austin, TX": { lat: 30.2672, lng: -97.7431 },
  "Atlanta, GA": { lat: 33.7490, lng: -84.3880 }
};

export default function Home() {
    const [loading, setLoading] = useState(true);
    const [dashboard, setDashboard] = useState<any>(null);
    const [recentLogs, setRecentLogs] = useState<any[]>([]);
    const [chartRange, setChartRange] = useState<'weekly' | 'monthly'>('weekly');
    
    // --- NEW: City State ---
    const [selectedCity, setSelectedCity] = useState<keyof typeof CITIES>("Austin, TX");

    // --- AI Audit State ---
    const [isAuditModalOpen, setAuditModalOpen] = useState(false);
    const [auditingId, setAuditingId] = useState<string | null>(null);
    const [auditResult, setAuditResult] = useState<any>(null);

    const isMapLoading = useFleetStore(state => state.isLoading);
    
    // Auth & Permissions
    const { currentAdmin, hasPermission, logout } = useAdminStore();
    const canUpdateRides = hasPermission?.("ADMIN") || hasPermission?.("SUPER_ADMIN") || false;


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading true when city changes to refresh UI feedback
      try {
        // 1. Fetch Dashboard Overview (Dynamic City)
        const dashRes = await fetch(
          `https://app.share-rides.com/admin/dashboard/overview?city=${encodeURIComponent(selectedCity)}`,
          { method: "GET" }
        );

        if (!dashRes.ok) throw new Error(`Dashboard fetch failed: ${dashRes.status}`);

        const rawText = await dashRes.text();
        const dashData = JSON.parse(rawText);
        setDashboard(dashData);

        if (!currentAdmin) return;

        // 2. Fetch Logs
        const logsRes = await fetch(`https://app.share-rides.com/admin/logs`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Admin-Id": currentAdmin.id,
            "X-Admin-Role": currentAdmin.role || 'admin',
          }
        });

        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setRecentLogs(Array.isArray(logsData) ? logsData.slice(0, 10) : []);
        }
        setLoading(false);
      } catch (err) {
        console.error("Dashboard data load error:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [currentAdmin, selectedCity]); // Re-run when city changes


  // --- AI Audit Handler ---
  const handleAuditRide = async (rideId: string) => {
    setAuditingId(rideId);
    setAuditResult(null);
    setAuditModalOpen(true);

    try {
      const detailsRes = await fetch(`https://app.share-rides.com/admin/rides/${rideId}`, {
         headers: {
            "X-Admin-Id": currentAdmin?.id ?? "",
            "X-Admin-Role": currentAdmin?.role?.toUpperCase() ?? ""
         }
      });
      
      if(!detailsRes.ok) throw new Error("Could not fetch ride details for audit");
      const ride = await detailsRes.json();

      const response = await fetch(`https://app.share-rides.com/api/ai/audit-ride`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          rideId: ride.id,
          origin_address: ride.origin_address, 
          destination_address: ride.destination_address,
          user_location: ride.origin_lat ? `${ride.origin_lat},${ride.origin_lng}` : ride.origin_address,
          destination_location: ride.dest_lat ? `${ride.dest_lat},${ride.dest_lng}` : ride.destination_address,
          distance_km: ride.distance_km || 0,
          time_taken: ride.time_taken || 0
        })
      });

      if (!response.ok) throw new Error('Audit failed');
      
      const data = await response.json();
      setAuditResult(data);
    } catch (error) {
      console.error(error);
      setAuditResult({ error: "Failed to connect to AI Auditor." });
    } finally {
      setAuditingId(null);
    }
  };

  const handleAssignDriver = async (rideId: string) => {
    if (!confirm(`Confirm assignment override for Ride ${rideId}?`)) return;

    try {
      const response = await fetch(
        `https://app.share-rides.com/admin/rides/${rideId}/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Admin-Id": currentAdmin?.id ?? "",
            "X-Admin-Role": currentAdmin?.role?.toUpperCase() ?? ""
          },
          body: JSON.stringify({
            assigned_by: currentAdmin?.name,
            action: "MANUAL_DRIVER_ASSIGNMENT",
            timestamp: new Date().toISOString()
          })
        }
      );

      if (response.ok) {
        alert("Driver assignment initiated.");
      } else {
        alert("Failed to assign driver.");
      }
    } catch (error) {
      console.error("Assignment error:", error);
    }
  };


  const chartOptions: ApexOptions = {
    chart: {
      type: "area",
      height: 300,
      fontFamily: "Inter, sans-serif",
      toolbar: { show: false },
      animations: { enabled: true, speed: 800, easing: 'easeinout' } as any, 
      dropShadow: { enabled: true, top: 10, left: 0, blur: 3, color: '#4F46E5', opacity: 0.15 }
    },
    stroke: { curve: "smooth", width: 3 },
    dataLabels: { enabled: false },
    colors: ["#6366f1"],
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
    xaxis: {
      categories: dashboard?.revenueChart?.[chartRange]?.categories || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#64748b", fontSize: '11px', fontFamily: 'Inter' } },
    },
    yaxis: {
      show: true,
      labels: { 
        style: { colors: "#64748b", fontSize: '11px', fontFamily: 'Inter' },
        formatter: (val) => `$${val}` 
      }
    },
    grid: {
      show: true,
      borderColor: "#1e293b",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } }
    },
    tooltip: { theme: "dark" },
  };

  if (loading || !dashboard) {
    return (
      <div className="p-6 grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[...Array(4)].map((_,i) => <Skeleton key={i} className="h-40 rounded-3xl" />)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <>
      <PageMeta title={`Executive Dashboard - ${selectedCity} | Hulum Rides`} description="Real-time operational intelligence" />

      {/* --- HEADER --- */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Overview</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Real-time fleet analytics for
            </p>
            {/* CITY SWITCHER */}
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value as keyof typeof CITIES)}
              className="bg-transparent font-bold text-brand-500 border-none p-0 pr-6 cursor-pointer focus:ring-0 text-sm hover:text-brand-600 transition-colors"
            >
              {Object.keys(CITIES).map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {currentAdmin && (
               <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"  onClick={logout} title="Click to Switch Identity">
                   <img src={currentAdmin.avatar} alt="Admin" className="w-6 h-6 rounded-full" />
                   <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{currentAdmin.name}</span>
                   <span className="text-[10px] uppercase font-bold text-brand-500 border border-brand-200 px-1 rounded">{currentAdmin.role.replace('_', '')}</span>
               </div>
           )}

           <div className="flex items-center gap-2">
             <span className="flex h-3 w-3 relative">
               <span className={`absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 ${isMapLoading ? 'animate-none' : 'animate-ping'}`}></span>
               <span className={`relative inline-flex rounded-full h-3 w-3 ${isMapLoading ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
             </span>
             <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
               {isMapLoading ? 'Updating Fleet...' : 'System Operational'}
             </span>
           </div>
        </div>
      </div>

      {/* --- KPI GRID --- */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Revenue" value={`$${dashboard.metrics.revenueToday.toLocaleString()}`} icon="💸" trend={12.5} />
          <MetricCard label="Active Drivers" value={dashboard.metrics.activeDrivers} icon="🏎️" trend={-2.4} />
          <MetricCard label="Pool Efficiency" value={dashboard.metrics.activePoolRides} icon="🧬" trend={8.1} />
          <MetricCard label="Seat Utilization" value={`${dashboard.metrics.seatUtilization}%`} icon="💺" trend={5.3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Map - Now accepts city coordinates */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col">
            <div className="absolute top-5 left-5 z-10">
               <div className="flex items-center gap-2 bg-white/90 dark:bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 shadow-lg">
                 <div className={`h-2 w-2 rounded-full ${isMapLoading ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                 <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    {isMapLoading ? 'Syncing...' : `Live Fleet: ${selectedCity.split(',')[0]}`}
                 </span>
               </div>
            </div>
            <div className="flex-1 min-h-[450px]">
              <LiveFleetMap 
                center={[CITIES[selectedCity].lat, CITIES[selectedCity].lng]} 
                zoom={12} 
              />
            </div>
          </div>

          {/* Logs & Insights */}
          <div className="flex flex-col gap-6 h-[450px]">
             <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex-1 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">AI Predictions</h3>
                  <AIBadge />
                </div>
                <div className="space-y-4">
                  <div className="group">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 font-medium">Demand Surge ({selectedCity.split(',')[0]} Core)</span>
                      <span className="text-rose-500 font-bold">High</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-800 overflow-hidden">
                      <div className="bg-gradient-to-r from-rose-500 to-orange-500 h-1.5 rounded-full w-[85%] shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">🌱 CO₂ Savings via pooling</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                      {dashboard?.metrics?.co2Saved} kgs 
                    </p>
                  </div>
                </div>
             </div>

             <div className="flex-1">
                <ActivityLog logs={recentLogs} />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SmallMetric label="Completed Rides" value={dashboard?.metrics?.completedRides} />
          <SmallMetric label="Cancellation Rate" value={`${dashboard?.metrics?.cancellationRate}%`} colorClass="text-rose-500" />
          <SmallMetric label="Avg Pickup Time" value={`${dashboard?.metrics?.avgPickupEta} min`} />
          <SmallMetric label="Driver Uptime" value={`${dashboard?.metrics?.driverAvailability}%`} colorClass="text-emerald-500" />
        </div>

        {/* ... Rest of the component (Charts, Tables) remains the same ... */}
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Revenue Performance</h3>
                <p className="text-xs text-gray-500">Net earnings before platform fees</p>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button onClick={() => setChartRange('weekly')} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartRange === 'weekly' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Weekly</button>
                <button onClick={() => setChartRange('monthly')} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartRange === 'monthly' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Monthly</button>
              </div>
            </div>
            {dashboard?.revenueChart?.[chartRange]?.series && (
              <ReactApexChart options={chartOptions} series={dashboard.revenueChart[chartRange].series} type="area" height={320} />
            )}
          </div>

        {/* --- LIVE DISPATCH TABLE --- */}
         <div className="rounded-3xl border border-gray-200 bg-white p-0 shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white">Live Dispatch</h3>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-md animate-pulse">
                {dashboard.liveRides.length} Active
            </span>
          </div>

          <div className="overflow-y-auto max-h-[380px]">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0 backdrop-blur-sm z-10">
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {/* MOVED: Action Column First */}
                  <th className="px-6 py-3 w-[140px]">Quick Actions</th>
                  <th className="px-6 py-3">Ride ID</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {dashboard.liveRides.map((ride: any) => (
                  <tr
                    key={ride.id}
                    className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                     {/* 1. ACTIONS COLUMN (First for Visibility) */}
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                            {/* AI AUDIT BUTTON */}
                            <button
                                onClick={() => handleAuditRide(ride.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:shadow-md transition-all whitespace-nowrap"
                                title="Run AI Fraud & Efficiency Check"
                            >
                                ✨AI Analyze
                            </button>

                            {/* Assign Button (Secondary) */}
                            {!ride.driver && canUpdateRides && (
                                <button
                                    onClick={() => handleAssignDriver(ride.id)}
                                    className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded"
                                    title="Manual Assignment"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                </button>
                            )}
                       </div>
                    </td>

                    {/* Ride ID + Driver */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        {ride.profile_image ? (
                          <img
                            src={ride.profile_image}
                            alt={ride.driver}
                            className="h-8 w-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                `https://ui-avatars.com/api/?name=${ride.driver}&background=random`;
                            }}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                            {ride.driver ? ride.driver.charAt(0).toUpperCase() : "?"}
                          </div>
                        )}

                        <div className="flex flex-col leading-tight">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {ride.driver || "Finding Driver..."}
                          </span>
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                            {ride.id.substring(0,8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          ride.type === "corider"
                            ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800"
                            : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                        }`}
                      >
                        {ride.type === "corider" ? "Pool" : "Standard"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-medium text-emerald-500">{ride.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        </div>
      </div>

      {/* --- AI AUDIT MODAL (Copied Overlay) --- */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 backdrop-blur-sm outline-none focus:outline-none">
           <div className="relative w-full max-w-lg rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                     <span className="text-2xl">✨</span>
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white">Ride Audit Report</h3>
                  </div>
                  <button onClick={() => setAuditModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>
              
              {auditingId ? (
                  <div className="flex flex-col items-center py-10">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-t-transparent"></div>
                      <p className="mt-4 text-gray-500 font-medium">AI is analyzing route & fraud markers...</p>
                  </div>
              ) : auditResult ? (
                  <div className="space-y-4">
                      {auditResult.error ? (
                          <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-100">
                              {auditResult.error}
                          </div>
                      ) : (
                          <>
                            <div className={`p-5 rounded-xl border-l-4 ${auditResult.flag === 'Red' ? 'bg-red-50 border-red-500 text-red-800' : auditResult.flag === 'Yellow' ? 'bg-yellow-50 border-yellow-500 text-yellow-800' : 'bg-green-50 border-green-500 text-green-800'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <strong className="text-lg uppercase tracking-wide">{auditResult.flag} Flag</strong>
                                    <span className="text-xs bg-white/50 px-2 py-1 rounded">Confidence: High</span>
                                </div>
                                <p className="leading-relaxed">{auditResult.summary}</p>
                            </div>
                            
                            {auditResult.comparison && (
                                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <p className="font-semibold mb-2">Technical Analysis:</p>
                                    <div className="grid grid-cols-2 gap-4">
                                       <div>
                                          <span className="block text-xs text-gray-500 uppercase">Std Distance</span>
                                          <span className="font-mono">{auditResult.comparison.standardDistanceKm.toFixed(2)} km</span>
                                       </div>
                                       <div>
                                          <span className="block text-xs text-gray-500 uppercase">Std Time</span>
                                          <span className="font-mono">{auditResult.comparison.standardTimeMin.toFixed(2)} min</span>
                                       </div>
                                    </div>
                                </div>
                            )}
                          </>
                      )}
                  </div>
              ) : (
                  <p className="text-red-500">Could not retrieve audit.</p>
              )}
              
              <div className="mt-8 flex justify-end">
                  <button onClick={() => setAuditModalOpen(false)} className="rounded-lg bg-gray-100 px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                      Close Report
                  </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
}