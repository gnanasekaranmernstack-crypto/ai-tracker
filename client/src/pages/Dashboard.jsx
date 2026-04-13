import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';

export default function Dashboard() {
  const { dashboardData: stats } = useOutletContext();
  const loading = !stats;
  const [dismissedAlertIds, setDismissedAlertIds] = useState([]);

  const visibleAlerts = stats?.notifications?.filter(
    (notification) => !dismissedAlertIds.includes(notification.id)
  ) || [];

  if (loading) return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse-glow"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white capitalize">Dashboard Insights</h2>
          <p className="text-gray-400 mt-1">Overview of your AI usage and upcoming renewals.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:bg-white/5 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-24 h-24 text-indigo-400" />
          </div>
          <div className="flex items-center">
            <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <Activity className="w-7 h-7" />
            </div>
            <div className="ml-5 relative z-10">
              <p className="text-sm font-medium text-gray-400">Total Tools</p>
              <p className="text-3xl font-bold tracking-tight text-white mt-1">{stats?.totalTools || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:bg-white/5 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle className="w-24 h-24 text-teal-400" />
          </div>
          <div className="flex items-center">
            <div className="p-3.5 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="ml-5 relative z-10">
              <p className="text-sm font-medium text-gray-400">Active</p>
              <p className="text-3xl font-bold tracking-tight text-white mt-1">{stats?.activeTools || 0}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:bg-white/5 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle className="w-24 h-24 text-rose-400" />
          </div>
          <div className="flex items-center">
            <div className="p-3.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="ml-5 relative z-10">
              <p className="text-sm font-medium text-gray-400">Expired</p>
              <p className="text-3xl font-bold tracking-tight text-white mt-1">{stats?.expiredTools || 0}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:bg-white/5 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-24 h-24 text-amber-400" />
          </div>
          <div className="flex items-center">
            <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Clock className="w-7 h-7" />
            </div>
            <div className="ml-5 relative z-10">
              <p className="text-sm font-medium text-gray-400">Upcoming Renewals</p>
              <p className="text-3xl font-bold tracking-tight text-white mt-1">{stats?.upcomingRenewals || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Alerts</h3>
            <p className="text-sm text-gray-400 mt-1">Current renewal and expiry updates for your tracked tools.</p>
          </div>
        </div>
        <div className="space-y-3">
          {visibleAlerts.length ? visibleAlerts.map((notification) => (
            <div key={notification.id} className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div>
                <p className="text-sm font-medium text-white">{notification.text}</p>
                <p className="mt-1 text-xs text-gray-500">{new Date(notification.date).toLocaleString()}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                  notification.type === 'renewal'
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : notification.type === 'expired'
                      ? 'bg-rose-500/15 text-rose-300'
                      : 'bg-amber-500/15 text-amber-300'
                }`}>
                  {notification.type}
                </span>
                <button
                  type="button"
                  onClick={() => setDismissedAlertIds((current) => (
                    current.includes(notification.id) ? current : [...current, notification.id]
                  ))}
                  className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-gray-500">
              No active alerts right now.
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel p-8 rounded-3xl h-[450px]">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
          Monthly Expirations & Activity
        </h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={stats?.chartData || []} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 13}} axisLine={false} tickLine={false} dy={10} />
            <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 13}} axisLine={false} tickLine={false} dx={-10} />
            <Tooltip 
              cursor={{fill: '#1e293b', opacity: 0.4}}
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="active" fill="#818cf8" radius={[4, 4, 0, 0]} name="Ending (Active)" maxBarSize={40} />
            <Bar dataKey="expired" fill="#fb7185" radius={[4, 4, 0, 0]} name="Ending (Expired)" maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
