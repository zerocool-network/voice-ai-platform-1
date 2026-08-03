import { Checkbox, Field, Label } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Textarea } from '@/Components/catalyst/textarea';

export default function PropertyEditor({ name, label, type = 'string', value, onChange, options = [] }) {
    const fieldType = (type || 'string').toLowerCase();

    if (fieldType === 'bool' || fieldType === 'boolean' || fieldType === 'checkbox') {
        return (
            <Field className="flex items-center gap-2">
                <Checkbox checked={Boolean(value)} onChange={(checked) => onChange(name, checked)} />
                <Label>{label || name}</Label>
            </Field>
        );
    }

    if ((fieldType === 'enumeration' || fieldType === 'select') && options.length > 0) {
        return (
            <Field>
                <Label>{label || name}</Label>
                <Select value={value ?? ''} onChange={(e) => onChange(name, e.target.value)}>
                    <option value="">—</option>
                    {options.map((opt) => (
                        <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt.value || opt}</option>
                    ))}
                </Select>
            </Field>
        );
    }

    if (fieldType === 'textarea' || fieldType === 'html' || name?.includes('body') || name?.includes('content')) {
        return (
            <Field>
                <Label>{label || name}</Label>
                <Textarea rows={4} value={value ?? ''} onChange={(e) => onChange(name, e.target.value)} />
            </Field>
        );
    }

    return (
        <Field>
            <Label>{label || name}</Label>
            <Input
                type={fieldType === 'number' ? 'number' : fieldType === 'datetime' ? 'datetime-local' : 'text'}
                value={value ?? ''}
                onChange={(e) => onChange(name, e.target.value)}
            />
        </Field>
    );
}
