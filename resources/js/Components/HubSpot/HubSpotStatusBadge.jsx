import { Badge } from '@/Components/catalyst/badge';
import { useTranslation } from '@/hooks/useTranslation';

export default function HubSpotStatusBadge({ connected, status, authSource }) {
    const { t } = useTranslation();
    const color = connected ? 'emerald' : status === 'error' ? 'red' : 'zinc';

    return (
        <span className="inline-flex items-center gap-2">
            <Badge color={color}>{status || (connected ? 'connected' : 'disconnected')}</Badge>
            {authSource && (
                <Badge color="zinc">{t('hubspot.auth_source')}: {authSource}</Badge>
            )}
        </span>
    );
}
