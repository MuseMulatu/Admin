import React from "react";
import PageMeta from "../../components/common/PageMeta";
import Skeleton from "../../components/common/Skeleton";
import ReactApexChart from "react-apexcharts";
import { revenueData, rides } from "../../data/mockData";
import { ApexOptions } from "apexcharts";
import LiveFleetMap from "../../components/Maps/LiveFleetMap";

// A simple Badge component for "AI Powered"
const AIBadge = () => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 ml-2">
    ✨ AI Powered
  </span>
);

export default function Home() {
  
const [loading, setLoading] = React.useState(true);

React.useEffect(() => {
  const t = setTimeout(() => setLoading(false), 4000);
  return () => clearTimeout(t);
}, []);


  // Revenue Chart Options
  const chartOptions: ApexOptions = {
    chart: { type: "area", height: 350, toolbar: { show: false }, background: "transparent" },
    colors: ["#4F46E5", "#10B981"],
    stroke: { curve: "smooth", width: 2 },
    xaxis: { categories: revenueData.categories },
    grid: { show: true, borderColor: "#334155" }, // darker lines for tech feel
    theme: { mode: "dark" } // forcing dark mode feel for chart contrast
  };

  return (
    <>
      <PageMeta title="Admin Dashboard | Ride Hailing App" description="Operational and Investor Overview" />
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* TOP ROW: PRACTICAL OPERATIONAL METRICS */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
                {loading ? (
                <Skeleton className="h-20 w-full" />
                      ) : (
                    <div>              
                   <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue (Today)</p>
                  <h4 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">ETB 24,500</h4>
                    </div>
                              )}            
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
                🚀
              </div>
            </div>
          </div>


          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Drivers</p>
                <h4 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">142</h4>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                🟢
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Pool Rides</p>
                <h4 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">38</h4>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                👥
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Seat Utilization</p>
                <h4 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">78%</h4>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                💺
              </div>
            </div>
          </div>
        </div>

              {/* MIDDLE ROW: LIVE MAP & AI PREDICTIONS (Investor Candy) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* REAL MAP INTEGRATION */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden flex flex-col">
             <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between shrink-0">
                <h3 className="font-semibold text-gray-900 dark:text-white">Live Fleet Map</h3>
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded animate-pulse">LIVE TRACKING</span>
             </div>
             <div className="flex-1 min-h-[400px] relative z-0">
                <LiveFleetMap />
             </div>
          </div>

          {/* AI INSIGHTS PANEL */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
             <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Smart Insights <AIBadge /></h3>
             
             <div className="space-y-6">
               <div>
                 <div className="flex justify-between text-sm mb-1">
                   <span className="text-gray-500">Driver Shortage Prediction (Bole Area)</span>
                   <span className="text-red-500 font-medium">High Risk (18:00)</span>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                   <div className="bg-red-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                 </div>
               </div>

               <div>
                 <div className="flex justify-between text-sm mb-1">
                   <span className="text-gray-500">Projected Surge Pricing</span>
                   <span className="text-brand-500 font-medium">1.5x Multiplier</span>
                 </div>
                 <p className="text-xs text-gray-400">Based on historical Friday trends</p>
               </div>

               <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                 <p className="text-sm font-medium text-green-600 dark:text-green-400">🌱 CO2 Savings Today</p>
                 <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">1,240 kg</p>
                 <p className="text-xs text-gray-500">Via Ride Pooling</p>
               </div>
             </div>
          </div>
        </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {[
    { label: "Completed Rides Today", value: "1,240" },
    { label: "Cancellation Rate", value: "3.2%" },
    { label: "Avg Pickup ETA", value: "6.4 mins" },
    { label: "Driver Availability %", value: "82%" },
  ].map((m, i) => (
    <div key={i} className="rounded-xl p-4 bg-white/5 border border-white/10">
      <p className="text-gray-400 text-xs">{m.label}</p>
      <p className="text-xl font-semibold">{m.value}</p>
    </div>
  ))}
</div>

        {/* BOTTOM ROW: REVENUE & ACTIVE RIDES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* REVENUE CHART */}
           <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex justify-between mb-4">
                 <h3 className="font-semibold text-gray-900 dark:text-white">Revenue Analytics</h3>
                 <select className="bg-gray-50 dark:bg-gray-800 border-none text-xs rounded p-1">
                   <option>This Week</option>
                   <option>This Month</option>
                 </select>
              </div>
              <ReactApexChart options={chartOptions} series={revenueData.series} type="area" height={300} />
           </div>

           {/* RECENT RIDES TABLE */}
           <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Live Dispatch</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="pb-2">ID</th>
                      <th className="pb-2">Driver</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {rides.map((ride) => (
                      <tr key={ride.id}>
                        <td className="py-3 text-sm font-medium text-gray-900 dark:text-white">{ride.id}</td>
                        <td className="py-3 text-sm text-gray-500 dark:text-gray-400">{ride.driver}</td>
                        <td className="py-3 text-sm">
                           <span className={`px-2 py-1 rounded text-xs ${ride.type === 'Pool' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                             {ride.type}
                           </span>
                        </td>
                        <td className="py-3 text-sm">
                          <span className="text-green-500">{ride.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>

      </div>
    </>
  );
}