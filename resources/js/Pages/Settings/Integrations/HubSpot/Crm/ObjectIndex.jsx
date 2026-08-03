import HubSpotConsoleLayout from '@/Components/HubSpot/HubSpotConsoleLayout';
import ObjectIndexPage from '@/Components/HubSpot/ObjectIndexPage';
import { useTranslation } from '@/hooks/useTranslation';
import { Head } from '@inertiajs/react';

export default function ObjectIndex(props) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t(props.object_type.label_key)} />
            <HubSpotConsoleLayout integration={props.integration} nav={props.nav}>
                <ObjectIndexPage {...props} />
            </HubSpotConsoleLayout>
        </>
    );
}
