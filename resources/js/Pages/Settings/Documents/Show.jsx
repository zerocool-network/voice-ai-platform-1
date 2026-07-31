import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';
import { Subheading } from '@/Components/catalyst/heading';
import { Text, TextLink } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { DescriptionList, DescriptionTerm, DescriptionDetails } from '@/Components/catalyst/description-list';
import { Input } from '@/Components/catalyst/input';
import { index } from '@/actions/App/Http/Controllers/Web/DocumentsController';

const statusColors = {
    pending: 'amber',
    processing: 'blue',
    completed: 'emerald',
    failed: 'red',
};

function chunkWordCount(content) {
    return content.trim().split(/\s+/).filter(Boolean).length;
}

function chunkCharCount(content) {
    return content.length;
}

export default function Show({ document, chunks }) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedChunks, setExpandedChunks] = useState({});
    const [reprocessing, setReprocessing] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);

    const filteredChunks = searchQuery
        ? chunks.filter(c => c.content.toLowerCase().includes(searchQuery.toLowerCase()))
        : chunks;

    function toggleExpand(index) {
        setExpandedChunks(prev => ({
            ...prev,
            [index]: !prev[index],
        }));
    }

    async function copyChunk(content, index) {
        await navigator.clipboard.writeText(content);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    }

    function handleReprocess() {
        setReprocessing(true);
        router.post(`/settings/documents/${document.id}/reprocess`, {}, {
            preserveScroll: true,
            onFinish: () => setReprocessing(false),
        });
    }

    function handleDelete() {
        if (confirm(t('ui.documents_delete_confirm'))) {
            router.delete(`/settings/documents/${document.id}`, {
                preserveScroll: true,
            });
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title={document.name} />

            <PageHeader
                title={document.name}
                subtitle={t('ui.document_details_hint')}
                actions={
                    <TextLink href={index().url}>&larr; {t('ui.back_to_documents')}</TextLink>
                }
            />

            <div className="mt-8 max-w-4xl space-y-6">
                <PageSection>
                    <div className="flex items-start justify-between">
                        <Subheading>{t('ui.document_info')}</Subheading>
                        <div className="flex gap-2">
                            <Button plain onClick={handleReprocess} disabled={reprocessing}>
                                {reprocessing ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        {t('ui.reprocessing')}
                                    </span>
                                ) : t('ui.reprocess')}
                            </Button>
                            <Button plain color="red" onClick={handleDelete}>{t('common.delete')}</Button>
                        </div>
                    </div>
                    <DescriptionList className="mt-4">
                        <DescriptionTerm>{t('ui.type')}</DescriptionTerm>
                        <DescriptionDetails><Badge color="zinc">{document.resource_type}</Badge></DescriptionDetails>
                        <DescriptionTerm>{t('ui.status_label')}</DescriptionTerm>
                        <DescriptionDetails>
                            <Badge color={statusColors[document.status] || 'zinc'}>{document.status}</Badge>
                        </DescriptionDetails>
                        <DescriptionTerm>{t('ui.mime_type')}</DescriptionTerm>
                        <DescriptionDetails>{document.mime_type || '\u2014'}</DescriptionDetails>
                        <DescriptionTerm>{t('ui.chunks')}</DescriptionTerm>
                        <DescriptionDetails>{chunks.length}</DescriptionDetails>
                        <DescriptionTerm>{t('ui.uploaded')}</DescriptionTerm>
                        <DescriptionDetails>{new Date(document.created_at).toLocaleString()}</DescriptionDetails>
                        {document.status === 'failed' && document.error && (
                            <>
                                <DescriptionTerm className="text-red-600">{t('ui.error')}</DescriptionTerm>
                                <DescriptionDetails className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                    {document.error}
                                </DescriptionDetails>
                            </>
                        )}
                    </DescriptionList>
                </PageSection>

                <PageSection>
                    <Subheading>{t('ui.extracted_chunks')} ({chunks.length})</Subheading>

                    {chunks.length === 0 ? (
                        <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-12">
                            <p className="text-sm font-medium text-slate-500">{t('ui.no_chunks_yet')}</p>
                            <Text className="mt-1">{t('ui.document_still_processing')}</Text>
                        </div>
                    ) : (
                        <>
                            <div className="mt-4">
                                <Input
                                    type="text"
                                    placeholder={t('ui.search_chunks')}
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <Text className="mt-1">
                                        {t('ui.found_chunks', { filtered: filteredChunks.length, total: chunks.length })}
                                    </Text>
                                )}
                            </div>
                            <div className="mt-4 space-y-3">
                                {filteredChunks.map((chunk) => (
                                    <div
                                        key={chunk.chunk_index}
                                        className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm"
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-semibold text-slate-400">
                                                    {t('ui.chunk_label', { number: chunk.chunk_index + 1 })}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {t('ui.word_count', { count: chunkWordCount(chunk.content) })}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {t('ui.char_count', { count: chunkCharCount(chunk.content) })}
                                                </span>
                                                {chunk.metadata?.page_number && (
                                                    <span className="text-xs text-slate-400">
                                                        {t('ui.page_label', { number: chunk.metadata.page_number })}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => copyChunk(chunk.content, chunk.chunk_index)}
                                                className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-700"
                                            >
                                                {copiedIndex === chunk.chunk_index ? t('ui.copied') : t('ui.copy')}
                                            </button>
                                        </div>
                                        <p
                                            className={`whitespace-pre-wrap text-slate-700 ${
                                                !expandedChunks[chunk.chunk_index] ? 'line-clamp-3' : ''
                                            }`}
                                        >
                                            {chunk.content}
                                        </p>
                                        {chunk.content.length > 300 && (
                                            <button
                                                type="button"
                                                onClick={() => toggleExpand(chunk.chunk_index)}
                                                className="mt-1 text-xs font-medium text-cyan-600 hover:text-cyan-700"
                                            >
                                                {expandedChunks[chunk.chunk_index] ? t('ui.show_less') : t('ui.show_more')}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </PageSection>
            </div>
        </AuthenticatedLayout>
    );
}
