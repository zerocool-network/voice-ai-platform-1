import { router } from '@inertiajs/react';
import { useEffect } from 'react';

/** Legacy entry — console moved to Overview shell. */
export default function HubSpotLegacyRedirect() {
    useEffect(() => {
        router.get('/settings/integrations/hubspot');
    }, []);

    return null;
}
