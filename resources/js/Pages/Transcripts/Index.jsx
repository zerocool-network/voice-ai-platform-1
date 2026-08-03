import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { Text } from '@/Components/catalyst/text';
import { Input } from '@/Components/catalyst/input';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { Pagination, PaginationList, PaginationPage, PaginationGap, PaginationNext, PaginationPrevious } from '@/Components/catalyst/pagination';
import HighlightText from '@/Components/HighlightText';
import { useTranslation } from '@/hooks/useTranslation';

const roleColors = {
    caller: 'blue',
    assistant: 'purple',
    system: 'zinc',
};

const rolePills = ['', 'caller', 'assistant', 'system'];

export default function Index({ transcripts, stats, filters }) {
    const { t } = useTranslation();
    const [search, setSearch] = useState(filters.q ?? '');
    const [role, setRole] = useState(filters.role ?? '');

    const roleLabels = {
        caller: t('ui.role_caller'),
        assistant: t('ui.role_assistant'),
        system: t('ui.role_system'),
    };

    const debouncedApply = useCallback(() => {
        const timer = setTimeout(() => {
            router.get('/transcripts', {
                q: search || undefined,
                role: role || undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [search, role]);

    useEffect(() => {
        return debouncedApply();
    }, [debouncedApply]);

    function handleExport() {
        const params = {};
        if (search) params.q = search;
        if (role) params.role = role;
        window.location.href = '/transcripts/export/csv?' + new URLSearchParams(params).toString();
    }

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.transcripts')} />

            <div className="space-y-6">
                <PageHeader
                    title={t('ui.transcripts')}
                    subtitle={t('ui.search_and_analyze_transcripts')}
                />

                <div className="grid grid-cols-2 gap-4">
                    <PageSection className="!p-4">
                        <Text className="text-sm/5">{t('ui.total_transcripts')}</Text>
                        <p className="mt-1 text-2xl font-semibold text-slate-950">
                            {stats.total_transcripts.toLocaleString()}
                        </p>
                    </PageSection>
                    <PageSection className="!p-4">
                        <Text className="text-sm/5">{t('ui.calls_transcribed')}</Text>
                        <p className="mt-1 text-2xl font-semibold text-slate-950">
                            {stats.calls_with_transcripts.toLocaleString()}
                        </p>
                    </PageSection>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1">
                        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <Input
                            className="!pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('ui.search_transcripts')}
                            aria-label={t('ui.search_transcripts')}
                        />
                    </div>
                    <div className="flex gap-2">
                        {rolePills.map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setRole(r)}
                                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                                    role === r
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                {r === '' ? t('ui.all') : roleLabels[r]}
                            </button>
                        ))}
                    </div>
                    <Button outline aria-label={t('ui.export_csv')} onClick={handleExport}>
                        {t('ui.export_csv')}
                    </Button>
                </div>

                {transcripts.data.length === 0 ? (
                    <PageSection>
                        <div className="flex flex-col items-center justify-center py-8">
                            <p className="text-base font-semibold text-slate-950">{t('ui.no_transcripts_found')}</p>
                            <Text className="mt-2">{t('ui.transcripts_appear')}</Text>
                        </div>
                    </PageSection>
                ) : (
                    <div className="space-y-4">
                        {transcripts.data.map((transcript) => (
                            <PageSection key={transcript.id} className="!p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Link
                                                href={`/calls/${transcript.call_id}`}
                                                className="font-medium text-slate-950 hover:underline"
                                            >
                                                {transcript.from_number} → {transcript.to_number}
                                            </Link>
                                            {transcript.flow_name && (
                                                <>
                                                    <span className="text-slate-300">·</span>
                                                    <span>{transcript.flow_name}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="mt-2">
                                            <HighlightText
                                                text={transcript.text}
                                                query={search}
                                                className="text-sm text-slate-700"
                                            />
                                        </div>
                                        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                                            <Badge color={roleColors[transcript.role] || 'zinc'}>
                                                {roleLabels[transcript.role] || transcript.role}
                                            </Badge>
                                            {transcript.confidence != null && (
                                                <span>{t('ui.confidence')}: {(transcript.confidence * 100).toFixed(0)}%</span>
                                            )}
                                            <span>
                                                {new Date(transcript.created_at).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </PageSection>
                        ))}

                        {transcripts.links && (
                            <Pagination>
                                <PaginationPrevious href={transcripts.prev_page_url} />
                                <PaginationList>
                                    {transcripts.links.map((link, i) => {
                                        if (link.url === null) return <PaginationGap key={link.label || i} />;
                                        const label = link.label.replace(/&laquo;|&raquo;/g, '').trim();
                                        const pageNum = parseInt(label);
                                        if (isNaN(pageNum)) return null;
                                        return (
                                            <PaginationPage key={link.url} href={link.url} current={link.active}>
                                                {pageNum}
                                            </PaginationPage>
                                        );
                                    })}
                                </PaginationList>
                                <PaginationNext href={transcripts.next_page_url} />
                            </Pagination>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
