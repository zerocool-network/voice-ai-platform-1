import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { Pagination, PaginationList, PaginationPage, PaginationGap, PaginationNext, PaginationPrevious } from '@/Components/catalyst/pagination';
import { Alert, AlertTitle, AlertDescription, AlertActions } from '@/Components/catalyst/alert';
import { Plus, Pencil, Trash2, GitBranch, Workflow, Copy, Download, Upload } from 'lucide-react';
import { create, edit, update, destroy, duplicate, show, importMethod, exportMethod } from '@/actions/App/Http/Controllers/Web/FlowController';

export default function Index({ flows }) {
    const { t } = useTranslation();
    const [confirmingDelete, setConfirmingDelete] = useState(null);
    const importRef = useRef(null);
    const [importing, setImporting] = useState(false);

    function handleImportFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        router.post(importMethod().url, formData, {
            onFinish: () => { setImporting(false); if (importRef.current) importRef.current.value = ''; },
        });
    }

    function toggleActive(flow) {
        router.patch(update({flow: flow.id}).url, {
            name: flow.name,
            description: flow.description,
            phone_number: flow.phone_number,
            is_active: !flow.is_active,
        });
    }

    function destroyFlow() {
        if (!confirmingDelete) return;
        const id = confirmingDelete.id;
        setConfirmingDelete(null);
        router.delete(destroy({flow: id}).url);
    }

    const columns = useMemo(() => [
        {
            id: 'name',
            header: t('ui.flows_table_name'),
            cell: (flow) => (
                <div>
                    <Link
                        href={show({flow: flow.id}).url}
                        className="font-medium text-slate-950 transition-colors hover:text-cyan-700"
                    >
                        {flow.name}
                    </Link>
                    {flow.description && (
                        <div className="mt-0.5 max-w-md truncate text-sm text-slate-500">{flow.description}</div>
                    )}
                </div>
            ),
        },
        {
            id: 'phone',
            header: t('ui.flows_table_phone'),
            meta: { mono: true },
            cell: (flow) => flow.phone_number || <span className="italic text-slate-400">—</span>,
        },
        {
            id: 'status',
            header: t('ui.flows_table_status'),
            cell: (flow) => (
                <Badge
                    color={flow.is_active ? 'emerald' : 'zinc'}
                    className="cursor-pointer select-none"
                    onClick={() => toggleActive(flow)}
                >
                    {flow.is_active ? t('common.active') : t('common.inactive')}
                </Badge>
            ),
        },
        {
            id: 'version',
            header: t('ui.flows_table_version'),
            meta: { mono: true },
            cell: (flow) => <span className="text-slate-500">v{flow.version}</span>,
        },
        {
            id: 'actions',
            header: t('ui.flows_table_actions'),
            meta: { align: 'right' },
            cell: (flow) => (
                <div className="flex items-center justify-end gap-0.5">
                    <Button plain href={show({flow: flow.id}).url} title={t('ui.flow_action_view')} aria-label={t('ui.flow_action_view')}>
                        <Workflow className="size-4" />
                    </Button>
                    <Button plain href={exportMethod({flow: flow.id}).url} title={t('ui.flow_action_export')} aria-label={t('ui.flow_action_export')}>
                        <Download className="size-4" />
                    </Button>
                    <Button plain onClick={() => router.post(duplicate({flow: flow.id}).url)} title={t('ui.flow_action_duplicate')} aria-label={t('ui.flow_action_duplicate')}>
                        <Copy className="size-4" />
                    </Button>
                    <Button plain href={edit({flow: flow.id}).url} title={t('ui.flow_action_edit')} aria-label={t('ui.flow_action_edit')}>
                        <Pencil className="size-4" />
                    </Button>
                    <Button plain onClick={() => setConfirmingDelete(flow)} title={t('ui.flow_action_delete')} aria-label={t('ui.flow_action_delete')}>
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            ),
        },
    ], [t]);

    return (
        <AuthenticatedLayout>
            <Head title={t('flows.title')} />

            <div className="space-y-6">
                <PageHeader
                    title={t('flows.title')}
                    subtitle={t('ui.flows_subtitle')}
                    actions={
                        <>
                            <input
                                ref={importRef}
                                type="file"
                                accept=".json"
                                className="hidden"
                                onChange={handleImportFile}
                            />
                            <Button plain onClick={() => importRef.current?.click()} disabled={importing}>
                                <Upload className="size-4" />
                                {importing ? t('ui.flows_importing') : t('ui.flows_import')}
                            </Button>
                            <Button href={create().url}>
                                <Plus className="size-4" />
                                {t('ui.flows_new_flow')}
                            </Button>
                        </>
                    }
                />

                <DataTable
                    columns={columns}
                    data={flows.data}
                    getRowId={(row) => row.id}
                    emptyIcon={GitBranch}
                    emptyTitle={t('ui.flows_no_flows_yet')}
                    emptyDescription={t('ui.flows_create_first_desc')}
                    emptyAction={{ label: t('flows.create_flow'), href: create().url }}
                    footer={flows.links ? (
                        <Pagination>
                            <PaginationPrevious href={flows.prev_page_url} />
                            <PaginationList>
                                {flows.links.map((link, i) => {
                                    if (link.url === null) return <PaginationGap key={link.label || i} />;
                                    const label = link.label.replace(/&laquo;|&raquo;/g, '').trim();
                                    const pageNum = parseInt(label);
                                    if (isNaN(pageNum)) return null;
                                    return (
                                        <PaginationPage
                                            key={link.url}
                                            href={link.url}
                                            current={link.active}
                                        >
                                            {pageNum}
                                        </PaginationPage>
                                    );
                                })}
                            </PaginationList>
                            <PaginationNext href={flows.next_page_url} />
                        </Pagination>
                    ) : null}
                />
            </div>

            <Alert open={confirmingDelete !== null} onClose={() => setConfirmingDelete(null)}>
                <AlertTitle>{t('ui.flows_confirm_delete_title')}</AlertTitle>
                <AlertDescription>
                    {t('ui.flows_confirm_delete_desc', { name: confirmingDelete?.name ?? '' })}
                </AlertDescription>
                <AlertActions>
                    <Button plain onClick={() => setConfirmingDelete(null)}>{t('ui.flows_cancel')}</Button>
                    <Button color="red" onClick={destroyFlow}>{t('ui.flows_delete')}</Button>
                </AlertActions>
            </Alert>
        </AuthenticatedLayout>
    );
}
