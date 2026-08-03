import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActivityFeed from '@/Components/ActivityFeed';
import { Head, Link, router, usePage } from '@inertiajs/react';
import dashboard from '@/routes/dashboard';
import { create as createFlow, index as flowsIndex } from '@/actions/App/Http/Controllers/Web/FlowController';
import { index as callsIndex } from '@/actions/App/Http/Controllers/Web/CallController';
import {
  Activity, BarChart3, Clock, Download, GitBranch, Phone, PhoneCall,
  PhoneIncoming, PieChart as PieChartIcon, TrendingUp, Calendar, ArrowUpRight,
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { formatDuration } from '@/utils/format';
import { useTranslation } from '@/hooks/useTranslation';

const PRESETS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

const icons = { Activity, GitBranch, Phone, PhoneIncoming, PhoneCall, Clock };

const statCards = [
  { labelKey: 'dashboard.total_flows', key: 'total_flows', icon: 'GitBranch', tone: 'emerald' },
  { labelKey: 'dashboard.active_flows', key: 'active_flows', icon: 'Activity', tone: 'cyan' },
  { labelKey: 'dashboard.total_calls', key: 'total_calls', icon: 'Phone', tone: 'sky' },
  { labelKey: 'dashboard.today_calls', key: 'calls_today', icon: 'PhoneIncoming', tone: 'violet' },
  { labelKey: 'dashboard.active_calls', key: 'active_calls', icon: 'PhoneCall', tone: 'cyan', live: true },
  { labelKey: 'dashboard.avg_duration', key: 'avg_duration_seconds', icon: 'Clock', tone: 'amber', format: formatDuration },
];

const TONE = {
  emerald: { iconBg: 'bg-emerald-50', icon: 'text-emerald-600', bar: 'bg-emerald-500' },
  cyan: { iconBg: 'bg-cyan-50', icon: 'text-cyan-600', bar: 'bg-cyan-500' },
  sky: { iconBg: 'bg-sky-50', icon: 'text-sky-600', bar: 'bg-sky-500' },
  violet: { iconBg: 'bg-violet-50', icon: 'text-violet-600', bar: 'bg-violet-500' },
  amber: { iconBg: 'bg-amber-50', icon: 'text-amber-600', bar: 'bg-amber-500' },
};

const STATUS_COLORS = {
  completed: '#10b981',
  in_progress: '#f59e0b',
  initiated: '#06b6d4',
  failed: '#ef4444',
  transferred: '#8b5cf6',
};

const CHART_STROKE = '#06b6d4';
const CHART_FILL = '#06b6d4';

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

function EmptyVisual({ variant = 'line' }) {
  if (variant === 'bars') {
    return (
      <div className="flex h-16 items-end gap-1.5 opacity-40">
        {[28, 44, 22, 52, 34, 48, 26].map((h, i) => (
          <span
            key={i}
            className="w-3 rounded-t-md bg-gradient-to-t from-cyan-500/30 to-cyan-400/60"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
    );
  }
  if (variant === 'donut') {
    return (
      <div className="relative size-16 opacity-50">
        <div className="absolute inset-0 rounded-full border-[6px] border-slate-200" />
        <div className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-cyan-400 border-r-emerald-400 rotate-45" />
      </div>
    );
  }
  return (
    <svg viewBox="0 0 160 56" className="h-14 w-40 opacity-50" aria-hidden>
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 40 C20 38, 30 18, 48 22 C66 26, 72 44, 90 36 C108 28, 118 10, 136 14 C148 16, 154 28, 160 24 L160 56 L0 56 Z" fill="url(#spark)" />
      <path d="M0 40 C20 38, 30 18, 48 22 C66 26, 72 44, 90 36 C108 28, 118 10, 136 14 C148 16, 154 28, 160 24" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function ChartEmpty({ title, description, ctaLabel, ctaHref, variant = 'line' }) {
  return (
    <div className="relative flex h-[250px] flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-slate-50/80 to-white px-6 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.35) 1px, transparent 0)',
          backgroundSize: '18px 18px',
        }}
      />
      <div className="relative mb-4">
        <EmptyVisual variant={variant} />
      </div>
      <div className="relative">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mx-auto mt-1.5 max-w-[280px] text-[12px] leading-relaxed text-slate-500">{description}</p>
      </div>
      {ctaHref && (
        <Link
          href={ctaHref}
          className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          {ctaLabel}
          <ArrowUpRight className="size-3.5 opacity-70" />
        </Link>
      )}
    </div>
  );
}

function ChartCard({ icon: Icon, title, children, action }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card transition hover:shadow-elevated">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-200/70">
            <Icon className="size-3.5 text-slate-500" />
          </div>
          <h3 className="text-[13px] font-semibold text-slate-900">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5 pt-4">{children}</div>
    </div>
  );
}

export default function Dashboard({
  stats, range, callsByDay, callsByStatus, avgDurationByDay,
  callsByFlow, callsByFlowWithMetrics,
}) {
  const { t } = useTranslation();
  const { url } = usePage();
  const [loading, setLoading] = useState(false);
  const params = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : url.split('?')[1]
  );
  const activeStart = params.get('start');
  const activeEnd = params.get('end');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const applyPreset = useCallback((days) => {
    setLoading(true);
    setShowCustom(false);
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
    borderRadius: '12px',
    border: '1px solid rgba(15,23,42,0.08)',
    backgroundColor: 'white',
    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
  };

  return (
    <AuthenticatedLayout>
      <Head title={t('dashboard.title')} />

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-200/70 bg-cyan-50/80 px-2.5 py-1 text-[11px] font-semibold text-cyan-700">
            <span className="size-1.5 animate-pulse rounded-full bg-cyan-500" />
            {t('ui.live_ops')}
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight text-slate-950">{t('ui.dashboard_title')}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t('ui.dashboard_subtitle')} — {rangeLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-full border border-slate-200/80 bg-white p-1 shadow-card">
            {PRESETS.map((p) => (
              <button
                key={p.days}
                type="button"
                onClick={() => applyPreset(p.days)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                  activePreset === p.days && !showCustom
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowCustom((v) => !v)}
              className={`ml-0.5 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                showCustom || activePreset === null
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="size-3.5" />
              {t('ui.custom')}
            </button>
          </div>

          <a
            href={dashboard.export.analytics({ query: { start: activeStart ?? '', end: activeEnd ?? '' } }).url}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-medium text-slate-600 shadow-card transition hover:border-slate-300 hover:text-slate-900"
          >
            <Download className="size-3.5" />
            {t('ui.export')}
          </a>
        </div>
      </motion.div>

      {showCustom && (
        <form onSubmit={applyCustom} className="mt-3">
          <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-card">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              max={todayStr()}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm"
            />
            <span className="pb-1.5 text-sm text-slate-400">{t('ui.to')}</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              max={todayStr()}
              min={customStart}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm"
            />
            <button
              type="submit"
              disabled={!customStart || !customEnd}
              className="rounded-xl bg-cyan-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-50"
            >
              {t('ui.apply')}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {loading
          ? statCards.map((s) => (
              <div key={s.key} className="animate-pulse rounded-2xl border border-slate-200/70 bg-white p-4 shadow-card">
                <div className="space-y-3">
                  <div className="h-3 w-20 rounded bg-slate-100" />
                  <div className="h-7 w-14 rounded bg-slate-200" />
                </div>
              </div>
            ))
          : statCards.map((s, i) => {
          const Icon = icons[s.icon];
          const tone = TONE[s.tone];
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className={`relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated ${
                s.live ? 'ring-1 ring-cyan-500/25' : ''
              }`}
            >
              <span className={`absolute inset-x-0 top-0 h-0.5 ${tone.bar} opacity-80`} />
              {s.live && <span className="absolute inset-y-0 left-0 w-1 bg-cyan-500" />}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {t(s.labelKey)}
                  </p>
                  <p className="font-metric mt-2 text-[26px] font-semibold leading-none tracking-tight text-slate-950">
                    {s.format ? s.format(stats[s.key]) : stats[s.key]}
                  </p>
                  {s.live && (
                    <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-600">
                      <span className="size-1.5 animate-pulse rounded-full bg-cyan-500" />
                      {t('ui.live')}
                    </span>
                  )}
                </div>
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${tone.iconBg}`}>
                  <Icon className={`size-4 ${tone.icon}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className={`mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2 ${loading ? 'pointer-events-none opacity-60' : ''}`}>
        <ChartCard icon={TrendingUp} title={`${t('ui.calls_card')} · ${rangeLabel}`}>
          {isEmpty ? (
            <ChartEmpty
              variant="line"
              title={t('ui.waiting_call_volume')}
              description={t('ui.waiting_call_volume_desc')}
              ctaLabel={t('ui.open_calls')}
              ctaHref={callsIndex().url}
            />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={callsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="count" name={t('ui.calls_card')} stroke={CHART_STROKE} strokeWidth={2.5} dot={{ r: 3, fill: CHART_STROKE }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard icon={BarChart3} title={`${t('ui.avg_duration_card')} · ${rangeLabel}`}>
          {avgDurationByDay.length === 0 ? (
            <ChartEmpty
              variant="bars"
              title={t('ui.no_duration_samples')}
              description={t('ui.no_duration_samples_desc')}
              ctaLabel={t('ui.create_a_flow')}
              ctaHref={createFlow().url}
            />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={avgDurationByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [formatDuration(Math.round(value)), t('ui.avg_duration_card')]}
                />
                <Legend />
                <Bar dataKey="avg_seconds" name={t('ui.avg_duration_card')} fill={CHART_FILL} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className={`mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 ${loading ? 'pointer-events-none opacity-60' : ''}`}>
        <ChartCard icon={PieChartIcon} title={t('ui.call_status')}>
          {callsByStatus.length === 0 ? (
            <ChartEmpty
              variant="donut"
              title={t('ui.status_mix_empty')}
              description={t('ui.status_mix_empty_desc')}
              ctaLabel={t('ui.open_calls')}
              ctaHref={callsIndex().url}
            />
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
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
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
        </ChartCard>

        <ChartCard icon={GitBranch} title={t('ui.calls_by_flow')}>
          {callsByFlow.length === 0 ? (
            <ChartEmpty
              variant="bars"
              title={t('ui.no_flow_ranking')}
              description={t('ui.no_flow_ranking_desc')}
              ctaLabel={t('ui.create_a_flow')}
              ctaHref={createFlow().url}
            />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={callsByFlow} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                <YAxis dataKey="flow_name" type="category" tick={{ fontSize: 12 }} stroke="#94a3b8" width={120} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="count" name={t('ui.calls_card')} fill={CHART_FILL} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="mt-5">
        <ChartCard
          icon={BarChart3}
          title={t('ui.flow_performance')}
          action={
            <Link href={flowsIndex().url} className="inline-flex items-center gap-1 text-[12px] font-semibold text-cyan-700 hover:text-cyan-600">
              {t('ui.manage_flows')}
              <ArrowUpRight className="size-3.5" />
            </Link>
          }
        >
          {callsByFlowWithMetrics.length === 0 ? (
            <ChartEmpty
              variant="bars"
              title={t('ui.performance_table_idle')}
              description={t('ui.performance_table_idle_desc')}
              ctaLabel={t('ui.create_a_flow')}
              ctaHref={createFlow().url}
            />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={callsByFlowWithMetrics} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="flow_name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [formatDuration(Math.round(value)), t('ui.avg_duration_card')]}
                  />
                  <Legend />
                  <Bar dataKey="avg_duration" name={t('ui.avg_duration_card')} fill={CHART_FILL} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      <th className="px-4 py-3 pr-4">{t('ui.flow_name')}</th>
                      <th className="px-4 py-3 pr-4">{t('ui.calls_card')}</th>
                      <th className="px-4 py-3 pr-4">{t('ui.avg_duration_card')}</th>
                      <th className="px-4 py-3 pr-4">{t('ui.success_rate')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {callsByFlowWithMetrics.map((f) => (
                      <tr key={f.flow_name} className="border-b border-slate-50 last:border-0">
                        <td className="px-4 py-3 pr-4 font-medium text-slate-900">{f.flow_name}</td>
                        <td className="font-metric px-4 py-3 pr-4 text-slate-600">{f.total_calls}</td>
                        <td className="font-metric px-4 py-3 pr-4 text-slate-600">{formatDuration(f.avg_duration)}</td>
                        <td className="font-metric px-4 py-3 pr-4 text-slate-600">{f.success_rate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </ChartCard>
      </div>

      <ActivityFeed />
    </AuthenticatedLayout>
  );
}
