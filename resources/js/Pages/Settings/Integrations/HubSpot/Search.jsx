import HubSpotConsoleLayout from '@/Components/HubSpot/HubSpotConsoleLayout';
import ScopeGate from '@/Components/HubSpot/ScopeGate';
import DataTable from '@/Components/DataTable';
import { Button } from '@/Components/catalyst/button';
import { Field, Label } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Text } from '@/Components/catalyst/text';
import { useTranslation } from '@/hooks/useTranslation';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { flattenRecords, recordLabel } from '@/Components/HubSpot/navigation';

export default function Search({ integration, query, object_type, results, api_meta, nav }) {
    const { t } = useTranslation();
    const [q, setQ] = useState(query || '');
    const [object, setObject] = useState(object_type || 'contacts');
    const rows = flattenRecords(results);

    return (
        <>
            <Head title={t('hubspot.modules.search')} />
            <HubSpotConsoleLayout integration={integration} nav={nav}>
                <ScopeGate apiMeta={api_meta} connected={integration?.is_connected}>
                    <form
                        className="mb-4 flex flex-wrap gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            router.get('/settings/integrations/hubspot/search', { q, object });
                        }}
                    >
                        <Field className="min-w-64 flex-1">
                            <Label>{t('hubspot.search')}</Label>
                            <Input value={q} onChange={(e) => setQ(e.target.value)} />
                        </Field>
                        <Field>
                            <Label>{t('hubspot.object_type')}</Label>
                            <Select value={object} onChange={(e) => setObject(e.target.value)}>
                                {['contacts', 'companies', 'deals', 'tickets', 'leads', 'calls', 'notes', 'tasks'].map((o) => (
                                    <option key={o} value={o}>{o}</option>
                                ))}
                            </Select>
                        </Field>
                        <div className="flex items-end">
                            <Button type="submit">{t('hubspot.search')}</Button>
                        </div>
                    </form>

                    <DataTable
                        columns={[
                            { id: 'id', header: 'ID', cell: (r) => r.id },
                            { id: 'label', header: t('hubspot.record'), cell: (r) => recordLabel(r, ['firstname', 'lastname', 'email', 'name', 'dealname', 'subject']) },
                        ]}
                        data={rows}
                        onRowClick={(row) => router.get(`/settings/integrations/hubspot/objects/${object}/${row.id}`)}
                        emptyTitle={t('hubspot.empty_records')}
                        emptyDescription={t('hubspot.search_hint')}
                    />
                </ScopeGate>
            </HubSpotConsoleLayout>
        </>
    );
}
