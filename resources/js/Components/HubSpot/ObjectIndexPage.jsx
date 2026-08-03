import { Button } from '@/Components/catalyst/button';
import { Input } from '@/Components/catalyst/input';
import { Text } from '@/Components/catalyst/text';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import BatchActionBar from './BatchActionBar';
import ObjectFormModal from './ObjectFormModal';
import ObjectTable, { defaultObjectColumns } from './ObjectTable';
import ScopeGate from './ScopeGate';
import { flattenRecords } from './navigation';

export default function ObjectIndexPage({
    integration,
    objectType,
    records,
    properties,
    apiMeta,
    filters = {},
}) {
    const { t } = useTranslation();
    const [selectedIds, setSelectedIds] = useState([]);
    const [createOpen, setCreateOpen] = useState(false);
    const [q, setQ] = useState(filters.q || '');
    const list = flattenRecords(records);
    const propertyDefs = Array.isArray(properties?.results) ? properties.results : [];
    const connected = integration?.is_connected;

    const columns = defaultObjectColumns(objectType.default_properties || [], t);

    const runBatchArchive = () => {
        router.post(`/settings/integrations/hubspot/objects/${objectType.slug}/batch`, {
            action: 'archive',
            ids: selectedIds,
        }, {
            onSuccess: () => setSelectedIds([]),
        });
    };

    return (
        <ScopeGate apiMeta={apiMeta} connected={connected}>
            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <Text className="text-lg font-semibold text-slate-900">{t(objectType.label_key)}</Text>
                        <Text className="text-sm text-slate-500">{objectType.object_type_id} · {objectType.slug}</Text>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <form
                            className="flex gap-2"
                            onSubmit={(e) => {
                                e.preventDefault();
                                router.get(`/settings/integrations/hubspot/search`, { q, object: objectType.slug });
                            }}
                        >
                            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('hubspot.search_placeholder')} />
                            <Button type="submit" outline>{t('hubspot.search')}</Button>
                        </form>
                        <Button type="button" onClick={() => setCreateOpen(true)}>{t('hubspot.create')}</Button>
                    </div>
                </div>

                <BatchActionBar
                    selectedCount={selectedIds.length}
                    onClear={() => setSelectedIds([])}
                    onArchive={runBatchArchive}
                />

                <ObjectTable
                    records={list}
                    columns={columns}
                    selectedIds={selectedIds}
                    onToggle={(id, checked) => setSelectedIds((prev) => (
                        checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)
                    ))}
                    onToggleAll={(ids) => setSelectedIds(ids)}
                    onRowClick={(row) => router.get(`/settings/integrations/hubspot/objects/${objectType.slug}/${row.id}`)}
                    emptyTitle={t('hubspot.empty_records')}
                    emptyDescription={t('hubspot.empty_records_hint')}
                />

                {records?.paging?.next?.after && (
                    <Button
                        outline
                        type="button"
                        onClick={() => router.get(`/settings/integrations/hubspot/objects/${objectType.slug}`, {
                            after: records.paging.next.after,
                            limit: filters.limit || 25,
                        })}
                    >
                        {t('hubspot.next_page')}
                    </Button>
                )}
            </div>

            <ObjectFormModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                objectType={objectType}
                propertyDefs={propertyDefs.filter((p) => !(p.modificationMetadata?.readOnlyValue))}
            />
        </ScopeGate>
    );
}
