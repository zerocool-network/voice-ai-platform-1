import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Textarea } from '@/Components/catalyst/textarea';
import { Select } from '@/Components/catalyst/select';
import { Checkbox, CheckboxField } from '@/Components/catalyst/checkbox';
import { TextLink } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Subheading } from '@/Components/catalyst/heading';
import { store, index } from '@/actions/App/Http/Controllers/Web/FlowController';
import { Headset, Calendar, ClipboardList, Menu, Bot } from 'lucide-react';

const templateIcons = { Headset, Calendar, ClipboardList, Menu, Bot };

export default function Create({ templates, languages = {}, defaultLanguage = 'en-US' }) {
    const { t } = useTranslation();
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        phone_number: '',
        language: defaultLanguage,
        is_active: true,
        template_id: null,
    });

    function selectTemplate(tpl) {
        setSelectedTemplate(tpl);
        setData('name', tpl.name);
        setData('description', tpl.description);
        setData('template_id', tpl.id);
        setShowForm(true);
    }

    function startBlank() {
        setSelectedTemplate(null);
        setData('name', '');
        setData('description', '');
        setData('template_id', null);
        setShowForm(true);
    }

    function submit(e) {
        e.preventDefault();
        post(store().url);
    }

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.create_flow')} />

            <PageHeader
                title={t('ui.create_flow')}
                subtitle={t('ui.start_template_or_scratch')}
                actions={
                    <TextLink href={index().url}>&larr; {t('ui.back_to_flows')}</TextLink>
                }
            />

            {!showForm ? (
                <PageSection className="mt-8">
                    <Subheading>{t('ui.choose_template')}</Subheading>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {templates.map((tpl) => {
                            const Icon = templateIcons[tpl.icon] || Bot;
                            const stepCount = Object.keys(tpl.config.steps).length;
                            return (
                                <button
                                    key={tpl.id}
                                    type="button"
                                    onClick={() => selectTemplate(tpl)}
                                    className="group rounded-xl border border-slate-200/70 bg-white p-5 text-left transition hover:border-cyan-300 hover:shadow-md"
                                >
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
                                        <Icon className="size-5" />
                                    </div>
                                    <p className="mt-3 font-semibold text-slate-950">{tpl.name}</p>
                                    <Text className="mt-1 line-clamp-2">{tpl.description}</Text>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {stepCount > 0 && (
                                            <Badge color="zinc">{t('ui.template_steps', { count: stepCount })}</Badge>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 text-center">
                        <Text className="mb-3">{t('ui.or')}</Text>
                        <Button plain onClick={startBlank}>{t('ui.start_from_scratch')}</Button>
                    </div>
                </PageSection>
            ) : (
                <PageSection className="mt-8">
                    <form onSubmit={submit} className="max-w-2xl space-y-6">
                        {selectedTemplate && (
                            <div className="rounded-xl border border-cyan-200 bg-cyan-50/80 p-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-cyan-800">
                                        {t('ui.template_label')}: {selectedTemplate.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => { setShowForm(false); setSelectedTemplate(null); }}
                                        className="ml-auto text-xs text-cyan-600 underline"
                                    >
                                        {t('ui.change')}
                                    </button>
                                </div>
                                <Text className="mt-1">{selectedTemplate.description}</Text>
                            </div>
                        )}

                        <Field>
                            <Label>{t('common.name')}</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder={t('ui.flow_name_placeholder')}
                                required
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
                                placeholder={t('ui.flow_description_placeholder')}
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
                                placeholder="+1 (555) 123-4567"
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
                                {processing ? t('ui.creating') : t('ui.create_flow_button')}
                            </Button>
                            <Button plain href={index().url}>{t('common.cancel')}</Button>
                        </div>
                    </form>
                </PageSection>
            )}
        </AuthenticatedLayout>
    );
}
