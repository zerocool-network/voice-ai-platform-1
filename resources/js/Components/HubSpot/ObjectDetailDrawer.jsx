import { Button } from '@/Components/catalyst/button';
import { Text } from '@/Components/catalyst/text';
import { useTranslation } from '@/hooks/useTranslation';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AssociationPicker from './AssociationPicker';
import ConfirmDialog from './ConfirmDialog';
import ObjectFormModal from './ObjectFormModal';
import ScopeGate from './ScopeGate';

export default function ObjectDetailDrawer({
    integration,
    objectType,
    record,
    associations = {},
    apiMeta,
    embedded = false,
}) {
    const { t } = useTranslation();
    const [tab, setTab] = useState('properties');
    const [editOpen, setEditOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const { delete: destroy, processing } = useForm({});

    const tabs = ['properties', 'associations', 'activity'];

    return (
        <ScopeGate apiMeta={apiMeta} connected={integration?.is_connected}>
            {!record ? (
                <Text>{t('hubspot.record_not_found')}</Text>
            ) : (
                <div className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <Text className="text-lg font-semibold">{t(objectType.label_key)} #{record.id}</Text>
                            <Text className="text-sm text-slate-500">{objectType.object_type_id}</Text>
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" outline onClick={() => setEditOpen(true)}>{t('hubspot.edit')}</Button>
                            <Button type="button" color="red" onClick={() => setConfirmOpen(true)}>{t('hubspot.archive')}</Button>
                            {!embedded && (
                                <Button type="button" plain onClick={() => router.get(`/settings/integrations/hubspot/objects/${objectType.slug}`)}>
                                    {t('hubspot.back')}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 border-b border-slate-100 pb-2">
                        {tabs.map((name) => (
                            <button
                                key={name}
                                type="button"
                                onClick={() => setTab(name)}
                                className={`rounded-lg px-3 py-1.5 text-sm ${tab === name ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                {t(`hubspot.tab_${name}`)}
                            </button>
                        ))}
                    </div>

                    {tab === 'properties' && (
                        <dl className="grid gap-3 sm:grid-cols-2">
                            {Object.entries(record.properties || {}).map(([key, value]) => (
                                <div key={key} className="rounded-lg border border-slate-100 p-3">
                                    <dt className="text-xs uppercase tracking-wide text-slate-400">{key}</dt>
                                    <dd className="mt-1 break-words text-sm text-slate-800">{String(value ?? '—')}</dd>
                                </div>
                            ))}
                        </dl>
                    )}

                    {tab === 'associations' && (
                        <div className="space-y-4">
                            <AssociationPicker objectType={objectType.slug} recordId={record.id} />
                            {Object.keys(associations).length === 0 ? (
                                <Text className="text-slate-500">{t('hubspot.no_associations')}</Text>
                            ) : (
                                Object.entries(associations).map(([type, payload]) => (
                                    <div key={type}>
                                        <Text className="mb-2 font-medium">{type}</Text>
                                        <ul className="space-y-1 text-sm text-slate-600">
                                            {(payload?.results || []).map((item) => (
                                                <li key={item.id} className="font-mono">{item.id}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {tab === 'activity' && (
                        <Text className="text-slate-500">{t('hubspot.activity_from_timeline')}</Text>
                    )}
                </div>
            )}

            <ObjectFormModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                objectType={objectType}
                mode="edit"
                record={record}
                propertyDefs={Object.keys(record?.properties || {}).map((name) => ({ name }))}
            />

            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                title={t('hubspot.archive_confirm_title')}
                description={t('hubspot.archive_confirm_body')}
                confirming={processing}
                onConfirm={() => {
                    destroy(`/settings/integrations/hubspot/objects/${objectType.slug}/${record.id}`, {
                        onFinish: () => setConfirmOpen(false),
                    });
                }}
            />
        </ScopeGate>
    );
}
