import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useCallback, useMemo } from 'react';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { Dialog, DialogTitle, DialogBody, DialogActions } from '@/Components/catalyst/dialog';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Textarea } from '@/Components/catalyst/textarea';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowLeft, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Reply } from 'lucide-react';

export default function Index({ autoReplies }) {
    const { t } = useTranslation();
    const [showForm, setShowForm] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        keyword: '',
        reply_text: '',
        match_type: 'contains',
    });

    const toggleForm = useForm({ is_active: false });

    const matchTypeLabels = useMemo(() => ({
        exact: t('ui.exact'),
        contains: t('ui.contains'),
        starts_with: t('ui.starts_with'),
    }), [t]);

    function handleEdit(rule) {
        setEditingRule(rule);
        setData({
            keyword: rule.keyword,
            reply_text: rule.reply_text,
            match_type: rule.match_type,
        });
        setShowForm(true);
    }

    function handleToggle(rule) {
        toggleForm.patch(`/sms/auto-replies/${rule.id}`, {
            is_active: !rule.is_active,
            preserveScroll: true,
        });
    }

    const columns = useMemo(() => [
        {
            id: 'keyword',
            header: t('ui.keyword'),
            cell: (rule) => <span className="font-medium">{rule.keyword}</span>,
        },
        {
            id: 'reply',
            header: t('ui.reply_text'),
            className: 'max-w-xs truncate',
            cell: (rule) => rule.reply_text,
        },
        {
            id: 'match_type',
            header: t('ui.match_type'),
            cell: (rule) => <Badge color="zinc">{matchTypeLabels[rule.match_type]}</Badge>,
        },
        {
            id: 'status',
            header: t('common.status'),
            cell: (rule) => (
                <button
                    onClick={() => handleToggle(rule)}
                    className="cursor-pointer"
                    type="button"
                >
                    {rule.is_active ? (
                        <ToggleRight className="size-5 text-emerald-500" />
                    ) : (
                        <ToggleLeft className="size-5 text-slate-400" />
                    )}
                </button>
            ),
        },
        {
            id: 'actions',
            header: t('common.actions'),
            cell: (rule) => (
                <div className="flex items-center gap-2">
                    <Button outline size="sm" onClick={() => handleEdit(rule)}>
                        <Pencil className="size-3" />
                    </Button>
                    <Button outline size="sm" onClick={() => setDeleteTarget(rule)}>
                        <Trash2 className="size-3" />
                    </Button>
                </div>
            ),
        },
    ], [t, matchTypeLabels]);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (editingRule) {
            patch(`/sms/auto-replies/${editingRule.id}`, {
                ...data,
                preserveScroll: true,
                onSuccess: () => {
                    setShowForm(false);
                    setEditingRule(null);
                    reset();
                },
            });
        } else {
            post('/sms/auto-replies', {
                ...data,
                preserveScroll: true,
                onSuccess: () => {
                    setShowForm(false);
                    reset();
                },
            });
        }
    }, [editingRule, data, patch, post, reset, setShowForm, setEditingRule]);

    const handleDelete = useCallback(() => {
        if (!deleteTarget) return;
        toggleForm.delete(`/sms/auto-replies/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    }, [deleteTarget, toggleForm]);

    const openNew = useCallback(() => {
        setEditingRule(null);
        reset();
        setShowForm(true);
    }, [reset, setEditingRule, setShowForm]);

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.auto_replies_heading')} />

            <div className="space-y-6">
                <PageHeader
                    title={t('ui.auto_replies_heading')}
                    subtitle={t('ui.auto_replies_desc')}
                    actions={(
                        <>
                            <Link href="/sms">
                                <Button outline>
                                    <ArrowLeft className="size-4" />
                                </Button>
                            </Link>
                            <Button onClick={openNew}>
                                <Plus className="size-4" />
                                {t('ui.add_rule')}
                            </Button>
                        </>
                    )}
                />

                <DataTable
                    columns={columns}
                    data={autoReplies}
                    getRowId={(row) => row.id}
                    emptyIcon={Reply}
                    emptyTitle={t('ui.no_auto_reply_rules')}
                    emptyDescription={t('ui.create_rule_desc')}
                    emptyAction={{ label: t('ui.add_rule'), onClick: openNew }}
                />
            </div>

            <Dialog open={showForm} onClose={() => { setShowForm(false); setEditingRule(null); }} size="md">
                <DialogTitle>{editingRule ? t('ui.edit_rule') : t('ui.add_rule')}</DialogTitle>
                <DialogBody>
                    <form id="auto-reply-form" onSubmit={handleSubmit} className="space-y-4">
                        <Field>
                            <Label>{t('ui.keyword')}</Label>
                            <Input
                                value={data.keyword}
                                onChange={(e) => setData('keyword', e.target.value)}
                                placeholder={t('ui.keyword_placeholder')}
                                invalid={errors.keyword ? true : undefined}
                            />
                            {errors.keyword && <ErrorMessage>{errors.keyword}</ErrorMessage>}
                        </Field>

                        <Field>
                            <Label>{t('ui.reply_text')}</Label>
                            <Textarea
                                value={data.reply_text}
                                onChange={(e) => setData('reply_text', e.target.value)}
                                placeholder={t('ui.auto_reply_placeholder')}
                                rows={4}
                                invalid={errors.reply_text ? true : undefined}
                            />
                            {errors.reply_text && <ErrorMessage>{errors.reply_text}</ErrorMessage>}
                        </Field>

                        <Field>
                            <Label>{t('ui.match_type')}</Label>
                            <Select
                                value={data.match_type}
                                onChange={(e) => setData('match_type', e.target.value)}
                            >
                                <option value="contains">{t('ui.contains')}</option>
                                <option value="exact">{t('ui.exact')}</option>
                                <option value="starts_with">{t('ui.starts_with')}</option>
                            </Select>
                        </Field>
                    </form>
                </DialogBody>
                <DialogActions>
                    <Button outline onClick={() => { setShowForm(false); setEditingRule(null); }}>
                        {t('ui.cancel')}
                    </Button>
                    <Button type="submit" form="auto-reply-form" disabled={processing}>
                        {editingRule ? t('ui.update') : t('common.create')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm">
                <DialogTitle>{t('ui.delete_rule')}</DialogTitle>
                <DialogBody>
                    <Text>
                        {t('ui.delete_auto_reply_confirm', { keyword: deleteTarget?.keyword ?? '' })}
                    </Text>
                </DialogBody>
                <DialogActions>
                    <Button outline onClick={() => setDeleteTarget(null)}>{t('ui.cancel')}</Button>
                    <Button color="red" onClick={handleDelete} disabled={toggleForm.processing}>
                        {t('common.delete')}
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
