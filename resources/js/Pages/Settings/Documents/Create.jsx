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
import { Select } from '@/Components/catalyst/select';
import { TextLink } from '@/Components/catalyst/text';
import { store, index } from '@/actions/App/Http/Controllers/Web/DocumentsController';

const ACCEPTED_FILE_TYPES = '.pdf,.txt,.csv,.png,.jpg,.jpeg,.gif,.bmp,.webp';

export default function Create({ resourceTypes }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, progress } = useForm({
        resource_type: 'pdf',
        name: '',
        file: null,
    });

    const [fileName, setFileName] = useState('');
    const [dragActive, setDragActive] = useState(false);

    function submit(e) {
        e.preventDefault();
        post(store().url, {
            forceFormData: true,
        });
    }

    function handleFile(file) {
        setData('file', file);
        setFileName(file?.name ?? '');
    }

    function handleDrag(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.upload_document')} />

            <PageHeader
                title={t('ui.upload_document')}
                subtitle={t('ui.add_document_hint')}
                actions={
                    <TextLink href={index().url}>&larr; {t('ui.back_to_documents')}</TextLink>
                }
            />

            <PageSection className="mt-8">
                <form onSubmit={submit} className="max-w-2xl space-y-6">
                    <Field>
                        <Label>{t('ui.document_type')}</Label>
                        <Select
                            value={data.resource_type}
                            onChange={(e) => setData('resource_type', e.target.value)}
                        >
                            {resourceTypes.map((rt) => (
                                <option key={rt.value} value={rt.value}>{rt.label}</option>
                            ))}
                        </Select>
                    </Field>

                    <Field>
                        <Label>{t('ui.name_optional')}</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={t('ui.defaults_to_filename')}
                            invalid={errors.name ? true : undefined}
                        />
                        {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                    </Field>

                    <Field>
                        <Label>{t('ui.file_label')}</Label>
                        <Text className="mb-2">{t('ui.accepted_formats')}</Text>
                        <div
                            className={`mt-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
                                dragActive
                                    ? 'border-cyan-500 bg-cyan-50'
                                    : 'border-slate-200 hover:border-slate-300'
                            }`}
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                className="hidden"
                                id="file-input"
                                accept={ACCEPTED_FILE_TYPES}
                                onChange={(e) => handleFile(e.target.files[0])}
                            />
                            {fileName ? (
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-700">{fileName}</p>
                                    <p className="text-xs text-slate-500">
                                        {(data.file.size / 1024).toFixed(1)} KB
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => handleFile(null)}
                                        className="text-xs text-cyan-600 hover:text-cyan-700"
                                    >
                                        {t('ui.remove_file')}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm text-slate-500">
                                        {t('ui.drag_drop_hint')}
                                    </p>
                                    <label
                                        htmlFor="file-input"
                                        className="mt-2 cursor-pointer text-sm font-medium text-cyan-600 hover:text-cyan-700"
                                    >
                                        {t('ui.click_to_browse')}
                                    </label>
                                </>
                            )}
                        </div>
                        {errors.file && <ErrorMessage>{errors.file}</ErrorMessage>}
                    </Field>

                    {progress && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>{t('ui.uploading')}</span>
                                <span>{progress.percentage}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                <div
                                    className="h-full rounded-full bg-cyan-600 transition-all duration-300"
                                    style={{ width: `${progress.percentage}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing || !data.file}>
                            {processing ? t('ui.uploading') : t('ui.upload_and_process')}
                        </Button>
                        <Button plain href={index().url}>{t('common.cancel')}</Button>
                    </div>
                </form>
            </PageSection>
        </AuthenticatedLayout>
    );
}
