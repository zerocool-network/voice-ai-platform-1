import DataTable from '@/Components/DataTable';
import { Checkbox } from '@/Components/catalyst/checkbox';
import { recordLabel } from './navigation';

export default function ObjectTable({
    records = [],
    columns = [],
    selectedIds = [],
    onToggle,
    onToggleAll,
    onRowClick,
    emptyTitle,
    emptyDescription,
}) {
    const allIds = records.map((r) => r.id);
    const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));

    const tableColumns = [
        {
            id: 'select',
            header: (
                <Checkbox
                    checked={allSelected}
                    onChange={(checked) => onToggleAll?.(checked ? allIds : [])}
                />
            ),
            cell: (row) => (
                <Checkbox
                    checked={selectedIds.includes(row.id)}
                    onChange={(checked) => onToggle?.(row.id, checked)}
                />
            ),
            className: 'w-10',
        },
        ...columns,
    ];

    return (
        <DataTable
            columns={tableColumns}
            data={records}
            getRowId={(row) => row.id}
            onRowClick={onRowClick}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
        />
    );
}

export function defaultObjectColumns(propertyNames = [], t) {
    return [
        {
            id: 'id',
            header: 'ID',
            cell: (row) => <span className="font-mono text-xs text-slate-500">{row.id}</span>,
        },
        {
            id: 'label',
            header: t('hubspot.record'),
            cell: (row) => recordLabel(row, propertyNames),
        },
        ...propertyNames.slice(0, 4).map((name) => ({
            id: name,
            header: name,
            cell: (row) => row.properties?.[name] ?? '—',
        })),
        {
            id: 'updated',
            header: t('hubspot.updated'),
            cell: (row) => row.updatedAt || row.properties?.hs_lastmodifieddate || '—',
        },
    ];
}
