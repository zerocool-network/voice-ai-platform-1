import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import { Head, useForm } from '@inertiajs/react';
import { Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Switch } from '@/Components/catalyst/switch';
import { Select } from '@/Components/catalyst/select';
import { Textarea } from '@/Components/catalyst/textarea';
import { useTranslation } from '@/hooks/useTranslation';

export default function Index({ dataProtection }) {
    const { t } = useTranslation();
    const { data, setData, patch, processing, errors } = useForm({
        consent_required: dataProtection.consent_required ?? false,
        retention_days: dataProtection.retention_days ?? 90,
        consent_message: dataProtection.consent_message ?? '',
        consent_recordings: dataProtection.consent_recordings ?? true,
        consent_transcripts: dataProtection.consent_transcripts ?? true,
    });

    function submit(e) {
        e.preventDefault();
        patch('/settings/data-protection', { preserveScroll: true });
    }

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.data_protection')} />

            <div className="max-w-2xl space-y-6">
                <PageHeader
                    title={t('ui.data_protection')}
                    subtitle={t('ui.manage_consent_retention')}
                />

                <form onSubmit={submit} className="space-y-6">
                    <PageSection>
                        <Subheading>{t('ui.call_recording_consent')}</Subheading>

                        <div className="mt-4 flex items-center justify-between">
                            <div>
                                <Text className="font-medium">{t('ui.require_caller_consent')}</Text>
                                <Text className="text-sm text-slate-500">
                                    {t('ui.consent_description')}
                                </Text>
                            </div>
                            <Switch
                                checked={data.consent_required}
                                onChange={(checked) => setData('consent_required', checked)}
                            />
                        </div>

                        {data.consent_required && (
                            <>
                                <div className="mt-4">
                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                        {t('ui.disclosure_message')}
                                    </label>
                                    <Textarea
                                        value={data.consent_message}
                                        onChange={(e) => setData('consent_message', e.target.value)}
                                        rows={3}
                                    />
                                    {errors.consent_message && (
                                        <p className="mt-1 text-xs text-red-600">{errors.consent_message}</p>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div>
                                        <Text className="font-medium">{t('ui.apply_consent_recordings')}</Text>
                                    </div>
                                    <Switch
                                        checked={data.consent_recordings}
                                        onChange={(checked) => setData('consent_recordings', checked)}
                                    />
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div>
                                        <Text className="font-medium">{t('ui.apply_consent_transcripts')}</Text>
                                    </div>
                                    <Switch
                                        checked={data.consent_transcripts}
                                        onChange={(checked) => setData('consent_transcripts', checked)}
                                    />
                                </div>
                            </>
                        )}
                    </PageSection>

                    <PageSection>
                        <Subheading>{t('ui.data_retention')}</Subheading>

                        <div className="mt-4">
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                {t('ui.retention_period')}
                            </label>
                            <Select
                                value={data.retention_days}
                                onChange={(e) => setData('retention_days', parseInt(e.target.value))}
                            >
                                <option value={30}>{t('ui.days_30')}</option>
                                <option value={60}>60 {t('ui.days')}</option>
                                <option value={90}>{t('ui.days_90')}</option>
                                <option value={180}>180 {t('ui.days')}</option>
                                <option value={365}>365 {t('ui.days')}</option>
                            </Select>
                            {errors.retention_days && (
                                <p className="mt-1 text-xs text-red-600">{errors.retention_days}</p>
                            )}
                        </div>
                    </PageSection>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {t('ui.save_settings')}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
