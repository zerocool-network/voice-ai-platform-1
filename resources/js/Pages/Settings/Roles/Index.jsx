import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { Checkbox } from '@/Components/catalyst/checkbox';
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/Components/catalyst/dialog';
import { update as updateRole } from '@/routes/settings/roles';
import { useTranslation } from '@/hooks/useTranslation';

export default function Index({ roles, allPermissions }) {
    const { t } = useTranslation();
    const [editingRole, setEditingRole] = useState(null);
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    const groups = allPermissions.reduce((acc, p) => {
        const group = p.split('.')[0] || 'other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(p);
        return acc;
    }, {});

    function openEditor(role) {
        setEditingRole(role);
        setSelectedPermissions([...role.permissions]);
    }

    function togglePermission(name) {
        setSelectedPermissions((prev) =>
            prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name],
        );
    }

    function saveRole() {
        if (!editingRole) return;
        router.patch(updateRole({ role: editingRole.id }).url, {
            permissions: selectedPermissions,
        }, {
            onSuccess: () => setEditingRole(null),
        });
    }

    function userCountLabel(count) {
        return count === 1 ? `1 ${t('ui.user_count')}` : `${count} ${t('ui.users_count')}`;
    }

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.roles_permissions_title')} />

            <div className="space-y-6">
                <PageHeader
                    title={t('ui.roles_permissions_title')}
                    subtitle={t('ui.roles_subtitle_manage')}
                />

                <div className="space-y-4">
                    {roles.map((role) => (
                        <PageSection key={role.id} className="!p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-semibold capitalize text-slate-950">{role.name}</h3>
                                    <Text className="text-sm">{userCountLabel(role.users_count)}</Text>
                                </div>
                                <Button outline onClick={() => openEditor(role)}>{t('ui.edit_permissions')}</Button>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {role.permissions.map((p) => (
                                    <Badge key={p} color="zinc">{p}</Badge>
                                ))}
                            </div>
                        </PageSection>
                    ))}
                </div>
            </div>

            <Dialog open={editingRole !== null} onClose={() => setEditingRole(null)} size="lg">
                <DialogTitle>{t('ui.edit_role_permissions', { role: editingRole?.name ?? '' })}</DialogTitle>
                <DialogDescription>
                    {editingRole?.name === 'owner'
                        ? t('ui.owner_permissions_note')
                        : t('ui.select_permissions_note')}
                </DialogDescription>
                <DialogBody>
                    <div className="space-y-4">
                        {Object.entries(groups).map(([group, perms]) => (
                            <div key={group}>
                                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{group}</h4>
                                <div className="space-y-1">
                                    {perms.map((perm) => (
                                        <label key={perm} className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-slate-50">
                                            <Checkbox
                                                checked={selectedPermissions.includes(perm)}
                                                onChange={() => togglePermission(perm)}
                                                disabled={editingRole?.name === 'owner'}
                                            />
                                            <span className="text-sm">{perm}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogBody>
                <DialogActions>
                    <Button plain onClick={() => setEditingRole(null)}>{t('ui.cancel')}</Button>
                    <Button onClick={saveRole} disabled={editingRole?.name === 'owner'}>{t('ui.save_label')}</Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
