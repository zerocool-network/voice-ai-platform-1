import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import PageHeader from '@/Components/PageHeader'
import PageSection from '@/Components/PageSection'
import { Head, Link } from '@inertiajs/react'
import { Subheading } from '@/Components/catalyst/heading'
import { Text } from '@/Components/catalyst/text'
import { Badge } from '@/Components/catalyst/badge'
import { Button } from '@/Components/catalyst/button'
import { index as qualityIndex } from '@/routes/quality'
import { show as callsShow } from '@/actions/App/Http/Controllers/Web/CallController'
import { useTranslation } from '@/hooks/useTranslation'
import { callStatusLabel } from '@/utils/callStatusLabel'
import { ArrowLeft, ExternalLink, Headphones, FileText } from 'lucide-react'

const statusColors = {
    completed: 'emerald',
    failed: 'red',
    in_progress: 'amber',
    initiated: 'blue',
    transferred: 'purple',
}

function ScoreCircle({ score, size = 120 }) {
    const r = (size / 2) - 12
    const circ = 2 * Math.PI * r
    const pct = Math.min(score / 100, 1)
    const offset = circ - pct * circ
    const cx = size / 2
    const cy = size / 2
    const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e4e4e7" strokeWidth="8" />
                <circle
                    cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
                    strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold" style={{ color }}>{score}</span>
                <span className="text-xs text-slate-400">/ 100</span>
            </div>
        </div>
    )
}

function ScoreBar({ label, score, color }) {
    return (
        <div>
            <div className="mb-1 flex items-center justify-between">
                <Text className="!text-slate-600">{label}</Text>
                <span className="text-sm font-semibold" style={{ color }}>{score ?? '-'}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${score ?? 0}%`, backgroundColor: color }}
                />
            </div>
        </div>
    )
}

export default function Show({ call, score, transcripts }) {
    const { t } = useTranslation()

    function qualityTier(total) {
        if (total >= 80) return t('ui.excellent')
        if (total >= 60) return t('ui.good')
        if (total >= 40) return t('ui.fair')
        return t('ui.needs_improvement')
    }

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.quality_score_head', { number: call.from_number })} />

            <div className="space-y-6">
                <PageHeader
                    title={t('ui.call_quality_score')}
                    subtitle={`${call.from_number} → ${call.to_number}`}
                    actions={(
                        <>
                            <Link href={qualityIndex().url}>
                                <Button outline>
                                    <ArrowLeft className="size-4" />
                                </Button>
                            </Link>
                            <Link href={callsShow({ call: call.id }).url}>
                                <Button outline>
                                    <ExternalLink className="size-4" />
                                    {t('ui.view_call')}
                                </Button>
                            </Link>
                        </>
                    )}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <PageSection className="lg:col-span-1">
                        <Subheading>{t('ui.call_summary')}</Subheading>
                        <div className="mt-4 space-y-3">
                            <div className="flex justify-between">
                                <Text className="!text-slate-500">{t('ui.flow_name')}</Text>
                                <Text>{call.flow_name || t('ui.na')}</Text>
                            </div>
                            <div className="flex justify-between">
                                <Text className="!text-slate-500">{t('calls.from')}</Text>
                                <Text>{call.from_number}</Text>
                            </div>
                            <div className="flex justify-between">
                                <Text className="!text-slate-500">{t('calls.to')}</Text>
                                <Text>{call.to_number}</Text>
                            </div>
                            <div className="flex justify-between">
                                <Text className="!text-slate-500">{t('calls.status')}</Text>
                                <Badge color={statusColors[call.status] ?? 'zinc'}>
                                    {callStatusLabel(t, call.status)}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <Text className="!text-slate-500">{t('calls.duration')}</Text>
                                <Text>
                                    {call.duration_seconds
                                        ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s`
                                        : t('ui.na')}
                                </Text>
                            </div>
                            <div className="flex justify-between">
                                <Text className="!text-slate-500">{t('ui.date')}</Text>
                                <Text>
                                    {call.started_at
                                        ? new Date(call.started_at).toLocaleDateString('en-US', {
                                            month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                        })
                                        : t('ui.na')}
                                </Text>
                            </div>
                        </div>

                        {call.recording_url && (
                            <div className="mt-4 border-t border-slate-100 pt-4">
                                <a
                                    href={call.recording_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                                >
                                    <Headphones className="size-4" />
                                    {t('ui.listen_to_recording')}
                                    <ExternalLink className="ml-auto size-3 text-slate-400" />
                                </a>
                            </div>
                        )}
                    </PageSection>

                    <div className="space-y-6 lg:col-span-2">
                        {!score ? (
                            <PageSection>
                                <div className="py-8 text-center">
                                    <Text className="text-lg text-slate-500">{t('ui.no_quality_score_available')}</Text>
                                    <Text className="mt-1 text-sm text-slate-400">
                                        {t('ui.no_quality_score_desc')}
                                    </Text>
                                </div>
                            </PageSection>
                        ) : (
                            <>
                                <PageSection>
                                    <div className="flex flex-col items-center">
                                        <Subheading>{t('ui.overall_score')}</Subheading>
                                        <div className="mt-4">
                                            <ScoreCircle score={score.total_score} size={160} />
                                        </div>
                                        <Text className="mt-3 !text-slate-500">
                                            {qualityTier(score.total_score)}
                                        </Text>
                                    </div>
                                </PageSection>

                                <PageSection>
                                    <Subheading>{t('ui.score_breakdown')}</Subheading>
                                    <div className="mt-4 space-y-4">
                                        <ScoreBar label={t('ui.politeness')} score={score.politeness_score} color="#6366f1" />
                                        <ScoreBar label={t('ui.resolution')} score={score.resolution_score} color="#3b82f6" />
                                        <ScoreBar label={t('ui.duration_score')} score={score.duration_score} color="#22c55e" />
                                        {(score.politeness_score == null || score.politeness_score === 0) && (
                                            <Text className="!text-xs !italic !text-slate-400">
                                                {t('ui.politeness_zero_note')}
                                            </Text>
                                        )}
                                    </div>
                                </PageSection>
                            </>
                        )}

                        <PageSection>
                            <div className="flex items-center gap-2">
                                <FileText className="size-4 text-slate-400" />
                                <Subheading>{t('ui.transcript')}</Subheading>
                                <span className="text-xs text-slate-400">({transcripts.length} {t('ui.entries')})</span>
                            </div>
                            {transcripts.length === 0 ? (
                                <Text className="mt-4 !text-slate-400">{t('ui.no_transcript_available')}</Text>
                            ) : (
                                <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">
                                    {transcripts.map((entry, i) => (
                                        <div key={`${entry.role}-${i}`} className="rounded-lg bg-slate-50 p-3">
                                            <div className="mb-1 flex items-center justify-between">
                                                <Badge color={entry.role === 'user' ? 'blue' : 'emerald'}>
                                                    {entry.role}
                                                </Badge>
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(entry.created_at).toLocaleTimeString('en-US', {
                                                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700">{entry.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </PageSection>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
