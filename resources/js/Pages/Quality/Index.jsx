import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import DataTable from '@/Components/DataTable';
import { Link, Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { useTranslation } from '@/hooks/useTranslation';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { Input } from '@/Components/catalyst/input';
import { Pagination, PaginationList, PaginationPage, PaginationGap, PaginationNext, PaginationPrevious } from '@/Components/catalyst/pagination';
import { index as qualityIndex, show as qualityShow } from '@/routes/quality';
import { ShieldCheck, Search, X, TrendingUp } from 'lucide-react';
import {
    LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

function ScoreGauge({ score }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(score / 100, 1);
  const offset = circ - pct * circ;

  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="70" height="70" className="-rotate-90">
        <circle cx="35" cy="35" r={r} fill="none" stroke="#e4e4e7" strokeWidth="6" />
        <circle
          cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-lg font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

function ScoreBadge({ score }) {
  const color = score >= 80 ? 'emerald' : score >= 50 ? 'amber' : 'red';
  return <Badge color={color}>{score}</Badge>;
}

function StatCard({ label, value, sub }) {
  return (
    <PageSection className="!p-6">
      <Text className="!text-slate-500">{label}</Text>
      <p className="text-[28px] font-bold tracking-tight text-slate-950">{value}</p>
      {sub && <Text className="mt-1 text-sm !text-slate-400">{sub}</Text>}
    </PageSection>
  );
}

function DistributionBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      <div className="flex-1 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-10 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">{count}</span>
    </div>
  );
}

export default function Index({
  avgScore,
  totalScored,
  topFlow,
  topFlowScore,
  callsWithScores,
  topFlows,
  recentScored,
  scoreDistribution,
  scoreTrend = [],
  filters = {},
}) {
  const { t, locale } = useTranslation();
  const [localFilters, setLocalFilters] = useState({
    date_from: filters.date_from ?? '',
    date_to: filters.date_to ?? '',
    score_min: filters.score_min ?? '',
    score_max: filters.score_max ?? '',
    search: filters.search ?? '',
  });

  function applyFilters() {
    const params = {}
    Object.entries(localFilters).forEach(([k, v]) => { if (v) params[k] = v })
    router.get(qualityIndex().url, params, { preserveState: true, replace: true })
  }

  function clearFilters() {
    setLocalFilters({ date_from: '', date_to: '', score_min: '', score_max: '', search: '' })
    router.get(qualityIndex().url, {}, { preserveState: true, replace: true })
  }

  function handleFilterKeyDown(e) {
    if (e.key === 'Enter') applyFilters()
  }

  const hasActiveFilters = filters.date_from || filters.date_to || filters.score_min || filters.score_max || filters.search
  const isEmpty = totalScored === 0;
  const distTotal = (scoreDistribution?.excellent ?? 0)
    + (scoreDistribution?.good ?? 0)
    + (scoreDistribution?.fair ?? 0)
    + (scoreDistribution?.poor ?? 0);

  const formatCallDate = (item) => (
    item.started_at
      ? new Date(item.started_at).toLocaleDateString(locale || undefined, {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        })
      : '\u2014'
  );

  const recentColumns = useMemo(() => [
    {
      id: 'from',
      header: t('calls.from'),
      cell: (item) => <span className="font-medium">{item.from_number}</span>,
    },
    { id: 'to', header: t('calls.to'), cell: (item) => item.to_number },
    {
      id: 'flow',
      header: t('calls.flow'),
      cell: (item) => item.flow_name || <span className="italic">&mdash;</span>,
    },
    {
      id: 'score',
      header: t('ui.score'),
      cell: (item) => <ScoreBadge score={item.total_score} />,
    },
    {
      id: 'date',
      header: t('ui.date'),
      cell: (item) => formatCallDate(item),
    },
    {
      id: 'actions',
      header: '',
      meta: { align: 'right' },
      cell: (item) => (
        <Link
          href={qualityShow({ call: item.call_id }).url}
          className="text-sm font-medium text-zinc-950 underline decoration-zinc-950/50 hover:decoration-zinc-950 dark:text-white dark:decoration-white/50 dark:hover:decoration-white"
        >
          {t('ui.view')}
        </Link>
      ),
    },
  ], [t, locale]);

  const allScoredColumns = useMemo(() => [
    ...recentColumns.slice(0, 4),
    {
      id: 'status',
      header: t('calls.status'),
      cell: (item) => (
        <Badge color={item.call_status === 'completed' ? 'emerald' : 'zinc'}>
          {item.call_status}
        </Badge>
      ),
    },
    recentColumns[4],
    recentColumns[5],
  ], [recentColumns, t]);

  return (
    <AuthenticatedLayout>
      <Head title={t('ui.quality_scoring')} />

      <div className="space-y-6">
        <PageHeader
          title={t('ui.quality_scoring')}
          subtitle={t('ui.quality_metrics_desc')}
        />

      {isEmpty ? (
        <PageSection>
          <div className="flex flex-col items-center justify-center py-8">
          <ShieldCheck className="mb-4 h-12 w-12 text-slate-300" />
          <Text className="text-lg text-slate-500">{t('ui.no_quality_scores')}</Text>
          <Text className="mt-1 max-w-sm text-center text-sm text-slate-400">
            {t('ui.quality_scores_desc')}
          </Text>
          </div>
        </PageSection>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label={t('ui.average_score')}
              value={<span className="flex items-center gap-3">{avgScore} <ScoreGauge score={avgScore} /></span>}
            />
            <StatCard label={t('ui.total_scored')} value={totalScored} sub={t('ui.completed_calls_scored')} />
            <StatCard
              label={t('ui.top_flow')}
              value={topFlow}
              sub={topFlow !== 'N/A' ? `${t('ui.avg_score')}: ${topFlowScore}` : undefined}
            />
          </div>

          <PageSection>
            <div className="flex items-center justify-between">
              <Subheading>{t('ui.score_trend_30d')}</Subheading>
              <TrendingUp className="size-4 text-zinc-400" />
            </div>
            {scoreTrend.length === 0 ? (
              <Text className="mt-4 !text-slate-400">{t('ui.not_enough_data_trend')}</Text>
            ) : (
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={scoreTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }}
                      labelFormatter={(label) => new Date(label).toLocaleDateString(locale || undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    />
                    <Line type="monotone" dataKey="avg_score" name={t('ui.avg_score')} stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-2 flex items-center justify-center gap-6 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="inline-block size-2 rounded-full bg-indigo-500" />
                    {t('ui.avg_score')}
                  </span>
                  <span>{t('ui.min')}: {Math.min(...scoreTrend.map((d) => d.avg_score))}</span>
                  <span>{t('ui.max')}: {Math.max(...scoreTrend.map((d) => d.avg_score))}</span>
                </div>
              </div>
            )}
          </PageSection>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PageSection>
              <Subheading>{t('ui.score_distribution')}</Subheading>
              <div className="mt-4 space-y-3">
                <DistributionBar label={t('ui.excellent')} count={scoreDistribution?.excellent ?? 0} total={distTotal} color="#22c55e" />
                <DistributionBar label={t('ui.good')} count={scoreDistribution?.good ?? 0} total={distTotal} color="#3b82f6" />
                <DistributionBar label={t('ui.fair')} count={scoreDistribution?.fair ?? 0} total={distTotal} color="#f59e0b" />
                <DistributionBar label={t('ui.poor')} count={scoreDistribution?.poor ?? 0} total={distTotal} color="#ef4444" />
              </div>
            </PageSection>

            <PageSection>
              <Subheading>{t('ui.top_flows_avg_score')}</Subheading>
              {topFlows.length === 0 ? (
                <Text className="mt-4 text-slate-400">{t('ui.no_data_yet')}</Text>
              ) : (
                <div className="mt-4 space-y-3">
                  {topFlows.map((f, i) => (
                    <div key={f.flow_name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-400">#{i + 1}</span>
                        <Text>{f.flow_name}</Text>
                      </div>
                      <div className="flex items-center gap-3">
                        <Text className="text-sm !text-slate-400">{f.call_count} {t('ui.calls')}</Text>
                        <ScoreBadge score={Math.round(f.avg_score)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PageSection>
          </div>

          <PageSection>
              <Subheading>{t('ui.recent_scored_calls')}</Subheading>
              <div className="mt-4">
                <DataTable
                  columns={recentColumns}
                  data={recentScored}
                  getRowId={(row) => row.id}
                  density="dense"
                />
              </div>
          </PageSection>

          <div className="space-y-4">
              <Subheading>{t('ui.all_scored_calls')}</Subheading>

              <DataTable
                columns={allScoredColumns}
                data={callsWithScores.data}
                getRowId={(row) => row.id}
                toolbar={(
                  <>
                    <div>
                      <Text className="mb-1 text-xs !text-slate-500">{t('ui.from')}</Text>
                      <Input
                        type="date"
                        value={localFilters.date_from}
                        onChange={(e) => setLocalFilters((p) => ({ ...p, date_from: e.target.value }))}
                        onKeyDown={handleFilterKeyDown}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Text className="mb-1 text-xs !text-slate-500">{t('ui.to')}</Text>
                      <Input
                        type="date"
                        value={localFilters.date_to}
                        onChange={(e) => setLocalFilters((p) => ({ ...p, date_to: e.target.value }))}
                        onKeyDown={handleFilterKeyDown}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Text className="mb-1 text-xs !text-slate-500">{t('ui.min_score')}</Text>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={localFilters.score_min}
                        onChange={(e) => setLocalFilters((p) => ({ ...p, score_min: e.target.value }))}
                        onKeyDown={handleFilterKeyDown}
                        placeholder="0"
                        className="h-9 w-20 text-sm"
                      />
                    </div>
                    <div>
                      <Text className="mb-1 text-xs !text-slate-500">{t('ui.max_score')}</Text>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={localFilters.score_max}
                        onChange={(e) => setLocalFilters((p) => ({ ...p, score_max: e.target.value }))}
                        onKeyDown={handleFilterKeyDown}
                        placeholder="100"
                        className="h-9 w-20 text-sm"
                      />
                    </div>
                    <div className="min-w-[200px] flex-1">
                      <Text className="mb-1 text-xs !text-slate-500">{t('ui.phone_number')}</Text>
                      <Input
                        value={localFilters.search}
                        onChange={(e) => setLocalFilters((p) => ({ ...p, search: e.target.value }))}
                        onKeyDown={handleFilterKeyDown}
                        placeholder={t('ui.search_by_number')}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="flex items-end gap-2 self-end">
                      <Button onClick={applyFilters}>
                        <Search className="size-4" />
                        {t('ui.apply')}
                      </Button>
                      {hasActiveFilters && (
                        <Button outline onClick={clearFilters}>
                          <X className="size-4" />
                          {t('ui.clear')}
                        </Button>
                      )}
                    </div>
                  </>
                )}
                footer={callsWithScores.links ? (
                  <Pagination>
                    <PaginationPrevious href={callsWithScores.prev_page_url} />
                    <PaginationList>
                      {callsWithScores.links.map((link, i) => {
                        if (link.url === null) return <PaginationGap key={link.label || i} />;
                        const label = link.label.replace(/&laquo;|&raquo;/g, '').trim();
                        const pageNum = parseInt(label);
                        if (isNaN(pageNum)) return null;
                        return (
                          <PaginationPage key={link.url} href={link.url} current={link.active}>
                            {pageNum}
                          </PaginationPage>
                        );
                      })}
                    </PaginationList>
                    <PaginationNext href={callsWithScores.next_page_url} />
                  </Pagination>
                ) : null}
              />
          </div>
        </>
      )}
      </div>
    </AuthenticatedLayout>
  );
}
