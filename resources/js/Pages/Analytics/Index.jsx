import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import { Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import DataTable from '@/Components/DataTable';
import { Download } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

const SENTIMENT_COLORS = {
  positive: '#22c55e',
  neutral: '#6b7280',
  negative: '#ef4444',
};

const TOPIC_COLORS = [
  '#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444',
];

function SentimentEmoji({ score }) {
  if (score > 0.05) return '😊';
  if (score < -0.05) return '😞';
  return '😐';
}

function sentimentLabel(score, t) {
  if (score > 0.05) return t('ui.positive');
  if (score < -0.05) return t('ui.negative');
  return t('ui.neutral');
}

function StatCard({ label, value, icon, format }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-card">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Text className="!text-slate-500">{label}</Text>
          <p className="text-[28px] font-bold tracking-tight text-slate-950">
            {format ? format(value) : value}
          </p>
        </div>
        {icon && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <PageSection>
      <div className="mb-4 flex items-center gap-2">
        <Subheading>{title}</Subheading>
      </div>
      {children}
    </PageSection>
  );
}

export default function Index({
  sentimentDistribution,
  sentimentOverTime,
  topKeywords,
  topicBreakdown,
  callerSentiment,
  totalTranscripts,
  avgSentiment,
  topTopic,
}) {
  const { t } = useTranslation();

  const callerColumns = useMemo(() => [
    {
      id: 'caller',
      header: t('ui.caller'),
      cell: (c) => <span className="font-medium">{c.caller}</span>,
    },
    {
      id: 'avg_score',
      header: t('ui.avg_sentiment'),
      cell: (c) => Number(c.avg_score ?? 0).toFixed(3),
    },
    {
      id: 'calls',
      header: t('ui.calls'),
      cell: (c) => c.calls,
    },
    {
      id: 'sentiment',
      header: t('ui.sentiment'),
      cell: (c) => (
        <>
          {SentimentEmoji({ score: c.avg_score })}{' '}
          {sentimentLabel(c.avg_score, t)}
        </>
      ),
    },
  ], [t]);

  const tooltipStyle = {
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
  };

  const isEmpty = totalTranscripts === 0;

  const distData = [
    { key: 'positive', name: t('ui.positive'), value: sentimentDistribution.positive },
    { key: 'neutral', name: t('ui.neutral'), value: sentimentDistribution.neutral },
    { key: 'negative', name: t('ui.negative'), value: sentimentDistribution.negative },
  ];

  return (
    <AuthenticatedLayout>
      <Head title={t('ui.conversation_analytics')} />

      <div className="space-y-6">
        <PageHeader
          title={t('ui.conversation_analytics')}
          subtitle={t('ui.last_90_days')}
          actions={(
            <a href="/analytics/export/csv" className="inline-flex">
              <Button outline>
                <Download />
                {t('ui.export')}
              </Button>
            </a>
          )}
        />

        {isEmpty ? (
          <PageSection className="flex flex-col items-center justify-center py-12">
            <Text className="text-lg text-slate-500">{t('ui.no_transcripts_analyzed')}</Text>
            <Text className="mt-1 text-sm text-slate-400">
              {t('ui.call_transcripts_appear')}
            </Text>
          </PageSection>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                label={t('ui.total_transcripts')}
                value={totalTranscripts}
                icon={<span className="text-lg">{SentimentEmoji({ score: avgSentiment })}</span>}
              />
              <StatCard
                label={t('ui.avg_sentiment')}
                icon={<span className="text-lg">{SentimentEmoji({ score: avgSentiment })}</span>}
                format={(v) => (
                  <span className="flex items-center gap-2">
                    {v.toFixed(2)} <span className="text-xl">{SentimentEmoji({ score: v })}</span>
                  </span>
                )}
                value={avgSentiment}
              />
              <StatCard
                label={t('ui.top_topic')}
                value={topTopic.charAt(0).toUpperCase() + topTopic.slice(1)}
                icon={<span className="text-lg">#</span>}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartCard title={t('ui.sentiment_distribution')}>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={distData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {distData.map((entry) => (
                        <Cell key={entry.key} fill={SENTIMENT_COLORS[entry.key]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title={t('ui.sentiment_over_time')}>
                {sentimentOverTime.length === 0 ? (
                  <div className="flex h-[250px] items-center justify-center text-sm text-slate-400">{t('ui.no_data_yet')}</div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={sentimentOverTime}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                      <XAxis dataKey="date" className="text-xs text-slate-500" />
                      <YAxis className="text-xs text-slate-500" domain={[-1, 1]} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="avg_score"
                        name={t('ui.avg_sentiment')}
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartCard title={t('ui.top_keywords')}>
                {topKeywords.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center text-sm text-slate-400">{t('ui.no_keywords_yet')}</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topKeywords} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                      <XAxis type="number" className="text-xs text-slate-500" allowDecimals={false} />
                      <YAxis dataKey="word" type="category" className="text-xs text-slate-500" width={100} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="count" name={t('ui.occurrences')} fill="#6366f1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title={t('ui.topic_breakdown')}>
                {topicBreakdown.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center text-sm text-slate-400">{t('ui.no_topics_yet')}</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={topicBreakdown}
                        dataKey="count"
                        nameKey="topic"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        label={({ topic, percent }) =>
                          `${topic.charAt(0).toUpperCase() + topic.slice(1)} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {topicBreakdown.map((entry, idx) => (
                          <Cell key={entry.topic} fill={TOPIC_COLORS[idx % TOPIC_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            <div className="space-y-4">
              <Subheading>{t('ui.caller_sentiment_top_10')}</Subheading>
              {callerSentiment.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center text-sm text-slate-400">{t('ui.no_callers_yet')}</div>
              ) : (
                <DataTable
                  columns={callerColumns}
                  data={callerSentiment}
                  getRowId={(row) => row.caller}
                  emptyTitle={t('ui.no_callers_yet')}
                  density="dense"
                />
              )}
            </div>
          </>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
