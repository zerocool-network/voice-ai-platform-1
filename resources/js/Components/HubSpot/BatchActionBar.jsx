import { Button } from '@/Components/catalyst/button';
import { useTranslation } from '@/hooks/useTranslation';

export default function BatchActionBar({ selectedCount, onArchive, onClear, processing = false }) {
    const { t } = useTranslation();

    if (selectedCount < 1) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
            <span className="text-sm font-medium text-orange-900">
                {t('hubspot.selected_count', { count: selectedCount })}
            </span>
            <div className="flex gap-2">
                <Button plain type="button" onClick={onClear}>{t('hubspot.clear_selection')}</Button>
                <Button color="red" type="button" disabled={processing} onClick={onArchive}>{t('hubspot.batch_archive')}</Button>
            </div>
        </div>
    );
}
