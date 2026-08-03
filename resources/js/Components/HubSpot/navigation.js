export const GROUP_LABEL_KEYS = {
    overview: 'hubspot.groups.overview',
    crm: 'hubspot.groups.crm',
    commerce: 'hubspot.groups.commerce',
    activities: 'hubspot.groups.activities',
    other: 'hubspot.groups.other',
    crm_infra: 'hubspot.groups.crm_infra',
    marketing: 'hubspot.groups.marketing',
    conversations: 'hubspot.groups.conversations',
    cms: 'hubspot.groups.cms',
    files: 'hubspot.groups.files',
    automation: 'hubspot.groups.automation',
    settings: 'hubspot.groups.settings',
    developer: 'hubspot.groups.developer',
    privacy: 'hubspot.groups.privacy',
    voice: 'hubspot.groups.voice',
};

export function recordLabel(record, fallbackProps = []) {
    if (!record) return '—';
    const props = record.properties || {};
    for (const key of fallbackProps) {
        if (props[key]) return String(props[key]);
    }
    return record.id || '—';
}

export function flattenRecords(payload) {
    if (!payload) return [];
    if (Array.isArray(payload.results)) return payload.results;
    if (Array.isArray(payload)) return payload;
    return [];
}
