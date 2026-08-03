import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { Dialog, DialogTitle, DialogBody, DialogActions } from '@/Components/catalyst/dialog';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Textarea } from '@/Components/catalyst/textarea';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowLeft, Megaphone, Send, Trash2 } from 'lucide-react';

const statusColors = {
    draft: 'zinc',
    sending: 'amber',
    completed: 'emerald',
    failed: 'red',
};

export default function Index({ campaigns }) {
    const { t, locale } = useTranslation();
    const [showForm, setShowForm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const statusLabels = useMemo(() => ({
        draft: t('ui.campaign_status_draft'),
        sending: t('ui.campaign_status_sending'),
        completed: t('ui.campaign_status_completed'),
        failed: t('ui.campaign_status_failed'),
    }), [t]);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        message: '',
        recipients: '',
    });

    const actionForm = useForm({});

    function handleSend(campaign) {
        actionForm.post(`/sms/campaigns/${campaign.id}/send`, {
            preserveScroll: true,
        });
    }

    const columns = useMemo(() => [
        {
            id: 'name',
            header: t('common.name'),
            cell: (campaign) => <span className="font-medium">{campaign.name}</span>,
        },
        {
            id: 'status',
            header: t('common.status'),
            cell: (campaign) => (
                <Badge color={statusColors[campaign.status] || 'zinc'}>
                    {statusLabels[campaign.status] || campaign.status}
                </Badge>
            ),
        },
        {
            id: 'progress',
            header: t('ui.progress'),
            cell: (campaign) => (
                <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-slate-200">
                        <div
                            className="h-2 rounded-full bg-emerald-500 transition-all"
                            style={{
                                width: campaign.total_count > 0
                                    ? `${Math.round((campaign.sent_count / campaign.total_count) * 100)}%`
                                    : '0%',
                            }}
                        />
                    </div>
                    <Text className="text-xs">
                        {campaign.sent_count}/{campaign.total_count}
                    </Text>
                </div>
            ),
        },
        {
            id: 'created',
            header: t('ui.created'),
            cell: (campaign) => new Date(campaign.created_at).toLocaleDateString(locale || undefined, {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            }),
        },
        {
            id: 'actions',
            header: t('common.actions'),
            cell: (campaign) => (
                <div className="flex items-center gap-2">
                    {(campaign.status === 'draft' || campaign.status === 'failed') && (
                        <Button outline size="sm" onClick={() => handleSend(campaign)}>
                            <Send className="size-3" />
                        </Button>
                    )}
                    {campaign.status === 'draft' && (
                        <Button outline size="sm" onClick={() => setDeleteTarget(campaign)}>
                            <Trash2 className="size-3" />
                        </Button>
                    )}
                </div>
            ),
        },
    ], [t, locale, statusLabels]);

    function handleSubmit(e) {
        e.preventDefault();
        post('/sms/campaigns', {
            preserveScroll: true,
            onSuccess: () => {
                setShowForm(false);
                reset();
            },
        });
    }


    function handleDelete() {
        if (!deleteTarget) return;
        actionForm.delete(`/sms/campaigns/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.campaigns_heading')} />

            <div className="space-y-6">
                <PageHeader
                    title={t('ui.campaigns_heading')}
                    subtitle={t('ui.bulk_sms_desc')}
                    actions={(
                        <>
                            <Link href="/sms">
                                <Button outline>
                                    <ArrowLeft className="size-4" />
                                </Button>
                            </Link>
                            <Button onClick={() => setShowForm(true)}>
                                <Megaphone className="size-4" />
                                {t('ui.new_campaign')}
                            </Button>
                        </>
                    )}
                />

                <DataTable
                    columns={columns}
                    data={campaigns}
                    getRowId={(row) => row.id}
                    emptyIcon={Megaphone}
                    emptyTitle={t('ui.no_campaigns')}
                    emptyDescription={t('ui.create_campaign_desc')}
                    emptyAction={{ label: t('ui.new_campaign'), onClick: () => setShowForm(true) }}
                />
            </div>

            <Dialog open={showForm} onClose={() => setShowForm(false)} size="md">
                <DialogTitle>{t('ui.new_campaign')}</DialogTitle>
                <DialogBody>
                    <form id="campaign-form" onSubmit={handleSubmit} className="space-y-4">
                        <Field>
                            <Label>{t('ui.campaign_name')}</Label>
                            <Input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder={t('ui.campaign_name_placeholder')}
                                invalid={errors.name ? true : undefined}
                            />
                            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                        </Field>

                        <Field>
                            <Label>{t('ui.message')}</Label>
                            <Textarea
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                placeholder={t('ui.campaign_message_placeholder')}
                                rows={4}
                                invalid={errors.message ? true : undefined}
                            />
                            <Text className="mt-1 text-right text-xs text-slate-500">
                                {data.message.length}/1600
                            </Text>
                            {errors.message && <ErrorMessage>{errors.message}</ErrorMessage>}
                        </Field>

                        <Field>
                            <Label>{t('ui.recipients')}</Label>
                            <Textarea
                                value={data.recipients}
                                onChange={(e) => setData('recipients', e.target.value)}
                                placeholder="+12345678900, +19876543210"
                                rows={4}
                                invalid={errors.recipients ? true : undefined}
                            />
                            <Text className="mt-1 text-xs text-slate-500">
                                {t('ui.recipients_hint')}
                            </Text>
                            {errors.recipients && <ErrorMessage>{errors.recipients}</ErrorMessage>}
                        </Field>
                    </form>
                </DialogBody>
                <DialogActions>
                    <Button outline onClick={() => setShowForm(false)}>{t('ui.cancel')}</Button>
                    <Button type="submit" form="campaign-form" disabled={processing}>
                        {t('ui.save_draft')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm">
                <DialogTitle>{t('ui.delete_campaign')}</DialogTitle>
                <DialogBody>
                    <Text>
                        {t('ui.delete_campaign_confirm', { name: deleteTarget?.name ?? '' })}
                    </Text>
                </DialogBody>
                <DialogActions>
                    <Button outline onClick={() => setDeleteTarget(null)}>{t('ui.cancel')}</Button>
                    <Button color="red" onClick={handleDelete} disabled={actionForm.processing}>
                        {t('common.delete')}
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
