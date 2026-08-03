import HubSpotConsoleLayout from '@/Components/HubSpot/HubSpotConsoleLayout';
import ObjectDetailDrawer from '@/Components/HubSpot/ObjectDetailDrawer';
import { useTranslation } from '@/hooks/useTranslation';
import { Head } from '@inertiajs/react';

export default function ObjectShow(props) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={`${t(props.object_type.label_key)} ${props.record?.id || ''}`} />
            <HubSpotConsoleLayout integration={props.integration} nav={props.nav}>
                <ObjectDetailDrawer {...props} />
            </HubSpotConsoleLayout>
        </>
    );
}
