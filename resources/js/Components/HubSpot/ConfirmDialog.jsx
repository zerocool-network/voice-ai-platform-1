import { Button } from '@/Components/catalyst/button';
import { useTranslation } from '@/hooks/useTranslation';

export default function ConfirmDialog({ open, onClose, onConfirm, title, description, confirming = false }) {
    const { t } = useTranslation();

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-600">{description}</p>
                <div className="mt-6 flex justify-end gap-2">
                    <Button plain type="button" onClick={onClose}>{t('hubspot.cancel')}</Button>
                    <Button color="red" type="button" disabled={confirming} onClick={onConfirm}>{t('hubspot.confirm')}</Button>
                </div>
            </div>
        </div>
    );
}
