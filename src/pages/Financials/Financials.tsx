import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useAdminStore } from "../../store/useAdminStore";

export default function Financials() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { currentAdmin } = useAdminStore();

useEffect(() => {
  fetch(`/api/admin/financials/stats`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      setStats(data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Fetch financials failed", err);
      setLoading(false);
    });
}, [currentAdmin]);

  const revenueChartOptions: ApexOptions = {
    chart: { type: 'bar', height: 350, toolbar: { show: false } },
    colors: ['#10B981', '#3B82F6'],
    plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisBorder: { show: false }, axisTicks: { show: false } },
    grid: { borderColor: '#334155', strokeDashArray: 4 },
    theme: { mode: 'dark' }
  };

  const revenueSeries = [
    { name: 'Gross Revenue', data: stats?.weekly_revenue || [44, 55, 57, 56, 61, 58, 63] },
    { name: 'Driver Payouts', data: stats?.weekly_payouts || [35, 41, 36, 26, 45, 48, 52] }
  ];

  if (loading) return <div className="p-8 text-center">Loading financial data...</div>;

  return (
    <>
      <PageMeta title="Financial Panel" description="Revenue, payouts, and commissions" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg">
            <p className="text-brand-100 text-sm font-medium uppercase">Total Revenue (Month)</p>
            <h3 className="text-3xl font-bold mt-2">ETB {stats?.total_revenue?.toLocaleString() || '0'}</h3>
            <p className="text-sm mt-4 bg-white/20 inline-block px-2 py-1 rounded">+12.5% vs last month</p>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-gray-500 text-sm font-medium uppercase">Pending Payouts</p>
            <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">ETB {stats?.pending_payouts?.toLocaleString() || '0'}</h3>
            <button className="text-sm mt-4 text-brand-500 font-medium hover:underline">Process Payouts →</button>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-gray-500 text-sm font-medium uppercase">Net Commission</p>
            <h3 className="text-3xl font-bold mt-2 text-emerald-500">ETB {stats?.net_commission?.toLocaleString() || '0'}</h3>
            <p className="text-xs text-gray-400 mt-1">Platform take rate: 15%</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue vs Payouts</h3>
            <select className="bg-gray-50 dark:bg-gray-800 border-none text-sm rounded-lg p-2 outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
            </select>
        </div>
        <ReactApexChart options={revenueChartOptions} series={revenueSeries} type="bar" height={350} />
      </div>
    </>
  );
}
