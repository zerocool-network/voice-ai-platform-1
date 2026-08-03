import { Button } from '@/Components/catalyst/button';
import { Text } from '@/Components/catalyst/text';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';

export default function ScopeGate({ apiMeta, children, connected }) {
    const { t } = useTranslation();

    if (!connected) {
        return (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
                <div className="flex items-start gap-3">
                    <ShieldAlert className="mt-0.5 size-5 text-amber-700" />
                    <div className="space-y-3">
                        <Text className="font-medium text-amber-900">{t('hubspot.not_connected_title')}</Text>
                        <Text className="text-amber-800">{t('hubspot.not_connected_body')}</Text>
                        <Button type="button" onClick={() => router.post('/settings/integrations/hubspot/connect')}>
                            {t('integrations.connect_oauth')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (apiMeta?.missing_scope) {
        return (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6">
                <Text className="font-medium text-rose-900">{t('hubspot.scope_missing_title')}</Text>
                <Text className="mt-1 text-rose-800">{apiMeta.error || t('hubspot.scope_missing_body')}</Text>
                <Button className="mt-3" type="button" onClick={() => router.post('/settings/integrations/hubspot/connect')}>
                    {t('hubspot.reconnect')}
                </Button>
            </div>
        );
    }

    if (apiMeta?.rate_limited) {
        return (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
                <Text className="font-medium text-orange-900">{t('hubspot.rate_limited_title')}</Text>
                <Text className="mt-1 text-orange-800">{apiMeta.error}</Text>
            </div>
        );
    }

    if (apiMeta && apiMeta.ok === false && apiMeta.error) {
        return (
            <div className="space-y-4">
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <Text className="font-medium text-red-900">{t('hubspot.api_error')}</Text>
                    <Text className="mt-1 text-red-800">{apiMeta.error}</Text>
                </div>
                {children}
            </div>
        );
    }

    return children;
}
