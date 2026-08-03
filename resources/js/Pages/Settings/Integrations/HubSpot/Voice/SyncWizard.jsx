import HubSpotConsoleLayout from '@/Components/HubSpot/HubSpotConsoleLayout';
import ScopeGate from '@/Components/HubSpot/ScopeGate';
import DataTable from '@/Components/DataTable';
import { Button } from '@/Components/catalyst/button';
import { Checkbox, Field, Label } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Text } from '@/Components/catalyst/text';
import { useTranslation } from '@/hooks/useTranslation';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const STEPS = ['rules', 'property_map', 'targets', 'test'];

export default function SyncWizard({ integration, voice, recent_calls = [], api_meta, nav }) {
    const { t } = useTranslation();
    const [step, setStep] = useState(0);
    const sync = voice?.sync || {};
    const { data, setData, post, processing } = useForm({
        create_contact: sync.create_contact ?? true,
        log_call_engagement: sync.log_call_engagement ?? true,
        create_ticket_on_transfer: sync.create_ticket_on_transfer ?? false,
        create_company: sync.create_company ?? false,
        create_lead: sync.create_lead ?? false,
        create_deal: sync.create_deal ?? false,
        log_task: sync.log_task ?? false,
        send_timeline_event: sync.send_timeline_event ?? false,
        send_app_event: sync.send_app_event ?? false,
        property_map: sync.property_map || {
            from_number: 'phone',
            call_sid: 'hs_call_callee_object_id',
            duration_seconds: 'hs_call_duration',
        },
        target_objects: sync.target_objects || ['contacts', 'calls', 'notes'],
    });

    const toggleTarget = (slug, checked) => {
        setData(
            'target_objects',
            checked
                ? [...new Set([...(data.target_objects || []), slug])]
                : (data.target_objects || []).filter((x) => x !== slug),
        );
    };

    return (
        <>
            <Head title={t('hubspot.modules.voice-sync')} />
            <HubSpotConsoleLayout integration={integration} nav={nav}>
                <ScopeGate apiMeta={api_meta} connected={true}>
                    <div className="space-y-6">
                        <div>
                            <Text className="text-lg font-semibold">{t('hubspot.modules.voice-sync')}</Text>
                            <Text className="text-sm text-slate-500">{t('hubspot.voice_sync_hint')}</Text>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {STEPS.map((name, idx) => (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => setStep(idx)}
                                    className={`rounded-full px-3 py-1 text-sm ${step === idx ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                                >
                                    {idx + 1}. {t(`hubspot.voice_step_${name}`)}
                                </button>
                            ))}
                        </div>

                        {step === 0 && (
                            <div className="space-y-3">
                                {[
                                    'create_contact',
                                    'log_call_engagement',
                                    'create_ticket_on_transfer',
                                    'create_company',
                                    'create_lead',
                                    'create_deal',
                                    'log_task',
                                    'send_timeline_event',
                                    'send_app_event',
                                ].map((key) => (
                                    <Field key={key} className="flex items-center gap-2">
                                        <Checkbox checked={Boolean(data[key])} onChange={(checked) => setData(key, checked)} />
                                        <Label>{t(`hubspot.sync_${key}`)}</Label>
                                    </Field>
                                ))}
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-3">
                                {Object.entries(data.property_map || {}).map(([from, to]) => (
                                    <div key={from} className="grid gap-2 sm:grid-cols-2">
                                        <Field>
                                            <Label>{t('hubspot.voice_field')}</Label>
                                            <Input value={from} disabled />
                                        </Field>
                                        <Field>
                                            <Label>{t('hubspot.hubspot_property')}</Label>
                                            <Input
                                                value={to}
                                                onChange={(e) => setData('property_map', { ...data.property_map, [from]: e.target.value })}
                                            />
                                        </Field>
                                    </div>
                                ))}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-2">
                                {(voice?.targets || []).map((slug) => (
                                    <Field key={slug} className="flex items-center gap-2">
                                        <Checkbox
                                            checked={(data.target_objects || []).includes(slug)}
                                            onChange={(checked) => toggleTarget(slug, checked)}
                                        />
                                        <Label>{slug}</Label>
                                    </Field>
                                ))}
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <Text>{t('hubspot.sync_test_hint')}</Text>
                                <DataTable
                                    columns={[
                                        { id: 'id', header: 'ID', cell: (r) => r.id },
                                        { id: 'from', header: t('hubspot.from'), cell: (r) => r.from_number },
                                        { id: 'status', header: t('integrations.status'), cell: (r) => r.status },
                                        {
                                            id: 'actions',
                                            header: '',
                                            cell: (r) => (
                                                <Button
                                                    type="button"
                                                    onClick={() => router.post(`/settings/integrations/hubspot/voice-sync/calls/${r.id}`)}
                                                >
                                                    {t('hubspot.sync_this_call')}
                                                </Button>
                                            ),
                                        },
                                    ]}
                                    data={recent_calls}
                                    emptyTitle={t('hubspot.empty_records')}
                                />
                            </div>
                        )}

                        <div className="flex justify-between">
                            <Button type="button" outline disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
                                {t('hubspot.back')}
                            </Button>
                            <div className="flex gap-2">
                                {step < STEPS.length - 1 && (
                                    <Button type="button" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
                                        {t('hubspot.next')}
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    disabled={processing}
                                    onClick={() => post('/settings/integrations/hubspot/voice-sync')}
                                >
                                    {t('hubspot.save')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </ScopeGate>
            </HubSpotConsoleLayout>
        </>
    );
}
