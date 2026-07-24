import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActivityFeed from '@/Components/ActivityFeed';
import { Head, router, usePage } from '@inertiajs/react';
import dashboard from '@/routes/dashboard';
import {
  Activity, BarChart3, Clock, Download, GitBranch, Phone, PhoneCall,
  PhoneIncoming, PieChart as PieChartIcon, TrendingUp, Calendar,
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useState, useMemo, useCallback } from 'react';
import { formatDuration } from '@/utils/format';

const PRESETS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

const icons = { Activity, GitBranch, Phone, PhoneIncoming, PhoneCall, Clock };

const statCards = [
  { label: 'Total Flows', key: 'total_flows', icon: 'GitBranch' },
  { label: 'Active Flows', key: 'active_flows', icon: 'Activity' },
  { label: 'Total Calls', key: 'total_calls', icon: 'Phone' },
  { label: 'Calls Today', key: 'calls_today', icon: 'PhoneIncoming' },
  { label: 'Active Calls', key: 'active_calls', icon: 'PhoneCall' },
  { label: 'Avg Duration', key: 'avg_duration_seconds', icon: 'Clock', format: formatDuration },
];

const STATUS_COLORS = {
  completed: '#22c55e',
  in_progress: '#f59e0b',
  initiated: '#3b82f6',
  failed: '#ef4444',
  transferred: '#a855f7',
};

function dateDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function shortDate(iso) {
  if (!iso) return '';
  const d = new Date(iso.replace(/-/g, '/'));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Dashboard({
  stats, range, callsByDay, callsByStatus, avgDurationByDay,
  callsByFlow, callsByFlowWithMetrics,
}) {
  const { url } = usePage();
  const [loading, setLoading] = useState(false);
  const params = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : url.split('?')[1]
  );
  const activeStart = params.get('start');
  const activeEnd = params.get('end');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const applyPreset = useCallback((days) => {
    setLoading(true);
    router.get('/dashboard', { start: dateDaysAgo(days), end: todayStr() }, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setLoading(false),
    });
  }, []);

  const applyCustom = useCallback((e) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    setLoading(true);
    router.get('/dashboard', { start: customStart, end: customEnd }, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setLoading(false),
    });
  }, [customStart, customEnd]);

  function getActivePreset() {
    if (!activeStart) return 7;
    const diff = Math.round(
      (new Date(todayStr()).getTime() - new Date(activeStart.replace(/-/g, '/')).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const match = PRESETS.find((p) => p.days === diff);
    return match ? match.days : null;
  }

  const activePreset = getActivePreset();
  const rangeLabel = `${shortDate(range.start)} – ${shortDate(range.end)}`;
  const isEmpty = callsByDay.length === 0;

  const tooltipStyle = {
    borderRadius: '8px',
    border: '1px solid #e4e4e7',
    backgroundColor: 'white',
  };

  return (
    <AuthenticatedLayout>
      <Head title="Dashboard" />

      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Operations Overview</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Real-time performance metrics for your AI voice fleet — {rangeLabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range */}
          <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1">
            {PRESETS.map((p) => (
              <button
                key={p.days}
                type="button"
                onClick={() => applyPreset(p.days)}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-all ${
                  activePreset === p.days
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {p.label}
              </button>
            ))}
            <div className="mx-1 h-4 w-px bg-zinc-300" />
            <button
              type="button"
              onClick={() => document.getElementById('custom-date-toggle')?.click()}
              className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-semibold text-zinc-500 hover:text-zinc-700"
            >
              <Calendar className="size-4" />
              Custom
            </button>
          </div>

            <a
            href={dashboard.export.analytics({ query: { start: activeStart ?? '', end: activeEnd ?? '' } }).url}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-50"
          >
            <Download className="size-4" />
            Export CSV
          </a>
        </div>
      </div>

      {/* Custom Date Form */}
      <form onSubmit={applyCustom} id="custom-date-form" className="mt-3 hidden">
        <div className="flex items-end gap-2">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            max={todayStr()}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm"
          />
          <span className="text-sm text-zinc-500">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            max={todayStr()}
            min={customStart}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm"
          />
          <button
            type="submit"
            disabled={!customStart || !customEnd}
            className="rounded-lg bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </form>

      {/* Stat Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? statCards.map((s) => (
              <div
                key={s.key}
                className="animate-pulse rounded-xl border border-zinc-200 bg-white p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="h-3 w-24 rounded bg-zinc-200" />
                    <div className="h-7 w-16 rounded bg-zinc-300" />
                  </div>
                  <div className="size-10 rounded-xl bg-zinc-100" />
                </div>
              </div>
            ))
          : statCards.map((s) => {
          const Icon = icons[s.icon];
          return (
            <div
              key={s.key}
              className="rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{s.label}</p>
                  <p className="mt-1 text-[28px] font-bold tracking-tight text-zinc-900">
                    {s.format ? s.format(stats[s.key]) : stats[s.key]}
                  </p>
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                  <Icon className="size-5 text-indigo-500" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className={`mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 ${loading ? 'pointer-events-none opacity-60' : ''}`}>
        {/* Calls Line Chart */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="size-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-900">Calls ({rangeLabel})</h3>
          </div>
          {isEmpty ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-zinc-400">No call data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={callsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="count" name="Calls" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Avg Duration Bar Chart */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="size-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-900">Avg Duration ({rangeLabel})</h3>
          </div>
          {avgDurationByDay.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-zinc-400">No duration data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={avgDurationByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [formatDuration(Math.round(value)), 'Avg Duration']}
                />
                <Legend />
                <Bar dataKey="avg_seconds" name="Avg Duration" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className={`mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 ${loading ? 'pointer-events-none opacity-60' : ''}`}>
        {/* Call Status Pie */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <PieChartIcon className="size-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-900">Call Status</h3>
          </div>
          {callsByStatus.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-zinc-400">No call data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={callsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  label={({ status, percent }) => `${status} (${(percent * 100).toFixed(0)}%)`}
                >
                  {callsByStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#a1a1aa'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => {
                    const total = callsByStatus.reduce((s, i) => s + i.count, 0);
                    const pct = total ? ((value / total) * 100).toFixed(1) : 0;
                    return [`${value} (${pct}%)`, name];
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Calls by Flow */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="size-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-900">Calls by Flow (Top 5)</h3>
          </div>
          {callsByFlow.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-zinc-400">No flow data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={callsByFlow} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" allowDecimals={false} />
                <YAxis dataKey="flow_name" type="category" tick={{ fontSize: 12 }} stroke="#9ca3af" width={120} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="count" name="Calls" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Flow Performance Table */}
      <div className="mt-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="size-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-900">Flow Performance</h3>
          </div>

          {callsByFlowWithMetrics.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-zinc-400">No flow data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={callsByFlowWithMetrics} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="flow_name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [formatDuration(Math.round(value)), 'Avg Duration']}
                  />
                  <Legend />
                  <Bar dataKey="avg_duration" name="Avg Duration" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase text-zinc-500">
                      <th className="pb-3 pr-4">Flow Name</th>
                      <th className="pb-3 pr-4">Calls</th>
                      <th className="pb-3 pr-4">Avg Duration</th>
                      <th className="pb-3 pr-4">Success Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {callsByFlowWithMetrics.map((f) => (
                      <tr key={f.flow_name} className="border-b border-zinc-100 last:border-0">
                        <td className="py-3 pr-4 font-medium text-zinc-900">{f.flow_name}</td>
                        <td className="py-3 pr-4 text-zinc-600">{f.total_calls}</td>
                        <td className="py-3 pr-4 text-zinc-600">{formatDuration(f.avg_duration)}</td>
                        <td className="py-3 pr-4 text-zinc-600">{f.success_rate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      <ActivityFeed />
    </AuthenticatedLayout>
  );
}
