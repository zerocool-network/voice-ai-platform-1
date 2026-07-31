export function callStatusLabel(t, status) {
    if (!status) {
        return '';
    }

    const normalized = status.replace('-', '_');
    const key = `calls.status_${normalized}`;
    const label = t(key);

    return label === key ? status.replace(/_/g, ' ') : label;
}
