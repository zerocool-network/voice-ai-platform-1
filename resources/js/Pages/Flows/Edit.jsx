import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/Components/catalyst/button';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Textarea } from '@/Components/catalyst/textarea';
import { Select } from '@/Components/catalyst/select';
import { Checkbox, CheckboxField } from '@/Components/catalyst/checkbox';
import { TextLink } from '@/Components/catalyst/text';
import { update, index } from '@/actions/App/Http/Controllers/Web/FlowController';

export default function Edit({ flow, languages = {} }) {
    const { t } = useTranslation();
    const { data, setData, patch, processing, errors } = useForm({
        name: flow.name,
        description: flow.description ?? '',
        phone_number: flow.phone_number ?? '',
        language: flow.language ?? 'en-US',
        is_active: flow.is_active,
    });

    function submit(e) {
        e.preventDefault();
        patch(update({flow: flow.id}).url);
    }

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.edit_flow')} />

            <PageHeader
                title={t('ui.edit_flow')}
                subtitle={t('ui.update_voice_flow')}
                actions={
                    <TextLink href={index().url}>&larr; {t('ui.back_to_flows')}</TextLink>
                }
            />

            <PageSection className="mt-8">
                <form onSubmit={submit} className="max-w-2xl space-y-6">
                    <Field>
                        <Label>{t('common.name')}</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            invalid={errors.name ? true : undefined}
                        />
                        {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                    </Field>

                    <Field>
                        <Label>{t('ui.description_optional')}</Label>
                        <Textarea
                            id="description"
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            invalid={errors.description ? true : undefined}
                        />
                        {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
                    </Field>

                    <Field>
                        <Label>{t('ui.phone_number_optional')}</Label>
                        <Input
                            id="phone_number"
                            value={data.phone_number}
                            onChange={(e) => setData('phone_number', e.target.value)}
                            invalid={errors.phone_number ? true : undefined}
                        />
                        {errors.phone_number && <ErrorMessage>{errors.phone_number}</ErrorMessage>}
                    </Field>

                    <Field>
                        <Label>{t('ui.flow_language')}</Label>
                        <Select
                            id="language"
                            value={data.language}
                            onChange={(e) => setData('language', e.target.value)}
                            invalid={errors.language ? true : undefined}
                        >
                            {Object.entries(languages).map(([code, label]) => (
                                <option key={code} value={code}>{label}</option>
                            ))}
                        </Select>
                        {errors.language && <ErrorMessage>{errors.language}</ErrorMessage>}
                    </Field>

                    <CheckboxField>
                        <Checkbox
                            name="is_active"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e)}
                        />
                        <Label>{t('ui.active')}</Label>
                    </CheckboxField>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? t('common.saving') : t('ui.save_changes')}
                        </Button>
                        <Button plain href={index().url}>{t('common.cancel')}</Button>
                    </div>
                </form>
            </PageSection>
        </AuthenticatedLayout>
    );
}
