import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageSection from '@/Components/PageSection';
import { Head, Link, router } from '@inertiajs/react';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { AlertTriangle, Calendar, FileCode, Hash, MessageSquare } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function Show({ error }) {
    const { t } = useTranslation();

    function resolve() {
        router.patch(`/settings/errors/${error.hash}/resolve`, {}, {
            onSuccess: () => router.visit('/settings/errors'),
        });
    }

    const shortClass = error.class.replace(/^.*\\/, '');

    return (
        <AuthenticatedLayout>
            <Head title={`${t('ui.error')}: ${shortClass}`} />

            <div className="space-y-6">
                <div>
                    <Link href="/settings/errors" className="text-sm text-indigo-600 hover:underline">
                        &larr; {t('ui.back_to_errors')}
                    </Link>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <Badge color="red" className="mb-2">{shortClass}</Badge>
                        <h1 className="text-[28px] font-semibold tracking-tight text-slate-950">{error.message}</h1>
                    </div>
                    <div>
                        {error.resolved_at ? (
                            <Badge color="emerald">{t('ui.resolved')}</Badge>
                        ) : (
                            <Button onClick={resolve}>{t('ui.resolve_label')}</Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <PageSection>
                        <div className="flex items-center gap-2">
                            <FileCode className="size-4 text-slate-400" />
                            <Text className="text-sm font-medium">{t('ui.location')}</Text>
                        </div>
                        <p className="mt-2 font-mono text-sm text-slate-600">
                            {error.file}:{error.line}
                        </p>
                    </PageSection>

                    <PageSection>
                        <div className="flex items-center gap-2">
                            <Hash className="size-4 text-slate-400" />
                            <Text className="text-sm font-medium">{t('ui.exception_class')}</Text>
                        </div>
                        <p className="mt-2 font-mono text-sm text-slate-600">{error.class}</p>
                    </PageSection>

                    <PageSection>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="size-4 text-slate-400" />
                            <Text className="text-sm font-medium">{t('ui.occurrences')}</Text>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">
                            {error.occurrence_count}
                        </p>
                    </PageSection>

                    <PageSection>
                        <div className="flex items-center gap-2">
                            <Calendar className="size-4 text-slate-400" />
                            <Text className="text-sm font-medium">{t('ui.timeline')}</Text>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-slate-600">
                            <p><span className="font-medium">{t('ui.first_seen_label')}</span> {new Date(error.first_seen_at).toLocaleString()}</p>
                            <p><span className="font-medium">{t('ui.last_seen_label')}</span> {new Date(error.last_seen_at).toLocaleString()}</p>
                            {error.resolved_at && (
                                <p><span className="font-medium">{t('ui.resolved_label')}</span> {new Date(error.resolved_at).toLocaleString()}</p>
                            )}
                        </div>
                    </PageSection>
                </div>

                <PageSection>
                    <div className="flex items-center gap-2">
                        <MessageSquare className="size-4 text-slate-400" />
                        <Text className="text-sm font-medium">{t('ui.full_message')}</Text>
                    </div>
                    <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-sm text-slate-600">
                        {error.message}
                    </pre>
                </PageSection>
            </div>
        </AuthenticatedLayout>
    );
}
