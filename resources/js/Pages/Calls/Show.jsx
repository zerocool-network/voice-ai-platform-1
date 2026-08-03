import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import PageHeader from '@/Components/PageHeader'
import PageSection from '@/Components/PageSection'
import { Head, router, useForm, Link } from '@inertiajs/react'
import { Text } from '@/Components/catalyst/text'
import { Badge } from '@/Components/catalyst/badge'
import { Button } from '@/Components/catalyst/button'
import { Textarea } from '@/Components/catalyst/textarea'
import { updateNotes, retry } from '@/actions/App/Http/Controllers/Web/CallController'
import { useTranslation } from '@/hooks/useTranslation'
import { callStatusLabel } from '@/utils/callStatusLabel'
import { Phone, Headphones, RotateCcw, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react'

const statusColors = {
    completed: 'emerald',
    failed: 'red',
    busy: 'orange',
    'no-answer': 'zinc',
    cancelled: 'zinc',
    initiated: 'blue',
    ringing: 'blue',
    in_progress: 'amber',
}

const statusIcon = {
    completed: CheckCircle,
    failed: XCircle,
    initiated: Clock,
    in_progress: Clock,
}

export default function CallShow({ call }) {
    const { t } = useTranslation()
    const { data, setData, patch, processing } = useForm({
        notes: call.notes ?? '',
    })

    function saveNotes() {
        patch(updateNotes({ call: call.id }).url, {
            preserveScroll: true,
        })
    }

    function handleRetry() {
        router.post(retry({ call: call.id }).url, {}, {
            preserveScroll: true,
        })
    }

    const StatusIcon = statusIcon[call.status] || Phone

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.call_head', { sid: call.call_sid })} />

            <div className="space-y-6">
                <PageHeader
                    title={t('ui.call_details')}
                    subtitle={call.call_sid}
                    actions={(
                        <div className="flex items-center gap-2">
                            <Link href="/calls">
                                <Button outline><ArrowLeft className="size-4" /></Button>
                            </Link>
                            {call.status !== 'completed' && call.status !== 'failed' && (
                                <Button outline onClick={handleRetry}>
                                    <RotateCcw className="size-4" />
                                    {t('ui.retry')}
                                </Button>
                            )}
                            {call.recording_url && (
                                <a href={`/recordings/${call.id}/play`} target="_blank" rel="noopener noreferrer">
                                    <Button>
                                        <Headphones className="size-4" />
                                        {t('ui.play_recording')}
                                    </Button>
                                </a>
                            )}
                        </div>
                    )}
                />

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <PageSection className="!p-4">
                        <Text className="!text-[10px] uppercase tracking-wider text-slate-500">{t('calls.status')}</Text>
                        <div className="mt-1 flex items-center gap-2">
                            <StatusIcon className="size-5 text-slate-500" />
                            <Badge color={statusColors[call.status] || 'zinc'}>{callStatusLabel(t, call.status)}</Badge>
                        </div>
                    </PageSection>
                    <PageSection className="!p-4">
                        <Text className="!text-[10px] uppercase tracking-wider text-slate-500">{t('calls.duration')}</Text>
                        <p className="mt-1 text-2xl font-semibold text-slate-950">
                            {call.duration_seconds
                                ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s`
                                : '\u2014'}
                        </p>
                    </PageSection>
                    <PageSection className="!p-4">
                        <Text className="!text-[10px] uppercase tracking-wider text-slate-500">{t('calls.from')}</Text>
                        <p className="mt-1 text-lg font-medium text-slate-950">{call.from_number}</p>
                    </PageSection>
                    <PageSection className="!p-4">
                        <Text className="!text-[10px] uppercase tracking-wider text-slate-500">{t('calls.to')}</Text>
                        <p className="mt-1 text-lg font-medium text-slate-950">{call.to_number}</p>
                    </PageSection>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <PageSection>
                        <h3 className="text-base font-semibold text-slate-950">{t('ui.transcript_section')}</h3>
                        {call.transcripts?.length > 0 ? (
                            <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">
                                {call.transcripts.map((entry, i) => (
                                    <div key={entry.id ?? i} className="rounded-lg bg-slate-50 p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium capitalize text-slate-500">{entry.speaker ?? t('ui.role_system')}</span>
                                            <span className="text-xs text-slate-400">
                                                {entry.created_at ? new Date(entry.created_at).toLocaleTimeString() : ''}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-slate-700">{entry.content ?? entry.text ?? entry.transcript ?? ''}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Text className="mt-4">{t('ui.no_transcript_available_call')}</Text>
                        )}
                    </PageSection>

                    <div className="space-y-6">
                        <PageSection>
                            <h3 className="text-base font-semibold text-slate-950">{t('ui.call_logs')}</h3>
                            {call.call_logs?.length > 0 ? (
                                <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto">
                                    {call.call_logs.map((log) => (
                                        <li key={log.id} className="rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
                                            <span className="font-medium capitalize">{log.direction || t('ui.role_system')}:</span>{' '}
                                            {log.content || log.event || JSON.stringify(log)}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <Text className="mt-4">{t('ui.no_logs_available')}</Text>
                            )}
                        </PageSection>

                        <PageSection>
                            <h3 className="text-base font-semibold text-slate-950">HubSpot</h3>
                            <Text className="mt-2 text-sm text-slate-600">{t('hubspot.sync_test_hint')}</Text>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    onClick={() => router.post(`/settings/integrations/hubspot/voice-sync/calls/${call.id}`)}
                                >
                                    {t('hubspot.sync_this_call')}
                                </Button>
                                <Link href="/settings/integrations/hubspot/voice-sync">
                                    <Button outline type="button">{t('hubspot.modules.voice-sync')}</Button>
                                </Link>
                                <Link href="/settings/integrations/hubspot">
                                    <Button outline type="button">{t('hubspot.modules.overview')}</Button>
                                </Link>
                            </div>
                        </PageSection>

                        <PageSection>
                            <h3 className="text-base font-semibold text-slate-950">{t('ui.flow_context')}</h3>
                            {call.context ? (
                                <pre className="mt-4 max-h-48 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                                    {JSON.stringify(call.context, null, 2)}
                                </pre>
                            ) : (
                                <Text className="mt-4">{t('ui.no_context_data_call')}</Text>
                            )}
                        </PageSection>
                    </div>
                </div>

                <PageSection>
                    <h3 className="text-base font-semibold text-slate-950">{t('ui.notes')}</h3>
                    <Textarea
                        className="mt-4"
                        rows={4}
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        placeholder={t('ui.add_notes_placeholder')}
                    />
                    <div className="mt-3 flex justify-end">
                        <Button onClick={saveNotes} disabled={processing}>
                            {processing ? t('common.saving') : t('ui.save_notes')}
                        </Button>
                    </div>
                </PageSection>
            </div>
        </AuthenticatedLayout>
    )
}
