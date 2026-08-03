import { Button } from '@/Components/catalyst/button';
import { Field, Label } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { useTranslation } from '@/hooks/useTranslation';
import { useForm } from '@inertiajs/react';
import PropertyEditor from './PropertyEditor';

export default function ObjectFormModal({ open, onClose, objectType, mode = 'create', record = null, propertyDefs = [] }) {
    const { t } = useTranslation();
    const initial = {};
    (propertyDefs.length ? propertyDefs : (objectType?.default_properties || []).map((name) => ({ name }))).slice(0, 12).forEach((def) => {
        const name = def.name || def;
        initial[name] = record?.properties?.[name] ?? '';
    });

    const { data, setData, processing, post, patch, errors, reset } = useForm({ properties: initial });

    if (!open) {
        return null;
    }

    const onChange = (name, value) => {
        setData('properties', { ...data.properties, [name]: value });
    };

    const submit = (e) => {
        e.preventDefault();
        if (mode === 'edit' && record?.id) {
            patch(`/settings/integrations/hubspot/objects/${objectType.slug}/${record.id}`, {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
            return;
        }

        post(`/settings/integrations/hubspot/objects/${objectType.slug}`, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <form onSubmit={submit} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-slate-900">
                    {mode === 'edit' ? t('hubspot.edit_record') : t('hubspot.create_record')}
                </h3>
                <div className="mt-4 space-y-3">
                    {Object.keys(data.properties).map((name) => {
                        const def = propertyDefs.find((p) => p.name === name) || { name, type: 'string' };
                        return (
                            <PropertyEditor
                                key={name}
                                name={name}
                                label={def.label || name}
                                type={def.type || 'string'}
                                value={data.properties[name]}
                                onChange={onChange}
                                options={def.options || []}
                            />
                        );
                    })}
                    {errors.properties && <p className="text-sm text-red-600">{errors.properties}</p>}
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <Button plain type="button" onClick={onClose}>{t('hubspot.cancel')}</Button>
                    <Button type="submit" disabled={processing}>{t('hubspot.save')}</Button>
                </div>
            </form>
        </div>
    );
}
