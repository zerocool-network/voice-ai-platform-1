import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import DataTable from '@/Components/DataTable';
import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { show, create } from '@/actions/App/Http/Controllers/Web/DocumentsController';
import { FileText } from 'lucide-react';

const statusColors = {
    pending: 'amber',
    processing: 'blue',
    completed: 'emerald',
    failed: 'red',
};

export default function Index({ documents, stats }) {
    const { t, locale } = useTranslation();

    const columns = useMemo(() => [
        {
            id: 'name',
            header: t('ui.name_label'),
            cell: (doc) => <span className="font-medium">{doc.name}</span>,
        },
        {
            id: 'type',
            header: t('ui.type'),
            cell: (doc) => <Badge color="zinc">{doc.resource_type}</Badge>,
        },
        {
            id: 'status',
            header: t('ui.status_label'),
            cell: (doc) => <Badge color={statusColors[doc.status] || 'zinc'}>{doc.status}</Badge>,
        },
        {
            id: 'chunks',
            header: t('ui.chunks'),
            cell: (doc) => doc.chunk_count ?? 0,
        },
        {
            id: 'uploaded',
            header: t('ui.uploaded'),
            cell: (doc) => (
                <span className="text-slate-500">
                    {new Date(doc.created_at).toLocaleDateString(locale || undefined, { month: 'short', day: 'numeric' })}
                </span>
            ),
        },
        {
            id: 'actions',
            header: '',
            meta: { align: 'right' },
            cell: (doc) => (
                <Link
                    href={show({ document: doc.id }).url}
                    className="text-sm font-medium text-slate-950 underline decoration-slate-950/50 hover:decoration-slate-950"
                >
                    {t('ui.view')}
                </Link>
            ),
        },
    ], [t, locale]);

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.documents')} />

            <PageHeader
                title={t('ui.documents')}
                subtitle={t('ui.upload_documents_hint')}
                actions={
                    <Link href={create().url}>
                        <Button>{t('ui.upload_document')}</Button>
                    </Link>
                }
            />

            {documents.data.length === 0 ? (
                <DataTable
                    className="mt-8"
                    columns={[]}
                    data={[]}
                    emptyIcon={FileText}
                    emptyTitle={t('ui.no_documents_found')}
                    emptyDescription={t('ui.upload_documents_empty')}
                    emptyAction={{ label: t('ui.upload_document'), href: create().url }}
                />
            ) : (
                <>
                    {stats && (
                        <div className="mt-8 grid grid-cols-3 gap-4">
                            <PageSection padding className="!p-6">
                                <p className="text-sm text-slate-500">{t('ui.total_documents')}</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-950">{stats.total_documents}</p>
                            </PageSection>
                            <PageSection padding className="!p-6">
                                <p className="text-sm text-slate-500">{t('ui.total_chunks')}</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-950">{stats.total_chunks}</p>
                            </PageSection>
                            <PageSection padding className="!p-6">
                                <p className="text-sm text-slate-500">{t('ui.avg_chunks_doc')}</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-950">{stats.avg_chunks_per_doc}</p>
                            </PageSection>
                        </div>
                    )}
                    <DataTable
                        className="mt-6"
                        columns={columns}
                        data={documents.data}
                        getRowId={(row) => row.id}
                    />
                </>
            )}
        </AuthenticatedLayout>
    );
}
