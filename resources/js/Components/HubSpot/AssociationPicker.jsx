import { Button } from '@/Components/catalyst/button';
import { Field, Label } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { useTranslation } from '@/hooks/useTranslation';
import { useForm } from '@inertiajs/react';

export default function AssociationPicker({ objectType, recordId, onDone }) {
    const { t } = useTranslation();
    const { data, setData, post, processing } = useForm({
        to_object_type: 'contacts',
        to_id: '',
        association_type_id: 1,
    });

    return (
        <div className="space-y-3 rounded-xl border border-slate-200 p-4">
            <Field>
                <Label>{t('hubspot.associate_to_type')}</Label>
                <Select value={data.to_object_type} onChange={(e) => setData('to_object_type', e.target.value)}>
                    {['contacts', 'companies', 'deals', 'tickets', 'calls', 'notes', 'tasks'].map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </Select>
            </Field>
            <Field>
                <Label>{t('hubspot.associate_to_id')}</Label>
                <Input value={data.to_id} onChange={(e) => setData('to_id', e.target.value)} />
            </Field>
            <div className="flex gap-2">
                <Button
                    type="button"
                    disabled={processing || !data.to_id}
                    onClick={() => post(`/settings/integrations/hubspot/objects/${objectType}/${recordId}/associate`, { onSuccess: onDone })}
                >
                    {t('hubspot.link_association')}
                </Button>
                <Button
                    type="button"
                    color="red"
                    disabled={processing || !data.to_id}
                    onClick={() => post(`/settings/integrations/hubspot/objects/${objectType}/${recordId}/dissociate`, { onSuccess: onDone })}
                >
                    {t('hubspot.unlink_association')}
                </Button>
            </div>
        </div>
    );
}
